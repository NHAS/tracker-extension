// content.js — injected into music.youtube.com
// Watches for track changes and automatically sends them to the yt-dlp service.

let lastSentVideoId = null;
let debounceTimer = null;

const elementName = 'ytmusic-app'
const NAMESPACE = 'ytmusic-grabber-v1';


function getVideoId() {
  console.log("[YTMusic Grabber] fetching track ID")

  const app = document.querySelector(elementName);
  const data = app.playerApi?.getVideoData()

  if (data && data.video_id) {
    return data.video_id
  }

  console.log("[YTMusic Grabber] failed to get video data id: ", data)

  return null;
}

function getCurrentTrack() {


  const app = document.querySelector(elementName);
  const data = app.playerApi?.getVideoData()


  const videoId = getVideoId();
  console.log("[YTMusic Grabber] track ID: ", videoId)


  return {
    title: data?.title.trim() || null,
    artist: data?.author.trim() || null,
    videoId
  };
}

function onTrackChange() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const track = getCurrentTrack();
    if (track.videoId === lastSentVideoId) {
      console.log("[YTMusic Grabber] skipping track")
      return;
    }
    lastSentVideoId = track.videoId;
    console.log('[YTMusic Grabber] New track detected:', track.title, '—', track.artist);
    window.postMessage({ __ns: NAMESPACE, action: 'autoSend', track }, '*');
  }, 800);
}

function startObserver() {
const playerBar = document.querySelector('ytmusic-player-bar');

  const observer = new MutationObserver(onTrackChange);
  observer.observe(playerBar, {
    subtree: true,
    childList: true,
    characterData: false,  // don't watch text node changes — avoids mutation storm
    attributes: false,     // title/artist come from childList, not attribute changes
  });



  onTrackChange();
  console.log('[YTMusic Grabber] Observer active on', playerBar.tagName);
}

function waitForPlayer() {
  const app = document.querySelector(elementName)
  if (app) {
    startObserver();
    return
  }


  const init = new MutationObserver(() => {
    if (document.querySelector(elementName)) {
      init.disconnect();
      startObserver();
    }
  });
  init.observe(document.body, { childList: true, subtree: true });
}



waitForPlayer();


