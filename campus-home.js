const previousPages = {
  school: '/platform.html#events',
  courses: '/programs.html',
  internships: '/platform.html#internships',
  projects: '/platform.html#projects',
  certificates: '/platform.html#certificates',
  portal: '/platform.html#dashboard',
  about: '/about.html'
};
const previousPage = location.hash.slice(1);
if (Object.hasOwn(previousPages, previousPage)) location.replace(previousPages[previousPage]);

const menu = document.querySelector('#menuToggle');
const navigation = document.querySelector('#campus-nav');
const compact = matchMedia('(max-width: 760px)');

function syncMenu() {
  menu.hidden = !compact.matches;
  menu.setAttribute('aria-expanded', 'false');
  navigation.hidden = compact.matches;
}

compact.addEventListener('change', syncMenu);
menu.addEventListener('click', () => {
  navigation.hidden = !navigation.hidden;
  menu.setAttribute('aria-expanded', String(!navigation.hidden));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && compact.matches && !navigation.hidden) {
    syncMenu();
    menu.focus();
  }
});
syncMenu();

const countdown = document.querySelector('[data-december-countdown]');
countdown.hidden = Date.now() >= Date.parse('2026-12-10T00:00:00+05:30');
