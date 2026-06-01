// Horror Movie Database — Script
// Author: Tanzim Hossain Ayon | BRAC University

// ===== STATE =====
let filtered = [...HORROR_MOVIES];
let selectedGenre = 'All';
let currentView = 'grid';
let searchTerm = '';

// ===== PARTICLE CANVAS =====
const pCanvas = document.getElementById('particle-canvas');
const pCtx = pCanvas.getContext('2d');
let pW, pH, particles = [];

function resizeCanvas() {
  pW = pCanvas.width = window.innerWidth;
  pH = pCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(true); }
  reset(init) {
    this.x = Math.random() * pW;
    this.y = init ? Math.random() * pH : pH + 10;
    this.size = Math.random() * 2 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = -(Math.random() * 0.5 + 0.1);
    this.opacity = Math.random() * 0.4 + 0.05;
    this.color = Math.random() > 0.7 ? '#cc0000' : Math.random() > 0.5 ? '#ff1111' : '#8b0000';
    this.life = Math.random() * 300 + 100;
    this.age = 0;
  }
  update() {
    this.x += this.vx; this.y += this.vy; this.age++;
    if (this.y < -10 || this.age > this.life) this.reset(false);
  }
  draw() {
    pCtx.beginPath();
    pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    pCtx.fillStyle = this.color;
    pCtx.globalAlpha = this.opacity * (1 - this.age / this.life);
    pCtx.fill();
  }
}
for (let i = 0; i < 120; i++) particles.push(new Particle());

function animParticles() {
  pCtx.clearRect(0, 0, pW, pH);
  particles.forEach(p => { p.update(); p.draw(); });
  pCtx.globalAlpha = 1;
  requestAnimationFrame(animParticles);
}
animParticles();

// ===== HERO CANVAS =====
const hCanvas = document.getElementById('hero-canvas');
const hCtx = hCanvas.getContext('2d');
let hT = 0;

function resizeHero() {
  hCanvas.width = hCanvas.offsetWidth;
  hCanvas.height = hCanvas.offsetHeight;
}

function animHero() {
  if (!hCanvas.width) { requestAnimationFrame(animHero); return; }
  hCtx.clearRect(0, 0, hCanvas.width, hCanvas.height);
  hT += 0.008;
  // Dripping blood effect on hero canvas
  for (let i = 0; i < 8; i++) {
    const x = (i / 8) * hCanvas.width + Math.sin(hT + i) * 20;
    const dropH = (Math.sin(hT * 0.7 + i * 1.3) * 0.5 + 0.5) * 60 + 10;
    const grad = hCtx.createLinearGradient(0, 0, 0, dropH);
    grad.addColorStop(0, 'rgba(180,0,0,0.6)');
    grad.addColorStop(1, 'rgba(180,0,0,0)');
    hCtx.fillStyle = grad;
    hCtx.beginPath();
    hCtx.ellipse(x, dropH / 2, 3, dropH / 2, 0, 0, Math.PI * 2);
    hCtx.fill();
  }
  // Fog/mist
  for (let i = 0; i < 4; i++) {
    const fg = hCtx.createRadialGradient(
      hCanvas.width * (0.2 + i * 0.2) + Math.sin(hT + i) * 30, hCanvas.height * 0.8,
      0, hCanvas.width * (0.2 + i * 0.2), hCanvas.height, hCanvas.width * 0.25
    );
    fg.addColorStop(0, `rgba(60,0,0,${0.06 + Math.sin(hT + i) * 0.02})`);
    fg.addColorStop(1, 'transparent');
    hCtx.fillStyle = fg;
    hCtx.fillRect(0, 0, hCanvas.width, hCanvas.height);
  }
  requestAnimationFrame(animHero);
}
window.addEventListener('load', () => { resizeHero(); animHero(); });

