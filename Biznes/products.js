// Mahsulotlar bazasi (Boshlang'ich ma'lumotlar)
const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: "Apple iPhone 16 Pro Max 256GB Desert Titanium",
    category: "smartphones",
    categoryName: "Smartfonlar",
    price: 17200000,
    oldPrice: 19500000,
    rating: 4.9,
    reviewsCount: 142,
    badge: "Super Narx",
    badgeType: "fire",
    deliveryTime: "1 kunda bepul",
    cargoPrice: "25 000 so'm",
    monthlyPrice: 1720000, // 12 oyga
    prepaymentAmount: 200000, // Oldindan to'lov (zakalat)
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Desert Titanium", "Natural Titanium", "Black Titanium"],
    sizes: ["256GB", "512GB", "1TB"],
    description: "A18 Pro protsessori, titan korpus, 48MP asosiy kamera va professional darajadagi suratga olish imkoniyati. Batareya muddati 33 soatgacha video ko'rish imkonini beradi.",
    specs: {
      "Ekran": "6.9 dyuym Super Retina XDR OLED 120Hz",
      "Protsessor": "Apple A18 Pro (3 nm)",
      "Xotira": "256 GB / 8 GB RAM",
      "Kamera": "48 MP + 48 MP + 12 MP (5x zoom)",
      "Kafolat": "1 yil rasmiy kafolat"
    },
    isFlashDeal: true,
    stock: 14
  },
  {
    id: 2,
    title: "Sony WH-1000XM5 Simsiz shovqinni bekor qiluvchi quloqchin",
    category: "electronics",
    categoryName: "Elektronika",
    price: 4350000,
    oldPrice: 5100000,
    rating: 4.8,
    reviewsCount: 89,
    badge: "Xit Sotuv",
    badgeType: "star",
    deliveryTime: "1 kunda bepul",
    cargoPrice: "18 000 so'm",
    monthlyPrice: 435000,
    prepaymentAmount: 100000, // Oldindan to'lov (zakalat)
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Qora", "Kumushrang", "Tungi ko'k"],
    sizes: ["Universal"],
    description: "Sanoatdagi eng ilg'or faol shovqin bekor qilish (ANC) texnologiyasi, kristall kabi tiniq Hi-Res audio va 30 soatgacha to'xtovsiz ishlash.",
    specs: {
      "Turi": "Simsiz to'liq qoplovchi quloqchin",
      "Bluetooth": "5.2 (LDAC, AAC, SBC)",
      "Avtonomiya": "30 soat (ANC yoqilgan holatda)",
      "Og'irligi": "250 gramm",
      "Tezkor quvvatlash": "3 daqiqada 3 soatlik musiqa"
    },
    isFlashDeal: true,
    stock: 22
  },
  {
    id: 3,
    title: "Dyson Airwrap Multi-Styler Complete Long Fen-Stayler",
    category: "beauty",
    categoryName: "Go'zallik",
    price: 7600000,
    oldPrice: 8900000,
    rating: 5.0,
    reviewsCount: 230,
    badge: "Premium",
    badgeType: "crown",
    deliveryTime: "1 kunda bepul",
    cargoPrice: "30 000 so'm",
    monthlyPrice: 760000,
    prepaymentAmount: 150000,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Nikelli mis", "Pushti pushti", "Qora"],
    sizes: ["Complete Long"],
    description: "Haddan tashqari yuqori haroratsiz sochlarni turmaklash. Coanda aero-dinamik effekti orqali sochlarni tabiiy shakllantiradi va jilokorlik baxsh etadi.",
    specs: {
      "Quvvat": "1300 W",
      "Harorat rejimi": "3 xil rejim + sovuq havo",
      "Tezlik": "3 xil havo oqimi",
      "Kafolat": "2 yil xalqaro kafolat"
    },
    isFlashDeal: false,
    stock: 8
  },
  {
    id: 4,
    title: "Nike Air Max Pulse Erkaklar Krossovkasi",
    category: "fashion",
    categoryName: "Kiyim va Poyabzal",
    price: 1450000,
    oldPrice: 1950000,
    rating: 4.7,
    reviewsCount: 56,
    badge: "-25% Chegirma",
    badgeType: "discount",
    deliveryTime: "1 kunda bepul",
    monthlyPrice: 145000,
    prepaymentAmount: 70000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Qizil-Oq", "To'liq Qora", "Kulrang"],
    sizes: ["40", "41", "42", "43", "44"],
    description: "London musiqa sahnalaridan ilhomlangan zamonaviy dizayn. Point-loaded Air amortizatsiyasi har bir qadamda mislsiz qulaylik bag'ishlaydi.",
    specs: {
      "Mavsum": "Bahor / Yoz / Kuz",
      "Material": "Nafas oluvchi to'r va charm detallar",
      "Taglik": "Ko'pikli Air-Sole yumshoq taglik",
      "Kelib chiqishi": "Vetnam (Asl nusxa)"
    },
    isFlashDeal: true,
    stock: 35
  },
  {
    id: 5,
    title: "Samsung Galaxy Watch Ultra 47mm LTE Titanium",
    category: "accessories",
    categoryName: "Aksessuarlar",
    price: 6890000,
    oldPrice: 7800000,
    rating: 4.9,
    reviewsCount: 48,
    badge: "Yangi",
    badgeType: "new",
    deliveryTime: "1 kunda bepul",
    monthlyPrice: 689000,
    prepaymentAmount: 100000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Titanium Gray", "Titanium White", "Titanium Silver"],
    sizes: ["47mm"],
    description: "Ekstremal sharoitlar uchun yaratilgan flagman smart soat. 10 ATM suvga chidamlilik, ikki chastotali GPS va sun'iy intellektga ega sog'liq tahlili.",
    specs: {
      "Korpus": "Aerokosmik Titan 4-darajali",
      "Suvga chidamlilik": "100 metr (10 ATM + IP68)",
      "Batareya": "Quvvat tejash rejimida 100 soatgacha",
      "Datchiklar": "EKG, qon bosimi, tana tarkibi BIA, puls"
    },
    isFlashDeal: false,
    stock: 19
  },
  {
    id: 6,
    title: "De'Longhi Magnifica S Avtomatik Qahva Mashinasi",
    category: "home",
    categoryName: "Uy-ro'zg'or",
    price: 5200000,
    oldPrice: 6400000,
    rating: 4.9,
    reviewsCount: 115,
    badge: "Super Narx",
    badgeType: "fire",
    deliveryTime: "1 kunda bepul",
    monthlyPrice: 520000,
    prepaymentAmount: 150000,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Kumush-Qora", "Klassik Qora"],
    sizes: ["Standart"],
    description: "Haqiqiy italyancha espresso va kapuchino tayyorlashning eng oson usuli. Donlarni yangi maydalab, to'liq xushbo'y qahva taqdim etadi.",
    specs: {
      "Bosim": "15 bar",
      "Don sig'imi": "250 gramm",
      "Suv idishi": "1.8 litr",
      "Kafolat": "2 yil kafolat"
    },
    isFlashDeal: false,
    stock: 11
  },
  {
    id: 7,
    title: "Minimalist Oversize Paxta Xudi (Uniseks)",
    category: "fashion",
    categoryName: "Kiyim va Poyabzal",
    price: 340000,
    oldPrice: 480000,
    rating: 4.6,
    reviewsCount: 74,
    badge: "-30%",
    badgeType: "discount",
    deliveryTime: "1 kunda bepul",
    monthlyPrice: 34000,
    prepaymentAmount: 50000,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Krem rang", "Graphite", "Zaytun yashil"],
    sizes: ["S", "M", "L", "XL"],
    description: "100% organik zich paxta (380 g/m²). Ichki qismi yumshoq junli (fleese), shaklini yo'qotmaydi va har qanday uslubga mos tushadi.",
    specs: {
      "Tarkibi": "100% Paxta (Premium sifat)",
      "Qolip": "Oversize erkin bichim",
      "Yuvish": "30 darajada mashinada yuvish tavsiya etiladi"
    },
    isFlashDeal: false,
    stock: 45
  },
  {
    id: 8,
    title: "Tom Ford Oud Wood Hashamatli Parfyum Suvi 100ml",
    category: "beauty",
    categoryName: "Go'zallik",
    price: 3200000,
    oldPrice: 3900000,
    rating: 4.9,
    reviewsCount: 92,
    badge: "Top Parfyum",
    badgeType: "crown",
    deliveryTime: "1 kunda bepul",
    monthlyPrice: 320000,
    prepaymentAmount: 80000,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Original Shisha"],
    sizes: ["50ml", "100ml"],
    description: "Noyob ud daraxti, kardamon, sandal va vetiver notalarining uyg'unligi. Dunyodagi eng nufuzli va maftunkor uniseks atirlardan biri.",
    specs: {
      "Hajm": "100 ml",
      "Turi": "Eau de Parfum",
      "Chidamlilik": "24 soatgacha",
      "Ishlab chiqaruvchi": "Fransiya"
    },
    isFlashDeal: true,
    stock: 15
  },
  {
    id: 9,
    title: "Apple MacBook Air 15 M3 16GB / 512GB Midnight",
    category: "electronics",
    categoryName: "Elektronika",
    price: 18900000,
    oldPrice: 21500000,
    rating: 5.0,
    reviewsCount: 63,
    badge: "Tavsiya etamiz",
    badgeType: "star",
    deliveryTime: "1 kunda bepul",
    monthlyPrice: 1890000,
    prepaymentAmount: 300000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Midnight", "Starlight", "Space Gray", "Silver"],
    sizes: ["16GB / 512GB", "16GB / 1TB"],
    description: "Yangi Apple M3 chipi, katta 15.3 dyuym Liquid Retina ekran, shivirlamasdan sovuq ishlovchi fansiz tizim va 18 soatlik avtonomiya.",
    specs: {
      "Protsessor": "Apple M3 (8 yadroli CPU, 10 yadroli GPU)",
      "Operativ xotira": "16 GB birlashgan xotira",
      "Doimiy xotira": "512 GB SSD",
      "Ekran": "15.3 dyuym Liquid Retina 500 nit",
      "Vazn": "1.51 kg"
    },
    isFlashDeal: false,
    stock: 7
  },
  {
    id: 10,
    title: "Xiaomi Robot Vacuum X20+ Aqlli Changyutgich",
    category: "home",
    categoryName: "Uy-ro'zg'or",
    price: 5400000,
    oldPrice: 6200000,
    rating: 4.8,
    reviewsCount: 107,
    badge: "Aqlli Uy",
    badgeType: "star",
    deliveryTime: "1 kunda bepul",
    monthlyPrice: 540000,
    prepaymentAmount: 100000,
    image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Oq"],
    sizes: ["Universal"],
    description: "To'liq avtonom stansiya: changni avtomatik tozalash, lattalarni yuvish va issiq havo bilan quritish. 6000Pa kuchli so'rish quvvati.",
    specs: {
      "So'rish kuchi": "6000 Pa",
      "Navigatsiya": "LDS Lidar + AI 3D to'siqlarni aylanib o'tish",
      "Suv idishi stansiyada": "4 litr toza, 4 litr iflos",
      "Boshqaruv": "Mi Home ilovasi, rus/o'zbek ovozli boshqaruv"
    },
    isFlashDeal: false,
    stock: 12
  },
  {
    id: 11,
    title: "Ray-Ban Aviator Classic Polarized Quyosh Ko'zoynagi",
    category: "accessories",
    categoryName: "Aksessuarlar",
    price: 1850000,
    oldPrice: 2300000,
    rating: 4.7,
    reviewsCount: 39,
    badge: "Klassika",
    badgeType: "crown",
    deliveryTime: "1 kunda bepul",
    monthlyPrice: 185000,
    prepaymentAmount: 50000,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Tilla / Yashil G-15", "Kumush / Ko'k", "Qora / Kulrang"],
    sizes: ["58mm (Standart)", "62mm (Katta)"],
    description: "1937-yildan beri jahon afsonasi. 100% UV himoya, polarizatsiya qatlami va yengil tilla qoplangan metall ramka.",
    specs: {
      "Linza turi": "Kristall shisha, Polarized G-15",
      "Himoya": "UV400 100% nurlardan himoya",
      "Ramka materiali": "Zanglamaydigan yengil qotishma",
      "Kelib chiqishi": "Italiya"
    },
    isFlashDeal: false,
    stock: 20
  },
  {
    id: 12,
    title: "Xiaomi 14 Ultra 16GB / 512GB Leica Kamera",
    category: "smartphones",
    categoryName: "Smartfonlar",
    price: 13900000,
    oldPrice: 15800000,
    rating: 4.9,
    reviewsCount: 52,
    badge: "Fotoflagman",
    badgeType: "fire",
    deliveryTime: "1 kunda bepul",
    monthlyPrice: 1390000,
    prepaymentAmount: 200000,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
    ],
    colors: ["Oq eko-charm", "Qora eko-charm"],
    sizes: ["16GB / 512GB"],
    description: "Professional Leica optikasi, 1 dyuymli asosiy sensor, o'zgaruvchan diafragma (f/1.63 - f/4.0) va Snapdragon 8 Gen 3 eng tezkor protsessori.",
    specs: {
      "Ekran": "6.73 dyuym AMOLED WQHD+ 120Hz 3000 nit",
      "Kamera": "To'rtta 50 MP Leica kamera",
      "Akkumulyator": "5000 mAh (90W simli, 80W simsiz)",
      "Protsessor": "Qualcomm Snapdragon 8 Gen 3"
    },
    isFlashDeal: true,
    stock: 16
  }
];

