/* ==========================================================================
   CHEMVIRTUAL LAB - DATA ALAT-ALAT PRAKTIKUM KIMIA, ILUSTRASI SVG & 3D GEOMETRI
   Pengembangan Pembelajaran Berbasis Multimedia (S2 MTP FATMA)
   ========================================================================== */

const LAB_EQUIPMENT_DATA = [
  {
    id: "pipette_dropper",
    name: "Pipet Tetes",
    latinName: "Pasteur / Dropper Pipette",
    category: "Pemindah Cairan Mikro",
    modelType: "pipette_dropper",
    dim: { stemLength: 4.5, bulbRadius: 0.55, tipRadius: 0.08 },
    color: 0xe0f2fe,
    opacity: 0.6,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bulbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#991b1b"/>
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.7"/>
        </linearGradient>
      </defs>
      <!-- Karet Penghisap Merah (Bulb) -->
      <path d="M26 18 C26 9, 38 9, 38 18 C38 21, 35 23, 35 25 L29 25 C29 23, 26 21, 26 18 Z" fill="url(#bulbGrad)" stroke="#7f1d1d" stroke-width="1.5"/>
      <ellipse cx="32" cy="25" rx="3.5" ry="1.2" fill="#b91c1c"/>
      <!-- Leher & Batang Kaca -->
      <rect x="29.5" y="25" width="5" height="22" fill="url(#glassGrad)" stroke="#0284c7" stroke-width="1.2"/>
      <!-- Ujung Meruncing Kapiler -->
      <path d="M29.5 47 L31 56 L33 56 L34.5 47 Z" fill="url(#glassGrad)" stroke="#0284c7" stroke-width="1.2"/>
      <!-- Kolom Cairan Biru di Dalam -->
      <rect x="30.5" y="38" width="3" height="9" fill="#0284c7" opacity="0.85"/>
      <path d="M30.5 47 L31.5 54 L32.5 54 L33.5 47 Z" fill="#0284c7" opacity="0.85"/>
      <!-- Tetesan Cairan Menetes -->
      <circle cx="32" cy="60" r="1.5" fill="#38bdf8"/>
    </svg>`,
    description: "Pipa kapiler kaca dengan ujung meruncing dan bola hisap karet merah elastis (rubber bulb) di ujung atas. Digunakan untuk mengambil dan memindahkan cairan dalam volume sangat kecil tetes demi tetes secara presisi (1 mL ≈ 20–25 tetes).",
    specs: "Bahan: Kaca Borosilikat / Soda-lime dengan pentil hisap lateks alami tahan kimia. Kapasitas tetes: ~0.05 mL per tetes. Panjang total: 15 cm.",
    meniscusTip: "Pegang pipet selalu dalam posisi tegak lurus sempurna (90°) saat meneteskan reagen agar ukuran dan volume tetesan seragam dan akurat.",
    safetyNote: "JANGAN PERNAH membalik pipet berisi cairan ke atas! Cairan kimia korosif dapat masuk ke dalam karet hisap, merusaknya, dan menyebabkan kontaminasi reagen berbahaya.",
    qrPayload: "CHEM-EQUIP-PIPETTE-DROPPER-05"
  },
  {
    id: "volumetric_flask",
    name: "Labu Ukur / Labu Takar",
    latinName: "Volumetric Flask",
    category: "Pengukur Volume Presisi Tinggi",
    modelType: "volumetric_flask",
    dim: { bodyRadius: 1.8, neckRadius: 0.35, height: 4.8 },
    color: 0xbae6fd,
    opacity: 0.5,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flaskBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f0f9ff" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <!-- Sumbat Labu (Stopper) -->
      <polygon points="28,5 36,5 34,12 30,12" fill="#0284c7" stroke="#0369a1" stroke-width="1.2"/>
      <rect x="27" y="3" width="10" height="3" rx="1.5" fill="#38bdf8"/>
      <!-- Leher Panjang Labu -->
      <rect x="29.5" y="12" width="5" height="20" fill="url(#flaskBodyGrad)" stroke="#0284c7" stroke-width="1.2"/>
      <!-- Garis Batas Kalibrasi Tunggal (Ring Kalibrasi) -->
      <line x1="28" y1="22" x2="36" y2="22" stroke="#e11d48" stroke-width="1.5" stroke-dasharray="1 0.5"/>
      <text x="38" y="23" font-size="4.5" fill="#e11d48" font-family="sans-serif" font-weight="bold">100mL</text>
      <!-- Badan Labu Berbentuk Pir / Bulat Pipih -->
      <path d="M29.5 32 C24 35, 14 42, 14 52 C14 58, 20 60, 24 60 L40 60 C44 60, 50 58, 50 52 C50 42, 40 35, 34.5 32 Z" fill="url(#flaskBodyGrad)" stroke="#0284c7" stroke-width="1.2"/>
      <!-- Cairan Larutan Standar Tepat di Garis Kalibrasi -->
      <path d="M30 22 C30 22, 32 23, 34 22 L34.5 32 C40 35, 49 42, 49 52 C49 57.5, 43.5 59, 40 59 L24 59 C20.5 59, 15 57.5, 15 52 C15 42, 24 35, 29.5 32 Z" fill="#38bdf8" opacity="0.65"/>
    </svg>`,
    description: "Labu kaca berbentuk bulat pir dengan leher panjang silindris dan dasar rata. Memiliki tanda batas kalibrasi melingkar tunggal di sekeliling leher untuk membuat larutan standar konsentrasi tertentu (misal: 0.1 M) secara kuantitatif sangat teliti.",
    specs: "Standar Ketelitian: Kelas A DIN/ISO (toleransi ±0.10 mL pada labu 100 mL). Dilengkapi sumbat asah kaca atau sumbat polietilen kedap udara.",
    meniscusTip: "Tambahkan pelarut secara bertahap menggunakan pipet tetes pada tetes-tetes terakhir hingga bagian terbawah kelengkungan meniskus cekung tepat menyinggung garis kalibrasi leher labu.",
    safetyNote: "DILARANG memanaskan labu ukur di atas api atau mengisi larutan panas! Pemuaian termal kaca akan merusak kalibrasi volume permanen sehingga labu tidak lagi akurat.",
    qrPayload: "CHEM-EQUIP-VOLUMETRIC-FLASK-06"
  },
  {
    id: "test_tube",
    name: "Tabung Reaksi",
    latinName: "Test Tube",
    category: "Wadah & Reaksi",
    modelType: "test_tube",
    dim: { radius: 0.38, height: 3.8 },
    color: 0x93c5fd,
    opacity: 0.5,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 10 L24 48 C24 54, 40 54, 40 48 L40 10" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8"/>
      <path d="M25 24 L25 48 C25 53, 39 53, 39 48 L39 24 Z" fill="#0284c7" opacity="0.8"/>
      <ellipse cx="32" cy="10" rx="8" ry="2.2" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/>
      <path d="M20 28 L44 28" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    description: "Tabung silinder kaca borosilikat berdasar bulat setengah bola (hemispherical) dengan bibir sedikit melebar. Digunakan untuk mereaksikan sejumlah kecil zat kimia padat maupun cair (skala 1 s.d. 5 mL), mengamati perubahan warna, endapan, dan pembentukan gas.",
    specs: "Bahan: Kaca Borosilikat 3.3 tahan panas api bunsen. Dimensi umum: 16x150 mm (kapasitas ~20 mL).",
    meniscusTip: "Isi cairan maksimal sepertiga (1/3) volume tabung jika hendak dipanaskan agar tidak terjadi letupan cairan mendidih (bumping).",
    safetyNote: "Saat memanaskan tabung reaksi dengan penjepit kayu di atas nyala api, arahkan mulut tabung miring 45° menjauhi diri sendiri dan orang lain!",
    qrPayload: "CHEM-EQUIP-TEST-TUBE-07"
  },
  {
    id: "test_tube_rack",
    name: "Rak Tabung Reaksi",
    latinName: "Test Tube Rack",
    category: "Pemanas & Penunjang",
    modelType: "test_tube_rack",
    dim: { tubeRadius: 0.35, tubeHeight: 3.6, rackWidth: 5.5 },
    color: 0x93c5fd,
    opacity: 0.5,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
      </defs>
      <rect x="6" y="52" width="52" height="6" rx="1.5" fill="url(#woodGrad)" stroke="#451a03" stroke-width="1.2"/>
      <rect x="6" y="32" width="52" height="4" rx="1" fill="url(#woodGrad)" stroke="#451a03" stroke-width="1.2"/>
      <rect x="8" y="28" width="4" height="28" fill="url(#woodGrad)"/>
      <rect x="52" y="28" width="4" height="28" fill="url(#woodGrad)"/>
      <path d="M16 14 L16 48 C16 51, 22 51, 22 48 L22 14" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2"/>
      <path d="M16.5 30 L16.5 48 C16.5 50.5, 21.5 50.5, 21.5 48 L21.5 30 Z" fill="#0284c7" opacity="0.8"/>
      <path d="M28 12 L28 48 C28 51, 34 51, 34 48 L34 12" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2"/>
      <path d="M28.5 26 L28.5 48 C28.5 50.5, 33.5 50.5, 33.5 48 L33.5 26 Z" fill="#ea580c" opacity="0.85"/>
      <path d="M40 16 L40 48 C40 51, 46 51, 46 48 L46 16" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2"/>
      <path d="M40.5 34 L40.5 48 C40.5 50.5, 45.5 50.5, 45.5 48 L45.5 34 Z" fill="#10b981" opacity="0.85"/>
    </svg>`,
    description: "Rak penopang kayu atau polimer dengan lubang deret ganda dan pasak pengering. Berfungsi untuk menyusun dan menempatkan tabung-tabung reaksi dalam posisi tegak agar larutan tidak tumpah dan perbandingan warna reaksi mudah diamati.",
    specs: "Bahan: Kayu keras pernis tahan uap asam atau polipropilen tahan autoklaf. Kapasitas: 6 - 12 tabung reaksi.",
    meniscusTip: "Pasak kayu tegak pada rak berfungsi untuk menaruh tabung reaksi yang telah dicuci bersih dengan posisi terbalik agar cepat kering sempurna.",
    safetyNote: "Pastikan rak diletakkan di permukaan meja datar dan stabil, jauh dari tepi meja kerja agar tidak tersenggol.",
    qrPayload: "CHEM-EQUIP-TEST-TUBE-RACK-07"
  },
  {
    id: "bunsen_burner",
    name: "Pembakar Bunsen",
    latinName: "Bunsen Burner",
    category: "Pemanas Laboratorium Gas",
    modelType: "bunsen_burner",
    dim: { baseRadius: 1.5, barrelRadius: 0.38, height: 4.2 },
    color: 0x475569,
    opacity: 1.0,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flameInnerGrad" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stop-color="#67e8f9"/>
          <stop offset="60%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#1e3a8a"/>
        </radialGradient>
      </defs>
      <!-- Nyala Api Biru Berlapis 3D -->
      <path d="M32 2 C36 12, 42 16, 40 25 C38 31, 35 34, 32 34 C29 34, 26 31, 24 25 C22 16, 28 12, 32 2 Z" fill="#38bdf8" opacity="0.5"/>
      <path d="M32 10 C34.5 17, 38 21, 37 27 C36 32, 34 34, 32 34 C30 34, 28 32, 27 27 C26 21, 29.5 17, 32 10 Z" fill="url(#flameInnerGrad)"/>
      <ellipse cx="32" cy="28" rx="2.5" ry="5" fill="#e0f2fe"/>
      <!-- Cerobong Tabung Kuningan/Krom (Barrel) -->
      <rect x="29" y="34" width="6" height="18" fill="#94a3b8" stroke="#334155" stroke-width="1.2"/>
      <rect x="28" y="33" width="8" height="2.5" rx="1" fill="#cbd5e1"/>
      <!-- Kerah Pengatur Udara Berlubang (Air Collar) -->
      <rect x="28" y="44" width="8" height="4.5" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
      <circle cx="32" cy="46.2" r="1.3" fill="#1e293b"/>
      <!-- Selang Masuk Gas Samping (Gas Inlet) -->
      <path d="M29 49 L18 49 C15 49, 13 52, 13 56 L13 60" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Alas Besi Tuang Berat (Heavy Cast Iron Base) -->
      <polygon points="20,55 44,55 48,60 16,60" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="14" y="59.5" width="36" height="2.5" rx="1" fill="#1e293b"/>
    </svg>`,
    description: "Alat pemanas laboratorium berbahan bakar gas LPG atau metana dengan kerah pengatur asupan oksigen (air collar). Menghasilkan nyala api biru yang bersih tanpa jelaga dengan temperatur mencapai 1000°C untuk pemanasan cepat zat kimia.",
    specs: "Bahan: Kuningan berlapis nikel anti-karat dengan dudukan besi cor tuang yang berat dan stabil. Dilengkapi pipa nozel gas 8 mm.",
    meniscusTip: "Putar kerah udara: Lubang Tertutup = Api Kuning (nyala terang aman/idling). Lubang Terbuka = Api Biru Segitiga Kerucut (nyala oksidasi panas optimum untuk praktikum).",
    safetyNote: "Pastikan tidak ada bahan pelarut organik yang mudah menguap dan terbakar (alkohol, eter, aseton) dalam radius 2 meter di sekitar Bunsen yang menyala.",
    qrPayload: "CHEM-EQUIP-BUNSEN-BURNER-08"
  },
  {
    id: "funnel",
    name: "Corong Kaca & Kertas Saring",
    latinName: "Glass Funnel & Filter Paper",
    category: "Pemisahan & Penyaringan",
    modelType: "funnel",
    dim: { coneRadius: 1.8, stemRadius: 0.25, height: 3.8 },
    color: 0xe0f2fe,
    opacity: 0.5,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="filterPaperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="50%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
      </defs>
      <!-- Kerucut Kaca Corong Transparan Sudut 60° -->
      <polygon points="8,14 56,14 34,36 30,36" fill="#e0f2fe" fill-opacity="0.5" stroke="#0284c7" stroke-width="1.3"/>
      <!-- Bibir Corong Atas -->
      <ellipse cx="32" cy="14" rx="24" ry="3" fill="#bae6fd" stroke="#0284c7" stroke-width="1.2"/>
      <!-- Lipatan Kertas Saring Putih di Dalam Corong -->
      <polygon points="14,15 50,15 32,34" fill="url(#filterPaperGrad)" stroke="#94a3b8" stroke-width="1"/>
      <line x1="32" y1="15" x2="32" y2="34" stroke="#cbd5e1" stroke-width="1"/>
      <!-- Tangkai Pipa Kaca Panjang Berujung Miring 45° -->
      <polygon points="30,36 34,36 34,56 30,60" fill="#bae6fd" fill-opacity="0.7" stroke="#0284c7" stroke-width="1.3"/>
      <!-- Tetesan Filtrat Bening Keluar dari Ujung Miring -->
      <circle cx="32" cy="62" r="1.3" fill="#38bdf8"/>
    </svg>`,
    description: "Alat laboratorium berbentuk kerucut bersudut 60° dengan tangkai silinder panjang berujung miring. Berfungsi untuk memasukkan cairan ke wadah bermulut sempit serta menopang kertas saring dalam pemisahan filtrasi suspensi padat-cair.",
    specs: "Bahan: Kaca Borosilikat tahan asam-basa kuat. Diameter mangkuk: 75 mm, panjang tangkai pipa: 75 mm dengan potongan ujung serong 45°.",
    meniscusTip: "Lipat kertas saring menjadi 4 kuadran, buka salah satu sisinya membentuk corong kerucut, lalu basahi dengan sedikit akuades agar menempel rapat tanpa celah udara.",
    safetyNote: "Tempelkan ujung miring tangkai corong ke dinding bagian dalam gelas kimia penampung agar tetesan filtrat mengalir tenang tanpa memercik keluar.",
    qrPayload: "CHEM-EQUIP-FUNNEL-FILTER-09"
  },
  {
    id: "beaker",
    name: "Gelas Kimia / Beker",
    latinName: "Beaker Glass",
    category: "Wadah & Penampung",
    modelType: "cylinder_open",
    dim: { radiusTop: 1.8, radiusBottom: 1.7, height: 3.2 },
    color: 0x93c5fd,
    opacity: 0.45,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Badan Silinder Beker -->
      <path d="M14 16 L17 56 C17 58, 20 60, 23 60 L41 60 C44 60, 47 58, 47 56 L50 16" fill="#e0f2fe" fill-opacity="0.55" stroke="#0284c7" stroke-width="1.3"/>
      <!-- Cerat Penuang (Spout) di Kiri Atas -->
      <path d="M10 16 C12 16, 14 15, 14 14 L50 14 C50 15, 52 16, 54 16" stroke="#0284c7" stroke-width="1.4" fill="none"/>
      <!-- Skala Garis Takar Putih (Graduation Ticks) -->
      <line x1="20" y1="26" x2="27" y2="26" stroke="#ffffff" stroke-width="1.2"/>
      <line x1="20" y1="36" x2="29" y2="36" stroke="#ffffff" stroke-width="1.2"/>
      <line x1="20" y1="46" x2="27" y2="46" stroke="#ffffff" stroke-width="1.2"/>
      <text x="31" y="37.5" font-size="4" fill="#ffffff" font-family="sans-serif">150mL</text>
      <!-- Cairan Larutan Kimia Biru -->
      <path d="M17.8 34 C25 32, 39 36, 46.2 34 L47 56 C47 58, 44 59.5, 41 59.5 L23 59.5 C20 59.5, 17 58, 17 56 Z" fill="#38bdf8" opacity="0.6"/>
    </svg>`,
    description: "Wadah silinder kaca bermulut lebar dengan cerat penuang (spout) untuk menampung, melarutkan, mengaduk, dan memanaskan larutan kimia. Skala volume pada dinding beker bersifat perkiraan kasar (toleransi ±5%).",
    specs: "Bahan: Kaca Borosilikat 3.3 tahan kejut termal hingga 500°C. Kapasitas standar: 50 mL, 100 mL, 250 mL, 500 mL, 1000 mL.",
    meniscusTip: "Bukan untuk pengukuran volume presisi tinggi! Gunakan gelas ukur atau labu ukur jika membutuhkan ketelitian analitis.",
    safetyNote: "Gunakan kasa kawat asbes penyebar panas di atas kaki tiga saat memanaskan gelas kimia dengan Bunsen agar kaca tidak pecah mendadak.",
    qrPayload: "CHEM-EQUIP-BEAKER-01"
  },
  {
    id: "erlenmeyer",
    name: "Labu Erlenmeyer",
    latinName: "Conical Flask / Erlenmeyer Flask",
    category: "Wadah Titrasi & Reaksi",
    modelType: "cone_flask",
    dim: { radiusTop: 0.7, radiusBottom: 2.1, height: 3.5 },
    color: 0xbae6fd,
    opacity: 0.45,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Mulut & Leher Silinder Sempat -->
      <ellipse cx="32" cy="11" rx="6.5" ry="1.8" fill="#bae6fd" stroke="#0284c7" stroke-width="1.2"/>
      <rect x="26" y="11" width="12" height="12" fill="#e0f2fe" fill-opacity="0.6" stroke="#0284c7" stroke-width="1.2"/>
      <!-- Badan Kerucut Erlenmeyer -->
      <path d="M26 23 L11 54 C9 58, 14 60, 18 60 L46 60 C50 60, 55 58, 53 54 L38 23 Z" fill="#e0f2fe" fill-opacity="0.5" stroke="#0284c7" stroke-width="1.3"/>
      <!-- Garis Skala Putih -->
      <line x1="22" y1="36" x2="28" y2="36" stroke="#ffffff" stroke-width="1.2"/>
      <line x1="19" y1="44" x2="27" y2="44" stroke="#ffffff" stroke-width="1.2"/>
      <line x1="16" y1="52" x2="26" y2="52" stroke="#ffffff" stroke-width="1.2"/>
      <!-- Cairan Titrasi Merah Muda (Fenolftalein) -->
      <path d="M22 36 L11.5 54 C10 57, 14 59.5, 18 59.5 L46 59.5 C50 59.5, 54 57, 52.5 54 L42 36 Z" fill="#f43f5e" opacity="0.65"/>
    </svg>`,
    description: "Labu kaca berbentuk kerucut terpancung dengan leher silinder sempit dan dasar rata. Dirancang khusus oleh Emil Erlenmeyer agar larutan dapat digoyang dan diputar (swirling) secara cepat selama titrasi tanpa tumpah atau memercik keluar.",
    specs: "Kapasitas umum: 100 mL, 250 mL, 500 mL. Dinding miring dan leher sempit memperlambat laju penguapan pelarut.",
    meniscusTip: "Sangat ideal untuk proses titrasi asam-basa karena memudahkan teknik memutar labu dengan satu tangan sementara tangan lain mengatur kran buret.",
    safetyNote: "Pastikan mulut labu tidak diarahkan ke wajah atau praktikan lain saat memanaskan larutan yang mudah berbusa.",
    qrPayload: "CHEM-EQUIP-ERLENMEYER-02"
  },
  {
    id: "measuring_cylinder",
    name: "Gelas Ukur",
    latinName: "Graduated Cylinder",
    category: "Pengukur Volume Semi-Presisi",
    modelType: "tall_cylinder",
    dim: { radiusTop: 0.8, radiusBottom: 0.8, height: 5.5 },
    color: 0x7dd3fc,
    opacity: 0.4,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Cerat Penuang di Atas -->
      <path d="M25 11 L23 10 L27 10" stroke="#0284c7" stroke-width="1.2" fill="none"/>
      <!-- Tabung Silinder Tinggi Berskala -->
      <rect x="25" y="10" width="14" height="46" fill="#e0f2fe" fill-opacity="0.5" stroke="#0284c7" stroke-width="1.3"/>
      <!-- Cincin Pengaman Benturan Plastik (Bumper Ring) -->
      <rect x="23.5" y="16" width="17" height="3" rx="1.5" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
      <!-- Garis Skala Pengukuran Berulang -->
      <line x1="26" y1="22" x2="31" y2="22" stroke="#0284c7" stroke-width="1"/>
      <line x1="26" y1="28" x2="33" y2="28" stroke="#0284c7" stroke-width="1"/>
      <line x1="26" y1="34" x2="31" y2="34" stroke="#0284c7" stroke-width="1"/>
      <line x1="26" y1="40" x2="33" y2="40" stroke="#0284c7" stroke-width="1"/>
      <line x1="26" y1="46" x2="31" y2="46" stroke="#0284c7" stroke-width="1"/>
      <text x="34" y="29" font-size="3.5" fill="#0369a1" font-family="sans-serif">50</text>
      <text x="34" y="41" font-size="3.5" fill="#0369a1" font-family="sans-serif">25</text>
      <!-- Cairan Kimia dengan Meniskus Cekung -->
      <path d="M25.5 28 C29 30, 35 30, 38.5 28 L38.5 55.5 L25.5 55.5 Z" fill="#38bdf8" opacity="0.6"/>
      <!-- Kaki Dasar Heksagonal Plastik Biru -->
      <polygon points="18,59 46,59 42,55 22,55" fill="#0284c7" stroke="#0369a1" stroke-width="1.2"/>
    </svg>`,
    description: "Silinder kaca atau polipropilen tinggi berskala vertikal dengan dasar heksagonal anti-guling dan cerat penuang. Digunakan untuk mengukur volume cairan kimia secara cepat dengan tingkat ketelitian menengah (toleransi ±0.5% - 1%).",
    specs: "Kapasitas: 10 mL, 25 mL, 50 mL, 100 mL, 500 mL. Dilengkapi cincin peredam benturan polietilen.",
    meniscusTip: "Sejajarkan pandangan mata tepat pada garis permukaan cairan horizontal. Untuk cairan jernih, baca batas bawah kurva MENISKUS CEKUNG.",
    safetyNote: "Jangan pernah mereaksikan zat kimia asam-basa kuat yang menghasilkan panas tinggi (eksotermik) di dalam gelas ukur.",
    qrPayload: "CHEM-EQUIP-MEASURING-CYLINDER-03"
  },
  {
    id: "burette",
    name: "Buret & Statif",
    latinName: "Burette & Retort Stand",
    category: "Alat Analisis Kuantitatif Volumetri",
    modelType: "burette_rig",
    dim: { radiusTop: 0.35, radiusBottom: 0.35, height: 7.0 },
    color: 0x38bdf8,
    opacity: 0.4,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Tiang Statif Besi & Alas Dudukan -->
      <rect x="12" y="58" width="24" height="4" rx="1" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
      <rect x="16" y="6" width="3" height="52" fill="#64748b" stroke="#334155" stroke-width="1"/>
      <!-- Klem Buret (Burette Clamp) -->
      <rect x="17" y="24" width="14" height="3" fill="#94a3b8" stroke="#475569" stroke-width="0.8"/>
      <circle cx="28" cy="25.5" r="2.5" fill="#e2e8f0" stroke="#475569" stroke-width="0.8"/>
      <!-- Tabung Buret Panjang Kaca Berskala -->
      <rect x="29" y="4" width="5" height="44" fill="#e0f2fe" fill-opacity="0.6" stroke="#0284c7" stroke-width="1.2"/>
      <line x1="30" y1="10" x2="33" y2="10" stroke="#0284c7" stroke-width="0.8"/>
      <line x1="30" y1="18" x2="33" y2="18" stroke="#0284c7" stroke-width="0.8"/>
      <line x1="30" y1="26" x2="33" y2="26" stroke="#0284c7" stroke-width="0.8"/>
      <line x1="30" y1="34" x2="33" y2="34" stroke="#0284c7" stroke-width="0.8"/>
      <!-- Kran Teflon Merah (Stopcock) -->
      <rect x="27" y="48" width="9" height="3.5" rx="1" fill="#ef4444" stroke="#b91c1c" stroke-width="0.8"/>
      <!-- Ujung Nozel Runcing Penetes Cairan -->
      <polygon points="30.5,51.5 32.5,51.5 32,58 31,58" fill="#e0f2fe" stroke="#0284c7" stroke-width="0.8"/>
      <!-- Tetesan Titran -->
      <circle cx="31.5" cy="61" r="1" fill="#38bdf8"/>
    </svg>`,
    description: "Tabung kaca silinder panjang berskala milimeter presisi tinggi dengan kran pengatur tetesan (stopcock) di ujung bawah. Merupakan instrumen utama dalam analisis titrimetri kuantitatif untuk meneteskan titran secara akurat.",
    specs: "Kapasitas standar: 50 mL dengan sub-divisi skala 0.1 mL (dapat ditaksir hingga 0.02 mL). Kelas A toleransi ±0.05 mL.",
    meniscusTip: "PERHATIAN: Angka 0 mL berada di PALING ATAS buret. Volume titran yang terpakai dihitung dari selisih: V_akhir - V_awal.",
    safetyNote: "Pastikan tidak ada gelembung udara yang terperangkap pada bagian ujung runcing di bawah kran sebelum memulai pembacaan titrasi.",
    qrPayload: "CHEM-EQUIP-BURETTE-STAND-04"
  },
  {
    id: "pipette_volumetric",
    name: "Pipet Gondok / Pipet Volume",
    latinName: "Volumetric Pipette",
    category: "Pengukur Volume Presisi Tinggi",
    modelType: "pipette_volumetric",
    dim: { bulbRadius: 0.8, stemRadius: 0.2, height: 6.0 },
    color: 0xbae6fd,
    opacity: 0.55,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Pipa Kaca Atas -->
      <rect x="30" y="4" width="4" height="20" fill="#e0f2fe" fill-opacity="0.6" stroke="#0284c7" stroke-width="1.2"/>
      <!-- Garis Kalibrasi Melingkar Merah -->
      <line x1="28" y1="14" x2="36" y2="14" stroke="#e11d48" stroke-width="1.4"/>
      <text x="38" y="15" font-size="4" fill="#e11d48" font-family="sans-serif" font-weight="bold">25mL</text>
      <!-- Gelembung Tengah Labu Kaca ("Gondok") -->
      <path d="M30 24 C24 26, 20 30, 20 36 C20 42, 24 46, 30 48 L34 48 C40 46, 44 42, 44 36 C44 30, 40 26, 34 24 Z" fill="#e0f2fe" fill-opacity="0.6" stroke="#0284c7" stroke-width="1.2"/>
      <!-- Cairan di Dalam Gondok -->
      <ellipse cx="32" cy="37" rx="10.5" ry="8.5" fill="#38bdf8" opacity="0.65"/>
      <!-- Pipa Kaca Bawah & Ujung Runcing -->
      <polygon points="30.5,48 33.5,48 32.5,58 31.5,58" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2"/>
    </svg>`,
    description: "Pipet kaca silindris dengan bagian tengah yang membesar menyerupai bola/gondok dan tanda tera batas tunggal melingkar. Digunakan untuk memindahkan satu volume larutan tertentu (misal tepat 25.00 mL) dengan ketelitian analitis sangat tinggi.",
    specs: "Kapasitas tetap: 5 mL, 10 mL, 25 mL, 50 mL. Standar Kelas A dengan ketelitian tinggi ±0.03 mL.",
    meniscusTip: "Gunakan bola hisap (pipette filler), hisap larutan hingga melewati garis batas, lalu turunkan perlahan sampai miniskus cekung tepat berimpit garis kalibrasi.",
    safetyNote: "DILARANG menggunakan hisapan mulut (mouth pipetting)! Selalu gunakan bola karet hisap 3 katup (A-S-E) untuk keselamatan.",
    qrPayload: "CHEM-EQUIP-VOLUMETRIC-PIPETTE-10"
  },
  {
    id: "evaporating_dish",
    name: "Cawan Penguap Porselen",
    latinName: "Porcelain Evaporating Dish",
    category: "Pemanasan & Kristalisasi",
    modelType: "evaporating_dish",
    dim: { dishRadius: 2.2, height: 1.2 },
    color: 0xf1f5f9,
    opacity: 0.95,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Mangkuk Cawan Porselen Putih -->
      <path d="M10 24 C10 44, 20 52, 32 52 C44 52, 54 44, 54 24 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Bibir Atas Cawan & Cerat Tuang Kiri -->
      <ellipse cx="32" cy="24" rx="22" ry="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
      <path d="M10 24 C8 24, 6 22, 6 20 C8 20, 10 22, 12 24" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.2"/>
      <!-- Kristal Garam / Larutan Menguap -->
      <ellipse cx="32" cy="30" rx="16" ry="4" fill="#38bdf8" opacity="0.6"/>
      <circle cx="28" cy="30" r="1.5" fill="#ffffff"/>
      <circle cx="35" cy="29" r="1.8" fill="#ffffff"/>
      <circle cx="32" cy="31" r="1.2" fill="#ffffff"/>
    </svg>`,
    description: "Mangkuk porselen tahan api dengan dasar bulat dan cerat penuang kecil. Digunakan untuk menguapkan pelarut dari larutan (evaporasi) sehingga diperoleh kristal zat terlarut yang murni.",
    specs: "Bahan: Keramik Porselen Glasir Tahan Suhu Tinggi hingga 1050°C. Tahan kontak dengan asam kuat dan basa.",
    meniscusTip: "Panaskan secara bertahap di atas kasa kawat. Hentikan pemanasan saat kristal mulai terbentuk untuk mencegah kristal gosong atau melompat keluar.",
    safetyNote: "Cawan porselen yang baru dipanaskan sangat panas dan tidak menunjukkan perubahan warna. Selalu gunakan tang krus (crucible tongs) saat mengangkatnya!",
    qrPayload: "CHEM-EQUIP-EVAPORATING-DISH-11"
  },
  {
    id: "mortar_pestle",
    name: "Mortar dan Alue",
    latinName: "Mortar & Pestle",
    category: "Pengecil Ukuran Sampel",
    modelType: "mortar_pestle",
    dim: { mortarRadius: 2.1, height: 1.6 },
    color: 0xf8fafc,
    opacity: 0.95,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Mangkuk Mortar Tebal -->
      <path d="M10 26 C10 46, 18 54, 32 54 C46 54, 54 46, 54 26 Z" fill="#f1f5f9" stroke="#64748b" stroke-width="1.8"/>
      <ellipse cx="32" cy="26" rx="22" ry="7" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/>
      <ellipse cx="32" cy="27" rx="17" ry="5" fill="#cbd5e1"/>
      <!-- Alue Porselen (Pestle) Menumbuk -->
      <path d="M38 10 C40 8, 44 10, 43 14 L34 35 C33 37, 29 37, 28 35 L26 31 C25 29, 27 27, 29 27 Z" fill="#94a3b8" stroke="#475569" stroke-width="1.3"/>
      <ellipse cx="41" cy="11" rx="2.5" ry="3" fill="#cbd5e1"/>
    </svg>`,
    description: "Sepasang wadah mangkuk porselen berdinding tebal (mortar) dan penumbuk padat (alue). Digunakan untuk menghaluskan zat padat kimia, kristal kasar, atau sampel padat menjadi serbuk homogen sebelum dilarutkan.",
    specs: "Bahan: Porselen keras tanpa lapisan glasir pada bagian dalam gerus untuk menciptakan gesekan efektif saat penumbukan.",
    meniscusTip: "Gerus zat padat dengan gerakan melingkar dan menekan secara memutar, bukan memukul keras ke dasar mortar agar mangkuk tidak retak.",
    safetyNote: "JANGAN PERNAH menumbuk zat yang bersifat eksplosif (mudah meledak seperti campuran klorat dan belerang) di dalam mortar.",
    qrPayload: "CHEM-EQUIP-MORTAR-PESTLE-12"
  },
  {
    id: "watch_glass_rod",
    name: "Kaca Arloji & Batang Pengaduk",
    latinName: "Watch Glass & Stirring Rod",
    category: "Alat Bantu & Penimbang",
    modelType: "watch_glass_rod",
    dim: { glassRadius: 2.2, rodLength: 5.0 },
    color: 0xe0f2fe,
    opacity: 0.6,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Piringan Kaca Arloji Melengkung (Watch Glass) -->
      <path d="M10 38 C10 48, 54 48, 54 38 C54 32, 10 32, 10 38 Z" fill="#e0f2fe" fill-opacity="0.6" stroke="#0284c7" stroke-width="1.5"/>
      <ellipse cx="32" cy="36" rx="21" ry="4" fill="#bae6fd" stroke="#0284c7" stroke-width="1.2"/>
      <!-- Serbuk Kristal Kimia di Atas Kaca -->
      <ellipse cx="32" cy="38" rx="8" ry="2" fill="#f59e0b" opacity="0.8"/>
      <!-- Batang Pengaduk Kaca Silindris Pejal (Stirring Rod) -->
      <line x1="16" y1="12" x2="48" y2="44" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>
      <line x1="17" y1="13" x2="47" y2="43" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,
    description: "Piring kaca cembung melingkar (kaca arloji) sebagai alas menimbang bahan kimia padat dan penutup beker saat pemanasan, dilengkapi batang kaca silinder pejal untuk mengaduk larutan agar homogen.",
    specs: "Kaca borosilikat tebal tahan gores dan uap asam. Diameter kaca arloji: 80 mm. Panjang batang pengaduk: 20 cm.",
    meniscusTip: "Saat menuangkan larutan ke dalam corong, sentuhkan ujung batang pengaduk ke bibir gelas kimia agar aliran cairan terarah lurus tanpa tumpah.",
    safetyNote: "Jangan mengaduk larutan terlalu keras hingga membentur dasar beker kaca karena dapat memecahkan dasar wadah.",
    qrPayload: "CHEM-EQUIP-WATCH-GLASS-ROD-13"
  },
  {
    id: "tripod_gauze",
    name: "Kaki Tiga & Kasa Kawat",
    latinName: "Tripod Stand & Wire Gauze",
    category: "Penyangga Pemanasan",
    modelType: "tripod_gauze",
    dim: { ringRadius: 2.0, legHeight: 4.2 },
    color: 0x475569,
    opacity: 0.9,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Cincin Lingkaran Kaki Tiga Atas -->
      <ellipse cx="32" cy="22" rx="20" ry="6" fill="none" stroke="#334155" stroke-width="2.5"/>
      <!-- Kasa Kawat Asbes / Keramik Persegi di Atas Kaki Tiga -->
      <polygon points="12,20 32,14 52,20 32,26" fill="#e2e8f0" stroke="#64748b" stroke-width="1.2"/>
      <ellipse cx="32" cy="20" rx="9" ry="3" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8"/>
      <!-- 3 Tiang Kaki Besi (Tripod Legs) -->
      <line x1="14" y1="22" x2="8" y2="58" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="32" y1="26" x2="32" y2="60" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="50" y1="22" x2="56" y2="58" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    description: "Penyangga besi berkaki tiga dilengkapi anyaman kawat kasa dengan lingkaran keramik tahan panas di tengahnya. Berfungsi menopang gelas kimia atau labu erlenmeyer di atas pembakar Bunsen serta menyebarkan panas api secara merata.",
    specs: "Bahan: Besi tuang tahan karat tinggi 15 cm. Kasa kawat stainless steel ukuran 15x15 cm dengan pelat keramik penyebar api.",
    meniscusTip: "Pastikan wadah ditaruh tepat di atas lingkaran putih keramik kasa kawat agar penyerapan panas stabil dan tidak terjadi titik panas lokal yang memicu keretakan kaca.",
    safetyNote: "Biarkan kasa kawat dan kaki tiga mendingin secara alami setelah praktikum sebelum dipegang atau disimpan kembali.",
    qrPayload: "CHEM-EQUIP-TRIPOD-GAUZE-14"
  },
  {
    id: "wash_bottle",
    name: "Botol Semprot Akuades",
    latinName: "Wash Bottle",
    category: "Penyimpan & Pembersih",
    modelType: "wash_bottle",
    dim: { radius: 1.4, height: 4.2 },
    color: 0xe0f2fe,
    opacity: 0.7,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Pipa Nozel Bengkok Mengarah Keluar -->
      <path d="M32 16 L32 8 C32 4, 20 4, 16 10 L12 14" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/>
      <circle cx="11" cy="15" r="1.2" fill="#38bdf8"/>
      <!-- Tutup Ulir Botol Biru -->
      <rect x="26" y="16" width="12" height="5" rx="1.5" fill="#0284c7" stroke="#0369a1" stroke-width="1.2"/>
      <!-- Badan Botol Fleksibel Polietilen -->
      <path d="M22 21 C20 23, 18 26, 18 30 L18 54 C18 58, 22 60, 26 60 L38 60 C42 60, 46 58, 46 54 L46 30 C46 26, 44 23, 42 21 Z" fill="#e0f2fe" fill-opacity="0.65" stroke="#0284c7" stroke-width="1.3"/>
      <!-- Tulisan Aquades & Cairan di Dalam -->
      <rect x="19" y="36" width="26" height="23" fill="#38bdf8" opacity="0.45"/>
      <text x="21" y="47" font-size="4" fill="#0369a1" font-family="sans-serif" font-weight="bold">AQUADEST</text>
    </svg>`,
    description: "Botol plastik polietilen lentur bertutup pipa semprot melengkung. Digunakan untuk menyimpan akuades murni, membilas endapan pada kertas saring, dan membersihkan dinding alat gelas laboratorium.",
    specs: "Kapasitas: 250 mL / 500 mL. Bahan: Polietilen densitas rendah (LDPE) lentur yang mudah ditekan dan tahan bahan kimia.",
    meniscusTip: "Pencet badan botol secara perlahan untuk mengontrol debit pancaran akuades tepat pada dinding wadah yang ingin dibilas.",
    safetyNote: "Jangan pernah mengisi botol semprot bertanda Akuades dengan pelarut asam atau basa berbahaya tanpa memberi label kemasan yang jelas!",
    qrPayload: "CHEM-EQUIP-WASH-BOTTLE-15"
  },
  {
    id: "pipette_graduated",
    name: "Pipet Ukur",
    latinName: "Graduated Measuring Pipette",
    category: "Alat Ukur Volume",
    modelType: "pipette_graduated",
    dim: { stemLength: 5.5, radius: 0.18, tipRadius: 0.06 },
    color: 0xe0f2fe,
    opacity: 0.65,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pipGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.7"/>
        </linearGradient>
      </defs>
      <rect x="29.5" y="8" width="5" height="42" fill="url(#pipGrad)" stroke="#0284c7" stroke-width="1.2"/>
      <polygon points="29.5,50 34.5,50 33,58 31,58" fill="url(#pipGrad)" stroke="#0284c7" stroke-width="1.2"/>
      <line x1="30" y1="16" x2="33" y2="16" stroke="#0284c7" stroke-width="0.9"/>
      <line x1="30" y1="22" x2="34" y2="22" stroke="#0284c7" stroke-width="0.9"/>
      <line x1="30" y1="28" x2="33" y2="28" stroke="#0284c7" stroke-width="0.9"/>
      <line x1="30" y1="34" x2="34" y2="34" stroke="#0284c7" stroke-width="0.9"/>
      <line x1="30" y1="40" x2="33" y2="40" stroke="#0284c7" stroke-width="0.9"/>
      <rect x="30.5" y="24" width="3" height="26" fill="#38bdf8" opacity="0.7"/>
      <circle cx="32" cy="60" r="1.3" fill="#38bdf8"/>
    </svg>`,
    description: "Pipet kaca silinder panjang bergaris skala fraksional mililiter di sepanjang batangnya. Digunakan untuk memindahkan larutan dalam berbagai variasi volume terukur (misal 3.2 mL, 7.5 mL) dengan ketelitian kuantitatif tinggi.",
    specs: "Kapasitas umum: 5 mL, 10 mL, 25 mL dengan sub-skala 0.1 mL. Bahan Kaca Borosilikat Kelas AS toleransi ±0.05 mL.",
    meniscusTip: "Gunakan bola hisap (rubber filler) 3 katup. Sejajarkan mata dengan dasar meniskus cekung tepat pada angka volume yang diinginkan.",
    safetyNote: "Dilarang menyedot zat cair kimia dengan mulut! Selalu gunakan bola penghisap lateks (propipet / bulb).",
    qrPayload: "CHEM-EQUIP-GRADUATED-PIPETTE-16"
  },
  {
    id: "crucible",
    name: "Krus Porselen (Crucible)",
    latinName: "Porcelain Crucible with Lid",
    category: "Wadah & Reaksi",
    modelType: "crucible",
    dim: { radiusTop: 1.6, radiusBottom: 1.0, height: 2.2 },
    color: 0xf8fafc,
    opacity: 0.95,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="18" rx="16" ry="4" fill="#e2e8f0" stroke="#64748b" stroke-width="1.3"/>
      <path d="M16 18 C16 38, 22 48, 32 48 C42 48, 48 38, 48 18 Z" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>
      <path d="M15 16 C15 12, 49 12, 49 16 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1.3"/>
      <circle cx="32" cy="11" r="2.5" fill="#94a3b8"/>
    </svg>`,
    description: "Cawan porselen keramik tahan api tinggi berbentuk mangkuk dalam dengan tutup pas. Digunakan untuk memanaskan zat padat atau sampel gravimetri pada suhu sangat tinggi hingga ratusan hingga ribuan derajat Celcius (pengabuan / kalsinasi).",
    specs: "Bahan: Porselen glasir tinggi tahan suhu hingga 1150°C. Kapasitas: 30 mL s.d. 50 mL.",
    meniscusTip: "Letakkan di atas segitiga porselen (pipeclay triangle) saat dipanaskan di atas nyala Bunsen.",
    safetyNote: "Selalu gunakan tang krus (crucible tongs) saat mengangkat atau memindahkan krus yang panas ke dalam desikator. Jangan ditaruh langsung di atas meja lab!",
    qrPayload: "CHEM-EQUIP-CRUCIBLE-17"
  },
  {
    id: "test_tube_clamp",
    name: "Penjepit Tabung & Tang Krus",
    latinName: "Test Tube Clamp & Crucible Tongs",
    category: "Pemanas & Penunjang",
    modelType: "test_tube_clamp",
    dim: { length: 5.5, jawWidth: 1.2 },
    color: 0xb45309,
    opacity: 0.95,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="29" width="38" height="6" rx="2" fill="#d97706" stroke="#78350f" stroke-width="1.2"/>
      <path d="M46 26 C52 26, 56 30, 56 32 C56 34, 52 38, 46 38" fill="none" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="24" cy="32" r="3" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
    </svg>`,
    description: "Penjepit berpegas dari kayu atau logam baja tahan karat. Digunakan untuk memegang leher tabung reaksi atau cawan krus saat dilakukan pemanasan langsung di atas api agar tangan praktikan tidak melepuh terkena rambatan kalor.",
    specs: "Bahan: Kayu keras pernis dengan pegas baja elastis atau stainless steel lapis krom anti-panas. Panjang: 18 cm.",
    meniscusTip: "Jepit tabung pada 1/3 bagian atas mendekati mulut tabung agar posisi tabung stabil dan tidak licin.",
    safetyNote: "Pastikan pegas penjepit mencengkeram kuat tabung sebelum mengangkatnya ke atas nyala api. Jangan jepit bagian bawah tabung yang langsung terkena api.",
    qrPayload: "CHEM-EQUIP-TEST-TUBE-CLAMP-18"
  },
  {
    id: "digital_balance",
    name: "Neraca Analitik Digital",
    latinName: "Digital Analytical Balance",
    category: "Instrumen Analitik",
    modelType: "digital_balance",
    dim: { width: 4.8, depth: 3.6, height: 3.8 },
    color: 0x38bdf8,
    opacity: 0.9,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="38" width="48" height="20" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="18" y="44" width="28" height="8" rx="1.5" fill="#0284c7"/>
      <text x="32" y="50" font-size="5" fill="#ffffff" font-family="monospace" font-weight="bold" text-anchor="middle">0.0000 g</text>
      <rect x="12" y="14" width="40" height="24" rx="2" fill="#e0f2fe" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.2"/>
      <ellipse cx="32" cy="34" rx="10" ry="2.5" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
    </svg>`,
    description: "Timbangan elektronik presisi ultra-tinggi yang dilengkapi lemari kaca penahan aliran udara (draft shield). Digunakan untuk menimbang zat kimia padat analitis dengan tingkat akurasi hingga 4 desimal (0.0001 gram / 0.1 mg).",
    specs: "Ketelitian: 0.1 mg (0.0001 g). Kapasitas maksimum: 220 g. Dilengkapi sensor elektromagnetik dan auto-kalibrasi internal.",
    meniscusTip: "Tutup seluruh pintu geser kaca pelindung sebelum membaca angka timbangan agar hembusan nafas atau AC ruangan tidak mengacaukan pembacaan massa.",
    safetyNote: "Dilarang keras meletakkan zat kimia secara langsung di atas piringan logam timbangan! Selalu gunakan kertas timbang atau kaca arloji bersih.",
    qrPayload: "CHEM-EQUIP-DIGITAL-BALANCE-19"
  },
  {
    id: "ph_meter",
    name: "pH Meter & Indikator Universal",
    latinName: "Digital pH Meter & Indicator Paper",
    category: "Instrumen Analitik",
    modelType: "ph_meter",
    dim: { length: 5.2, width: 1.2, probeLength: 2.2 },
    color: 0x10b981,
    opacity: 0.95,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="6" width="20" height="34" rx="3" fill="#0f766e" stroke="#115e59" stroke-width="1.5"/>
      <rect x="25" y="10" width="14" height="10" rx="1.5" fill="#ccfbf1"/>
      <text x="32" y="17" font-size="6" fill="#0f766e" font-family="monospace" font-weight="bold" text-anchor="middle">7.02</text>
      <rect x="29" y="40" width="6" height="16" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
      <circle cx="32" cy="56" r="3" fill="#38bdf8" opacity="0.8"/>
    </svg>`,
    description: "Instrumen potensiometri elektronik dengan sensor elektroda kombinasi kaca untuk mengukur derajat keasaman atau kebasaan (pH) larutan secara cepat, akurat, dan kontinu pada rentang skala 0.00 s.d. 14.00.",
    specs: "Akurasi: ±0.01 pH. Dilengkapi sensor kompensasi temperatur otomatis (ATC 0-50°C) dan kalibrasi 3 titik buffer.",
    meniscusTip: "Bilas elektroda kaca dengan semprotan akuades dan keringkan dengan menempelkan tisu halus secara lembut (jangan digosok) sebelum mencelup ke sampel baru.",
    safetyNote: "Pastikan elektroda kaca selalu tersimpan dalam larutan penyimpan KCl 3M saat tidak digunakan agar membran kaca tidak kering dan rusak permanen.",
    qrPayload: "CHEM-EQUIP-PH-METER-20"
  },
  {
    id: "thermometer",
    name: "Termometer Laboratorium",
    latinName: "Laboratory Thermometer (-10°C to 110°C)",
    category: "Instrumen Analitik",
    modelType: "thermometer",
    dim: { length: 6.2, stemRadius: 0.16, bulbRadius: 0.3 },
    color: 0xef4444,
    opacity: 0.9,
    svgIcon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="29" y="6" width="6" height="44" rx="3" fill="#e0f2fe" fill-opacity="0.6" stroke="#0284c7" stroke-width="1.2"/>
      <rect x="31" y="16" width="2" height="34" fill="#ef4444"/>
      <circle cx="32" cy="52" r="5" fill="#dc2626"/>
      <line x1="35" y1="12" x2="38" y2="12" stroke="#0284c7" stroke-width="0.8"/>
      <line x1="35" y1="20" x2="38" y2="20" stroke="#0284c7" stroke-width="0.8"/>
      <line x1="35" y1="28" x2="38" y2="28" stroke="#0284c7" stroke-width="0.8"/>
      <line x1="35" y1="36" x2="38" y2="36" stroke="#0284c7" stroke-width="0.8"/>
      <line x1="35" y1="44" x2="38" y2="44" stroke="#0284c7" stroke-width="0.8"/>
    </svg>`,
    description: "Batang kaca silinder pejal kapiler bersegel dengan reservoir bola merah cairan alkohol/raksa di bagian dasar dan skala suhu terukir permanen. Digunakan untuk memantau perubahan temperatur reaksi eksotermik/endotermik dan titik didih larutan.",
    specs: "Rentang Suhu: -10°C sampai 110°C (sub-skala 1°C). Cairan pengisi: Alkohol organik merah ramah lingkungan bebas merkuri berbahaya.",
    meniscusTip: "Pastikan seluruh bola reservoir tercelup di tengah cairan tanpa menyentuh dinding atau dasar wadah yang bersentuhan dengan pemanas.",
    safetyNote: "DILARANG menggunakan termometer sebagai batang pengaduk larutan! Kaca kapiler sangat tipis dan mudah patah jika terbentur.",
    qrPayload: "CHEM-EQUIP-THERMOMETER-21"
  }
];

// Helper global
window.LAB_EQUIPMENT_DATA = LAB_EQUIPMENT_DATA;

