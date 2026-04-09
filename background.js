// background.js
const DEFAULT_SETTINGS = {
  serviceUrl: 'http://localhost:8080/',
  payloadField: 'url',
  extraPayload: ''
};

browser.runtime.onMessage.addListener((msg, sender) => {
  // Only accept messages from content scripts (have a tab), not our own broadcasts
  if (!sender.tab) return;

  if (msg.action === 'autoSend') {
    handleAutoSend(msg.track);
  }
});


async function getLastSentVideoId() {
  const result = await browser.storage.session?.get?.('lastSentVideoId').catch(() => null)
    ?? await browser.storage.local.get('lastSentVideoId').catch(() => null);
  return result?.lastSentVideoId ?? null;
}

async function setLastSentVideoId(videoId) {
  // Prefer session storage (cleared on browser close) — fall back to local
  const store = browser.storage.session ?? browser.storage.local;
  await store.set({ lastSentVideoId: videoId }).catch(() => {});
}

async function handleAutoSend(track) {
  if (!track.videoId) return;

  // Deduplicate even if background was suspended and restarted
  const lastId = await getLastSentVideoId();
  if (track.videoId === lastId) return;
  await setLastSentVideoId(track.videoId);

  try {
    const stored = await browser.storage.local.get(['serviceUrl', 'apiKey']);
    const s = { ...DEFAULT_SETTINGS, ...stored };


    const payload = {
      title: track.title,
      artist: track.artist,
      videoId: track.videoId,
    };

    console.log('[YTMusic Grabber] POSTing to', s.serviceUrl, payload);
    const res = await fetch(s.serviceUrl+"/download", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        "X-Authorisation": s.apiKey
      },
      body: JSON.stringify(payload),
    });
    console.log('[YTMusic Grabber] Service responded:', res.status);

  } catch (err) {
    console.error('[YTMusic Grabber] Failed to send:', err.message);
    // On failure, clear the stored ID so the track will retry next time
    await setLastSentVideoId(null);
  }
}