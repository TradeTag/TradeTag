import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

const host = process.env.GATEWAY_HOST || '127.0.0.1';
const port = Number(process.env.GATEWAY_PORT || 8787);
const apiKey = process.env.BINANCE_WEB3_API_KEY || '';
const apiSecret = process.env.BINANCE_WEB3_API_SECRET || '';
const extensionId = process.env.GATEWAY_EXTENSION_ID || '';
const bearerToken = process.env.GATEWAY_BEARER_TOKEN || '';
const allowedOrigins = new Set((process.env.GATEWAY_ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean));
const localOnly = ['127.0.0.1', '::1', 'localhost'].includes(host);
const perIpRpm = Number(process.env.GATEWAY_PER_IP_RPM || 90);
const globalRpm = Number(process.env.GATEWAY_GLOBAL_RPM || 600);
const upstream = 'https://web3.binance.com/build';
const cache = new Map();
const requestWindows = new Map();
let globalWindowStartedAt = Date.now();
let globalWindowCount = 0;

if (!localOnly && bearerToken.length < 32) {
  throw new Error('Remote gateway requires GATEWAY_BEARER_TOKEN with at least 32 characters.');
}
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('GATEWAY_PORT is invalid.');
if (!Number.isInteger(perIpRpm) || perIpRpm < 1 || !Number.isInteger(globalRpm) || globalRpm < 1) throw new Error('Gateway rate limits are invalid.');

const json = (res, status, value, headers = {}) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(JSON.stringify(value));
};

function cors(req, res) {
  const origin = req.headers.origin || '';
  const loopbackOrigin = ['http://127.0.0.1:5173', 'http://localhost:5173'].includes(origin);
  const extensionOrigin = origin.startsWith('chrome-extension://') && (!extensionId || origin === `chrome-extension://${extensionId}`);
  const allowed = !origin ? localOnly : (allowedOrigins.has(origin) || (localOnly && loopbackOrigin) || extensionOrigin);
  if (!allowed) return false;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '600');
  return true;
}

function authorized(req) {
  if (localOnly && !bearerToken) return true;
  const value = req.headers.authorization || '';
  const supplied = value.startsWith('Bearer ') ? Buffer.from(value.slice(7)) : Buffer.alloc(0);
  const expected = Buffer.from(bearerToken);
  return Boolean(expected.length && supplied.length === expected.length && timingSafeEqual(supplied, expected));
}

function rateLimited(req) {
  const now = Date.now();
  if (now - globalWindowStartedAt >= 60_000) {
    globalWindowStartedAt = now;
    globalWindowCount = 0;
  }
  const socketIp = req.socket.remoteAddress || 'unknown';
  const forwarded = req.headers['x-forwarded-for'];
  const ip = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(socketIp) && forwarded
    ? String(forwarded).split(',')[0].trim()
    : socketIp;
  let bucket = requestWindows.get(ip);
  if (!bucket || now - bucket.startedAt >= 60_000) {
    bucket = { startedAt: now, count: 0 };
    requestWindows.set(ip, bucket);
  }
  if (bucket.count >= perIpRpm || globalWindowCount >= globalRpm) return true;
  bucket.count += 1;
  globalWindowCount += 1;
  if (requestWindows.size > 10_000) {
    for (const [address, entry] of requestWindows) {
      if (now - entry.startedAt >= 60_000) requestWindows.delete(address);
    }
    let excess = requestWindows.size - 10_000;
    if (excess > 0) {
      for (const address of requestWindows.keys()) {
        requestWindows.delete(address);
        excess -= 1;
        if (excess <= 0) break;
      }
    }
  }
  return false;
}

function requireCredentials() {
  if (!apiKey || !apiSecret) {
    const error = new Error('Binance Web3 API credentials are not configured in gateway/.env.');
    error.status = 503;
    error.code = 'BINANCE_CREDENTIALS_MISSING';
    throw error;
  }
}

