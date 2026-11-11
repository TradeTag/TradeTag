(() => {
  const hostId = "xtc-host";
  const seen = new WeakSet();
  const cashtag = /\$[A-Za-z][A-Za-z0-9]{1,14}/g;
  const tokenAddress = /0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44}/g;
  const discoverableToken = new RegExp(`${cashtag.source}|${tokenAddress.source}`, 'g');
  const copy = {
    en: {
      token: "Token", tokenHint: "Token details and live market data", network: "Network", contract: "Token / contract address", search: "Search", addressPlaceholder: "Paste a ticker or contract address", idle: "Hover a token on X to preview", latestPrice: "Latest price", marketCap: "Market cap", liquidity: "Liquidity", volume24h: "24h volume", today: "Today", viewDetails: "View details", hideDetails: "Hide details", swap: "Swap", noChart: "No chart data available", chart: "Token price chart", notConnected: "Not connected", connect: "Connect Binance Wallet", buy: "Buy", sell: "Sell", quotePending: "Quote needed", amount: "Trade amount", amountPlaceholder: "Enter amount", max: "MAX", slippage: "Slippage", estimated: "Estimated received", quoteWait: "Shown after quote", getQuote: "Get live quote", confirm: "Confirm in Binance Wallet", notice: "Quotes by Binance Web3 API · review and confirm in your wallet", footer: "Verify the asset, network, amount, and wallet confirmation", settings: "Settings", language: "Panel language", textSize: "Text size", found: "Asset found", searchLoading: "Searching Binance Web3 API…", querying: "Searching…", searchFailed: "Token search failed", notFound: "No matching token was found.", resultCount: "{count} results", selectAsset: "Choose the asset that matches the network and contract", confirmAsset: "Verify the asset", missingAddress: "The search result has no contract address, so it cannot be verified.", loadingMarket: "Loading market data…", loadingQuote: "Loading Binance market data…", marketFailed: "Market data failed to load", noConnection: "Could not connect to the market service", quoteAvailable: "Ready for a quote", noPrice: "No price available", paymentAmount: "Pay amount", sellAmount: "Sell amount", walletBalances: "Wallet balances", nativeBalance: "Network coin", stableBalance: "Stablecoin", tokenBalance: "Trade token", balanceLoading: "Updating balances…", balanceUpdated: "Updated", balanceUnavailable: "Balance data unavailable", sellPercent: "Sell percentage", invalidAmount: "Enter a valid amount greater than zero.", decimals: "This token supports up to {count} decimal places.", amountPositive: "Amount must be greater than zero.", invalidPrecision: "Token precision data is invalid.", failed: "The request failed.", connecting: "Connecting…", walletConnected: "Wallet connected", quoteSelect: "Search for and select a token first.", quoteConnect: "Connect Binance Wallet on the selected network first.", unsupportedPair: "This trading pair is not supported on the selected network.", quoting: "Requesting a quote…", noQuote: "Binance Web3 API returned no available quote.", missingQuoteId: "The quote has no quote ID. Request a fresh quote.", impact: " · price impact {value}%", bestRoute: "Best route · {vendor}", refreshQuote: "Refresh quote", quoteExpired: "Quote expired. Request a fresh quote.", building: "Building transaction…", rfq: "This asset returned an RFQ order, which needs a separate settlement flow. No swap was submitted.", invalidSolana: "Binance did not return a Solana transaction the wallet can send.", incompleteEvm: "Binance did not return a complete EVM transaction.", invalidApproval: "Binance did not return a valid token approval transaction.", walletConfirm: "Confirm in Binance Wallet…", txSubmitted: "Transaction submitted · ", walletSent: "Submitted by Binance Wallet", retry: "Retry trade", defaultToken: "Token", hoverTitle: "Hover to preview {token}", searchTooltip: "Search", close: "Close", quoteFrom: "Trade quote", selected: "Selected", tradeToken: "{verb} {token}"
    },
    zh: {
      token: "代币", tokenHint: "代币资料与实时行情", network: "网络", contract: "代币 / 合约地址", search: "查询", addressPlaceholder: "粘贴 ticker 或合约地址", idle: "悬停 X 上的代币即可预览", latestPrice: "最新价格", marketCap: "市值", liquidity: "流动性", volume24h: "24 小时成交量", today: "今日", viewDetails: "查看详情", hideDetails: "收起详情", swap: "交易", noChart: "暂无 K 线数据", chart: "代币价格图表", notConnected: "未连接", connect: "连接币安钱包", buy: "买入", sell: "卖出", quotePending: "待获取报价", amount: "交易金额", amountPlaceholder: "输入金额", max: "最大", slippage: "滑点容忍", estimated: "预计到账", quoteWait: "获取报价后显示", getQuote: "获取实时报价", confirm: "在币安钱包确认", notice: "报价来自币安 Web3 API · 请在钱包中核对并确认", footer: "请核对资产、网络、金额与钱包确认内容", settings: "设置", language: "面板语言", textSize: "字体大小", found: "已找到资产", searchLoading: "正在通过币安 Web3 API 搜索…", querying: "正在查询…", searchFailed: "代币搜索失败", notFound: "没有找到匹配的代币。", resultCount: "{count} 个结果", selectAsset: "选择链和合约地址匹配的资产", confirmAsset: "请确认资产", missingAddress: "搜索结果缺少合约地址，无法核实资产。", loadingMarket: "正在加载行情…", loadingQuote: "正在获取币安行情…", marketFailed: "行情加载失败", noConnection: "无法连接行情服务", quoteAvailable: "可以获取报价", noPrice: "暂无价格", paymentAmount: "支付金额", sellAmount: "卖出数量", walletBalances: "钱包余额", nativeBalance: "链上原生币", stableBalance: "稳定币", tokenBalance: "交易代币", balanceLoading: "正在更新余额…", balanceUpdated: "已更新", balanceUnavailable: "余额暂时不可用", sellPercent: "卖出比例", invalidAmount: "请输入大于零的有效金额。", decimals: "该代币最多支持 {count} 位小数。", amountPositive: "金额必须大于零。", invalidPrecision: "代币精度数据无效。", failed: "请求失败。", connecting: "正在连接…", walletConnected: "已连接币安钱包", quoteSelect: "请先查询并选择代币。", quoteConnect: "请先连接当前网络的币安钱包。", unsupportedPair: "当前网络暂不支持该交易对。", quoting: "正在向币安询价…", noQuote: "币安 Web3 API 没有返回可用报价。", missingQuoteId: "报价缺少 quoteId，请重新查询。", impact: " · 价格影响 {value}%", bestRoute: "最优路由 · {vendor}", refreshQuote: "重新获取报价", quoteExpired: "报价已过期，请重新获取。", building: "正在构建交易…", rfq: "该资产返回 RFQ 订单，需要单独结算流程；当前未提交兑换。", invalidSolana: "币安未返回可由 Solana 钱包发送的完整交易。", incompleteEvm: "币安未返回完整的 EVM 交易。", invalidApproval: "币安未返回有效的代币授权交易。", walletConfirm: "请在币安钱包确认…", txSubmitted: "交易已提交 · ", walletSent: "币安钱包已提交交易", retry: "重试交易", defaultToken: "代币", hoverTitle: "悬停预览 {token}", searchTooltip: "查询", close: "关闭", quoteFrom: "交易报价", selected: "已选择", tradeToken: "{verb} {token}"
    }
  };
  let preferences = { language: "en", fontSize: 15 };
  const message = (key, params = {}) => {
    let text = copy[preferences.language]?.[key] || copy.en[key] || key;
    for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value));
    return text;
  };
  function setMessage(element, key, params = {}) {
    if (!element) return;
    element.dataset.ttKey = key;
    element.dataset.ttParams = JSON.stringify(params);
    element.textContent = message(key, params);
  }
  function applyPreferences(root) {
    root.querySelectorAll("[data-tt-key]").forEach((element) => {
      let params = {};
      try { params = JSON.parse(element.dataset.ttParams || "{}"); } catch {}
      element.textContent = message(element.dataset.ttKey, params);
    });
    root.querySelectorAll("[data-tt-placeholder]").forEach((element) => { element.placeholder = message(element.dataset.ttPlaceholder); });
    root.querySelectorAll("[data-tt-aria]").forEach((element) => { element.setAttribute("aria-label", message(element.dataset.ttAria)); });
    const card = root.querySelector(".card");
    if (card) card.style.fontSize = `${preferences.fontSize}px`;
    const language = root.querySelector(".language-setting");
    if (language) language.value = preferences.language;
    const size = root.querySelector(".font-size-setting");
    const output = root.querySelector(".font-size-value");
    if (size) size.value = String(preferences.fontSize);
    if (output) output.textContent = `${preferences.fontSize}px`;
    const tradeState = root.__tradeTag;
    if (tradeState?.selectedToken) draw(root, tradeState.selectedToken.candles || tradeState.selectedToken.points || []);
    const change = root.querySelector(".change");
    if (change?.dataset.price && change.dataset.percent !== undefined) change.textContent = changeSummary(change.dataset.price, change.dataset.percent);
    if (tradeState?.quote && tradeState.selectedToken) {
      setMessage(root.querySelector(".trade"), "tradeToken", {
        verb: message(tradeState.quote.isBuy ? "buy" : "sell"),
        token: tradeState.selectedToken.symbol || message("defaultToken")
      });
    }
  }
  let activeQuery = "";
  let activeChain = "";
  let activeAnchor = null;
  let requestSeq = 0;
  let openTimer = 0;
  let hideTimer = 0;

  function mount() {
    if (!document.getElementById(hostId)) {
      const host = document.createElement("div");
      host.id = hostId;
      host.className = "xtc-host";
      document.documentElement.append(host);
      host.attachShadow({ mode: "open" }).innerHTML = `
        <link rel="stylesheet" href="${chrome.runtime.getURL("content.css")}" />
        <section class="card" aria-live="polite" hidden>
          <header><button class="settings-toggle" type="button" data-tt-aria="settings" aria-expanded="false">⚙</button><div class="brand"><img class="brand-logo" src="${chrome.runtime.getURL("icons/icon48.png")}" alt="TradeTag"/><span>TRADETAG</span></div><button class="close" type="button" data-tt-aria="close">×</button></header>
          <div class="settings-panel" hidden><label class="setting-row"><span data-tt-key="language">Panel language</span><select class="language-setting" data-tt-aria="language"><option value="en">English</option><option value="zh">简体中文</option></select></label><label class="setting-row"><span data-tt-key="textSize">Text size</span><span class="font-setting"><input class="font-size-setting" type="range" min="13" max="19" step="1" value="15"><output class="font-size-value">15px</output></span></label></div>
          <div class="token"><div class="coin"><span>◈</span><img class="token-logo" alt="" hidden/></div><div class="token-copy"><strong class="symbol">Token</strong><small class="name" data-tt-key="tokenHint">Token details and live market data</small></div><span class="status-badge" data-tt-key="idle">Preview</span></div>
          <div class="market-overview"><div class="price-row"><div><small data-tt-key="latestPrice">Latest price</small><strong class="price">—</strong><span class="change">—</span></div></div>
          <div class="market-stats"><div><small data-tt-key="marketCap">Market cap</small><b class="market-cap">—</b></div><div><small data-tt-key="liquidity">Liquidity</small><b class="liquidity">—</b></div><div><small data-tt-key="volume24h">24h volume</small><b class="volume24h">—</b></div></div></div>
          <div class="chart"><svg viewBox="0 0 360 150" preserveAspectRatio="none" data-tt-aria="chart"><g class="chart-grid"></g><path class="area"></path><path class="line"></path><g class="chart-y-axis"></g><g class="chart-x-axis"></g><g class="chart-current"></g></svg><div class="chart-empty" data-tt-key="loadingMarket">Loading market data…</div></div>
          <div class="primary-actions"><button class="details-button" type="button" data-tt-key="viewDetails">View details</button><button class="swap-button" type="button" data-tt-key="swap">Swap</button></div>
          <p class="error" hidden></p>
          <section class="details-extra" hidden>
            <label class="field-label" for="xtc-chain" data-tt-key="network">Network</label>
            <select id="xtc-chain"><option value="CT_501">Solana</option><option value="56">BNB Chain</option><option value="8453">Base</option><option value="1">Ethereum</option></select>
            <label class="field-label" for="xtc-address" data-tt-key="contract">Token / contract address</label>
            <div class="token-input"><input id="xtc-address" data-tt-placeholder="addressPlaceholder" placeholder="Paste a ticker or contract address" /><button class="lookup" type="button" data-tt-key="search">Search</button></div>
            <div class="search-results" hidden></div>
            <div class="status-row"><span class="status" data-tt-key="idle">Hover a token on X to preview</span><span class="contract"></span></div>
          </section>
          <section class="trade-details" hidden>
            <div class="wallet-row"><button class="wallet-connect" type="button" data-tt-key="connect">Connect Binance Wallet</button><span class="wallet-state" data-tt-key="notConnected">Not connected</span></div>
            <section class="wallet-balances" hidden aria-live="polite"><div class="balances-header"><span data-tt-key="walletBalances">Wallet balances</span><span class="balance-state"></span></div><div class="balances-grid"><div><small data-tt-key="nativeBalance">Network coin</small><b class="balance-native">—</b></div><div><small data-tt-key="stableBalance">Stablecoin</small><b class="balance-stable">—</b></div><div><small data-tt-key="tokenBalance">Trade token</small><b class="balance-token">—</b></div></div></section>
            <div class="mode-tabs"><button class="selected" type="button" data-mode="buy" data-tt-key="buy">Buy</button><button type="button" data-mode="sell" data-tt-key="sell">Sell</button><span class="availability" data-tt-key="quotePending">Quote needed</span></div>
            <div class="sell-presets" hidden><span data-tt-key="sellPercent">Sell percentage</span><div><button type="button" data-percent="10">10%</button><button type="button" data-percent="25">25%</button><button type="button" data-percent="50">50%</button><button type="button" data-percent="100">100%</button></div></div>
            <div class="amount-label"><span data-tt-key="amount">Trade amount</span><span class="unit">USDC</span></div>
            <div class="amount"><span class="currency-symbol">$</span><input inputmode="decimal" data-tt-placeholder="amountPlaceholder" placeholder="Enter amount" /><button type="button" data-tt-key="max">MAX</button></div>
            <div class="slippage"><span data-tt-key="slippage">Slippage</span><select><option>0.5%</option><option selected>1.0%</option><option>3.0%</option></select></div>
            <div class="quote"><span data-tt-key="estimated">Estimated received</span><b data-tt-key="quoteWait">Shown after quote</b></div>
            <button class="quote-button" type="button" data-tt-key="getQuote">Get live quote</button>
            <button class="trade" type="button" disabled data-tt-key="confirm">Confirm in Binance Wallet</button>
            <p class="notice" data-tt-key="notice">Quotes by Binance Web3 API · review and confirm in your wallet</p>
            <footer data-tt-key="footer">Verify the asset, network, amount, and wallet confirmation</footer>
          </section>
        </section>`;
      const root = host.shadowRoot;
      root.querySelector(".close").onclick = hideCard;
      root.querySelector(".card").addEventListener("mouseenter", () => clearTimeout(hideTimer));
      root.querySelector(".card").addEventListener("mouseleave", scheduleHide);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") refreshWalletBalances(root, { force: true, quiet: true });
      });
      window.addEventListener("focus", () => refreshWalletBalances(root, { force: true, quiet: true }));
      window.addEventListener("tradetag-wallet-change", (event) => {
        const state = root.__tradeTag;
        const change = event.detail || {};
        if (!state?.wallet || !state.selectedToken) return;
        if (change.address !== undefined) {
          if (!change.address) {
            state.wallet = null;
            state.quote = null;
            clearBalanceRefresh(state);
            root.querySelector('.wallet-balances').hidden = true;
            setMessage(root.querySelector('.wallet-state'), 'notConnected');
            setMessage(root.querySelector('.wallet-connect'), 'connect');
            setMessage(root.querySelector('.availability'), 'quoteConnect');
            root.querySelector('.trade').disabled = true;
            updateAmountUnit(root);
            return;
          }
          state.wallet.address = change.address;
        }
        if (change.chainId) {
          const changedChain = String(change.chainId).startsWith('0x') ? BigInt(change.chainId).toString() : String(change.chainId);
          if (changedChain !== String(state.selectedToken.chainId)) {
            state.wallet = null;
            state.quote = null;
            clearBalanceRefresh(state);
            root.querySelector('.wallet-balances').hidden = true;
            setMessage(root.querySelector('.wallet-state'), 'notConnected');
            setMessage(root.querySelector('.wallet-connect'), 'connect');
            setMessage(root.querySelector('.availability'), 'quoteConnect');
            root.querySelector('.trade').disabled = true;
            updateAmountUnit(root);
            return;
          }
        }
        root.querySelector('.wallet-state').textContent = shortAddress(state.wallet.address);
        refreshWalletBalances(root, { force: true, quiet: true });
      });
      root.querySelector(".details-button").addEventListener("click", () => {
        const details = root.querySelector(".details-extra");
        details.hidden = !details.hidden;
        setMessage(root.querySelector(".details-button"), details.hidden ? "viewDetails" : "hideDetails");
        positionCard();
        if (!details.hidden) root.querySelector(".card").scrollTo({ top: details.offsetTop - 10, behavior: "smooth" });
      });
      root.querySelector(".swap-button").addEventListener("click", () => {
        root.querySelector(".trade-details").hidden = false;
        positionCard();
        root.querySelector(".card").scrollTo({ top: root.querySelector(".trade-details").offsetTop - 10, behavior: "smooth" });
        refreshWalletBalances(root, { force: true, quiet: true });
      });
      root.querySelector(".settings-toggle").addEventListener("click", () => {
        const panel = root.querySelector(".settings-panel");
        panel.hidden = !panel.hidden;
        root.querySelector(".settings-toggle").setAttribute("aria-expanded", String(!panel.hidden));
      });
      root.querySelector(".language-setting").addEventListener("change", (event) => {
        preferences.language = event.target.value;
        applyPreferences(root);
        chrome.storage.local.set({ tradeTagPanelPreferences: preferences });
      });
      root.querySelector(".font-size-setting").addEventListener("input", (event) => {
        preferences.fontSize = Number(event.target.value);
        applyPreferences(root);
      });
      root.querySelector(".font-size-setting").addEventListener("change", () => chrome.storage.local.set({ tradeTagPanelPreferences: preferences }));
      chrome.storage.local.get({ tradeTagPanelPreferences: { language: "en", fontSize: 15 } }, ({ tradeTagPanelPreferences }) => {
        const saved = tradeTagPanelPreferences || {};
        preferences = { language: saved.language === "zh" ? "zh" : "en", fontSize: Math.max(13, Math.min(19, Number(saved.fontSize) || 15)) };
        applyPreferences(root);
        if (root.__tradeTag?.selectedToken) draw(root, root.__tradeTag.selectedToken.candles || root.__tradeTag.selectedToken.points || []);
      });
      root.querySelector(".lookup").onclick = () => lookupFromForm(root);
      root.querySelector("#xtc-address").addEventListener("keydown", (event) => { if (event.key === "Enter") lookupFromForm(root); });
      root.querySelector(".search-results").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-token-index]");
        if (!button) return;
        const token = root.__tradeTagTokens?.[Number(button.dataset.tokenIndex)];
        if (token) loadSelectedToken(root, token);
      });
      root.__tradeTag = { selectedToken: null, wallet: null, quote: null, quoteAt: 0, mode: 'buy', busy: false, balances: null, balanceAt: 0, balancePending: null, balanceTimer: 0 };
      root.querySelector(".wallet-connect").onclick = () => connectWallet(root);
      root.querySelector(".quote-button").onclick = () => getQuote(root);
      root.querySelector(".trade").onclick = () => executeTrade(root);
      root.querySelector(".amount button").addEventListener("click", () => applyBalanceAmount(root, 100));
      root.querySelectorAll(".sell-presets button").forEach((button) => button.addEventListener("click", () => applyBalanceAmount(root, Number(button.dataset.percent))));
      root.querySelector(".trade-details").addEventListener("focusin", () => refreshWalletBalances(root, { quiet: true }));
      root.querySelector("#xtc-chain").addEventListener("change", () => {
        clearBalanceRefresh(root.__tradeTag);
        root.__tradeTag = { selectedToken: null, wallet: null, quote: null, quoteAt: 0, mode: 'buy', busy: false, balances: null, balanceAt: 0, balancePending: null, balanceTimer: 0 };
        root.querySelector(".wallet-balances").hidden = true;
        root.querySelector(".wallet-connect").disabled = false;
        setMessage(root.querySelector(".wallet-state"), "notConnected");
        root.querySelector(".trade").disabled = true;
        updateAmountUnit(root);
      });
      root.querySelector(".amount input").addEventListener("input", () => { root.__tradeTag.quote = null; root.querySelector(".trade").disabled = true; });
      root.querySelectorAll(".mode-tabs button").forEach((button) => button.onclick = () => {
        root.querySelectorAll(".mode-tabs button").forEach((item) => item.classList.toggle("selected", item === button));
        root.__tradeTag.mode = button.dataset.mode; root.__tradeTag.quote = null; root.querySelector(".trade").disabled = true;
        updateAmountUnit(root);
        refreshWalletBalances(root, { force: true, quiet: true });
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
        button.title = message("hoverTitle", { token: match });
        fragment.append(button); cursor = offset + match.length; return match;
      });
      fragment.append(document.createTextNode(text.slice(cursor)));
      node.parentNode?.replaceChild(fragment, node);
    }
  }

  function assetFromElement(element) {
    const trigger = element?.closest?.("a,button.xtc-tag");
    if (!trigger || trigger.closest(`#${hostId}`)) return null;
    const text = String(trigger.innerText || trigger.textContent || trigger.getAttribute("aria-label") || "").replace(/\s+/g, " ");
    const address = text.match(/0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44}/)?.[0];
    if (address) return { trigger, query: address, chainId: /^0x/i.test(address) ? "56" : "CT_501" };
    const ticker = text.match(/\$[A-Za-z][A-Za-z0-9]{1,14}/)?.[0];
    if (ticker) return { trigger, query: ticker, chainId: "CT_501" };
    return null;
  }

  function positionCard(anchor = activeAnchor) {
    if (!anchor?.isConnected) return;
    const host = document.getElementById(hostId);
    const card = host?.shadowRoot?.querySelector(".card");
    if (!host || !card) return;
    const rect = anchor.getBoundingClientRect();
    const margin = 12;
    const width = Math.min(480, window.innerWidth - margin * 2);
    card.style.width = `${width}px`;
    const cardHeight = Math.min(card.scrollHeight || 640, window.innerHeight - margin * 2);
    let left = rect.right + 14;
    if (left + width > window.innerWidth - margin) left = rect.left - width - 14;
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
    const top = Math.max(margin, Math.min(rect.top - 8, window.innerHeight - cardHeight - margin));
    host.style.left = `${left}px`;
    host.style.top = `${top}px`;
    host.style.right = "auto";
  }

  function hideCard() {
    clearTimeout(openTimer);
    clearTimeout(hideTimer);
    const host = document.getElementById(hostId);
    clearBalanceRefresh(host?.shadowRoot?.__tradeTag);
    if (host?.shadowRoot) host.shadowRoot.querySelector(".card").hidden = true;
    activeQuery = "";
    activeChain = "";
    activeAnchor = null;
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      const card = document.getElementById(hostId)?.shadowRoot?.querySelector(".card");
      const state = document.getElementById(hostId)?.shadowRoot?.__tradeTag;
      if (state?.busy || card?.matches(":hover") || activeAnchor?.matches(":hover")) return;
      hideCard();
    }, 550);
  }

  function onPageMouseOver(event) {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const asset = assetFromElement(target);
    if (!asset) return;
    clearTimeout(hideTimer);
    if (activeAnchor === asset.trigger && activeQuery === asset.query && activeChain === asset.chainId) return;
    clearTimeout(openTimer);
    activeAnchor = asset.trigger;
    openTimer = setTimeout(() => openCard(asset.query, asset.chainId, asset.trigger), 220);
  }

  function onPageMouseOut(event) {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!assetFromElement(target)) return;
    if (event.relatedTarget instanceof Node && target?.contains(event.relatedTarget)) return;
    scheduleHide();
  }

  function onPageClick(event) {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const asset = assetFromElement(target);
    if (!asset) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    clearTimeout(hideTimer);
    activeAnchor = asset.trigger;
    openCard(asset.query, asset.chainId, asset.trigger);
  }

  function lookupFromForm(root) {
    const query = root.querySelector("#xtc-address").value.trim();
    if (!query) return;
    openCard(query, root.querySelector("#xtc-chain").value);
  }

  function openCard(query, chainId = "CT_501", anchor = activeAnchor) {
    query = String(query || "").trim();
    if (!query) return;
    if (anchor) activeAnchor = anchor;
    const existingCard = document.getElementById(hostId)?.shadowRoot?.querySelector(".card");
    if (activeQuery === query && activeChain === chainId && existingCard && !existingCard.hidden) {
      positionCard(anchor);
      return;
    }
    activeQuery = query;
    activeChain = chainId;
    const sequence = ++requestSeq;
    const root = document.getElementById(hostId).shadowRoot;
    clearBalanceRefresh(root.__tradeTag);
    root.__tradeTag = { selectedToken: null, wallet: null, quote: null, quoteAt: 0, mode: 'buy', busy: false, balances: null, balanceAt: 0, balancePending: null, balanceTimer: 0 };
    root.querySelector(".card").hidden = false;
    root.querySelector(".details-extra").hidden = true;
    root.querySelector(".trade-details").hidden = true;
    updateAmountUnit(root);
    setMessage(root.querySelector(".details-button"), "viewDetails");
    positionCard(anchor);
    root.querySelector("#xtc-address").value = query;
    root.querySelector("#xtc-chain").value = chainId;
    root.querySelector(".error").hidden = true;
    root.querySelector(".search-results").hidden = true;
    root.querySelector(".search-results").replaceChildren();
    root.querySelector(".price").textContent = "—";
    root.querySelector(".price").style.fontSize = "";
    root.querySelector(".change").textContent = "—";
    delete root.querySelector(".change").dataset.price;
    delete root.querySelector(".change").dataset.percent;
    root.querySelector(".volume24h").textContent = "—";
    root.querySelector(".market-cap").textContent = "—";
    root.querySelector(".liquidity").textContent = "—";
    setMessage(root.querySelector(".chart-empty"), "loadingMarket");
    root.querySelector(".chart-empty").hidden = false;
    root.querySelector(".line").setAttribute("d", "");
    root.querySelector(".area").setAttribute("d", "");
    root.querySelector(".chart-grid").replaceChildren();
    root.querySelector(".chart-x-axis").replaceChildren();
    root.querySelector(".chart-y-axis").replaceChildren();
    root.querySelector(".chart-current").replaceChildren();
    root.querySelector(".contract").textContent = "";
    root.querySelector(".wallet-balances").hidden = true;
    root.querySelector(".sell-presets").hidden = true;
    root.querySelector(".amount input").value = "";
    root.querySelector(".symbol").textContent = query.startsWith("$") ? query.slice(1).toUpperCase() : message("defaultToken");
      setMessage(root.querySelector(".name"), "searchLoading");
    setMessage(root.querySelector(".status"), "querying");
    root.querySelector(".error").hidden = true;
    chrome.runtime.sendMessage({ type: "XTC_LOOKUP", query, chainId }, (reply) => {
      if (sequence !== requestSeq || activeQuery !== query) return;
      if (!reply?.ok) {
        setMessage(root.querySelector(".name"), "searchFailed");
        setMessage(root.querySelector(".status"), "searchFailed");
        root.querySelector(".error").textContent = reply?.error || message("noConnection");
        root.querySelector(".error").hidden = false;
        return;
      }
      const tokens = reply.data?.tokens || [];
      root.__tradeTagTokens = tokens;
      if (!tokens.length) {
        setMessage(root.querySelector(".name"), "notFound");
        setMessage(root.querySelector(".status"), "searchFailed");
        return;
      }
      if (tokens.length === 1) {
        loadSelectedToken(root, tokens[0]);
      } else {
        root.querySelector(".symbol").textContent = message("resultCount", { count: tokens.length });
        setMessage(root.querySelector(".name"), "selectAsset");
        setMessage(root.querySelector(".status"), "confirmAsset");
        root.querySelector(".details-extra").hidden = false;
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
      root.querySelector(".error").textContent = message("missingAddress");
      root.querySelector(".error").hidden = false;
      return;
    }
    root.querySelector("#xtc-chain").value = chainId;
    root.querySelector("#xtc-address").value = address;
    root.querySelector(".search-results").hidden = true;
    root.querySelector(".error").hidden = true;
    root.querySelector(".symbol").textContent = token.tokenSymbol || token.symbol || message("defaultToken");
    if (token.tokenName || token.name) {
      root.querySelector(".name").removeAttribute("data-tt-key");
      root.querySelector(".name").textContent = token.tokenName || token.name;
    } else setMessage(root.querySelector(".name"), "loadingMarket");
    root.querySelector(".contract").textContent = shortAddress(address);
    setMessage(root.querySelector(".status"), "loadingQuote");
    const sequence = ++requestSeq;
    chrome.runtime.sendMessage({ type: "XTC_TOKEN_DATA", chainId, address }, (reply) => {
      if (sequence !== requestSeq) return;
      if (!reply?.ok) {
        setMessage(root.querySelector(".status"), "marketFailed");
        setMessage(root.querySelector(".chart-empty"), "marketFailed");
        root.querySelector(".chart-empty").hidden = false;
        root.querySelector(".error").textContent = reply?.error || message("marketFailed");
        root.querySelector(".error").hidden = false;
        return;
      }
      const data = reply.data;
      root.__tradeTag.selectedToken = { ...token, ...data, chainId, address };
      root.querySelector(".symbol").textContent = data.symbol || token.tokenSymbol || message("defaultToken");
      root.querySelector(".name").removeAttribute("data-tt-key");
      root.querySelector(".name").textContent = data.name || token.tokenName || shortAddress(address);
      setMessage(root.querySelector(".status"), "found");
      setMessage(root.querySelector(".status-badge"), "found");
      setMessage(root.querySelector(".availability"), "quoteAvailable");
      const priceText = data.price ? `$${formatPrice(data.price)}` : message("noPrice");
      root.querySelector(".price").textContent = priceText;
      root.querySelector(".price").style.fontSize = priceText.length > 18 ? "1.12em" : priceText.length > 13 ? "1.42em" : "1.85em";
      root.querySelector(".market-cap").textContent = formatMetric(data.marketCap);
      root.querySelector(".liquidity").textContent = formatMetric(data.liquidity);
      root.querySelector(".volume24h").textContent = formatMetric(data.volume24h);
      root.querySelector(".change").dataset.price = String(data.price ?? "");
      root.querySelector(".change").dataset.percent = String(data.change24h ?? "");
      root.querySelector(".change").textContent = changeSummary(data.price, data.change24h);
      root.querySelector(".change").classList.toggle("negative", Number(data.change24h) < 0);
      root.querySelector(".chart").classList.toggle("negative", Number(data.change24h) < 0);
      const logo = root.querySelector(".token-logo");
      const placeholder = root.querySelector(".coin span");
      if (data.logoUrl) { logo.src = data.logoUrl; logo.hidden = false; placeholder.hidden = true; }
      else { logo.hidden = true; placeholder.hidden = false; }
      draw(root, data.candles?.length ? data.candles : data.points || []);
      const hasChart = (data.candles?.length || data.points?.length || 0) > 1;
      if (hasChart) root.querySelector(".chart-empty").hidden = true;
      else { setMessage(root.querySelector(".chart-empty"), "noChart"); root.querySelector(".chart-empty").hidden = false; }
      updateAmountUnit(root);
      refreshWalletBalances(root, { force: true, quiet: true });
        positionCard();
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
    root.querySelector('.unit').textContent = unit || message('defaultToken');
    root.querySelector('.currency-symbol').textContent = isBuy ? '$' : '';
    setMessage(root.querySelector('.amount-label>span:first-child'), isBuy ? 'paymentAmount' : 'sellAmount');
    const presets = root.querySelector('.sell-presets');
    if (presets) presets.hidden = isBuy;
    const balance = isBuy ? state?.balances?.stable : state?.balances?.token;
    const max = root.querySelector('.amount button');
    if (max) max.disabled = !state?.wallet || !balance;
    root.querySelectorAll('.sell-presets button').forEach((button) => { button.disabled = !state?.wallet || !balance; });
  }

  function formatPrice(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value || '—');
    return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 }).format(number);
  }

  function formatMetric(value, currency = true) {
    if (value === null || value === undefined || value === '') return '—';
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    return `${currency ? '$' : ''}${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(number)}`;
  }

  function changeSummary(price, percent) {
    if (price === null || price === undefined || price === "" || percent === null || percent === undefined || percent === "") return "—";
    const current = Number(price), change = Number(percent);
    if (!Number.isFinite(current) || !Number.isFinite(change)) return "—";
    const absolute = current * Math.abs(change) / 100;
    const sign = change >= 0 ? "+" : "−";
    return `${sign}$${formatPrice(absolute)} (${change >= 0 ? "+" : "−"}${Math.abs(change).toLocaleString("en-US", { maximumFractionDigits: 2 })}%) ${message("today")}`;
  }

  function toBaseUnits(value, decimals) {
    const input = String(value || '').trim();
    if (!/^\d+(?:\.\d+)?$/.test(input)) throw new Error(message('invalidAmount'));
    const [whole, fraction = ''] = input.split('.');
    if (fraction.length > decimals) throw new Error(message('decimals', { count: decimals }));
    const units = BigInt(whole) * (10n ** BigInt(decimals)) + BigInt((fraction + '0'.repeat(decimals)).slice(0, decimals) || '0');
    if (units <= 0n) throw new Error(message('amountPositive'));
    return units.toString();
  }

  function formatUnits(value, decimals) {
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 30) throw new Error(message('invalidPrecision'));
    const raw = BigInt(value || '0').toString().padStart(decimals + 1, '0');
    if (decimals === 0) return raw;
    const integer = raw.slice(0, -decimals) || '0';
    const fraction = decimals ? raw.slice(-decimals).replace(/0+$/, '') : '';
    return fraction ? `${integer}.${fraction.slice(0, 8)}` : integer;
  }

  function showError(root, error) {
    const target = root.querySelector('.error');
    target.removeAttribute('data-tt-key');
    target.textContent = error?.message || String(error || message('failed'));
    target.hidden = false;
  }

  function sendMessage(payload) {
    return new Promise((resolve, reject) => chrome.runtime.sendMessage(payload, (reply) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!reply?.ok) return reject(new Error(reply?.error || message('failed')));
      resolve(reply.data);
    }));
  }

  async function connectWallet(root) {
    const state = root.__tradeTag;
    const chainId = root.querySelector('#xtc-chain').value;
    const button = root.querySelector('.wallet-connect');
    root.querySelector('.error').hidden = true;
    state.busy = true;
    button.disabled = true; setMessage(button, 'connecting');
    try {
      const wallet = await sendMessage({ type: 'XTC_WALLET_CONNECT', chainId });
      state.wallet = wallet; state.quote = null;
      root.querySelector('.wallet-state').textContent = shortAddress(wallet.address);
      setMessage(root.querySelector('.availability'), 'walletConnected');
      root.querySelector('.trade').disabled = true;
      button.textContent = message('walletConnected');
      root.querySelector('.wallet-balances').hidden = false;
      setMessage(root.querySelector('.balance-state'), 'balanceLoading');
      await sendMessage({ type: 'XTC_WALLET_WATCH', chainId }).catch(() => {});
      await refreshWalletBalances(root, { force: true });
      startBalanceRefresh(root);
    } catch (error) { showError(root, error); setMessage(button, 'connect'); }
    finally { button.disabled = false; state.busy = false; }
  }

  function nativeSymbol(chainId) {
    return ({ CT_501: 'SOL', '56': 'BNB', '8453': 'ETH', '1': 'ETH' })[String(chainId)] || 'Native';
  }

  function displayBalance(value) {
    const text = String(value ?? '0');
    if (!/^\d+(?:\.\d+)?$/.test(text)) return '0';
    const [whole, fraction = ''] = text.split('.');
    const trimmed = fraction.slice(0, 8).replace(/0+$/, '');
    return trimmed ? `${whole}.${trimmed}` : whole;
  }

  function balanceEntry(assets, chainId, tokenAddress, fallbackSymbol, native = false) {
    const normalize = (value) => chainId === 'CT_501' ? String(value || '') : String(value || '').toLowerCase();
    const normalized = normalize(tokenAddress);
    const isNativeAddress = (value) => {
      const address = String(value || '').toLowerCase();
      return !address || address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' || address === '11111111111111111111111111111111';
    };
    const asset = assets.find((item) => String(item.binanceChainId || chainId) === String(chainId)
      && (native ? isNativeAddress(item.tokenContractAddress) : normalize(item.tokenContractAddress) === normalized));
    return { amount: String(asset?.balance ?? '0'), symbol: asset?.symbol || fallbackSymbol };
  }

  async function refreshWalletBalances(root, { force = false, quiet = false } = {}) {
    const state = root.__tradeTag;
    const token = state?.selectedToken;
    if (!state?.wallet || !token || state.wallet.chainId !== token.chainId
      || root.querySelector('.card').hidden || root.querySelector('.trade-details').hidden) return;
    if (state.balancePending) return state.balancePending;
    if (!force && Date.now() - (state.balanceRequestedAt || 0) < 3500) return;
    const stable = inputTokens[token.chainId];
    if (!stable) return;
    state.balanceRequestedAt = Date.now();
    root.querySelector('.wallet-balances').hidden = false;
    if (!quiet) setMessage(root.querySelector('.balance-state'), 'balanceLoading');
    const request = sendMessage({ type: 'XTC_WALLET_BALANCES', params: {
      binanceChainId: token.chainId,
      address: state.wallet.address,
      stableTokenAddress: stable.address,
      tradeTokenAddress: token.address
    } }).then((response) => {
      if (root.__tradeTag !== state) return;
      const assets = (Array.isArray(response?.data) ? response.data : []).flatMap((entry) => Array.isArray(entry?.tokenAssets) ? entry.tokenAssets : []);
      state.balances = {
        native: balanceEntry(assets, token.chainId, '', nativeSymbol(token.chainId), true),
        stable: balanceEntry(assets, token.chainId, stable.address, stable.symbol),
        token: balanceEntry(assets, token.chainId, token.address, token.symbol || message('defaultToken'))
      };
      state.balanceAt = Date.now();
      root.querySelector('.balance-native').textContent = `${displayBalance(state.balances.native.amount)} ${state.balances.native.symbol}`;
      root.querySelector('.balance-stable').textContent = `${displayBalance(state.balances.stable.amount)} ${state.balances.stable.symbol}`;
      root.querySelector('.balance-token').textContent = `${displayBalance(state.balances.token.amount)} ${state.balances.token.symbol}`;
      setMessage(root.querySelector('.balance-state'), 'balanceUpdated');
      updateAmountUnit(root);
    }).catch(() => {
      if (root.__tradeTag !== state) return;
      setMessage(root.querySelector('.balance-state'), 'balanceUnavailable');
    }).finally(() => {
      if (state.balancePending === request) state.balancePending = null;
    });
    state.balancePending = request;
    return request;
  }

  function clearBalanceRefresh(state) {
    if (state?.balanceTimer) clearInterval(state.balanceTimer);
    if (state) state.balanceTimer = 0;
  }

  function startBalanceRefresh(root) {
    const state = root.__tradeTag;
    clearBalanceRefresh(state);
    state.balanceTimer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshWalletBalances(root, { force: true, quiet: true });
    }, 20_000);
  }

  function unitsFromBalance(value, decimals) {
    const text = String(value ?? '0');
    if (!/^\d+(?:\.\d+)?$/.test(text) || !Number.isInteger(decimals) || decimals < 0 || decimals > 30) return 0n;
    const [whole, fraction = ''] = text.split('.');
    return BigInt(whole) * (10n ** BigInt(decimals)) + BigInt((fraction + '0'.repeat(decimals)).slice(0, decimals) || '0');
  }

  function inputAmountFromUnits(value, decimals) {
    const raw = BigInt(value).toString().padStart(decimals + 1, '0');
    if (!decimals) return raw;
    const whole = raw.slice(0, -decimals) || '0';
    const fraction = raw.slice(-decimals).replace(/0+$/, '');
    return fraction ? `${whole}.${fraction}` : whole;
  }

  async function applyBalanceAmount(root, percent) {
    const state = root.__tradeTag;
    const token = state?.selectedToken;
    if (!state?.wallet || !token) { showError(root, new Error(message('quoteConnect'))); return; }
    if (!state.balances || Date.now() - (state.balanceAt || 0) > 12_000) await refreshWalletBalances(root, { force: true, quiet: true });
    const balance = state.mode === 'buy' ? state.balances?.stable : state.balances?.token;
    const decimals = state.mode === 'buy' ? inputTokens[token.chainId]?.decimals : Number(token.decimals);
    if (!balance || !Number.isInteger(decimals)) { showError(root, new Error(message('balanceUnavailable'))); return; }
    const amount = unitsFromBalance(balance.amount, decimals) * BigInt(percent) / 100n;
    if (amount <= 0n) { showError(root, new Error(message('balanceUnavailable'))); return; }
    const input = root.querySelector('.amount input');
    input.value = inputAmountFromUnits(amount, decimals);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  async function getQuote(root) {
    const state = root.__tradeTag;
    const token = state?.selectedToken;
    if (!token) { showError(root, new Error(message('quoteSelect'))); return; }
    if (!state.wallet || state.wallet.chainId !== token.chainId) { showError(root, new Error(message('quoteConnect'))); return; }
    const isBuy = state.mode === 'buy';
    refreshWalletBalances(root, { force: true, quiet: true });
    const inputToken = isBuy ? inputTokens[token.chainId] : token;
    const outputToken = isBuy ? token : inputTokens[token.chainId];
    if (!inputToken || !outputToken) { showError(root, new Error(message('unsupportedPair'))); return; }
    const button = root.querySelector('.quote-button');
    root.querySelector('.error').hidden = true;
    button.disabled = true; setMessage(button, 'quoting');
    root.querySelector('.trade').disabled = true;
    try {
      const amount = toBaseUnits(root.querySelector('.amount input').value, inputToken.decimals);
      const response = await sendMessage({ type: 'XTC_TRADE_QUOTE', params: {
        binanceChainId: token.chainId, amount,
        fromTokenAddress: inputToken.address, toTokenAddress: outputToken.address,
        userWalletAddress: state.wallet.address
      } });
      const routes = Array.isArray(response?.data) ? response.data : [];
      if (!routes.length) throw new Error(message('noQuote'));
      const route = routes[0];
      if (!route.quoteId) throw new Error(message('missingQuoteId'));
      state.quote = { route, amount, inputToken, outputToken, isBuy };
      state.quoteAt = Date.now();
      const estimated = formatUnits(route.toTokenAmount, Number(route.toToken?.decimal ?? outputToken.decimals));
      root.querySelector('.quote b').removeAttribute('data-tt-key');
      root.querySelector('.quote b').textContent = `${estimated} ${route.toToken?.tokenSymbol || outputToken.symbol}${route.priceImpactPercent ? message('impact', { value: route.priceImpactPercent }) : ''}`;
      setMessage(root.querySelector('.availability'), 'bestRoute', { vendor: route.vendorName || 'Binance Web3' });
      root.querySelector('.trade').disabled = false;
      setMessage(root.querySelector('.trade'), 'tradeToken', { verb: message(isBuy ? 'buy' : 'sell'), token: token.symbol || message('defaultToken') });
    } catch (error) { state.quote = null; showError(root, error); }
    finally { button.disabled = false; setMessage(button, 'refreshQuote'); }
  }

  async function executeTrade(root) {
    const state = root.__tradeTag;
    if (!state?.quote || !state.wallet) { showError(root, new Error(message('quoteConnect'))); return; }
    if (Date.now() - state.quoteAt > 25_000) { showError(root, new Error(message('quoteExpired'))); state.quote = null; root.querySelector('.trade').disabled = true; return; }
    const button = root.querySelector('.trade');
    state.busy = true;
    button.disabled = true; setMessage(button, 'building');
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
      if (payload?.executionMode === 'RFQ') throw new Error(message('rfq'));
      const tx = payload?.tx;
      let walletTransaction;
      if (state.wallet.chainId === 'CT_501') {
        const serialized = typeof tx === 'string' ? tx : tx?.serializedTransaction || tx?.transaction || tx?.swapTransaction || tx?.data;
        if (typeof serialized !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(serialized)) throw new Error(message('invalidSolana'));
        walletTransaction = { serializedTransaction: serialized, expectedAddress: state.wallet.address };
      } else {
        if (!tx?.to || !tx?.data) throw new Error(message('incompleteEvm'));
        const approvalResponse = await sendMessage({ type: 'XTC_TRADE_APPROVE', params: {
          binanceChainId: state.wallet.chainId, tokenContractAddress: inputToken.address,
          approveAmount: amount
        } });
        const approvalTx = Array.isArray(approvalResponse?.data) ? approvalResponse.data[0] : null;
        if (!approvalTx?.dexContractAddress || !approvalTx?.data) throw new Error(message('invalidApproval'));
        walletTransaction = {
          expectedAddress: state.wallet.address,
          swap: { from: state.wallet.address, to: tx.to, data: tx.data, value: tx.value || '0', gas: tx.gas, gasPrice: tx.gasPrice },
          approval: { tokenAddress: inputToken.address, spender: approvalTx.dexContractAddress, amount, tx: approvalTx }
        };
      }
      setMessage(button, 'walletConfirm');
      const result = await sendMessage({ type: 'XTC_WALLET_TRADE', chainId: state.wallet.chainId, transaction: walletTransaction });
      const hash = result.transactionId;
      const explorer = explorerUrl(state.wallet.chainId, hash);
      root.querySelector('.quote b').replaceChildren(document.createTextNode(message('txSubmitted')));
      const link = document.createElement('a'); link.href = explorer; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = shortAddress(hash); root.querySelector('.quote b').append(link);
      setMessage(root.querySelector('.availability'), 'walletSent');
      state.quote = null;
      button.textContent = message('walletSent');
      [1800, 6500].forEach((delay) => setTimeout(() => refreshWalletBalances(root, { force: true, quiet: true }), delay));
    } catch (error) { showError(root, error); button.disabled = false; setMessage(button, 'retry'); }
    finally { state.busy = false; }
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

  function draw(root, rows) {
    const candles = rows.length && Array.isArray(rows[0]) ? rows : [];
    const values = candles.length ? candles.map((row) => Number(row?.[3])).filter(Number.isFinite) : rows.map(Number).filter(Number.isFinite);
    if (values.length < 2) return;
    const svg = root.querySelector(".chart svg");
    const ns = "http://www.w3.org/2000/svg";
    const grid = root.querySelector(".chart-grid");
    const xAxis = root.querySelector(".chart-x-axis");
    const yAxis = root.querySelector(".chart-y-axis");
    const current = root.querySelector(".chart-current");
    grid.replaceChildren(); xAxis.replaceChildren(); yAxis.replaceChildren(); current.replaceChildren();
    const plot = { left: 12, right: 298, top: 12, bottom: 112 };
    const min = Math.min(...values), max = Math.max(...values), span = max - min || Math.max(Math.abs(max) * 0.02, 1e-12);
    const y = (value) => plot.bottom - ((value - min) / span) * (plot.bottom - plot.top);
    const coords = values.map((value, index) => `${plot.left + (index / (values.length - 1)) * (plot.right - plot.left)},${y(value)}`);
    const line = `M ${coords.join(" L ")}`;
    root.querySelector(".line").setAttribute("d", line);
    root.querySelector(".area").setAttribute("d", `${line} L ${plot.right},${plot.bottom} L ${plot.left},${plot.bottom} Z`);
    const make = (tag, attrs, text) => {
      const element = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
      if (text !== undefined) element.textContent = text;
      return element;
    };
    for (let tick = 0; tick < 3; tick++) {
      const value = max - (span * tick) / 2;
      const yy = plot.top + ((plot.bottom - plot.top) * tick) / 2;
      grid.append(make("line", { x1: plot.left, x2: plot.right, y1: yy, y2: yy, class: "chart-grid-line" }));
      yAxis.append(make("text", { x: 356, y: yy + 4, "text-anchor": "end", class: "chart-axis-label" }, formatPrice(value)));
    }
    const timeAt = (index) => {
      const row = candles[Math.round((index / 4) * (candles.length - 1))];
      const raw = row?.[5] ?? row?.[0];
      let date = raw ? new Date(Number(raw) > 1e12 ? Number(raw) : Number(raw) * 1000) : null;
      if (!date || !Number.isFinite(date.getTime())) date = new Date(String(raw || ""));
      if (Number.isFinite(date.getTime())) return new Intl.DateTimeFormat(preferences.language === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
      return index === 4 ? (preferences.language === "zh" ? "现在" : "Now") : `${24 - index * 6}h`;
    };
    for (let tick = 0; tick < 5; tick++) {
      const xx = plot.left + ((plot.right - plot.left) * tick) / 4;
      xAxis.append(make("text", { x: xx, y: 140, "text-anchor": tick === 0 ? "start" : tick === 4 ? "end" : "middle", class: "chart-axis-label" }, timeAt(tick)));
    }
    const lastY = y(values.at(-1));
    current.append(make("rect", { x: 304, y: Math.max(3, Math.min(112, lastY - 9)), width: 50, height: 18, rx: 3, class: "chart-last-bg" }));
    current.append(make("text", { x: 329, y: Math.max(16, Math.min(125, lastY + 4)), "text-anchor": "middle", class: "chart-last-label" }, formatPrice(values.at(-1))));
  }

  mount();
  document.addEventListener("mouseover", onPageMouseOver, true);
  document.addEventListener("mouseout", onPageMouseOut, true);
  document.addEventListener("click", onPageClick, true);
  document.addEventListener("scroll", () => {
    const card = document.getElementById(hostId)?.shadowRoot?.querySelector(".card");
    if (!card?.hidden) positionCard();
  }, { capture: true, passive: true });
  window.addEventListener("resize", () => {
    const card = document.getElementById(hostId)?.shadowRoot?.querySelector(".card");
    if (!card?.hidden) positionCard();
  }, { passive: true });
  const observer = new MutationObserver(() => { clearTimeout(window.__xtcScan); window.__xtcScan = setTimeout(scan, 350); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();


