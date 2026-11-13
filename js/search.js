/**
 * UseWhatYouHave - Search Functionality
 * Menangani pencarian berdasarkan nama resep, bahan makanan, dan kategori
 */

const RecipeSearch = {
  /**
   * Cari resep berdasarkan keyword umum (nama, bahan, deskripsi, kategori)
   * @param {Array} recipes - Daftar resep
   * @param {string} query - Keyword pencarian pengguna
   * @returns {Array} Hasil resep yang cocok
   */
  search(recipes, query) {
    if (!query || !query.trim()) return recipes;
    
    const terms = query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(t => t.length > 0);

    return recipes.filter(recipe => {
      const name = (recipe.name || '').toLowerCase();
      const desc = (recipe.description || '').toLowerCase();
      const category = (recipe.category || '').toLowerCase();
      const ingredientNames = (recipe.ingredients || [])
        .map(i => (i.name || '').toLowerCase())
        .join(' ');

      // Setiap term harus cocok di salah satu bidang
      return terms.every(term => 
        name.includes(term) || 
        desc.includes(term) || 
        category.includes(term) || 
        ingredientNames.includes(term)
      );
    });
  },

  /**
   * Cari berdasarkan daftar bahan yang dimiliki pengguna ("Use What You Have")
   * @param {Array} recipes - Daftar resep
   * @param {Array<string>} userIngredients - Daftar bahan yang dipilih pengguna
   * @returns {Array} Resep yang mengandung bahan tersebut beserta persentase kecocokan
   */
  matchByIngredients(recipes, userIngredients) {
    if (!userIngredients || userIngredients.length === 0) return recipes;

    const normalizedUserIngs = userIngredients.map(ing => ing.toLowerCase().trim());

    const matchedList = recipes.map(recipe => {
      const recipeIngs = (recipe.ingredients || []).map(i => (i.name || '').toLowerCase());
      
      // Temukan bahan resep yang cocok dengan bahan milik pengguna
      const matched = [];
      recipeIngs.forEach(ingName => {
        const found = normalizedUserIngs.find(uIng => ingName.includes(uIng) || uIng.includes(ingName));
        if (found) {
          matched.push(ingName);
        }
      });

      const matchCount = matched.length;
      const totalRecipeIngs = recipe.ingredients.length || 1;
      const matchPercentage = Math.round((matchCount / totalRecipeIngs) * 100);

      return {
        recipe,
        matchCount,
        matchPercentage,
        matchedIngredients: matched
      };
    });

    // Filter resep yang punya minimal 1 bahan yang cocok
    return matchedList
      .filter(item => item.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount || b.matchPercentage - a.matchPercentage)
      .map(item => ({
        ...item.recipe,
        _matchMeta: {
          count: item.matchCount,
          percentage: item.matchPercentage,
          matched: item.matchedIngredients
        }
      }));
  }
};

window.RecipeSearch = RecipeSearch;
