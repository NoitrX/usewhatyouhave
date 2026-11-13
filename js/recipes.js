/**
 * UseWhatYouHave - Recipe Data Service
 * Mengelola pemuatan data resep, kategori, dan bahan dari JSON
 */

const RecipeData = {
  recipes: [],
  categories: [],
  ingredients: [],
  isLoaded: false,

  async init() {
    if (this.isLoaded) return this.recipes;
    try {
      const [recipesRes, categoriesRes, ingredientsRes] = await Promise.all([
        fetch('data/recipes.json'),
        fetch('data/categories.json'),
        fetch('data/ingredients.json')
      ]);

      if (!recipesRes.ok || !categoriesRes.ok) {
        throw new Error('Gagal memuat file JSON');
      }

      this.recipes = await recipesRes.json();
      this.categories = await categoriesRes.json();
      this.ingredients = ingredientsRes.ok ? await ingredientsRes.json() : [];
      this.isLoaded = true;
      return this.recipes;
    } catch (error) {
      console.warn('Gagal memuat JSON via fetch (kemungkinan CORS pada file://), mencoba fallback internal data:', error);
      // Fallback data jika dibuka tanpa web server lokal
      if (window.FALLBACK_DATA && window.FALLBACK_DATA.recipes) {
        this.recipes = window.FALLBACK_DATA.recipes;
        this.categories = window.FALLBACK_DATA.categories || [];
        this.ingredients = window.FALLBACK_DATA.ingredients || [];
        this.isLoaded = true;
        return this.recipes;
      }
      return [];
    }
  },

  getAllRecipes() {
    return this.recipes;
  },

  getRecipeById(id) {
    if (!id) return null;
    return this.recipes.find(r => r.id === id || r.slug === id) || null;
  },

  getRecipeBySlug(slug) {
    if (!slug) return null;
    return this.recipes.find(r => r.slug === slug || r.id === slug) || null;
  },

  getCategories() {
    return this.categories;
  },

  getIngredients() {
    return this.ingredients;
  },

  getRelatedRecipes(currentRecipeId, limit = 3) {
    const current = this.getRecipeById(currentRecipeId);
    if (!current) return this.recipes.slice(0, limit);

    return this.recipes
      .filter(r => r.id !== current.id)
      .map(r => {
        let score = 0;
        if (r.category === current.category) score += 3;
        // Hitung bahan yang mirip
        const currentIngNames = current.ingredients.map(i => i.name.toLowerCase());
        r.ingredients.forEach(i => {
          if (currentIngNames.some(cName => cName.includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(cName))) {
            score += 1;
          }
        });
        return { recipe: r, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.recipe);
  },

  getDifficultyClass(difficulty) {
    const diff = (difficulty || '').toLowerCase();
    if (diff === 'mudah' || diff === 'easy') {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Mudah'
      };
    }
    if (diff === 'sedang' || diff === 'medium') {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Sedang'
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Sulit'
    };
  }
};

window.RecipeData = RecipeData;
