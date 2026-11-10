import './style.css';

const app = document.querySelector('#app');
const downloadUrl = import.meta.env.VITE_EXTENSION_DOWNLOAD_URL || '/TradeTag-Preview-v0.4.zip';
const path = window.location.pathname.replace(/\/$/, '');
const page = path.endsWith('/product.html') ? 'product'
  : path.endsWith('/security.html') ? 'security'
    : path.endsWith('/install.html') ? 'install' : 'home';

const pages = {
  home: { title: 'TradeTag — 把代币信息带到时间线旁', description: '在 X 时间线上查看代币信息，并通过币安钱包自主交易。TradeTag 是独立第三方工具。' },
  product: { title: '产品功能 — TradeTag', description: '了解 TradeTag 如何识别代币提及、核对合约信息并交由兼容钱包完成交易。' },
  security: { title: '安全与隐私 — TradeTag', description: '了解 TradeTag 的数据边界、钱包签名流程与交易支持范围。' },
  install: { title: '获取扩展 — TradeTag', description: '获取 TradeTag Chrome 扩展预览版，了解当前版本能力与安装方式。' }
};

document.title = pages[page].title;
document.querySelector('meta[name="description"]')?.setAttribute('content', pages[page].description);

const navItems = [
  ['home', '首页', '/'],
  ['product', '产品功能', '/product.html'],
  ['security', '隐私与安全', '/security.html'],
  ['install', '获取扩展', '/install.html']
];

function header() {
  return `<header class="site-header"><div class="shell header-inner">
    <a class="brand" href="/" aria-label="TradeTag 首页"><img src="/logo.svg" alt=""><span>Trade<span>Tag</span></span></a>
    <button class="menu-toggle" aria-label="打开导航" aria-expanded="false"><span></span><span></span></button>
    <nav class="main-nav" aria-label="主导航">${navItems.map(([key, label, href]) => `<a class="${page === key ? 'active' : ''}" ${page === key ? 'aria-current="page"' : ''} href="${href}">${label}</a>`).join('')}</nav>
    <div class="header-actions"><a class="header-cta" href="/install.html">获取扩展 <span>↗</span></a><button class="language-toggle" type="button" aria-label="切换到英文">EN</button></div>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="shell footer-main">
    <a class="brand" href="/" aria-label="TradeTag 首页"><img src="/logo.svg" alt=""><span>Trade<span>Tag</span></span></a>
    <p>独立第三方工具。TradeTag 与 X、Binance 均无关联或背书。</p>
    <nav aria-label="页脚导航"><a href="/product.html">产品功能</a><a href="/security.html">隐私与安全</a><a href="/install.html">获取扩展</a><a href="https://x.com/TradeTag_Site" target="_blank" rel="noopener noreferrer">官方 X ↗</a></nav>
  </div><div class="shell footer-bottom"><span>© 2026 TradeTag</span><span>数字资产存在风险，请自行核实网络、合约与交易信息。</span></div></footer>`;
}

function syncDemoVideo(language) {
  const video = app.querySelector('.demo-player video');
  if (!video) return;
  const english = language === 'en';
  const source = video.querySelector('source');
  source.src = english ? '/tradetag-demo-en.mp4' : '/tradetag-demo.mp4';
  video.poster = english ? '/tradetag-demo-en-poster.png' : '/tradetag-demo-poster.png';
  video.setAttribute('aria-label', english ? 'TradeTag product demo video' : 'TradeTag 产品操作演示视频');
  video.load();
  const selectedTrack = english ? 1 : 0;
  Array.from(video.textTracks).forEach((track, index) => {
    track.mode = index === selectedTrack ? 'showing' : 'disabled';
  });
}

