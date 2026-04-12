const statusIcon = document.getElementById('status-icon');
const statusValue = document.getElementById('status-value');
const detailValue = document.getElementById('detail-value');
const registerButton = document.getElementById('register');

function setStatus(state, text) {
  const icons = { waiting: '⏳', ready: '🔑', ok: '✓', fail: '✗' };
  statusIcon.textContent = icons[state] || '⏳';
  statusIcon.className = 'status-icon ' + state;
  statusValue.textContent = text;
  statusValue.className = 'value ' + state;
}

function getRegistrationInfo() {
  const raw = location.search || location.hash;
  const match = decodeURIComponent(raw).match(/ext\+ytdl:\/\/[^?]*\??(.*)/);
  if (!match) throw new Error('No registration URI found');
  const params = new URLSearchParams(match[1]);
  const serviceUrl = params.get('url');
  const apiKey = params.get('key');
  if (!serviceUrl) throw new Error('Missing required param: url');
  if (!apiKey) throw new Error('Missing required param: key');
  return { apiKey, serviceUrl };
}

async function register(apiKey, serviceUrl) {
  setStatus('waiting', 'Requesting permissions...');
  try {
    let permissionsServiceName = serviceUrl
    if (!permissionsServiceName.endsWith('/')) {
      permissionsServiceName += '/';
    }

    const granted = await browser.permissions.request({
      permissions: [], origins: [permissionsServiceName]
    });
    if (!granted) throw new Error(`Permissions for ${permissionsServiceName} were not granted`);

    if(serviceUrl.endsWith('/')) {
      serviceUrl = serviceUrl.slice(0, -1)
    }

    await browser.storage.local.set({ serviceUrl, apiKey });
    setStatus('ok', 'Registration successful');
    detailValue.textContent = serviceUrl;
    detailValue.className = 'value';
    registerButton.disabled = true;
    registerButton.textContent = '✓ Done — you may close this tab';
  } catch (err) {
    setStatus('fail', 'Registration failed');
    detailValue.textContent = err.message;
    detailValue.style.color = 'var(--error)';
    console.error('[YTMusic Grabber] Registration error:', err);
  }
}

try {
  const { apiKey, serviceUrl } = getRegistrationInfo();
  detailValue.textContent = serviceUrl;
  detailValue.className = 'value';
  setStatus('ready', 'Ready to register');
  registerButton.removeAttribute('disabled');
  registerButton.addEventListener('click', () => register(apiKey, serviceUrl));
} catch (err) {
  setStatus('fail', 'Failed to parse registration URI');
  detailValue.textContent = err.message;
  detailValue.style.color = 'var(--error)';
  console.error('[YTMusic Grabber] Registration error:', err);
}