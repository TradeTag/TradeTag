const memoryCache = new Map();
const DEFAULT_GATEWAY_URL = 'https://www.tradetag.site';
const PUBLIC_GATEWAY_TOKEN = '064541498da8f6a2bbab56f6603edeed9880b7016f58dbd063a49c739d4b4a60';
const LOOKUP_TTL = 12_000;
const TOKEN_TTL = 8_000;
const CANDLE_TTL = 5_000;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ apiBase: DEFAULT_GATEWAY_URL });
  chrome.storage.local.set({ gatewayToken: PUBLIC_GATEWAY_TOKEN });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const jobs = {
    XTC_LOOKUP: () => lookupTokens(message.query, message.chainId),
    XTC_TOKEN_DATA: () => loadTokenData(message.chainId, message.address),
    XTC_TRADE_QUOTE: () => tradeQuote(message.params),
    XTC_TRADE_SWAP: () => tradeSwap(message.params),
    XTC_TRADE_APPROVE: () => tradeApprove(message.params),
    XTC_WALLET_CONNECT: () => runWalletAction(_sender.tab?.id, message.chainId, 'connect'),
    XTC_WALLET_TRADE: () => runWalletAction(_sender.tab?.id, message.chainId, 'trade', message.transaction)
  };
  const run = jobs[message?.type];
  if (!run) return false;
  run().then((data) => sendResponse({ ok: true, data }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

async function getGateway() {
  const { apiBase } = await chrome.storage.sync.get({ apiBase: DEFAULT_GATEWAY_URL });
  if (!apiBase) throw new Error('请先在扩展设置中填写 TradeTag 网关地址。');
  let parsed;
  try { parsed = new URL(apiBase); } catch { throw new Error('网关地址无效，请检查扩展设置。'); }
  if (parsed.origin === 'https://tradetag.site') {
    await chrome.storage.sync.set({ apiBase: DEFAULT_GATEWAY_URL });
    return DEFAULT_GATEWAY_URL;
  }
  if (parsed.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)) {
    throw new Error('网关必须使用 HTTPS；本机开发可使用 localhost。');
  }
  if (parsed.protocol === 'https:' && parsed.origin !== DEFAULT_GATEWAY_URL) throw new Error('此公开预览版仅连接 TradeTag 官方网关。');
  return parsed.origin;
}

async function gatewayRequest(path, options = {}) {
  const base = await getGateway();
  const { gatewayToken = PUBLIC_GATEWAY_TOKEN } = await chrome.storage.local.get({ gatewayToken: PUBLIC_GATEWAY_TOKEN });
  const response = await fetch(new URL(path, `${base}/`), {
    ...options,
    credentials: 'omit',
    cache: 'no-store',
    headers: { Accept: 'application/json', ...(gatewayToken ? { Authorization: `Bearer ${gatewayToken}` } : {}), ...(options.headers || {}) },
    signal: AbortSignal.timeout(15_000)
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || (response.status === 404 ? '网关接口尚未部署。' : `网关请求失败（${response.status}）。`);
    throw new Error(message);
  }
  if (data?.success === false || (typeof data?.code === 'number' && data.code !== 0)) {
    throw new Error(data?.msg || '币安 Web3 API 请求失败。');
  }
  return data;
}

function cached(key, ttl, load) {
  const item = memoryCache.get(key);
  if (item && Date.now() - item.at < ttl) return Promise.resolve(item.data);
  return load().then((data) => {
    memoryCache.set(key, { at: Date.now(), data });
    if (memoryCache.size > 300) memoryCache.delete(memoryCache.keys().next().value);
    return data;
  });
}

async function lookupTokens(query, chainId = 'CT_501') {
  const search = String(query || '').trim().replace(/^\$/, '').slice(0, 100);
  if (!search) throw new Error('请输入代币代码或合约地址。');
  const chain = String(chainId || 'CT_501');
  const key = `lookup:${chain}:${search.toLowerCase()}`;
  return cached(key, LOOKUP_TTL, async () => {
    const params = new URLSearchParams({ q: search, chainId: chain });
    const result = await gatewayRequest(`/v1/token/search?${params}`);
    const tokens = Array.isArray(result?.data) ? result.data : [];
    if (!tokens.length) throw new Error('币安 Web3 API 没有返回匹配代币。可改用正确网络和完整合约地址查询。');
    return { tokens };
  });
}

async function loadTokenData(chainId, address) {
  const chain = String(chainId || '').trim();
  const token = String(address || '').trim();
  if (!chain || !token) throw new Error('请选择网络并确认代币合约地址。');
  const key = `token:${chain}:${token}`;
  return cached(key, TOKEN_TTL, async () => {
    const params = new URLSearchParams({ chainId: chain, address: token });
    const [info, candles] = await Promise.all([
      gatewayRequest(`/v1/market/token-info?${params}`),
      gatewayRequest(`/v1/market/candles?${new URLSearchParams({ chainId: chain, address: token, bar: '1m', limit: '60' })}`)
    ]);
    const basic = info?.basicInfo || {};
    const market = info?.priceInfo || {};
    const candleRows = Array.isArray(candles?.data) ? candles.data : [];
    return {
      chainId: chain,
      address: token,
      symbol: basic.tokenSymbol || market.tokenSymbol || '',
      name: basic.tokenName || market.tokenName || '',
      logoUrl: basic.tokenLogoUrl || null,
      decimals: Number(basic.decimals || market.decimals || 0),
      price: market.price || '',
      change24h: market.priceChange24H || '',
      marketCap: market.marketCap || '',
      liquidity: market.liquidity || '',
      holders: market.holders ?? null,
      basicInfo: basic,
      priceInfo: market,
      candles: candleRows,
      points: candleRows.map((row) => Number(row?.[3])).filter(Number.isFinite),
      canQuote: false
    };
  });
}

async function tradeQuote(params = {}) {
  const query = new URLSearchParams();
  for (const key of ['binanceChainId', 'amount', 'fromTokenAddress', 'toTokenAddress', 'userWalletAddress', 'vendor']) {
    const value = String(params[key] || '').trim();
    if (value) query.set(key, value);
  }
  if (query.size < 4) throw new Error('报价需要网络、交易数量和买卖两种代币地址。');
  return gatewayRequest(`/v1/trade/quote?${query}`);
}

async function tradeSwap(params = {}) {
  const query = new URLSearchParams();
  for (const key of ['binanceChainId', 'amount', 'fromTokenAddress', 'toTokenAddress', 'userWalletAddress', 'quoteId', 'slippagePercent', 'vendor']) {
    const value = String(params[key] || '').trim();
    if (value) query.set(key, value);
  }
  return gatewayRequest(`/v1/trade/swap?${query}`);
}

async function tradeApprove(params = {}) {
  const query = new URLSearchParams();
  for (const key of ['binanceChainId', 'tokenContractAddress', 'approveAmount', 'vendor']) {
    const value = String(params[key] || '').trim();
    if (value) query.set(key, value);
  }
  return gatewayRequest(`/v1/trade/approve?${query}`);
}

async function runWalletAction(tabId, chainId, action, transaction) {
  if (!Number.isInteger(tabId)) throw new Error('钱包操作必须从 X 页面发起。');
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: pageWalletAction,
    args: [String(chainId), action, transaction || null]
  });
  if (!result?.ok) throw new Error(result?.error || '币安钱包操作失败。');
  return result.data;
}