const CATEGORIES = [
  { id: "all", name: "Barcha toifalar", icon: "layout-grid" },
  { id: "smartphones", name: "Smartfonlar", icon: "smartphone" },
  { id: "electronics", name: "Elektronika", icon: "laptop" },
  { id: "fashion", name: "Kiyim-kechak", icon: "shirt" },
  { id: "beauty", name: "Go'zallik", icon: "sparkles" },
  { id: "accessories", name: "Aksessuarlar", icon: "watch" },
  { id: "home", name: "Uy-ro'zg'or", icon: "home" }
];

// O'zbekiston bo'ylab BTS Express Pochta filiallari ma'lumotlar bazasi
const BTS_REGIONS_DATA = {
  "Toshkent shahri": [
    "Chilonzor filiali (Katta Chilonzor ko'chasi, 16)",
    "Yunusobod filiali (Amir Temur shoh ko'chasi, 45)",
    "Mirzo Ulug'bek filiali (Buyuk Ipak Yo'li, 112)",
    "Sergeli filiali (Yangi Sergeli ko'chasi, 8)",
    "Bosh ofis / Shimoliy Vokzal (Kichik halqa yo'li, 1)",
    "Shayxontohur filiali (Navoiy ko'chasi, 24)",
    "Yashnobod filiali (Farg'ona yo'li, 15)",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Toshkent viloyati": [
    "Chirchiq filiali (Alisher Navoiy shoh ko'chasi)",
    "Olmaliq filiali (Metallurglar ko'chasi)",
    "Angren filiali (Mustaqillik ko'chasi)",
    "Bekobod filiali (Sadriddin Ayniy ko'chasi)",
    "Yangiyo'l filiali (Toshkent ko'chasi)",
    "Nurafshon filiali (Markaziy shoh ko'cha)",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Samarqand viloyati": [
    "Samarqand sh. - Gagarin filiali (Yu.Gagarin ko'chasi, 84)",
    "Samarqand sh. - Registon filiali (Dahbed ko'chasi)",
    "Samarqand sh. - Temir yo'l vokzali filiali",
    "Kattaqo'rg'on filiali (Amir Temur ko'chasi)",
    "Urgut filiali (Navoiy ko'chasi)",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Farg'ona viloyati": [
    "Farg'ona sh. - Markaziy filial (B.Marg'inoniy ko'chasi)",
    "Qo'qon shahar filiali (Turkiston ko'chasi)",
    "Marg'ilon shahar filiali (Buyuk Ipak Yo'li)",
    "Rishton filiali (Markaz)",
    "Oltiariq filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Andijon viloyati": [
    "Andijon sh. - Markaziy filial (Z.M.Bobur shoh ko'chasi)",
    "Andijon sh. - Eski shahar filiali",
    "Asaka filiali (Taraqqiyot ko'chasi)",
    "Shahrixon filiali (Mustaqillik ko'chasi)",
    "Xonobod filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Namangan viloyati": [
    "Namangan sh. - Markaziy filial (Uychi ko'chasi, 18)",
    "Namangan sh. - Chorsu filiali",
    "Chust filiali (Chustiy ko'chasi)",
    "Kosonsoy filiali",
    "Pop filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Buxoro viloyati": [
    "Buxoro sh. - Markaziy filial (Ibrohim Mo'minov ko'chasi, 6)",
    "Buxoro sh. - Karvon bozori filiali",
    "G'ijduvon filiali (Yusuf Hamadoniy ko'chasi)",
    "Kogon filiali (Temiryo'l ko'chasi)",
    "Qorako'l filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Qashqadaryo viloyati": [
    "Qarshi sh. - Markaziy filial (Mustaqillik shoh ko'chasi, 22)",
    "Qarshi sh. - Yangi bozor filiali",
    "Shahrisabz filiali (Ipak Yo'li ko'chasi)",
    "Koson filiali",
    "Kitob filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Surxondaryo viloyati": [
    "Termiz sh. - Markaziy filial (At-Termiziy shoh ko'chasi)",
    "Denov filiali (Sh.Rashidov ko'chasi)",
    "Sherobod filiali",
    "Jarqo'rg'on filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Xorazm viloyati": [
    "Urganch sh. - Markaziy filial (Al-Xorazmiy shoh ko'chasi, 56)",
    "Xiva filiali (Najmiddin Kubro ko'chasi)",
    "Shovot filiali",
    "Bog'ot filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Navoiy viloyati": [
    "Navoiy sh. - Markaziy filial (G'alaba shoh ko'chasi, 31)",
    "Zarafshon filiali (Konchilar ko'chasi)",
    "Karmana filiali",
    "Qiziltepa filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Jizzax viloyati": [
    "Jizzax sh. - Markaziy filial (Sh.Rashidov shoh ko'chasi, 14)",
    "G'allaorol filiali",
    "Zomin filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Sirdaryo viloyati": [
    "Guliston sh. - Markaziy filial (Sayxun ko'chasi, 8)",
    "Yangiyer filiali",
    "Shirin filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ],
  "Qoraqalpog'iston Respublikasi": [
    "Nukus sh. - Markaziy filial (Berdaq shoh ko'chasi, 42)",
    "To'rtko'l filiali (A.Qodiriy ko'chasi)",
    "Xo'jayli filiali",
    "Qo'ng'irot filiali",
    "Boshqa filial / Manzilni o'zim kiritaman"
  ]
};

const DEFAULT_STORE_CONFIG = {
  brand: {
    name: "NOVA",
    tagline: "Market",
    logoLetter: "N",
    logoImage: "",
    accentColor: "#4f46e5"
  },
  topBar: {
    enabled: true,
    badgeText: "Maxsus aksiya",
    mainText: "Barcha buyurtmalarga NOVA10 promokodi bilan 10% chegirma!",
    deliveryText: "BTS Pochta orqali O'zbekiston bo'ylab 1 kunda yetkazish"
  },
  hero: {
    pillText: "2026-yilning Eng Saralangan To'plami",
    titleLine1: "Sifat va Minimalizm.",
    titleLine2: "O'zgacha tajriba bilan.",
    description: "Biz ortiqcha shovqinlardan xoli, faqat eng sifatli flagman mahsulotlarni jamladik. BTS Pochta orqali uyingizga tez yetkazamiz va qulay bo'lib to'lashni taqdim etamiz.",
    buttonText: "Xaridni boshlash",
    flashDealTitle: "Kunning taklifi",
    flashDealBadge: "-25% gacha",
    flashDealProductId: 1
  },
  features: [
    { id: 1, title: "BTS Pochta orqali", desc: "Butun O'zbekiston bo'ylab 1-2 kunda", icon: "truck" },
    { id: 2, title: "Bo'lib to'lash", desc: "12 oygacha ortiqcha to'lovsiz", icon: "calendar" },
    { id: 3, title: "100% Asl mahsulot", desc: "Rasmiy kafolat bilan", icon: "shield-check" },
    { id: 4, title: "Oson qaytarish", desc: "14 kun ichida almashtirish", icon: "rotate-ccw" }
  ],
  promoCodes: [
    { code: "NOVA10", discount: 10 },
    { code: "YANGI2026", discount: 10 },
    { code: "MAXSUS20", discount: 20 }
  ],
  contacts: {
    phone: "+998 (71) 200-00-00",
    telegram: "@novamarket_bot",
    telegramBotToken: "",
    telegramChatId: "",
    telegramAutoSend: true,
    workingHours: "Har kuni 24/7 rejimda",
    aboutText: "O'zbekistondagi eng qulay, tezkor va estetik onlayn savdo platformasi. BTS Pochta orqali ishonchli yetkazib berish xizmati.",
    copyright: "© 2026 NOVA Market. Barcha huquqlar himoyalangan."
  },
  prepayment: {
    enabled: true,
    defaultAmount: 50000,
    cardNumber: "8600 5304 1234 5678",
    cardHolder: "SARDOR ALIYEV (NOVA)",
    cardBank: "Uzcard / Humo",
    infoText: "Pochta xarajatlari va tovar band qilinishi uchun avval oldindan zakalat to'lanadi. Qolgan summa tovar BTS pochtasiga yetib borganida to'lanadi."
  },
  sectionOrder: ["hero", "trust", "categories", "products", "promo_banner"],
  hiddenSections: [],
  fastDeliveryLocations: [
    { id: 1, name: "Toshkent sh., Chilonzor markaziy filiali", time: "2 soat ichida" },
    { id: 2, name: "Toshkent sh., Yunusobod filiali (Mega Planet)", time: "3 soat ichida" },
    { id: 3, name: "Samarqand sh., Registon ekspress punkti", time: "Shu kunning o'zida" }
  ],
  promoBanner: {
    enabled: true,
    badge: "🔥 CHEGIRMALAR MAVSUMI",
    title: "Bahorgi Eng Katta Aksiya — 50% gacha Chegirmalar!",
    description: "Barcha flagman smartfonlar, noutbuklar va gadjetlarga maxsus narxlar. BTS Express orqali bepul yetkazib berish.",
    buttonText: "Aksiyani ko'rish",
    buttonLink: "#products-section"
  },
  adminPasswordHash: "697a2ec378c105b4b69ca729905120807eb876792047ed953edb58acb5acdeb5"
};

