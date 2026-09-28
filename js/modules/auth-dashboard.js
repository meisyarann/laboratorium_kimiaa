/* ==========================================================================
   CHEMVIRTUAL LAB - AUTHENTICATION & DASHBOARD MODULE
   Guru Kimia: Fatma Alawiyah, S.Pd.,Gr (NIP: 200103272025212017)
   Sistem Login & Pengelolaan Nilai Siswa (Kelas X.1 Sampai X.5)
   ========================================================================== */

(function () {
  'use strict';

  // Kredensial Resmi Guru Pengampu
  const GURU_CREDENTIALS = {
    username: "Fatma_Alawiyah",
    password: "Fatmacantik",
    namaLengkap: "Fatma Alawiyah, S.Pd.,Gr",
    nip: "200103272025212017",
    role: "guru"
  };

  const DAFTAR_KELAS = ["X.1", "X.2", "X.3", "X.4", "X.5"];

  // Daftar nama dummy bawaan sebelumnya untuk pembersihan otomatis
  const DUMMY_STUDENT_NAMES = [
    "Ahmad Fauzi Rahman", "Anisa Rahmawati Putri", "Bagas Pratama Putra", 
    "Dewi Lestari", "Dimas Arya Nugraha", "Farhan Maulana", "Gita Permatasari", 
    "Hafiz Kurniawan", "Indah Cahyani", "Joko Susilo", "Kania Dewi Anggraini", 
    "Lutfi Hakim", "Maya Safitri", "Naufal Zaidan", "Putri Amanda", "Rizky Ramadhan"
  ];

  /* ==========================================================================
     AUTH & DASHBOARD MODULE CLASS
     ========================================================================== */
  class AuthDashboardModule {
    constructor() {
      this.currentUser = null;
      this.studentsDatabase = [];
      this.selectedClassFilter = "all";
      this.searchQuery = "";
      this.storageAuthKey = "chemvirtuallab_auth_user";
      this.storageDbKey = "chemvirtuallab_students_database";
    }

    init() {
      this.loadDatabase();
      this.loadSession();
      this.setupDOM();
      this.setupEventListeners();
      this.updateHeaderWidget();

      // Jika user sudah login sebelumnya, sesuaikan tampilan awal
      if (this.currentUser) {
        if (this.currentUser.role === 'guru') {
          this.renderGuruDashboard();
        } else {
          this.syncStudentProfileToApp(this.currentUser);
          this.renderSiswaDashboard();
        }
      } else {
        // Tampilkan modal login pertama kali
        setTimeout(() => {
          this.showAuthModal();
        }, 500);
      }
    }

    /* -------------------------------------------------------------
       1. STORAGE & DATABASE MANAGERS
       ------------------------------------------------------------- */
    loadDatabase() {
      try {
        const savedDb = localStorage.getItem(this.storageDbKey);
        if (savedDb) {
          const parsed = JSON.parse(savedDb);
          // HANYA simpan siswa yang benar-benar melakukan login (bukan data dummy bawaan sebelumnya)
          this.studentsDatabase = (Array.isArray(parsed) ? parsed : []).filter(s => {
            const isDummyName = DUMMY_STUDENT_NAMES.includes(s.nama);
            const isDummyId = s.id && typeof s.id === 'string' && /^std-x\d-\d\d$/.test(s.id);
            return !isDummyName && !isDummyId;
          });
          this.saveDatabase();
        } else {
          this.studentsDatabase = [];
        }
      } catch (e) {
        console.warn("Gagal membaca database siswa:", e);
        this.studentsDatabase = [];
      }
    }

    saveDatabase() {
      try {
        localStorage.setItem(this.storageDbKey, JSON.stringify(this.studentsDatabase));
      } catch (e) {
        console.warn("Gagal menyimpan database siswa:", e);
      }
    }

    loadSession() {
      try {
        const savedUser = localStorage.getItem(this.storageAuthKey);
        if (savedUser) {
          this.currentUser = JSON.parse(savedUser);
        }
      } catch (e) {
        console.warn("Gagal membaca sesi user:", e);
        this.currentUser = null;
      }
    }

    saveSession(user) {
      this.currentUser = user;
      try {
        if (user) {
          localStorage.setItem(this.storageAuthKey, JSON.stringify(user));
        } else {
          localStorage.removeItem(this.storageAuthKey);
        }
      } catch (e) {
        console.warn("Gagal menyimpan sesi user:", e);
      }
      this.updateHeaderWidget();
    }

    /* -------------------------------------------------------------
       2. LOGIN & LOGOUT CONTROLS
       ------------------------------------------------------------- */
    loginGuru(username, password) {
      const u = (username || '').trim();
      const p = (password || '').trim();

      if (u === GURU_CREDENTIALS.username && p === GURU_CREDENTIALS.password) {
        const guruUser = {
          role: "guru",
          username: GURU_CREDENTIALS.username,
          nama: GURU_CREDENTIALS.namaLengkap,
          nip: GURU_CREDENTIALS.nip,
          loginTime: new Date().toLocaleString('id-ID')
        };
        this.saveSession(guruUser);
        this.hideAuthModal();
        this.renderGuruDashboard();
        this.navigateToView('page-dashboard-guru');
        this.showToast(`Selamat datang kembali, Ibu ${GURU_CREDENTIALS.namaLengkap}!`);
        return { success: true };
      } else {
        return {
          success: false,
          message: "Username atau Password Guru salah! Pastikan Username: Fatma_Alawiyah & Password: Fatmacantik"
        };
      }
    }

    loginSiswa(nama, kelas) {
      const n = (nama || '').trim();
      const k = (kelas || '').trim();

      if (!n) {
        return { success: false, message: "Silakan masukkan Nama Lengkap Anda terlebih dahulu!" };
      }
      if (!k || !DAFTAR_KELAS.includes(k)) {
        return { success: false, message: "Silakan pilih Kelas Anda (X.1 sampai X.5)!" };
      }

      const siswaUser = {
        role: "siswa",
        nama: n,
        kelas: k,
        loginTime: new Date().toLocaleString('id-ID')
      };

      this.saveSession(siswaUser);
      // Reset dan siapkan workspace bersih khusus untuk akun ini (jangan lanjutkan kerja user sebelumnya)
      this.resetStudentWorkspace(siswaUser);
      this.syncStudentProfileToApp(siswaUser);
      this.recordOrUpdateStudentRecord(siswaUser);
      this.hideAuthModal();
      this.updateHeaderWidget();

      // Kembalikan halaman ke awal semula (Beranda / Modul 1)
      if (window.App) {
        window.App.navigateToModule(1);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });

      this.showToast(`Selamat datang di ChemVirtual Lab, ${n} (${k})!`);
      return { success: true };
    }

    logout() {
      if (confirm("Apakah Anda yakin ingin keluar atau berganti akun?")) {
        this.saveSession(null);
        this.updateHeaderWidget();
        // Bersihkan seluruh tampilan & kerja user sebelumnya dari layar dan memori
        this.resetStudentWorkspace(null);
        this.showAuthModal();
        if (window.App) {
          window.App.navigateToModule(1);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showToast("Anda telah keluar. Silakan masuk dengan akun siswa yang baru.");
      }
    }

    resetStudentWorkspace(student = null) {
      // 1. Reset Global App Completed Modules (Kembali ke kondisi awal: hanya Beranda yang terbuka)
      const defaultCompleted = { 1: true, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false, 10: false };

      let existingRecord = null;
      if (student) {
        existingRecord = this.studentsDatabase.find(
          s => s.nama.toLowerCase() === student.nama.toLowerCase() && s.kelas === student.kelas
        );
      }

      if (existingRecord && existingRecord.completedModulesData) {
        if (window.App) window.App.completedModules = { ...existingRecord.completedModulesData };
        localStorage.setItem('chemvirtuallab_completed_modules', JSON.stringify(existingRecord.completedModulesData));
      } else {
        if (window.App) window.App.completedModules = { ...defaultCompleted };
        localStorage.setItem('chemvirtuallab_completed_modules', JSON.stringify(defaultCompleted));
      }

      // 2. Sinkronkan visual kartu modul pada Beranda (hilangkan tanda centang / completed user sebelumnya)
      document.querySelectorAll('.module-card').forEach(card => {
        const modId = parseInt(card.dataset.mod, 10);
        const isDone = window.App ? !!window.App.completedModules[modId] : false;
        const badge = card.querySelector('.mod-card-badge');
        if (isDone && modId !== 1) {
          card.classList.add('completed');
          if (badge) badge.textContent = '✓ Selesai';
        } else {
          card.classList.remove('completed');
          if (badge) {
            const defaultBadges = {
              2: 'Modul 2', 5: 'Modul 3',
              8: 'Modul 4', 9: 'Modul 5', 10: 'Modul 6'
            };
            badge.textContent = defaultBadges[modId] || `Modul ${modId}`;
          }
        }
      });

      // 3. Reset Kuis Evaluasi (Modul 5 / id 8)
      if (existingRecord && existingRecord.nilaiKuis > 0) {
        localStorage.setItem('chemvirtuallab_quiz_score', existingRecord.nilaiKuis.toString());
        if (window.App) window.App.quizScore = existingRecord.nilaiKuis;
      } else {
        localStorage.removeItem('chemvirtuallab_quiz_score');
        if (window.App) window.App.quizScore = 0;
      }
      if (window.App && window.App.quizModule) {
        window.App.quizModule.resetQuiz();
        if (!existingRecord || !existingRecord.nilaiKuis) {
          window.App.quizModule.score = 0;
        }
      }

      // 4. Reset Kuis Topik 1, 2, 3 di dalam Materi
      const t1 = existingRecord ? (existingRecord.nilaiTopik1 || 0) : 0;
      const t2 = existingRecord ? (existingRecord.nilaiTopik2 || 0) : 0;
      const t3 = existingRecord ? (existingRecord.nilaiTopik3 || 0) : 0;

      if (existingRecord && (existingRecord.hasAttemptedTopik1 || t1 > 0)) localStorage.setItem('chemvirtuallab_quiz_topik1', t1.toString());
      else localStorage.removeItem('chemvirtuallab_quiz_topik1');

      if (existingRecord && (existingRecord.hasAttemptedTopik2 || t2 > 0)) localStorage.setItem('chemvirtuallab_quiz_topik2', t2.toString());
      else localStorage.removeItem('chemvirtuallab_quiz_topik2');

      if (existingRecord && (existingRecord.hasAttemptedTopik3 || t3 > 0)) localStorage.setItem('chemvirtuallab_quiz_topik3', t3.toString());
      else localStorage.removeItem('chemvirtuallab_quiz_topik3');

      if (window.chemicalTheory) {
        window.chemicalTheory.resetTopicQuiz(1);
        window.chemicalTheory.resetTopicQuiz(2);
        window.chemicalTheory.resetTopicQuiz(3);
      }

      // 5. Kembalikan Tampilan Menu Materi ke Hub Awal
      document.querySelectorAll('.materi-sub-view').forEach(v => v.classList.remove('active'));
      const hubView = document.getElementById('materi-view-hub');
      if (hubView) hubView.classList.add('active');

      // 6. Reset / Muat Lembar LKPD PBL (jangan tampilkan isian user lama)
      if (existingRecord && existingRecord.lkpdData) {
        localStorage.setItem('chemvirtuallab_lkpd_data', JSON.stringify(existingRecord.lkpdData));
        if (window.App && window.App.lkpdModule) {
          window.App.lkpdModule.loadSavedLKPD();
        }
      } else {
        localStorage.removeItem('chemvirtuallab_lkpd_data');
        if (window.App && window.App.lkpdModule) {
          window.App.lkpdModule.resetLKPD();
        }
      }
      const lkpdNama = document.getElementById('lkpd-nama');
      const lkpdKelas = document.getElementById('lkpd-kelas');
      if (lkpdNama) lkpdNama.value = student ? student.nama : '';
      if (lkpdKelas) lkpdKelas.value = student ? `Kelas ${student.kelas}` : '';

      // 7. Reset / Muat Refleksi Siswa (jangan tampilkan refleksi user lama)
      if (existingRecord && existingRecord.reflectionData) {
        localStorage.setItem('chemvirtuallab_reflection_data', typeof existingRecord.reflectionData === 'object' ? JSON.stringify(existingRecord.reflectionData) : existingRecord.reflectionData);
        if (window.App && window.App.reflectionModule) {
          window.App.reflectionModule.loadSavedReflection();
        }
      } else {
        localStorage.removeItem('chemvirtuallab_reflection_data');
        if (window.App && window.App.reflectionModule && typeof window.App.reflectionModule.resetReflection === 'function') {
          window.App.reflectionModule.resetReflection();
        } else {
          ['ref-learn-1', 'ref-learn-2', 'ref-learn-3', 'ref-interest-1', 'ref-interest-2', 'ref-question-1'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
          });
          const check = document.getElementById('ref-pledge-check');
          if (check) check.checked = false;
          const stars = document.querySelectorAll('.star-rating-btn');
          stars.forEach(s => s.textContent = '★');
        }
      }

      // 8. Sinkronisasi Data Sertifikat
      const certName = document.getElementById('cert-input-name');
      if (certName) certName.value = student ? student.nama : '';
      if (window.App && window.App.certModule) {
        window.App.certModule.studentName = student ? student.nama : '';
        window.App.certModule.studentClass = student ? student.kelas : '';
        window.App.certModule.score = existingRecord ? (existingRecord.nilaiKuis || 0) : 0;
        window.App.certModule.renderCertificateCanvas();
      }

      // 9. Perbarui Indikator Kemajuan Global di Header & Home
      if (window.App) {
        window.App.updateGlobalProgress();
      }

      // 10. Navigasi KEMBALI KE AWAL SEMULA (Beranda / Modul 1)
      if (window.App) {
        window.App.navigateToModule(1);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    syncStudentProfileToApp(user) {
      if (!user || user.role !== 'siswa') return;

      // Update global App student name
      if (window.App && typeof window.App.setStudentName === 'function') {
        window.App.setStudentName(user.nama);
      }

      // Update LocalStorage standard keys
      localStorage.setItem('chemvirtuallab_student_name', user.nama);
      localStorage.setItem('chemvirtuallab_student_class', user.kelas);

      // Sinkronisasi ke Modul 7 LKPD PBL
      const lkpdNama = document.getElementById('lkpd-nama');
      const lkpdKelas = document.getElementById('lkpd-kelas');
      if (lkpdNama) lkpdNama.value = user.nama;
      if (lkpdKelas) lkpdKelas.value = `Kelas ${user.kelas}`;

      // Sinkronisasi ke Modul 10 Sertifikat
      const certName = document.getElementById('cert-input-name');
      if (certName) certName.value = user.nama;
      if (window.App && window.App.certModule) {
        window.App.certModule.studentName = user.nama;
        window.App.certModule.studentClass = user.kelas;
        window.App.certModule.renderCertificateCanvas();
      }
    }

    recordOrUpdateStudentRecord(student, additionalData = {}) {
      if (!student || student.role !== 'siswa') return;

      this.loadDatabase();

      const existingIndex = this.studentsDatabase.findIndex(
        s => s.nama.toLowerCase() === student.nama.toLowerCase() && s.kelas === student.kelas
      );

      const now = new Date().toLocaleString('id-ID');
      const currentScore = parseInt(localStorage.getItem('chemvirtuallab_quiz_score') || '0', 10);
      const lkpdSaved = localStorage.getItem('chemvirtuallab_lkpd_data');

      let lkpdObj = null;
      if (lkpdSaved) {
        try { lkpdObj = JSON.parse(lkpdSaved); } catch (e) {}
      }

      const completedCount = window.App ? Object.values(window.App.completedModules).filter(Boolean).length : 1;

      // Ambil nilai masing-masing kuis secara aman tanpa tertimpa 0
      const getTopicScore = (t) => {
        const prop = `nilaiTopik${t}`;
        if (additionalData[prop] !== undefined) return additionalData[prop];
        if (student[prop] !== undefined) return student[prop];
        if (existingIndex >= 0 && this.studentsDatabase[existingIndex][prop] !== undefined) {
          return this.studentsDatabase[existingIndex][prop];
        }
        const saved = localStorage.getItem(`chemvirtuallab_quiz_topik${t}`);
        if (saved !== null) return parseInt(saved, 10) || 0;
        return 0;
      };

      const nTopik1 = getTopicScore(1);
      const nTopik2 = getTopicScore(2);
      const nTopik3 = getTopicScore(3);

      const record = {
        id: existingIndex >= 0 ? this.studentsDatabase[existingIndex].id : `std-${student.kelas.toLowerCase().replace('.', '')}-${Date.now().toString().slice(-4)}`,
        nama: student.nama,
        kelas: student.kelas,
        modulSelesai: completedCount,
        nilaiTopik1: nTopik1,
        nilaiTopik2: nTopik2,
        nilaiTopik3: nTopik3,
        hasAttemptedTopik1: additionalData.hasAttemptedTopik1 ?? (existingIndex >= 0 ? this.studentsDatabase[existingIndex].hasAttemptedTopik1 : (nTopik1 > 0)),
        hasAttemptedTopik2: additionalData.hasAttemptedTopik2 ?? (existingIndex >= 0 ? this.studentsDatabase[existingIndex].hasAttemptedTopik2 : (nTopik2 > 0)),
        hasAttemptedTopik3: additionalData.hasAttemptedTopik3 ?? (existingIndex >= 0 ? this.studentsDatabase[existingIndex].hasAttemptedTopik3 : (nTopik3 > 0)),
        nilaiKuis: currentScore > 0 ? currentScore : (existingIndex >= 0 ? this.studentsDatabase[existingIndex].nilaiKuis : 0),
        lkpdStatus: lkpdObj ? "Selesai" : (existingIndex >= 0 ? this.studentsDatabase[existingIndex].lkpdStatus : "Belum Mulai"),
        sertifikatStatus: currentScore >= 75 ? "Diterbitkan" : (existingIndex >= 0 ? this.studentsDatabase[existingIndex].sertifikatStatus : "Belum Memenuhi"),
        terakhirAktif: now,
        lkpdData: lkpdObj || (existingIndex >= 0 ? this.studentsDatabase[existingIndex].lkpdData : null),
        completedModulesData: window.App ? { ...window.App.completedModules } : null,
        reflectionData: localStorage.getItem('chemvirtuallab_reflection_data') || (existingIndex >= 0 ? this.studentsDatabase[existingIndex].reflectionData : null),
        ...additionalData
      };

      if (existingIndex >= 0) {
        this.studentsDatabase[existingIndex] = { ...this.studentsDatabase[existingIndex], ...record };
      } else {
        this.studentsDatabase.unshift(record);
      }

      this.saveDatabase();
    }

    /* -------------------------------------------------------------
       2B. SIMPAN NILAI KUIS PER TOPIK MATERI (TOPIK 1, 2, 3)
       ------------------------------------------------------------- */
    saveMateriQuizScore(topicNum, score, showToast = true) {
      const tNum = parseInt(topicNum, 10) || 1;
      const s = Math.min(100, Math.max(0, parseInt(score, 10) || 0));
      const key = `chemvirtuallab_quiz_topik${tNum}`;
      localStorage.setItem(key, s.toString());

      const propName = `nilaiTopik${tNum}`;
      const topicTitles = {
        1: "Pengenalan Alat Lab & K3",
        2: "Struktur Atom",
        3: "Sistem Periodik Unsur (SPU)"
      };
      const title = topicTitles[tNum] || `Topik ${tNum}`;

      // Muat database siswa terkini
      this.loadDatabase();

      if (this.currentUser && this.currentUser.role === 'siswa') {
        this.currentUser[propName] = s;
        this.currentUser[`hasAttemptedTopik${tNum}`] = true;
        this.saveSession(this.currentUser);
        this.recordOrUpdateStudentRecord(this.currentUser, { [propName]: s, [`hasAttemptedTopik${tNum}`]: true });
      } else {
        const savedName = localStorage.getItem('chemvirtuallab_student_name') || 'Siswa Praktikan';
        const savedClass = localStorage.getItem('chemvirtuallab_student_class') || 'X.1';
        this.recordOrUpdateStudentRecord({ role: 'siswa', nama: savedName, kelas: savedClass }, { [propName]: s, [`hasAttemptedTopik${tNum}`]: true });
      }

      this.saveDatabase();
      this.renderGuruDashboard();
      this.renderSiswaDashboard();

      if (showToast) {
        this.showToast(`✓ Nilai Kuis Topik ${tNum} (${title}): ${s}/100 berhasil masuk ke Dashboard Guru!`);
      }
      return { success: true, score: s };
    }

    /* -------------------------------------------------------------
       3. DOM SETUP & EVENT LISTENERS
       ------------------------------------------------------------- */
    setupDOM() {
      // Setup Kelas Select Options in Modal
      const selectKelas = document.getElementById('auth-siswa-kelas');
      if (selectKelas && selectKelas.options.length <= 1) {
        selectKelas.innerHTML = '<option value="">-- Pilih Kelas Anda --</option>';
        DAFTAR_KELAS.forEach(k => {
          const opt = document.createElement('option');
          opt.value = k;
          opt.textContent = `Kelas ${k}`;
          selectKelas.appendChild(opt);
        });
      }
    }

    setupEventListeners() {
      // Tab Switching in Login Modal
      const roleTabs = document.querySelectorAll('.auth-role-tab');
      roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const role = tab.dataset.role;
          roleTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          document.querySelectorAll('.auth-form-panel').forEach(panel => {
            panel.classList.remove('active');
          });

          const activePanel = document.getElementById(`auth-form-${role}`);
          if (activePanel) activePanel.classList.add('active');

          // Reset alerts
          const alertGuru = document.getElementById('auth-guru-alert');
          const alertSiswa = document.getElementById('auth-siswa-alert');
          if (alertGuru) alertGuru.style.display = 'none';
          if (alertSiswa) alertSiswa.style.display = 'none';
        });
      });

      // Submit Form Guru
      const formGuru = document.getElementById('form-login-guru');
      if (formGuru) {
        formGuru.addEventListener('submit', (e) => {
          e.preventDefault();
          const uInput = document.getElementById('auth-guru-username');
          const pInput = document.getElementById('auth-guru-password');
          const alertElem = document.getElementById('auth-guru-alert');

          const result = this.loginGuru(uInput?.value, pInput?.value);
          if (!result.success) {
            if (alertElem) {
              alertElem.textContent = result.message;
              alertElem.className = "auth-alert error";
              alertElem.style.display = 'flex';
            }
          }
        });
      }

      // Submit Form Siswa
      const formSiswa = document.getElementById('form-login-siswa');
      if (formSiswa) {
        formSiswa.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameInput = document.getElementById('auth-siswa-nama');
          const kelasInput = document.getElementById('auth-siswa-kelas');
          const alertElem = document.getElementById('auth-siswa-alert');

          const result = this.loginSiswa(nameInput?.value, kelasInput?.value);
          if (!result.success) {
            if (alertElem) {
              alertElem.textContent = result.message;
              alertElem.className = "auth-alert error";
              alertElem.style.display = 'flex';
            }
          }
        });
      }

      // Toggle Password Visibility
      const btnTogglePw = document.getElementById('btn-toggle-pw');
      if (btnTogglePw) {
        btnTogglePw.addEventListener('click', () => {
          const pwInput = document.getElementById('auth-guru-password');
          if (pwInput) {
            if (pwInput.type === 'password') {
              pwInput.type = 'text';
              btnTogglePw.textContent = '👁️';
            } else {
              pwInput.type = 'password';
              btnTogglePw.textContent = '🔒';
            }
          }
        });
      }

      // Close Modal Button
      const btnCloseModal = document.getElementById('btn-close-auth-modal');
      if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
          this.hideAuthModal();
        });
      }

      // Filter Kelas Pills in Guru Dashboard
      document.querySelectorAll('.btn-class-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.btn-class-filter').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedClassFilter = btn.dataset.class;
          this.renderStudentsTable();
        });
      });

      // Search Box in Guru Dashboard
      const searchInput = document.getElementById('guru-search-student');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.renderStudentsTable();
        });
      }

      // Button Export CSV
      const btnExportCsv = document.getElementById('btn-export-csv');
      if (btnExportCsv) {
        btnExportCsv.addEventListener('click', () => {
          this.exportToCSV();
        });
      }

      // Button Print Rekap A4
      const btnPrintRekap = document.getElementById('btn-print-rekap');
      if (btnPrintRekap) {
        btnPrintRekap.addEventListener('click', () => {
          this.printRekapitulasi();
        });
      }

      // Close LKPD Modal
      const btnCloseLkpdModal = document.getElementById('btn-close-lkpd-modal');
      if (btnCloseLkpdModal) {
        btnCloseLkpdModal.addEventListener('click', () => {
          this.hideLkpdModal();
        });
      }
    }

    /* -------------------------------------------------------------
       4. HEADER USER WIDGET
       ------------------------------------------------------------- */
    updateHeaderWidget() {
      const widget = document.getElementById('header-user-widget');
      if (!widget) return;

      if (!this.currentUser) {
        widget.innerHTML = `
          <button class="btn-dashboard-toggle" id="btn-open-login" title="Masuk sebagai Guru atau Siswa">
            <span>🔑</span> Masuk / Login
          </button>
        `;
        const btnOpen = document.getElementById('btn-open-login');
        if (btnOpen) {
          btnOpen.addEventListener('click', () => this.showAuthModal());
        }
        return;
      }

      if (this.currentUser.role === 'guru') {
        widget.innerHTML = `
          <div class="user-session-pill" id="btn-header-profile" title="Profil Guru: Fatma Alawiyah, S.Pd.,Gr">
            <div class="user-session-avatar guru">FA</div>
            <div class="user-session-meta">
              <span class="user-session-name">Fatma Alawiyah, S.Pd.,Gr</span>
              <span class="user-session-role">👩‍🏫 Guru Kimia &bull; NIP: 200103272025212017</span>
            </div>
          </div>
          <button class="btn-dashboard-toggle" id="btn-toggle-dashboard-guru" title="Buka Dashboard Guru">
            <span>📊</span> Dashboard Guru
          </button>
          <button class="btn-auth-action" id="btn-header-logout" title="Keluar / Ganti Akun">
            <span>🚪</span> Ganti Akun
          </button>
        `;
      } else {
        widget.innerHTML = `
          <div class="user-session-pill" id="btn-header-profile" title="Siswa: ${this.currentUser.nama}">
            <div class="user-session-avatar siswa">${this.currentUser.nama.slice(0, 2).toUpperCase()}</div>
            <div class="user-session-meta">
              <span class="user-session-name">${this.currentUser.nama}</span>
              <span class="user-session-role">🎓 Kelas ${this.currentUser.kelas}</span>
            </div>
          </div>
          <button class="btn-dashboard-toggle" id="btn-toggle-dashboard-siswa" title="Buka Dashboard Belajar Anda">
            <span>📈</span> Dashboard Siswa
          </button>
          <button class="btn-auth-action" id="btn-header-logout" title="Keluar / Ganti Akun">
            <span>🚪</span> Ganti Akun
          </button>
        `;
      }

      // Re-attach event listeners
      const btnToggleGuru = document.getElementById('btn-toggle-dashboard-guru');
      if (btnToggleGuru) {
        btnToggleGuru.addEventListener('click', () => {
          this.renderGuruDashboard();
          this.navigateToView('page-dashboard-guru');
        });
      }

      const btnToggleSiswa = document.getElementById('btn-toggle-dashboard-siswa');
      if (btnToggleSiswa) {
        btnToggleSiswa.addEventListener('click', () => {
          this.renderSiswaDashboard();
          this.navigateToView('page-dashboard-siswa');
        });
      }

      const btnLogout = document.getElementById('btn-header-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => this.logout());
      }
    }

    /* -------------------------------------------------------------
       5. DASHBOARD GURU RENDERING
       ------------------------------------------------------------- */
    renderGuruDashboard() {
      this.loadDatabase();

      // Hitung KPI
      const totalSiswa = this.studentsDatabase.length;
      let totalNilai = 0;
      let lulusCount = 0;
      let lkpdCount = 0;
      let certCount = 0;

      this.studentsDatabase.forEach(s => {
        totalNilai += (s.nilaiKuis || 0);
        if (s.nilaiKuis >= 75) lulusCount++;
        if (s.lkpdStatus === "Selesai") lkpdCount++;
        if (s.sertifikatStatus === "Diterbitkan") certCount++;
      });

      const avgNilai = totalSiswa > 0 ? (totalNilai / totalSiswa).toFixed(1) : 0;
      const pctLulus = totalSiswa > 0 ? Math.round((lulusCount / totalSiswa) * 100) : 0;

      // Update KPI Elements
      const elemTotalSiswa = document.getElementById('guru-kpi-total-siswa');
      const elemAvgScore = document.getElementById('guru-kpi-avg-score');
      const elemPctPass = document.getElementById('guru-kpi-pct-pass');
      const elemLkpdCount = document.getElementById('guru-kpi-lkpd-count');
      const elemCertCount = document.getElementById('guru-kpi-cert-count');

      if (elemTotalSiswa) elemTotalSiswa.textContent = totalSiswa;
      if (elemAvgScore) elemAvgScore.textContent = avgNilai;
      if (elemPctPass) elemPctPass.textContent = `${pctLulus}%`;
      if (elemLkpdCount) elemLkpdCount.textContent = lkpdCount;
      if (elemCertCount) elemCertCount.textContent = certCount;

      this.renderStudentsTable();
    }

    renderStudentsTable() {
      const tbody = document.getElementById('guru-students-table-body');
      if (!tbody) return;

      tbody.innerHTML = '';

      let filtered = this.studentsDatabase.filter(s => {
        const matchesClass = (this.selectedClassFilter === 'all') || (s.kelas === this.selectedClassFilter);
        const matchesSearch = !this.searchQuery || s.nama.toLowerCase().includes(this.searchQuery);
        return matchesClass && matchesSearch;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" style="text-align:center; padding:3rem 1.5rem; color:var(--text-muted);">
              <div style="font-size:2.2rem; margin-bottom:0.6rem;">👥</div>
              <div style="font-weight:700; font-size:1.05rem; color:var(--text-dark); margin-bottom:0.35rem;">
                Belum Ada Siswa yang Login ${this.selectedClassFilter !== 'all' ? `di Kelas ${this.selectedClassFilter}` : ''}
              </div>
              <div style="font-size:0.86rem; color:var(--text-secondary); max-width:480px; margin:0 auto; line-height:1.5;">
                Daftar ini telah direset sehingga <strong>hanya siswa yang login</strong> (memasukkan Nama dan memilih Kelas X.1 s.d. X.5) yang akan tercantum di sini.
              </div>
            </td>
          </tr>
        `;
        return;
      }

      filtered.forEach((std, idx) => {
        const tr = document.createElement('tr');
        const t1 = std.nilaiTopik1 !== undefined ? std.nilaiTopik1 : 0;
        const t2 = std.nilaiTopik2 !== undefined ? std.nilaiTopik2 : 0;
        const t3 = std.nilaiTopik3 !== undefined ? std.nilaiTopik3 : 0;
        const nKuis = std.nilaiKuis || 0;

        const hasT1 = std.hasAttemptedTopik1 || (std.nilaiTopik1 !== undefined && std.nilaiTopik1 !== null && std.nilaiTopik1 > 0);
        const hasT2 = std.hasAttemptedTopik2 || (std.nilaiTopik2 !== undefined && std.nilaiTopik2 !== null && std.nilaiTopik2 > 0);
        const hasT3 = std.hasAttemptedTopik3 || (std.nilaiTopik3 !== undefined && std.nilaiTopik3 !== null && std.nilaiTopik3 > 0);

        const badgeT1 = hasT1 
          ? `<span class="badge-score ${t1 >= 75 ? 'pass' : 'fail'}" title="Kuis Topik 1: Alat Lab & K3">${t1 >= 75 ? '✓' : '⚠️'} ${t1}</span>` 
          : `<span class="badge-status pending" style="opacity:0.6;" title="Belum Mengerjakan">-</span>`;
        const badgeT2 = hasT2 
          ? `<span class="badge-score ${t2 >= 75 ? 'pass' : 'fail'}" title="Kuis Topik 2: Struktur Atom">${t2 >= 75 ? '✓' : '⚠️'} ${t2}</span>` 
          : `<span class="badge-status pending" style="opacity:0.6;" title="Belum Mengerjakan">-</span>`;
        const badgeT3 = hasT3 
          ? `<span class="badge-score ${t3 >= 75 ? 'pass' : 'fail'}" title="Kuis Topik 3: SPU">${t3 >= 75 ? '✓' : '⚠️'} ${t3}</span>` 
          : `<span class="badge-status pending" style="opacity:0.6;" title="Belum Mengerjakan">-</span>`;
        const badgeKuis = nKuis > 0 
          ? `<span class="badge-score ${nKuis >= 75 ? 'pass' : 'fail'}" title="Kuis Evaluasi Modul 8">${nKuis >= 75 ? '✓' : '⚠️'} ${nKuis}</span>` 
          : `<span class="badge-status pending" style="opacity:0.6;" title="Belum Mengerjakan">-</span>`;

        tr.innerHTML = `
          <td style="font-weight:700; color:var(--text-muted); text-align:center;">${idx + 1}</td>
          <td>
            <div class="student-table-name">
              <span>👤</span> ${std.nama}
            </div>
          </td>
          <td><span class="badge-class">Kelas ${std.kelas}</span></td>
          <td style="text-align:center;">${badgeT1}</td>
          <td style="text-align:center;">${badgeT2}</td>
          <td style="text-align:center;">${badgeT3}</td>
          <td style="text-align:center;">${badgeKuis}</td>
          <td>
            <span class="badge-status ${std.lkpdStatus === 'Selesai' ? 'done' : 'pending'}">
              ${std.lkpdStatus === 'Selesai' ? '✓ Lengkap' : '⏳ Proses'}
            </span>
          </td>
          <td>
            <span class="badge-status ${std.sertifikatStatus === 'Diterbitkan' ? 'done' : 'pending'}">
              ${std.sertifikatStatus === 'Diterbitkan' ? '🏆 Terbit' : 'Belum'}
            </span>
          </td>
          <td>
            <div class="table-action-btns">
              <button class="btn-table-action primary" onclick="window.AuthDashboard.viewStudentLKPD('${std.id}')" title="Periksa Lembar Kerja PBL Siswa">
                📝 LKPD
              </button>
              <button class="btn-table-action" onclick="window.AuthDashboard.promptEditScore('${std.id}')" title="Ubah / Beri Nilai Kuis Topik atau Evaluasi">
                ✏️ Nilai
              </button>
              <button class="btn-table-action" onclick="window.AuthDashboard.deleteStudentRecord('${std.id}')" title="Hapus Siswa Ini dari Tabel" style="color:#b91c1c; border-color:#fca5a5;">
                🗑️
              </button>
            </div>
          </td>
        `;

        tbody.appendChild(tr);
      });
    }

    deleteStudentRecord(studentId) {
      const student = this.studentsDatabase.find(s => s.id === studentId);
      if (!student) return;
      if (confirm(`Hapus data peserta didik "${student.nama}" (Kelas ${student.kelas}) dari daftar pemantauan?`)) {
        this.studentsDatabase = this.studentsDatabase.filter(s => s.id !== studentId);
        this.saveDatabase();
        this.renderGuruDashboard();
        this.showToast(`Data siswa "${student.nama}" berhasil dihapus.`);
      }
    }

    resetStudentList() {
      if (confirm("Reset seluruh data siswa pada halaman ini? Setelah direset, HANYA siswa yang login yang akan tercantum.")) {
        this.studentsDatabase = [];
        this.saveDatabase();
        this.renderGuruDashboard();
        this.showToast("Daftar berhasil direset! Hanya siswa yang login yang akan tercantum.");
      }
    }

    /* -------------------------------------------------------------
       6. DASHBOARD SISWA RENDERING
       ------------------------------------------------------------- */
    renderSiswaDashboard() {
      if (!this.currentUser || this.currentUser.role !== 'siswa') return;

      const nameElem = document.getElementById('siswa-dash-name');
      const classElem = document.getElementById('siswa-dash-class');
      const avatarElem = document.getElementById('siswa-dash-avatar');

      if (nameElem) nameElem.textContent = this.currentUser.nama;
      if (classElem) classElem.textContent = `Kelas ${this.currentUser.kelas}`;
      if (avatarElem) avatarElem.textContent = this.currentUser.nama.slice(0, 2).toUpperCase();

      // Modul Progress
      const activeModIds = [1, 2, 5, 8, 9, 10];
      const completedCount = window.App ? activeModIds.filter(id => window.App.completedModules[id]).length : 1;
      const percent = Math.round((completedCount / activeModIds.length) * 100);

      const progFill = document.getElementById('siswa-modul-progress-fill');
      const progTxt = document.getElementById('siswa-modul-progress-txt');
      if (progFill) progFill.style.width = `${percent}%`;
      if (progTxt) progTxt.textContent = `${completedCount} dari 6 Modul Selesai (${percent}%)`;

      // Status LKPD
      const lkpdSaved = localStorage.getItem('chemvirtuallab_lkpd_data');
      const lkpdStatusElem = document.getElementById('siswa-lkpd-status');
      if (lkpdStatusElem) {
        if (lkpdSaved) {
          lkpdStatusElem.innerHTML = `<span style="color:#15803d; font-weight:700;">✓ LKPD PBL Tersimpan & Siap Diperiksa Guru</span>`;
        } else {
          lkpdStatusElem.innerHTML = `<span style="color:#b45309; font-weight:700;">⏳ Belum Dikerjakan / Belum Lengkap</span>`;
        }
      }

      // Status Kuis Evaluasi Modul 8
      const score = parseInt(localStorage.getItem('chemvirtuallab_quiz_score') || '0', 10);
      const quizStatusElem = document.getElementById('siswa-quiz-status');
      if (quizStatusElem) {
        if (score >= 75) {
          quizStatusElem.innerHTML = `<span style="color:#15803d; font-weight:700;">🎉 Nilai: ${score}/100 (Tuntas KKM)</span>`;
        } else if (score > 0) {
          quizStatusElem.innerHTML = `<span style="color:#b91c1c; font-weight:700;">⚠️ Nilai: ${score}/100 (Perlu Remedial KKM: 75)</span>`;
        } else {
          quizStatusElem.innerHTML = `<span style="color:var(--text-muted); font-weight:600;">Belum Mengerjakan Kuis Evaluasi</span>`;
        }
      }

      // Status Kuis Modul 5 Per Topik (Topik 1, 2, 3)
      const t1 = parseInt(localStorage.getItem('chemvirtuallab_quiz_topik1') || '0', 10);
      const t2 = parseInt(localStorage.getItem('chemvirtuallab_quiz_topik2') || '0', 10);
      const t3 = parseInt(localStorage.getItem('chemvirtuallab_quiz_topik3') || '0', 10);
      const materiStatusElem = document.getElementById('siswa-materi-quizzes-status');
      if (materiStatusElem) {
        materiStatusElem.innerHTML = `
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.4rem;">
            <span class="badge-score ${t1 >= 75 ? 'pass' : (t1 > 0 ? 'fail' : 'pending')}">Topik 1 (K3): ${t1 > 0 ? t1 + '/100' : 'Belum'}</span>
            <span class="badge-score ${t2 >= 75 ? 'pass' : (t2 > 0 ? 'fail' : 'pending')}">Topik 2 (Atom): ${t2 > 0 ? t2 + '/100' : 'Belum'}</span>
            <span class="badge-score ${t3 >= 75 ? 'pass' : (t3 > 0 ? 'fail' : 'pending')}">Topik 3 (SPU): ${t3 > 0 ? t3 + '/100' : 'Belum'}</span>
          </div>
        `;
      }

      // Status Sertifikat
      const certStatusElem = document.getElementById('siswa-cert-status');
      if (certStatusElem) {
        if (score >= 75 && lkpdSaved) {
          certStatusElem.innerHTML = `<span style="color:#15803d; font-weight:700;">🏆 Selamat! Piagam Kelulusan Siap Diterbitkan & Dicetak</span>`;
        } else {
          certStatusElem.innerHTML = `<span style="color:#b45309; font-weight:600;">Selesaikan LKPD dan raih nilai kuis minimal 75 untuk membuka Piagam resmi.</span>`;
        }
      }
    }

    /* -------------------------------------------------------------
       7. DETAIL LKPD MODAL REVIEW FOR TEACHER
       ------------------------------------------------------------- */
    viewStudentLKPD(studentId) {
      const student = this.studentsDatabase.find(s => s.id === studentId);
      if (!student) return;

      const titleElem = document.getElementById('lkpd-modal-student-title');
      const bodyElem = document.getElementById('lkpd-modal-content-body');

      if (titleElem) {
        titleElem.textContent = `Lembar Kerja Peserta Didik (LKPD PBL) - ${student.nama} (Kelas ${student.kelas})`;
      }

      const lkpd = student.lkpdData || {};

      if (bodyElem) {
        bodyElem.innerHTML = `
          <div class="lkpd-review-meta">
            <div><strong>Nama Siswa:</strong> ${student.nama}</div>
            <div><strong>Kelas:</strong> ${student.kelas}</div>
            <div><strong>Nilai Kuis T1 (K3):</strong> ${student.nilaiTopik1 || 0} / 100</div>
            <div><strong>Nilai Kuis T2 (Atom):</strong> ${student.nilaiTopik2 || 0} / 100</div>
            <div><strong>Nilai Kuis T3 (SPU):</strong> ${student.nilaiTopik3 || 0} / 100</div>
            <div><strong>Nilai Kuis Modul 8:</strong> ${student.nilaiKuis || 0} / 100</div>
            <div><strong>Terakhir Disimpan:</strong> ${student.terakhirAktif || '-'}</div>
          </div>

          <div class="lkpd-review-item">
            <h5>1. Fase 1: Identifikasi Insiden & Kesalahan Fatal Laboratorium</h5>
            <div class="lkpd-review-box">${lkpd.fase1 || '<em style="color:#94a3b8;">Siswa belum mengisikan analisis fase ini.</em>'}</div>
          </div>

          <div class="lkpd-review-item">
            <h5>2. Fase 2: Rumusan Masalah Ilmiah Praktikum</h5>
            <div class="lkpd-review-box">${lkpd.fase2 || '<em style="color:#94a3b8;">Siswa belum mengisikan analisis fase ini.</em>'}</div>
          </div>

          <div class="lkpd-review-item">
            <h5>3. Fase 3: Analisis Pelanggaran SOP & Kajian MSDS</h5>
            <div class="lkpd-review-box">${lkpd.fase3 || '<em style="color:#94a3b8;">Siswa belum mengisikan analisis fase ini.</em>'}</div>
          </div>

          <div class="lkpd-review-item">
            <h5>4. Fase 4: Solusi Ilmiah & Prosedur Praktikum yang Tepat</h5>
            <div class="lkpd-review-box">${lkpd.fase4 || '<em style="color:#94a3b8;">Siswa belum mengisikan analisis fase ini.</em>'}</div>
          </div>

          <div class="lkpd-review-item">
            <h5>5. Fase 5: Evaluasi Pengalaman & Komitmen Praktikan</h5>
            <div class="lkpd-review-box">${lkpd.fase5 || '<em style="color:#94a3b8;">Siswa belum mengisikan analisis fase ini.</em>'}</div>
          </div>
        `;
      }

      const modal = document.getElementById('lkpd-review-modal-overlay');
      if (modal) modal.classList.add('active');
    }

    hideLkpdModal() {
      const modal = document.getElementById('lkpd-review-modal-overlay');
      if (modal) modal.classList.remove('active');
    }

    promptEditScore(studentId) {
      const student = this.studentsDatabase.find(s => s.id === studentId);
      if (!student) return;

      const choice = prompt(
        `Pilih nilai yang ingin diperbarui untuk:\n${student.nama} (Kelas ${student.kelas})\n\n` +
        `1 = Kuis Topik 1: Alat Lab & K3 (Saat ini: ${student.nilaiTopik1 || 0})\n` +
        `2 = Kuis Topik 2: Struktur Atom (Saat ini: ${student.nilaiTopik2 || 0})\n` +
        `3 = Kuis Topik 3: SPU (Saat ini: ${student.nilaiTopik3 || 0})\n` +
        `4 = Kuis Evaluasi Modul 8 (Saat ini: ${student.nilaiKuis || 0})\n\n` +
        `Ketik angka 1, 2, 3, atau 4:`,
        "1"
      );

      if (!choice) return;

      let targetKey = "nilaiKuis";
      let label = "Kuis Evaluasi Modul 8";
      let currentVal = student.nilaiKuis || 0;

      if (choice === "1") {
        targetKey = "nilaiTopik1";
        label = "Kuis Topik 1 (Alat Lab & K3)";
        currentVal = student.nilaiTopik1 || 0;
      } else if (choice === "2") {
        targetKey = "nilaiTopik2";
        label = "Kuis Topik 2 (Struktur Atom)";
        currentVal = student.nilaiTopik2 || 0;
      } else if (choice === "3") {
        targetKey = "nilaiTopik3";
        label = "Kuis Topik 3 (SPU)";
        currentVal = student.nilaiTopik3 || 0;
      }

      const newScore = prompt(`Masukkan nilai baru (0 - 100) untuk ${label}:\nSiswa: ${student.nama}`, currentVal);
      if (newScore !== null && !isNaN(parseInt(newScore, 10))) {
        const val = Math.min(100, Math.max(0, parseInt(newScore, 10)));
        student[targetKey] = val;
        student.terakhirAktif = new Date().toLocaleString('id-ID');
        if (targetKey === 'nilaiKuis') {
          student.sertifikatStatus = val >= 75 ? "Diterbitkan" : "Belum Memenuhi";
        }
        this.saveDatabase();
        this.renderGuruDashboard();
        this.showToast(`Nilai ${label} untuk ${student.nama} berhasil diperbarui menjadi ${val}!`);
      }
    }

    /* -------------------------------------------------------------
       8. EXPORT CSV & PRINT OFFICIAL REKAPITULASI (A4)
       ------------------------------------------------------------- */
    exportToCSV() {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "No,Nama Lengkap Siswa,Kelas,Kuis Topik 1 (K3),Kuis Topik 2 (Atom),Kuis Topik 3 (SPU),Kuis Modul 8,Status LKPD,Status Sertifikat,Terakhir Aktif\n";

      this.studentsDatabase.forEach((s, idx) => {
        const row = [
          idx + 1,
          `"${s.nama}"`,
          `"${s.kelas}"`,
          s.nilaiTopik1 || 0,
          s.nilaiTopik2 || 0,
          s.nilaiTopik3 || 0,
          s.nilaiKuis || 0,
          `"${s.lkpdStatus}"`,
          `"${s.sertifikatStatus}"`,
          `"${s.terakhirAktif || '-'}"`
        ];
        csvContent += row.join(",") + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Rekap_Nilai_Kimia_Fatma_Alawiyah_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast("File Rekapitulasi Nilai (.CSV) berhasil diunduh!");
    }

    printRekapitulasi() {
      // Siapkan area cetak A4
      let printArea = document.getElementById('printable-rekap-area');
      if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'printable-rekap-area';
        document.body.appendChild(printArea);
      }

      const rowsHtml = this.studentsDatabase.map((s, idx) => `
        <tr style="border-bottom:1px solid #ddd; text-align:center;">
          <td style="padding:6px;">${idx + 1}</td>
          <td style="padding:6px; text-align:left;">${s.nama}</td>
          <td style="padding:6px;">${s.kelas}</td>
          <td style="padding:6px; font-weight:bold;">${s.nilaiTopik1 || 0}</td>
          <td style="padding:6px; font-weight:bold;">${s.nilaiTopik2 || 0}</td>
          <td style="padding:6px; font-weight:bold;">${s.nilaiTopik3 || 0}</td>
          <td style="padding:6px; font-weight:bold;">${s.nilaiKuis || 0}</td>
          <td style="padding:6px;">${s.lkpdStatus}</td>
          <td style="padding:6px;">${s.sertifikatStatus}</td>
        </tr>
      `).join('');

      printArea.innerHTML = `
        <div style="font-family:'Plus Jakarta Sans', Arial, sans-serif; color:#000;">
          <div style="text-align:center; border-bottom:3px double #000; padding-bottom:12px; margin-bottom:16px;">
            <h2 style="font-size:1.3rem; margin:0 0 4px; text-transform:uppercase; letter-spacing:0.5px;">
              LEMBAR REKAPITULASI HASIL EVALUASI LABORATORIUM VIRTUAL KIMIA
            </h2>
            <div style="font-size:0.95rem; font-weight:600;">PEMBELAJARAN INTERAKTIF MULTIMEDIA KIMIA SMA/MA</div>
            <div style="font-size:0.85rem; color:#444;">Tahun Ajaran 2026/2027 &bull; Kelas X.1 sampai X.5 &bull; Standar KKM: 75</div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:12px;">
            <div><strong>Guru Pengampu:</strong> Fatma Alawiyah, S.Pd.,Gr</div>
            <div><strong>NIP:</strong> 200103272025212017</div>
            <div><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <table style="width:100%; border-collapse:collapse; font-size:0.82rem; margin-bottom:24px;">
            <thead>
              <tr style="background:#f2f2f2; border-top:1px solid #000; border-bottom:2px solid #000; text-align:center;">
                <th style="padding:8px; width:35px;">No</th>
                <th style="padding:8px; text-align:left;">Nama Peserta Didik</th>
                <th style="padding:8px; width:70px;">Kelas</th>
                <th style="padding:8px; width:65px;">Kuis 1 (K3)</th>
                <th style="padding:8px; width:65px;">Kuis 2 (Atom)</th>
                <th style="padding:8px; width:65px;">Kuis 3 (SPU)</th>
                <th style="padding:8px; width:65px;">Modul 8</th>
                <th style="padding:8px; width:90px;">LKPD PBL</th>
                <th style="padding:8px; width:90px;">Sertifikat</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="display:flex; justify-content:flex-end; margin-top:30px;">
            <div style="text-align:center; min-width:240px; font-size:0.88rem;">
              <div>Mengetahui,</div>
              <div style="margin-bottom:60px;">Guru Mata Pelajaran Kimia</div>
              <div style="font-weight:bold; text-decoration:underline;">Fatma Alawiyah, S.Pd.,Gr</div>
              <div>NIP. 200103272025212017</div>
            </div>
          </div>
        </div>
      `;

      window.print();
    }

    /* -------------------------------------------------------------
       9. MODAL & NAVIGATION HELPERS
       ------------------------------------------------------------- */
    showAuthModal() {
      const modal = document.getElementById('auth-modal-overlay');
      if (modal) modal.classList.add('active');

      // Bersihkan input nama & kelas siswa agar siap diisi akun baru
      const nameInput = document.getElementById('auth-siswa-nama');
      const kelasInput = document.getElementById('auth-siswa-kelas');
      if (nameInput) nameInput.value = '';
      if (kelasInput) kelasInput.value = '';

      // Set default tab ke siswa
      const roleTabs = document.querySelectorAll('.auth-role-tab');
      roleTabs.forEach(t => {
        if (t.dataset.role === 'siswa') t.classList.add('active');
        else t.classList.remove('active');
      });
      document.querySelectorAll('.auth-form-panel').forEach(p => p.classList.remove('active'));
      const siswaPanel = document.getElementById('auth-form-siswa');
      if (siswaPanel) siswaPanel.classList.add('active');

      // Sembunyikan notifikasi error
      const alertSiswa = document.getElementById('auth-siswa-alert');
      if (alertSiswa) alertSiswa.style.display = 'none';
      const alertGuru = document.getElementById('auth-guru-alert');
      if (alertGuru) alertGuru.style.display = 'none';
    }

    hideAuthModal() {
      const modal = document.getElementById('auth-modal-overlay');
      if (modal) modal.classList.remove('active');
    }

    navigateToView(viewId) {
      document.querySelectorAll('.page-view').forEach(view => {
        view.classList.remove('active-view');
      });

      const target = document.getElementById(viewId);
      if (target) {
        target.classList.add('active-view');
      }

      // Update Nav Bar Items active state
      document.querySelectorAll('.nav-module-item').forEach(item => {
        item.classList.remove('active');
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showToast(message) {
      let toast = document.getElementById('app-floating-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-floating-toast';
        toast.style.cssText = `
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0f172a;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          z-index: 10001;
          font-size: 0.88rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          transform: translateY(100px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        document.body.appendChild(toast);
      }

      toast.innerHTML = `<span>✨</span> ${message}`;
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';

      setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
      }, 3500);
    }
  }

  // Expose global module
  window.AuthDashboard = new AuthDashboardModule();

  // Document ready hook
  document.addEventListener('DOMContentLoaded', () => {
    window.AuthDashboard.init();
  });

})();
