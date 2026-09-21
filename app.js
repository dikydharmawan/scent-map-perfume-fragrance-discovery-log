// Sample Seed Data (Diurai otomatis jika LocalStorage kosong)
const SAMPLE_DATA = [
  { id: '1', name: 'Baccarat Rouge 540', brand: 'Maison Francis Kurkdjian', family: 'Oriental', rating: 5, status: 'Own It', notes: 'Warm saffron, cedarwood, and sweet ambergris. Iconic projection.', createdAt: 1 },
  { id: '2', name: 'Santal 33', brand: 'Le Labo', family: 'Woody', rating: 4, status: 'Tried', notes: 'Smoky papyrus, violet, leather, and creamy sandalwood.', createdAt: 2 },
  { id: '3', name: 'Bleu de Chanel', brand: 'Chanel', family: 'Fresh', rating: 5, status: 'Own It', notes: 'Crisp grapefruit, mint, and incense wood. Ultra-versatile.', createdAt: 3 },
  { id: '4', name: 'Philosykos', brand: 'Diptyque', family: 'Fresh', rating: 4, status: 'Want It', notes: 'Fresh green fig leaves, coconut, and milky bark.', createdAt: 4 },
  { id: '5', name: 'Tobacco Vanille', brand: 'Tom Ford', family: 'Spicy', rating: 5, status: 'Want It', notes: 'Opulent tobacco leaf, sweet vanilla, cocoa, and dried fruits.', createdAt: 5 },
  { id: '6', name: 'Aventus', brand: 'Creed', family: 'Citrus', rating: 4, status: 'Tried', notes: 'Pineapple, smoky birch, and bergamot.', createdAt: 6 }
];

let fragrances = [];
let currentRating = 5;
let activeDetailId = null;

// DOM Elements
const grid = document.getElementById('scent-grid');
const searchInput = document.getElementById('search-input');
const familyFilter = document.getElementById('family-filter');
const statusFilter = document.getElementById('status-filter');
const sortSelect = document.getElementById('sort-select');

// Modals
const formModal = document.getElementById('form-modal');
const detailModal = document.getElementById('detail-modal');
const confirmModal = document.getElementById('confirm-modal');
const scentForm = document.getElementById('scent-form');

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  initBackgroundCanvas();
  render();
});

function loadData() {
  const stored = localStorage.getItem('scent_map_data');
  if (stored) {
    try { 
      fragrances = JSON.parse(stored); 
      if (!Array.isArray(fragrances)) throw new Error();
    } catch (e) { 
      fragrances = [...SAMPLE_DATA]; 
    }
  } else {
    fragrances = [...SAMPLE_DATA];
    saveData();
  }
}

function saveData() {
  localStorage.setItem('scent_map_data', JSON.stringify(fragrances));
}

function render() {
  updateSummary();
  
  const query = searchInput.value.toLowerCase().trim();
  const family = familyFilter.value;
  const status = statusFilter.value;
  const sort = sortSelect.value;

  let filtered = fragrances.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(query) || f.brand.toLowerCase().includes(query);
    const matchesFamily = family === 'All' || f.family === family;
    const matchesStatus = status === 'All' || f.status === status;
    return matchesSearch && matchesFamily && matchesStatus;
  });

  filtered.sort((a, b) => {
    if (sort === 'rating-desc') return b.rating - a.rating;
    if (sort === 'name-asc') return a.name.localeCompare(b.name);
    return b.createdAt - a.createdAt;
  });

  grid.innerHTML = '';
  const emptyState = document.getElementById('empty-state');

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    if (fragrances.length === 0) {
      document.getElementById('empty-title').textContent = "Your Collection is Empty";
      document.getElementById('empty-message').textContent = "Start adding your favorite fragrances or restore default sample data.";
    } else {
      document.getElementById('empty-title').textContent = "No Scents Found";
      document.getElementById('empty-message').textContent = "Try adjusting your filters or search terms.";
    }
  } else {
    emptyState.classList.add('hidden');
    filtered.forEach(f => grid.appendChild(createCard(f)));
  }
}

