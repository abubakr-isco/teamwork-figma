(() => {
  'use strict';
  const root = document.documentElement;
  const page = document.getElementById('page');
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const lang = document.getElementById('lang');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Масштаб: макет 1440 (десктоп) и 430 (мобильный) ---------- */
  const fit = () => {
    const w = root.clientWidth;
    let z = 1;
    if (w < 768) z = w / 430;          // мобильный макет 430
    else if (w < 1440) z = w / 1440;   // десктопный макет 1440
    page.style.zoom = z === 1 ? '' : String(z);
  };
  fit();
  window.addEventListener('resize', () => { fit(); if (root.clientWidth >= 768) closeMenu(); });

  /* ---------- 2. Ссылки-заглушки не прыгают наверх ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* ---------- 3. Мобильное меню ---------- */
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
  document.getElementById('menu').addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', (e) => {
    if (header.classList.contains('is-menu-open') && !e.target.closest('#menu')) closeMenu();
  });

  /* ---------- 4. Выбор языка ---------- */
  const langBtn = lang.querySelector('.lang__btn');
  const langText = lang.querySelector('.lang__text');
  const setLang = (code) => {
    langText.textContent = code;
    lang.querySelectorAll('li').forEach((li) => li.setAttribute('aria-selected', String(li.dataset.lang === code)));
    root.setAttribute('data-lang', code);
    try { localStorage.setItem('tespack-lang', code); } catch (_) {}
  };
  try { const saved = localStorage.getItem('tespack-lang'); if (saved) setLang(saved); } catch (_) {}
  const toggleLang = (open) => {
    lang.classList.toggle('is-open', open);
    langBtn.setAttribute('aria-expanded', String(open));
  };
  langBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleLang(!lang.classList.contains('is-open')); });
  lang.querySelectorAll('li').forEach((li) => li.addEventListener('click', () => { setLang(li.dataset.lang); toggleLang(false); }));
  document.addEventListener('click', (e) => { if (!e.target.closest('#lang')) toggleLang(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { toggleLang(false); closeMenu(); } });

  /* ---------- 5. «Оставить заявку» → плавный скролл к форме и фокус ---------- */
  document.querySelectorAll('[data-scroll-form]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const form = document.getElementById('form');
      form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => form.querySelector('input').focus({ preventScroll: true }), reduce ? 0 : 600);
    });
  });

  /* ---------- 6. FAQ: аккордеон ---------- */
  document.querySelectorAll('.faq-item__q button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- 7. Форма: маска телефона, проверка, отправка ---------- */
  const form = document.getElementById('ctaForm');
  const nameInput = form.elements.name;
  const phoneInput = form.elements.phone;
  const submitBtn = form.querySelector('.cta__submit');
  const submitLabel = submitBtn.textContent;

  // +998 XX XXX XX XX
  const formatPhone = (value) => {
    let d = value.replace(/\D/g, '');
    if (d.startsWith('998')) d = d.slice(3);
    d = d.slice(0, 9);
    if (!d.length) return '';
    let out = '+998 ' + d.slice(0, 2);
    if (d.length > 2) out += ' ' + d.slice(2, 5);
    if (d.length > 5) out += ' ' + d.slice(5, 7);
    if (d.length > 7) out += ' ' + d.slice(7, 9);
    return out;
  };
  phoneInput.addEventListener('input', () => { phoneInput.value = formatPhone(phoneInput.value); phoneInput.classList.remove('is-error'); });
  phoneInput.addEventListener('focus', () => { if (!phoneInput.value) phoneInput.value = '+998 '; });
  phoneInput.addEventListener('blur', () => { if (phoneInput.value.replace(/\D/g, '') === '998') phoneInput.value = ''; });
  nameInput.addEventListener('input', () => nameInput.classList.remove('is-error'));

  const flash = (text, ms = 2800) => {
    submitBtn.textContent = text;
    setTimeout(() => { submitBtn.textContent = submitLabel; submitBtn.disabled = false; }, ms);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameOk = nameInput.value.trim().length >= 2;
    const phoneOk = phoneInput.value.replace(/\D/g, '').length === 12;
    nameInput.classList.toggle('is-error', !nameOk);
    phoneInput.classList.toggle('is-error', !phoneOk);
    if (!nameOk) return nameInput.focus();
    if (!phoneOk) return phoneInput.focus();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка…';
    const payload = { name: nameInput.value.trim(), phone: phoneInput.value };
    const endpoint = form.dataset.endpoint; // сюда можно подставить URL бэкенда / Telegram-бота
    try {
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('bad status');
      } else {
        await new Promise((r) => setTimeout(r, 600)); // пока бэкенда нет — имитация отправки
      }
      form.reset();
      flash('Заявка отправлена ✓');
    } catch (_) {
      flash('Ошибка, попробуйте ещё раз');
    }
  });

  /* ---------- 8. Анимации появления при скролле ---------- */
  const items = [...document.querySelectorAll('.reveal')];
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
  } else {
    // небольшая задержка соседям, чтобы они появлялись каскадом
    document.querySelectorAll('.faq__col').forEach((col) => [...col.querySelectorAll('.reveal')].forEach((el, i) => el.style.setProperty('--d', i * 0.08 + 's')));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
    header.classList.add('anim-in');
  }
})();
