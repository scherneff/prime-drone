function stripUEAttrs(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return node;
  [...node.attributes].forEach((a) => { if (a.name.startsWith('data-aue')) node.removeAttribute(a.name); });
  [...node.children].forEach(stripUEAttrs);
  return node;
}

function syncRow(row) {
  const [questionCell, answerCell] = row.children;
  const button = row.querySelector('.faq-question');
  const answerWrap = row.querySelector('.faq-answer');
  if (!button || !answerWrap || !questionCell || !answerCell) return;

  const heading = questionCell.querySelector('h2,h3,h4,p');
  button.textContent = (heading?.textContent || questionCell.textContent).trim() || 'Add new question';

  answerWrap.innerHTML = '';
  if (answerCell.textContent.trim()) {
    [...answerCell.childNodes].forEach((n) => answerWrap.append(stripUEAttrs(n.cloneNode(true))));
  } else {
    const p = document.createElement('p');
    p.textContent = 'Add new answer';
    answerWrap.append(p);
  }
}

function decorateRow(row) {
  if (row.classList.contains('faq-item')) return;
  const [questionCell, answerCell] = row.children;
  if (!questionCell || !answerCell) return;

  row.classList.add('faq-item');
  questionCell.hidden = true;
  answerCell.hidden = true;

  const button = document.createElement('button');
  button.className = 'faq-question';
  button.setAttribute('aria-expanded', 'false');

  const answerWrap = document.createElement('div');
  answerWrap.className = 'faq-answer';
  answerWrap.hidden = true;

  row.append(button, answerWrap);
  syncRow(row);

  const cellObs = new MutationObserver(() => syncRow(row));
  cellObs.observe(questionCell, { childList: true, subtree: true, characterData: true });
  cellObs.observe(answerCell, { childList: true, subtree: true, characterData: true });

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    answerWrap.hidden = expanded;
  });
}

export default function decorate(block) {
  [...block.children].forEach(decorateRow);

  const blockObs = new MutationObserver((mutations) => {
    const rowsToDecorate = new Set();
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.parentElement === block) rowsToDecorate.add(node);
        else if (node.parentElement?.parentElement === block) rowsToDecorate.add(node.parentElement);
      });
    });
    rowsToDecorate.forEach(decorateRow);
  });
  blockObs.observe(block, { childList: true, subtree: true });
}
