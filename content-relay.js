const NAMESPACE = 'ytmusic-grabber-v1';

window.addEventListener('message', (event) => {
  // Security: only accept messages from the same page, with our namespace
  if (event.source !== window) return;
  if (event.data?.__ns !== NAMESPACE) return;
  if (event.data?.action !== 'autoSend') return;

  browser.runtime.sendMessage({ action: 'autoSend', track: event.data.track });
});