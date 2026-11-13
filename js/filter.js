/**
 * UseWhatYouHave - Filter & Sort Module
 * Mengelola state filter kategori, durasi, tingkat kesulitan, dan sorting
 */

const RecipeFilter = {
  state: {
    searchQuery: '',
    category: 'all',
    difficulty: 'all',
    maxDuration: null,
    selectedIngredients: new Set(),
    sortBy: 'default' // 'default', 'name-asc', 'duration-asc', 'difficulty-asc'
  },

  reset() {
    this.state = {
      searchQuery: '',
      category: 'all',
      difficulty: 'all',
      maxDuration: null,
      selectedIngredients: new Set(),
      sortBy: 'default'
    };
  },

  setSearchQuery(q) {
    this.state.searchQuery = q || '';
  },

  setCategory(cat) {
    this.state.category = cat || 'all';
  },

  setDifficulty(diff) {
    this.state.difficulty = diff || 'all';
  },

  setMaxDuration(minutes) {
    this.state.maxDuration = minutes ? parseInt(minutes, 10) : null;
  },

  toggleIngredient(ingName) {
    if (!ingName) return;
    const name = ingName.trim();
    if (this.state.selectedIngredients.has(name)) {
      this.state.selectedIngredients.delete(name);
    } else {
      this.state.selectedIngredients.add(name);
    }
  },

  clearIngredients() {
    this.state.selectedIngredients.clear();
  },

  setSortBy(sortVal) {
    this.state.sortBy = sortVal || 'default';
  },

  /**
   * Eksekusi seluruh filter dan pengurutan pada daftar resep
   * @param {Array} allRecipes 
   * @returns {Array} Resep yang sudah difilter dan diurutkan
   */
  apply(allRecipes) {
    let results = [...allRecipes];

    // 1. Filter Pencarian Keyword
    if (this.state.searchQuery && this.state.searchQuery.trim()) {
      results = window.RecipeSearch.search(results, this.state.searchQuery);
    }

    // 2. Filter Bahan ("Use What You Have")
    if (this.state.selectedIngredients.size > 0) {
      const selectedList = Array.from(this.state.selectedIngredients);
      results = window.RecipeSearch.matchByIngredients(results, selectedList);
    }

    // 3. Filter Kategori
    if (this.state.category && this.state.category !== 'all') {
      results = results.filter(r => {
        const cat = (r.category || '').toLowerCase();
        const target = this.state.category.toLowerCase();
        return cat === target || cat.includes(target);
      });
    }

    // 4. Filter Tingkat Kesulitan
    if (this.state.difficulty && this.state.difficulty !== 'all') {
      results = results.filter(r => {
        const diff = (r.difficulty || '').toLowerCase();
        const target = this.state.difficulty.toLowerCase();
        return diff === target;
      });
    }

    // 5. Filter Durasi Maksimal
    if (this.state.maxDuration && this.state.maxDuration > 0) {
      results = results.filter(r => {
        const duration = parseInt(r.duration, 10) || 0;
        return duration <= this.state.maxDuration;
      });
    }

    // 6. Sorting
    results.sort((a, b) => {
      switch (this.state.sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '', 'id');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '', 'id');
        case 'duration-asc':
          return (a.duration || 0) - (b.duration || 0);
        case 'duration-desc':
          return (b.duration || 0) - (a.duration || 0);
        case 'difficulty-asc': {
          const mapDiff = { 'mudah': 1, 'sedang': 2, 'sulit': 3 };
          const aDiff = mapDiff[(a.difficulty || '').toLowerCase()] || 2;
          const bDiff = mapDiff[(b.difficulty || '').toLowerCase()] || 2;
          return aDiff - bDiff;
        }
        default:
          return 0; // Urutan default rekomendasi
      }
    });

    return results;
  }
};

window.RecipeFilter = RecipeFilter;
