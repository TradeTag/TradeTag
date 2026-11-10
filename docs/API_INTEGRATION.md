# API 与安全接入说明

## 信任边界

```text
X 内容脚本 / 扩展 UI
        │ chrome.runtime 消息
        ▼
扩展 Service Worker ── HTTPS ── 可信 API 网关
        │                           │
        │ 本地钱包 provider         └── Binance Web3 API 签名请求
        ▼
币安钱包扩展（用户确认）
```

扩展是用户可下载、可检查的客户端。任何写入扩展资源、配置或存储的 API Secret 都可被提取。币安文档要求请求头包含 `X-OC-APIKEY`、`X-OC-TIMESTAMP`、`X-OC-SIGN`，签名由服务端持有的**产品 API 凭证**生成，因此鉴权只能放在受控后端。公开预览包中的网关访问令牌是可提取的公开客户端标识，不是秘密；服务端必须限流和监测滥用。币安产品 API 凭证绝不进入扩展。产品不收集或持久化登录资料、私钥、助记词或用户签名；币安 `/swap` 构建交易时要求提供公开的 `userWalletAddress`，该地址会经 TradeTag 网关短暂传给币安 Web3 API，网关不写入日志或存储。

## 扩展与网关约定

公开预览版预置 TradeTag HTTPS 网关地址和公开客户端访问令牌；私有部署可使用独立的访问密钥。当前网关固定提供：

- `GET /v1/token/search`
- `GET /v1/market/token-info` 和 `GET /v1/market/candles`
- `GET /v1/trade/quote`、`GET /v1/trade/swap`、`GET /v1/trade/approve`

公开预览 ZIP 中的客户端令牌可被提取，不是秘密；网关按 IP 与全局限流。私有部署访问密钥与币安 Web3 API Secret 分开保存。用户无需设置 RPC；钱包使用自己的默认 RPC。

不要接受任意上游 URL、任意 Binance 路径或由客户端传入的签名头；网关应固定上游主机和允许调用的路径，并校验参数长度、链 ID 和合约地址。

## Binance Web3 API

官方入口：<https://web3.binance.com/en/dev-docs>

文档列出的路径以 `https://web3.binance.com/build` 为根，例如：

- `GET /api/v1/dex/market/token/search`
- `GET /api/v1/dex/market/price`
- `GET /api/v1/dex/market/candles`
- `POST /api/v1/dex/market/token/basic-info`
- `POST /api/v1/dex/market/token/price-info`
- Trading API 报价、构建交易、报价并构建交易接口

已按官方 API 文档核验 HTTP 方法、参数、签名原文规则和响应字段。行情、报价和交易构建均由网关签名后转发；代币报价的 `quoteId` 有效期约 30 秒，过期时必须重新报价。

Solana 链标识为 `CT_501`。产品 API 凭证必须保存在受控服务器环境中，不可放入扩展 ZIP。新服务器已配置凭证并启用网关；代币搜索、详情/价格、K 线和交易报价已通过线上接口验证。交易构建和币安钱包签名仍需端到端验证。

## 钱包边界

- Solana：仅在检测到 Binance Wallet 的 Wallet Standard `solana:signAndSendTransaction` 能力后启用；钱包使用其官方默认 RPC 签名并广播。
- EVM：使用 EIP-1193 或 EIP-6963 发现 Binance Wallet provider，按用户选定链检查 chainId，通过钱包的默认 RPC 提交。
- 不读取助记词、私钥或钱包内部存储。
- 将未签名交易交给钱包前，显示链、代币、方向、金额、滑点及费用摘要。
- EVM ERC-20 授权和兑换分别由钱包确认并提交；扩展不要求用户填写 RPC，也不自行向 RPC 广播。
- 交易浏览器链接按链生成。

## 发布前配置

1. 已在受控后端配置 Binance Web3 API 凭证；密钥不放在扩展包中。
2. 已部署受限 API 网关；公开扩展使用内置的公开客户端令牌，私有部署令牌不得放入公开扩展。
3. 已实现缓存、节流和错误映射；仍需在 Binance Wallet 中验证交易构建、授权、拒绝和失败场景。
4. 配置 Chrome Web Store 下载地址及隐私政策 URL。

## 部署状态

- 网站：<https://tradetag.site>
- 网关：`https://www.tradetag.site/v1/*`，由 Nginx 转发至本机 `127.0.0.1:8787`；`/health` 需携带公开预览客户端令牌。
- Node 服务以 `www-data` 运行；币安 API Key/Secret 保存在服务器 `/opt/tradetag/gateway/.env`，仅 root 与服务组可读。
- 网关访问令牌保存在服务器环境文件中；公开预览 ZIP 中预置相同的公开客户端令牌，因此不可将其视作秘密。当前限制为每 IP 每分钟 90 次、全局每分钟 600 次，计数仅保存在内存中。
- 已验证 Binance API 代币搜索、代币详情/价格、K 线和报价；尚未通过真实钱包签名或广播交易。