function home() {
  return `<main>
    <section class="home-hero shell">
      <div class="hero-copy">
        <p class="kicker"><span class="kicker-line"></span> 为 X 时间线打造的代币工具</p>
        <h1>看到代币，<br><span>顺手看清它。</span></h1>
        <p class="hero-lede">TradeTag 把代币信息卡片带到 X 时间线旁。查看资产、网络与可用行情，再由你决定下一步。</p>
        <div class="hero-actions"><a class="primary-link" href="/product.html">了解产品 <span>↗</span></a><a class="quiet-link" href="/security.html">先看隐私与安全 <span>→</span></a></div>
        <div class="hero-footnote"><span class="check-mark">✓</span> 支持范围以币安 Web3 API 路由和币安钱包支持情况为准</div>
      </div>
      <div class="hero-art" role="img" aria-label="深色行情图表视觉">
        <div class="art-caption"><span>TRADETAG / PRODUCT PREVIEW</span><span>01 — 03</span></div>
        <div class="timeline-window">
          <div class="window-head"><span class="window-mark"></span><span>时间线里的代币提及</span><i>···</i></div>
          <div class="post-row"><div class="post-avatar">M</div><div class="post-copy"><div class="post-user">Market notes <span>@marketnotes · 12 分钟</span></div><p>在关注这个地址，先确认链和流动性再做判断。</p><span class="contract-chip">合约地址 <b>7xKX…pump</b><span class="chip-arrow">↗</span></span></div></div>
          <div class="trade-preview">
            <div class="preview-head"><div><span class="preview-label">TRADETAG CARD / 示意</span><h2>资产信息</h2></div><span class="preview-dot"></span></div>
            <div class="asset-line"><div class="asset-symbol">◎</div><div><strong>代币候选</strong><small>Solana · 地址待核对</small></div><span class="asset-state">待确认</span></div>
            <div class="chart-surface"><img src="/market-visual.png" alt="" /><div class="chart-status">行情区域 · 接入后显示</div></div>
            <div class="preview-stats"><div><span>网络</span><b>Solana</b></div><div><span>合约</span><b>待核对</b></div><div><span>交易状态</span><b>演示界面</b></div></div>
            <div class="preview-button">连接报价后可继续</div>
          </div>
        </div>
        <div class="art-note">界面示意 · 非实时行情</div>
      </div>
    </section>

    <section class="signal-band"><div class="shell signal-inner"><span>从提及开始</span><i></i><span>合约地址核对</span><i></i><span>查看可用行情</span><i></i><span>钱包自主确认</span></div></section>

    <section class="demo-section shell">
      <div class="demo-heading"><div><p class="kicker">TRADETAG / PRODUCT DEMO</p><h2>从代币提及到钱包确认，<br><span>每一步都清楚。</span></h2></div><p>用一段短片了解 TradeTag 的浏览与交易前核对流程。画面中的行情和钱包确认均为演示，不会发起真实交易。</p></div>
      <div class="demo-player"><video controls preload="none" playsinline poster="/tradetag-demo-poster.png" aria-label="TradeTag 产品操作演示视频"><source src="/tradetag-demo.mp4" type="video/mp4"><track kind="subtitles" src="/tradetag-demo-zh.vtt" srclang="zh-CN" label="简体中文" default><track kind="subtitles" src="/tradetag-demo-en.vtt" srclang="en" label="English">你的浏览器暂不支持视频播放。</video><div class="demo-stamp">PRODUCT WALKTHROUGH <i>·</i> DEMO ONLY</div></div>
      <div class="demo-steps"><span><b>01</b> 识别代币提及</span><i></i><span><b>02</b> 核对资产与行情</span><i></i><span><b>03</b> 查看实时报价</span><i></i><span><b>04</b> 由钱包确认</span></div>
    </section>

    <section class="intro-section shell">
      <div class="section-index">01 <span>PRODUCT IDEA</span></div>
      <div class="intro-content"><div class="section-heading"><h2>不用先猜它<br>是不是热门币。</h2><p>从代币符号进入搜索，也可以粘贴完整合约地址。TradeTag 帮你把识别、查看和核对放在同一条路径上。</p></div>
        <div class="editorial-points"><article><b>01</b><div><h3>覆盖更广的资产发现</h3><p>不只关注 Meme 币。凡是服务路由与钱包支持的资产，都可以进入查询和交易流程。</p></div><span>↗</span></article><article><b>02</b><div><h3>先核对，再看报价</h3><p>同名代币可能对应不同网络和合约。交易前明确展示资产身份与可用状态。</p></div><span>↗</span></article><article><b>03</b><div><h3>最终决定留给你</h3><p>每次交易都需要你检查交易内容，并在本地钱包中确认签名。</p></div><span>↗</span></article></div>
      </div>
    </section>

    <section class="home-security"><div class="shell security-strip"><div class="security-icon">✓</div><div><p class="kicker">WALLET-FIRST BY DESIGN</p><h2>你的钱包，你来确认。</h2><p>我们不托管资产，也不保存私钥、助记词或交易签名。连接与签名由你安装的币安钱包扩展处理。</p></div><a href="/security.html">查看安全说明 <span>↗</span></a></div></section>

    <section class="closing shell"><div><p class="kicker">TRADETAG / CHROME EXTENSION</p><h2>在浏览时，<br>多一点上下文。</h2><p>实时搜索、价格、K 线与报价已接入；交易构建与钱包签名仍需在兼容钱包中验证。</p></div><a class="primary-link" href="/install.html">查看获取方式 <span>↗</span></a></section>
  </main>`;
}

