(() => {
  const hostId = "xtc-host";
  const seen = new WeakSet();
  const cashtag = /\$[A-Za-z][A-Za-z0-9]{1,14}/g;
  const tokenAddress = /0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44}/g;
  const discoverableToken = new RegExp(`${cashtag.source}|${tokenAddress.source}`, 'g');
  let activeQuery = "";
  let requestSeq = 0;

  function mount() {
    if (!document.getElementById(hostId)) {
      const host = document.createElement("div");
      host.id = hostId;
      host.className = "xtc-host";
      document.documentElement.append(host);
      host.attachShadow({ mode: "open" }).innerHTML = `
        <link rel="stylesheet" href="${chrome.runtime.getURL("content.css")}" />
        <section class="card" aria-live="polite" hidden>
          <header><div class="brand"><img class="brand-logo" src="${chrome.runtime.getURL("icons/icon48.png")}" alt=""/><span>TRADETAG</span></div><button class="close" aria-label="关闭">×</button></header>
          <div class="token"><div class="coin"><span>◎</span><img class="token-logo" alt="" hidden/></div><div><strong class="symbol">代币</strong><small class="name">输入 ticker 或合约地址</small></div></div>
          <label class="field-label" for="xtc-chain">网络</label>
          <select id="xtc-chain"><option value="CT_501">Solana</option><option value="56">BNB Chain</option><option value="8453">Base</option><option value="1">Ethereum</option></select>
          <label class="field-label" for="xtc-address">代币 / 合约地址</label>
          <div class="token-input"><input id="xtc-address" placeholder="粘贴任意 MEME 合约地址或 ticker" /><button class="lookup">查询</button></div>
          <div class="search-results" hidden></div>
          <div class="status-row"><span class="status">等待查询</span><span class="contract"></span></div>
          <div class="price-row"><div><small>最新价格</small><strong class="price">—</strong></div><span class="change">—</span></div>
          <div class="chart"><svg viewBox="0 0 320 88" preserveAspectRatio="none"><path class="area"></path><path class="line"></path></svg></div>
          <div class="wallet-row"><button class="wallet-connect">连接币安钱包</button><span class="wallet-state">未连接</span></div>
          <div class="mode-tabs"><button class="selected" data-mode="buy">买入</button><button data-mode="sell">卖出</button><span class="availability">待报价</span></div>
          <div class="amount-label"><span>交易金额</span><span class="unit">USDC</span></div>
          <div class="amount"><span class="currency-symbol">$</span><input inputmode="decimal" placeholder="输入金额" /><button>MAX</button></div>
          <div class="slippage"><span>滑点容忍</span><select><option>0.5%</option><option selected>1.0%</option><option>3.0%</option></select></div>
          <div class="quote">预计到账 <b>获取报价后显示</b></div>
          <button class="quote-button">获取实时报价</button>
          <button class="trade" disabled>确认并在币安钱包交易</button>
          <p class="notice">币安 Web3 API 提供报价 · 币安钱包使用官方默认 RPC 签名并广播</p><p class="error" hidden></p>
          <footer>请核对币种、网络、数量和钱包确认弹窗</footer>
        </section>`;
      const root = host.shadowRoot;
      root.querySelector(".close").onclick = () => root.querySelector(".card").hidden = true;
      root.querySelector(".lookup").onclick = () => lookupFromForm(root);
      root.querySelector("#xtc-address").addEventListener("keydown", (event) => { if (event.key === "Enter") lookupFromForm(root); });
      root.querySelector(".search-results").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-token-index]");
        if (!button) return;
        const token = root.__tradeTagTokens?.[Number(button.dataset.tokenIndex)];
        if (token) loadSelectedToken(root, token);
      });
      root.__tradeTag = { selectedToken: null, wallet: null, quote: null, quoteAt: 0, mode: 'buy' };
      root.querySelector(".wallet-connect").onclick = () => connectWallet(root);
      root.querySelector(".quote-button").onclick = () => getQuote(root);
      root.querySelector(".trade").onclick = () => executeTrade(root);
      root.querySelector("#xtc-chain").addEventListener("change", () => { root.__tradeTag = { selectedToken: null, wallet: null, quote: null, quoteAt: 0, mode: 'buy' }; root.querySelector(".wallet-state").textContent = "请重新查询并连接钱包"; root.querySelector(".trade").disabled = true; });
      root.querySelector(".amount input").addEventListener("input", () => { root.__tradeTag.quote = null; root.querySelector(".trade").disabled = true; });
      root.querySelectorAll(".mode-tabs button").forEach((button) => button.onclick = () => {
        root.querySelectorAll(".mode-tabs button").forEach((item) => item.classList.toggle("selected", item === button));
        root.__tradeTag.mode = button.dataset.mode; root.__tradeTag.quote = null; root.querySelector(".trade").disabled = true;
        updateAmountUnit(root);
      });
    }
    scan();
  }

  function scan() {
    const root = document.querySelector("main") || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !discoverableToken.test(node.nodeValue)) { discoverableToken.lastIndex = 0; return NodeFilter.FILTER_REJECT; }
        discoverableToken.lastIndex = 0;
        const parent = node.parentElement;
        return parent && !parent.closest("a,button,input,textarea,[contenteditable=true],#xtc-host") && !seen.has(node)
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      seen.add(node);
      const text = node.nodeValue;
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      text.replace(discoverableToken, (match, offset) => {
        fragment.append(document.createTextNode(text.slice(cursor, offset)));
        const button = document.createElement("button");
        button.className = "xtc-tag"; button.type = "button"; button.textContent = match;
        button.title = `打开 ${match} 代币交易面板`;
        button.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); openCard(match, /^0x/i.test(match) ? '56' : 'CT_501'); });
        fragment.append(button); cursor = offset + match.length; return match;
      });
      fragment.append(document.createTextNode(text.slice(cursor)));
      node.parentNode?.replaceChild(fragment, node);
    }
  }

  function lookupFromForm(root) {
    const query = root.querySelector("#xtc-address").value.trim();
    if (!query) return;
    openCard(query, root.querySelector("#xtc-chain").value);
  }

  function openCard(query, chainId = "CT_501") {
    query = String(query || "").trim();
    if (!query) return;
    activeQuery = query;
    const sequence = ++requestSeq;
    const root = document.getElementById(hostId).shadowRoot;
    root.__tradeTag = { selectedToken: null, wallet: null, quote: null, quoteAt: 0, mode: 'buy' };
    root.querySelector(".card").hidden = false;
    root.querySelector("#xtc-address").value = query;
    root.querySelector("#xtc-chain").value = chainId;
    root.querySelector(".error").hidden = true;
    root.querySelector(".search-results").hidden = true;
    root.querySelector(".search-results").replaceChildren();
    root.querySelector(".price").textContent = "—";
    root.querySelector(".change").textContent = "—";
    root.querySelector(".contract").textContent = "";
    root.querySelector(".symbol").textContent = query.startsWith("$") ? query.slice(1).toUpperCase() : "查找中";
    root.querySelector(".name").textContent = "正在通过币安 Web3 API 搜索…";
    root.querySelector(".status").textContent = "正在查询";
    chrome.runtime.sendMessage({ type: "XTC_LOOKUP", query, chainId }, (reply) => {
      if (sequence !== requestSeq || activeQuery !== query) return;
      if (!reply?.ok) {
        root.querySelector(".name").textContent = "代币搜索失败";
        root.querySelector(".status").textContent = "未查询";
        root.querySelector(".error").textContent = reply?.error || "无法连接行情服务";
        root.querySelector(".error").hidden = false;
        return;
      }
      const tokens = reply.data?.tokens || [];
      root.__tradeTagTokens = tokens;
      if (tokens.length === 1) {
        loadSelectedToken(root, tokens[0]);
      } else {
        root.querySelector(".symbol").textContent = `${tokens.length} 个结果`;
        root.querySelector(".name").textContent = "选择网络和合约匹配的资产";
        root.querySelector(".status").textContent = "需要确认资产";
        renderSearchResults(root, tokens);
      }
    });
  }

  function renderSearchResults(root, tokens) {
    const list = root.querySelector(".search-results");
    list.replaceChildren();
    tokens.slice(0, 12).forEach((token, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.tokenIndex = String(index);
      const symbol = token.tokenSymbol || token.symbol || "Token";
      const name = token.tokenName || token.name || "";
      const address = token.tokenContractAddress || token.contractAddress || "";
      const chain = token.binanceChainId || token.chainId || "";
      button.innerHTML = `<span class="result-main"><b></b><small></small></span><span class="result-chain"></span>`;
      button.querySelector("b").textContent = symbol;
      button.querySelector("small").textContent = `${name}${name ? " · " : ""}${shortAddress(address)}`;
      button.querySelector(".result-chain").textContent = chainName(chain);
      list.append(button);
    });
    list.hidden = false;
  }

  function loadSelectedToken(root, token) {
    const chainId = String(token.binanceChainId || token.chainId || root.querySelector("#xtc-chain").value);
    const address = String(token.tokenContractAddress || token.contractAddress || "");
    if (!address) {
      root.querySelector(".error").textContent = "搜索结果缺少合约地址，不能安全识别该资产。";
      root.querySelector(".error").hidden = false;
      return;
    }
    root.querySelector("#xtc-chain").value = chainId;
    root.querySelector("#xtc-address").value = address;
    root.querySelector(".search-results").hidden = true;
    root.querySelector(".error").hidden = true;
    root.querySelector(".symbol").textContent = token.tokenSymbol || token.symbol || "代币";
    root.querySelector(".name").textContent = token.tokenName || token.name || "正在加载市场数据…";
    root.querySelector(".contract").textContent = shortAddress(address);
    root.querySelector(".status").textContent = "正在获取币安行情";
    const sequence = ++requestSeq;
    chrome.runtime.sendMessage({ type: "XTC_TOKEN_DATA", chainId, address }, (reply) => {
      if (sequence !== requestSeq) return;
      if (!reply?.ok) {
        root.querySelector(".status").textContent = "行情获取失败";
        root.querySelector(".error").textContent = reply?.error || "币安 Web3 API 行情请求失败。";
        root.querySelector(".error").hidden = false;
        return;
      }
      const data = reply.data;
      root.__tradeTag.selectedToken = { ...token, ...data, chainId, address };
      root.querySelector(".symbol").textContent = data.symbol || token.tokenSymbol || "代币";
      root.querySelector(".name").textContent = data.name || token.tokenName || shortAddress(address);
      root.querySelector(".status").textContent = "币安 Web3 API · 已找到";
      root.querySelector(".availability").textContent = "点击后可报价";
      root.querySelector(".price").textContent = data.price ? `$${data.price}` : "暂无价格";
      root.querySelector(".change").textContent = data.change24h !== "" ? `${Number(data.change24h) >= 0 ? "+" : ""}${data.change24h}%` : "—";
      const logo = root.querySelector(".token-logo");
      const placeholder = root.querySelector(".coin span");
      if (data.logoUrl) { logo.src = data.logoUrl; logo.hidden = false; placeholder.hidden = true; }
      else { logo.hidden = true; placeholder.hidden = false; }
      draw(root, data.points || []);
      updateAmountUnit(root);
    });
  }

  const inputTokens = {
    CT_501: { symbol: 'USDC', decimals: 6, address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    '56': { symbol: 'USDT', decimals: 18, address: '0x55d398326f99059fF775485246999027B3197955' },
    '8453': { symbol: 'USDC', decimals: 6, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    '1': { symbol: 'USDC', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }
  };

  function updateAmountUnit(root) {
    const state = root.__tradeTag;
    const token = state?.selectedToken;
    const isBuy = state?.mode !== 'sell';
    const unit = isBuy ? inputTokens[root.querySelector('#xtc-chain').value]?.symbol : token?.symbol;
    root.querySelector('.unit').textContent = unit || '代币';
    root.querySelector('.currency-symbol').textContent = isBuy ? '$' : '';
    root.querySelector('.amount-label>span:first-child').textContent = isBuy ? '支付金额' : '卖出数量';
  }

  function toBaseUnits(value, decimals) {
    const input = String(value || '').trim();
    if (!/^\d+(?:\.\d+)?$/.test(input)) throw new Error('请输入有效的正数金额。');
    const [whole, fraction = ''] = input.split('.');
    if (fraction.length > decimals) throw new Error(`该代币最多支持 ${decimals} 位小数。`);
    const units = BigInt(whole) * (10n ** BigInt(decimals)) + BigInt((fraction + '0'.repeat(decimals)).slice(0, decimals) || '0');
    if (units <= 0n) throw new Error('金额必须大于 0。');
    return units.toString();
  }

  function formatUnits(value, decimals) {
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 30) throw new Error('代币精度数据无效。');
    const raw = BigInt(value || '0').toString().padStart(decimals + 1, '0');
    if (decimals === 0) return raw;
    const integer = raw.slice(0, -decimals) || '0';
    const fraction = decimals ? raw.slice(-decimals).replace(/0+$/, '') : '';
    return fraction ? `${integer}.${fraction.slice(0, 8)}` : integer;
  }

  function showError(root, error) {
    const target = root.querySelector('.error');
    target.textContent = error?.message || String(error || '操作失败。');
    target.hidden = false;
  }

  function sendMessage(payload) {
    return new Promise((resolve, reject) => chrome.runtime.sendMessage(payload, (reply) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!reply?.ok) return reject(new Error(reply?.error || 'TradeTag 请求失败。'));
      resolve(reply.data);
    }));
  }

  async function connectWallet(root) {
    const state = root.__tradeTag;
    const chainId = root.querySelector('#xtc-chain').value;
    const button = root.querySelector('.wallet-connect');
    root.querySelector('.error').hidden = true;
    button.disabled = true; button.textContent = '正在连接…';
    try {
      const wallet = await sendMessage({ type: 'XTC_WALLET_CONNECT', chainId });
      state.wallet = wallet; state.quote = null;
      root.querySelector('.wallet-state').textContent = shortAddress(wallet.address);
      root.querySelector('.availability').textContent = '已连接币安钱包';
      root.querySelector('.trade').disabled = true;
      button.textContent = '已连接';
    } catch (error) { showError(root, error); button.textContent = '连接币安钱包'; }
    finally { button.disabled = false; }
  }

  async function getQuote(root) {
    const state = root.__tradeTag;
    const token = state?.selectedToken;
    if (!token) { showError(root, new Error('请先查询并选择代币。')); return; }
    if (!state.wallet || state.wallet.chainId !== token.chainId) { showError(root, new Error('请先连接当前网络的币安钱包。')); return; }
    const isBuy = state.mode === 'buy';
    const inputToken = isBuy ? inputTokens[token.chainId] : token;
    const outputToken = isBuy ? token : inputTokens[token.chainId];
    if (!inputToken || !outputToken) { showError(root, new Error('当前网络暂不支持该交易对。')); return; }
    const button = root.querySelector('.quote-button');
    root.querySelector('.error').hidden = true;
    button.disabled = true; button.textContent = '正在向币安询价…';
    root.querySelector('.trade').disabled = true;
    try {
      const amount = toBaseUnits(root.querySelector('.amount input').value, inputToken.decimals);
      const response = await sendMessage({ type: 'XTC_TRADE_QUOTE', params: {
        binanceChainId: token.chainId, amount,
        fromTokenAddress: inputToken.address, toTokenAddress: outputToken.address,
        userWalletAddress: state.wallet.address
      } });
      const routes = Array.isArray(response?.data) ? response.data : [];
      if (!routes.length) throw new Error('币安 Web3 API 没有返回可用报价。');
      const route = routes[0];
      if (!route.quoteId) throw new Error('报价缺少 quoteId，请重新查询。');
      state.quote = { route, amount, inputToken, outputToken, isBuy };
      state.quoteAt = Date.now();
      const estimated = formatUnits(route.toTokenAmount, Number(route.toToken?.decimal ?? outputToken.decimals));
      root.querySelector('.quote b').textContent = `${estimated} ${route.toToken?.tokenSymbol || outputToken.symbol}${route.priceImpactPercent ? ` · 影响 ${route.priceImpactPercent}%` : ''}`;
      root.querySelector('.availability').textContent = `最优路由 · ${route.vendorName || 'Binance Web3'}`;
      root.querySelector('.trade').disabled = false;
      root.querySelector('.trade').textContent = `${isBuy ? '买入' : '卖出'} ${token.symbol || '代币'}`;
    } catch (error) { state.quote = null; showError(root, error); }
    finally { button.disabled = false; button.textContent = '重新获取报价'; }
  }

  async function executeTrade(root) {
    const state = root.__tradeTag;
    if (!state?.quote || !state.wallet) { showError(root, new Error('请先连接钱包并获取实时报价。')); return; }
    if (Date.now() - state.quoteAt > 25_000) { showError(root, new Error('报价即将或已经过期，请重新获取报价。')); state.quote = null; root.querySelector('.trade').disabled = true; return; }
    const button = root.querySelector('.trade');
    button.disabled = true; button.textContent = '正在构建交易…';
    root.querySelector('.error').hidden = true;
    try {
      const { route, amount, inputToken, outputToken } = state.quote;
      const slippagePercent = root.querySelector('.slippage select').value.replace('%', '');
      const built = await sendMessage({ type: 'XTC_TRADE_SWAP', params: {
        binanceChainId: state.wallet.chainId, amount,
        fromTokenAddress: inputToken.address, toTokenAddress: outputToken.address,
        userWalletAddress: state.wallet.address, quoteId: route.quoteId,
        vendor: route.vendorName, slippagePercent
      } });
      const payload = built?.data || built;
      if (payload?.executionMode === 'RFQ') throw new Error('此资产返回 RFQ 订单，需要单独的签名与结算流程；当前不会提交普通 swap。');
      const tx = payload?.tx;
      let walletTransaction;
      if (state.wallet.chainId === 'CT_501') {
        const serialized = typeof tx === 'string' ? tx : tx?.serializedTransaction || tx?.transaction || tx?.swapTransaction || tx?.data;
        if (typeof serialized !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(serialized)) throw new Error('币安没有返回可直接交给钱包的 Solana 序列化交易。');
        walletTransaction = { serializedTransaction: serialized, expectedAddress: state.wallet.address };
      } else {
        if (!tx?.to || !tx?.data) throw new Error('币安没有返回完整的 EVM 交易字段。');
        const approvalResponse = await sendMessage({ type: 'XTC_TRADE_APPROVE', params: {
          binanceChainId: state.wallet.chainId, tokenContractAddress: inputToken.address,
          approveAmount: amount
        } });
        const approvalTx = Array.isArray(approvalResponse?.data) ? approvalResponse.data[0] : null;
        if (!approvalTx?.dexContractAddress || !approvalTx?.data) throw new Error('币安没有返回有效的代币授权交易。');
        walletTransaction = {
          expectedAddress: state.wallet.address,
          swap: { from: state.wallet.address, to: tx.to, data: tx.data, value: tx.value || '0', gas: tx.gas, gasPrice: tx.gasPrice },
          approval: { tokenAddress: inputToken.address, spender: approvalTx.dexContractAddress, amount, tx: approvalTx }
        };
      }
      button.textContent = '请在币安钱包确认…';
      const result = await sendMessage({ type: 'XTC_WALLET_TRADE', chainId: state.wallet.chainId, transaction: walletTransaction });
      const hash = result.transactionId;
      const explorer = explorerUrl(state.wallet.chainId, hash);
      root.querySelector('.quote b').replaceChildren(document.createTextNode('交易已提交 · '));
      const link = document.createElement('a'); link.href = explorer; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = shortAddress(hash); root.querySelector('.quote b').append(link);
      root.querySelector('.availability').textContent = '币安钱包已提交交易';
      state.quote = null;
      button.textContent = '已提交';
    } catch (error) { showError(root, error); button.disabled = false; button.textContent = '重试交易'; }
  }

  function explorerUrl(chainId, hash) {
    if (chainId === 'CT_501') return `https://solscan.io/tx/${encodeURIComponent(hash)}`;
    const hosts = { '56': 'https://bscscan.com/tx/', '8453': 'https://basescan.org/tx/', '1': 'https://etherscan.io/tx/' };
    return `${hosts[chainId] || 'https://web3.binance.com/'}${encodeURIComponent(hash)}`;
  }

  function shortAddress(address) {
    const value = String(address || "");
    return value.length > 16 ? `${value.slice(0, 7)}…${value.slice(-6)}` : value;
  }

  function chainName(id) {
    return ({ CT_501: "Solana", "56": "BNB Chain", "8453": "Base", "1": "Ethereum" })[id] || id;
  }

  function draw(root, values) {
    if (!values.length) return;
    const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
    const points = values.map((v, i) => `${(i / (values.length - 1)) * 320},${76 - ((v - min) / span) * 64}`);
    const line = `M ${points.join(" L ")}`;
    root.querySelector(".line").setAttribute("d", line);
    root.querySelector(".area").setAttribute("d", `${line} L 320,88 L 0,88 Z`);
  }

  mount();
  const observer = new MutationObserver(() => { clearTimeout(window.__xtcScan); window.__xtcScan = setTimeout(scan, 350); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
