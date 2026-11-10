const apiInput = document.querySelector('#api');
const apiStatus = document.querySelector('#api-status');
const DEFAULT_GATEWAY_URL = 'https://www.tradetag.site';
const PUBLIC_GATEWAY_TOKEN = '064541498da8f6a2bbab56f6603edeed9880b7016f58dbd063a49c739d4b4a60';

function setStatus(element, message, good = false) {
  element.textContent = message;
  element.classList.toggle('error', !good);
  element.classList.toggle('good', good);
}

async function checkGateway() {
  try {
    await chrome.storage.sync.set({ apiBase: DEFAULT_GATEWAY_URL });
    await chrome.storage.local.set({ gatewayToken: PUBLIC_GATEWAY_TOKEN });
    const response = await fetch(new URL('/health', DEFAULT_GATEWAY_URL), {
      headers: { Authorization: `Bearer ${PUBLIC_GATEWAY_TOKEN}` },
      credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(8_000)
    });
    const health = await response.json().catch(() => null);
    if (response.status === 401) throw new Error('内置网关访问配置未通过验证，请联系 TradeTag 支持。');
    if (!response.ok || !health?.ok) throw new Error(health?.message || `无法连接网关（${response.status}）。`);
    if (!health.binanceConfigured) setStatus(apiStatus, '网关已连接，但服务器尚未配置币安 Web3 API Key/Secret。');
    else setStatus(apiStatus, '网关与币安 Web3 API 已连接。', true);
  } catch (error) { setStatus(apiStatus, error.message); }
}

apiInput.value = DEFAULT_GATEWAY_URL;
document.querySelector('#gateway-token').value = '已预置';
document.querySelector('#save-api').addEventListener('click', checkGateway);
checkGateway();
