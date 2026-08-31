/* ==========================================================================
   Himanshu Vishwakarma — Portfolio
   Progressive-enhancement JS. Everything on this site already works with
   CSS alone (dark mode, mobile nav, project filter); this file layers on
   scroll-based reveals, active-section highlighting, a persisted theme
   preference, and real contact-form validation.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemePersistence();
  initScrollReveal();
  initScrollSpy();
  initMobileNavAutoClose();
  initContactForm();
  initFooterYear();
});

/* --------------------------------------------------------------------
   Theme persistence — remembers dark/light mode across visits.
   The toggle itself is pure CSS (:has()); this just syncs its checked
   state with localStorage so the choice sticks.
   -------------------------------------------------------------------- */
function initThemePersistence() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const STORAGE_KEY = 'hv-portfolio-theme';
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === 'dark') {
    toggle.checked = true;
  } else if (saved === null) {
    // No saved preference yet — respect the visitor's OS setting once.
    toggle.checked = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggle.addEventListener('change', () => {
    localStorage.setItem(STORAGE_KEY, toggle.checked ? 'dark' : 'light');
  });
}

/* --------------------------------------------------------------------
   Scroll reveal — fades/slides elements in as they enter the viewport,
   with a small stagger for groups of siblings (project cards, timeline
   items).
   -------------------------------------------------------------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
    return;
  }

  // Stagger siblings that reveal together (e.g. the three project cards).
  const groups = new Map();
  revealEls.forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  const delayFor = el => {
    const siblings = groups.get(el.parentElement) || [el];
    const index = siblings.indexOf(el);
    return Math.min(index * 90, 360);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      window.setTimeout(() => el.classList.add('is-visible'), delayFor(el));
      obs.unobserve(el);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------
   Scroll spy — highlights the nav link for whichever section is
   currently in view.
   -------------------------------------------------------------------- */
function initScrollSpy() {
  const nav = document.getElementById('main-nav');
  const sections = document.querySelectorAll('main > section[id]');
  if (!nav || !sections.length || !('IntersectionObserver' in window)) return;

  const links = new Map();
  nav.querySelectorAll('a[href^="#"]').forEach(link => {
    links.set(link.getAttribute('href').slice(1), link);
  });

  const setActive = id => {
    links.forEach(link => link.classList.remove('active'));
    const active = links.get(id);
    if (active) active.classList.add('active');
  };

  const observer = new IntersectionObserver(entries => {
    // Pick the entry closest to the top of the viewport among visible ones.
    const visible = entries.filter(e => e.isIntersecting);
    if (!visible.length) return;
    visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    setActive(visible[0].target.id);
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

/* --------------------------------------------------------------------
   Mobile nav auto-close — tapping a link closes the slide-down menu
   instead of leaving it open under the section you just jumped to.
   -------------------------------------------------------------------- */
function initMobileNavAutoClose() {
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!navToggle || !nav) return;

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.checked = false;
    });
  });
}

/* --------------------------------------------------------------------
   Contact form — this site has no backend, so "sending" a message
   just validates the fields and shows a clear confirmation. Swap the
   body of the submit handler for a real fetch() call to your endpoint
   or form service (e.g. Formspree) when one is available.
   -------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', event => {
    event.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      showStatus('Please fill in every field before sending.', 'error');
      return;
    }
    if (!emailPattern.test(email)) {
      showStatus('That email address doesn\u2019t look quite right.', 'error');
      return;
    }

    // No backend is wired up yet — this simulates a successful send.
    showStatus(`Thanks, ${name.split(' ')[0]} \u2014 your message is ready to send once a backend is connected.`, 'success');
    form.reset();
  });

  function showStatus(text, kind) {
    status.textContent = text;
    status.classList.remove('is-error', 'is-success');
    status.classList.add(kind === 'error' ? 'is-error' : 'is-success');
  }
}

/* --------------------------------------------------------------------
   Footer year — keeps the copyright line correct without editing HTML.
   -------------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}