// Binance Wallet uses its own default RPC when its sign-and-send feature is called.
async function pageWalletAction(chainId, action, transaction) {
  try {
    const isSolana = chainId === 'CT_501';
    if (isSolana) {
      const wallets = new Set();
      const register = (...items) => items.forEach((item) => wallets.add(item));
      window.addEventListener('wallet-standard:register-wallet', (event) => event.detail?.({ register }), { once: true });
      window.dispatchEvent(new CustomEvent('wallet-standard:app-ready', { detail: { register } }));
      await new Promise((resolve) => setTimeout(resolve, 120));
      const wallet = [...wallets].find((item) => /binance/i.test(item?.name || ''));
      if (!wallet) throw new Error('没有检测到币安钱包的 Solana Wallet Standard。请确认币安钱包已安装并解锁。');
      const features = wallet.features || {};
      if (action === 'connect') {
        if (!features['standard:connect']?.connect) throw new Error('币安钱包未提供 Wallet Standard connect 能力。');
        const connected = await features['standard:connect'].connect();
        const account = connected?.accounts?.[0] || wallet.accounts?.[0];
        if (!account?.address) throw new Error('币安钱包未返回 Solana 地址。');
        return { ok: true, data: { address: account.address, chainId } };
      }
      const account = wallet.accounts?.find((item) => item.chains?.includes('solana:mainnet')) || wallet.accounts?.[0];
      if (action !== 'trade') throw new Error('不支持的钱包操作。');
      const sendFeature = features['solana:signAndSendTransaction'];
      if (!account || !sendFeature?.signAndSendTransaction) throw new Error('币安钱包未提供 Solana 签名并发送能力。');
      if (transaction?.expectedAddress && account.address !== transaction.expectedAddress) throw new Error('币安钱包当前地址与已连接地址不一致，请重新连接。');
      const serialized = typeof transaction === 'string' ? transaction : transaction?.serializedTransaction || transaction?.transaction || transaction?.swapTransaction;
      if (typeof serialized !== 'string') throw new Error('币安 Web3 API 没有返回可由币安钱包发送的 Solana 交易。');
      const bytes = Uint8Array.from(atob(serialized), (character) => character.charCodeAt(0));
      const sent = await sendFeature.signAndSendTransaction({ transaction: bytes, account, chain: 'solana:mainnet' });
      const signature = sent?.signature || sent?.[0]?.signature;
      if (!signature) throw new Error('币安钱包没有返回 Solana 交易签名。');
      return { ok: true, data: { transactionId: typeof signature === 'string' ? signature : encodeBase58(signature), address: account.address } };
    }

    const providers = [];
    const onAnnounce = (event) => { if (event.detail?.provider) providers.push({ info: event.detail.info || {}, provider: event.detail.provider }); };
    window.addEventListener('eip6963:announceProvider', onAnnounce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    await new Promise((resolve) => setTimeout(resolve, 100));
    window.removeEventListener('eip6963:announceProvider', onAnnounce);
    const injected = window.ethereum;
    if (injected?.providers) providers.push(...injected.providers.map((provider) => ({ info: { name: provider.isBinance ? 'Binance Wallet' : '' }, provider })));
    else if (injected) providers.push({ info: { name: injected.isBinance || injected.isBinanceWallet ? 'Binance Wallet' : '' }, provider: injected });
    const match = providers.find(({ info, provider }) => /binance/i.test(`${info.name || ''} ${info.rdns || ''} ${provider?.name || ''}`));
    if (!match?.provider) throw new Error('没有检测到币安钱包的 EVM Provider。');
    const provider = match.provider;
    const expected = `0x${Number(chainId).toString(16)}`;
    const actual = await provider.request({ method: 'eth_chainId' });
    if (String(actual).toLowerCase() !== expected.toLowerCase()) throw new Error(`币安钱包当前网络为 ${actual}，请切换到 ${chainId}。`);
    if (action === 'connect') {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (!accounts?.[0]) throw new Error('币安钱包未返回 EVM 地址。');
      return { ok: true, data: { address: accounts[0], chainId } };
    }
    const swapTx = transaction.swap || transaction;
    if (String(swapTx.from || '').toLowerCase() !== String(transaction.expectedAddress || '').toLowerCase()) throw new Error('构建的交易发送地址与已连接钱包不一致。');
    if (action !== 'trade') throw new Error('不支持的钱包操作。');
    const tx = { ...(transaction.swap || transaction) }; delete tx.expectedAddress;
    if (transaction.approval) {
      const { tokenAddress, spender, amount, tx: approvalTx } = transaction.approval;
      const owner = String(transaction.expectedAddress).slice(2).toLowerCase().padStart(64, '0');
      const spenderWord = String(spender).slice(2).toLowerCase().padStart(64, '0');
      const currentHex = await provider.request({ method: 'eth_call', params: [{ to: tokenAddress, data: `0xdd62ed3e${owner}${spenderWord}` }, 'latest'] });
      const currentAllowance = BigInt(currentHex || '0x0');
      if (currentAllowance < BigInt(amount)) {
        const approveHash = await provider.request({ method: 'eth_sendTransaction', params: [{
          from: transaction.expectedAddress, to: tokenAddress, data: approvalTx.data,
          gas: approvalTx.gasLimit, gasPrice: approvalTx.gasPrice
        }] });
        let receipt = null;
        for (let attempt = 0; attempt < 90 && !receipt; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [approveHash] });
        }
        if (!receipt) throw new Error('授权交易已提交，但暂未确认；请查询该授权交易后再发起兑换。');
        if (receipt.status !== '0x1') throw new Error('代币授权交易失败，兑换未提交。');
      }
    }
    const transactionId = await provider.request({ method: 'eth_sendTransaction', params: [tx] });
    if (typeof transactionId !== 'string' || !transactionId.startsWith('0x')) throw new Error('币安钱包没有返回 EVM 交易哈希。');
    return { ok: true, data: { transactionId } };
  } catch (error) {
    return { ok: false, error: error?.message || '钱包操作失败。' };
  }

  function encodeBase58(bytes) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let value = 0n;
    for (const byte of bytes) value = (value << 8n) + BigInt(byte);
    let encoded = '';
    while (value > 0n) { const remainder = Number(value % 58n); encoded = alphabet[remainder] + encoded; value /= 58n; }
    for (const byte of bytes) { if (byte !== 0) break; encoded = `1${encoded}`; }
    return encoded || '1';
  }
}
