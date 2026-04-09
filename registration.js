// registration.js — handles ext+ytdl://register?url=...&key=...
(async () => {
  const status = document.getElementById('status');
  const detail = document.getElementById('detail');

  try {
    // Firefox passes the full custom URI as the page's location.href
    // e.g. moz-extension://.../registration.html#ext+ytdl://register?url=...&key=...
    // OR the query string is forwarded — check both.
    const raw = location.search || location.hash;
    
    // Extract the ext+ytdl URI from wherever Firefox put it
    const match = decodeURIComponent(raw).match(/ext\+ytdl:\/\/[^?]*\??(.*)/);
    if (!match) throw new Error('No registration URI found in: ' + raw);

    const params = new URLSearchParams(match[1]);
    const serviceUrl = params.get('url');
    const apiKey     = params.get('key');

    if (!serviceUrl) throw new Error('Missing required param: url');
    if (!apiKey)     throw new Error('Missing required param: key');

    await browser.storage.local.set({ serviceUrl, apiKey });

    status.textContent = '✓ Registration successful! You may now close this tab';
    status.className   = 'ok';
    detail.textContent = `Service URL: ${serviceUrl}`;
  } catch (err) {
    status.textContent = '✗ Registration failed.';
    status.className   = 'fail';
    detail.textContent = err.message;
    console.error('[YTMusic Grabber] Registration error:', err);
  }
})();