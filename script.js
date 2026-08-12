const root = document.documentElement;
const progressBar = document.querySelector('.scroll-progress span');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');
const expandButton = document.querySelector('[data-expand-all]');
const weekCards = [...document.querySelectorAll('.week-card')];
const trackedSections = [...document.querySelectorAll('main section[id], .phase[id]')];
const navLinks = [...document.querySelectorAll('.site-nav a, .phase-nav a')];

root.classList.add('js');

const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  progressBar.style.width = `${progress * 100}%`;
};

let scrollFrame;
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    updateScrollProgress();
    scrollFrame = null;
  });
}, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.dataset.open = String(!isOpen);
});

navigation?.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation.dataset.open = 'false';
});

expandButton?.addEventListener('click', () => {
  const shouldOpen = expandButton.getAttribute('aria-pressed') !== 'true';
  weekCards.forEach(card => { card.open = shouldOpen; });
  expandButton.setAttribute('aria-pressed', String(shouldOpen));
  expandButton.textContent = shouldOpen ? 'Свернуть все' : 'Раскрыть все';
});

document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

const revealHashTarget = () => {
  if (!location.hash) return;
  const target = document.querySelector(location.hash);
  if (target?.matches('details')) target.open = true;
};

window.addEventListener('hashchange', revealHashTarget);
revealHashTarget();

const currentLinks = new Map();
navLinks.forEach(link => {
  const id = link.getAttribute('href')?.slice(1);
  if (!id) return;
  if (!currentLinks.has(id)) currentLinks.set(id, []);
  currentLinks.get(id).push(link);
});

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    const activeId = visible.target.id;

    navLinks.forEach(link => link.removeAttribute('aria-current'));
    currentLinks.get(activeId)?.forEach(link => link.setAttribute('aria-current', 'true'));

    const phase = visible.target.closest('.phase')?.id;
    if (phase) currentLinks.get(phase)?.forEach(link => link.setAttribute('aria-current', 'true'));
  }, { rootMargin: '-22% 0px -62% 0px', threshold: [0, .1, .25] });

  trackedSections.forEach(section => sectionObserver.observe(section));
}

updateScrollProgress();
