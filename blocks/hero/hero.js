/** @param {Element} block The hero block element */
export default function decorate(block) {
  const MP4_RE = /https?:\/\/\S+\.mp4\b/i;
  const rows = [...block.querySelectorAll(':scope > div')];

  // Block structure (3 rows):
  //   Row 1 (videoRow)  — MP4 URL as text or link
  //   Row 2 (imageRow)  — background image (picture element)
  //   Row 3 (contentRow)— heading, tagline, body, CTA
  const [videoRow, imageRow, contentRow] = rows;

  // --- Row 1: Video URL ---
  const videoAnchor = videoRow?.querySelector('a');
  const videoText = videoRow?.textContent?.trim();
  const videoSrc = (videoAnchor && MP4_RE.test(videoAnchor.href) ? videoAnchor.href : null)
    || (videoText && MP4_RE.test(videoText) ? videoText.match(MP4_RE)[0] : null);

  if (videoSrc) {
    const video = document.createElement('video');
    video.className = 'hero-video';
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('disablepictureinpicture', '');
    video.append(Object.assign(document.createElement('source'), { src: videoSrc, type: 'video/mp4' }));

    videoRow.innerHTML = '';
    videoRow.classList.add('hero-video-wrap');
    videoRow.append(video);
    block.classList.add('has-video');

    // Hide unused image row
    if (imageRow) imageRow.hidden = true;
  } else {
    // Hide empty video row
    if (videoRow) videoRow.hidden = true;

    // --- Row 2: Background image ---
    const pictures = imageRow ? [...imageRow.querySelectorAll('picture')] : [];

    if (pictures.length === 0) {
      if (imageRow) imageRow.hidden = true;
      block.classList.add('no-image');
    } else if (pictures.length === 1) {
      imageRow.classList.add('hero-img');
    } else {
      // Two images: first = light, second = dark
      const lightPic = pictures[0].closest('div') || imageRow;
      const darkPic = pictures[1].closest('div');
      lightPic.classList.add('hero-img-light');
      if (darkPic) darkPic.classList.add('hero-img-dark');
      if (document.body.classList.contains('dark-scheme') && darkPic) {
        imageRow.insertBefore(darkPic, lightPic);
      }
    }
  }

  // --- Row 3: Content — tagline is the paragraph before h1 ---
  const h1 = (contentRow || block).querySelector('h1');
  if (!h1) return;

  const contentDiv = h1.closest('div');
  if (!contentDiv) return;

  [...contentDiv.children].forEach((el, i, arr) => {
    if (el !== h1 && arr.indexOf(h1) > i && el.tagName === 'P' && !el.classList.contains('button-container')) {
      el.classList.add('hero-tagline');
    }
  });
}