function product() {
  return `<main class="subpage">
    <section class="page-hero shell"><div class="section-index">TRADETAG / PRODUCT</div><div class="page-hero-content"><p class="kicker">PRODUCT OVERVIEW</p><h1>让代币提及，<br><span>多一层可读信息。</span></h1><p>TradeTag 是为 X 浏览体验设计的 Chrome 扩展。它把资产查询和交易前核对，放进一张轻量信息卡片里。</p></div><div class="page-hero-aside"><img src="/logo.svg" alt=""><span>TRADE<br>WITH CONTEXT</span></div></section>
    <section class="product-flow"><div class="shell"><div class="section-topline"><p class="kicker">HOW IT WORKS</p><span>01 — 03</span></div><h2>一条清楚的<br>交易前路径。</h2><div class="flow-list"><article><span>01</span><div><h3>从提及或合约开始</h3><p>在 X 上遇到代币符号时进行搜索，也可以直接输入合约地址。Ticker 用于发现候选，不作为唯一资产身份。</p></div><span class="flow-mark">⌕</span></article><article><span>02</span><div><h3>核对网络与资产</h3><p>确认代币名称、链和合约地址。查询到资产、能够获取报价、钱包能够签名，是三个独立状态。</p></div><span class="flow-mark">◈</span></article><article><span>03</span><div><h3>由钱包弹窗完成确认</h3><p>输入金额并检查交易信息后，由兼容的钱包发起签名。你可以在钱包确认窗口中选择批准或拒绝。</p></div><span class="flow-mark">↗</span></article></div></div></section>
    <section class="support-section shell"><div class="support-intro"><p class="kicker">SUPPORTED ASSETS</p><h2>不限于 Meme。<br><span>以钱包支持为界。</span></h2></div><div class="support-copy"><p>TradeTag 面向多类型链上代币。实际能否查询、报价与交易，取决于币安 Web3 API 是否提供对应市场或路由，以及币安钱包是否支持该网络和交易。</p><div class="support-rule"><b>可查询</b><span>资产数据可用</span><i>→</i><b>可报价</b><span>存在交易路由</span><i>→</i><b>可确认</b><span>钱包支持该网络</span></div><small>不承诺覆盖所有链或所有资产；卡片会分别说明当前状态。</small></div></section>
    <section class="product-cta"><div class="shell product-cta-inner"><div><p class="kicker">NEXT STEP</p><h2>先了解数据与签名边界。</h2></div><a class="primary-link" href="/security.html">查看隐私与安全 <span>↗</span></a></div></section>
  </main>`;
}

