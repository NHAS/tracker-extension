// popup.js — settings

const DEFAULT_SETTINGS = {
  serviceUrl: 'http://localhost:8080/',
  apiKey: ''
};


function setDot(state) {
  const dot = document.getElementById('dot');
  dot.className = 'dot ' + state;
}

// ── Load settings ──────────────────────────────────────────────────────────
async function loadSettings() {
  console.log("[YTMusic Grabber] fetching settings")
  const stored = await browser.storage.local.get(['serviceUrl', 'apiKey']);
  const s = { ...DEFAULT_SETTINGS, ...stored };
  document.getElementById('service-url').value = s.serviceUrl;
  document.getElementById('api-key').value = s.apiKey;


  const res = await fetch(s.serviceUrl+"/check", {
    method: 'POST',
    headers: { 
      "X-Authorisation": s.apiKey
    }
  });

  const status = document.getElementById("status-text")

  if(res.status != 204) {
    setDot("error")
    status.textContent = res.statusText
    return
  }

  
  setDot("active")
  status.textContent = "Connected!"

}

// ── Save settings ──────────────────────────────────────────────────────────
document.getElementById('btn-save').addEventListener('click', async () => {
  const serviceUrl = document.getElementById('service-url').value.trim();
  const apiKey = document.getElementById('api-key').value.trim();
  const msg = document.getElementById('save-msg');

  if (!serviceUrl) {
    msg.textContent = 'Service URL is required.';
    msg.className = 'fail';
    return;
  }

  if (!apiKey) {
    msg.textContent = 'An API key is required to talk to the service';
    msg.className = 'fail';
    return;
  }

  await browser.storage.local.set({ serviceUrl, apiKey });
  msg.textContent = '✓ Saved';
  msg.className = 'ok';
  setTimeout(() => { msg.textContent = ''; }, 2000);
});

loadSettings();
