/**
 * UseWhatYouHave - Homepage Main Controller
 * Mengatur interaksi halaman utama, rendering resep, pencarian, dan pagination
 */

document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    recipeGrid: document.getElementById('recipeGrid'),
    recipeCountText: document.getElementById('recipeCountText'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    heroSearchInput: document.getElementById('heroSearchInput'),
    categoryList: document.getElementById('categoryList'),
    categoryChips: document.getElementById('categoryChips'),
    ingredientDrawer: document.getElementById('ingredientChipsContainer'),
    activeIngredientsBadge: document.getElementById('activeIngredientsBadge'),
    clearIngredientsBtn: document.getElementById('clearIngredientsBtn'),
    sortSelect: document.getElementById('sortSelect'),
    difficultyFilter: document.getElementById('difficultyFilter'),
    durationFilter: document.getElementById('durationFilter'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    loadMoreContainer: document.getElementById('loadMoreContainer'),
    emptyState: document.getElementById('emptyState'),
    resetFilterBtn: document.getElementById('resetFilterBtn'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileMenu: document.getElementById('mobileMenu')
  };

  // State pagination
  let currentPage = 1;
  const itemsPerPage = 9;
  let currentFilteredRecipes = [];

  // 1. Inisialisasi Data
  showLoadingSkeleton();
  await window.RecipeData.init();
  const allRecipes = window.RecipeData.getAllRecipes();
  const categories = window.RecipeData.getCategories();
  const ingredients = window.RecipeData.getIngredients();

  // 2. Render Kategori & Bahan Populer
  renderCategoryCards(categories);
  renderCategoryFilterChips(categories);
  renderPopularIngredients(ingredients);

  // 3. Render Resep Awal
  applyAndRender();

  // 4. Setup Event Listeners
  setupEventListeners();

  /* ==========================================================
     FUNGSI RENDERING
     ========================================================== */

  function applyAndRender(resetPage = true) {
    if (resetPage) currentPage = 1;
    currentFilteredRecipes = window.RecipeFilter.apply(allRecipes);

    // Update Text Jumlah Resep
    if (elements.recipeCountText) {
      elements.recipeCountText.textContent = `Menemukan ${currentFilteredRecipes.length} resep lezat`;
    }

    if (currentFilteredRecipes.length === 0) {
      if (elements.recipeGrid) elements.recipeGrid.innerHTML = '';
      if (elements.emptyState) elements.emptyState.classList.remove('hidden');
      if (elements.loadMoreContainer) elements.loadMoreContainer.classList.add('hidden');
      return;
    }

    if (elements.emptyState) elements.emptyState.classList.add('hidden');

    // Slice untuk pagination
    const totalToShow = currentPage * itemsPerPage;
    const paginatedRecipes = currentFilteredRecipes.slice(0, totalToShow);

    renderRecipeCards(paginatedRecipes);

    // Toggle tombol Load More
    if (elements.loadMoreContainer && elements.loadMoreBtn) {
      if (totalToShow >= currentFilteredRecipes.length) {
        elements.loadMoreContainer.classList.add('hidden');
      } else {
        elements.loadMoreContainer.classList.remove('hidden');
        elements.loadMoreBtn.textContent = `Muat Lebih Banyak (${currentFilteredRecipes.length - totalToShow} tersisa)`;
      }
    }
  }

  function renderRecipeCards(recipes) {
    if (!elements.recipeGrid) return;
    elements.recipeGrid.innerHTML = '';

    recipes.forEach((recipe, idx) => {
      const diffClass = window.RecipeData.getDifficultyClass(recipe.difficulty);
      const matchMeta = recipe._matchMeta;

      const card = document.createElement('article');
      card.className = 'recipe-card bg-white rounded-3xl overflow-hidden border border-[#F5E3D5] shadow-warm-sm flex flex-col cursor-pointer group animate-fade-in';
      card.style.animationDelay = `${(idx % 9) * 0.05}s`;

      card.innerHTML = `
        <div class="card-image-wrap relative h-52 w-full overflow-hidden bg-orange-50">
          <img 
            src="${recipe.image}" 
            alt="${recipe.name}" 
            loading="lazy" 
            class="w-full h-full object-cover"
            onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80'"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
          
          <!-- Category Badge -->
          <span class="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md text-[#542512] text-xs font-bold rounded-full shadow-sm">
            ${recipe.category}
          </span>

          <!-- Match Badge jika mencari bahan -->
          ${matchMeta ? `
            <span class="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1 animate-pulse">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              ${matchMeta.percentage}% Cocok
            </span>
          ` : `
            <!-- Servings badge -->
            <span class="absolute top-3 right-3 px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-xs font-medium rounded-full">
              🍽️ ${recipe.servings} Porsi
            </span>
          `}

          <!-- Quick Duration on Image -->
          <div class="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1.5 drop-shadow">
            <svg class="w-4 h-4 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ${recipe.duration} Menit
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${diffClass.bg}">
                <span class="w-1.5 h-1.5 rounded-full ${diffClass.dot}"></span>
                ${diffClass.label}
              </span>
              <span class="text-xs text-[#8C5132] font-medium">
                • ${recipe.ingredients ? recipe.ingredients.length : 0} Bahan
              </span>
            </div>

            <h3 class="text-lg font-bold text-[#542512] group-hover:text-[#E58B4A] transition-colors line-clamp-1 mb-2">
              ${recipe.name}
            </h3>

            <p class="text-xs text-[#8C5132]/90 line-clamp-2 leading-relaxed mb-4">
              ${recipe.description}
            </p>
          </div>

          <div class="pt-3 border-t border-[#F5E3D5] flex items-center justify-between text-xs font-bold text-[#E58B4A]">
            <span class="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Lihat Langkah Memasak
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </span>
            <span class="text-[11px] text-[#8C5132]/60 font-normal">
              ${recipe.steps ? recipe.steps.length : 0} langkah
            </span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `recipe-detail.html?id=${recipe.id}`;
      });

      elements.recipeGrid.appendChild(card);
    });
  }

  function renderCategoryCards(categories) {
    if (!elements.categoryList) return;
    elements.categoryList.innerHTML = '';

    categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'category-card bg-white p-4 rounded-2xl border border-[#F5E3D5] shadow-warm-sm hover:border-[#E58B4A] hover:shadow-warm-md transition-all cursor-pointer flex items-center gap-3 group';
      card.innerHTML = `
        <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          ${cat.icon}
        </div>
        <div>
          <h4 class="font-bold text-[#542512] group-hover:text-[#E58B4A] transition-colors text-sm">
            ${cat.name}
          </h4>
          <p class="text-xs text-[#8C5132]">
            ${cat.recipeCount} Resep
          </p>
        </div>
      `;

      card.addEventListener('click', () => {
        window.RecipeFilter.setCategory(cat.name);
        updateCategoryFilterActiveState(cat.name);
        applyAndRender();
        scrollToRecipes();
      });

      elements.categoryList.appendChild(card);
    });
  }

  function renderCategoryFilterChips(categories) {
    if (!elements.categoryChips) return;
    elements.categoryChips.innerHTML = `
      <button data-category="all" class="cat-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-[#E58B4A] text-white shadow-sm">
        ✨ Semua Kategori
      </button>
    `;

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.dataset.category = cat.name;
      btn.className = 'cat-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-white text-[#542512] border border-[#F5E3D5] hover:border-[#E58B4A] shadow-sm';
      btn.textContent = `${cat.icon} ${cat.name}`;
      btn.addEventListener('click', () => {
        const selected = btn.dataset.category;
        window.RecipeFilter.setCategory(selected);
        updateCategoryFilterActiveState(selected);
        applyAndRender();
      });
      elements.categoryChips.appendChild(btn);
    });

    const allBtn = elements.categoryChips.querySelector('[data-category="all"]');
    if (allBtn) {
      allBtn.addEventListener('click', () => {
        window.RecipeFilter.setCategory('all');
        updateCategoryFilterActiveState('all');
        applyAndRender();
      });
    }
  }

  function updateCategoryFilterActiveState(activeCategory) {
    if (!elements.categoryChips) return;
    const buttons = elements.categoryChips.querySelectorAll('.cat-filter-btn');
    buttons.forEach(btn => {
      if (btn.dataset.category.toLowerCase() === activeCategory.toLowerCase()) {
        btn.className = 'cat-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-[#E58B4A] text-white shadow-sm';
      } else {
        btn.className = 'cat-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all bg-white text-[#542512] border border-[#F5E3D5] hover:border-[#E58B4A] shadow-sm';
      }
    });
  }

  function renderPopularIngredients(ingredients) {
    if (!elements.ingredientDrawer) return;
    elements.ingredientDrawer.innerHTML = '';

    // Ambil top 20 bahan populer
    const topIngredients = [
      'Telur Ayam', 'Nasi Putih', 'Bawang Merah', 'Bawang Putih', 
      'Cabai Rawit Merah', 'Daging Sapi', 'Dada Ayam', 'Tahu', 
      'Tempe', 'Santan Kelapa', 'Keju', 'Spaghetti', 'Jamur', 
      'Jagung Manis', 'Wortel', 'Pisang', 'Mangga', 'Susu'
    ];

    topIngredients.forEach(ingName => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'ingredient-chip px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-[#542512] border border-[#F5E3D5] hover:border-[#E58B4A] flex items-center gap-1.5';
      chip.innerHTML = `
        <span>+</span>
        <span>${ingName}</span>
      `;

      chip.addEventListener('click', () => {
        window.RecipeFilter.toggleIngredient(ingName);
        chip.classList.toggle('selected');
        const isSelected = chip.classList.contains('selected');
        chip.querySelector('span:first-child').textContent = isSelected ? '✓' : '+';
        updateIngredientCounter();
        applyAndRender();
      });

      elements.ingredientDrawer.appendChild(chip);
    });
  }

  function updateIngredientCounter() {
    const count = window.RecipeFilter.state.selectedIngredients.size;
    if (elements.activeIngredientsBadge) {
      if (count > 0) {
        elements.activeIngredientsBadge.textContent = `${count} bahan terpilih`;
        elements.activeIngredientsBadge.classList.remove('hidden');
        if (elements.clearIngredientsBtn) elements.clearIngredientsBtn.classList.remove('hidden');
      } else {
        elements.activeIngredientsBadge.classList.add('hidden');
        if (elements.clearIngredientsBtn) elements.clearIngredientsBtn.classList.add('hidden');
      }
    }
  }

  function showLoadingSkeleton() {
    if (!elements.recipeGrid) return;
    elements.recipeGrid.innerHTML = Array(6).fill(0).map(() => `
      <div class="bg-white rounded-3xl overflow-hidden border border-[#F5E3D5] shadow-warm-sm p-4 animate-pulse">
        <div class="skeleton h-48 w-full rounded-2xl mb-4"></div>
        <div class="skeleton h-5 w-3/4 rounded-md mb-2"></div>
        <div class="skeleton h-4 w-1/2 rounded-md mb-4"></div>
        <div class="flex justify-between">
          <div class="skeleton h-4 w-16 rounded-md"></div>
          <div class="skeleton h-4 w-20 rounded-md"></div>
        </div>
      </div>
    `).join('');
  }

  function scrollToRecipes() {
    const target = document.getElementById('recipeSection');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* ==========================================================
     EVENT LISTENERS
     ========================================================== */

  function setupEventListeners() {
    // 1. Search Bar Utama
    let debounceTimer;
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const val = e.target.value;
        if (elements.searchClearBtn) {
          if (val.trim()) elements.searchClearBtn.classList.remove('hidden');
          else elements.searchClearBtn.classList.add('hidden');
        }
        debounceTimer = setTimeout(() => {
          window.RecipeFilter.setSearchQuery(val);
          applyAndRender();
        }, 250);
      });
    }

    if (elements.searchClearBtn) {
      elements.searchClearBtn.addEventListener('click', () => {
        if (elements.searchInput) elements.searchInput.value = '';
        elements.searchClearBtn.classList.add('hidden');
        window.RecipeFilter.setSearchQuery('');
        applyAndRender();
      });
    }

    // 2. Hero Search Bar (Sinkronisasi dengan Search Bar Utama)
    if (elements.heroSearchInput) {
      elements.heroSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = elements.heroSearchInput.value;
          if (elements.searchInput) elements.searchInput.value = val;
          window.RecipeFilter.setSearchQuery(val);
          applyAndRender();
          scrollToRecipes();
        }
      });
    }

    // 3. Quick Tag Hero Buttons (Punya Telur?, Punya Ayam?, dll.)
    document.querySelectorAll('.hero-quick-tag').forEach(tagBtn => {
      tagBtn.addEventListener('click', () => {
        const keyword = tagBtn.dataset.query;
        if (elements.searchInput) elements.searchInput.value = keyword;
        window.RecipeFilter.setSearchQuery(keyword);
        applyAndRender();
        scrollToRecipes();
      });
    });

    // 4. Clear Ingredients Button
    if (elements.clearIngredientsBtn) {
      elements.clearIngredientsBtn.addEventListener('click', () => {
        window.RecipeFilter.clearIngredients();
        if (elements.ingredientDrawer) {
          elements.ingredientDrawer.querySelectorAll('.ingredient-chip').forEach(chip => {
            chip.classList.remove('selected');
            chip.querySelector('span:first-child').textContent = '+';
          });
        }
        updateIngredientCounter();
        applyAndRender();
      });
    }

    // 5. Sort Selector
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (e) => {
        window.RecipeFilter.setSortBy(e.target.value);
        applyAndRender();
      });
    }

    // 6. Difficulty Filter Pills
    if (elements.difficultyFilter) {
      elements.difficultyFilter.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          elements.difficultyFilter.querySelectorAll('button').forEach(b => {
            b.classList.remove('bg-[#542512]', 'text-white');
            b.classList.add('bg-white', 'text-[#542512]');
          });
          btn.classList.add('bg-[#542512]', 'text-white');
          btn.classList.remove('bg-white', 'text-[#542512]');

          window.RecipeFilter.setDifficulty(btn.dataset.diff);
          applyAndRender();
        });
      });
    }

    // 7. Duration Filter Pills
    if (elements.durationFilter) {
      elements.durationFilter.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          elements.durationFilter.querySelectorAll('button').forEach(b => {
            b.classList.remove('bg-[#542512]', 'text-white');
            b.classList.add('bg-white', 'text-[#542512]');
          });
          btn.classList.add('bg-[#542512]', 'text-white');
          btn.classList.remove('bg-white', 'text-[#542512]');

          const max = btn.dataset.max;
          window.RecipeFilter.setMaxDuration(max ? parseInt(max, 10) : null);
          applyAndRender();
        });
      });
    }

    // 8. Load More Button
    if (elements.loadMoreBtn) {
      elements.loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        applyAndRender(false);
      });
    }

    // 9. Reset All Filters Button
    if (elements.resetFilterBtn) {
      elements.resetFilterBtn.addEventListener('click', () => {
        window.RecipeFilter.reset();
        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.heroSearchInput) elements.heroSearchInput.value = '';
        if (elements.searchClearBtn) elements.searchClearBtn.classList.add('hidden');
        if (elements.sortSelect) elements.sortSelect.value = 'default';
        updateCategoryFilterActiveState('all');
        if (elements.ingredientDrawer) {
          elements.ingredientDrawer.querySelectorAll('.ingredient-chip').forEach(chip => {
            chip.classList.remove('selected');
            chip.querySelector('span:first-child').textContent = '+';
          });
        }
        updateIngredientCounter();
        applyAndRender();
      });
    }

    // 10. Mobile Menu Toggle
    if (elements.mobileMenuBtn && elements.mobileMenu) {
      elements.mobileMenuBtn.addEventListener('click', () => {
        elements.mobileMenu.classList.toggle('hidden');
      });
    }
  }
});
