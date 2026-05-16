/** @param {Element} block The hero block element */
export default function decorate(block) {
  const MP4_RE = /https?:\/\/\S+\.mp4\b/i;

  // --- Detect background from first row ---
  // Hero (Image): row 1 = picture, row 2 = content
  // Hero (Video): row 1 = MP4 link or text URL, row 2 = content
  const firstRow = block.querySelector(':scope > div');
  const videoAnchor = firstRow && [...firstRow.querySelectorAll('a')].find((a) => MP4_RE.test(a.href));
  const videoTextEl = !videoAnchor && firstRow && [...firstRow.querySelectorAll('div, p')].find((el) => MP4_RE.test(el.textContent?.trim()));
  const videoSrc = videoAnchor?.href || videoTextEl?.textContent?.trim().match(MP4_RE)?.[0];

  if (videoSrc) {
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
  } else {
    const pictures = firstRow ? [...firstRow.querySelectorAll('picture')] : [];

    if (pictures.length === 0) {
      block.classList.add('no-image');
    } else if (pictures.length === 1) {
      firstRow.classList.add('hero-img');
    } else {
      const lightPic = pictures[0].closest('div') || firstRow;
      const darkPic = pictures[1].closest('div');
      lightPic.classList.add('hero-img-light');
      if (darkPic) darkPic.classList.add('hero-img-dark');
      if (document.body.classList.contains('dark-scheme') && darkPic) {
        firstRow.insertBefore(darkPic, lightPic);
      }
    }
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
