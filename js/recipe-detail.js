/**
 * UseWhatYouHave - Recipe Detail Page Controller
 * Mengatur tampilan hero resep, kalkulator porsi dinamis,
 * checklist bahan, navigasi langkah memasak step-by-step,
 * tips, alternatif bahan, sumber atribusi, dan resep terkait.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Inisialisasi Data
  await window.RecipeData.init();

  // Ambil ID atau Slug dari URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id') || urlParams.get('slug');

  const recipe = window.RecipeData.getRecipeById(recipeId);

  const container = document.getElementById('detailContent');
  const errorContainer = document.getElementById('detailError');

  if (!recipe) {
    if (container) container.classList.add('hidden');
    if (errorContainer) errorContainer.classList.remove('hidden');
    return;
  }

  // Set page title
  document.title = `${recipe.name} – UseWhatYouHave`;

  // State porsi dinamis
  let currentServings = recipe.servings || 2;
  const baseServings = recipe.servings || 2;

  // State langkah memasak aktif
  let currentStepIndex = 0;
  const totalSteps = recipe.steps ? recipe.steps.length : 0;

  // Render semua bagian
  renderHero(recipe);
  renderIngredients(recipe, currentServings, baseServings);
  renderStepGuide(recipe, currentStepIndex);
  renderStepsOverview(recipe, currentStepIndex);
  renderTips(recipe);
  renderAlternatives(recipe);
  renderSource(recipe);
  renderRelatedRecipes(recipe);
  setupShareAndPrint(recipe);

  /* ==========================================================
     HERO SECTION
     ========================================================== */
  function renderHero(r) {
    const diffClass = window.RecipeData.getDifficultyClass(r.difficulty);

    const titleEl = document.getElementById('heroTitle');
    const descEl = document.getElementById('heroDescription');
    const imageEl = document.getElementById('heroImage');
    const categoryBadgeEl = document.getElementById('heroCategoryBadge');
    const breadcrumbCategoryEl = document.getElementById('breadcrumbCategory');
    const breadcrumbTitleEl = document.getElementById('breadcrumbTitle');
    const durationEl = document.getElementById('heroDuration');
    const difficultyEl = document.getElementById('heroDifficulty');
    const servingsEl = document.getElementById('heroServings');

    if (titleEl) titleEl.textContent = r.name;
    if (descEl) descEl.textContent = r.description;
    if (imageEl) {
      imageEl.src = r.image;
      imageEl.alt = r.name;
    }
    if (categoryBadgeEl) categoryBadgeEl.textContent = r.category;
    if (breadcrumbCategoryEl) breadcrumbCategoryEl.textContent = r.category;
    if (breadcrumbTitleEl) breadcrumbTitleEl.textContent = r.name;
    if (durationEl) durationEl.textContent = `${r.duration} Menit`;
    if (servingsEl) servingsEl.textContent = `${r.servings} Porsi`;

    if (difficultyEl) {
      difficultyEl.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${diffClass.bg}">
          <span class="w-2 h-2 rounded-full ${diffClass.dot}"></span>
          ${diffClass.label}
        </span>
      `;
    }
  }

  /* ==========================================================
     INGREDIENTS SECTION + SERVING SCALER
     ========================================================== */
  function renderIngredients(r, servings, base) {
    const ingredientsList = document.getElementById('ingredientsList');
    const servingDisplay = document.getElementById('servingDisplay');
    const decreaseBtn = document.getElementById('decreaseServingBtn');
    const increaseBtn = document.getElementById('increaseServingBtn');

    if (servingDisplay) servingDisplay.textContent = `${servings} Porsi`;

    if (!ingredientsList) return;
    ingredientsList.innerHTML = '';

    const ratio = servings / base;

    (r.ingredients || []).forEach((ing, index) => {
      // Skala takaran
      const scaledQty = ing.quantity ? Math.round((ing.quantity * ratio) * 10) / 10 : '';

      const row = document.createElement('div');
      row.className = 'ingredient-row p-3 rounded-2xl bg-white border border-[#F5E3D5] flex items-center justify-between gap-3 transition-all hover:border-[#E58B4A] shadow-warm-sm';
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <input 
            type="checkbox" 
            id="ing-${index}" 
            class="ing-checkbox w-5 h-5 rounded-md text-[#E58B4A] focus:ring-[#E58B4A] border-gray-300 cursor-pointer"
          />
          <img 
            src="${ing.image}" 
            alt="${ing.name}" 
            class="w-10 h-10 rounded-xl object-cover bg-orange-50 border border-orange-100"
            onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'"
          />
          <label for="ing-${index}" class="text-sm font-semibold text-[#542512] cursor-pointer ing-label transition-all">
            ${ing.name}
          </label>
        </div>
        <div class="text-right">
          <span class="text-sm font-bold text-[#E58B4A]">${scaledQty}</span>
          <span class="text-xs text-[#8C5132] font-medium ml-1">${ing.unit || ''}</span>
        </div>
      `;

      // Coret bahan jika di-checklist
      const checkbox = row.querySelector('.ing-checkbox');
      const label = row.querySelector('.ing-label');
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          label.classList.add('line-through', 'text-gray-400');
          row.classList.add('bg-gray-50', 'opacity-70');
        } else {
          label.classList.remove('line-through', 'text-gray-400');
          row.classList.remove('bg-gray-50', 'opacity-70');
        }
      });

      ingredientsList.appendChild(row);
    });

    // Event listener button serving
    if (decreaseBtn) {
      decreaseBtn.onclick = () => {
        if (currentServings > 1) {
          currentServings--;
          renderIngredients(recipe, currentServings, baseServings);
        }
      };
    }

    if (increaseBtn) {
      increaseBtn.onclick = () => {
        if (currentServings < 20) {
          currentServings++;
          renderIngredients(recipe, currentServings, baseServings);
        }
      };
    }
  }

  /* ==========================================================
     INTERACTIVE COOKING STEPS GUIDE
     ========================================================== */
  function renderStepGuide(r, stepIdx) {
    if (!r.steps || r.steps.length === 0) return;

    const step = r.steps[stepIdx];
    const stepNumberEl = document.getElementById('activeStepNumber');
    const stepTotalEl = document.getElementById('activeStepTotal');
    const stepTitleEl = document.getElementById('activeStepTitle');
    const stepDescEl = document.getElementById('activeStepDesc');
    const stepDurationEl = document.getElementById('activeStepDuration');
    const stepImageEl = document.getElementById('activeStepImage');
    const progressBarEl = document.getElementById('stepProgressBar');
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');

    if (stepNumberEl) stepNumberEl.textContent = `Langkah ${step.order || stepIdx + 1}`;
    if (stepTotalEl) stepTotalEl.textContent = `dari ${totalSteps}`;
    if (stepTitleEl) stepTitleEl.textContent = step.title;
    if (stepDescEl) stepDescEl.textContent = step.description;
    if (stepDurationEl) stepDurationEl.textContent = step.duration ? `⏱️ ±${step.duration} Menit` : '';

    if (stepImageEl) {
      stepImageEl.src = step.image;
      stepImageEl.alt = step.title;
    }

    // Progress bar
    if (progressBarEl) {
      const percentage = Math.round(((stepIdx + 1) / totalSteps) * 100);
      progressBarEl.style.width = `${percentage}%`;
    }

    // Tombol Previous & Next
    if (prevBtn) {
      prevBtn.disabled = stepIdx === 0;
      prevBtn.classList.toggle('opacity-40', stepIdx === 0);
      prevBtn.classList.toggle('cursor-not-allowed', stepIdx === 0);
      prevBtn.onclick = () => {
        if (currentStepIndex > 0) {
          currentStepIndex--;
          renderStepGuide(recipe, currentStepIndex);
          renderStepsOverview(recipe, currentStepIndex);
        }
      };
    }

    if (nextBtn) {
      if (stepIdx === totalSteps - 1) {
        nextBtn.innerHTML = `
          <span>Selesai Memasak! 🎉</span>
        `;
        nextBtn.onclick = () => {
          showCompletionModal(recipe);
        };
      } else {
        nextBtn.innerHTML = `
          <span>Langkah Selanjutnya</span>
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        `;
        nextBtn.onclick = () => {
          if (currentStepIndex < totalSteps - 1) {
            currentStepIndex++;
            renderStepGuide(recipe, currentStepIndex);
            renderStepsOverview(recipe, currentStepIndex);
          }
        };
      }
    }
  }

  /* ==========================================================
     TIMELINE / STEPS OVERVIEW LIST
     ========================================================== */
  function renderStepsOverview(r, activeIdx) {
    const listEl = document.getElementById('stepsOverviewList');
    if (!listEl || !r.steps) return;
    listEl.innerHTML = '';

    r.steps.forEach((step, idx) => {
      const isActive = idx === activeIdx;
      const isDone = idx < activeIdx;

      const item = document.createElement('div');
      item.className = `step-item p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
        isActive 
          ? 'bg-orange-50/80 border-[#E58B4A] shadow-warm-sm' 
          : isDone 
            ? 'bg-white/80 border-emerald-200 opacity-90' 
            : 'bg-white border-[#F5E3D5] hover:border-orange-300'
      }`;

      item.innerHTML = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
          isActive 
            ? 'bg-[#E58B4A] text-white' 
            : isDone 
              ? 'bg-emerald-500 text-white' 
              : 'bg-[#FFE5D3] text-[#542512]'
        }">
          ${isDone ? '✓' : step.order || idx + 1}
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <h4 class="font-bold text-sm text-[#542512] ${isActive ? 'text-[#E58B4A]' : ''}">
              ${step.title}
            </h4>
            ${step.duration ? `
              <span class="text-xs text-[#8C5132] font-medium">±${step.duration} mnt</span>
            ` : ''}
          </div>
          <p class="text-xs text-[#8C5132] leading-relaxed">
            ${step.description}
          </p>
        </div>
      `;

      item.addEventListener('click', () => {
        currentStepIndex = idx;
        renderStepGuide(recipe, currentStepIndex);
        renderStepsOverview(recipe, currentStepIndex);
        const guideEl = document.getElementById('stepGuideCard');
        if (guideEl) guideEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });

      listEl.appendChild(item);
    });
  }

  /* ==========================================================
     COOKING TIPS
     ========================================================== */
  function renderTips(r) {
    const tipsList = document.getElementById('tipsList');
    if (!tipsList) return;
    tipsList.innerHTML = '';

    if (!r.tips || r.tips.length === 0) {
      tipsList.innerHTML = '<p class="text-xs text-[#8C5132]">Ikuti langkah di atas secara teratur untuk hasil rasa terbaik.</p>';
      return;
    }

    r.tips.forEach((tip, idx) => {
      const tipCard = document.createElement('li');
      tipCard.className = 'flex items-start gap-3 text-xs text-[#542512] bg-[#FFFBF7] p-3 rounded-xl border border-orange-100';
      tipCard.innerHTML = `
        <span class="w-5 h-5 rounded-full bg-[#FFE5D3] text-[#E58B4A] font-bold flex items-center justify-center shrink-0 text-[11px]">
          ${idx + 1}
        </span>
        <span class="leading-relaxed">${tip}</span>
      `;
      tipsList.appendChild(tipCard);
    });
  }

  /* ==========================================================
     INGREDIENT ALTERNATIVES
     ========================================================== */
  function renderAlternatives(r) {
    const altList = document.getElementById('alternativesList');
    if (!altList) return;
    altList.innerHTML = '';

    if (!r.alternatives || r.alternatives.length === 0) {
      altList.innerHTML = '<p class="text-xs text-[#8C5132]">Gunakan bahan-bahan asli sesuai daftar untuk rasa paling otentik.</p>';
      return;
    }

    r.alternatives.forEach(alt => {
      const row = document.createElement('div');
      row.className = 'p-3 rounded-xl bg-white border border-[#F5E3D5] flex items-center justify-between gap-3 text-xs shadow-warm-sm';
      row.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-rose-400"></span>
          <span class="font-bold text-[#542512]">${alt.ingredient}</span>
        </div>
        <div class="flex items-center gap-2 text-right">
          <span class="text-[#8C5132] font-medium">Bisa diganti:</span>
          <span class="font-bold text-[#78A85B] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            ${alt.replacement}
          </span>
        </div>
      `;
      altList.appendChild(row);
    });
  }

  /* ==========================================================
     SOURCE ATTRIBUTION
     ========================================================== */
  function renderSource(r) {
    const sourceNameEl = document.getElementById('sourceName');
    const sourceLinkEl = document.getElementById('sourceLink');

    if (r.source) {
      if (sourceNameEl) sourceNameEl.textContent = r.source.name || 'Website Resep Asli';
      if (sourceLinkEl) {
        sourceLinkEl.href = r.source.url || '#';
        sourceLinkEl.textContent = r.source.url ? 'Kunjungi Resep Sumber ↗' : 'Sumber Terverifikasi';
      }
    }
  }

  /* ==========================================================
     RELATED RECIPES
     ========================================================== */
  function renderRelatedRecipes(r) {
    const container = document.getElementById('relatedRecipesGrid');
    if (!container) return;
    container.innerHTML = '';

    const related = window.RecipeData.getRelatedRecipes(r.id, 3);
    related.forEach(item => {
      const diffClass = window.RecipeData.getDifficultyClass(item.difficulty);

      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl overflow-hidden border border-[#F5E3D5] shadow-warm-sm hover:shadow-warm-md hover:border-[#E58B4A] transition-all cursor-pointer flex flex-col group';
      card.innerHTML = `
        <div class="h-36 w-full overflow-hidden bg-orange-100 relative">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=400&q=80'"
          />
          <span class="absolute top-2 left-2 px-2 py-0.5 bg-white/90 text-xs font-bold text-[#542512] rounded-full">
            ${item.category}
          </span>
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-[#542512] group-hover:text-[#E58B4A] transition-colors text-sm line-clamp-1 mb-1">
              ${item.name}
            </h4>
            <p class="text-xs text-[#8C5132] line-clamp-2 leading-relaxed">
              ${item.description}
            </p>
          </div>
          <div class="mt-3 pt-2 border-t border-[#F5E3D5] flex items-center justify-between text-xs text-[#8C5132]">
            <span>⏱️ ${item.duration} mnt</span>
            <span class="font-bold text-[#E58B4A]">Lihat →</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `recipe-detail.html?id=${item.id}`;
      });

      container.appendChild(card);
    });
  }

  /* ==========================================================
     SHARE, PRINT, AND CELEBRATION MODAL
     ========================================================== */
  function setupShareAndPrint(r) {
    const printBtn = document.getElementById('printRecipeBtn');
    const shareBtn = document.getElementById('shareRecipeBtn');
    const toast = document.getElementById('shareToast');

    if (printBtn) {
      printBtn.onclick = () => window.print();
    }

    if (shareBtn) {
      shareBtn.onclick = async () => {
        const shareData = {
          title: r.name,
          text: `Temukan resep ${r.name} di UseWhatYouHave!`,
          url: window.location.href
        };

        if (navigator.share && window.isSecureContext) {
          try {
            await navigator.share(shareData);
            return;
          } catch (e) {
            // fallback ke copy to clipboard
          }
        }

        // Copy link to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Link resep berhasil disalin ke clipboard! 📋');
        } catch (err) {
          prompt('Salin link resep berikut:', window.location.href);
        }
      };
    }

    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.remove('opacity-0', 'translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        toast.classList.remove('opacity-100', 'translate-y-0');
      }, 3000);
    }
  }

  function showCompletionModal(r) {
    const modal = document.getElementById('completionModal');
    if (!modal) return;
    const modalRecipeName = document.getElementById('modalRecipeName');
    if (modalRecipeName) modalRecipeName.textContent = r.name;
    modal.classList.remove('hidden');

    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.add('hidden');
      };
    }
  }
});