function security() {
  return `<main class="subpage">
    <section class="page-hero shell security-page-hero"><div class="section-index">TRADETAG / SECURITY</div><div class="page-hero-content"><p class="kicker">PRIVACY & CONTROL</p><h1>交易由你发起，<br><span>签名留在钱包。</span></h1><p>TradeTag 不托管用户资产。登录、交易复核与签名由用户本地安装的币安钱包扩展处理。</p></div><div class="security-seal"><div>YOUR<br><b>WALLET</b><br>YOUR CALL</div><span>LOCAL CONFIRMATION</span></div></section>
    <section class="privacy-block"><div class="shell privacy-layout"><div><p class="kicker">DATA BOUNDARY</p><h2>密钥留在钱包，<br>地址只用于构建交易。</h2><p class="privacy-lead">TradeTag 不读取或保存登录资料、私钥、助记词或签名。构建交易时，公开钱包地址会经网关临时传给币安 Web3 API；TradeTag 不记录或持久化该地址。</p></div><div class="privacy-list"><article><span>01</span><div><h3>钱包登录</h3><p>通过你安装的币安钱包扩展连接和管理。私钥、助记词和登录凭据不会提供给 TradeTag。</p></div></article><article><span>02</span><div><h3>交易签名与广播</h3><p>由币安钱包展示并请求你的确认，再使用钱包管理的官方默认 RPC 签名和广播。TradeTag 不接收签名。</p></div></article><article><span>03</span><div><h3>地址用途</h3><p>币安 Web3 API 构建交易时需要公开钱包地址，以生成匹配当前钱包的交易。网关仅在请求处理中转，不写入日志或存储。</p></div></article><article><span>04</span><div><h3>资产托管</h3><p>TradeTag 不托管资金，也不替你持有或转移资产。市场数据和交易路由由币安 Web3 API 提供。</p></div></article></div></div></section>
    <section class="security-note shell"><span>!</span><p><b>请自行核实每笔交易。</b>确认网络、代币合约、金额、滑点、费用和预计到账数量。链上交易可能无法撤销，资产价格也可能快速变化。</p></section>
    <section class="security-faq shell"><p class="kicker">COMMON QUESTIONS</p><h2>常见问题</h2><details><summary>TradeTag 是币安官方产品吗？<span>+</span></summary><p>不是。TradeTag 是独立第三方工具，与 Binance 无关联或背书。币安钱包作为用户选择的钱包，由用户本地安装并操作。</p></details><details><summary>TradeTag 能交易所有链上代币吗？<span>+</span></summary><p>不能保证。资产必须有可用的查询或交易路由，且网络需受钱包支持。卡片会分别说明当前资产能否查询、报价和交易。</p></details><details><summary>TradeTag 会接触哪些钱包信息？<span>+</span></summary><p>私钥、助记词、登录凭据和交易签名由币安钱包保管，TradeTag 不读取或保存。构建交易时，公开钱包地址会经网关临时发送给币安 Web3 API，网关不记录或持久化。</p></details></section>
  </main>`;
}

function install() {
  const ready = Boolean(downloadUrl);
  return `<main class="subpage">
    <section class="page-hero install-page-hero shell"><div class="section-index">TRADETAG / INSTALL</div><div class="page-hero-content"><p class="kicker">CHROME EXTENSION</p><h1>把 TradeTag<br><span>带到你的时间线。</span></h1><p>公开预览版已连接币安 Web3 API，可查询代币、价格、K 线并获取报价；交易由你安装的币安钱包确认。</p></div><div class="install-card"><img src="/TradeTag-X-Avatar.png" alt="TradeTag 图标"><div><b>TradeTag for Chrome</b><span>公开预览版 · v0.4</span></div><span class="install-state">PUBLIC PREVIEW</span></div></section>
    <section class="install-section"><div class="shell install-layout"><div><p class="kicker">GET STARTED</p><h2>下载并安装扩展</h2><p>网关地址和公开预览访问配置已内置，不需要填写币安 API 凭证。请先安装并解锁币安钱包，再从 X 上的代币卡片发起操作。</p>${ready ? `<a class="primary-link" href="${downloadUrl}" download>下载 TradeTag 扩展 <span>↓</span></a>` : `<span class="disabled-link">下载包准备中 <span>·</span></span>`}<p class="store-note">当前通过网站下载 ZIP；尚未上架 Chrome Web Store，需要在 Chrome 开发者模式中加载。</p></div><div class="install-steps"><article><b>01</b><div><h3>下载并解压</h3><p>下载 ZIP 后解压到电脑上容易找到的位置。</p></div></article><article><b>02</b><div><h3>在 Chrome 加载</h3><p>打开 chrome://extensions，开启开发者模式，选择“加载已解压的扩展程序”。</p></div></article><article><b>03</b><div><h3>连接币安钱包</h3><p>打开 TradeTag 扩展检查网关连接，然后在 X 上连接官方币安钱包。API 访问配置已内置。</p></div></article></div></div></section>
    <section class="install-callout shell"><div class="callout-mark">i</div><div><b>公开预览版</b><p>可用资产和交易路由取决于币安 Web3 API 与币安钱包支持情况。每笔交易仍需你在钱包中复核并确认。</p></div><a href="/product.html">查看产品功能 ↗</a></section>
  </main>`;
}

