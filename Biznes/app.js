// NOVA Market - Asosiy Ilova Skripti (Dinamik va Real-time sinxronizatsiya bilan)
document.addEventListener("DOMContentLoaded", () => {
  // --- HOLAT (STATE) ---
  let products = JSON.parse(localStorage.getItem("nova_products")) || INITIAL_PRODUCTS;
  let storeConfig = JSON.parse(localStorage.getItem("nova_store_config")) || DEFAULT_STORE_CONFIG;
  let categories = JSON.parse(localStorage.getItem("nova_categories")) || CATEGORIES;
  let cart = JSON.parse(localStorage.getItem("nova_cart")) || [];
  let wishlist = JSON.parse(localStorage.getItem("nova_wishlist")) || [];
  
  let activeCategory = "all";
  let searchQuery = "";
  let sortBy = "popular";
  let appliedDiscount = 0;
  let appliedPromoCode = "";
  let selectedProductForModal = null;
  let currentModalImageIndex = 0;
  let selectedColor = "";
  let selectedSize = "";

  // --- VIZUAL MUHARRIR HOLATI (VISUAL BUILDER STATE) ---
  let isVisualEditMode = false;
  let editingCategoryIndex = null;
  let editingElementKey = null;

  const CURATED_ICONS = [
    "sparkles", "tag", "smartphone", "laptop", "shirt", "watch", 
    "headphones", "camera", "home", "gamepad-2", "coffee", "book-open",
    "dumbbell", "car", "baby", "heart", "gift", "music",
    "tv", "glasses", "package", "shopping-bag", "sun", "zap"
  ];

  const SECTIONS_META = {
    hero: { name: "Bosh Banner & Kunning Taklifi", icon: "layout" },
    trust: { name: "Ishonch & Afzalliklar Bloklari", icon: "shield-check" },
    categories: { name: "Ommabop Toifalar (Katalog)", icon: "tag" },
    products: { name: "Mahsulotlar Vitrinasi", icon: "package" },
    promo_banner: { name: "Maxsus Aksiya & Chegirma Banneri", icon: "sparkles" }
  };

  // --- DARK MODE ---
  const isDarkMode = localStorage.getItem("nova_dark_mode") === "true";
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  }

  // --- INIT LUCIDE ICONS ---
  const refreshIcons = () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  // --- TOAST XABARLAR ---
  const showToast = (message, icon = "check-circle", type = "success") => {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 text-sm font-medium z-50 ${
      type === "success" 
        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border border-zinc-700/30" 
        : "bg-rose-500 text-white"
    }`;
    toast.innerHTML = `
      <i data-lucide="${icon}" class="w-4 h-4 text-emerald-400"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    refreshIcons();

    setTimeout(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    }, 10);

    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // --- KIBERXAVFSIZLIK VA XSS SANITIZATSIYA ---
  const escapeHtml = (str) => {
    if (typeof str !== "string") return str ?? "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const sanitizeUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (/^(https?:\/\/|data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,)/i.test(trimmed)) {
      return trimmed;
    }
    return "";
  };

  // --- FORMATTER FUNKSIYALARI ---
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  const calculateMonthly = (price) => {
    return formatPrice(Math.round(price / 12));
  };

  // --- SAQLASH (LOCAL STORAGE) ---
  const saveCart = () => {
    localStorage.setItem("nova_cart", JSON.stringify(cart));
    updateCartBadge();
  };

  const saveWishlist = () => {
    localStorage.setItem("nova_wishlist", JSON.stringify(wishlist));
    updateWishlistBadge();
  };

  // --- BADGE HISOBI ---
  const updateCartBadge = () => {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const badge = document.getElementById("cart-badge");
    const mobileBadge = document.getElementById("mobile-cart-badge");
    if (badge) {
      badge.textContent = totalItems;
      badge.classList.toggle("hidden", totalItems === 0);
    }
    if (mobileBadge) {
      mobileBadge.textContent = totalItems;
      mobileBadge.classList.toggle("hidden", totalItems === 0);
    }
  };

  const updateWishlistBadge = () => {
    const badge = document.getElementById("wishlist-badge");
    const mobileBadge = document.getElementById("mobile-wishlist-badge");
    if (badge) {
      badge.textContent = wishlist.length;
      badge.classList.toggle("hidden", wishlist.length === 0);
    }
    if (mobileBadge) {
      mobileBadge.textContent = wishlist.length;
      mobileBadge.classList.toggle("hidden", wishlist.length === 0);
    }
  };

  // --- DINAMIK DO'KON SOZLAMALARINI (STORE CONFIG) QO'LLASH ---
  const applyStoreConfig = () => {
    storeConfig = JSON.parse(localStorage.getItem("nova_store_config")) || DEFAULT_STORE_CONFIG;

    // 1. Dinamik rang (Accent color)
    const accentStyle = document.getElementById("custom-accent-style");
    if (accentStyle && storeConfig.brand?.accentColor) {
      const color = storeConfig.brand.accentColor;
      accentStyle.innerHTML = `
        :root { --primary: ${color}; }
        .bg-indigo-600 { background-color: ${color} !important; }
        .text-indigo-600 { color: ${color} !important; }
        .border-indigo-600 { border-color: ${color} !important; }
        .hover\\:bg-indigo-500:hover { background-color: ${color} !important; opacity: 0.9; }
        .hover\\:bg-indigo-600:hover { background-color: ${color} !important; }
        .text-indigo-400 { color: ${color} !important; }
        .dark .text-indigo-400 { color: ${color} !important; }
      `;
    }

    // 2. Yuqori e'lon paneli (Top announcement bar)
    const topBar = document.getElementById("top-announcement-bar");
    if (topBar) {
      if (storeConfig.topBar && storeConfig.topBar.enabled === false) {
        topBar.classList.add("hidden");
      } else {
        topBar.classList.remove("hidden");
        const bBadge = document.getElementById("top-bar-badge");
        const bText = document.getElementById("top-bar-main-text");
        const bDelivery = document.getElementById("top-bar-delivery-text");
        if (bBadge && storeConfig.topBar?.badgeText) {
          bBadge.innerHTML = `<i data-lucide="sparkles" class="w-3 h-3 text-indigo-400"></i> ${storeConfig.topBar.badgeText}`;
        }
        if (bText && storeConfig.topBar?.mainText) {
          bText.innerHTML = storeConfig.topBar.mainText;
        }
        if (bDelivery && storeConfig.topBar?.deliveryText) {
          bDelivery.innerHTML = `<i data-lucide="truck" class="w-3 h-3"></i> ${storeConfig.topBar.deliveryText}`;
        }
      }
    }

    // 3. Brending (Logo & Nom)
    const navLogo = document.getElementById("nav-brand-logo");
    const footerLogo = document.getElementById("footer-brand-logo");
    const brandName = storeConfig.brand?.name || "NOVA";
    const brandTagline = storeConfig.brand?.tagline || "Market";

    const logoHtml = storeConfig.brand?.logoImage 
      ? `<img src="${storeConfig.brand.logoImage}" alt="${brandName}" class="w-full h-full object-cover">`
      : (storeConfig.brand?.logoLetter || brandName[0] || "N");

    if (navLogo) navLogo.innerHTML = logoHtml;
    if (footerLogo) footerLogo.innerHTML = logoHtml;

    const navName = document.getElementById("nav-brand-name");
    const navTagline = document.getElementById("nav-brand-tagline");
    const footerName = document.getElementById("footer-brand-name");

    if (navName) navName.textContent = brandName;
    if (navTagline) navTagline.textContent = brandTagline;
    if (footerName) footerName.textContent = `${brandName} ${brandTagline}`;

    // Brauzer sarlavhasi (Document Title)
    document.title = `${brandName} — Zamonaviy va Minimalistik Onlayn Do'kon`;

    // 4. Hero matnlari
    if (storeConfig.hero) {
      const hPill = document.getElementById("hero-pill-text");
      const hLine1 = document.getElementById("hero-title-line1");
      const hLine2 = document.getElementById("hero-title-line2");
      const hDesc = document.getElementById("hero-description");
      const hBtn = document.getElementById("hero-btn-text");
      const hFlashTitle = document.getElementById("hero-flash-title");
      const hFlashBadge = document.getElementById("hero-flash-badge");

      if (hPill && storeConfig.hero.pillText) {
        hPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span>${storeConfig.hero.pillText}</span>`;
      }
      if (hLine1 && storeConfig.hero.titleLine1) hLine1.textContent = storeConfig.hero.titleLine1;
      if (hLine2 && storeConfig.hero.titleLine2) hLine2.textContent = storeConfig.hero.titleLine2;
      if (hDesc && storeConfig.hero.description) hDesc.textContent = storeConfig.hero.description;
      if (hBtn && storeConfig.hero.buttonText) hBtn.textContent = storeConfig.hero.buttonText;
      if (hFlashTitle && storeConfig.hero.flashDealTitle) hFlashTitle.textContent = storeConfig.hero.flashDealTitle;
      if (hFlashBadge && storeConfig.hero.flashDealBadge) hFlashBadge.textContent = storeConfig.hero.flashDealBadge;
    }

    // 5. Spotlight mahsulotini chiqarish (Flash Deal Card)
    renderFlashDeal();

    // 6. Ishonch faktorlari (Trust features)
    renderTrustFeatures();

    // 7. Maxsus Promo Banner
    renderPromoBanner();

    // 8. Bo'limlar tartibi va joylashuvi
    renderSectionsOrder();

    // 9. Footer ma'lumotlari
    if (storeConfig.contacts) {
      const fAbout = document.getElementById("footer-about-text");
      const fCopyright = document.getElementById("footer-copyright");
      const fPhone = document.getElementById("footer-phone");
      const fTelegram = document.getElementById("footer-telegram");
      const fHours = document.getElementById("footer-hours");

      if (fAbout && storeConfig.contacts.aboutText) fAbout.textContent = storeConfig.contacts.aboutText;
      if (fCopyright && storeConfig.contacts.copyright) fCopyright.textContent = storeConfig.contacts.copyright;
      if (fPhone && storeConfig.contacts.phone) fPhone.textContent = storeConfig.contacts.phone;
      if (fTelegram && storeConfig.contacts.telegram) fTelegram.textContent = storeConfig.contacts.telegram;
      if (fHours && storeConfig.contacts.workingHours) fHours.textContent = storeConfig.contacts.workingHours;
    }

    refreshIcons();
  };

  // --- PROMO BANNERNI CHIQARISH ---
  const renderPromoBanner = () => {
    const promoSection = document.getElementById("section-promo-banner");
    if (!promoSection) return;
    const pConf = storeConfig.promoBanner || DEFAULT_STORE_CONFIG.promoBanner;
    if (pConf && pConf.enabled === false) {
      promoSection.classList.add("hidden");
    } else {
      promoSection.classList.remove("hidden");
      const bBadge = document.getElementById("promo-banner-badge");
      const bTitle = document.getElementById("promo-banner-title");
      const bDesc = document.getElementById("promo-banner-desc");
      const bBtn = document.getElementById("promo-banner-btn");

      if (bBadge && pConf?.badge) bBadge.textContent = pConf.badge;
      if (bTitle && pConf?.title) bTitle.textContent = pConf.title;
      if (bDesc && pConf?.description) bDesc.textContent = pConf.description;
      if (bBtn && pConf?.buttonText) {
        const span = bBtn.querySelector("span");
        if (span) span.textContent = pConf.buttonText;
      }
    }
  };

  // --- BO'LIMLAR TARTIBI VA JOYLASHUVI (SECTION ORDERING) ---
  const renderSectionsOrder = () => {
    const mainEl = document.getElementById("main-content");
    if (!mainEl) return;

    const order = storeConfig.sectionOrder || ["hero", "trust", "categories", "promo_banner", "products"];
    const hidden = storeConfig.hiddenSections || [];

    order.forEach(sectionKey => {
      let secId = `section-${sectionKey.replace(/_/g, '-')}`;
      let el = document.getElementById(secId);
      if (el) {
        if (hidden.includes(sectionKey)) {
          el.classList.add("hidden");
        } else {
          el.classList.remove("hidden");
        }
        mainEl.appendChild(el);
      }
    });
  };

  // --- FLASH DEAL SPOTLIGHTNI CHIQARISH ---
  const renderFlashDeal = () => {
    const container = document.getElementById("flash-deal-container");
    if (!container) return;

    const spotlightId = storeConfig.hero?.flashDealProductId || (products[0] ? products[0].id : null);
    const prod = products.find((p) => p.id === spotlightId) || products[0];

    if (!prod) {
      container.innerHTML = `<p class="text-xs text-zinc-400 py-6 text-center">Maxsus taklif mavjud emas</p>`;
      return;
    }

    container.innerHTML = `
      <div class="flex gap-4 items-center">
        <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-800/80 shrink-0">
          <img 
            src="${prod.image}" 
            alt="${prod.title}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1 text-amber-400 text-xs mb-1">
            <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>
            <span class="font-bold">${prod.rating || 5.0}</span>
            <span class="text-zinc-400">(${prod.reviewsCount || 10} sharh)</span>
          </div>
          <h4 class="font-semibold text-sm text-white truncate" title="${prod.title}">${prod.title}</h4>
          ${prod.oldPrice ? `<div class="text-xs text-zinc-400 line-through mt-0.5">${formatPrice(prod.oldPrice)}</div>` : ""}
          <div class="text-base font-extrabold text-white">${formatPrice(prod.price)}</div>
          <div class="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
            <i data-lucide="check" class="w-3 h-3"></i> Omborda ${prod.stock || 12} dona qoldi
          </div>
        </div>
      </div>

      <button 
        id="flash-deal-view-btn"
        class="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
      >
        <i data-lucide="eye" class="w-4 h-4"></i>
        Batafsil ko'rish va xarid qilish
      </button>
    `;

    document.getElementById("flash-deal-view-btn")?.addEventListener("click", () => {
      openProductModal(prod.id);
    });

    refreshIcons();
  };

  // --- ISHONCH FAKTORLARI (TRUST FACTORS) CHIQARISH ---
  const renderTrustFeatures = () => {
    const container = document.getElementById("trust-factors-container");
    if (!container) return;

    const feats = storeConfig.features || DEFAULT_STORE_CONFIG.features;
    container.innerHTML = feats.map((f, i) => {
      const colors = [
        "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
        "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
        "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
        "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
      ];
      const colorCls = colors[i % colors.length];

      return `
        <div class="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center gap-3.5 shadow-sm">
          <div class="w-10 h-10 rounded-2xl ${colorCls} flex items-center justify-center shrink-0">
            <i data-lucide="${f.icon || "check"}" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">${f.title}</h4>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">${f.desc}</p>
          </div>
        </div>
      `;
    }).join("");

    refreshIcons();
  };

  // --- KATEGORIYALARNI CHIQARISH ---
  const renderCategories = () => {
    const container = document.getElementById("categories-container");
    if (!container) return;

    categories = JSON.parse(localStorage.getItem("nova_categories")) || CATEGORIES;

    container.innerHTML = categories.map((cat, idx) => {
      const isActive = activeCategory === cat.id;
      const isAll = cat.id === "all";

      return `
        <div class="relative group/cat shrink-0 flex items-center">
          <button 
            data-category="${cat.id}"
            class="category-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              isActive 
                ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900" 
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }"
          >
            <i data-lucide="${cat.icon || "tag"}" class="w-4 h-4"></i>
            <span>${escapeHtml(cat.name)}</span>
          </button>
          ${isVisualEditMode ? `
            <div class="ml-1 flex items-center gap-1 bg-zinc-900/90 border border-indigo-500/60 p-1 rounded-xl shadow-lg">
              <button type="button" class="visual-cat-edit-btn p-1 rounded-lg hover:bg-indigo-600 text-zinc-300 hover:text-white transition" data-index="${idx}" title="Toifani tahrirlash">
                <i data-lucide="edit-3" class="w-3 h-3"></i>
              </button>
              ${!isAll ? `
                <button type="button" class="visual-cat-delete-btn p-1 rounded-lg hover:bg-rose-600 text-zinc-400 hover:text-white transition" data-index="${idx}" title="Toifani o'chirish">
                  <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
              ` : ""}
            </div>
          ` : ""}
        </div>
      `;
    }).join("");

    container.querySelectorAll(".category-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.getAttribute("data-category");
        renderCategories();
        renderProducts();
      });
    });

    if (isVisualEditMode) {
      container.querySelectorAll(".visual-cat-edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute("data-index"));
          openVisualCategoryModal(idx);
        });
      });

      container.querySelectorAll(".visual-cat-delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute("data-index"));
          deleteVisualCategory(idx);
        });
      });
    }

    refreshIcons();
  };

  // --- MAHSULOTLARNI FILTER VA SORT QILISH ---
  const getFilteredProducts = () => {
    let result = [...products];

    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.categoryName || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "popular") {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "newest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  };

  // --- MAHSULOTLARNI CHIQARISH ---
  const renderProducts = () => {
    const grid = document.getElementById("products-grid");
    const countEl = document.getElementById("products-count");
    if (!grid) return;

    const filtered = getFilteredProducts();
    if (countEl) {
      countEl.textContent = `${filtered.length} ta mahsulot`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
            <i data-lucide="package-search" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Hech qanday mahsulot topilmadi</h3>
          <p class="text-sm text-zinc-500 mt-1">Qidiruv so'zini yoki tanlangan toifani o'zgartirib ko'ring.</p>
          <button id="reset-filter-btn" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            Barcha mahsulotlarni ko'rish
          </button>
        </div>
      `;
      document.getElementById("reset-filter-btn")?.addEventListener("click", () => {
        activeCategory = "all";
        searchQuery = "";
        const searchInput = document.getElementById("search-input");
        if (searchInput) searchInput.value = "";
        renderCategories();
        renderProducts();
      });
      refreshIcons();
      return;
    }

    grid.innerHTML = filtered.map((item) => {
      const isFav = wishlist.includes(item.id);
      const discountPercent = item.oldPrice
        ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
        : null;

      let badgeStyle = "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900";
      if (item.badgeType === "fire") badgeStyle = "bg-rose-500 text-white shimmer-badge";
      if (item.badgeType === "star") badgeStyle = "bg-amber-500 text-white";
      if (item.badgeType === "crown") badgeStyle = "bg-purple-600 text-white";
      if (item.badgeType === "discount") badgeStyle = "bg-emerald-600 text-white";

      return `
        <div class="group relative bg-white dark:bg-zinc-900 rounded-3xl p-3 border border-zinc-100 dark:border-zinc-800/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover-lift">
          
          <!-- Rasm va yuqori nishonlar -->
          <div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 mb-3 cursor-pointer product-card-click" data-id="${item.id}">
            <img 
              src="${item.image}" 
              alt="${item.title}" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              loading="lazy"
            />
            
            <div class="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
              ${
                item.badge
                  ? `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${badgeStyle} shadow-sm">${item.badge}</span>`
                  : ""
              }
              ${
                discountPercent
                  ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white self-start shadow-sm">-${discountPercent}%</span>`
                  : ""
              }
            </div>

            <button 
              class="wishlist-btn absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-center text-zinc-500 hover:text-rose-500 transition-colors shadow-sm z-10"
              data-id="${item.id}"
              title="Sevimlilarga qo'shish"
            >
              <i data-lucide="heart" class="w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500 heart-pop" : ""}"></i>
            </button>

            ${isVisualEditMode ? `
              <div class="absolute top-2.5 right-12 flex items-center gap-1 z-20 bg-zinc-900/90 border border-indigo-500/60 p-1 rounded-xl shadow-lg">
                <button type="button" class="visual-prod-edit-btn p-1.5 rounded-lg hover:bg-indigo-600 text-white transition" data-id="${item.id}" title="Mahsulotni tahrirlash">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                </button>
                <button type="button" class="visual-prod-delete-btn p-1.5 rounded-lg hover:bg-rose-600 text-zinc-300 hover:text-white transition" data-id="${item.id}" title="Mahsulotni o'chirish">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            ` : ""}

            <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-zinc-900/75 dark:bg-zinc-950/80 backdrop-blur-md text-[11px] font-medium text-white flex items-center gap-1 z-10">
              <i data-lucide="zap" class="w-3 h-3 text-amber-400"></i>
              <span>${item.deliveryTime || "1 kunda bepul"}</span>
            </div>
          </div>

          <!-- Matn qismi -->
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                <div class="flex items-center text-amber-400">
                  <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>
                  <span class="ml-1 font-semibold text-zinc-800 dark:text-zinc-200 text-xs">${item.rating || 5.0}</span>
                </div>
                <span>•</span>
                <span>(${item.reviewsCount || 10} sharh)</span>
              </div>

              <h3 
                class="font-medium text-zinc-900 dark:text-zinc-100 text-sm leading-snug line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer product-card-click" 
                data-id="${item.id}"
                title="${item.title}"
              >
                ${item.title}
              </h3>
            </div>

            <!-- Narx va Bo'lib to'lash bloki -->
            <div class="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-1">
                <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                  <i data-lucide="calendar" class="w-3 h-3"></i>
                  oyiga <strong>${calculateMonthly(item.price)}</strong>
                </span>
                ${
                  (storeConfig.prepayment?.enabled !== false)
                    ? `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60" title="BTS Pochta orqali buyurtmada oldindan zakalat to'lovi">
                         <i data-lucide="shield-check" class="w-3 h-3"></i>
                         Zakalat: ${formatPrice(item.prepaymentAmount !== undefined ? item.prepaymentAmount : (storeConfig.prepayment?.defaultAmount || 50000))}
                       </span>`
                    : ""
                }
              </div>

              <div class="flex items-end justify-between">
                <div>
                  ${
                    item.oldPrice
                      ? `<div class="text-[11px] text-zinc-400 line-through font-normal">${formatPrice(item.oldPrice)}</div>`
                      : ""
                  }
                  <div class="text-base font-bold text-zinc-900 dark:text-white">
                    ${formatPrice(item.price)}
                  </div>
                  ${item.cargoPrice ? `<div class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 mt-0.5">
                    <i data-lucide="plane" class="w-2.5 h-2.5"></i>
                    <span>Kargo: ${escapeHtml(item.cargoPrice)}</span>
                  </div>` : ""}
                </div>

                <button 
                  class="add-to-cart-btn p-2.5 rounded-2xl bg-zinc-900 hover:bg-indigo-600 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-500 dark:hover:text-white transition-all duration-200 shadow-sm active:scale-95"
                  data-id="${item.id}"
                  title="Savatga qo'shish"
                >
                  <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

          </div>

        </div>
      `;
    }).join("");

    grid.querySelectorAll(".product-card-click").forEach((el) => {
      el.addEventListener("click", () => {
        const id = parseInt(el.getAttribute("data-id"));
        openProductModal(id);
      });
    });

    grid.querySelectorAll(".wishlist-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute("data-id"));
        toggleWishlist(id);
      });
    });

    grid.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute("data-id"));
        addToCart(id);
      });
    });

    if (isVisualEditMode) {
      grid.querySelectorAll(".visual-prod-edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute("data-id"));
          if (window.self !== window.top) {
            window.parent.postMessage({ type: "NOVA_EDIT_PRODUCT", id: id }, "*");
          } else {
            window.open(`admin.html?edit_product=${id}`, "_blank");
          }
        });
      });

      grid.querySelectorAll(".visual-prod-delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute("data-id"));
          deleteVisualProduct(id);
        });
      });
    }

    refreshIcons();
  };

  // --- SEVIMLILARNI ALMASHTIRISH ---
  const toggleWishlist = (id) => {
    const index = wishlist.indexOf(id);
    const product = products.find((p) => p.id === id);
    if (index === -1) {
      wishlist.push(id);
      showToast(`${product ? product.title.slice(0, 24) + "..." : "Mahsulot"} sevimlilarga qo'shildi ❤️`, "heart");
    } else {
      wishlist.splice(index, 1);
      showToast("Sevimlilardan o'chirildi", "trash-2", "info");
    }
    saveWishlist();
    renderProducts();
    if (document.getElementById("wishlist-modal").classList.contains("flex")) {
      renderWishlistModal();
    }
  };

  // --- SAVATGA QO'SHISH ---
  const addToCart = (id, quantity = 1, color = null, size = null) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const chosenColor = color || (product.colors ? product.colors[0] : null);
    const chosenSize = size || (product.sizes ? product.sizes[0] : null);

    const existingIndex = cart.findIndex(
      (item) => item.id === id && item.color === chosenColor && item.size === chosenSize
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        quantity: quantity,
        color: chosenColor,
        size: chosenSize
      });
    }

    saveCart();
    showToast(`${product.title.slice(0, 22)}... savatga qo'shildi! 🛍️`, "shopping-bag");
  };

  // --- SAVAT DRAWERNI CHIQARISH ---
  const renderCartDrawer = () => {
    const container = document.getElementById("cart-items-container");
    const summarySubtotal = document.getElementById("cart-subtotal");
    const summaryDiscount = document.getElementById("cart-discount");
    const summaryTotal = document.getElementById("cart-total");
    const emptyState = document.getElementById("cart-empty");
    const footerState = document.getElementById("cart-footer");

    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      if (footerState) footerState.classList.add("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (footerState) footerState.classList.remove("hidden");

    let subtotal = 0;

    container.innerHTML = cart.map((item, index) => {
      const prod = products.find((p) => p.id === item.id);
      if (!prod) return "";

      const itemTotal = prod.price * item.quantity;
      subtotal += itemTotal;

      return `
        <div class="flex gap-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <img src="${prod.image}" alt="${prod.title}" class="w-20 h-20 rounded-xl object-cover bg-white" />
          
          <div class="flex-1 flex flex-col justify-between">
            <div class="flex justify-between items-start gap-2">
              <h4 class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">${prod.title}</h4>
              <button class="cart-remove-btn text-zinc-400 hover:text-rose-500 p-1" data-index="${index}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>

            <div class="text-[11px] text-zinc-500 dark:text-zinc-400">
              ${item.color ? `<span>Rang: <b>${item.color}</b></span>` : ""}
              ${item.size ? `<span class="ml-2">O'lcham: <b>${item.size}</b></span>` : ""}
            </div>

            <div class="flex items-center justify-between mt-2">
              <div class="text-xs font-bold text-zinc-900 dark:text-white">${formatPrice(itemTotal)}</div>
              
              <div class="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1">
                <button class="cart-qty-btn text-zinc-500 hover:text-zinc-900 dark:hover:text-white" data-index="${index}" data-delta="-1">
                  <i data-lucide="minus" class="w-3 h-3"></i>
                </button>
                <span class="text-xs font-semibold px-1 text-zinc-800 dark:text-zinc-200">${item.quantity}</span>
                <button class="cart-qty-btn text-zinc-500 hover:text-zinc-900 dark:hover:text-white" data-index="${index}" data-delta="1">
                  <i data-lucide="plus" class="w-3 h-3"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    let discountAmount = 0;
    if (appliedDiscount > 0) {
      discountAmount = Math.round((subtotal * appliedDiscount) / 100);
    }
    const finalTotal = Math.max(0, subtotal - discountAmount);

    if (summarySubtotal) summarySubtotal.textContent = formatPrice(subtotal);
    if (summaryDiscount) {
      summaryDiscount.textContent = discountAmount > 0 ? `-${formatPrice(discountAmount)}` : "0 so'm";
    }
    if (summaryTotal) summaryTotal.textContent = formatPrice(finalTotal);

    container.querySelectorAll(".cart-remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        cart.splice(idx, 1);
        saveCart();
        renderCartDrawer();
      });
    });

    container.querySelectorAll(".cart-qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        const delta = parseInt(btn.getAttribute("data-delta"));
        cart[idx].quantity += delta;
        if (cart[idx].quantity <= 0) {
          cart.splice(idx, 1);
        }
        saveCart();
        renderCartDrawer();
      });
    });

    refreshIcons();
  };

  // --- SEVIMLILAR MODALINI CHIQARISH ---
  const renderWishlistModal = () => {
    const container = document.getElementById("wishlist-items-container");
    const emptyState = document.getElementById("wishlist-empty");
    if (!container) return;

    if (wishlist.length === 0) {
      container.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    const favProducts = products.filter((p) => wishlist.includes(p.id));

    container.innerHTML = favProducts.map((p) => {
      return `
        <div class="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <img src="${p.image}" alt="${p.title}" class="w-16 h-16 rounded-xl object-cover bg-white" />
          <div class="flex-1">
            <h4 class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">${p.title}</h4>
            <div class="text-xs font-bold text-zinc-900 dark:text-white mt-1">${formatPrice(p.price)}</div>
            <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">1 kunda bepul yetkazish</div>
          </div>
          <div class="flex items-center gap-2">
            <button class="wishlist-add-cart p-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-indigo-600 text-xs font-medium" data-id="${p.id}" title="Savatga solish">
              <i data-lucide="shopping-bag" class="w-4 h-4"></i>
            </button>
            <button class="wishlist-remove p-2 rounded-xl text-zinc-400 hover:text-rose-500" data-id="${p.id}" title="O'chirish">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".wishlist-add-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        addToCart(id);
      });
    });

    container.querySelectorAll(".wishlist-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        toggleWishlist(id);
      });
    });

    refreshIcons();
  };

  // --- MAHSULOTNING BATAFSIL MODAL OYNASI ---
  const openProductModal = (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    selectedProductForModal = product;
    currentModalImageIndex = 0;
    selectedColor = product.colors ? product.colors[0] : "";
    selectedSize = product.sizes ? product.sizes[0] : "";

    const modal = document.getElementById("product-modal");
    if (!modal) return;

    document.getElementById("modal-category").textContent = product.categoryName || product.category;
    document.getElementById("modal-title").textContent = product.title;
    document.getElementById("modal-price").textContent = formatPrice(product.price);
    
    const oldPriceEl = document.getElementById("modal-old-price");
    if (product.oldPrice) {
      oldPriceEl.textContent = formatPrice(product.oldPrice);
      oldPriceEl.classList.remove("hidden");
    } else {
      oldPriceEl.classList.add("hidden");
    }

    document.getElementById("modal-monthly").textContent = `oyiga ${calculateMonthly(product.price)}`;
    const modalZakalatEl = document.getElementById("modal-zakalat");
    if (modalZakalatEl) {
      if (storeConfig.prepayment?.enabled !== false) {
        const itemZakalat = product.prepaymentAmount !== undefined ? product.prepaymentAmount : (storeConfig.prepayment?.defaultAmount || 50000);
        modalZakalatEl.innerHTML = `<i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Zakalat: ${formatPrice(itemZakalat)}`;
        modalZakalatEl.classList.remove("hidden");
      } else {
        modalZakalatEl.classList.add("hidden");
      }
    }

    // Kargo narxini ko'rsatish
    const cargoWrapper = document.getElementById("modal-cargo-wrapper");
    const cargoVal = document.getElementById("modal-cargo-val");
    if (cargoWrapper && cargoVal) {
      if (product.cargoPrice) {
        cargoVal.textContent = product.cargoPrice;
        cargoWrapper.classList.remove("hidden");
      } else {
        cargoWrapper.classList.add("hidden");
      }
    }

    document.getElementById("modal-rating").textContent = product.rating || 5.0;
    document.getElementById("modal-reviews").textContent = `(${product.reviewsCount || 10} sharh)`;
    document.getElementById("modal-description").textContent = product.description || "Mahsulot tavsifi.";

    // Galereya
    const mainImg = document.getElementById("modal-main-img");
    const thumbnailsContainer = document.getElementById("modal-thumbnails");
    const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];

    mainImg.src = imagesList[0];
    thumbnailsContainer.innerHTML = imagesList.map((imgUrl, i) => `
      <button class="thumbnail-btn w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
        i === 0 ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100"
      }" data-idx="${i}">
        <img src="${imgUrl}" class="w-full h-full object-cover" />
      </button>
    `).join("");

    thumbnailsContainer.querySelectorAll(".thumbnail-btn").forEach((tBtn) => {
      tBtn.addEventListener("click", () => {
        const idx = parseInt(tBtn.getAttribute("data-idx"));
        currentModalImageIndex = idx;
        mainImg.src = imagesList[idx];
        thumbnailsContainer.querySelectorAll(".thumbnail-btn").forEach((b, bi) => {
          b.className = `thumbnail-btn w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
            bi === idx ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100"
          }`;
        });
      });
    });

    // Ranglar tanlovi (rang bosilganda rasm almashadi, o'chirilgan ranglar ko'rsatiladi)
    const colorsContainer = document.getElementById("modal-colors");
    if (product.colors && product.colors.length > 0) {
      colorsContainer.parentElement.classList.remove("hidden");
      const disabledColorsList = product.disabledColors || [];
      const colorImgs = product.colorImages || {};

      const colorImgsIndexed = {};
      Object.keys(colorImgs).forEach(c => {
        const idx = imagesList.indexOf(colorImgs[c]);
        if (idx !== -1) colorImgsIndexed[c] = idx;
      });

      colorsContainer.innerHTML = product.colors.map((c, i) => {
        const isDisabled = disabledColorsList.includes(c);
        const hasImg = colorImgs[c] !== undefined;
        const imgIdx = colorImgsIndexed[c];
        return `<button class="color-select-btn px-3 py-1.5 rounded-xl border text-xs font-medium transition relative ${
          isDisabled
            ? "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed line-through"
            : i === 0
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
              : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
        }" data-color="${c}" data-img-idx="${hasImg && imgIdx !== undefined ? imgIdx : -1}" ${isDisabled ? "disabled title=\"Mavjud emas\"" : ""}>
          ${c}${isDisabled ? '<span class="ml-1 text-[9px] not-italic">(Mavjud emas)</span>' : ""}
          ${hasImg && !isDisabled ? '<span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-zinc-900"></span>' : ""}
        </button>`;
      }).join("");

      colorsContainer.querySelectorAll(".color-select-btn:not([disabled])").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectedColor = btn.getAttribute("data-color");
          const imgIdx = parseInt(btn.getAttribute("data-img-idx") || "-1");

          // Rasm almashtirish (agar rang uchun rasm bog'langan bo'lsa)
          if (imgIdx >= 0 && imgIdx < imagesList.length && mainImg) {
            mainImg.src = imagesList[imgIdx];
            thumbnailsContainer.querySelectorAll(".thumbnail-btn").forEach((b, bi) => {
              b.className = `thumbnail-btn w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                bi === imgIdx ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100"
              }`;
            });
          }

          colorsContainer.querySelectorAll(".color-select-btn").forEach((b) => {
            if (!b.disabled) {
              b.className = "color-select-btn px-3 py-1.5 rounded-xl border text-xs font-medium transition relative border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400";
            }
          });
          btn.className = "color-select-btn px-3 py-1.5 rounded-xl border text-xs font-medium transition relative border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900";
        });
      });
    } else {
      colorsContainer.parentElement.classList.add("hidden");
    }

    // O'lchamlar tanlovi (o'chirilgan o'lchamlar ko'rsatiladi)
    const sizesContainer = document.getElementById("modal-sizes");
    if (product.sizes && product.sizes.length > 0) {
      sizesContainer.parentElement.classList.remove("hidden");
      const disabledSizesList = product.disabledSizes || [];

      sizesContainer.innerHTML = product.sizes.map((s, i) => {
        const isDisabled = disabledSizesList.includes(s);
        return `<button class="size-select-btn px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
          isDisabled
            ? "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed line-through"
            : i === 0
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
              : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
        }" data-size="${s}" ${isDisabled ? "disabled title=\"Mavjud emas\"" : ""}>
          ${s}${isDisabled ? '<span class="ml-1 text-[9px]">(Yo\'q)</span>' : ""}
        </button>`;
      }).join("");

      sizesContainer.querySelectorAll(".size-select-btn:not([disabled])").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectedSize = btn.getAttribute("data-size");
          sizesContainer.querySelectorAll(".size-select-btn").forEach((b) => {
            if (!b.disabled) {
              b.className = "size-select-btn px-3 py-1.5 rounded-xl border text-xs font-medium transition border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400";
            }
          });
          btn.className = "size-select-btn px-3 py-1.5 rounded-xl border text-xs font-medium transition border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900";
        });
      });
    } else {
      sizesContainer.parentElement.classList.add("hidden");
    }

    // Xarakteristikalar
    const specsContainer = document.getElementById("modal-specs");
    if (product.specs) {
      specsContainer.innerHTML = Object.entries(product.specs).map(([key, val]) => `
        <div class="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-xs">
          <span class="text-zinc-500 dark:text-zinc-400">${key}:</span>
          <span class="font-medium text-zinc-900 dark:text-zinc-100 text-right">${val}</span>
        </div>
      `).join("");
    } else {
      specsContainer.innerHTML = "<p class='text-xs text-zinc-400'>Xususiyatlar ko'rsatilmagan</p>";
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
    refreshIcons();
  };

  // --- KUNNING TAKLIFI TAYMERI ---
  const initCountdown = () => {
    const hoursEl = document.getElementById("timer-hours");
    const minutesEl = document.getElementById("timer-minutes");
    const secondsEl = document.getElementById("timer-seconds");

    if (!hoursEl || !minutesEl || !secondsEl) return;

    let targetTime = new Date();
    targetTime.setHours(targetTime.getHours() + 6);
    targetTime.setMinutes(42);
    targetTime.setSeconds(15);

    const updateTimer = () => {
      const now = new Date();
      const diff = targetTime - now;

      if (diff <= 0) {
        targetTime = new Date();
        targetTime.setHours(targetTime.getHours() + 8);
        return;
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      hoursEl.textContent = String(h).padStart(2, "0");
      minutesEl.textContent = String(m).padStart(2, "0");
      secondsEl.textContent = String(s).padStart(2, "0");
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  };

  // --- EVENT LISTENERLARNI ULASH ---

  // Qidiruv inputi
  document.getElementById("search-input")?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  // Saralash
  document.getElementById("sort-select")?.addEventListener("change", (e) => {
    sortBy = e.target.value;
    renderProducts();
  });

  // Dark mode
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("nova_dark_mode", isDark);
    showToast(isDark ? "Tungi rejim yoqildi 🌙" : "Kunduzgi rejim yoqildi ☀️", isDark ? "moon" : "sun");
  });

  // Savat ochish va yopish
  const cartDrawer = document.getElementById("cart-drawer");
  const cartBackdrop = document.getElementById("cart-backdrop");
  const openCartBtn = document.getElementById("open-cart-btn");
  const mobileCartBtn = document.getElementById("mobile-cart-btn");
  const closeCartBtn = document.getElementById("close-cart-btn");

  const openCart = () => {
    renderCartDrawer();
    cartDrawer.classList.remove("translate-x-full");
    cartBackdrop.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  };

  const closeCart = () => {
    cartDrawer.classList.add("translate-x-full");
    cartBackdrop.classList.add("hidden");
    document.body.style.overflow = "auto";
  };

  if (openCartBtn) openCartBtn.addEventListener("click", openCart);
  if (mobileCartBtn) mobileCartBtn.addEventListener("click", openCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener("click", closeCart);

  // Sevimlilar modal ochish va yopish
  const wishlistModal = document.getElementById("wishlist-modal");
  const openWishlistBtn = document.getElementById("open-wishlist-btn");
  const mobileWishlistBtn = document.getElementById("mobile-wishlist-btn");
  const closeWishlistBtn = document.getElementById("close-wishlist-btn");

  const openWishlist = () => {
    renderWishlistModal();
    wishlistModal.classList.remove("hidden");
    wishlistModal.classList.add("flex");
    document.body.style.overflow = "hidden";
  };

  const closeWishlist = () => {
    wishlistModal.classList.add("hidden");
    wishlistModal.classList.remove("flex");
    document.body.style.overflow = "auto";
  };

  if (openWishlistBtn) openWishlistBtn.addEventListener("click", openWishlist);
  if (mobileWishlistBtn) mobileWishlistBtn.addEventListener("click", openWishlist);
  if (closeWishlistBtn) closeWishlistBtn.addEventListener("click", closeWishlist);

  // Mahsulot modal yopish
  const productModal = document.getElementById("product-modal");
  const closeProductModalBtn = document.getElementById("close-product-modal-btn");
  const modalAddToCartBtn = document.getElementById("modal-add-to-cart-btn");
  const modalFastBuyBtn = document.getElementById("modal-fast-buy-btn");

  const closeProductModal = () => {
    productModal.classList.add("hidden");
    productModal.classList.remove("flex");
    document.body.style.overflow = "auto";
  };

  if (closeProductModalBtn) closeProductModalBtn.addEventListener("click", closeProductModal);

  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener("click", () => {
      if (selectedProductForModal) {
        addToCart(selectedProductForModal.id, 1, selectedColor, selectedSize);
        closeProductModal();
      }
    });
  }

  if (modalFastBuyBtn) {
    modalFastBuyBtn.addEventListener("click", () => {
      if (selectedProductForModal) {
        addToCart(selectedProductForModal.id, 1, selectedColor, selectedSize);
        closeProductModal();
        openCheckout();
      }
    });
  }

  // Dinamik Promokod kiritish (Ixtiyoriy)
  const applyPromoBtn = document.getElementById("apply-promo-btn");
  const promoInput = document.getElementById("promo-input");
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener("click", () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) {
        appliedDiscount = 0;
        appliedPromoCode = "";
        renderCartDrawer();
        showToast("Promokod kiritilmadi (ixtiyoriy)", "info");
        return;
      }

      const validCodes = storeConfig.promoCodes || DEFAULT_STORE_CONFIG.promoCodes || [];
      const matched = validCodes.find(p => p.code.toUpperCase() === code);

      if (matched) {
        appliedDiscount = matched.discount;
        appliedPromoCode = matched.code;
        showToast(`Promokod qabul qilindi: -${matched.discount}% chegirma! 🎉`, "gift");
        renderCartDrawer();
      } else {
        showToast("Noto'g'ri promokod. Promokod ixtiyoriy, kiritmasdan ham xarid qilishingiz mumkin.", "alert-circle", "info");
      }
    });
  }

  // ========================================================
  // 🚚 BTS EXPRESS POCHTA SOZLAMALARINI BOSHQARISH
  // ========================================================
  const initBtsDelivery = () => {
    const regionSelect = document.getElementById("checkout-region");
    const branchSelect = document.getElementById("checkout-bts-branch");
    const branchWrapper = document.getElementById("bts-branch-wrapper");
    const addressLabel = document.getElementById("checkout-address-label");
    const addressInput = document.getElementById("checkout-address");
    const deliveryTypeRadios = document.querySelectorAll('input[name="deliveryType"]');

    if (!regionSelect || !branchSelect) return;

    const btsData = typeof BTS_REGIONS_DATA !== "undefined" ? BTS_REGIONS_DATA : {};
    const regions = Object.keys(btsData);

    // Viloyatlar ro'yxatini to'ldirish
    regionSelect.innerHTML = regions.map(reg => `<option value="${reg}">${reg}</option>`).join("");

    const updateBranches = () => {
      const selectedReg = regionSelect.value;
      const branches = btsData[selectedReg] || [];
      branchSelect.innerHTML = branches.map(br => `<option value="${br}">${br}</option>`).join("");
    };

    regionSelect.addEventListener("change", updateBranches);
    updateBranches();

    const btsStandardWrapper = document.getElementById("bts-standard-delivery-wrapper");
    const fastWrapper = document.getElementById("fast-delivery-wrapper");
    const fastLocationSelect = document.getElementById("checkout-fast-location");

    const updateDeliveryUI = () => {
      const val = document.querySelector('input[name="deliveryType"]:checked')?.value;

      if (val === "⚡ Eng tezkor pochta") {
        // Fast delivery mode
        if (btsStandardWrapper) btsStandardWrapper.classList.add("hidden");
        if (fastWrapper) fastWrapper.classList.remove("hidden");

        // Populate fast locations from storeConfig
        if (fastLocationSelect) {
          const locs = (storeConfig && storeConfig.fastDeliveryLocations) 
            ? storeConfig.fastDeliveryLocations 
            : (typeof DEFAULT_STORE_CONFIG !== "undefined" ? DEFAULT_STORE_CONFIG.fastDeliveryLocations : []);
          
          if (!locs || locs.length === 0) {
            fastLocationSelect.innerHTML = `<option value="">— Admin hali manzil qo'shmagan —</option>`;
          } else {
            fastLocationSelect.innerHTML = locs.map(loc =>
              `<option value="${escapeHtml(loc.name)}">${escapeHtml(loc.name)} (${escapeHtml(loc.time || "Tezkor")})</option>`
            ).join("");
          }
        }

        if (addressLabel) addressLabel.textContent = "Qo'shimcha ko'rsatma (ixtiyoriy):";
        if (addressInput) {
          addressInput.placeholder = "Eshik raqami, mo'ljal...";
          addressInput.required = false;
        }
      } else if (val === "BTS Kuryeri (Eshikkacha)") {
        if (btsStandardWrapper) btsStandardWrapper.classList.remove("hidden");
        if (fastWrapper) fastWrapper.classList.add("hidden");
        if (branchWrapper) branchWrapper.classList.add("hidden");
        if (addressLabel) addressLabel.textContent = "To'liq ko'cha, uy va xonadon raqami (Kuryer uchun):";
        if (addressInput) {
          addressInput.placeholder = "Shahar, ko'cha, uy va xonadon raqami";
          addressInput.required = true;
        }
      } else {
        // BTS Bo'limidan olish (default)
        if (btsStandardWrapper) btsStandardWrapper.classList.remove("hidden");
        if (fastWrapper) fastWrapper.classList.add("hidden");
        if (branchWrapper) branchWrapper.classList.remove("hidden");
        if (addressLabel) addressLabel.textContent = "Qo'shimcha manzil yoki mo'ljal:";
        if (addressInput) {
          addressInput.placeholder = "Ko'cha, mo'ljal yoki pasport seriyasi (ixtiyoriy)";
          addressInput.required = false;
        }
      }
    };

    deliveryTypeRadios.forEach(radio => {
      radio.addEventListener("change", updateDeliveryUI);
    });
    updateDeliveryUI();
  };

  // Buyurtma berish (Checkout) modal
  const checkoutModal = document.getElementById("checkout-modal");
  const proceedCheckoutBtn = document.getElementById("proceed-checkout-btn");
  const closeCheckoutBtn = document.getElementById("close-checkout-btn");
  const checkoutForm = document.getElementById("checkout-form");

  const openCheckout = () => {
    if (cart.length === 0) {
      showToast("Savatingiz bo'sh!", "shopping-bag", "info");
      return;
    }

    closeCart();
    initBtsDelivery();

    // 1. Hisob-kitoblar (Jami, Zakalat va Qoldiq)
    const orderSubtotal = cart.reduce((acc, item) => {
      const p = products.find(prod => prod.id === item.id);
      return acc + ((p ? p.price : 0) * item.quantity);
    }, 0);
    const orderDiscountAmount = appliedDiscount > 0 ? Math.round((orderSubtotal * appliedDiscount) / 100) : 0;
    const orderTotal = Math.max(0, orderSubtotal - orderDiscountAmount);

    const defaultZakalat = storeConfig.prepayment?.defaultAmount || 50000;
    let totalZakalat = cart.reduce((acc, item) => {
      const p = products.find(prod => prod.id === item.id);
      const itemZakalat = (p && p.prepaymentAmount !== undefined) ? p.prepaymentAmount : defaultZakalat;
      return acc + (itemZakalat * item.quantity);
    }, 0);

    if (totalZakalat > orderTotal) {
      totalZakalat = orderTotal;
    }
    const remainingBalance = Math.max(0, orderTotal - totalZakalat);

    // 2. Karta va hisob-kitob UI elementlarini to'ldirish
    const zakalatEl = document.getElementById("checkout-zakalat-amount");
    const remainEl = document.getElementById("checkout-remaining-amount");
    if (zakalatEl) zakalatEl.textContent = formatPrice(totalZakalat);
    if (remainEl) remainEl.textContent = formatPrice(remainingBalance);

    const prepCfg = storeConfig.prepayment || {};
    const cardNumEl = document.getElementById("checkout-card-number");
    const cardHolderEl = document.getElementById("checkout-card-holder");
    const cardBankEl = document.getElementById("checkout-card-bank");

    if (cardNumEl) cardNumEl.textContent = prepCfg.cardNumber || "8600 5304 1234 5678";
    if (cardHolderEl) cardHolderEl.textContent = prepCfg.cardHolder || "SARDOR ALIYEV (NOVA)";
    if (cardBankEl) cardBankEl.textContent = prepCfg.cardBank || "Uzcard / Humo";

    // 3. Karta raqamidan nusxa olish
    const copyCardBtn = document.getElementById("copy-card-btn");
    if (copyCardBtn) {
      copyCardBtn.onclick = () => {
        const rawCard = (cardNumEl ? cardNumEl.textContent : "").replace(/\s+/g, "");
        if (navigator.clipboard) {
          navigator.clipboard.writeText(rawCard).then(() => {
            showToast("Karta raqami nusxalandi! 💳", "copy");
          }).catch(() => {
            showToast("Karta raqami: " + rawCard, "copy");
          });
        } else {
          showToast("Karta raqami: " + rawCard, "copy");
        }
      };
    }

    // 4. To'lov usullarini interaktiv almashtirish (Radio buttons)
    const prepBox = document.getElementById("prepayment-details-box");
    const submitBtn = document.getElementById("submit-order-btn");
    const cardFullLabel = document.getElementById("payment-card-full");
    const cardZakalatLabel = document.getElementById("payment-card-zakalat");
    const paymentRadios = document.querySelectorAll('input[name="payment"]');

    const updatePaymentSelection = () => {
      const selectedVal = document.querySelector('input[name="payment"]:checked')?.value || "";
      const isZakalat = selectedVal.includes("Zakalat");

      if (isZakalat) {
        if (prepBox) prepBox.classList.remove("hidden");
        if (cardZakalatLabel) {
          cardZakalatLabel.classList.add("border-amber-500", "bg-amber-50/50", "dark:bg-amber-950/20");
          cardZakalatLabel.classList.remove("border-zinc-200", "dark:border-zinc-700", "bg-white", "dark:bg-zinc-800");
        }
        if (cardFullLabel) {
          cardFullLabel.classList.remove("border-indigo-600", "bg-indigo-50/40", "dark:bg-indigo-950/20");
          cardFullLabel.classList.add("border-zinc-200", "dark:border-zinc-700", "bg-white", "dark:bg-zinc-800");
        }
        if (submitBtn) {
          submitBtn.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4"></i><span>Zakalat to'lovi bilan tasdiqlash (${formatPrice(totalZakalat)})</span>`;
          submitBtn.className = "w-full mt-4 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2";
        }
      } else {
        if (prepBox) prepBox.classList.add("hidden");
        if (cardFullLabel) {
          cardFullLabel.classList.add("border-indigo-600", "bg-indigo-50/40", "dark:bg-indigo-950/20");
          cardFullLabel.classList.remove("border-zinc-200", "dark:border-zinc-700", "bg-white", "dark:bg-zinc-800");
        }
        if (cardZakalatLabel) {
          cardZakalatLabel.classList.remove("border-amber-500", "bg-amber-50/50", "dark:bg-amber-950/20");
          cardZakalatLabel.classList.add("border-zinc-200", "dark:border-zinc-700", "bg-white", "dark:bg-zinc-800");
        }
        if (submitBtn) {
          submitBtn.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i><span>Buyurtmani tasdiqlash (${formatPrice(orderTotal)})</span>`;
          submitBtn.className = "w-full mt-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2";
        }
      }
      refreshIcons();
    };

    paymentRadios.forEach(radio => {
      radio.onchange = updatePaymentSelection;
    });
    updatePaymentSelection();

    checkoutModal.classList.remove("hidden");
    checkoutModal.classList.add("flex");
    document.body.style.overflow = "hidden";
  };

  const closeCheckout = () => {
    checkoutModal.classList.add("hidden");
    checkoutModal.classList.remove("flex");
    document.body.style.overflow = "auto";
  };

  if (proceedCheckoutBtn) proceedCheckoutBtn.addEventListener("click", openCheckout);
  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener("click", closeCheckout);

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = escapeHtml(document.getElementById("checkout-name").value.trim());
      const phone = escapeHtml(document.getElementById("checkout-phone").value.trim());
      const telegram = escapeHtml(document.getElementById("checkout-telegram")?.value.trim() || "");
      const fullDeliveryAddress = escapeHtml(document.getElementById("checkout-address")?.value.trim() || "Manzil ko'rsatilmadi");
      const paymentMethod = "Naqd / Karta (Operator bilan kelishiladi)";

      const orderNumber = Math.floor(100000 + Math.random() * 900000);
      const orderDateText = new Date().toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" });

      // Buyurtmani hisoblash va ro'yxatni shakllantirish
      const orderItemsList = cart.map(item => {
        const p = products.find(prod => prod.id === item.id);
        return {
          id: item.id,
          title: p ? p.title : "Mahsulot",
          price: p ? p.price : 0,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          image: p ? p.image : "",
          prepaymentAmount: 0
        };
      });

      const orderSubtotal = orderItemsList.reduce((acc, it) => acc + (it.price * it.quantity), 0);
      const orderDiscountAmount = appliedDiscount > 0 ? Math.round((orderSubtotal * appliedDiscount) / 100) : 0;
      const orderTotal = Math.max(0, orderSubtotal - orderDiscountAmount);

      const isPrepayment = false;
      const prepAmount = 0;
      const remainAmount = orderTotal;
      const orderStatus = "Yangi";

      if (window.confetti) {
        window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }

      document.getElementById("checkout-form-container").classList.add("hidden");
      const successContainer = document.getElementById("checkout-success-container");
      successContainer.classList.remove("hidden");

      document.getElementById("order-number").textContent = `#${orderNumber}`;
      document.getElementById("order-summary-text").innerHTML = 
        `Hurmatli <b>${name}</b>, buyurtmangiz muvaffaqiyatli qabul qilindi!<br>` +
        `📦 Buyurtmangiz O'zbekiston bo'ylab uzog'i <b>10 kun ichida</b> yetkazib beriladi.<br>` +
        `Do'kon egasi / operator tez orada <b>${phone}</b> raqamingiz${telegram ? ` yoki Telegram (<b>${telegram}</b>)` : ""} orqali siz bilan aloqaga chiqadi.`;

      const currentOrders = JSON.parse(localStorage.getItem("nova_orders")) || [];
      const newOrderData = {
        id: orderNumber,
        customerName: name,
        phone: phone,
        telegram: telegram,
        deliveryType: "Uzog'i 10 kunda yetkazib berish",
        btsRegion: "",
        btsBranch: "",
        notes: telegram ? `Telegram: ${telegram}` : "",
        address: fullDeliveryAddress,
        paymentMethod: paymentMethod,
        isPrepayment: false,
        prepaymentAmount: 0,
        remainingAmount: orderTotal,
        items: orderItemsList,
        subtotal: orderSubtotal,
        discount: orderDiscountAmount,
        total: orderTotal,
        status: orderStatus,
        createdAt: orderDateText
      };

      currentOrders.unshift(newOrderData);
      localStorage.setItem("nova_orders", JSON.stringify(currentOrders));

      // 1. Zaxira Telegram havolasi (Manual fallback)
      const cartItemsSummary = cart.map(item => {
        const p = products.find(prod => prod.id === item.id);
        const variant = [item.color, item.size].filter(Boolean).join(", ");
        return p ? `• ${p.title} ${variant ? `(${variant})` : ""} x ${item.quantity} dona = ${formatPrice(p.price * item.quantity)}` : "";
      }).filter(Boolean).join("\n");

      const tgRawText = `🛍 Yangi Buyurtma #${orderNumber}\n\n` +
        `👤 Mijoz: ${name}\n` +
        `📞 Tel: ${phone}\n` +
        (telegram ? `💬 Telegram: ${telegram}\n` : "") +
        `📍 Manzil: ${fullDeliveryAddress}\n` +
        `🚚 Yetkazish: O'zbekiston bo'ylab (uzog'i 10 kunda)\n` +
        `💰 Jami: ${formatPrice(orderTotal)}\n\n` +
        `📦 Mahsulotlar:\n${cartItemsSummary}`;

      const tgBtn = document.getElementById("send-telegram-btn");
      if (tgBtn) {
        const tgTarget = storeConfig.contacts?.telegram?.replace("@", "") || "novamarket_bot";
        tgBtn.href = `https://t.me/${tgTarget}?text=${encodeURIComponent(tgRawText)}`;
      }

      // 2. ⚡ AVTOMATIK TELEGRAM BOTGA YUBORISH
      const autoStatusEl = document.getElementById("telegram-auto-status");
      const botToken = storeConfig.contacts?.telegramBotToken?.trim();
      const chatId = storeConfig.contacts?.telegramChatId?.trim();
      const autoSendEnabled = storeConfig.contacts?.telegramAutoSend !== false;

      if (botToken && chatId && autoSendEnabled) {
        if (autoStatusEl) {
          autoStatusEl.className = "p-3.5 rounded-2xl text-xs max-w-sm mx-auto flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800";
          autoStatusEl.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-500"></i><span>Telegram botga avtomatik yuborilmoqda...</span>`;
          refreshIcons();
        }

        const cartHtmlList = cart.map(item => {
          const p = products.find(prod => prod.id === item.id);
          const variant = [item.color, item.size].filter(Boolean).join(", ");
          return p ? `• <b>${escapeHtml(p.title)}</b> ${variant ? `<i>(${escapeHtml(variant)})</i>` : ""} — ${item.quantity} dona x ${formatPrice(p.price)}` : "";
        }).filter(Boolean).join("\n");

        const tgHtmlMsg = `🛒 <b>YANGI BUYURTMA #${orderNumber}</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 <b>Mijoz:</b> ${name}\n` +
          `📞 <b>Telefon:</b> <code>${phone}</code>\n` +
          `${telegram ? `💬 <b>Telegram:</b> ${telegram}\n` : ""}` +
          `📍 <b>Manzil:</b> ${fullDeliveryAddress}\n` +
          `🚚 <b>Yetkazish:</b> O'zbekiston bo'ylab (uzog'i 10 kunda)\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💰 <b>Oraliq narx:</b> ${formatPrice(orderSubtotal)}\n` +
          `${orderDiscountAmount > 0 ? `🎁 <b>Chegirma:</b> -${formatPrice(orderDiscountAmount)} (${appliedPromoCode})\n` : ""}` +
          `💵 <b>JAMI BUYURTMA:</b> <b>${formatPrice(orderTotal)}</b>\n\n` +
          `📦 <b>Mahsulotlar:</b>\n${cartHtmlList}\n\n` +
          `🕒 <b>Vaqt:</b> ${orderDateText}\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `⚡ <i>${storeConfig.brand?.name || "NOVA"} Market tizimidan qabul qilindi</i>`;
        try {
          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: tgHtmlMsg,
              parse_mode: "HTML"
            })
          });
          const resData = await response.json();

          if (resData.ok) {
            if (autoStatusEl) {
              autoStatusEl.className = "p-3.5 rounded-2xl text-xs max-w-sm mx-auto flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
              autoStatusEl.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i><span>Buyurtma avtomatik Telegram botingizga yuborildi! 🚀</span>`;
            }
          } else {
            console.error("Telegram bot API xatosi:", resData);
            if (autoStatusEl) {
              autoStatusEl.className = "p-3.5 rounded-2xl text-xs max-w-sm mx-auto flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
              autoStatusEl.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 text-amber-500"></i><span>Telegram bot xatosi (${resData.description || "yuborilmadi"}). Operator havolasidan foydalaning.</span>`;
            }
          }
        } catch (fetchErr) {
          console.error("Telegram fetch xatosi:", fetchErr);
          if (autoStatusEl) {
            autoStatusEl.className = "p-3.5 rounded-2xl text-xs max-w-sm mx-auto flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
            autoStatusEl.innerHTML = `<i data-lucide="wifi-off" class="w-4 h-4 text-amber-500"></i><span>Ulanish xatosi. Quyidagi havola orqali Telegramga yuboring.</span>`;
          }
        }
      } else {
        if (autoStatusEl) {
          autoStatusEl.className = "p-3.5 rounded-2xl text-xs max-w-sm mx-auto flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700";
          autoStatusEl.innerHTML = `<i data-lucide="info" class="w-4 h-4 text-zinc-400"></i><span>Telegram bot ulanmagan. Buyurtmani pastdagi havola orqali operatorga yuboring.</span>`;
        }
      }

      cart = [];
      appliedDiscount = 0;
      saveCart();
      refreshIcons();
    });
  }

  // Yangi buyurtma oynasini yopish
  document.getElementById("finish-order-btn")?.addEventListener("click", () => {
    closeCheckout();
    document.getElementById("checkout-form-container").classList.remove("hidden");
    document.getElementById("checkout-success-container").classList.add("hidden");
    checkoutForm.reset();
    renderProducts();
  });

  // Maxfiy klaviatura kombinatsiyasi (Ctrl + Shift + A) orqali admin panelga o'tish
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
      window.location.href = "admin.html";
    }
  });

  // ESC tugmasi bilan modallarni yopish
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCart();
      closeWishlist();
      closeProductModal();
      closeCheckout();
    }
  });

  // ========================================================
  // ⚡ REAL-TIME BRAUZERLARARO SINXRONIZATSIYA (STORAGE EVENT)
  // ========================================================
  window.addEventListener("storage", (e) => {
    if (
      e.key === "nova_store_config" || 
      e.key === "nova_products" || 
      e.key === "nova_categories"
    ) {
      products = JSON.parse(localStorage.getItem("nova_products")) || INITIAL_PRODUCTS;
      storeConfig = JSON.parse(localStorage.getItem("nova_store_config")) || DEFAULT_STORE_CONFIG;
      categories = JSON.parse(localStorage.getItem("nova_categories")) || CATEGORIES;
      
      applyStoreConfig();
      renderCategories();
      renderProducts();
      renderCartDrawer();
      showToast("Do'kon yangilandi! ⚡", "refresh-cw");
    }
  });

  // ========================================================
  // 🎨 VIZUAL DO'KON MUHARRIRI (VISUAL STOREFRONT BUILDER)
  // ========================================================

  // Mahsulotni vizual rejimdan o'chirish
  const deleteVisualProduct = (id) => {
    const item = products.find(p => p.id === id);
    if (!item) return;
    if (confirm(`"${item.title}" mahsulotini o'chirishni tasdiqlaysizmi?`)) {
      products = products.filter(p => p.id !== id);
      localStorage.setItem("nova_products", JSON.stringify(products));
      renderProducts();
      renderFlashDeal();
      showToast(`"${item.title.slice(0, 20)}..." o'chirildi! 🗑️`, "trash-2", "info");
    }
  };

  // Vizual tahrirlash rejimini yoqish/o'chirish
  const setVisualEditMode = (enable) => {
    isVisualEditMode = enable;
    document.body.classList.toggle("visual-edit-mode", isVisualEditMode);

    const dock = document.getElementById("visual-builder-dock");
    if (dock) {
      if (isVisualEditMode) {
        dock.classList.remove("hidden");
        dock.classList.add("flex");
      } else {
        dock.classList.add("hidden");
        dock.classList.remove("flex");
      }
    }

    // Inline tugmalar (+ Toifa, + Mahsulot)
    document.querySelectorAll(".visual-edit-inline").forEach(btn => {
      btn.classList.toggle("hidden", !isVisualEditMode);
    });

    const toggleBtn = document.getElementById("visual-mode-toggle-btn");
    if (toggleBtn) {
      if (window.self !== window.top) {
        toggleBtn.classList.add("hidden");
      } else {
        toggleBtn.innerHTML = isVisualEditMode 
          ? `<i data-lucide="eye" class="w-4 h-4"></i><span>Ko'rish Rejimi</span>`
          : `<i data-lucide="edit-3" class="w-4 h-4"></i><span>🎨 Do'konni Vizual Tahrirlash</span>`;
      }
    }

    renderCategories();
    renderProducts();
    refreshIcons();

    if (isVisualEditMode) {
      showToast("🎨 Vizual tahrirlash faollashdi! Har qanday matn, toifa yoki bo'limni to'g'ridan-to'g'ri o'zgartirishingiz mumkin.", "sparkles");
    }
  };

  // --- 1. TOIFALARNI VIZUAL BOSHQARISH MODALI ---
  window.openVisualCategoryModal = (index = -1) => {
    const modal = document.getElementById("visual-category-modal");
    if (!modal) return;

    editingCategoryIndex = index;
    const isEdit = index >= 0 && index < categories.length;
    const cat = isEdit ? categories[index] : { id: "", name: "", icon: "tag" };

    document.getElementById("cat-modal-index").value = index;
    document.getElementById("cat-modal-orig-id").value = cat.id || "";
    document.getElementById("cat-modal-name").value = cat.name || "";
    
    const idInput = document.getElementById("cat-modal-id");
    idInput.value = cat.id || "";
    idInput.readOnly = cat.id === "all";

    const titleEl = document.getElementById("cat-modal-title");
    if (titleEl) {
      titleEl.textContent = isEdit ? `"${cat.name}" Toifasini Tahrirlash` : "Yangi Toifa Qo'shish";
    }

    const delBtn = document.getElementById("cat-modal-delete-btn");
    if (delBtn) {
      if (isEdit && cat.id !== "all") {
        delBtn.classList.remove("hidden");
      } else {
        delBtn.classList.add("hidden");
      }
    }

    const nameInput = document.getElementById("cat-modal-name");
    nameInput.oninput = () => {
      if (!isEdit) {
        idInput.value = nameInput.value.toLowerCase().trim().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      }
    };

    const selectedIcon = cat.icon || "tag";
    document.getElementById("cat-modal-icon").value = selectedIcon;
    const iconGrid = document.getElementById("cat-icon-picker-grid");
    if (iconGrid) {
      iconGrid.innerHTML = CURATED_ICONS.map(ic => `
        <button type="button" class="icon-picker-btn ${ic === selectedIcon ? "active" : ""}" data-icon="${ic}" title="${ic}">
          <i data-lucide="${ic}" class="w-4 h-4"></i>
        </button>
      `).join("");

      iconGrid.querySelectorAll(".icon-picker-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          iconGrid.querySelectorAll(".icon-picker-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const icName = btn.getAttribute("data-icon");
          document.getElementById("cat-modal-icon").value = icName;
        });
      });
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    refreshIcons();
    nameInput.focus();
  };

  window.closeVisualCategoryModal = () => {
    const modal = document.getElementById("visual-category-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  };

  window.deleteVisualCategory = (index) => {
    if (index < 0 || index >= categories.length) return;
    const cat = categories[index];
    if (cat.id === "all") {
      alert("Barcha toifalar bo'limini o'chirib bo'lmaydi!");
      return;
    }

    if (confirm(`"${cat.name}" toifasini o'chirmoqchimisiz?\nUshbu toifadagi barcha mahsulotlar "Barcha toifalar" bo'limiga o'tkaziladi.`)) {
      categories.splice(index, 1);
      products.forEach(p => {
        if (p.category === cat.id) {
          p.category = "all";
          p.categoryName = "Barcha toifalar";
        }
      });

      localStorage.setItem("nova_categories", JSON.stringify(categories));
      localStorage.setItem("nova_products", JSON.stringify(products));

      if (activeCategory === cat.id) activeCategory = "all";

      closeVisualCategoryModal();
      renderCategories();
      renderProducts();
      showToast(`"${cat.name}" toifasi o'chirildi! 🗑️`, "trash-2", "info");
    }
  };

  document.getElementById("cat-modal-delete-btn")?.addEventListener("click", () => {
    const idx = parseInt(document.getElementById("cat-modal-index").value);
    deleteVisualCategory(idx);
  });

  document.getElementById("visual-category-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const idx = parseInt(document.getElementById("cat-modal-index").value);
    const origId = document.getElementById("cat-modal-orig-id").value;
    const name = document.getElementById("cat-modal-name").value.trim();
    let id = document.getElementById("cat-modal-id").value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const icon = document.getElementById("cat-modal-icon").value || "tag";

    if (!name || !id) return;

    if (idx >= 0 && idx < categories.length) {
      if (origId !== "all" && id !== origId && categories.some((c, i) => i !== idx && c.id === id)) {
        alert("Bunday ID ga ega toifa allaqachon mavjud! Boshqa ID tanlang.");
        return;
      }
      categories[idx] = { id: origId === "all" ? "all" : id, name, icon };

      products.forEach(p => {
        if (p.category === origId) {
          p.category = origId === "all" ? "all" : id;
          p.categoryName = name;
        }
      });
      localStorage.setItem("nova_products", JSON.stringify(products));
      showToast(`"${name}" toifasi yangilandi! ✏️`);
    } else {
      if (categories.some(c => c.id === id)) {
        id = id + "-" + Math.floor(Math.random() * 100);
      }
      categories.push({ id, name, icon });
      showToast(`"${name}" toifasi qo'shildi! 🚀`);
    }

    localStorage.setItem("nova_categories", JSON.stringify(categories));
    closeVisualCategoryModal();
    renderCategories();
    renderProducts();
  });

  // --- 2. BO'LIMLAR TARTIBI (LAYOUT MANAGER) MODALI ---
  window.openVisualLayoutModal = () => {
    const modal = document.getElementById("visual-layout-modal");
    if (!modal) return;
    renderVisualLayoutList();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    refreshIcons();
  };

  window.closeVisualLayoutModal = () => {
    const modal = document.getElementById("visual-layout-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  };

  window.resetSectionOrder = () => {
    storeConfig.sectionOrder = ["hero", "trust", "categories", "products", "promo_banner"];
    storeConfig.hiddenSections = [];
    localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
    renderSectionsOrder();
    renderVisualLayoutList();
    showToast("Bo'limlar tartibi standart holatga qaytarildi! 🔄");
  };

  const renderVisualLayoutList = () => {
    const list = document.getElementById("layout-sections-list");
    if (!list) return;

    const order = storeConfig.sectionOrder || ["hero", "trust", "categories", "products", "promo_banner"];
    const hidden = storeConfig.hiddenSections || [];

    list.innerHTML = order.map((key, i) => {
      const meta = SECTIONS_META[key] || { name: key, icon: "layers" };
      const isHidden = hidden.includes(key);

      return `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-xs">
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-lg bg-zinc-900 text-zinc-400 font-mono font-bold flex items-center justify-center text-[11px]">${i + 1}</span>
            <div class="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <i data-lucide="${meta.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <span class="font-bold text-white block">${escapeHtml(meta.name)}</span>
              <span class="text-[10px] text-zinc-400 font-mono">${key}</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button type="button" class="visual-layout-up-btn p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-300 hover:text-white ${i === 0 ? "opacity-30 cursor-not-allowed" : ""}" data-index="${i}" title="Yuqoriga surish" ${i === 0 ? "disabled" : ""}>
              <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="visual-layout-down-btn p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-300 hover:text-white ${i === order.length - 1 ? "opacity-30 cursor-not-allowed" : ""}" data-index="${i}" title="Pastga surish" ${i === order.length - 1 ? "disabled" : ""}>
              <i data-lucide="arrow-down" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="visual-layout-toggle-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${isHidden ? "bg-rose-950/60 text-rose-300 border border-rose-800" : "bg-emerald-950/60 text-emerald-300 border border-emerald-800"}" data-key="${key}" title="Ko'rinishni o'zgartirish">
              <i data-lucide="${isHidden ? "eye-off" : "eye"}" class="w-3.5 h-3.5"></i>
              <span>${isHidden ? "Yashirin" : "Ko'rinmoqda"}</span>
            </button>
          </div>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".visual-layout-up-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        if (idx > 0) {
          const temp = order[idx];
          order[idx] = order[idx - 1];
          order[idx - 1] = temp;
          storeConfig.sectionOrder = order;
          localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
          renderSectionsOrder();
          renderVisualLayoutList();
        }
      });
    });

    list.querySelectorAll(".visual-layout-down-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        if (idx < order.length - 1) {
          const temp = order[idx];
          order[idx] = order[idx + 1];
          order[idx + 1] = temp;
          storeConfig.sectionOrder = order;
          localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
          renderSectionsOrder();
          renderVisualLayoutList();
        }
      });
    });

    list.querySelectorAll(".visual-layout-toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        if (!storeConfig.hiddenSections) storeConfig.hiddenSections = [];
        const hIdx = storeConfig.hiddenSections.indexOf(key);
        if (hIdx > -1) {
          storeConfig.hiddenSections.splice(hIdx, 1);
        } else {
          storeConfig.hiddenSections.push(key);
        }
        localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
        renderSectionsOrder();
        renderVisualLayoutList();
      });
    });

    refreshIcons();
  };

  // --- 3. TO'G'RIDAN-TO'G'RI MATN VA ELEMENT TAHRIRLASH MODALI ---
  window.openVisualElementModal = (key, currentVal, label) => {
    const modal = document.getElementById("visual-element-modal");
    if (!modal) return;

    editingElementKey = key;
    document.getElementById("elem-modal-key").value = key;
    document.getElementById("elem-modal-label").textContent = label || "Yangi qiymat:";
    document.getElementById("elem-modal-input").value = currentVal || "";

    const titleEl = document.getElementById("elem-modal-title");
    if (titleEl) titleEl.textContent = `Tahrirlash: ${label || key}`;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.getElementById("elem-modal-input").focus();
  };

  window.closeVisualElementModal = () => {
    const modal = document.getElementById("visual-element-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  };

  document.getElementById("visual-element-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const key = document.getElementById("elem-modal-key").value;
    const val = document.getElementById("elem-modal-input").value.trim();

    if (!key) return;

    if (!storeConfig.hero) storeConfig.hero = {};
    if (!storeConfig.contacts) storeConfig.contacts = {};
    if (!storeConfig.promoBanner) storeConfig.promoBanner = {};
    if (!storeConfig.brand) storeConfig.brand = {};
    if (!storeConfig.topBar) storeConfig.topBar = {};

    switch (key) {
      case "topbar_badge":
        storeConfig.topBar.badgeText = val;
        break;
      case "topbar_main":
        storeConfig.topBar.mainText = val;
        break;
      case "topbar_delivery":
        storeConfig.topBar.deliveryText = val;
        break;
      case "brand":
        storeConfig.brand.name = val;
        break;
      case "hero_pill":
        storeConfig.hero.pillText = val;
        break;
      case "hero_title1":
        storeConfig.hero.titleLine1 = val;
        break;
      case "hero_title2":
        storeConfig.hero.titleLine2 = val;
        break;
      case "hero_desc":
        storeConfig.hero.description = val;
        break;
      case "hero_btn":
        storeConfig.hero.buttonText = val;
        break;
      case "flash_title":
        storeConfig.hero.flashDealTitle = val;
        break;
      case "flash_badge":
        storeConfig.hero.flashDealBadge = val;
        break;
      case "promo_badge":
        storeConfig.promoBanner.badge = val;
        break;
      case "promo_title":
        storeConfig.promoBanner.title = val;
        break;
      case "promo_desc":
        storeConfig.promoBanner.description = val;
        break;
      case "promo_btn":
        storeConfig.promoBanner.buttonText = val;
        break;
      case "footer_about":
        storeConfig.contacts.aboutText = val;
        break;
      case "footer_copyright":
        storeConfig.contacts.copyright = val;
        break;
      case "footer_phone":
        storeConfig.contacts.phone = val;
        break;
      case "footer_telegram":
        storeConfig.contacts.telegram = val;
        break;
      case "footer_hours":
        storeConfig.contacts.workingHours = val;
        break;
      default:
        break;
    }

    localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
    closeVisualElementModal();
    applyStoreConfig();
    showToast("Matn yangilandi va saqlandi! ✨");
  });

  // [data-editable] elementlari bosilganda tahrirlash oynasini ochish
  document.addEventListener("click", (e) => {
    if (!isVisualEditMode) return;

    const editableEl = e.target.closest("[data-editable]");
    if (!editableEl) return;

    if (editableEl.closest("#visual-category-modal, #visual-layout-modal, #visual-element-modal, #visual-builder-dock")) return;

    e.preventDefault();
    e.stopPropagation();

    const key = editableEl.getAttribute("data-editable");
    const label = editableEl.getAttribute("title") || "Elementni tahrirlash";
    let currentVal = editableEl.innerText?.trim() || "";

    if (key === "topbar_badge") currentVal = storeConfig.topBar?.badgeText || "Maxsus aksiya";
    if (key === "topbar_main") currentVal = storeConfig.topBar?.mainText || "";
    if (key === "topbar_delivery") currentVal = storeConfig.topBar?.deliveryText || "";
    if (key === "hero_pill") currentVal = storeConfig.hero?.pillText || "";
    if (key === "hero_title1") currentVal = storeConfig.hero?.titleLine1 || "";
    if (key === "hero_title2") currentVal = storeConfig.hero?.titleLine2 || "";
    if (key === "hero_desc") currentVal = storeConfig.hero?.description || "";
    if (key === "hero_btn") currentVal = storeConfig.hero?.buttonText || "";
    if (key === "brand") currentVal = storeConfig.brand?.name || "NOVA";
    if (key === "flash_title") currentVal = storeConfig.hero?.flashDealTitle || "";
    if (key === "flash_badge") currentVal = storeConfig.hero?.flashDealBadge || "";
    if (key === "promo_badge") currentVal = storeConfig.promoBanner?.badge || "";
    if (key === "promo_title") currentVal = storeConfig.promoBanner?.title || "";
    if (key === "promo_desc") currentVal = storeConfig.promoBanner?.description || "";
    if (key === "promo_btn") currentVal = storeConfig.promoBanner?.buttonText || "";
    if (key === "footer_about") currentVal = storeConfig.contacts?.aboutText || "";
    if (key === "footer_copyright") currentVal = storeConfig.contacts?.copyright || "";
    if (key === "footer_phone") currentVal = storeConfig.contacts?.phone || "";
    if (key === "footer_telegram") currentVal = storeConfig.contacts?.telegram || "";
    if (key === "footer_hours") currentVal = storeConfig.contacts?.workingHours || "";

    openVisualElementModal(key, currentVal, label);
  }, true);

  // --- 4. BO'LIMLAR TOOLBARI TUGMALARI (SECTION CONTROLS) ---
  document.querySelectorAll(".section-move-up-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const secKey = btn.getAttribute("data-section");
      const order = storeConfig.sectionOrder || ["hero", "trust", "categories", "products", "promo_banner"];
      const idx = order.indexOf(secKey);
      if (idx > 0) {
        const temp = order[idx];
        order[idx] = order[idx - 1];
        order[idx - 1] = temp;
        storeConfig.sectionOrder = order;
        localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
        renderSectionsOrder();
        showToast(`"${SECTIONS_META[secKey]?.name || secKey}" yuqoriga surildi! ⬆️`);
      }
    });
  });

  document.querySelectorAll(".section-move-down-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const secKey = btn.getAttribute("data-section");
      const order = storeConfig.sectionOrder || ["hero", "trust", "categories", "products", "promo_banner"];
      const idx = order.indexOf(secKey);
      if (idx > -1 && idx < order.length - 1) {
        const temp = order[idx];
        order[idx] = order[idx + 1];
        order[idx + 1] = temp;
        storeConfig.sectionOrder = order;
        localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
        renderSectionsOrder();
        showToast(`"${SECTIONS_META[secKey]?.name || secKey}" pastga surildi! ⬇️`);
      }
    });
  });

  document.querySelectorAll(".section-toggle-hide-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const secKey = btn.getAttribute("data-section");
      if (!storeConfig.hiddenSections) storeConfig.hiddenSections = [];
      const hIdx = storeConfig.hiddenSections.indexOf(secKey);
      if (hIdx > -1) {
        storeConfig.hiddenSections.splice(hIdx, 1);
        showToast(`"${SECTIONS_META[secKey]?.name || secKey}" ko'rsatildi! 👁️`);
      } else {
        storeConfig.hiddenSections.push(secKey);
        showToast(`"${SECTIONS_META[secKey]?.name || secKey}" yashirildi! 🙈`);
      }
      localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
      renderSectionsOrder();
    });
  });

  document.querySelectorAll(".section-edit-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const secKey = btn.getAttribute("data-section");
      if (secKey === "promo_banner") {
        openVisualElementModal("promo_title", storeConfig.promoBanner?.title || "", "Promo Banner Sarlavhasi");
      } else if (secKey === "hero") {
        openVisualElementModal("hero_title1", storeConfig.hero?.titleLine1 || "", "Bosh Banner 1-qatori");
      } else {
        openVisualLayoutModal();
      }
    });
  });

  document.querySelectorAll("#store-add-category-btn, .visual-add-cat-btn, #dock-add-cat-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openVisualCategoryModal(-1);
    });
  });

  document.querySelectorAll("#store-add-product-btn, .visual-add-prod-btn, #dock-add-prod-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.self !== window.top) {
        window.parent.postMessage({ type: "NOVA_OPEN_ADD_PRODUCT" }, "*");
      } else {
        window.open("admin.html?action=add_product", "_blank");
      }
    });
  });

  // Dock tugmalari
  document.getElementById("dock-layout-btn")?.addEventListener("click", () => {
    openVisualLayoutModal();
  });

  document.getElementById("dock-save-btn")?.addEventListener("click", () => {
    localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
    localStorage.setItem("nova_categories", JSON.stringify(categories));
    localStorage.setItem("nova_products", JSON.stringify(products));
    showToast("Do'konga kiritilgan barcha o'zgarishlar saqlandi! 💾");
  });

  document.getElementById("dock-close-btn")?.addEventListener("click", () => {
    setVisualEditMode(false);
  });

  // Chap pastki burchakdagi rejimlarni almashtirish tugmasi
  document.getElementById("visual-mode-toggle-btn")?.addEventListener("click", () => {
    setVisualEditMode(!isVisualEditMode);
  });

  // Klaviatura kombinatsiyasi (Ctrl + Shift + E)
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
      e.preventDefault();
      setVisualEditMode(!isVisualEditMode);
    }
  });

  // URL param orqali avtomatik yoqish (?edit_mode=1)
  const appUrlParams = new URLSearchParams(window.location.search);
  if (appUrlParams.get("edit_mode") === "1") {
    setTimeout(() => {
      setVisualEditMode(true);
    }, 150);
  }

  // --- BOSHLANG'ICH YUKLASH ---
  applyStoreConfig();
  renderCategories();
  renderProducts();
  updateCartBadge();
  updateWishlistBadge();
  initCountdown();
  refreshIcons();
});

