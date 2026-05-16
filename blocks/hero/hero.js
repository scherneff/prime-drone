const MP4_RE = /\.mp4(\?|$)/i;
const IMAGE_RE = /\.(avif|webp|jpe?g|png|gif|svg)(\?|$)/i;
const DM_OPENAPI_RE = /\/adobe\/assets\/urn:aaid:aem:[^/?#]+/i;

function isVideoSrc(src) {
  return src && MP4_RE.test(src);
}

// Rewrite a DM Open API URL to its raw MP4 rendition
function dmVideoUrl(src) {
  const match = src.match(/^(https?:\/\/[^/]+\/adobe\/assets\/urn:aaid:aem:[^/?#]+)/i);
  return match ? `${match[1]}/original/as/hero.mp4` : null;
}

/** @param {Element} block The hero block element */
export default function decorate(block) {
  const firstRow = block.querySelector(':scope > div');

  // --- Detect background type from row 1 ---
  // Reference assets render as <picture><img src="...">.
  // If the src is a DM Open API URL and not an image format → rewrite to MP4.
  // If the src already ends in .mp4, or there's an MP4 link/text, use as video.
  const picture = firstRow?.querySelector('picture');
  const imgSrc = picture?.querySelector('img')?.src || '';
  const anchor = firstRow && [...firstRow.querySelectorAll('a')].find((a) => isVideoSrc(a.href));
  const textMatch = !anchor && firstRow?.textContent?.trim().match(/https?:\/\/\S+\.mp4\b/i);

  const isDMAsset = DM_OPENAPI_RE.test(imgSrc);
  const isDMVideo = isDMAsset && !IMAGE_RE.test(imgSrc);

  const videoSrc = (isDMVideo ? dmVideoUrl(imgSrc) : null)
    || (isVideoSrc(imgSrc) ? imgSrc : null)
    || anchor?.href
    || textMatch?.[0];

  if (videoSrc) {
    // --- Video background ---
    const video = document.createElement('video');
    video.className = 'hero-video';
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('disablepictureinpicture', '');
    video.append(Object.assign(document.createElement('source'), { src: videoSrc, type: 'video/mp4' }));

    firstRow.innerHTML = '';
    firstRow.classList.add('hero-video-wrap');
    firstRow.append(video);
    block.classList.add('has-video');
  } else if (picture) {
    // --- Image background ---
    firstRow.classList.add('hero-img');
  } else {
    block.classList.add('no-image');
  }

  // --- Tagline (paragraph before h1) ---
  const h1 = block.querySelector('h1');
  if (!h1) return;

  const contentDiv = h1.closest('div');
  if (!contentDiv) return;

  [...contentDiv.children].forEach((el, i, arr) => {
    if (el !== h1 && arr.indexOf(h1) > i && el.tagName === 'P' && !el.classList.contains('button-container')) {
      el.classList.add('hero-tagline');
    }
  });
}