function createCard(f) {
  const card = document.createElement('article');
  card.className = 'card';
  card.tabIndex = 0;
  
  const noses = '👃'.repeat(f.rating);
  const statusClass = f.status === 'Own It' ? 'own' : (f.status === 'Want It' ? 'want' : '');

  card.innerHTML = `
    <div>
      <div class="card-header">
        <span class="card-title">${escapeHtml(f.name)}</span>
        <button type="button" class="badge click-badge" style="${getFamilyStyle(f.family)}" aria-label="Filter by ${f.family}">${f.family}</button>
      </div>
      <div class="card-brand">${escapeHtml(f.brand)}</div>
      <p class="card-notes">${escapeHtml(f.notes || 'No tasting notes added.')}</p>
    </div>
    <div class="card-footer">
      <span class="rating-noses" aria-label="${f.rating} out of 5 noses">${noses}</span>
      <span class="badge-status ${statusClass}">${f.status}</span>
    </div>
  `;

  // Quick-Filter pada Badge Scent Family
  const familyBadge = card.querySelector('.click-badge');
  familyBadge.onclick = (e) => {
    e.stopPropagation();
    familyFilter.value = f.family;
    render();
    showToast(`Filtered by family: ${f.family}`);
  };

  card.onclick = () => openDetail(f.id);
  card.onkeydown = (e) => { if (e.key === 'Enter') openDetail(f.id); };

  return card;
}

function updateSummary() {
  document.getElementById('stat-total').textContent = fragrances.length;
  document.getElementById('stat-owned').textContent = fragrances.filter(f => f.status === 'Own It').length;
  document.getElementById('stat-want').textContent = fragrances.filter(f => f.status === 'Want It').length;
}

function getFamilyStyle(family) {
  const key = family.toLowerCase();
  return `background-color: var(--fam-${key}); color: var(--fam-${key}-t); border: none; cursor: pointer;`;
}

function setupEventListeners() {
  searchInput.oninput = render;
  familyFilter.onchange = render;
  statusFilter.onchange = render;
  sortSelect.onchange = render;

  document.getElementById('add-btn').onclick = () => openForm();
  document.getElementById('close-modal').onclick = closeForm;
  document.getElementById('cancel-form').onclick = closeForm;
  document.getElementById('close-detail').onclick = () => detailModal.classList.add('hidden');

  // Global Keyboard Handler (Accessibility)
  window.onkeydown = (e) => {
    if (e.key === 'Escape') {
      closeForm();
      detailModal.classList.add('hidden');
      confirmModal.classList.add('hidden');
    }
  };

  setupRatingPicker();

  // Handle Form Submit
  scentForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('entry-id').value;
    const name = document.getElementById('scent-name').value.trim();
    const brand = document.getElementById('scent-brand').value.trim();
    const family = document.getElementById('scent-family').value;
    const status = document.getElementById('scent-status').value;
    const notes = document.getElementById('scent-notes').value.trim();

    if (!name || !brand) {
      showToast('Name and Brand are required!');
      return;
    }

    if (id) {
      const idx = fragrances.findIndex(f => f.id === id);
      if (idx !== -1) {
        fragrances[idx] = { ...fragrances[idx], name, brand, family, status, rating: currentRating, notes };
        showToast('Fragrance updated!');
      }
    } else {
      const newEntry = {
        id: Date.now().toString(),
        name, brand, family, status,
        rating: currentRating,
        notes,
        createdAt: Date.now()
      };
      fragrances.unshift(newEntry);
      showToast('Fragrance added!');
    }

    saveData();
    closeForm();
    render();
  };

  // Custom Delete Handlers (Bebas dari confirm bawaan browser)
  document.getElementById('delete-entry-btn').onclick = () => {
    confirmModal.classList.remove('hidden');
  };

  document.getElementById('cancel-delete-btn').onclick = () => {
    confirmModal.classList.add('hidden');
  };

  document.getElementById('confirm-delete-btn').onclick = () => {
    if (activeDetailId) {
      fragrances = fragrances.filter(f => f.id !== activeDetailId);
      saveData();
      confirmModal.classList.add('hidden');
      detailModal.classList.add('hidden');
      render();
      showToast('Fragrance deleted.');
    }
  };

  // Edit Button Action
  document.getElementById('edit-entry-btn').onclick = () => {
    const f = fragrances.find(item => item.id === activeDetailId);
    detailModal.classList.add('hidden');
    if (f) openForm(f);
  };

  // Quick Status Toggle Button
  const quickStatusBtn = document.getElementById('quick-status-btn');
  if (quickStatusBtn) {
    quickStatusBtn.onclick = () => {
      const f = fragrances.find(item => item.id === activeDetailId);
      if (!f) return;
      const statuses = ['Tried', 'Own It', 'Want It'];
      const nextIndex = (statuses.indexOf(f.status) + 1) % statuses.length;
      f.status = statuses[nextIndex];
      saveData();
      openDetail(f.id);
      render();
      showToast(`Status changed to: ${f.status}`);
    };
  }

  // Restore Sample Data Actions
  const restoreDataHandler = () => {
    fragrances = [...SAMPLE_DATA];
    saveData();
    render();
    showToast('Sample collection restored!');
  };

  document.getElementById('reset-data-btn').onclick = restoreDataHandler;
  document.getElementById('footer-reset-btn').onclick = restoreDataHandler;
}