const content = ({ home, product, security, install })[page]();
app.innerHTML = `${header()}${content}${footer()}`;

const chineseMarkup = app.innerHTML;
const englishText = {
  '首页':'Home','产品功能':'Product','隐私与安全':'Privacy & Security','获取扩展':'Get the extension',
  '打开导航':'Open navigation','主导航':'Main navigation','TradeTag 首页':'TradeTag home','切换到英文':'Switch to English','切换到中文':'Switch to Chinese',
  '独立第三方工具。TradeTag 与 X、Binance 均无关联或背书。':'An independent third-party tool. TradeTag is not affiliated with or endorsed by X or Binance.',
  '官方 X ↗':'Official X ↗','数字资产存在风险，请自行核实网络、合约与交易信息。':'Digital assets involve risk. Verify the network, contract, and transaction details yourself.',
  '为 X 时间线打造的代币工具':'A TOKEN TOOL BUILT FOR THE X TIMELINE','看到代币，':'Spot a token,','顺手看清它。':'understand it at a glance.',
  'TradeTag 把代币信息卡片带到 X 时间线旁。查看资产、网络与可用行情，再由你决定下一步。':'TradeTag brings token context alongside your X timeline. Check the asset, network, and available market data, then decide what to do next.',
  '了解产品':'Explore the product','先看隐私与安全':'Privacy & security first','查看隐私与安全':'Read privacy & security','查看产品功能':'View product features','支持范围以币安 Web3 API 路由和币安钱包支持情况为准':'Availability depends on Binance Web3 API routes and Binance Wallet support',
  '时间线里的代币提及':'A token mention on the timeline','在关注这个地址，先确认链和流动性再做判断。':'Watching this address. Check the network and liquidity before making a decision.',
  '合约地址':'Contract','代币候选':'Token candidate','Solana · 地址待核对':'Solana · address to verify','待确认':'To verify','行情区域 · 接入后显示':'Market data appears when connected',
  '网络':'Network','合约':'Contract','交易状态':'Trade status','演示界面':'Preview','连接报价后可继续':'Connect a quote to continue','界面示意 · 非实时行情':'Interface preview · not live market data',
  '资产信息':'Asset details','示意':'Preview','12 分钟':'12 min ago','待核对':'To verify','代币提及':'Token mention',
  '从提及开始':'Start with a mention','合约地址核对':'Verify the contract','查看可用行情':'Check available market data','钱包自主确认':'Confirm in your wallet',
  '不用先猜它':'No need to guess','是不是热门币。':'whether it is trending.',
  '从代币符号进入搜索，也可以粘贴完整合约地址。TradeTag 帮你把识别、查看和核对放在同一条路径上。':'Search by token symbol or paste a full contract address. TradeTag brings discovery, review, and verification into one flow.',
  '覆盖更广的资产发现':'Discover a wider range of assets','不只关注 Meme 币。凡是服务路由与钱包支持的资产，都可以进入查询和交易流程。':'Not just meme coins. Assets can enter the lookup and trading flow when routes are available and the wallet supports the network.',
  '先核对，再看报价':'Verify before getting a quote','同名代币可能对应不同网络和合约。交易前明确展示资产身份与可用状态。':'Tokens with the same name may use different networks and contracts. Review the asset identity and availability before trading.',
  '最终决定留给你':'You make the final call','每次交易都需要你检查交易内容，并在本地钱包中确认签名。':'Review every transaction and confirm its signature in your local wallet.',
  '你的钱包，你来确认。':'Your wallet. Your decision.','我们不托管资产，也不保存私钥、助记词或交易签名。连接与签名由你安装的币安钱包扩展处理。':'We do not custody assets or store private keys, recovery phrases, or signatures. You connect and sign through the Binance Wallet extension you install.',
  '查看安全说明':'Read the security details','在浏览时，':'Browse with','多一点上下文。':'more context.','实时搜索、价格、K 线与报价已接入；交易构建与钱包签名仍需在兼容钱包中验证。':'Live token search, prices, candles, and quotes are connected. Swap building and wallet signing still need verification with a compatible wallet.','查看获取方式':'See how to get it',
  'TRADETAG / PRODUCT DEMO':'TRADETAG / PRODUCT DEMO','从代币提及到钱包确认，':'From a token mention to wallet review,','每一步都清楚。':'see each step clearly.','用一段短片了解 TradeTag 的浏览与交易前核对流程。画面中的行情和钱包确认均为演示，不会发起真实交易。':'See how TradeTag fits into browsing and pre-trade review. Market data and wallet screens in this video are illustrative; no real transaction is submitted.','你的浏览器暂不支持视频播放。':'Your browser does not support video playback.','识别代币提及':'Find a token mention','核对资产与行情':'Review asset details','查看实时报价':'Get a live quote','由钱包确认':'Confirm in your wallet',
  'PRODUCT OVERVIEW':'PRODUCT OVERVIEW','让代币提及，':'Give token mentions','多一层可读信息。':'a clearer context.',
  'TradeTag 是为 X 浏览体验设计的 Chrome 扩展。它把资产查询和交易前核对，放进一张轻量信息卡片里。':'TradeTag is a Chrome extension for browsing X. It brings asset lookup and pre-trade checks into a lightweight card.',
  '一条清楚的':'A clear','交易前路径。':'path before you trade.','从提及或合约开始':'Start with a mention or contract','在 X 上遇到代币符号时进行搜索，也可以直接输入合约地址。Ticker 用于发现候选，不作为唯一资产身份。':'Search when you see a token symbol on X, or enter a contract address directly. A ticker helps find candidates; it does not uniquely identify an asset.',
  '核对网络与资产':'Verify the network and asset','确认代币名称、链和合约地址。查询到资产、能够获取报价、钱包能够签名，是三个独立状态。':'Check the token name, chain, and contract address. Asset lookup, quote availability, and wallet signing are separate states.',
  '由钱包弹窗完成确认':'Confirm in your wallet','输入金额并检查交易信息后，由兼容的钱包发起签名。你可以在钱包确认窗口中选择批准或拒绝。':'Enter an amount and review the transaction. A compatible wallet will request your signature, and you can approve or reject it in the confirmation window.',
  '不限于 Meme。':'Beyond meme coins.','以钱包支持为界。':'Bounded by wallet support.','TradeTag 面向多类型链上代币。实际能否查询、报价与交易，取决于币安 Web3 API 是否提供对应市场或路由，以及币安钱包是否支持该网络和交易。':'TradeTag is designed for many types of on-chain tokens. Lookup, quotes, and swaps depend on Binance Web3 API data or routes and Binance Wallet support for the network and transaction.',
  '可查询':'Lookup','资产数据可用':'Asset data available','可报价':'Quote','存在交易路由':'Route available','可确认':'Confirm','钱包支持该网络':'Wallet supports network','不承诺覆盖所有链或所有资产；卡片会分别说明当前状态。':'Not every chain or asset is guaranteed. The card shows the availability of each step.','先了解数据与签名边界。':'Understand data and signing boundaries first.',
  'PRIVACY & CONTROL':'PRIVACY & CONTROL','交易由你发起，':'You initiate the trade,','签名留在钱包。':'your signature stays in your wallet.',
  'TradeTag 不托管用户资产。登录、交易复核与签名由用户本地安装的币安钱包扩展处理。':'TradeTag does not custody user assets. Sign-in, transaction review, and signing are handled by the Binance Wallet extension installed locally by the user.',
  '密钥留在钱包，':'Keys stay in your wallet,','地址只用于构建交易。':'your address is used to build the transaction.',
  'TradeTag 不读取或保存登录资料、私钥、助记词或签名。构建交易时，公开钱包地址会经网关临时传给币安 Web3 API；TradeTag 不记录或持久化该地址。':'TradeTag does not access or store login credentials, private keys, recovery phrases, or signatures. To build a transaction, the public wallet address is temporarily sent through the gateway to Binance Web3 API; TradeTag does not log or persist it.',
  '钱包登录':'Wallet connection','通过你安装的币安钱包扩展连接和管理。私钥、助记词和登录凭据不会提供给 TradeTag。':'Connect and manage your wallet through the Binance Wallet extension you install. TradeTag does not receive your private keys, recovery phrase, or login credentials.',
  '交易签名与广播':'Transaction signing and broadcast','由币安钱包展示并请求你的确认，再使用钱包管理的官方默认 RPC 签名和广播。TradeTag 不接收签名。':'Binance Wallet presents the transaction for your approval, then signs and broadcasts it through its official default RPC. TradeTag never receives the signature.',
  '地址用途':'How your address is used','币安 Web3 API 构建交易时需要公开钱包地址，以生成匹配当前钱包的交易。网关仅在请求处理中转，不写入日志或存储。':'Binance Web3 API needs your public wallet address to build a transaction for that wallet. The gateway only forwards it while processing the request and does not log or store it.',
  '资产托管':'Asset custody','TradeTag 不托管资金，也不替你持有或转移资产。市场数据和交易路由由币安 Web3 API 提供。':'TradeTag does not custody, hold, or transfer your funds. Market data and trade routes are provided by Binance Web3 API.',
  '请自行核实每笔交易。':'Review every transaction carefully.','确认网络、代币合约、金额、滑点、费用和预计到账数量。链上交易可能无法撤销，资产价格也可能快速变化。':'Check the network, token contract, amount, slippage, fees, and estimated output. On-chain transactions may be irreversible, and asset prices can change quickly.',
  '常见问题':'Frequently asked questions','TradeTag 是币安官方产品吗？':'Is TradeTag an official Binance product?','不是。TradeTag 是独立第三方工具，与 Binance 无关联或背书。币安钱包作为用户选择的钱包，由用户本地安装并操作。':'No. TradeTag is an independent third-party tool with no affiliation with or endorsement from Binance. Users install and operate Binance Wallet locally as their chosen wallet.',
  'TradeTag 能交易所有链上代币吗？':'Can TradeTag trade every on-chain token?','不能保证。资产必须有可用的查询或交易路由，且网络需受钱包支持。卡片会分别说明当前资产能否查询、报价和交易。':'Not guaranteed. An asset needs available lookup or trade routes, and its network must be supported by the wallet. The card shows whether lookup, quotes, and trading are available.',
  'TradeTag 会接触哪些钱包信息？':'What wallet information does TradeTag access?','私钥、助记词、登录凭据和交易签名由币安钱包保管，TradeTag 不读取或保存。构建交易时，公开钱包地址会经网关临时发送给币安 Web3 API，网关不记录或持久化。':'Binance Wallet holds your private keys, recovery phrase, login credentials, and transaction signatures; TradeTag does not access or store them. To build a transaction, your public address is temporarily sent through the gateway to Binance Web3 API and is not logged or persisted.',
  'CHROME EXTENSION':'CHROME EXTENSION','把 TradeTag':'Bring TradeTag','带到你的时间线。':'to your timeline.',
  '公开预览版已连接币安 Web3 API，可查询代币、价格、K 线并获取报价；交易由你安装的币安钱包确认。':'The public preview connects to Binance Web3 API for token search, prices, candles, and quotes. Your installed Binance Wallet handles transaction confirmation.',
  '公开预览版 · v0.4':'Public preview · v0.4','PUBLIC PREVIEW':'PUBLIC PREVIEW','下载并安装扩展':'Download and install the extension','网关地址和公开预览访问配置已内置，不需要填写币安 API 凭证。请先安装并解锁币安钱包，再从 X 上的代币卡片发起操作。':'The gateway and public preview access configuration are built in; you do not need Binance API credentials. Install and unlock Binance Wallet, then start from a token card on X.','当前通过网站下载 ZIP；尚未上架 Chrome Web Store，需要在 Chrome 开发者模式中加载。':'The ZIP is currently downloaded from this website and is not listed on the Chrome Web Store. Load it in Chrome Developer mode.',
  '下载 TradeTag 扩展':'Download TradeTag extension','下载包准备中':'Preparing download','下载并解压':'Download and unzip','下载 ZIP 后解压到电脑上容易找到的位置。':'Download the ZIP and extract it to an easy-to-find folder on your computer.',
  '在 Chrome 加载':'Load it in Chrome','打开 chrome://extensions，开启开发者模式，选择“加载已解压的扩展程序”。':'Open chrome://extensions, turn on Developer mode, and choose “Load unpacked”.',
  '连接币安钱包':'Connect Binance Wallet','打开 TradeTag 扩展检查网关连接，然后在 X 上连接官方币安钱包。API 访问配置已内置。':'Open TradeTag and check the gateway connection, then connect Binance Wallet on X. API access is built in.',
  '公开预览版':'Public preview','可用资产和交易路由取决于币安 Web3 API 与币安钱包支持情况。每笔交易仍需你在钱包中复核并确认。':'Available assets and routes depend on Binance Web3 API and Binance Wallet support. Review and confirm every transaction in your wallet.'
};

