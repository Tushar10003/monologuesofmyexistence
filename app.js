(() => {
  const grid = document.getElementById('blogGrid');
  const emptyState = document.getElementById('emptyState');
  const toolbar = document.getElementById('libraryToolbar');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const resultCount = document.getElementById('resultCount');
  const navBlogList = document.getElementById('navBlogList');
  const menuToggle = document.getElementById('menuToggle');
  const primaryNav = document.getElementById('primaryNav');
  const navLibrary = document.getElementById('navLibrary');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let posts = [];

  document.getElementById('year').textContent = new Date().getFullYear();

  const safeText = (value, fallback = '') => typeof value === 'string' ? value : fallback;
  const safePath = (value, fallback) => {
    const path = safeText(value, fallback).trim();
    // Keep assets local to this site; reject absolute URLs and traversal paths.
    if (!path || path.startsWith('/') || path.includes('..') || /^[a-z]+:/i.test(path)) return fallback;
    return path;
  };
  const formatDate = (value) => {
    if (!value) return 'A RECENT PAGE';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return safeText(value).toUpperCase();
    return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).toUpperCase();
  };
  const makeElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function buildNavList(items) {
    navBlogList.replaceChildren();
    if (!items.length) {
      navBlogList.append(makeElement('p', 'nav-empty', 'Your published blogs will appear here.'));
      return;
    }
    items.forEach((post) => {
      const link = document.createElement('a');
      link.className = 'nav-blog-item';
      link.href = post.pdf;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', `Open PDF: ${post.title}`);
      const image = document.createElement('img');
      image.src = post.cover;
      image.alt = '';
      image.loading = 'lazy';
      image.onerror = () => { image.src = 'assets/cover-default.svg'; };
      const copy = document.createElement('span');
      const title = makeElement('span', 'nav-blog-title', post.title);
      const meta = makeElement('span', 'nav-blog-meta', post.category || 'MONOLOGUE');
      copy.append(title, meta);
      link.append(image, copy);
      navBlogList.append(link);
    });
  }

  function makeBlogCard(post, index) {
    const article = makeElement('article', 'blog-card');
    article.style.animationDelay = `${Math.min(index * 85, 510)}ms`;
    const link = document.createElement('a');
    link.className = 'blog-card-link';
    link.href = post.pdf;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', `Read ${post.title} in PDF format`);

    const coverWrap = makeElement('div', 'blog-cover-wrap');
    const image = makeElement('img', 'blog-cover');
    image.src = post.cover;
    image.alt = `Cover image for ${post.title}`;
    image.loading = 'lazy';
    image.onerror = () => { image.onerror = null; image.src = 'assets/cover-default.svg'; };
    const overlay = makeElement('div', 'cover-overlay');
    overlay.append(makeElement('span', 'cover-category', post.category || 'MONOLOGUE'), makeElement('span', 'cover-arrow', '↗'));
    coverWrap.append(image, overlay);

    const info = makeElement('div', 'blog-info');
    const meta = makeElement('div', 'blog-meta');
    meta.append(makeElement('span', '', formatDate(post.published)), makeElement('span', 'meta-dot', '•'), makeElement('span', '', post.readTime || 'PDF EDITION'));
    const title = makeElement('h3', 'blog-title', post.title);
    const excerpt = makeElement('p', 'blog-excerpt', post.excerpt || 'A page from the ongoing story.');
    info.append(meta, title, excerpt);
    link.append(coverWrap, info);
    article.append(link);
    return article;
  }

  function render(items) {
    grid.replaceChildren();
    if (!posts.length) {
      toolbar.hidden = true;
      emptyState.hidden = false;
      resultCount.textContent = '';
      return;
    }
    toolbar.hidden = false;
    emptyState.hidden = true;
    if (!items.length) {
      const noMatch = makeElement('div', 'loading-state');
      noMatch.append(makeElement('span', '', 'No pages found.'), makeElement('span', '', 'Try another title or category.'));
      grid.append(noMatch);
    } else {
      items.forEach((post, index) => grid.append(makeBlogCard(post, index)));
    }
    resultCount.textContent = `${items.length} ${items.length === 1 ? 'PAGE' : 'PAGES'}`;
  }

  function filterPosts() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const category = categoryFilter.value;
    const filtered = posts.filter((post) => {
      const haystack = `${post.title} ${post.excerpt} ${post.category}`.toLocaleLowerCase();
      return haystack.includes(query) && (category === 'all' || post.category === category);
    });
    render(filtered);
  }

  function populateCategories(items) {
    const categories = [...new Set(items.map((post) => post.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.append(option);
    });
  }

  function setupReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    targets.forEach((target) => observer.observe(target));
  }

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    primaryNav.classList.toggle('open', !expanded);
  });
  primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    primaryNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }));
  document.addEventListener('click', (event) => {
    if (navLibrary.open && !navLibrary.contains(event.target)) navLibrary.open = false;
  });
  searchInput.addEventListener('input', filterPosts);
  categoryFilter.addEventListener('change', filterPosts);
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === 'Escape') {
      navLibrary.open = false;
      primaryNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  async function loadPosts() {
    try {
      const response = await fetch('blogs.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Could not load blogs.json (${response.status})`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('blogs.json must contain a JSON array.');
      posts = data.map((item) => ({
        title: safeText(item.title, 'Untitled monologue'),
        excerpt: safeText(item.excerpt),
        category: safeText(item.category, 'MONOLOGUE'),
        published: safeText(item.published),
        readTime: safeText(item.readTime, 'PDF EDITION'),
        pdf: safePath(item.pdf, 'pdfs/'),
        cover: safePath(item.cover, 'assets/cover-default.svg')
      })).filter((item) => item.pdf !== 'pdfs/');
      buildNavList(posts);
      populateCategories(posts);
      render(posts);
    } catch (error) {
      grid.replaceChildren();
      const message = makeElement('div', 'loading-state');
      message.append(makeElement('span', '', 'The library could not be loaded.'), makeElement('span', '', 'Check that blogs.json exists and that the site is being opened through a local web server or GitHub Pages.'));
      grid.append(message);
      console.error(error);
    }
  }

  setupReveal();
  loadPosts();
})();