function setupRatingPicker() {
  const spans = document.querySelectorAll('#rating-picker span');
  spans.forEach(span => {
    span.onclick = () => {
      currentRating = parseInt(span.dataset.value);
      updateRatingPickerUI();
    };
  });
}

function updateRatingPickerUI() {
  const spans = document.querySelectorAll('#rating-picker span');
  spans.forEach(span => {
    const val = parseInt(span.dataset.value);
    span.classList.toggle('active', val <= currentRating);
  });
  document.getElementById('scent-rating').value = currentRating;
}

function openForm(entry = null) {
  scentForm.reset();
  if (entry) {
    document.getElementById('modal-title').textContent = 'Edit Fragrance';
    document.getElementById('entry-id').value = entry.id;
    document.getElementById('scent-name').value = entry.name;
    document.getElementById('scent-brand').value = entry.brand;
    document.getElementById('scent-family').value = entry.family;
    document.getElementById('scent-status').value = entry.status;
    document.getElementById('scent-notes').value = entry.notes;
    currentRating = entry.rating;
  } else {
    document.getElementById('modal-title').textContent = 'Add Fragrance';
    document.getElementById('entry-id').value = '';
    currentRating = 5;
  }
  updateRatingPickerUI();
  formModal.classList.remove('hidden');
}

function closeForm() {
  formModal.classList.add('hidden');
}

function openDetail(id) {
  const f = fragrances.find(item => item.id === id);
  if (!f) return;
  activeDetailId = id;

  document.getElementById('detail-name').textContent = f.name;
  document.getElementById('detail-brand').textContent = f.brand;
  document.getElementById('detail-notes').textContent = f.notes || 'No tasting notes provided.';
  
  const famBadge = document.getElementById('detail-family');
  famBadge.textContent = f.family;
  famBadge.style = getFamilyStyle(f.family);

  document.getElementById('detail-rating').textContent = '👃'.repeat(f.rating);
  document.getElementById('detail-status').textContent = f.status;

  detailModal.classList.remove('hidden');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Lightweight Floating Scent Particles Animation
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  for (let i = 0; i < 25; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speedY: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.4 + 0.1
    });
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(197, 160, 89, ${p.opacity})`;
      ctx.fill();
      p.y -= p.speedY;
      if (p.y < 0) p.y = canvas.height;
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}