# 🛍️ NOVA Market — Zamonaviy va Minimalistik Onlayn Do'kon

Uzum Market modelidagi, lekin ortiqcha vizual yuklamalarsiz, o'ta nafis va zamonaviy (minimalistik) uslubda yaratilgan onlayn market platformasi.

---

## ✨ Asosiy Afzalliklar va Imkoniyatlar

1. **O'ziga tortuvchi Minimalist Dizayn:**
   - Apple va Linear uslubidagi toza tipografiya (*Plus Jakarta Sans*).
   - Shaffof shishasimon (glassmorphism) yuqori qidiruv paneli.
   - Silliq micro-animatsiyalar va hover effektlar.
   - **Tungi (Dark) va Kunduzgi (Light)** rejimni qo'llab-quvvatlash.

2. **Uzum Market tajribasi asosida optimallashtirilgan:**
   - **"1 kunda bepul yetkazish"** belgisi (ishonch omili).
   - **Muddatli to'lov kalkulyatori** (*oyiga 145 000 so'mdan*).
   - **Kunning maxsus taklifi** (Flash deal) va orqaga sanovchi jonli taymer.
   - Realistik O'zbekiston bozori mahsulotlari (Smartfonlar, noutbuklar, Dyson, kiyimlar, uy jihozlari).

3. **To'liq Savdo Funksionali:**
   - **Tezkor qidiruv va filtrlash** (Real-time live search).
   - **Toifalar (Kategoriyalar)** bo'yicha saralash.
   - **Interaktiv Mahsulot oynasi (Quick View)**: Rasmlar galereyasi, rang va o'lcham tanlash, to'liq texnik xususiyatlar.
   - **Savatcha (Slide-over Cart Drawer)**: Mahsulot sonini boshqarish (+/-), umumiy hisob, chegirmalar.
   - **Promokod tizimi**: Masalan: `NOVA10` (10% chegirma) yoki `MAXSUS20` (20% chegirma).
   - **Sevimlilar ro'yxati (Wishlist)**: Yurakcha bosilgan mahsulotlarni saqlash.

4. **BTS Express Pochta & Avtomatik Telegram Bot Integratsiyasi:**
   - **BTS Pochta orqali Manzil Tanlash**: O'zbekistonning barcha 14 ta viloyati va hududlaridagi rasmiy BTS punktlari integratsiya qilingan.
   - **Yetkazish turlari**: "BTS Bo'limidan qabul qilish" yoki "BTS Kuryeri orqali to'g'ridan-to'g'ri eshikkacha".
   - **⚡ Avtomatik Telegram Bot Xabarnomasi**: Mijoz saytda buyurtmani tasdiqlashi bilan, hech narsa bosishi shart emas — barcha buyurtma ma'lumotlari, tanlangan BTS filiali, telefon va mahsulotlar avtomatik ravishda do'kon egasining **Telegram Botiga** kelib tushadi!
   - **Admin Paneldan Botni Sozlash**: Bot Token va Chat ID kiritish, "Botni tekshirish (Test xabar)" tugmasi va buyurtmalarni qayta yuborish imkoniyati.
   - Click, Payme va BTS Pochtada qabul qilishda naqd/karta to'lov usullari.
   - Muvaffaqiyatli xarid konfetti bayramona effekti (`canvas-confetti`).

5. **To'liq Boshqaruv Markazi (Har bir nuqtani sozlash va Real-time Sinxronizatsiya):**
   - **Brend & Tashqi Ko'rinish**: Do'kon nomi, logotipi (kompyuterdan rasm yoki harf), asosiy brend rangi (Color Picker orqali istalgan rang), yuqori e'lon lentasi.
   - **Bosh Sahifa (Hero Banner)**: Katta sarlavhalar, tavsif, tugma matni va Kunning taklifida qaysi tovar turishi.
   - **Ishonch Bloklari (4 ta afzallik)**: 1 kunda yetkazish, kafolat, bo'lib to'lash kabi bloklarning barcha matnlari.
   - **Mahsulotlar (Katalog)**: Yangi tovar qo'shish (kompyuterdan rasm tanlash bilan), tahrirlash, o'chirish.
   - **Toifalar & Promokodlar**: Istalgan yangi toifani qo'shish/o'chirish, yangi chegirma promokodlari yaratish.
   - **Aloqa & Footer**: Telefon raqam, Telegram operator, ish vaqti, do'kon haqidagi matn.
   - **Mijozlar Buyurtmalari (Orders)**: Sayt orqali tushgan barcha xaridlar va ularning holatlari.
   - **⚡ Real-time Sinxronizatsiya**: Agar do'kon va admin panel ikkita alohida tabda ochilgan bo'lsa, adminga kiritilgan har qanday o'zgarish do'kon sahifasida **sahifani yangilamasdan (F5 bosmasdan) darhol jonli yangilanadi!**

