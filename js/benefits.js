(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('.header');
  const burger = document.querySelector('.burger');

  /* ---------- 1. Масштаб: мобильный макет 430 ---------- */
  const fit = () => {
    const w = root.clientWidth;
    document.body.style.zoom = w < 768 ? String(w / 430) : '';
  };
  fit();
  window.addEventListener('resize', () => { fit(); if (root.clientWidth >= 768) closeMenu(); });

  /* ---------- 2. Мобильное меню ---------- */
  function closeMenu() {
    header.classList.remove('is-menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = header.classList.toggle('is-menu-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  header.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', (e) => {
    if (header.classList.contains('is-menu-open') && !e.target.closest('.header')) closeMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
})();