function required(value, name, max = 160) {
  const text = String(value || '').trim();
  if (!text || text.length > max) {
    const error = new Error(`Invalid ${name}.`);
    error.status = 400;
    error.code = 'INVALID_PARAMETER';
    throw error;
  }
  return text;
}

function chain(value) {
  const result = required(value, 'binanceChainId', 80);
  if (!/^(?:CT_\d+|\d+)(?:,(?:CT_\d+|\d+))*$/.test(result)) {
    const error = new Error('Invalid Binance chain ID.'); error.status = 400; error.code = 'INVALID_CHAIN'; throw error;
  }
  return result;
}

function tokenAddress(value) {
  const result = required(value, 'tokenContractAddress', 128);
  if (!/^(?:0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})$/.test(result)) {
    const error = new Error('Invalid token contract or mint address.'); error.status = 400; error.code = 'INVALID_TOKEN_ADDRESS'; throw error;
  }
  return result;
}

function queryString(entries) {
  const query = new URLSearchParams();
  for (const [key, value] of entries) if (value !== undefined && value !== '') query.append(key, String(value));
  return query.toString();
}

async function binanceRequest(method, apiPath, params = [], body) {
  requireCredentials();
  const query = queryString(params);
  const pathAndQuery = `/build${apiPath}${query ? `?${query}` : ''}`;
  const bodyText = body === undefined ? '' : JSON.stringify(body);
  const timestamp = new Date().toISOString();
  const preHash = `${timestamp}${method}${pathAndQuery}${bodyText}`;
  const signature = createHmac('sha256', apiSecret).update(preHash, 'utf8').digest('base64');
  const response = await fetch(`https://web3.binance.com${pathAndQuery}`, {
    method,
    headers: {
      'X-OC-APIKEY': apiKey,
      'X-OC-TIMESTAMP': timestamp,
      'X-OC-SIGN': signature,
      'X-OC-NONCE': randomUUID(),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' })
    },
    ...(body === undefined ? {} : { body: bodyText }),
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store'
  });
  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = { message: 'Binance Web3 API returned an unreadable response.' }; }
  if (!response.ok || (typeof payload?.code === 'number' && payload.code !== 0)) {
    const error = new Error(payload?.msg || payload?.message || `Binance Web3 API request failed (${response.status}).`);
    error.status = response.status >= 400 && response.status < 500 ? response.status : 502;
    error.code = payload?.code ?? 'BINANCE_UPSTREAM_ERROR';
    throw error;
  }
  return payload;
}

function cached(key, ttlMs, load) {
  const old = cache.get(key);
  if (old && Date.now() - old.at < ttlMs) return Promise.resolve(old.value);
  return load().then((value) => {
    cache.set(key, { at: Date.now(), value });
    if (cache.size > 500) cache.delete(cache.keys().next().value);
    return value;
  });
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 16_384) { const error = new Error('Request body is too large.'); error.status = 413; error.code = 'BODY_TOO_LARGE'; throw error; }
  }
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { const error = new Error('Expected a JSON request body.'); error.status = 400; error.code = 'INVALID_JSON'; throw error; }
}

function tradeParams(search, { requireWallet = false } = {}) {
  const chainId = chain(search.get('binanceChainId'));
  const amount = required(search.get('amount'), 'amount', 100);
  if (!/^\d+$/.test(amount) || BigInt(amount) <= 0n) { const error = new Error('Amount must be a positive base-unit integer.'); error.status = 400; error.code = 'INVALID_AMOUNT'; throw error; }
  const from = required(search.get('fromTokenAddress'), 'fromTokenAddress', 128);
  const to = required(search.get('toTokenAddress'), 'toTokenAddress', 128);
  if (from === to) { const error = new Error('Sell token and buy token must be different.'); error.status = 400; error.code = 'INVALID_TOKEN_PAIR'; throw error; }
  const wallet = search.get('userWalletAddress') || '';
  if (requireWallet && !wallet) { const error = new Error('Connect the wallet before building the transaction.'); error.status = 400; error.code = 'WALLET_REQUIRED'; throw error; }
  if (wallet && !/^(?:0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})$/.test(wallet)) { const error = new Error('Invalid wallet address.'); error.status = 400; error.code = 'INVALID_WALLET_ADDRESS'; throw error; }
  return [
    ['binanceChainId', chainId], ['amount', amount], ['fromTokenAddress', from], ['toTokenAddress', to],
    ['userWalletAddress', wallet || undefined], ['vendor', search.get('vendor') || undefined]
  ];
}