---

## 🚀 Ishga Tushirish

### Xaridorlar uchun do'konni ochish:
`index.html` yoki `run_store.bat` faylini oching.

### Do'kon egasi uchun boshqaruv (Admin):
`admin.html` yoki `run_admin.bat` faylini oching.
- **Boshlang'ich parol:** `admin777` (admin panel xavfsizlik bo'limidan o'zgartira olasiz).
- **Maxfiy klaviatura kombinatsiyasi:** Do'kon sahifasida (`index.html`) istalgan vaqtda `Ctrl + Shift + A` bosilsa, to'g'ridan-to'g'ri admin panelga olib o'tadi.

---

## 🛡️ Kiberxavfsizlik Himoyasi (Enterprise-Grade Security Architecture)

Do'kon va Admin Panel professional darajada hakkerlik hujumlariga qarshi quyidagi ko'p bosqichli himoya tizimlari bilan qurollantirilgan:

1. **SHA-256 Kriptografik Xesh (Salt & Pepper bilan):**
   - Parol hech qachon brauzerda yoki kodda ochiq (plaintext) saqlanmaydi.
   - Parol Web Crypto API orqali maxsus tuz (`nova_secure_salt_2026`) va qalampir (`nova_super_pepper_999`) qo'shilgan holda xeshlanadi. Rainbow Table yoki Dictionary hujumlari ish bermaydi.

2. **Brute-Force & Lug'at Hujumlariga Qarshi Bloklash (Lockout):**
   - Agar admin panelga ketma-ket 5 marta noto'g'ri parol terilsa, tizim avtomatik ravishda **10 daqiqaga to'liq bloklanadi**.
   - Qolgan vaqt jonli orqaga hisoblab ko'rsatiladi va bu vaqt ichida parolni tekshirish ham rad etiladi.

3. **Vaqt bo'yicha hujumlarning oldini olish (Anti-Timing Attack Delay):**
   - Hakkerlar parolni qancha millisekundda tekshirilayotganini tahlil qilib parolni topa olmasligi uchun sun'iy kripto-kechikish (600ms) o'rnatilgan.

4. **XSS (Cross-Site Scripting) Hujumlariga Qarshi Sanitizatsiya:**
   - Xaridorlar tomonidan buyurtma formasida yoki Admin tomonidan tovar tavsifida yuborilgan har qanday `<script>`, `<iframe>`, `onerror=` kabi xavfli HTML teglar `escapeHtml()` filtri orqali xavfsiz holatga keltiriladi.
   - Barcha tashqi rasm va havolalar `sanitizeUrl()` orqali tekshirilib, faqat `http/https` va `data:image` formatlarigagina ruxsat beriladi (`javascript:` protokoli bloklanadi).

5. **Anti-Clickjacking (Framebusting):**
   - Hakkerlar do'kon yoki admin panelni begona saytlar ichida ko'rinmas `<iframe>` ga joylab foydalanuvchi bosishlarini o'g'irlay olmasligi uchun `window.top !== window.self` tekshiruvi va CSP `frame-ancestors 'self'` o'rnatilgan.

6. **Content Security Policy (CSP) & HTTP Security Headers:**
   - Barcha sahifalarga zamonaviy CSP meta-teglari va `server.py` ga HTTP sarlavhalari biriktirilgan:
     - `X-Content-Type-Options: nosniff` (MIME sniffing oldini olish)
     - `X-Frame-Options: SAMEORIGIN` (Iframe himoyasi)
     - `Referrer-Policy: strict-origin-when-cross-origin` (Maxfiy ma'lumotlar havola orqali sizib chiqmasligi)
     - `Permissions-Policy` (Kamera va mikrofonni bloklash)

7. **Path Traversal (Katalogdan chiqib ketish) Himoyasi:**
   - Mahalliy `server.py` orqali `../../` kabi yo'llar orqali kompyuterdagi boshqa shaxsiy fayllarni o'qishga urinishlar qat'iy bloklanadi va `403 Forbidden` qaytariladi.
   - `.py`, `.bat`, `.git`, `.env` kabi tizim fayllari brauzer orqali yuklab olishdan yashirilgan.

8. **Avtomatik Sessiya Xavfsizligi (Inactivity Timeout):**
   - Agar admin panelda 30 daqiqa hech qanday harakat bajarilmasa, sessiya xavfsizlik nuqtai nazaridan avtomatik yopiladi va admin qayta tizimga kirishi so'raladi.