// ===== BLOOD DRIPS =====
function createBloodDrips() {
  const overlay = document.getElementById('blood-overlay');
  const count = Math.floor(window.innerWidth / 80);
  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div');
    drop.className = 'blood-drop';
    const h = Math.random() * 50 + 20;
    const w = Math.random() * 6 + 3;
    drop.style.cssText = `left:${(i / count) * 100 + Math.random() * 5}%;width:${w}px;--drip-h:${h}px;animation:drip ${1 + Math.random() * 2}s ${Math.random() * 3}s ease-in forwards;`;
    overlay.appendChild(drop);
  }
}
createBloodDrips();

// ===== CURSOR =====
const cur = document.getElementById('cursor');
const curTrail = document.getElementById('cursor-trail');
let mx = 0, my = 0, tx = 0, ty = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
});
function animCursor() {
  tx += (mx - tx) * 0.1; ty += (my - ty) * 0.1;
  curTrail.style.left = tx + 'px'; curTrail.style.top = ty + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();
document.querySelectorAll('button,a,.movie-card,.chip,select,input').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.style.transform = 'translate(-50%,-50%) scale(2.5)'; curTrail.style.transform = 'translate(-50%,-50%) scale(1.8)'; curTrail.style.borderColor = 'rgba(255,0,0,0.6)'; });
  el.addEventListener('mouseleave', () => { cur.style.transform = 'translate(-50%,-50%)'; curTrail.style.transform = 'translate(-50%,-50%)'; curTrail.style.borderColor = 'rgba(200,0,0,0.4)'; });
});

// ===== INIT FILTERS =====
function initFilters() {
  // Stats
  const countries = [...new Set(HORROR_MOVIES.map(m => m.country))];
  const langs = [...new Set(HORROR_MOVIES.map(m => m.language))];
  const genres = ['All', ...new Set(HORROR_MOVIES.map(m => m.genre))].sort();

  document.getElementById('total-count').textContent = HORROR_MOVIES.length;
  document.getElementById('country-count').textContent = countries.length;
  document.getElementById('genre-count').textContent = genres.length - 1;

  // Genre chips
  const chipsEl = document.getElementById('genre-chips');
  genres.forEach(g => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (g === 'All' ? ' active' : '');
    chip.textContent = g;
    chip.onclick = () => { selectedGenre = g; document.querySelectorAll('.chip').forEach(c => c.classList.remove('active')); chip.classList.add('active'); applyFilters(); };
    chipsEl.appendChild(chip);
  });

  // Country dropdown
  const cSelect = document.getElementById('country-filter');
  [...countries].sort().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    cSelect.appendChild(opt);
  });

  // Language dropdown
  const lSelect = document.getElementById('lang-filter');
  [...langs].sort().forEach(l => {
    const opt = document.createElement('option');
    opt.value = l; opt.textContent = l;
    lSelect.appendChild(opt);
  });
}

// ===== SEARCH =====
document.getElementById('search-input').addEventListener('input', function () {
  searchTerm = this.value.toLowerCase().trim();
  document.getElementById('search-clear').style.opacity = searchTerm ? '1' : '0';
  applyFilters();
});
function clearSearch() {
  document.getElementById('search-input').value = '';
  searchTerm = '';
  document.getElementById('search-clear').style.opacity = '0';
  applyFilters();
}

