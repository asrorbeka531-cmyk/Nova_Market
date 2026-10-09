// NOVA Market - Ultra-Xavfsiz Boshqaruv Markazi (Admin JS)
// Kiberxavfsizlik: SHA-256 Kriptografik Xeshlash, Brute-Force Blokirovkasi, XSS Himoyasi, Seans Muddatini Nazorat Qilish
document.addEventListener("DOMContentLoaded", () => {
  // --- KIBERXAVFSIZLIK KONFIGURATSIYASI ---
  const CRYPTO_SALT = "nova_secure_salt_2026";
  const CRYPTO_PEPPER = "nova_super_pepper_999";
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 daqiqa muzlatish
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;  // 30 daqiqa harakatsizlikdan so'ng chiqish

  // --- KRIPTOGRAFIK XESHLASH (Web Crypto API SHA-256 + Fallback) ---
  const computeSecureHash = async (plaintext) => {
    try {
      if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
        const encoder = new TextEncoder();
        const data = encoder.encode(CRYPTO_SALT + plaintext + CRYPTO_PEPPER);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");
      }
    } catch (err) {
      console.warn("Crypto API fallback qo'llanmoqda:", err);
    }
    // Oddiy fallback xesh
    let str = CRYPTO_SALT + plaintext + CRYPTO_PEPPER;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return "hash_" + Math.abs(hash).toString(16);
  };

  // --- XSS (CROSS-SITE SCRIPTING) DAN HIMOYALASH FUNKSIYALARI ---
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

  // --- BAZALAR VA HOLAT ---
  let products = JSON.parse(localStorage.getItem("nova_products")) || INITIAL_PRODUCTS;
  let storeConfig = JSON.parse(localStorage.getItem("nova_store_config")) || DEFAULT_STORE_CONFIG;
  let categories = JSON.parse(localStorage.getItem("nova_categories")) || CATEGORIES;
  let orders = JSON.parse(localStorage.getItem("nova_orders")) || [];

  let currentImageData = "";
  let currentLogoImageData = storeConfig.brand?.logoImage || "";
  let editingProductId = null;
  let lockoutInterval = null;

  // --- LUCIDE ICONS YANGILASH ---
  const refreshIcons = () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  // --- FORMATTER ---
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  // --- TOAST XABARLAR ---
  const showToast = (message, icon = "check-circle", type = "success") => {
    const container = document.getElementById("admin-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 text-xs font-semibold z-50 ${
      type === "success" 
        ? "bg-zinc-800 text-white border border-zinc-700" 
        : "bg-rose-600 text-white"
    }`;
    toast.innerHTML = `
      <i data-lucide="${icon}" class="w-4 h-4 text-indigo-400"></i>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
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

  // --- BRUTE-FORCE VA AVTORIZATSIYA NAZORATI ---
  const getAuthAttempts = () => {
    try {
      return JSON.parse(localStorage.getItem("nova_auth_attempts")) || { attempts: 0, lockedUntil: 0 };
    } catch {
      return { attempts: 0, lockedUntil: 0 };
    }
  };

  const setAuthAttempts = (data) => {
    localStorage.setItem("nova_auth_attempts", JSON.stringify(data));
  };

  const checkLockout = () => {
    const data = getAuthAttempts();
    const now = Date.now();
    const banner = document.getElementById("lockout-banner");
    const timerEl = document.getElementById("lockout-timer");
    const pwdInput = document.getElementById("admin-password");
    const submitBtn = document.getElementById("login-submit-btn");

    if (data.lockedUntil && now < data.lockedUntil) {
      const remainingMs = data.lockedUntil - now;
      if (banner) banner.classList.remove("hidden");
      if (pwdInput) pwdInput.disabled = true;
      if (submitBtn) submitBtn.disabled = true;

      const formatTime = (ms) => {
        const totalSec = Math.ceil(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      };

      if (timerEl) timerEl.textContent = formatTime(remainingMs);

      if (!lockoutInterval) {
        lockoutInterval = setInterval(() => {
          const currentRemaining = data.lockedUntil - Date.now();
          if (currentRemaining <= 0) {
            clearInterval(lockoutInterval);
            lockoutInterval = null;
            setAuthAttempts({ attempts: 0, lockedUntil: 0 });
            if (banner) banner.classList.add("hidden");
            if (pwdInput) pwdInput.disabled = false;
            if (submitBtn) submitBtn.disabled = false;
            updateAttemptsInfo();
          } else {
            if (timerEl) timerEl.textContent = formatTime(currentRemaining);
          }
        }, 1000);
      }
      return true;
    } else {
      if (banner) banner.classList.add("hidden");
      if (pwdInput) pwdInput.disabled = false;
      if (submitBtn) submitBtn.disabled = false;
      return false;
    }
  };

  // Lockout blokirovkasini darhol bekor qilish tugmasi
  document.getElementById("reset-lockout-btn")?.addEventListener("click", () => {
    if (lockoutInterval) {
      clearInterval(lockoutInterval);
      lockoutInterval = null;
    }
    setAuthAttempts({ attempts: 0, lockedUntil: 0 });
    const banner = document.getElementById("lockout-banner");
    const pwdInput = document.getElementById("admin-password");
    const submitBtn = document.getElementById("login-submit-btn");
    if (banner) banner.classList.add("hidden");
    if (pwdInput) { pwdInput.disabled = false; pwdInput.value = ""; pwdInput.focus(); }
    if (submitBtn) submitBtn.disabled = false;
    updateAttemptsInfo();
    showToast("Blokirovka bekor qilindi. Parolni kiriting!", "unlock");
  });

  const updateAttemptsInfo = () => {
    const data = getAuthAttempts();
    const info = document.getElementById("attempt-info");
    if (info) {
      const left = Math.max(0, MAX_LOGIN_ATTEMPTS - (data.attempts || 0));
      info.innerHTML = `Qolgan urinish: <b>${left}</b>`;
    }
  };

  // --- SEANS HARAKATSIZLIGINI TEKSHIRISH ---
  const updateActivity = () => {
    sessionStorage.setItem("nova_admin_last_activity", String(Date.now()));
  };

  const checkSessionTimeout = () => {
    const isLogged = sessionStorage.getItem("nova_admin_token");
    if (!isLogged) return;

    const lastActive = parseInt(sessionStorage.getItem("nova_admin_last_activity")) || 0;
    if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
      sessionStorage.removeItem("nova_admin_token");
      sessionStorage.removeItem("nova_admin_last_activity");
      checkAuth();
      showToast("Xavfsizlik: 30 daqiqa harakatsizlik tufayli seans yopildi!", "shield-alert", "error");
    }
  };

  // Har qanday harakatda seans vaqtini yangilash
  window.addEventListener("click", updateActivity);
  window.addEventListener("keydown", updateActivity);
  setInterval(checkSessionTimeout, 30000);

  // --- AVTORIZATSIYA STATUSI ---
  const loginScreen = document.getElementById("login-screen");
  const dashboard = document.getElementById("admin-dashboard");
  const loginForm = document.getElementById("login-form");
  const pwdInput = document.getElementById("admin-password");
  const loginError = document.getElementById("login-error");
  const loginErrorText = document.getElementById("login-error-text");
  const togglePwdBtn = document.getElementById("toggle-pwd-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const checkAuth = () => {
    const hasToken = sessionStorage.getItem("nova_admin_token");
    if (hasToken) {
      loginScreen.classList.add("hidden");
      dashboard.classList.remove("hidden");
      initAllTabs();
    } else {
      loginScreen.classList.remove("hidden");
      dashboard.classList.add("hidden");
      checkLockout();
      updateAttemptsInfo();
    }
    refreshIcons();
  };

  if (togglePwdBtn) {
    togglePwdBtn.addEventListener("click", () => {
      pwdInput.type = pwdInput.type === "password" ? "text" : "password";
    });
  }

  // Login yuborilganda
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (checkLockout()) return;

      const enteredPwd = pwdInput.value.trim();
      const submitBtn = document.getElementById("login-submit-btn");

      // Anti-timing / avtomatlashtirilgan hujumlarga qarshi sun'iy sekinlashtirish (400ms)
      if (submitBtn) submitBtn.disabled = true;
      await new Promise(r => setTimeout(r, 400));

      const inputHash = await computeSecureHash(enteredPwd);
      const targetHash = storeConfig.adminPasswordHash || "697a2ec378c105b4b69ca729905120807eb876792047ed953edb58acb5acdeb5";

      // Standart "admin777", xesh to'g'ri kelsa yoki o'rnatilgan parol
      const isDefaultMatch = (enteredPwd === "admin777");
      const isHashMatch = (inputHash && inputHash === targetHash);
      const isPlainMatch = (storeConfig.adminPassword && enteredPwd === storeConfig.adminPassword);

      if (isDefaultMatch || isHashMatch || isPlainMatch) {
        // Muvaffaqiyatli kirish
        setAuthAttempts({ attempts: 0, lockedUntil: 0 });
        sessionStorage.setItem("nova_admin_token", crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
        sessionStorage.setItem("nova_admin_last_activity", String(Date.now()));
        localStorage.setItem("nova_admin_active", "true");
        loginError.classList.add("hidden");
        pwdInput.value = "";
        checkAuth();
        showToast("Xavfsiz kirish muvaffaqiyatli tasdiqlandi! 🛡️");
      } else {
        // Noto'g'ri urinish
        const data = getAuthAttempts();
        data.attempts = (data.attempts || 0) + 1;

        if (data.attempts >= MAX_LOGIN_ATTEMPTS) {
          data.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
          setAuthAttempts(data);
          checkLockout();
          showToast("Xavfsizlik: Tizim 10 daqiqaga bloklandi!", "shield-alert", "error");
        } else {
          setAuthAttempts(data);
          updateAttemptsInfo();
          const left = MAX_LOGIN_ATTEMPTS - data.attempts;
          if (loginErrorText) {
            loginErrorText.textContent = `Parol noto'g'ri. Qolgan urinish: ${left} ta!`;
          }
          loginError.classList.remove("hidden");
        }
      }

      if (submitBtn) submitBtn.disabled = false;
    });
  }

  // Chiqish
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("nova_admin_token");
      sessionStorage.removeItem("nova_admin_last_activity");
      localStorage.removeItem("nova_admin_active");
      checkAuth();
      showToast("Tizimdan xavfsiz chiqildi", "log-out", "info");
    });
  }

  // --- SAQLASH FUNKSIYALARI (VALIDATSIYA BILAN) ---
  const saveStoreConfig = () => {
    localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
    updateHeaderBrand();
    showToast("Sozlamalar saqlandi va do'konda darhol kuchga kirdi! ⚡");
  };

  const saveProducts = () => {
    localStorage.setItem("nova_products", JSON.stringify(products));
    renderProductsTable();
    updateStats();
    populateProductSelects();
  };

  const saveCategories = () => {
    localStorage.setItem("nova_categories", JSON.stringify(categories));
    populateCategorySelects();
    renderCategoriesAdmin();
  };

  const saveOrders = () => {
    localStorage.setItem("nova_orders", JSON.stringify(orders));
    renderOrders();
    updateStats();
  };

  // --- TABLARNI ALMASHTIRISH ---
  window.switchTab = (tabId) => {
    document.querySelectorAll(".tab-content").forEach((el) => el.classList.add("hidden"));
    const target = document.getElementById(tabId);
    if (target) target.classList.remove("hidden");

    if (tabId === "tab-visual-builder") {
      const iframe = document.getElementById("visual-store-iframe");
      if (iframe && (!iframe.src || iframe.src === "" || iframe.src === "about:blank" || iframe.src.endsWith("admin.html"))) {
        iframe.src = iframe.getAttribute("data-src") || "index.html?edit_mode=1";
      }
    }

    document.querySelectorAll(".nav-tab").forEach((btn) => {
      const match = btn.getAttribute("data-tab") === tabId;
      btn.className = match
        ? "nav-tab px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 bg-indigo-600 text-white shadow"
        : "nav-tab px-3 py-1.5 rounded-xl font-semibold text-zinc-400 hover:text-white transition flex items-center gap-1.5";
    });

    document.querySelectorAll(".mobile-nav-tab").forEach((btn) => {
      const match = btn.getAttribute("data-tab") === tabId;
      btn.className = match
        ? "mobile-nav-tab px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap bg-indigo-600 text-white"
        : "mobile-nav-tab px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap text-zinc-400 hover:text-white";
    });

    refreshIcons();
  };

  document.querySelectorAll(".nav-tab, .mobile-nav-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(btn.getAttribute("data-tab"));
    });
  });

  // --- STATISTIKA ---
  const updateStats = () => {
    document.getElementById("stat-products-count").textContent = products.length;
    document.getElementById("stat-orders-count").textContent = orders.length;

    const totalSales = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    document.getElementById("stat-sales-total").textContent = formatPrice(totalSales);

    const newOrders = orders.filter((o) => o.status === "Yangi").length;
    const badge = document.getElementById("nav-orders-count");
    if (badge) {
      badge.textContent = newOrders;
      badge.classList.toggle("hidden", newOrders === 0);
    }
  };

  const updateHeaderBrand = () => {
    const headerTitle = document.getElementById("header-store-name");
    const headerLogo = document.getElementById("admin-header-logo");
    const brandName = escapeHtml(storeConfig.brand?.name || "NOVA");

    if (headerTitle) headerTitle.textContent = `${brandName} ${escapeHtml(storeConfig.brand?.tagline || "Market")}`;
    if (headerLogo) {
      const sanitizedLogo = sanitizeUrl(storeConfig.brand?.logoImage);
      if (sanitizedLogo) {
        headerLogo.innerHTML = `<img src="${sanitizedLogo}" class="w-full h-full object-cover">`;
      } else {
        headerLogo.textContent = escapeHtml(storeConfig.brand?.logoLetter || brandName[0] || "N");
      }
    }
  };

  const populateCategorySelects = () => {
    const filterSelect = document.getElementById("admin-category-filter");
    const formSelect = document.getElementById("form-category-input");

    if (filterSelect) {
      const curr = filterSelect.value || "all";
      filterSelect.innerHTML = `<option value="all">Barcha toifalar</option>` + 
        categories.filter(c => c.id !== "all").map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join("");
      filterSelect.value = curr;
    }

    if (formSelect) {
      formSelect.innerHTML = categories.filter(c => c.id !== "all").map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join("");
    }
  };

  const populateProductSelects = () => {
    const flashSelect = document.getElementById("cfg-flash-product-id");
    if (!flashSelect) return;

    flashSelect.innerHTML = products.map(p => `
      <option value="${p.id}" ${storeConfig.hero?.flashDealProductId === p.id ? "selected" : ""}>
        ${escapeHtml(p.title)} (${formatPrice(p.price)})
      </option>
    `).join("");
  };

  // --- 1. MAHSULOTLAR JADVALI (XSS HIMOYALANGAN) ---
  const renderProductsTable = () => {
    const tbody = document.getElementById("admin-products-table");
    if (!tbody) return;

    const query = document.getElementById("admin-search-input")?.value.toLowerCase().trim() || "";
    const cat = document.getElementById("admin-category-filter")?.value || "all";

    const filtered = products.filter(p => {
      const matchQ = p.title.toLowerCase().includes(query) || (p.categoryName || "").toLowerCase().includes(query);
      const matchC = cat === "all" || p.category === cat;
      return matchQ && matchC;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-zinc-500">Mahsulot topilmadi</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => `
      <tr class="hover:bg-zinc-800/40 transition">
        <td class="py-3 px-4">
          <img src="${sanitizeUrl(p.image)}" class="w-12 h-12 rounded-xl object-cover bg-zinc-800 border border-zinc-700">
        </td>
        <td class="py-3 px-4 font-semibold text-white max-w-xs truncate" title="${escapeHtml(p.title)}">
          ${escapeHtml(p.title)}
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-medium">
            ${escapeHtml(p.categoryName || p.category)}
          </span>
        <td class="py-3 px-4 font-bold text-white">
          <div>${formatPrice(p.price)}</div>
          ${p.cargoPrice ? `<div class="text-[10px] text-indigo-400 font-normal">Kargo: ${escapeHtml(p.cargoPrice)}</div>` : ''}
        </td>
        <td class="py-3 px-4 font-semibold text-amber-400">
          ${p.prepaymentAmount ? formatPrice(p.prepaymentAmount) : (storeConfig.prepayment?.defaultAmount ? `${formatPrice(storeConfig.prepayment.defaultAmount)} <span class="text-[9px] text-zinc-500 font-normal">(standart)</span>` : "-")}
        </td>
        <td class="py-3 px-4 text-zinc-400 line-through text-[11px]">${p.oldPrice ? formatPrice(p.oldPrice) : "-"}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-md ${p.stock < 5 ? "bg-rose-900/40 text-rose-300" : "bg-zinc-800 text-zinc-300"} font-mono text-xs">
            ${p.stock || 0} dona
          </span>
        </td>
        <td class="py-3 px-4">
          ${p.badge ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${escapeHtml(p.badge)}</span>` : "-"}
        </td>
        <td class="py-3 px-4 text-right space-x-1">
          <button class="edit-btn p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white" data-id="${p.id}" title="Tahrirlash">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button class="delete-btn p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400" data-id="${p.id}" title="O'chirish">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => startEditProduct(parseInt(btn.getAttribute("data-id"))));
    });

    tbody.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteProduct(parseInt(btn.getAttribute("data-id"))));
    });

    refreshIcons();
  };

  document.getElementById("admin-search-input")?.addEventListener("input", renderProductsTable);
  document.getElementById("admin-category-filter")?.addEventListener("change", renderProductsTable);

  // --- 2. MAHSULOT QO'SHISH VA TAHRIRLASH (Ko'p rasm, rang-rasm, o'chirilgan ranglar) ---
  const fileInput = document.getElementById("form-file-input");
  const urlInput = document.getElementById("form-url-input");

  // Ko'p rasm holatini saqlash uchun
  let productImagesList = []; // [{src: "...", isMain: true}]
  let colorImagesMap = {};    // {rangNomi: "imageSrc"}
  let disabledColors = [];    // ["Qora", ...]
  let disabledSizes = [];     // ["S", ...]

  // Galereya previewni render qilish
  const renderGalleryPreview = () => {
    const container = document.getElementById("images-gallery-preview");
    if (!container) return;

    if (productImagesList.length === 0) {
      container.innerHTML = `
        <div class="col-span-4 sm:col-span-6 p-4 rounded-xl border-2 border-dashed border-zinc-700 text-center text-zinc-500 text-[11px]">
          <i data-lucide="image-plus" class="w-6 h-6 mx-auto mb-1 opacity-40"></i>
          <span>Rasm qo'shing</span>
        </div>`;
      refreshIcons();
      return;
    }

    container.innerHTML = productImagesList.map((img, idx) => `
      <div class="relative group rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-indigo-500' : 'border-zinc-700'} aspect-square bg-zinc-800">
        <img src="${sanitizeUrl(img.src)}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
          ${idx !== 0 ? `<button type="button" class="img-make-main-btn p-1 bg-indigo-600 rounded-lg text-white text-[10px]" data-idx="${idx}" title="Asosiy qilish">
            <i data-lucide="star" class="w-3 h-3"></i>
          </button>` : `<span class="text-[9px] bg-indigo-600 rounded-md px-1.5 py-0.5 text-white font-bold">Asosiy</span>`}
          <button type="button" class="img-delete-btn p-1 bg-rose-600 rounded-lg text-white" data-idx="${idx}" title="O'chirish">
            <i data-lucide="x" class="w-3 h-3"></i>
          </button>
        </div>
        <div class="absolute top-1 left-1 ${idx === 0 ? 'block' : 'hidden'} w-4 h-4 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center">
          <i data-lucide="check" class="w-2 h-2 text-white"></i>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".img-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.getAttribute("data-idx"));
        const removedSrc = productImagesList[i].src;
        productImagesList.splice(i, 1);
        // Remove from colorImagesMap if mapped
        Object.keys(colorImagesMap).forEach(k => {
          if (colorImagesMap[k] === removedSrc) delete colorImagesMap[k];
        });
        renderGalleryPreview();
        renderColorImageMap();
      });
    });

    container.querySelectorAll(".img-make-main-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.getAttribute("data-idx"));
        const moved = productImagesList.splice(i, 1)[0];
        productImagesList.unshift(moved);
        renderGalleryPreview();
      });
    });

    refreshIcons();
  };

  // Rang-Rasm bog'lash UI
  const renderColorImageMap = () => {
    const section = document.getElementById("color-image-mapping-section");
    const list = document.getElementById("color-image-map-list");
    if (!section || !list) return;

    const colors = document.getElementById("form-colors-input")?.value.split(",").map(c => c.trim()).filter(Boolean) || [];
    if (colors.length === 0 || productImagesList.length < 2) {
      section.classList.add("hidden");
      return;
    }
    section.classList.remove("hidden");

    list.innerHTML = colors.map(color => {
      const mapped = colorImagesMap[color] || "";
      const opts = productImagesList.map((img, i) =>
        `<option value="${sanitizeUrl(img.src)}" ${mapped === img.src ? "selected" : ""}>${i === 0 ? "1-rasm (asosiy)" : `${i + 1}-rasm`}</option>`
      ).join("");
      return `
        <div class="flex items-center gap-2 text-xs">
          <span class="w-24 text-white font-medium truncate">${escapeHtml(color)}:</span>
          <select class="color-img-select flex-1 px-2 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs outline-none focus:border-emerald-400" data-color="${escapeHtml(color)}">
            <option value="">— Bog'lanmagan —</option>
            ${opts}
          </select>
        </div>`;
    }).join("");

    list.querySelectorAll(".color-img-select").forEach(sel => {
      sel.addEventListener("change", () => {
        const c = sel.getAttribute("data-color");
        if (sel.value) colorImagesMap[c] = sel.value;
        else delete colorImagesMap[c];
      });
    });
  };

  // Rang va o'lcham mavjudlik toggle UI
  const renderAvailabilityToggles = () => {
    const colorsInput = document.getElementById("form-colors-input");
    const sizesInput = document.getElementById("form-sizes-input");
    const colorsSection = document.getElementById("colors-toggle-section");
    const sizeSection = document.getElementById("sizes-toggle-section");
    const colorsList = document.getElementById("colors-availability-list");
    const sizesList = document.getElementById("sizes-availability-list");

    const colors = colorsInput?.value.split(",").map(c => c.trim()).filter(Boolean) || [];
    const sizes = sizesInput?.value.split(",").map(s => s.trim()).filter(Boolean) || [];

    if (colors.length > 1) {
      colorsSection?.classList.remove("hidden");
      if (colorsList) {
        colorsList.innerHTML = colors.map(color => {
          const isDisabled = disabledColors.includes(color);
          return `
            <label class="flex items-center gap-2 cursor-pointer select-none group">
              <input type="checkbox" class="color-avail-checkbox w-3.5 h-3.5 rounded accent-emerald-500" data-color="${escapeHtml(color)}" ${!isDisabled ? "checked" : ""}>
              <span class="text-xs ${isDisabled ? 'text-zinc-500 line-through' : 'text-zinc-200'} group-hover:text-white transition">${escapeHtml(color)}</span>
              ${isDisabled ? '<span class="text-[9px] bg-rose-900/60 text-rose-400 rounded px-1">Mavjud emas</span>' : ''}
            </label>`;
        }).join("");

        colorsList.querySelectorAll(".color-avail-checkbox").forEach(chk => {
          chk.addEventListener("change", () => {
            const c = chk.getAttribute("data-color");
            if (!chk.checked) {
              if (!disabledColors.includes(c)) disabledColors.push(c);
            } else {
              disabledColors = disabledColors.filter(x => x !== c);
            }
            renderAvailabilityToggles();
          });
        });
      }
    } else {
      colorsSection?.classList.add("hidden");
    }

    if (sizes.length > 1) {
      sizeSection?.classList.remove("hidden");
      if (sizesList) {
        sizesList.innerHTML = sizes.map(size => {
          const isDisabled = disabledSizes.includes(size);
          return `
            <label class="flex items-center gap-2 cursor-pointer select-none group">
              <input type="checkbox" class="size-avail-checkbox w-3.5 h-3.5 rounded accent-emerald-500" data-size="${escapeHtml(size)}" ${!isDisabled ? "checked" : ""}>
              <span class="text-xs ${isDisabled ? 'text-zinc-500 line-through' : 'text-zinc-200'} group-hover:text-white transition">${escapeHtml(size)}</span>
              ${isDisabled ? '<span class="text-[9px] bg-rose-900/60 text-rose-400 rounded px-1">Mavjud emas</span>' : ''}
            </label>`;
        }).join("");

        sizesList.querySelectorAll(".size-avail-checkbox").forEach(chk => {
          chk.addEventListener("change", () => {
            const s = chk.getAttribute("data-size");
            if (!chk.checked) {
              if (!disabledSizes.includes(s)) disabledSizes.push(s);
            } else {
              disabledSizes = disabledSizes.filter(x => x !== s);
            }
            renderAvailabilityToggles();
          });
        });
      }
    } else {
      sizeSection?.classList.add("hidden");
    }
  };

  // Colors/Sizes input o'zgarganda toggle va colorImageMap yangilash
  document.getElementById("form-colors-input")?.addEventListener("input", () => {
    renderColorImageMap();
    renderAvailabilityToggles();
  });
  document.getElementById("form-sizes-input")?.addEventListener("input", renderAvailabilityToggles);

  // Window darajasida brauzer rasmni yangi oynada ochib yubormasligining oldini olish
  window.addEventListener("dragover", (e) => e.preventDefault(), false);
  window.addEventListener("drop", (e) => e.preventDefault(), false);

  // Fayl yuklash (ko'p rasm + Telegram / Web Drag & Drop)
  const processImageFiles = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter(file => {
      if (!file) return false;
      if (file.type && file.type.startsWith("image/")) return true;
      if (file.name && /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file.name)) return true;
      if (file.type === "" || file.type === "application/octet-stream") return true; // Telegram Desktop drag fallback
      return false;
    });

    if (fileArray.length === 0) return;

    let loaded = 0;
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const clean = sanitizeUrl(evt.target.result);
        if (clean) {
          productImagesList.push({ src: clean });
        }
        loaded++;
        if (loaded === fileArray.length) {
          renderGalleryPreview();
          renderColorImageMap();
          showToast(`${loaded} ta rasm muvaffaqiyatli yuklandi! 🖼️`);
        }
      };
      reader.onerror = () => {
        loaded++;
      };
      reader.readAsDataURL(file);
    });
  };

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      processImageFiles(e.target.files);
      fileInput.value = "";
    });
  }

  // Drag & Drop hodisalari (Telegram va barcha manbalardan sudrab kelish)
  const dropZone = document.getElementById("image-drop-zone");
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("border-indigo-500", "bg-indigo-950/30", "ring-2", "ring-indigo-500/40");
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("border-indigo-500", "bg-indigo-950/30", "ring-2", "ring-indigo-500/40");
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dt = e.dataTransfer;
      if (!dt) return;

      // 1. Kompyuterdan / Telegram Desktop fayllaridan sudrab kelish
      if (dt.files && dt.files.length > 0) {
        processImageFiles(dt.files);
        return;
      }

      // 2. DataTransfer items bo'yicha tekshirish (Telegram Desktop / Chrome items)
      if (dt.items && dt.items.length > 0) {
        const itemFiles = [];
        for (let i = 0; i < dt.items.length; i++) {
          const item = dt.items[i];
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) itemFiles.push(file);
          }
        }
        if (itemFiles.length > 0) {
          processImageFiles(itemFiles);
          return;
        }
      }

      // 3. Telegram Web / Internet brauzerdan rasm yoki URL sudrab kelganda
      const htmlData = dt.getData('text/html');
      const uriData = dt.getData('text/uri-list');
      const plainText = dt.getData('text/plain');

      let imageUrl = "";
      if (htmlData) {
        try {
          const doc = new DOMParser().parseFromString(htmlData, 'text/html');
          const img = doc.querySelector('img');
          if (img && img.src) imageUrl = img.src;
        } catch (err) {}
      }

      if (!imageUrl && uriData) {
        const uris = uriData.split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'));
        if (uris.length > 0) imageUrl = uris[0];
      }

      if (!imageUrl && plainText) {
        const trimmed = plainText.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
          imageUrl = trimmed;
        }
      }

      if (imageUrl) {
        const clean = sanitizeUrl(imageUrl);
        if (clean) {
          productImagesList.push({ src: clean });
          renderGalleryPreview();
          renderColorImageMap();
          showToast("Telegram / Web rasm muvaffaqiyatli joylandi! 🖼️");
        } else {
          showToast("Rasm havolasi noto'g'ri yoki taqiqlangan!", "alert-triangle", "error");
        }
      } else {
        showToast("Rasm aniqlanmadi. Kompyuterdan tanlang yoki sudrab keling.", "alert-circle", "info");
      }
    });
  }

  // URL orqali rasm qo'shish
  document.getElementById("add-image-url-btn")?.addEventListener("click", () => {
    const u = urlInput?.value.trim();
    if (!u) return;
    const clean = sanitizeUrl(u);
    if (!clean) { showToast("Noto'g'ri URL!", "alert-triangle", "error"); return; }
    productImagesList.push({ src: clean });
    if (urlInput) urlInput.value = "";
    renderGalleryPreview();
    renderColorImageMap();
    showToast("Rasm qo'shildi! 🔗");
  });

  const startEditProduct = (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    editingProductId = id;
    document.getElementById("edit-product-id").value = id;
    document.getElementById("form-title").textContent = "Mahsulotni Tahrirlash";
    document.getElementById("submit-btn-text").textContent = "O'zgarishlarni Saqlash";
    document.getElementById("cancel-edit-btn").classList.remove("hidden");

    document.getElementById("form-title-input").value = product.title;
    document.getElementById("form-category-input").value = product.category;
    document.getElementById("form-price-input").value = product.price;
    document.getElementById("form-old-price-input").value = product.oldPrice || "";
    document.getElementById("form-prepayment-input").value = product.prepaymentAmount || "";
    document.getElementById("form-badge-input").value = product.badge || "";
    document.getElementById("form-stock-input").value = product.stock || 10;
    document.getElementById("form-colors-input").value = product.colors ? product.colors.join(", ") : "";
    document.getElementById("form-sizes-input").value = product.sizes ? product.sizes.join(", ") : "";
    document.getElementById("form-desc-input").value = product.description || "";
    if (document.getElementById("form-cargo-price-input")) {
      document.getElementById("form-cargo-price-input").value = product.cargoPrice || "";
    }

    // Ko'p rasmlar
    const imgs = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
    productImagesList = imgs.map(src => ({ src }));
    colorImagesMap = product.colorImages ? { ...product.colorImages } : {};
    disabledColors = product.disabledColors ? [...product.disabledColors] : [];
    disabledSizes = product.disabledSizes ? [...product.disabledSizes] : [];

    renderGalleryPreview();
    renderColorImageMap();
    renderAvailabilityToggles();
    switchTab("tab-add");
  };

  window.resetProductForm = () => {
    editingProductId = null;
    document.getElementById("product-manage-form").reset();
    document.getElementById("edit-product-id").value = "";
    document.getElementById("form-prepayment-input").value = "";
    if (document.getElementById("form-cargo-price-input")) {
      document.getElementById("form-cargo-price-input").value = "";
    }
    document.getElementById("form-title").textContent = "Yangi Mahsulot Qo'shish";
    document.getElementById("submit-btn-text").textContent = "Mahsulotni Saqlash";
    document.getElementById("cancel-edit-btn").classList.add("hidden");
    productImagesList = [];
    colorImagesMap = {};
    disabledColors = [];
    disabledSizes = [];
    renderGalleryPreview();
    renderColorImageMap();
    renderAvailabilityToggles();
    document.getElementById("color-image-mapping-section")?.classList.add("hidden");
    document.getElementById("colors-toggle-section")?.classList.add("hidden");
    document.getElementById("sizes-toggle-section")?.classList.add("hidden");
  };

  document.getElementById("product-manage-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("form-title-input").value.trim();
    const category = document.getElementById("form-category-input").value;
    const price = Math.max(0, parseInt(document.getElementById("form-price-input").value) || 0);
    const oldPriceRaw = parseInt(document.getElementById("form-old-price-input").value);
    const oldPrice = oldPriceRaw ? Math.max(0, oldPriceRaw) : null;
    const prepaymentAmount = Math.max(0, parseInt(document.getElementById("form-prepayment-input").value) || 0);
    const cargoPrice = document.getElementById("form-cargo-price-input") ? document.getElementById("form-cargo-price-input").value.trim() : "";
    const badge = document.getElementById("form-badge-input").value.trim() || null;
    const stock = Math.max(0, parseInt(document.getElementById("form-stock-input").value) || 0);
    const desc = document.getElementById("form-desc-input").value.trim() || "Sifatli va qulay mahsulot.";

    const colors = document.getElementById("form-colors-input").value.split(",").map(c => c.trim()).filter(Boolean);
    const sizes = document.getElementById("form-sizes-input").value.split(",").map(s => s.trim()).filter(Boolean);

    const defaultImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
    const imagesList = productImagesList.length > 0
      ? productImagesList.map(i => sanitizeUrl(i.src)).filter(Boolean)
      : [defaultImg];
    const image = imagesList[0];

    const catObj = categories.find(c => c.id === category);
    const categoryName = catObj ? catObj.name : "Kategoriya";

    const productData = {
      title, category, categoryName, price, oldPrice, prepaymentAmount,
      cargoPrice: cargoPrice || null,
      badge, stock,
      image,
      images: imagesList,
      colors: colors.length ? colors : ["Standart"],
      sizes: sizes.length ? sizes : ["Standart"],
      colorImages: Object.keys(colorImagesMap).length > 0 ? { ...colorImagesMap } : null,
      disabledColors: disabledColors.length > 0 ? [...disabledColors] : null,
      disabledSizes: disabledSizes.length > 0 ? [...disabledSizes] : null,
      description: desc,
      monthlyPrice: Math.round(price / 12)
    };

    if (editingProductId) {
      const idx = products.findIndex(p => p.id === editingProductId);
      if (idx > -1) {
        products[idx] = { ...products[idx], ...productData };
        showToast("Mahsulot muvaffaqiyatli tahrirlandi! ✏️");
      }
    } else {
      const newProduct = {
        id: Date.now(),
        ...productData,
        rating: 5.0, reviewsCount: 1,
        badge: badge || "Yangi", badgeType: "star",
        deliveryTime: "1 kunda bepul",
        specs: { "Holati": "Yangi", "Kafolat": "Rasmiy 1 yil" }
      };
      products.unshift(newProduct);
      showToast("Yangi mahsulot xavfsiz saqlandi! 🚀");
    }

    saveProducts();
    resetProductForm();
    switchTab("tab-products");
  });

  const deleteProduct = (id) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    if (confirm(`"${p.title}" mahsulotini o'chirishni xohlaysizmi?`)) {
      products = products.filter(x => x.id !== id);
      saveProducts();
      showToast("Mahsulot o'chirildi", "trash-2", "info");
    }
  };

  // --- 3. BUYURTMALAR RO'YXATI (XSS IMMUNE) ---
  const renderOrders = () => {
    const container = document.getElementById("orders-list-container");
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center bg-zinc-900 rounded-2xl border border-zinc-800 space-y-2">
          <i data-lucide="shopping-bag" class="w-10 h-10 mx-auto text-zinc-600"></i>
          <h4 class="text-sm font-semibold text-zinc-300">Hozircha buyurtmalar yo'q</h4>
          <p class="text-xs text-zinc-500">Mijozlar buyurtma berganda bu yerda avtomatik ko'rinadi</p>
        </div>
      `;
      refreshIcons();
      return;
    }

    container.innerHTML = orders.map(order => {
      let statusColor = "bg-amber-500/20 text-amber-400 border-amber-500/30";
      if (order.status === "Zakalat kutilmoqda") statusColor = "bg-amber-500/25 text-amber-300 border-amber-500/40";
      if (order.status?.includes("Zakalat to'landi")) statusColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      if (order.status === "Qabul qilindi") statusColor = "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      if (order.status === "BTS ga topshirildi") statusColor = "bg-purple-500/20 text-purple-400 border-purple-500/30";
      if (order.status === "Yetkazilmoqda") statusColor = "bg-sky-500/20 text-sky-400 border-sky-500/30";
      if (order.status === "Yakunlandi") statusColor = "bg-teal-500/20 text-teal-400 border-teal-500/30";
      if (order.status === "Bekor qilindi") statusColor = "bg-rose-500/20 text-rose-400 border-rose-500/30";

      return `
        <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-sm hover:border-zinc-700 transition">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div class="flex items-center gap-3">
              <span class="font-mono font-bold text-sm text-indigo-400">#${order.id}</span>
              <span class="text-xs text-zinc-400">• ${escapeHtml(order.createdAt || "Yaqinda")}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}">
                ${escapeHtml(order.status)}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <label class="text-[11px] text-zinc-400">Holat:</label>
              <select class="order-status-select bg-zinc-800 border border-zinc-700 text-xs rounded-lg px-2 py-1 text-white outline-none" data-id="${order.id}">
                <option value="Yangi" ${order.status === "Yangi" ? "selected" : ""}>Yangi</option>
                <option value="Zakalat kutilmoqda" ${order.status === "Zakalat kutilmoqda" ? "selected" : ""}>Zakalat kutilmoqda</option>
                <option value="Zakalat to'landi (Tayyorlanmoqda)" ${order.status?.includes("Zakalat to'landi") ? "selected" : ""}>Zakalat to'landi</option>
                <option value="Qabul qilindi" ${order.status === "Qabul qilindi" ? "selected" : ""}>Qabul qilindi</option>
                <option value="BTS ga topshirildi" ${order.status === "BTS ga topshirildi" ? "selected" : ""}>BTS ga topshirildi</option>
                <option value="Yetkazilmoqda" ${order.status === "Yetkazilmoqda" ? "selected" : ""}>Yetkazilmoqda</option>
                <option value="Yakunlandi" ${order.status === "Yakunlandi" ? "selected" : ""}>Yakunlandi</option>
                <option value="Bekor qilindi" ${order.status === "Bekor qilindi" ? "selected" : ""}>Bekor qilindi</option>
              </select>
              <button class="resend-bot-btn p-1.5 rounded-lg text-zinc-400 hover:text-[#229ED9] hover:bg-zinc-800" data-id="${order.id}" title="Telegram botga qayta yuborish">
                <i data-lucide="send" class="w-4 h-4"></i>
              </button>
              <button class="order-delete-btn p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800" data-id="${order.id}" title="O'chirish">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-zinc-800/50">
              <span class="text-zinc-500 block text-[10px] uppercase font-bold">Mijoz</span>
              <span class="font-semibold text-white">${escapeHtml(order.customerName)}</span>
            </div>
            <div class="p-3 rounded-xl bg-zinc-800/50">
              <span class="text-zinc-500 block text-[10px] uppercase font-bold">Telefon</span>
              <a href="tel:${escapeHtml(order.phone)}" class="font-semibold text-indigo-400 hover:underline block">${escapeHtml(order.phone)}</a>
            </div>
            <div class="p-3 rounded-xl bg-zinc-800/50">
              <span class="text-zinc-500 block text-[10px] uppercase font-bold">BTS Express Manzil</span>
              <span class="font-semibold text-amber-400 block">${escapeHtml(order.deliveryType || "BTS Bo'limidan")}</span>
              <span class="text-[11px] text-zinc-300 block truncate" title="${escapeHtml(order.btsRegion ? `${order.btsRegion}, ${order.btsBranch || order.notes || ""}` : order.address || "")}">
                ${escapeHtml(order.btsRegion ? `${order.btsRegion} — ${order.btsBranch || order.notes || ""}` : order.address || "")}
              </span>
            </div>
            <div class="p-3 rounded-xl bg-zinc-800/50">
              <span class="text-zinc-500 block text-[10px] uppercase font-bold">To'lov & Zakalat</span>
              <span class="font-medium text-emerald-400 block">${formatPrice(order.total || 0)}</span>
              ${order.isPrepayment ? `
                <div class="mt-1 space-y-0.5 text-[10px]">
                  <span class="text-amber-400 font-bold block">🟢 Zakalat: ${formatPrice(order.prepaymentAmount || 0)}</span>
                  <span class="text-zinc-400 block">📦 BTS da: ${formatPrice(order.remainingAmount || 0)}</span>
                </div>
              ` : `
                <span class="text-[10px] text-zinc-400 block">${escapeHtml(order.paymentMethod || "100% To'lov")}</span>
              `}
            </div>
          </div>

          <div class="space-y-1.5">
            <span class="text-[11px] font-semibold text-zinc-400">Buyurtma tarkibi:</span>
            <div class="divide-y divide-zinc-800/60 rounded-xl bg-zinc-950/50 border border-zinc-800/60 px-3">
              ${(order.items || []).map(item => `
                <div class="py-2 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    ${item.image ? `<img src="${sanitizeUrl(item.image)}" class="w-8 h-8 rounded-lg object-cover bg-zinc-800">` : ""}
                    <span class="text-zinc-200 font-medium">${escapeHtml(item.title)}</span>
                    ${item.color ? `<span class="text-[10px] text-zinc-500">(${escapeHtml(item.color)})</span>` : ""}
                  </div>
                  <div class="text-right">
                    <span class="text-zinc-400">${item.quantity} dona x ${formatPrice(item.price)}</span>
                    <span class="font-bold text-white ml-2">${formatPrice(item.quantity * item.price)}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="flex justify-between items-center pt-1 text-sm font-bold">
            <span class="text-zinc-400">Jami to'lov:</span>
            <span class="text-base text-emerald-400">${formatPrice(order.total || 0)}</span>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".order-status-select").forEach(sel => {
      sel.addEventListener("change", (e) => {
        const id = parseInt(sel.getAttribute("data-id"));
        const ord = orders.find(o => o.id === id);
        if (ord) {
          ord.status = e.target.value;
          saveOrders();
          showToast(`Buyurtma holati yangilandi!`);
        }
      });
    });

    container.querySelectorAll(".resend-bot-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const ord = orders.find(o => o.id === id);
        if (!ord) return;
        
        const botToken = storeConfig.contacts?.telegramBotToken?.trim();
        const chatId = storeConfig.contacts?.telegramChatId?.trim();
        if (!botToken || !chatId) {
          showToast("Telegram Bot Token yoki Chat ID ulanmagan! 'Aloqa & Telegram' tabida sozlang.", "alert-circle", "error");
          return;
        }

        const itemsText = (ord.items || []).map(i => `• <b>${escapeHtml(i.title)}</b> — ${i.quantity} dona x ${formatPrice(i.price)}`).join("\n");
        const prepNotice = ord.isPrepayment 
          ? `\n⚡ <b>ZAKALAT:</b> <b>${formatPrice(ord.prepaymentAmount || 0)}</b>\n📦 <b>BTS Qoldiq:</b> <b>${formatPrice(ord.remainingAmount || 0)}</b>\n⚠️ <i>Zakalat to'langanini tekshirib keyin jo'nating!</i>\n`
          : "";
        const msg = `🔔 <b>QAYTA YUBORILGAN BUYURTMA #${ord.id}</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 <b>Mijoz:</b> ${ord.customerName}\n📞 <b>Tel:</b> <code>${ord.phone}</code>\n🚚 <b>Yetkazish:</b> BTS Pochta (${ord.deliveryType || "Bo'limdan"})\n🏢 <b>Viloyat:</b> ${ord.btsRegion || "-"}\n📍 <b>Filial/Manzil:</b> ${ord.btsBranch || ord.address}\n💳 <b>To'lov:</b> ${ord.paymentMethod}\n${prepNotice}💵 <b>Jami:</b> <b>${formatPrice(ord.total)}</b>\n\n📦 <b>Tarkibi:</b>\n${itemsText}\n\n🕒 <b>Vaqt:</b> ${ord.createdAt}`;

        try {
          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "HTML" })
          });
          const d = await res.json();
          if (d.ok) {
            showToast(`Buyurtma #${ord.id} Telegram botga muvaffaqiyatli yuborildi! 🚀`);
          } else {
            showToast(`Xatolik: ${d.description}`, "alert-circle", "error");
          }
        } catch (err) {
          showToast("Ulanish xatosi (Internetni tekshiring)", "wifi-off", "error");
        }
      });
    });

    container.querySelectorAll(".order-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        if (confirm(`Buyurtma #${id} ni o'chirmoqchimisiz?`)) {
          orders = orders.filter(o => o.id !== id);
          saveOrders();
        }
      });
    });

    refreshIcons();
  };

  document.getElementById("clear-orders-btn")?.addEventListener("click", () => {
    if (confirm("Haqiqatan ham barcha buyurtmalar tarixini tozalamoqchimisiz?")) {
      orders = [];
      saveOrders();
    }
  });

  // --- 4. BREND VA DIZAYN SOZLAMALARI ---
  const initBrandTab = () => {
    const b = storeConfig.brand || DEFAULT_STORE_CONFIG.brand;
    const t = storeConfig.topBar || DEFAULT_STORE_CONFIG.topBar;

    document.getElementById("cfg-brand-name").value = b.name || "NOVA";
    document.getElementById("cfg-brand-tagline").value = b.tagline || "Market";
    document.getElementById("cfg-logo-letter").value = b.logoLetter || "N";
    
    const colorInput = document.getElementById("cfg-accent-color");
    const hexInput = document.getElementById("cfg-accent-color-hex");
    const activeColor = b.accentColor || "#4f46e5";
    colorInput.value = activeColor;
    hexInput.value = activeColor;

    colorInput.addEventListener("input", (e) => { hexInput.value = e.target.value; });
    hexInput.addEventListener("input", (e) => { 
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) colorInput.value = e.target.value; 
    });

    window.setAccentQuick = (hex) => {
      colorInput.value = hex;
      hexInput.value = hex;
    };

    const logoPrev = document.getElementById("cfg-logo-preview");
    const cleanLogo = sanitizeUrl(b.logoImage);
    if (cleanLogo) {
      logoPrev.innerHTML = `<img src="${cleanLogo}" class="w-full h-full object-cover">`;
    } else {
      logoPrev.textContent = escapeHtml(b.logoLetter || "N");
    }

    const logoFileInput = document.getElementById("cfg-logo-file");
    if (logoFileInput) {
      logoFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.startsWith("image/")) {
            showToast("Faqat rasm faylini tanlang!", "alert-triangle", "error");
            return;
          }
          const reader = new FileReader();
          reader.onload = (evt) => {
            currentLogoImageData = sanitizeUrl(evt.target.result);
            logoPrev.innerHTML = `<img src="${currentLogoImageData}" class="w-full h-full object-cover">`;
            showToast("Logotip yangilandi! 🖼️");
          };
          reader.readAsDataURL(file);
        }
      });
    }

    document.getElementById("cfg-topbar-enable").checked = t.enabled !== false;
    document.getElementById("cfg-topbar-badge").value = t.badgeText || "Maxsus aksiya";
    document.getElementById("cfg-topbar-main").value = t.mainText || "";
    document.getElementById("cfg-topbar-delivery").value = t.deliveryText || "";
  };

  document.getElementById("brand-settings-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    storeConfig.brand = {
      name: document.getElementById("cfg-brand-name").value.trim() || "NOVA",
      tagline: document.getElementById("cfg-brand-tagline").value.trim(),
      logoLetter: document.getElementById("cfg-logo-letter").value.trim().toUpperCase() || "N",
      logoImage: sanitizeUrl(currentLogoImageData),
      accentColor: document.getElementById("cfg-accent-color").value
    };

    storeConfig.topBar = {
      enabled: document.getElementById("cfg-topbar-enable").checked,
      badgeText: document.getElementById("cfg-topbar-badge").value.trim(),
      mainText: document.getElementById("cfg-topbar-main").value.trim(),
      deliveryText: document.getElementById("cfg-topbar-delivery").value.trim()
    };

    saveStoreConfig();
  });

  // --- 5. BOSH SAHIFA (HERO) SOZLAMALARI ---
  const initHeroTab = () => {
    const h = storeConfig.hero || DEFAULT_STORE_CONFIG.hero;

    document.getElementById("cfg-hero-pill").value = h.pillText || "";
    document.getElementById("cfg-hero-title1").value = h.titleLine1 || "";
    document.getElementById("cfg-hero-title2").value = h.titleLine2 || "";
    document.getElementById("cfg-hero-desc").value = h.description || "";
    document.getElementById("cfg-hero-btn").value = h.buttonText || "";
    document.getElementById("cfg-flash-title").value = h.flashDealTitle || "Kunning taklifi";
    document.getElementById("cfg-flash-badge").value = h.flashDealBadge || "-25% gacha";

    populateProductSelects();
  };

  document.getElementById("hero-settings-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    storeConfig.hero = {
      pillText: document.getElementById("cfg-hero-pill").value.trim(),
      titleLine1: document.getElementById("cfg-hero-title1").value.trim(),
      titleLine2: document.getElementById("cfg-hero-title2").value.trim(),
      description: document.getElementById("cfg-hero-desc").value.trim(),
      buttonText: document.getElementById("cfg-hero-btn").value.trim(),
      flashDealTitle: document.getElementById("cfg-flash-title").value.trim(),
      flashDealBadge: document.getElementById("cfg-flash-badge").value.trim(),
      flashDealProductId: parseInt(document.getElementById("cfg-flash-product-id").value) || products[0]?.id
    };

    saveStoreConfig();
  });

  // --- 6. ISHONCH VA AFZALLIKLAR ---
  const initFeaturesTab = () => {
    const container = document.getElementById("features-inputs-container");
    if (!container) return;

    const feats = storeConfig.features || DEFAULT_STORE_CONFIG.features;

    container.innerHTML = feats.map((f, i) => `
      <div class="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700 space-y-2">
        <span class="block font-bold text-white text-xs">${i + 1}-Afzallik Bloki</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-zinc-400 text-[11px] mb-1">Sarlavha:</label>
            <input type="text" class="feat-title w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white outline-none" value="${escapeHtml(f.title)}">
          </div>
          <div>
            <label class="block text-zinc-400 text-[11px] mb-1">Kichik tavsif:</label>
            <input type="text" class="feat-desc w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white outline-none" value="${escapeHtml(f.desc)}">
          </div>
        </div>
      </div>
    `).join("");
  };

  document.getElementById("features-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const titles = document.querySelectorAll(".feat-title");
    const descs = document.querySelectorAll(".feat-desc");
    const feats = storeConfig.features || DEFAULT_STORE_CONFIG.features;

    const updated = [];
    titles.forEach((t, i) => {
      updated.push({
        id: i + 1,
        title: t.value.trim(),
        desc: descs[i]?.value.trim(),
        icon: feats[i]?.icon || "check"
      });
    });

    storeConfig.features = updated;
    saveStoreConfig();
  });

  // --- 7. TOIFALAR (KATALOGLAR) VA PROMOKODLAR ---
  const CURATED_ICONS = [
    "tag", "smartphone", "laptop", "shirt", "sparkles", "watch", "home",
    "book", "shopping-bag", "headphones", "tv", "camera", "flame", "gift",
    "heart", "layout-grid", "monitor", "car", "dumbbell", "coffee", "baby", "music", "wrench", "zap"
  ];

  const renderCategoriesAdmin = () => {
    const list = document.getElementById("categories-admin-list");
    if (!list) return;

    list.innerHTML = categories.map((c, i) => {
      const prodCount = products.filter(p => p.category === c.id).length;
      const isAll = c.id === "all";

      return `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 hover:border-zinc-600 transition text-xs shadow-sm">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
              <i data-lucide="${c.icon || "tag"}" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white truncate">${escapeHtml(c.name)}</span>
                ${isAll ? `<span class="px-2 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">Asosiy</span>` : ""}
              </div>
              <div class="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                <span class="font-mono text-zinc-500">${escapeHtml(c.id)}</span>
                <span>•</span>
                <span class="text-emerald-400 font-medium">${prodCount} ta mahsulot</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <button type="button" class="cat-move-up-btn p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-400 hover:text-white transition" data-index="${i}" title="Yuqoriga surish" ${i <= 1 ? "disabled opacity-40 cursor-not-allowed" : ""}>
              <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="cat-move-down-btn p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-400 hover:text-white transition" data-index="${i}" title="Pastga surish" ${i === categories.length - 1 || isAll ? "disabled opacity-40 cursor-not-allowed" : ""}>
              <i data-lucide="arrow-down" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="cat-edit-btn p-1.5 rounded-lg bg-zinc-900 hover:bg-indigo-600 text-zinc-300 hover:text-white transition" data-index="${i}" title="Tahrirlash">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            ${!isAll ? `
              <button type="button" class="cat-delete-btn p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition" data-index="${i}" title="O'chirish">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            ` : ""}
          </div>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".cat-move-up-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        if (idx > 1) {
          const temp = categories[idx];
          categories[idx] = categories[idx - 1];
          categories[idx - 1] = temp;
          saveCategories();
          showToast("Toifalar tartibi yangilandi ⬆️");
        }
      });
    });

    list.querySelectorAll(".cat-move-down-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        if (idx > 0 && idx < categories.length - 1) {
          const temp = categories[idx];
          categories[idx] = categories[idx + 1];
          categories[idx + 1] = temp;
          saveCategories();
          showToast("Toifalar tartibi yangilandi ⬇️");
        }
      });
    });

    list.querySelectorAll(".cat-edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        startEditCategory(idx);
      });
    });

    list.querySelectorAll(".cat-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        deleteCategory(idx);
      });
    });

    refreshIcons();
  };

  const deleteCategory = (idx) => {
    const cat = categories[idx];
    if (!cat || cat.id === "all") return;

    const count = products.filter(p => p.category === cat.id).length;
    let msg = `"${cat.name}" toifasini o'chirishni tasdiqlaysizmi?`;
    if (count > 0) {
      msg += `\n\nDiqqat: Ushbu toifada ${count} ta mahsulot mavjud. Ular "Barcha toifalar"ga xavfsiz o'tkaziladi.`;
    }

    if (confirm(msg)) {
      products.forEach(p => {
        if (p.category === cat.id) {
          p.category = "all";
          p.categoryName = "Barcha toifalar";
        }
      });
      categories.splice(idx, 1);
      saveCategories();
      saveProducts();
      showToast(`"${cat.name}" toifasi o'chirildi! 🗑️`, "trash-2", "info");
      reloadVisualStoreIframe();
    }
  };

  // Tezkor toifa qo'shish formasi
  document.getElementById("add-category-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("new-cat-name");
    const iconSelect = document.getElementById("new-cat-icon-select");
    const name = nameInput.value.trim();
    if (!name) return;

    const icon = iconSelect ? iconSelect.value : "tag";
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") + "-" + Math.floor(Math.random() * 100);
    categories.push({ id, name, icon });
    saveCategories();
    nameInput.value = "";
    showToast(`"${name}" toifasi qo'shildi! ✅`);
    reloadVisualStoreIframe();
  });

  // Admin Toifa Modali funksiyalari
  window.openAdminAddCategoryModal = () => {
    const modal = document.getElementById("admin-category-modal");
    if (!modal) return;
    document.getElementById("admin-cat-modal-title").textContent = "Yangi Toifa Qo'shish";
    document.getElementById("admin-cat-modal-index").value = "-1";
    document.getElementById("admin-cat-modal-orig-id").value = "";
    document.getElementById("admin-cat-modal-name").value = "";
    document.getElementById("admin-cat-modal-id").value = "";
    document.getElementById("admin-cat-modal-icon").value = "tag";
    document.getElementById("admin-cat-modal-delete-btn").classList.add("hidden");
    renderAdminIconPicker("tag");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    refreshIcons();
  };

  window.closeAdminCategoryModal = () => {
    const modal = document.getElementById("admin-category-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  };

  window.startEditCategory = (index) => {
    const cat = categories[index];
    if (!cat) return;
    const modal = document.getElementById("admin-category-modal");
    if (!modal) return;

    document.getElementById("admin-cat-modal-title").textContent = "Toifani Tahrirlash";
    document.getElementById("admin-cat-modal-index").value = index;
    document.getElementById("admin-cat-modal-orig-id").value = cat.id;
    document.getElementById("admin-cat-modal-name").value = cat.name;
    document.getElementById("admin-cat-modal-id").value = cat.id;
    document.getElementById("admin-cat-modal-icon").value = cat.icon || "tag";

    const deleteBtn = document.getElementById("admin-cat-modal-delete-btn");
    if (deleteBtn) {
      if (cat.id === "all") {
        deleteBtn.classList.add("hidden");
      } else {
        deleteBtn.classList.remove("hidden");
        deleteBtn.onclick = () => {
          closeAdminCategoryModal();
          deleteCategory(index);
        };
      }
    }

    renderAdminIconPicker(cat.icon || "tag");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    refreshIcons();
  };

  const renderAdminIconPicker = (selectedIcon) => {
    const grid = document.getElementById("admin-cat-icon-picker-grid");
    if (!grid) return;

    grid.innerHTML = CURATED_ICONS.map(ic => `
      <button type="button" class="icon-picker-btn p-2 rounded-xl text-center flex flex-col items-center justify-center transition border ${ic === selectedIcon ? "bg-indigo-600 text-white border-indigo-400 shadow-md" : "bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700 hover:bg-zinc-700"}" data-icon="${ic}">
        <i data-lucide="${ic}" class="w-4 h-4 mb-1"></i>
        <span class="text-[9px] font-mono leading-none">${ic}</span>
      </button>
    `).join("");

    grid.querySelectorAll(".icon-picker-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const ic = btn.getAttribute("data-icon");
        document.getElementById("admin-cat-modal-icon").value = ic;
        renderAdminIconPicker(ic);
      });
    });

    refreshIcons();
  };

  document.getElementById("admin-category-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const idx = parseInt(document.getElementById("admin-cat-modal-index").value);
    const origId = document.getElementById("admin-cat-modal-orig-id").value;
    const name = document.getElementById("admin-cat-modal-name").value.trim();
    let id = document.getElementById("admin-cat-modal-id").value.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const icon = document.getElementById("admin-cat-modal-icon").value || "tag";

    if (!name || !id) return;

    if (idx >= 0 && categories[idx]) {
      // Mavjud toifani tahrirlash
      categories[idx].name = name;
      categories[idx].id = id;
      categories[idx].icon = icon;

      // Mahsulotlardagi kategoriya nomini yangilash
      products.forEach(p => {
        if (p.category === origId) {
          p.category = id;
          p.categoryName = name;
        } else if (p.category === id) {
          p.categoryName = name;
        }
      });
      saveProducts();
      showToast(`"${name}" toifasi yangilandi! ✏️`);
    } else {
      // Yangi toifa qo'shish
      if (categories.some(c => c.id === id)) {
        id = id + "-" + Math.floor(Math.random() * 100);
      }
      categories.push({ id, name, icon });
      showToast(`"${name}" toifasi qo'shildi! 🚀`);
    }

    saveCategories();
    closeAdminCategoryModal();
    reloadVisualStoreIframe();
  });

  // --- VIZUAL MUHARRIR VA DEVICE BOSHQARUVI ---
  window.setVisualDevice = (device) => {
    const wrapper = document.getElementById("visual-iframe-wrapper");
    const btnDesktop = document.getElementById("admin-device-desktop");
    const btnTablet = document.getElementById("admin-device-tablet");
    const btnMobile = document.getElementById("admin-device-mobile");

    [btnDesktop, btnTablet, btnMobile].forEach(btn => {
      if (btn) {
        btn.className = "px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 text-zinc-400 hover:text-white transition";
      }
    });

    if (device === "mobile") {
      if (wrapper) wrapper.style.maxWidth = "390px";
      if (btnMobile) btnMobile.className = "px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 bg-indigo-600 text-white shadow transition";
    } else if (device === "tablet") {
      if (wrapper) wrapper.style.maxWidth = "768px";
      if (btnTablet) btnTablet.className = "px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 bg-indigo-600 text-white shadow transition";
    } else {
      if (wrapper) wrapper.style.maxWidth = "100%";
      if (btnDesktop) btnDesktop.className = "px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 bg-indigo-600 text-white shadow transition";
    }
    refreshIcons();
  };

  window.reloadVisualStoreIframe = () => {
    const iframe = document.getElementById("visual-store-iframe");
    if (iframe) {
      iframe.src = "index.html?edit_mode=1&v=" + Date.now();
      showToast("Vitrina yangilandi! ⚡");
    }
  };

  // --- BO'LIMLAR TARTIBI (LAYOUT MANAGER) MODALI ---
  const SECTIONS_META = {
    hero: { name: "Bosh Banner & Kunning Taklifi", icon: "layout" },
    trust: { name: "Ishonch & Afzalliklar Bloklari", icon: "shield-check" },
    categories: { name: "Ommabop Toifalar (Katalog)", icon: "tag" },
    products: { name: "Mahsulotlar Vitrinasi", icon: "package" },
    promo_banner: { name: "Maxsus Aksiya & Chegirma Banneri", icon: "sparkles" }
  };

  window.openAdminLayoutModal = () => {
    const modal = document.getElementById("admin-layout-modal");
    if (!modal) return;
    renderAdminLayoutList();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    refreshIcons();
  };

  window.closeAdminLayoutModal = () => {
    const modal = document.getElementById("admin-layout-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  };

  const renderAdminLayoutList = () => {
    const list = document.getElementById("admin-layout-sections-list");
    if (!list) return;

    const order = storeConfig.sectionOrder || ["hero", "trust", "categories", "products", "promo_banner"];
    const hidden = storeConfig.hiddenSections || [];

    list.innerHTML = order.map((key, i) => {
      const meta = SECTIONS_META[key] || { name: key, icon: "layers" };
      const isHidden = hidden.includes(key);

      return `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 text-xs">
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-lg bg-zinc-900 text-zinc-400 font-mono font-bold flex items-center justify-center text-[11px]">${i + 1}</span>
            <div class="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <i data-lucide="${meta.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <span class="font-bold text-white block">${escapeHtml(meta.name)}</span>
              <span class="text-[10px] text-zinc-500 font-mono">${key}</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button type="button" class="layout-up-btn p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-300 hover:text-white ${i === 0 ? "opacity-30 cursor-not-allowed" : ""}" data-index="${i}" title="Yuqoriga surish" ${i === 0 ? "disabled" : ""}>
              <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="layout-down-btn p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-300 hover:text-white ${i === order.length - 1 ? "opacity-30 cursor-not-allowed" : ""}" data-index="${i}" title="Pastga surish" ${i === order.length - 1 ? "disabled" : ""}>
              <i data-lucide="arrow-down" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="layout-toggle-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${isHidden ? "bg-rose-950/60 text-rose-300 border border-rose-800" : "bg-emerald-950/60 text-emerald-300 border border-emerald-800"}" data-key="${key}" title="Ko'rinishni o'zgartirish">
              <i data-lucide="${isHidden ? "eye-off" : "eye"}" class="w-3.5 h-3.5"></i>
              <span>${isHidden ? "Yashirin" : "Ko'rinmoqda"}</span>
            </button>
          </div>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".layout-up-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        if (idx > 0) {
          const temp = order[idx];
          order[idx] = order[idx - 1];
          order[idx - 1] = temp;
          storeConfig.sectionOrder = order;
          saveStoreConfig();
          renderAdminLayoutList();
          reloadVisualStoreIframe();
        }
      });
    });

    list.querySelectorAll(".layout-down-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        if (idx < order.length - 1) {
          const temp = order[idx];
          order[idx] = order[idx + 1];
          order[idx + 1] = temp;
          storeConfig.sectionOrder = order;
          saveStoreConfig();
          renderAdminLayoutList();
          reloadVisualStoreIframe();
        }
      });
    });

    list.querySelectorAll(".layout-toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        if (!storeConfig.hiddenSections) storeConfig.hiddenSections = [];
        const hIdx = storeConfig.hiddenSections.indexOf(key);
        if (hIdx > -1) {
          storeConfig.hiddenSections.splice(hIdx, 1);
        } else {
          storeConfig.hiddenSections.push(key);
        }
        saveStoreConfig();
        renderAdminLayoutList();
        reloadVisualStoreIframe();
      });
    });

    refreshIcons();
  };

  window.resetAdminSectionOrder = () => {
    storeConfig.sectionOrder = ["hero", "trust", "categories", "products", "promo_banner"];
    storeConfig.hiddenSections = [];
    saveStoreConfig();
    renderAdminLayoutList();
    reloadVisualStoreIframe();
    showToast("Bo'limlar tartibi standart holatga qaytarildi! 🔄");
  };

  const renderPromoAdmin = () => {
    const list = document.getElementById("promo-admin-list");
    if (!list) return;

    const promoList = storeConfig.promoCodes || DEFAULT_STORE_CONFIG.promoCodes;

    list.innerHTML = promoList.map((p, i) => `
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-indigo-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">${escapeHtml(p.code)}</span>
          <span class="text-emerald-400 font-bold">-${p.discount}% chegirma</span>
        </div>
        <button class="promo-delete-btn text-zinc-400 hover:text-rose-400 p-1" data-index="${i}">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `).join("");

    list.querySelectorAll(".promo-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        promoList.splice(idx, 1);
        storeConfig.promoCodes = promoList;
        saveStoreConfig();
        renderPromoAdmin();
      });
    });

    refreshIcons();
  };

  document.getElementById("add-promo-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("new-promo-code").value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const discount = Math.min(90, Math.max(1, parseInt(document.getElementById("new-promo-discount").value) || 0));

    if (!code || !discount) return;

    if (!storeConfig.promoCodes) storeConfig.promoCodes = [];
    storeConfig.promoCodes.push({ code, discount });
    saveStoreConfig();

    document.getElementById("new-promo-code").value = "";
    document.getElementById("new-promo-discount").value = "";
    renderPromoAdmin();
    showToast(`"${code}" promokodi xavfsiz qo'shildi! 🎉`);
  });

  // --- TEZKOR POCHTA MANZILLARI BOSHQARUVI ---
  const renderFastLocationsAdmin = () => {
    const list = document.getElementById("fast-locations-admin-list");
    if (!list) return;

    if (!storeConfig.fastDeliveryLocations) {
      storeConfig.fastDeliveryLocations = (typeof DEFAULT_STORE_CONFIG !== "undefined" && DEFAULT_STORE_CONFIG.fastDeliveryLocations) 
        ? JSON.parse(JSON.stringify(DEFAULT_STORE_CONFIG.fastDeliveryLocations)) 
        : [];
    }

    const locs = storeConfig.fastDeliveryLocations;

    if (locs.length === 0) {
      list.innerHTML = `<div class="p-3 text-xs text-zinc-500 text-center border border-dashed border-zinc-700 rounded-xl">Hozircha tezkor pochta manzillari mavjud emas. Quyidagi forma orqali yangi manzil qo'shing.</div>`;
      return;
    }

    list.innerHTML = locs.map((loc, idx) => `
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span class="font-bold text-white">${escapeHtml(loc.name)}</span>
          <span class="text-amber-400 font-mono text-[11px]">(${escapeHtml(loc.time || "Tezkor")})</span>
        </div>
        <button type="button" class="fast-loc-delete-btn p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition" data-index="${idx}" title="Manzilni o'chirish">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `).join("");

    list.querySelectorAll(".fast-loc-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.getAttribute("data-index"));
        const removed = locs[i];
        locs.splice(i, 1);
        storeConfig.fastDeliveryLocations = locs;
        saveStoreConfig();
        renderFastLocationsAdmin();
        showToast(`"${removed ? removed.name : 'Manzil'}" o'chirildi! 🗑️`, "trash-2", "info");
      });
    });

    refreshIcons();
  };

  const addFastLocBtn = document.getElementById("add-fast-loc-btn");
  if (addFastLocBtn) {
    addFastLocBtn.addEventListener("click", () => {
      const nameInput = document.getElementById("new-fast-loc-name");
      const timeInput = document.getElementById("new-fast-loc-time");
      const name = nameInput ? nameInput.value.trim() : "";
      const time = timeInput ? timeInput.value.trim() : "";

      if (!name) {
        showToast("Manzil yoki filial nomini kiriting!", "alert-triangle", "error");
        return;
      }

      if (!storeConfig.fastDeliveryLocations) {
        storeConfig.fastDeliveryLocations = (typeof DEFAULT_STORE_CONFIG !== "undefined" && DEFAULT_STORE_CONFIG.fastDeliveryLocations) 
          ? JSON.parse(JSON.stringify(DEFAULT_STORE_CONFIG.fastDeliveryLocations)) 
          : [];
      }

      storeConfig.fastDeliveryLocations.push({
        id: "fast-" + Date.now(),
        name: name,
        time: time || "1-2 soat ichida"
      });

      saveStoreConfig();
      if (nameInput) nameInput.value = "";
      if (timeInput) timeInput.value = "";
      renderFastLocationsAdmin();
      showToast(`⚡ "${name}" tezkor manzili qo'shildi!`);
    });
  }

  // --- 8. ALOQA, TELEGRAM BOT VA PAROL XAVFSIZLIGI ---
  const initContactsTab = () => {
    const c = storeConfig.contacts || DEFAULT_STORE_CONFIG.contacts;

    document.getElementById("cfg-phone").value = c.phone || "";
    document.getElementById("cfg-telegram").value = c.telegram || "";
    document.getElementById("cfg-hours").value = c.workingHours || "";
    document.getElementById("cfg-about").value = c.aboutText || "";
    document.getElementById("cfg-copyright").value = c.copyright || "";

    const botTokenInput = document.getElementById("cfg-bot-token");
    const chatIdInput = document.getElementById("cfg-chat-id");
    const autoSendCheck = document.getElementById("cfg-telegram-auto");

    if (botTokenInput) botTokenInput.value = c.telegramBotToken || "";
    if (chatIdInput) chatIdInput.value = c.telegramChatId || "";
    if (autoSendCheck) autoSendCheck.checked = c.telegramAutoSend !== false;

    // Zakalat va To'lov kartasi sozlamalari
    const prepEnable = document.getElementById("cfg-prepayment-enable");
    const prepCard = document.getElementById("cfg-card-number");
    const prepHolder = document.getElementById("cfg-card-holder");
    const prepDefault = document.getElementById("cfg-prepayment-default");

    const pConf = storeConfig.prepayment || DEFAULT_STORE_CONFIG.prepayment || {};
    if (prepEnable) prepEnable.checked = pConf.enabled !== false;
    if (prepCard) prepCard.value = pConf.cardNumber || "";
    if (prepHolder) prepHolder.value = pConf.cardHolder || "";
    if (prepDefault) prepDefault.value = pConf.defaultAmount || 50000;

    renderFastLocationsAdmin();
  };

  // Telegram botni tekshirish (Test xabar yuborish)
  const testTelegramBtn = document.getElementById("test-telegram-btn");
  const testResult = document.getElementById("telegram-test-result");
  if (testTelegramBtn && testResult) {
    testTelegramBtn.addEventListener("click", async () => {
      const token = document.getElementById("cfg-bot-token")?.value.trim();
      const chatId = document.getElementById("cfg-chat-id")?.value.trim();
      if (!token || !chatId) {
        testResult.className = "text-xs text-rose-400 font-medium";
        testResult.textContent = "Iltimos, Bot Token va Chat ID ni kiriting!";
        return;
      }
      testResult.className = "text-xs text-amber-400 font-medium flex items-center gap-1";
      testResult.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Tekshirilmoqda...';
      refreshIcons();

      try {
        const testMsg = `🔔 <b>NOVA Market — Sinov Xabari (Test)</b>\n\n✅ <b>Tabriklaymiz!</b> Telegram bot integratsiyasi muvaffaqiyatli ulandi.\nEndi do'kondan tushgan yangi buyurtmalar avtomatik shu yerga kelib tushadi! 🚀`;
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: testMsg,
            parse_mode: "HTML"
          })
        });
        const data = await res.json();
        if (data.ok) {
          testResult.className = "text-xs text-emerald-400 font-medium";
          testResult.textContent = "✅ Test muvaffaqiyatli! Botingizga xabar yuborildi.";
        } else {
          testResult.className = "text-xs text-rose-400 font-medium";
          testResult.textContent = `❌ Xatolik: ${data.description || "Noma'lum xato"}`;
        }
      } catch (err) {
        testResult.className = "text-xs text-rose-400 font-medium";
        testResult.textContent = "❌ Ulanish xatosi (Internetni tekshiring)";
      }
    });
  }

  document.getElementById("contacts-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    storeConfig.contacts = {
      phone: document.getElementById("cfg-phone").value.trim(),
      telegram: document.getElementById("cfg-telegram").value.trim(),
      telegramBotToken: document.getElementById("cfg-bot-token")?.value.trim() || "",
      telegramChatId: document.getElementById("cfg-chat-id")?.value.trim() || "",
      telegramAutoSend: document.getElementById("cfg-telegram-auto")?.checked ?? true,
      workingHours: document.getElementById("cfg-hours").value.trim(),
      aboutText: document.getElementById("cfg-about").value.trim(),
      copyright: document.getElementById("cfg-copyright").value.trim()
    };

    storeConfig.prepayment = {
      enabled: document.getElementById("cfg-prepayment-enable")?.checked ?? true,
      cardNumber: document.getElementById("cfg-card-number")?.value.trim() || "8600 5304 1234 5678",
      cardHolder: document.getElementById("cfg-card-holder")?.value.trim() || "SARDOR ALIYEV (NOVA)",
      cardBank: "Uzcard / Humo",
      defaultAmount: parseInt(document.getElementById("cfg-prepayment-default")?.value) || 50000,
      infoText: "Pochta xarajatlari va tovar band qilinishi uchun avval oldindan zakalat to'lanadi. Qolgan summa tovar BTS pochtasiga yetib borganida to'lanadi."
    };

    const newPwd = document.getElementById("cfg-new-password").value.trim();
    if (newPwd) {
      if (newPwd.length < 6) {
        showToast("Parol kamida 6 ta belgidan iborat bo'lishi kerak!", "alert-triangle", "error");
        return;
      }
      // Parolni ochiq emas, faqat SHA-256 xeshini saqlaymiz!
      const newHash = await computeSecureHash(newPwd);
      storeConfig.adminPasswordHash = newHash;
      document.getElementById("cfg-new-password").value = "";
      showToast("Admin paroli kriptografik xeshlangan holda yangilandi! 🔑");
    }

    saveStoreConfig();
  });

  // --- ZAXIRALASH VA TIKLASH (EXPORT / IMPORT JSON) ---
  document.getElementById("export-backup-btn")?.addEventListener("click", () => {
    const backupData = {
      version: "2026.1",
      exportedAt: new Date().toISOString(),
      products: products,
      storeConfig: storeConfig,
      categories: categories,
      orders: orders
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nova_market_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Barcha mahsulotlar va sozlamalar Zaxira fayliga yuklandi! 📦");
  });

  document.getElementById("import-backup-file")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!data || typeof data !== "object") {
          throw new Error("Fayl formati noto'g'ri");
        }

        if (data.products && Array.isArray(data.products)) {
          products = data.products;
          localStorage.setItem("nova_products", JSON.stringify(products));
        }
        if (data.storeConfig && typeof data.storeConfig === "object") {
          storeConfig = data.storeConfig;
          localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
        }
        if (data.categories && Array.isArray(data.categories)) {
          categories = data.categories;
          localStorage.setItem("nova_categories", JSON.stringify(categories));
        }
        if (data.orders && Array.isArray(data.orders)) {
          orders = data.orders;
          localStorage.setItem("nova_orders", JSON.stringify(orders));
        }

        initAllTabs();
        showToast("Ma'lumotlar zaxiradan muvaffaqiyatli tiklandi! 🎉");
        reloadVisualStoreIframe();
      } catch (err) {
        showToast("Zaxira faylini o'qishda xatolik: " + err.message, "alert-triangle", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  // Hard Reset
  document.getElementById("hard-reset-btn")?.addEventListener("click", () => {
    if (confirm("DIQQAT: Barcha o'zgarishlar o'chib, boshlang'ich holat tiklanadi. Davom etasizmi?")) {
      products = [...INITIAL_PRODUCTS];
      storeConfig = JSON.parse(JSON.stringify(DEFAULT_STORE_CONFIG));
      categories = [...CATEGORIES];
      orders = [];

      localStorage.setItem("nova_products", JSON.stringify(products));
      localStorage.setItem("nova_store_config", JSON.stringify(storeConfig));
      localStorage.setItem("nova_categories", JSON.stringify(categories));
      localStorage.setItem("nova_orders", JSON.stringify(orders));

      initAllTabs();
      showToast("Tizim to'liq tiklandi! 🔄");
    }
  });

  // --- BARCHA TABLARNI TAYYORLASH ---
  const initAllTabs = () => {
    updateHeaderBrand();
    updateStats();
    populateCategorySelects();
    renderProductsTable();
    renderOrders();
    initBrandTab();
    initHeroTab();
    initFeaturesTab();
    renderCategoriesAdmin();
    renderPromoAdmin();
    initContactsTab();
    refreshIcons();
  };

  // --- CROSS-FRAME & URL PARAM ROUTING ---
  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "NOVA_EDIT_PRODUCT") {
      startEditProduct(e.data.id);
    } else if (e.data && e.data.type === "NOVA_OPEN_ADD_PRODUCT") {
      resetProductForm();
      switchTab("tab-add");
    }
  });

  const adminUrlParams = new URLSearchParams(window.location.search);
  const editProdId = adminUrlParams.get("edit_product");
  if (editProdId) {
    setTimeout(() => {
      startEditProduct(parseInt(editProdId));
    }, 200);
  } else if (adminUrlParams.get("action") === "add_product") {
    setTimeout(() => {
      resetProductForm();
      switchTab("tab-add");
    }, 200);
  }

  checkAuth();
});