async function route(req, res, url) {
  if (!cors(req, res)) return json(res, 403, { error: 'ORIGIN_NOT_ALLOWED', message: 'This origin is not allowed.' });
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (!authorized(req)) return json(res, 401, { error: 'UNAUTHORIZED', message: 'Gateway authorization failed.' });
  if (rateLimited(req)) return json(res, 429, { error: 'RATE_LIMITED', message: 'Please wait before making more requests.' }, { 'Retry-After': '60' });
  if (url.pathname === '/health' && req.method === 'GET') {
    return json(res, 200, { ok: true, binanceConfigured: Boolean(apiKey && apiSecret), mode: 'signed-proxy', storage: 'none' });
  }

  if (req.method === 'GET' && url.pathname === '/v1/token/search') {
    const search = required(url.searchParams.get('q'), 'search', 100).replace(/^\$/, '');
    const chains = chain(url.searchParams.get('chainId') || 'CT_501');
    const key = `search:${chains}:${search.toLowerCase()}`;
    const value = await cached(key, 12_000, () => binanceRequest('GET', '/api/v1/dex/market/token/search', [['chains', chains], ['search', search]]));
    return json(res, 200, value);
  }

  if (req.method === 'GET' && url.pathname === '/v1/market/token-info') {
    const chainId = chain(url.searchParams.get('chainId'));
    const address = tokenAddress(url.searchParams.get('address'));
    const key = `info:${chainId}:${address}`;
    const value = await cached(key, 8_000, async () => {
      const params = [['binanceChainId', chainId], ['tokenContractAddress', address]];
      const [basicInfo, priceInfo] = await Promise.all([
        binanceRequest('POST', '/api/v1/dex/market/token/basic-info', params),
        binanceRequest('POST', '/api/v1/dex/market/price-info', [], [{ binanceChainId: chainId, tokenContractAddress: address }])
      ]);
      return { basicInfo: basicInfo.data, priceInfo: Array.isArray(priceInfo.data) ? priceInfo.data[0] : priceInfo.data };
    });
    return json(res, 200, value);
  }

  if (req.method === 'GET' && url.pathname === '/v1/market/candles') {
    const chainId = chain(url.searchParams.get('chainId'));
    const address = tokenAddress(url.searchParams.get('address'));
    const bar = url.searchParams.get('bar') || '1m';
    const allowedBars = new Set(['1s','5s','30s','1m','3m','5m','15m','30m','1h','2h','4h','6h','8h','12h','1d','3d','1w','1M']);
    if (!allowedBars.has(bar)) { const error = new Error('Unsupported candle interval.'); error.status = 400; error.code = 'INVALID_INTERVAL'; throw error; }
    const limit = Math.max(1, Math.min(500, Number(url.searchParams.get('limit') || 100)));
    if (!Number.isInteger(limit)) { const error = new Error('Invalid candle limit.'); error.status = 400; error.code = 'INVALID_LIMIT'; throw error; }
    const key = `candles:${chainId}:${address}:${bar}:${limit}`;
    const value = await cached(key, 5_000, () => binanceRequest('GET', '/api/v1/dex/market/candles', [['binanceChainId', chainId], ['tokenContractAddress', address], ['bar', bar], ['limit', limit]]));
    return json(res, 200, value);
  }

  if (req.method === 'POST' && url.pathname === '/v1/wallet/balances') {
    const body = await readBody(req);
    const chainId = chain(body.binanceChainId);
    if (!['CT_501', '56', '8453', '1'].includes(chainId)) {
      const error = new Error('Wallet balances are not enabled for this network.'); error.status = 400; error.code = 'UNSUPPORTED_BALANCE_CHAIN'; throw error;
    }
    const address = tokenAddress(body.address);
    const stableTokenAddress = tokenAddress(body.stableTokenAddress);
    const tradeTokenAddress = tokenAddress(body.tradeTokenAddress);
    const isSolana = chainId === 'CT_501';
    for (const candidate of [address, stableTokenAddress, tradeTokenAddress]) {
      if (isSolana !== !candidate.startsWith('0x')) {
        const error = new Error('Wallet and token addresses must match the selected network.'); error.status = 400; error.code = 'ADDRESS_CHAIN_MISMATCH'; throw error;
      }
    }
    const tokenContractAddresses = [
      { binanceChainId: chainId, tokenContractAddress: '' },
      { binanceChainId: chainId, tokenContractAddress: stableTokenAddress },
      { binanceChainId: chainId, tokenContractAddress: tradeTokenAddress }
    ];
    const value = await binanceRequest('POST', '/api/v1/dex/balance/token-balances-by-address', [], {
      address,
      tokenContractAddresses,
      excludeRiskToken: '1'
    });
    return json(res, 200, value);
  }

  if (req.method === 'GET' && url.pathname === '/v1/trade/quote') {
    const params = tradeParams(url.searchParams);
    return json(res, 200, await binanceRequest('GET', '/api/v1/dex/aggregator/quote', params));
  }

  if (req.method === 'GET' && url.pathname === '/v1/trade/swap') {
    const params = tradeParams(url.searchParams, { requireWallet: true });
    params.push(['quoteId', required(url.searchParams.get('quoteId'), 'quoteId', 100)]);
    params.push(['slippagePercent', required(url.searchParams.get('slippagePercent'), 'slippagePercent', 20)]);
    return json(res, 200, await binanceRequest('GET', '/api/v1/dex/aggregator/swap', params));
  }

  if (req.method === 'GET' && url.pathname === '/v1/trade/approve') {
    const chainId = chain(url.searchParams.get('binanceChainId'));
    if (chainId.startsWith('CT_')) { const error = new Error('ERC-20 approval is only available on EVM networks.'); error.status = 400; error.code = 'APPROVAL_CHAIN_UNSUPPORTED'; throw error; }
    const address = tokenAddress(url.searchParams.get('tokenContractAddress'));
    const amount = required(url.searchParams.get('approveAmount'), 'approveAmount', 100);
    if (!/^\d+$/.test(amount) || BigInt(amount) <= 0n) { const error = new Error('Approval amount must be a positive base-unit integer.'); error.status = 400; error.code = 'INVALID_AMOUNT'; throw error; }
    const params = [['binanceChainId', chainId], ['tokenContractAddress', address], ['approveAmount', amount]];
    const vendor = url.searchParams.get('vendor');
    if (vendor) params.push(['vendor', required(vendor, 'vendor', 50)]);
    return json(res, 200, await binanceRequest('GET', '/api/v1/dex/aggregator/approve-transaction', params));
  }

  if (req.method === 'GET' && url.pathname === '/v1/trade/quote-and-swap') {
    const params = tradeParams(url.searchParams, { requireWallet: true });
    params.push(['slippagePercent', required(url.searchParams.get('slippagePercent'), 'slippagePercent', 20)]);
    params.push(['vendor', required(url.searchParams.get('vendor'), 'vendor', 50)]);
    return json(res, 200, await binanceRequest('GET', '/api/v1/dex/aggregator/quote-and-swap', params));
  }

  return json(res, 404, { error: 'NOT_FOUND', message: 'Unknown gateway route.' });
}

createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
  route(req, res, url).catch((error) => {
    const status = Number.isInteger(error.status) ? error.status : 502;
    json(res, status, { error: error.code || 'GATEWAY_ERROR', message: error.message || 'Request failed.' });
  });
}).listen(port, host, () => {
  console.log(`TradeTag Binance Web3 gateway listening at http://${host}:${port}`);
  console.log(`Credentials configured: ${Boolean(apiKey && apiSecret)}`);
});