// ===== FILTERS =====
function applyFilters() {
  const country = document.getElementById('country-filter').value;
  const lang = document.getElementById('lang-filter').value;
  const year = document.getElementById('year-filter').value;
  const sort = document.getElementById('sort-filter').value;

  filtered = HORROR_MOVIES.filter(m => {
    if (selectedGenre !== 'All' && m.genre !== selectedGenre) return false;
    if (country && m.country !== country) return false;
    if (lang && m.language !== lang) return false;
    if (year) {
      const y = m.year;
      if (year === '2020s' && !(y >= 2020)) return false;
      if (year === '2010s' && !(y >= 2010 && y < 2020)) return false;
      if (year === '2000s' && !(y >= 2000 && y < 2010)) return false;
      if (year === '1990s' && !(y >= 1990 && y < 2000)) return false;
      if (year === '1980s' && !(y >= 1980 && y < 1990)) return false;
      if (year === 'older' && !(y < 1980)) return false;
    }
    if (searchTerm) {
      const q = searchTerm;
      return m.title.toLowerCase().includes(q) || m.director?.toLowerCase().includes(q) || m.country.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q) || m.language.toLowerCase().includes(q) || m.tags?.some(t => t.includes(q));
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sort === 'year-desc') return b.year - a.year;
    if (sort === 'year-asc') return a.year - b.year;
    if (sort === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  renderMovies();
}

function resetFilters() {
  selectedGenre = 'All';
  document.querySelectorAll('.chip').forEach((c, i) => c.classList.toggle('active', i === 0));
  document.getElementById('country-filter').value = '';
  document.getElementById('lang-filter').value = '';
  document.getElementById('year-filter').value = '';
  document.getElementById('sort-filter').value = 'rating';
  clearSearch();
  applyFilters();
}

// ===== RENDER MOVIES =====
function renderMovies() {
  const container = document.getElementById('movies-container');
  const noResults = document.getElementById('no-results');
  const info = document.getElementById('results-info');

  container.innerHTML = '';
  info.innerHTML = `Showing <span>${filtered.length}</span> of <span>${HORROR_MOVIES.length}</span> horror movies`;

  if (filtered.length === 0) {
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');

  filtered.forEach((movie, idx) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${Math.min(idx * 0.04, 0.5)}s`;
    const stars = '⭐'.repeat(Math.round((movie.rating || 7) / 2));
    card.innerHTML = `
      <div class="card-poster-wrap">
        <div class="card-poster">${movie.poster || '🎬'}</div>
        <div class="card-overlay"></div>
        <div class="card-genre-tag">${movie.genre}</div>
        ${movie.rating ? `<div class="card-rating">⭐ ${movie.rating}</div>` : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${movie.title}</div>
        <div class="card-meta">
          <span>${movie.year}</span>
          <span class="card-country">🌍 ${movie.country}</span>
          <span>${movie.language}</span>
        </div>
      </div>`;
    card.onclick = () => openModal(movie);
    container.appendChild(card);
  });
}

// ===== VIEW TOGGLE =====
function setView(v) {
  currentView = v;
  const container = document.getElementById('movies-container');
  container.classList.toggle('list-view', v === 'list');
  document.getElementById('grid-btn').classList.toggle('active', v === 'grid');
  document.getElementById('list-btn').classList.toggle('active', v === 'list');
}

// ===== MODAL =====
function openModal(movie) {
  document.getElementById('modal-poster').textContent = movie.poster || '🎬';
  document.getElementById('modal-genre').textContent = movie.genre;
  document.getElementById('modal-title').textContent = movie.title;
  document.getElementById('modal-meta').innerHTML = `
    <span>📅 ${movie.year}</span>
    <span>🌍 ${movie.country}</span>
    <span>🗣️ ${movie.language}</span>
    ${movie.director ? `<span>🎬 ${movie.director}</span>` : ''}`;
  document.getElementById('modal-rating').textContent = movie.rating ? `⭐ ${movie.rating}/10` : '';
  document.getElementById('modal-desc').textContent = movie.desc || '';
  document.getElementById('modal-tags').innerHTML = (movie.tags || []).map(t => `<span class="modal-tag">#${t}</span>`).join('');
  const link = document.getElementById('modal-link');
  link.href = movie.imdb || '#';
  link.style.display = movie.imdb ? 'inline-flex' : 'none';
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay') && !e.target.classList.contains('modal-close')) return;
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') { document.getElementById('modal-overlay').classList.add('hidden'); document.body.style.overflow = ''; } });

// ===== INIT =====
initFilters();
applyFilters();