function setLanguage(language) {
  app.innerHTML = chineseMarkup;
  if (language === 'en') {
    const walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const original = node.nodeValue.trim();
      if (englishText[original]) node.nodeValue = node.nodeValue.replace(original, englishText[original]);
      else {
        for (const [chinese, english] of Object.entries(englishText).sort(([left], [right]) => right.length - left.length)) {
          if (node.nodeValue.includes(chinese)) node.nodeValue = node.nodeValue.replaceAll(chinese, english);
        }
      }
    }
    document.documentElement.lang = 'en';
    document.title = ({home:'TradeTag — Token context for your X timeline',product:'Product — TradeTag',security:'Privacy & Security — TradeTag',install:'Get the extension — TradeTag'})[page];
    document.querySelector('meta[name="description"]')?.setAttribute('content', ({home:'Review token context on X and trade through your own Binance Wallet.',product:'Learn how TradeTag identifies token mentions and checks assets before trading.',security:'Learn how TradeTag handles data, wallet signing, and supported trading.',install:'Get the TradeTag Chrome extension preview and installation guide.'})[page]);
  } else {
    document.documentElement.lang = 'zh-CN';
    document.title = pages[page].title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', pages[page].description);
  }
  const toggle = document.querySelector('.language-toggle');
  toggle.textContent = language === 'en' ? '中文' : 'EN';
  toggle.setAttribute('aria-label', language === 'en' ? 'Switch to Chinese' : '切换到英文');
  document.querySelectorAll('.brand').forEach((brand) => brand.setAttribute('aria-label', language === 'en' ? 'TradeTag home' : 'TradeTag 首页'));
  document.querySelector('.main-nav')?.setAttribute('aria-label', language === 'en' ? 'Main navigation' : '主导航');
  document.querySelector('.footer-main nav')?.setAttribute('aria-label', language === 'en' ? 'Footer navigation' : '页脚导航');
  document.querySelector('.hero-art')?.setAttribute('aria-label', language === 'en' ? 'Market chart interface preview' : '深色行情图表视觉');
  document.querySelector('.menu-toggle')?.setAttribute('aria-label', language === 'en' ? 'Open navigation' : '打开导航');
  document.querySelector('.install-card img')?.setAttribute('alt', language === 'en' ? 'TradeTag icon' : 'TradeTag 图标');
  syncDemoVideo(language);
  document.querySelector('.menu-toggle')?.addEventListener('click', (event) => {
    const menu = event.currentTarget;
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    document.querySelector('.main-nav')?.classList.toggle('open', open);
  });
  toggle.addEventListener('click', () => {
    const next = language === 'en' ? 'zh' : 'en';
    localStorage.setItem('tradetag-language', next);
    setLanguage(next);
  });
}

setLanguage(localStorage.getItem('tradetag-language') === 'en' ? 'en' : 'zh');
