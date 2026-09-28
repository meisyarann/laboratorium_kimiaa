/* ==========================================================================
   CHEMVIRTUAL LAB - MODUL 5: MATERI KIMIA (HUKUM DASAR, BOHR ATOM & SPU)
   ========================================================================== */

class ChemicalTheoryModule {
  constructor() {
    this.currentAtomKey = 'Na';
    this.canvas = null;
    this.ctx = null;
    this.animAngle = 0;
    this.animId = null;
    this.activeSubTab = 'atom'; // 'laws', 'atom', 'spu'
    this.spuFilter = 'all';

    // State Praktikum Virtual Hukum Dasar Kimia
    this.lavDataHistory = [];
    this.proustDataHistory = [];
    this.lavState = {
      rx: 'gas',
      isClosed: true,
      r1: 50.0,
      r2: 15.0,
      hasMixed: false
    };
    this.proustState = {
      rx: 'fes',
      massA: 14.0,
      massB: 8.0,
      hasReacted: false
    };
    this.daltonState = {
      system: 'c_o',
      refMass: 12.0,
      hasSynthesized: false
    };
    // State Molymod 3D Viewer
    this.molymod = {
      scene: null,
      camera: null,
      renderer: null,
      animId: null,
      currentMoleculeId: 'h2o',
      displayMode: 'ball_stick', // 'ball_stick', 'space_filling', 'wireframe'
      isAutoRotate: true,
      isExploded: false,
      filterCategory: 'all',
      meshGroup: null,
      isDragging: false,
      prevMouse: { x: 0, y: 0 },
      rotation: { x: 0.25, y: 0.4 },
      zoom: 1.0,
      atomsList: [],
      bondsList: [],
      explodeProgress: 0.0
    };
  }

  init() {
    window.chemicalTheory = this;
    this.setupSubTabs();
    this.initMateriNavigation();
    this.initLabSafetySection();
    this.initTopicQuizzes();
    this.renderBohrControls();
    this.initBohrCanvas();
    this.renderPeriodicTable();
    this.renderChemicalLaws();
    this.setupVirtualPracticums();
    this.setupLawsCalculators();
    this.initMolymodModule();
  }

  setupSubTabs() {
    const subTabBtns = document.querySelectorAll('.materi-sub-btn');
    subTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetViewId = btn.dataset.target;
        document.querySelectorAll('.materi-sub-view').forEach(view => {
          view.classList.remove('active');
        });
        const targetView = document.getElementById(targetViewId);
        if (targetView) {
          targetView.classList.add('active');

          // Reset inner pill filter to 'all' when opening a material
          const allPill = targetView.querySelector('.materi-pill-btn[data-pane="all"]');
          if (allPill) {
            targetView.querySelectorAll('.materi-pill-btn').forEach(b => b.classList.remove('active'));
            allPill.classList.add('active');
            targetView.querySelectorAll('.materi-section-block').forEach(b => {
              b.style.display = 'block';
            });
          }
        }

        // Jika membuka Molymod 3D melalui pintasan, tandai tab Struktur Atom tetap aktif
        if (targetViewId === 'materi-view-molymod') {
          const atomTab = document.querySelector('[data-target="materi-view-atom"]');
          if (atomTab) atomTab.classList.add('active');
        }

        // Restart animation if Bohr canvas is active
        if (targetViewId === 'materi-view-atom') {
          this.initBohrCanvas();
        }
        // Inisialisasi atau aktifkan Molymod 3D Three.js jika subtab aktif
        if (targetViewId === 'materi-view-molymod') {
          this.initMolymodViewer();
        }
      });
    });
  }

  /* -------------------------------------------------------------
     0. NAVIGASI SUB-MENU PER MATERI (PILL FILTER & QUICK JUMP)
     ------------------------------------------------------------- */
  initMateriNavigation() {
    const pillBtns = document.querySelectorAll('.materi-pill-btn');
    pillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const parentView = btn.closest('.materi-sub-view');
        if (!parentView) return;

        parentView.querySelectorAll('.materi-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetPane = btn.dataset.pane;
        const blocks = parentView.querySelectorAll('.materi-section-block');

        if (targetPane === 'all') {
          blocks.forEach(block => {
            block.style.display = 'block';
          });
          const innerNav = parentView.querySelector('.materi-inner-nav-bar');
          if (innerNav) innerNav.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          blocks.forEach(block => {
            if (block.id === targetPane) {
              block.style.display = 'block';
              block.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              block.style.display = 'none';
            }
          });
        }

        // Jika tab simulator Bohr diaktifkan pada Materi 2
        if (targetPane === 'm2-bohr-sim') {
          this.initBohrCanvas();
        }
      });
    });
  }

  /* -------------------------------------------------------------
     0B. PANDUAN PENGENALAN ALAT LAB & KESELAMATAN KERJA (K3)
     ------------------------------------------------------------- */
  initLabSafetySection() {
    // 1. Filter Kategori Alat Laboratorium
    const equipFilterBtns = document.querySelectorAll('.equip-filter-btn');
    const equipCards = document.querySelectorAll('.equip-card');
    equipFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        equipFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        equipCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // 2. Mini Kuis dipusatkan pada initTopicQuizzes()
    // 3. Pintasan dari Struktur Atom ke Molymod dan sebaliknya
    const btnOpenMolymod = document.getElementById('btn-open-molymod-subview');
    if (btnOpenMolymod) {
      btnOpenMolymod.addEventListener('click', () => {
        const hiddenTab = document.getElementById('btn-tab-materi-molymod');
        if (hiddenTab) hiddenTab.click();
      });
    }
    const btnBackToAtom = document.getElementById('btn-back-to-atom-tab');
    if (btnBackToAtom) {
      btnBackToAtom.addEventListener('click', () => {
        const atomTab = document.querySelector('[data-target="materi-view-atom"]');
        if (atomTab) atomTab.click();
      });
    }
  }

  /* -------------------------------------------------------------
     0B. ENGINE KUIS PER TOPIK MATERI (TOPIK 1, 2, 3) DENGAN AUTO-SYNC
     ------------------------------------------------------------- */
  initTopicQuizzes() {
    this.quizTopicState = {
      1: { answered: 0, correct: 0, total: 5 },
      2: { answered: 0, correct: 0, total: 5 },
      3: { answered: 0, correct: 0, total: 5 }
    };

    // Tampilkan skor tersimpan jika siswa sudah pernah mengerjakan kuis topik sebelumnya
    [1, 2, 3].forEach(t => {
      const savedScore = localStorage.getItem(`chemvirtuallab_quiz_topik${t}`);
      if (savedScore !== null) {
        const scoreVal = parseInt(savedScore, 10);
        const banner = document.getElementById(`quiz-result-topik-${t}`);
        const scoreEl = document.getElementById(`quiz-score-val-${t}`);
        if (banner && scoreEl) {
          scoreEl.textContent = scoreVal;
          banner.style.display = 'block';
        }
      }
    });

    const quizBtns = document.querySelectorAll('.materi-quiz-btn, .quiz-k3-btn');
    quizBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.materi-quiz-card, .quiz-k3-card');
        if (!card) return;

        // Cegah klik ganda jika kartu ini sudah dijawab
        if (card.dataset.answered === 'true') return;
        card.dataset.answered = 'true';

        const topicNum = parseInt(card.dataset.topic, 10) || 1;
        const allBtns = card.querySelectorAll('.materi-quiz-btn, .quiz-k3-btn');
        const feedback = card.querySelector('.materi-quiz-feedback, .quiz-k3-feedback');
        const isCorrect = btn.dataset.correct === 'true';

        // Nonaktifkan semua opsi pada soal ini & beri tanda kunci jawaban
        allBtns.forEach(b => {
          b.disabled = true;
          if (b.dataset.correct === 'true') {
            b.classList.add('correct');
          }
        });

        if (isCorrect) {
          if (this.quizTopicState[topicNum]) {
            this.quizTopicState[topicNum].correct++;
          }
          if (feedback) {
            feedback.className = 'materi-quiz-feedback quiz-k3-feedback show correct';
            feedback.innerHTML = `✅ <strong>Jawaban Tepat! (+20 Poin)</strong> ${btn.dataset.explanation || 'Pemahaman Anda sudah sangat baik!'}`;
          }
        } else {
          btn.classList.add('wrong');
          if (feedback) {
            feedback.className = 'materi-quiz-feedback quiz-k3-feedback show wrong';
            feedback.innerHTML = `❌ <strong>Jawaban Kurang Tepat (0 Poin).</strong> ${btn.dataset.explanation || 'Pelajari kembali ringkasan materi di atas.'}`;
          }
        }

        if (this.quizTopicState[topicNum]) {
          this.quizTopicState[topicNum].answered++;

          // SINKRONISASI REAL-TIME KE DASHBOARD GURU SETIAP KALI SOAL DIJAWAB
          const currentScore = Math.round((this.quizTopicState[topicNum].correct / this.quizTopicState[topicNum].total) * 100);
          localStorage.setItem(`chemvirtuallab_quiz_topik${topicNum}`, currentScore.toString());
          if (window.AuthDashboard && typeof window.AuthDashboard.saveMateriQuizScore === 'function') {
            window.AuthDashboard.saveMateriQuizScore(topicNum, currentScore, false);
          }

          // Periksa apakah seluruh 5 soal pada topik ini sudah dijawab
          if (this.quizTopicState[topicNum].answered >= this.quizTopicState[topicNum].total) {
            this.finalizeTopicQuiz(topicNum);
          }
        }
      });
    });
  }

  finalizeTopicQuiz(topicNum) {
    const state = this.quizTopicState[topicNum] || { correct: 0, total: 5 };
    const score = Math.round((state.correct / state.total) * 100);

    const banner = document.getElementById(`quiz-result-topik-${topicNum}`);
    const scoreVal = document.getElementById(`quiz-score-val-${topicNum}`);
    const titleEl = document.getElementById(`quiz-result-title-${topicNum}`);
    const msgEl = document.getElementById(`quiz-result-msg-${topicNum}`);

    if (scoreVal) scoreVal.textContent = score;

    const topicNames = {
      1: "Topik 1: Pengenalan Alat Lab & K3",
      2: "Topik 2: Struktur Atom",
      3: "Topik 3: Sistem Periodik Unsur (SPU)"
    };
    const tName = topicNames[topicNum] || `Topik ${topicNum}`;

    if (titleEl) {
      if (score >= 80) {
        titleEl.textContent = `🌟 Sempurna! Hasil Kuis ${tName}`;
      } else if (score >= 60) {
        titleEl.textContent = `👍 Kerja Bagus! Hasil Kuis ${tName}`;
      } else {
        titleEl.textContent = `📚 Hasil Kuis ${tName} Selesai`;
      }
    }

    if (msgEl) {
      msgEl.innerHTML = `Anda menjawab benar <strong>${state.correct} dari ${state.total} soal</strong> (Skor: <strong>${score}/100</strong>). Nilai langsung tersinkronisasi dan otomatis tercatat di Dashboard Guru Kimia.`;
    }

    if (banner) {
      banner.style.display = 'block';
      setTimeout(() => {
        banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    }

    // SIMPAN LANGSUNG KE DASHBOARD GURU & LOCALSTORAGE DENGAN NOTIFIKASI
    localStorage.setItem(`chemvirtuallab_quiz_topik${topicNum}`, score.toString());
    if (window.AuthDashboard && typeof window.AuthDashboard.saveMateriQuizScore === 'function') {
      window.AuthDashboard.saveMateriQuizScore(topicNum, score, true);
    }
  }

  resetTopicQuiz(topicNum) {
    if (this.quizTopicState && this.quizTopicState[topicNum]) {
      this.quizTopicState[topicNum].answered = 0;
      this.quizTopicState[topicNum].correct = 0;
    }

    // Reset kartu soal topik terkait
    const cards = document.querySelectorAll(`.materi-quiz-card[data-topic="${topicNum}"], .quiz-k3-card[data-topic="${topicNum}"]`);
    cards.forEach(card => {
      delete card.dataset.answered;
      const btns = card.querySelectorAll('.materi-quiz-btn, .quiz-k3-btn');
      btns.forEach(b => {
        b.disabled = false;
        b.classList.remove('correct', 'wrong');
      });
      const feedback = card.querySelector('.materi-quiz-feedback, .quiz-k3-feedback');
      if (feedback) {
        feedback.className = 'materi-quiz-feedback quiz-k3-feedback';
        feedback.innerHTML = '';
      }
    });

    // Sembunyikan banner hasil
    const banner = document.getElementById(`quiz-result-topik-${topicNum}`);
    if (banner) {
      banner.style.display = 'none';
    }

    // Scroll ke bagian atas kuis topik tersebut
    const targetSection = document.getElementById(`m${topicNum}-quiz`);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* -------------------------------------------------------------
     1. SIMULATOR MODEL ATOM BOHR DINAMIS (HTML5 CANVAS)
     ------------------------------------------------------------- */
  renderBohrControls() {
    const container = document.getElementById('bohr-element-picker-mount');
    if (!container) return;

    const atomKeys = Object.keys(BOHR_ATOMS_DATA);
    container.innerHTML = atomKeys.map(k => `
      <button class="btn-bohr-elem ${k === this.currentAtomKey ? 'active' : ''}" data-elem="${k}">
        ${k}
      </button>
    `).join('');

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-bohr-elem');
      if (btn && btn.dataset.elem) {
        this.selectAtom(btn.dataset.elem);
      }
    });

    this.updateAtomInfoCard();
  }

  selectAtom(elemSymbol) {
    if (!BOHR_ATOMS_DATA[elemSymbol]) return;
    this.currentAtomKey = elemSymbol;

    document.querySelectorAll('.btn-bohr-elem').forEach(btn => {
      if (btn.dataset.elem === elemSymbol) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    this.updateAtomInfoCard();
  }

  updateAtomInfoCard() {
    const data = BOHR_ATOMS_DATA[this.currentAtomKey];
    if (!data) return;

    const neutrons = Math.round(data.mass - data.z);
    const configStr = data.shells.join(' - ');

    const infoMount = document.getElementById('bohr-info-mount');
    if (infoMount) {
      infoMount.innerHTML = `
        <div style="margin-bottom:1rem;">
          <h3 style="font-size:1.4rem; color:var(--text-dark); display:flex; align-items:center; gap:0.5rem;">
            ${data.name} (${data.symbol})
            <span class="badge-tag">Golongan ${data.group} / Periode ${data.period}</span>
          </h3>
          <p style="font-size:0.86rem; color:var(--text-secondary);">
            Notasi Atom: <strong style="font-family:var(--font-mono); color:var(--accent-blue);">
              <sup>${Math.round(data.mass)}</sup><sub>${data.z}</sub>${data.symbol}
            </strong>
          </p>
        </div>

        <div class="bohr-data-grid">
          <div class="bohr-data-pill">
            <strong>Nomor Atom (Z) / Proton (p⁺)</strong>
            <span>${data.z} Proton</span>
          </div>
          <div class="bohr-data-pill">
            <strong>Jumlah Elektron (e⁻)</strong>
            <span>${data.z} Elektron</span>
          </div>
          <div class="bohr-data-pill">
            <strong>Massa Atom (A) / Neutron (n⁰)</strong>
            <span>${neutrons} Neutron</span>
          </div>
          <div class="bohr-data-pill">
            <strong>Konfigurasi Elektron Bohr (K,L,M,N)</strong>
            <span style="color:var(--accent-blue);">${configStr}</span>
          </div>
        </div>
      `;
    }
  }

  initBohrCanvas() {
    this.canvas = document.getElementById('bohr-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Handle high DPI
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = (rect.width || 380) * dpr;
    this.canvas.height = (rect.height || 380) * dpr;
    this.ctx.scale(dpr, dpr);

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animAngle = 0;
    this.animateBohr();
  }

  animateBohr() {
    this.animId = requestAnimationFrame(() => this.animateBohr());
    if (!this.canvas || !this.ctx) return;

    const width = this.canvas.getBoundingClientRect().width;
    const height = this.canvas.getBoundingClientRect().height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const atom = BOHR_ATOMS_DATA[this.currentAtomKey];
    if (!atom) return;

    // INTI ATOM (NUCLEUS)
    const nucleusRadius = 22;
    const nucGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, nucleusRadius);
    nucGrad.addColorStop(0, '#f87171');
    nucGrad.addColorStop(0.5, '#dc2626');
    nucGrad.addColorStop(1, '#991b1b');

    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
    ctx.fillStyle = nucGrad;
    ctx.fill();
    ctx.strokeStyle = '#fecaca';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Simbol Inti
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${atom.z}p+`, centerX, centerY - 4);
    ctx.font = '9px Outfit, sans-serif';
    ctx.fillText(`${Math.round(atom.mass - atom.z)}n`, centerX, centerY + 7);

    // KULIT-KULIT ELEKTRON (ORBITS)
    const baseRadius = 45;
    const shellStep = 28;
    this.animAngle += 0.02;

    atom.shells.forEach((electronCount, shellIdx) => {
      const radius = baseRadius + (shellIdx * shellStep);
      const shellName = ['K', 'L', 'M', 'N'][shellIdx] || `Kulit-${shellIdx+1}`;

      // Garis Orbit Putar
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label Kulit
      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(shellName, centerX + radius - 10, centerY - 4);

      // Gambar Elektron Berputar
      const speedMultiplier = (shellIdx % 2 === 0 ? 1 : -1) * (1 - shellIdx * 0.15);
      for (let i = 0; i < electronCount; i++) {
        const angle = (i * (Math.PI * 2 / electronCount)) + (this.animAngle * speedMultiplier);
        const ex = centerX + Math.cos(angle) * radius;
        const ey = centerY + Math.sin(angle) * radius;

        // Glow elektron
        const eGlow = ctx.createRadialGradient(ex, ey, 1, ex, ey, 6);
        eGlow.addColorStop(0, '#38bdf8');
        eGlow.addColorStop(0.6, '#0284c7');
        eGlow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(ex, ey, 6, 0, Math.PI * 2);
        ctx.fillStyle = eGlow;
        ctx.fill();

        // Inti elektron
        ctx.beginPath();
        ctx.arc(ex, ey, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    });
  }

  /* -------------------------------------------------------------
     2. TABEL PERIODIK UNSUR (SPU) INTERAKTIF
     ------------------------------------------------------------- */
  renderPeriodicTable() {
    const tableMount = document.getElementById('periodic-table-grid-mount');
    if (!tableMount) return;

    tableMount.innerHTML = PERIODIC_ELEMENTS_DATA.map(el => {
      // Hitung posisi grid css: row = period, col = group
      return `
        <div class="ptable-cell cat-${el.c}" style="grid-column: ${el.g}; grid-row: ${el.p};" data-z="${el.z}">
          <span class="pt-num">${el.z}</span>
          <span class="pt-symbol">${el.s}</span>
          <span class="pt-name">${el.n}</span>
        </div>
      `;
    }).join('');

    // Filter Buttons
    const filterContainer = document.getElementById('spu-filter-bar-mount');
    if (filterContainer) {
      filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.spu-filter-btn');
        if (btn && btn.dataset.category) {
          this.filterPeriodicTable(btn.dataset.category);
          document.querySelectorAll('.spu-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    }

    // Klik Unsur SPU untuk Modal Detail
    tableMount.addEventListener('click', (e) => {
      const cell = e.target.closest('.ptable-cell');
      if (cell && cell.dataset.z) {
        const el = PERIODIC_ELEMENTS_DATA.find(item => item.z == cell.dataset.z);
        if (el) {
          alert(`UNSUR: ${el.n.toUpperCase()} (${el.s})\n\n` +
                `• Nomor Atom (Z): ${el.z}\n` +
                `• Massa Atom Relatif (Ar): ${el.m} g/mol\n` +
                `• Golongan: ${el.g} | Periode: ${el.p}\n` +
                `• Kategori: ${el.c}\n` +
                `• Konfigurasi Elektron: ${el.conf}`);
        }
      }
    });
  }

  filterPeriodicTable(category) {
    this.spuFilter = category;
    document.querySelectorAll('.ptable-cell').forEach(cell => {
      if (category === 'all' || cell.classList.contains(`cat-${category}`)) {
        cell.style.opacity = '1';
        cell.style.transform = 'scale(1)';
      } else {
        cell.style.opacity = '0.2';
        cell.style.transform = 'scale(0.92)';
      }
    });
  }

  /* -------------------------------------------------------------
     3. HUKUM DASAR KIMIA & LABORATORIUM VIRTUAL INTERAKTIF
     ------------------------------------------------------------- */
  renderChemicalLaws() {
    const container = document.getElementById('chemical-laws-list-mount');
    if (!container) return;

    container.innerHTML = CHEMICAL_LAWS_DATA.map(law => `
      <div class="hukum-card ${law.hasLab ? 'has-vlab-badge' : ''}">
        <div class="hukum-card-header">
          <h4>⚖️ ${law.title}</h4>
          ${law.hasLab ? `<span class="badge-vlab-available">${law.labIcon} Praktikum Virtual</span>` : ''}
        </div>
        <div class="hukum-formula-box">${law.formula}</div>
        <p style="font-size:0.88rem; color:var(--text-primary); margin-bottom:0.6rem;">${law.explanation}</p>
        <p style="font-size:0.82rem; color:var(--accent-blue); background:#f0f9ff; padding:0.5rem; border-radius:6px; margin-bottom:0.85rem;">
          <strong>Contoh Riil:</strong> ${law.example}
        </p>
        ${law.hasLab ? `
          <button class="btn btn-primary btn-sm btn-open-vlab" data-vlab="${law.labId}">
            🔬 Mulai ${law.labName} →
          </button>
        ` : ''}
      </div>
    `).join('');

    // Listener tombol Buka Praktikum dari setiap kartu
    container.querySelectorAll('.btn-open-vlab').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetLabId = btn.dataset.vlab;
        this.switchVLabTab(targetLabId);
        const targetElem = document.getElementById('vlab-laws-workspace');
        if (targetElem) {
          targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  switchVLabTab(targetPaneId) {
    document.querySelectorAll('.vlab-nav-btn').forEach(b => {
      if (b.dataset.target === targetPaneId) b.classList.add('active');
      else b.classList.remove('active');
    });

    document.querySelectorAll('.vlab-content-pane').forEach(p => {
      if (p.id === targetPaneId) p.classList.add('active');
      else p.classList.remove('active');
    });
  }

  setupVirtualPracticums() {
    // Navigasi Tab Praktikum Virtual
    const tabBtns = document.querySelectorAll('.vlab-nav-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        this.switchVLabTab(targetId);
      });
    });

    // Inisialisasi Masing-Masing Laboratorium Virtual
    this.initLavoisierLab();
    this.initProustLab();
    this.initDaltonLab();
  }

  /* =============================================================
     A. ENGINE PRAKTIKUM VIRTUAL HUKUM LAVOISIER (KEKEKALAN MASSA)
     ============================================================= */
  initLavoisierLab() {
    const rxGasRadio = document.getElementById('lav2-rx-gas');
    const rxPptRadio = document.getElementById('lav2-rx-ppt');
    const btnClosed = document.getElementById('btn-lav2-closed');
    const btnOpen = document.getElementById('btn-lav2-open');
    const sliderR1 = document.getElementById('lav2-slider-r1');
    const sliderR2 = document.getElementById('lav2-slider-r2');
    const badgeValR1 = document.getElementById('lav2-val-r1');
    const badgeValR2 = document.getElementById('lav2-val-r2');
    const labelR1 = document.getElementById('lav2-label-r1');
    const labelR2 = document.getElementById('lav2-label-r2');
    const scaleDisplay = document.getElementById('lav2-scale-display');
    const statusChip = document.getElementById('lav2-status-chip');
    const btnMix = document.getElementById('btn-lav2-mix');
    const btnReset = document.getElementById('btn-lav2-reset');
    const btnLog = document.getElementById('btn-lav2-log');
    const btnClearTable = document.getElementById('btn-lav2-clear-table');
    const obsLog = document.getElementById('lav2-obs-log');
    const balloon = document.getElementById('lav2-balloon');
    const stopper = document.getElementById('lav2-stopper');
    const fumes = document.getElementById('lav2-gas-fumes');
    const bubbles = document.getElementById('lav2-bubbles');
    const precipitate = document.getElementById('lav2-precipitate');

    const flaskBaseTare = 120.00; // Massa labu kaca erlenmeyer

    const updateScaleBeforeReaction = () => {
      if (this.lavState.hasMixed) return;
      const r1 = parseFloat(sliderR1.value) || 0;
      const r2 = parseFloat(sliderR2.value) || 0;
      const total = flaskBaseTare + r1 + r2;
      if (scaleDisplay) {
        scaleDisplay.textContent = `${total.toFixed(2)} g`;
      }
    };

    // Slider Listeners
    if (sliderR1 && badgeValR1) {
      sliderR1.addEventListener('input', () => {
        badgeValR1.textContent = `${parseFloat(sliderR1.value).toFixed(1)} g`;
        this.lavState.r1 = parseFloat(sliderR1.value);
        updateScaleBeforeReaction();
      });
    }

    if (sliderR2 && badgeValR2) {
      sliderR2.addEventListener('input', () => {
        badgeValR2.textContent = `${parseFloat(sliderR2.value).toFixed(1)} g`;
        this.lavState.r2 = parseFloat(sliderR2.value);
        updateScaleBeforeReaction();
      });
    }

    // Radio Jenis Reaksi
    const updateReactionLabels = () => {
      const isGas = rxGasRadio && rxGasRadio.checked;
      this.lavState.rx = isGas ? 'gas' : 'ppt';
      if (labelR1 && labelR2) {
        if (isGas) {
          labelR1.textContent = 'Massa Larutan A (CH₃COOH):';
          labelR2.textContent = 'Massa Zat B (NaHCO₃):';
        } else {
          labelR1.textContent = 'Massa Larutan A (BaCl₂):';
          labelR2.textContent = 'Massa Larutan B (Na₂SO₄):';
        }
      }
      resetReactionVisuals();
    };

    if (rxGasRadio) rxGasRadio.addEventListener('change', updateReactionLabels);
    if (rxPptRadio) rxPptRadio.addEventListener('change', updateReactionLabels);

    // Toggle Sistem Tertutup vs Terbuka
    if (btnClosed && btnOpen) {
      btnClosed.addEventListener('click', () => {
        this.lavState.isClosed = true;
        btnClosed.classList.add('active');
        btnOpen.classList.remove('active');
        if (stopper) stopper.style.transform = 'translateY(0)';
        if (fumes) fumes.style.opacity = '0';
        resetReactionVisuals();
      });

      btnOpen.addEventListener('click', () => {
        this.lavState.isClosed = false;
        btnOpen.classList.add('active');
        btnClosed.classList.remove('active');
        if (stopper) stopper.style.transform = 'translateY(-30px)';
        if (balloon) balloon.style.opacity = '0';
        resetReactionVisuals();
      });
    }

    // Reset Visuals
    const resetReactionVisuals = () => {
      this.lavState.hasMixed = false;
      if (balloon) balloon.style.opacity = '0';
      if (fumes) fumes.style.opacity = '0';
      if (bubbles) bubbles.style.opacity = '0';
      if (precipitate) {
        precipitate.style.opacity = '0';
        precipitate.style.height = '0px';
      }
      if (statusChip) {
        statusChip.textContent = 'Siap Uji Reaksi';
        statusChip.style.background = '#e0f2fe';
        statusChip.style.color = '#0369a1';
      }
      updateScaleBeforeReaction();

      if (obsLog) {
        obsLog.innerHTML = `
          <div class="alert-tip-icon">💡</div>
          <div class="alert-tip-content">
            <strong>Kondisi Awal:</strong> Labu Erlenmeyer berisi reaktan sebelum dicampur. Total massa reaktan dan wadah terukur tepat pada neraca digital. Klik <strong>"🧪 Reaksikan Zat"</strong> untuk mengamati pembuktian Hukum Lavoisier!
          </div>
        `;
      }
    };

    if (btnReset) btnReset.addEventListener('click', resetReactionVisuals);

    // Reaksikan Zat
    if (btnMix) {
      btnMix.addEventListener('click', () => {
        if (this.lavState.hasMixed) return;
        this.lavState.hasMixed = true;

        const r1 = parseFloat(sliderR1.value) || 50;
        const r2 = parseFloat(sliderR2.value) || 15;
        const initialTotal = flaskBaseTare + r1 + r2;

        if (statusChip) {
          statusChip.textContent = 'Reaksi Kimia Berlangsung...';
          statusChip.style.background = '#fef3c7';
          statusChip.style.color = '#b45309';
        }

        // Animasi Gelembung
        if (bubbles) bubbles.style.opacity = '1';

        setTimeout(() => {
          if (this.lavState.rx === 'gas') {
            // Reaksi Pembentukan Gas CO2
            if (this.lavState.isClosed) {
              // Sistem Tertutup: Gas CO2 tertahan di dalam wadah
              if (balloon) {
                balloon.style.opacity = '0.92';
                balloon.style.transition = 'all 0.8s ease';
                balloon.setAttribute('rx', '32');
                balloon.setAttribute('ry', '22');
              }
              if (fumes) fumes.style.opacity = '0';

              const finalMass = initialTotal;
              if (scaleDisplay) scaleDisplay.textContent = `${finalMass.toFixed(2)} g`;

              if (statusChip) {
                statusChip.textContent = 'Reaksi Selesai (Massa Kekal)';
                statusChip.style.background = '#dcfce7';
                statusChip.style.color = '#166534';
              }

              if (obsLog) {
                obsLog.innerHTML = `
                  <div style="background:#f0fdf4; border:1px solid #86efac; padding:0.9rem; border-radius:10px; color:#166534; font-size:0.88rem; line-height:1.6;">
                    <div style="font-weight:800; font-size:1rem; margin-bottom:0.4rem;">✅ HASIL OBSERVASI (SISTEM TERTUTUP - GAS CO₂):</div>
                    • Reaksi: <code>CH₃COOH (aq) + NaHCO₃ (s) → CH₃COONa (aq) + H₂O (l) + CO₂ (g)↑</code><br>
                    • Massa Sebelum Reaksi: <strong>${initialTotal.toFixed(2)} gram</strong><br>
                    • Massa Sesudah Reaksi: <strong>${finalMass.toFixed(2)} gram</strong> (Δm = 0.00 gram)<br>
                    • <strong>Fenomena:</strong> Gas CO₂ terbentuk dan tertahan oleh sumbat karet/balon yang mengembang.<br>
                    • <strong>KESIMPULAN:</strong> <em>Hukum Kekekalan Massa Lavoisier TERBUKTI MUTLAK! Tidak ada massa materi yang hilang atau tercipta baru.</em>
                  </div>
                `;
              }
            } else {
              // Sistem Terbuka: Gas CO2 keluar mendesis
              if (fumes) fumes.style.opacity = '1';
              if (balloon) balloon.style.opacity = '0';

              // Hitung massa gas CO2 yang lepas (proporsional terhadap NaHCO3)
              const gasEscaped = (r2 * 0.52).toFixed(2);
              const finalMass = initialTotal - parseFloat(gasEscaped);

              if (scaleDisplay) scaleDisplay.textContent = `${finalMass.toFixed(2)} g`;

              if (statusChip) {
                statusChip.textContent = 'Reaksi Selesai (Gas Terlepas)';
                statusChip.style.background = '#ffe4e6';
                statusChip.style.color = '#9f1239';
              }

              if (obsLog) {
                obsLog.innerHTML = `
                  <div style="background:#fff1f2; border:1px solid #fecdd3; padding:0.9rem; border-radius:10px; color:#991b1b; font-size:0.88rem; line-height:1.6;">
                    <div style="font-weight:800; font-size:1rem; margin-bottom:0.4rem;">⚠️ HASIL OBSERVASI (SISTEM TERBUKA - GAS CO₂ LEPAS):</div>
                    • Massa Sebelum Reaksi: <strong>${initialTotal.toFixed(2)} gram</strong><br>
                    • Massa Terukur Sesudah Reaksi: <strong>${finalMass.toFixed(2)} gram</strong> (Tampak berkurang <strong>-${gasEscaped} gram</strong>)<br>
                    • <strong>Analisis Ilmiah:</strong> Massa pada neraca tampak berkurang BUKAN karena atom hilang, melainkan gas CO₂ yang terbentuk terbang keluar ke udara bebas!<br>
                    • <strong>KESIMPULAN:</strong> <em>Hukum Kekekalan Massa Lavoisier HANYA berlaku mutlak pada SISTEM TERTUTUP.</em>
                  </div>
                `;
              }
            }
          } else {
            // Reaksi Pembentukan Endapan BaSO4 (Tanpa Fasa Gas)
            if (precipitate) {
              precipitate.style.opacity = '1';
              precipitate.style.height = '12px';
              precipitate.style.transition = 'height 1s ease';
            }
            if (fumes) fumes.style.opacity = '0';

            const finalMass = initialTotal;
            if (scaleDisplay) scaleDisplay.textContent = `${finalMass.toFixed(2)} g`;

            if (statusChip) {
              statusChip.textContent = 'Reaksi Selesai (Endapan Putih Terbentuk)';
              statusChip.style.background = '#dcfce7';
              statusChip.style.color = '#166534';
            }

            if (obsLog) {
              obsLog.innerHTML = `
                <div style="background:#f0fdf4; border:1px solid #86efac; padding:0.9rem; border-radius:10px; color:#166534; font-size:0.88rem; line-height:1.6;">
                  <div style="font-weight:800; font-size:1rem; margin-bottom:0.4rem;">✅ HASIL OBSERVASI (REAKSI ENDAPAN BaSO₄):</div>
                  • Reaksi: <code>BaCl₂ (aq) + Na₂SO₄ (aq) → BaSO₄ (s)↓ + 2 NaCl (aq)</code><br>
                  • Massa Sebelum Reaksi: <strong>${initialTotal.toFixed(2)} gram</strong><br>
                  • Massa Sesudah Reaksi: <strong>${finalMass.toFixed(2)} gram</strong> (Δm = 0.00 gram)<br>
                  • <strong>Fenomena:</strong> Terbentuk kristal endapan putih Barium Sulfat yang mengendap di dasar labu. Karena tidak ada gas yang terbentuk, massa tetap sama baik di sistem tertutup maupun terbuka!<br>
                  • <strong>KESIMPULAN:</strong> <em>Hukum Kekekalan Massa Lavoisier TERBUKTI BENAR.</em>
                </div>
              `;
            }
          }
        }, 600);
      });
    }

    // Catat ke Tabel Praktikum Lavoisier
    if (btnLog) {
      btnLog.addEventListener('click', () => {
        if (!this.lavState.hasMixed) {
          alert("Silakan klik '🧪 Reaksikan Zat' terlebih dahulu sebelum mencatat data!");
          return;
        }

        const r1 = parseFloat(sliderR1.value) || 50;
        const r2 = parseFloat(sliderR2.value) || 15;
        const initialTotal = flaskBaseTare + r1 + r2;
        const isGas = this.lavState.rx === 'gas';
        const isClosed = this.lavState.isClosed;

        let finalMass = initialTotal;
        let delta = 0;
        let statusVerdict = '✅ Kekal (Lavoisier Sahih)';

        if (isGas && !isClosed) {
          const gasEscaped = (r2 * 0.52);
          finalMass = initialTotal - gasEscaped;
          delta = -gasEscaped;
          statusVerdict = '⚠️ Berkurang (Gas CO₂ Lepas)';
        }

        const runRecord = {
          id: this.lavDataHistory.length + 1,
          rxName: isGas ? 'Gas CO₂ (Cuka + Soda)' : 'Endapan BaSO₄ (BaCl₂ + Na₂SO₄)',
          system: isClosed ? 'Sistem Tertutup' : 'Sistem Terbuka',
          mInit: initialTotal.toFixed(2),
          mFinal: finalMass.toFixed(2),
          delta: delta === 0 ? '0.00 g' : `${delta.toFixed(2)} g`,
          verdict: statusVerdict
        };

        this.lavDataHistory.push(runRecord);
        this.renderLavoisierTable();
      });
    }

    if (btnClearTable) {
      btnClearTable.addEventListener('click', () => {
        this.lavDataHistory = [];
        this.renderLavoisierTable();
      });
    }

    // Set initial display
    updateScaleBeforeReaction();
  }

  renderLavoisierTable() {
    const tbody = document.getElementById('lav2-tbody');
    if (!tbody) return;

    if (this.lavDataHistory.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-row-placeholder">
          <td colspan="7">Belum ada data pengamatan tersimpan. Lakukan eksperimen lalu klik "Simpan ke Tabel".</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.lavDataHistory.map(row => `
      <tr>
        <td><strong>#${row.id}</strong></td>
        <td>${row.rxName}</td>
        <td><span class="badge-tag">${row.system}</span></td>
        <td><strong>${row.mInit} g</strong></td>
        <td><strong>${row.mFinal} g</strong></td>
        <td style="color:${row.delta.startsWith('-') ? '#e11d48' : '#059669'}; font-weight:700;">${row.delta}</td>
        <td><strong style="color:${row.verdict.startsWith('✅') ? '#059669' : '#d97706'};">${row.verdict}</strong></td>
      </tr>
    `).join('');
  }

  /* =============================================================
     B. ENGINE PRAKTIKUM VIRTUAL HUKUM PROUST (PERBANDINGAN TETAP)
     ============================================================= */
  initProustLab() {
    const selectRx = document.getElementById('proust-select-reaction');
    const sliderA = document.getElementById('proust-slider-a');
    const sliderB = document.getElementById('proust-slider-b');
    const badgeA = document.getElementById('proust-val-badge-a');
    const badgeB = document.getElementById('proust-val-badge-b');
    const labelA = document.getElementById('proust-label-a');
    const labelB = document.getElementById('proust-label-b');
    const txtElemA = document.getElementById('proust-txt-elem-a');
    const txtElemB = document.getElementById('proust-txt-elem-b');
    const txtProduct = document.getElementById('proust-txt-product');
    const compoundFormula = document.getElementById('proust-compound-formula');
    const compoundDesc = document.getElementById('proust-compound-desc');
    const statusChip = document.getElementById('proust-status-chip');
    const flame = document.getElementById('proust-flame');
    const smoke = document.getElementById('proust-smoke');
    const solidMatter = document.getElementById('proust-solid-matter');
    const btnHeat = document.getElementById('btn-proust-heat');
    const btnReset = document.getElementById('btn-proust-reset');
    const btnLog = document.getElementById('btn-proust-log');
    const btnClearTable = document.getElementById('btn-proust-clear-table');
    const ratioProof = document.getElementById('proust-ratio-result');

    // Preset Buttons
    const btnExact = document.getElementById('btn-proust-pre-exact');
    const btnExcessA = document.getElementById('btn-proust-pre-excess-a');
    const btnExcessB = document.getElementById('btn-proust-pre-excess-b');

    // Konfigurasi Reaksi Proust
    const PROUST_REACTIONS = {
      fes: {
        name: "Besi(II) Sulfida (FeS)",
        elemA: "Besi (Fe)",
        elemB: "Belerang (S)",
        ratioA: 7,
        ratioB: 4,
        defA: 14.0,
        defB: 8.0,
        maxA: 35,
        maxB: 35,
        colorBefore: "#94a3b8",
        colorAfter: "#1e293b",
        formulaStr: "Fe + S → FeS",
        descStr: "Rasio Massa Teoretis Fe : S = 7 : 4 (1.75 : 1)"
      },
      h2o: {
        name: "Air (H₂O)",
        elemA: "Hidrogen (H₂)",
        elemB: "Oksigen (O₂)",
        ratioA: 1,
        ratioB: 8,
        defA: 2.0,
        defB: 16.0,
        maxA: 10,
        maxB: 40,
        colorBefore: "#e2e8f0",
        colorAfter: "#38bdf8",
        formulaStr: "2 H₂ + O₂ → 2 H₂O",
        descStr: "Rasio Massa Teoretis H : O = 1 : 8 (0.125 : 1)"
      },
      mgo: {
        name: "Magnesium Oksida (MgO)",
        elemA: "Magnesium (Mg)",
        elemB: "Oksigen (O₂)",
        ratioA: 3,
        ratioB: 2,
        defA: 12.0,
        defB: 8.0,
        maxA: 30,
        maxB: 30,
        colorBefore: "#cbd5e1",
        colorAfter: "#f8fafc",
        formulaStr: "2 Mg + O₂ → 2 MgO",
        descStr: "Rasio Massa Teoretis Mg : O = 3 : 2 (1.5 : 1)"
      }
    };

    const updateReactionConfig = () => {
      const key = selectRx ? selectRx.value : 'fes';
      const config = PROUST_REACTIONS[key] || PROUST_REACTIONS.fes;
      this.proustState.rx = key;

      if (labelA) labelA.textContent = `Massa ${config.elemA}:`;
      if (labelB) labelB.textContent = `Massa ${config.elemB}:`;
      if (txtElemA) txtElemA.textContent = `${config.elemA} Bereaksi:`;
      if (txtElemB) txtElemB.textContent = `${config.elemB} Bereaksi:`;
      if (txtProduct) txtProduct.textContent = `Massa Produk (${config.name}):`;
      if (compoundFormula) compoundFormula.textContent = config.formulaStr;
      if (compoundDesc) compoundDesc.textContent = config.descStr;

      if (sliderA) {
        sliderA.max = config.maxA;
        sliderA.value = config.defA;
        if (badgeA) badgeA.textContent = `${config.defA.toFixed(1)} g`;
      }
      if (sliderB) {
        sliderB.max = config.maxB;
        sliderB.value = config.defB;
        if (badgeB) badgeB.textContent = `${config.defB.toFixed(1)} g`;
      }

      resetProustVisuals();
    };

    if (selectRx) selectRx.addEventListener('change', updateReactionConfig);

    // Slider Listeners
    if (sliderA && badgeA) {
      sliderA.addEventListener('input', () => {
        badgeA.textContent = `${parseFloat(sliderA.value).toFixed(1)} g`;
        resetProustVisuals();
      });
    }

    if (sliderB && badgeB) {
      sliderB.addEventListener('input', () => {
        badgeB.textContent = `${parseFloat(sliderB.value).toFixed(1)} g`;
        resetProustVisuals();
      });
    }

    // Presets
    if (btnExact) {
      btnExact.addEventListener('click', () => {
        const config = PROUST_REACTIONS[this.proustState.rx];
        sliderA.value = config.ratioA * 2;
        sliderB.value = config.ratioB * 2;
        badgeA.textContent = `${parseFloat(sliderA.value).toFixed(1)} g`;
        badgeB.textContent = `${parseFloat(sliderB.value).toFixed(1)} g`;
        resetProustVisuals();
      });
    }

    if (btnExcessA) {
      btnExcessA.addEventListener('click', () => {
        const config = PROUST_REACTIONS[this.proustState.rx];
        sliderA.value = config.ratioA * 3;
        sliderB.value = config.ratioB * 2;
        badgeA.textContent = `${parseFloat(sliderA.value).toFixed(1)} g`;
        badgeB.textContent = `${parseFloat(sliderB.value).toFixed(1)} g`;
        resetProustVisuals();
      });
    }

    if (btnExcessB) {
      btnExcessB.addEventListener('click', () => {
        const config = PROUST_REACTIONS[this.proustState.rx];
        sliderA.value = config.ratioA * 2;
        sliderB.value = config.ratioB * 3;
        badgeA.textContent = `${parseFloat(sliderA.value).toFixed(1)} g`;
        badgeB.textContent = `${parseFloat(sliderB.value).toFixed(1)} g`;
        resetProustVisuals();
      });
    }

    // Reset Visuals
    const resetProustVisuals = () => {
      this.proustState.hasReacted = false;
      if (flame) flame.style.opacity = '0.2';
      if (smoke) smoke.style.opacity = '0';
      const config = PROUST_REACTIONS[this.proustState.rx];
      if (solidMatter) solidMatter.setAttribute('fill', config.colorBefore);
      if (statusChip) {
        statusChip.textContent = 'Siap Sintesis Senyawa';
        statusChip.style.background = '#e0f2fe';
        statusChip.style.color = '#0369a1';
      }

      document.getElementById('proust-stat-a-reacted').textContent = '0.00 g';
      document.getElementById('proust-stat-b-reacted').textContent = '0.00 g';
      document.getElementById('proust-stat-a-rem').textContent = 'Sisa: 0.00 g';
      document.getElementById('proust-stat-b-rem').textContent = 'Sisa: 0.00 g';
      document.getElementById('proust-stat-product').textContent = '0.00 g';
      document.getElementById('proust-bar-a').style.width = '0%';
      document.getElementById('proust-bar-b').style.width = '0%';
      document.getElementById('proust-bar-product').style.width = '0%';
      if (ratioProof) ratioProof.textContent = 'Belum direaksikan';
    };

    if (btnReset) btnReset.addEventListener('click', resetProustVisuals);

    // Panaskan & Reaksikan
    if (btnHeat) {
      btnHeat.addEventListener('click', () => {
        if (this.proustState.hasReacted) return;
        this.proustState.hasReacted = true;

        const config = PROUST_REACTIONS[this.proustState.rx];
        const mA = parseFloat(sliderA.value) || config.defA;
        const mB = parseFloat(sliderB.value) || config.defB;

        // Nyalakan Api Bunsen
        if (flame) flame.style.opacity = '1';
        if (smoke) smoke.style.opacity = '0.7';
        if (statusChip) {
          statusChip.textContent = 'Pemanasan Reaktor Berlangsung...';
          statusChip.style.background = '#fef3c7';
          statusChip.style.color = '#b45309';
        }

        setTimeout(() => {
          // Perhitungan Stoikiometri Hukum Proust
          const R = config.ratioA / config.ratioB;
          let reactedA = 0;
          let reactedB = 0;
          let remA = 0;
          let remB = 0;

          if ((mA / mB) > R) {
            // Reaktan B adalah pereaksi pembatas (habis)
            reactedB = mB;
            reactedA = mB * R;
            remA = mA - reactedA;
            remB = 0;
          } else if ((mA / mB) < R) {
            // Reaktan A adalah pereaksi pembatas (habis)
            reactedA = mA;
            reactedB = mA / R;
            remA = 0;
            remB = mB - reactedB;
          } else {
            // Rasio stoikiometris tepat pas
            reactedA = mA;
            reactedB = mB;
            remA = 0;
            remB = 0;
          }

          const productMass = reactedA + reactedB;

          // Animasi produk senyawa
          if (solidMatter) solidMatter.setAttribute('fill', config.colorAfter);
          if (statusChip) {
            statusChip.textContent = `Reaksi Selesai (${config.name} Terbentuk)`;
            statusChip.style.background = '#dcfce7';
            statusChip.style.color = '#166534';
          }

          // Update Bar & Statistik
          document.getElementById('proust-stat-a-reacted').textContent = `${reactedA.toFixed(2)} g`;
          document.getElementById('proust-stat-b-reacted').textContent = `${reactedB.toFixed(2)} g`;
          document.getElementById('proust-stat-a-rem').textContent = `Sisa: ${remA.toFixed(2)} g`;
          document.getElementById('proust-stat-b-rem').textContent = `Sisa: ${remB.toFixed(2)} g`;
          document.getElementById('proust-stat-product').textContent = `${productMass.toFixed(2)} g`;

          document.getElementById('proust-bar-a').style.width = `${Math.min(100, (reactedA / mA) * 100)}%`;
          document.getElementById('proust-bar-b').style.width = `${Math.min(100, (reactedB / mB) * 100)}%`;
          document.getElementById('proust-bar-product').style.width = '100%';

          const actualRatioStr = `${(reactedA / reactedB).toFixed(2)} : 1`;
          const theoreticalRatioStr = `${(config.ratioA / config.ratioB).toFixed(2)} : 1`;

          if (ratioProof) {
            let noteSisa = "Reaktan habis bereaksi tanpa sisa.";
            if (remA > 0.05) noteSisa = `Terdapat zat sisa: ${remA.toFixed(2)} g ${config.elemA}.`;
            if (remB > 0.05) noteSisa = `Terdapat zat sisa: ${remB.toFixed(2)} g ${config.elemB}.`;

            ratioProof.innerHTML = `
              <span style="color:#059669; font-weight:800;">
                ${reactedA.toFixed(2)} g (${config.elemA}) : ${reactedB.toFixed(2)} g (${config.elemB}) = ${config.ratioA} : ${config.ratioB} (${actualRatioStr})
              </span><br>
              <small style="color:var(--text-secondary); font-size:0.82rem;">${noteSisa} <strong>Rasio massa yang bereaksi SELALU KONSTAN membuktikan Hukum Proust!</strong></small>
            `;
          }
        }, 700);
      });
    }

    // Catat ke Tabel Praktikum Proust
    if (btnLog) {
      btnLog.addEventListener('click', () => {
        if (!this.proustState.hasReacted) {
          alert("Silakan klik '🔥 Panaskan & Reaksikan' terlebih dahulu sebelum mencatat data!");
          return;
        }

        const config = PROUST_REACTIONS[this.proustState.rx];
        const mA = parseFloat(sliderA.value) || config.defA;
        const mB = parseFloat(sliderB.value) || config.defB;

        const R = config.ratioA / config.ratioB;
        let reactedA = 0;
        let reactedB = 0;
        let remText = "Tidak ada sisa";

        if ((mA / mB) > R) {
          reactedB = mB;
          reactedA = mB * R;
          const remA = mA - reactedA;
          remText = `${remA.toFixed(2)} g ${config.elemA}`;
        } else if ((mA / mB) < R) {
          reactedA = mA;
          reactedB = mA / R;
          const remB = mB - reactedB;
          remText = `${remB.toFixed(2)} g ${config.elemB}`;
        } else {
          reactedA = mA;
          reactedB = mB;
        }

        const productMass = reactedA + reactedB;

        const runRecord = {
          id: this.proustDataHistory.length + 1,
          compound: config.name,
          initA: `${mA.toFixed(1)} g (${config.elemA})`,
          initB: `${mB.toFixed(1)} g (${config.elemB})`,
          product: `${productMass.toFixed(2)} g`,
          excess: remText,
          ratio: `${config.ratioA} : ${config.ratioB} (Konstan)`,
          status: '✅ Terbukti Proust'
        };

        this.proustDataHistory.push(runRecord);
        this.renderProustTable();
      });
    }

    if (btnClearTable) {
      btnClearTable.addEventListener('click', () => {
        this.proustDataHistory = [];
        this.renderProustTable();
      });
    }

    updateReactionConfig();
  }

  renderProustTable() {
    const tbody = document.getElementById('proust-tbody');
    if (!tbody) return;

    if (this.proustDataHistory.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-row-placeholder">
          <td colspan="8">Belum ada data pengamatan. Variasikan massa reaktan lalu klik "Catat ke Tabel".</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.proustDataHistory.map(row => `
      <tr>
        <td><strong>#${row.id}</strong></td>
        <td>${row.compound}</td>
        <td>${row.initA}</td>
        <td>${row.initB}</td>
        <td><strong style="color:#059669;">${row.product}</strong></td>
        <td><span class="badge-tag">${row.excess}</span></td>
        <td><strong style="color:var(--accent-navy);">${row.ratio}</strong></td>
        <td><strong style="color:#059669;">${row.status}</strong></td>
      </tr>
    `).join('');
  }

  /* =============================================================
     C. ENGINE PRAKTIKUM VIRTUAL HUKUM DALTON (KELIPATAN BERGANDA)
     ============================================================= */
  initDaltonLab() {
    const selectSys = document.getElementById('dalton-select-system');
    const sliderRef = document.getElementById('dalton-slider-ref');
    const badgeRef = document.getElementById('dalton-val-ref-mass');
    const labelRef = document.getElementById('dalton-label-ref-mass');
    const ch1Formula = document.getElementById('dalton-ch1-formula');
    const ch2Formula = document.getElementById('dalton-ch2-formula');
    const statusChip = document.getElementById('dalton-status-chip');
    const btnRun = document.getElementById('btn-dalton-run');
    const btnReset = document.getElementById('btn-dalton-reset');

    const massC1E1 = document.getElementById('dalton-mass-c1-e1');
    const massC1E2 = document.getElementById('dalton-mass-c1-e2');
    const massC2E1 = document.getElementById('dalton-mass-c2-e1');
    const massC2E2 = document.getElementById('dalton-mass-c2-e2');

    const txtRefFixed = document.getElementById('dalton-txt-ref-fixed');
    const txtE2Comp = document.getElementById('dalton-txt-e2-comp');
    const txtRatioReduced = document.getElementById('dalton-txt-ratio-reduced');

    const DALTON_SYSTEMS = {
      c_o: {
        elem1: "Karbon (C)",
        elem2: "Oksigen (O)",
        baseRef: 12,
        c1Name: "Karbon Monoksida (CO)",
        c2Name: "Karbon Dioksida (CO₂)",
        c1E2Ratio: 16,
        c2E2Ratio: 32,
        reducedRatio: "1 : 2",
        svg1: `
          <svg viewBox="0 0 120 100" class="molecule-svg">
            <circle cx="45" cy="50" r="22" fill="#1e293b" stroke="#475569" stroke-width="2"/>
            <text x="45" y="55" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">C</text>
            <line x1="60" y1="50" x2="75" y2="50" stroke="#94a3b8" stroke-width="4"/>
            <circle cx="85" cy="50" r="18" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="85" y="55" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">O</text>
          </svg>
        `,
        svg2: `
          <svg viewBox="0 0 140 100" class="molecule-svg">
            <circle cx="28" cy="50" r="18" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="28" y="55" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">O</text>
            <line x1="42" y1="50" x2="56" y2="50" stroke="#94a3b8" stroke-width="4"/>
            <circle cx="70" cy="50" r="22" fill="#1e293b" stroke="#475569" stroke-width="2"/>
            <text x="70" y="55" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">C</text>
            <line x1="84" y1="50" x2="98" y2="50" stroke="#94a3b8" stroke-width="4"/>
            <circle cx="112" cy="50" r="18" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="112" y="55" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">O</text>
          </svg>
        `
      },
      n_o: {
        elem1: "Nitrogen (N)",
        elem2: "Oksigen (O)",
        baseRef: 14,
        c1Name: "Nitrogen Monoksida (NO)",
        c2Name: "Nitrogen Dioksida (NO₂)",
        c1E2Ratio: 16,
        c2E2Ratio: 32,
        reducedRatio: "1 : 2",
        svg1: `
          <svg viewBox="0 0 120 100" class="molecule-svg">
            <circle cx="45" cy="50" r="20" fill="#2563eb" stroke="#1d4ed8" stroke-width="2"/>
            <text x="45" y="55" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">N</text>
            <line x1="60" y1="50" x2="75" y2="50" stroke="#94a3b8" stroke-width="4"/>
            <circle cx="85" cy="50" r="18" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="85" y="55" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">O</text>
          </svg>
        `,
        svg2: `
          <svg viewBox="0 0 140 100" class="molecule-svg">
            <circle cx="28" cy="50" r="18" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="28" y="55" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">O</text>
            <line x1="42" y1="50" x2="56" y2="50" stroke="#94a3b8" stroke-width="4"/>
            <circle cx="70" cy="50" r="20" fill="#2563eb" stroke="#1d4ed8" stroke-width="2"/>
            <text x="70" y="55" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">N</text>
            <line x1="84" y1="50" x2="98" y2="50" stroke="#94a3b8" stroke-width="4"/>
            <circle cx="112" cy="50" r="18" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="112" y="55" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">O</text>
          </svg>
        `
      },
      s_o: {
        elem1: "Belerang (S)",
        elem2: "Oksigen (O)",
        baseRef: 32,
        c1Name: "Belerang Dioksida (SO₂)",
        c2Name: "Belerang Trioksida (SO₃)",
        c1E2Ratio: 32,
        c2E2Ratio: 48,
        reducedRatio: "2 : 3",
        svg1: `
          <svg viewBox="0 0 140 100" class="molecule-svg">
            <circle cx="30" cy="50" r="16" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="30" y="54" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">O</text>
            <line x1="44" y1="50" x2="56" y2="50" stroke="#94a3b8" stroke-width="3"/>
            <circle cx="70" cy="50" r="22" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
            <text x="70" y="55" fill="#1e293b" font-size="12" font-weight="700" text-anchor="middle">S</text>
            <line x1="84" y1="50" x2="96" y2="50" stroke="#94a3b8" stroke-width="3"/>
            <circle cx="110" cy="50" r="16" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="110" y="54" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">O</text>
          </svg>
        `,
        svg2: `
          <svg viewBox="0 0 140 100" class="molecule-svg">
            <circle cx="70" cy="24" r="15" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="70" y="28" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">O</text>
            <line x1="70" y1="36" x2="70" y2="46" stroke="#94a3b8" stroke-width="3"/>
            <circle cx="70" cy="58" r="20" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
            <text x="70" y="63" fill="#1e293b" font-size="12" font-weight="700" text-anchor="middle">S</text>
            <line x1="56" y1="68" x2="42" y2="78" stroke="#94a3b8" stroke-width="3"/>
            <circle cx="34" cy="82" r="15" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="34" y="86" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">O</text>
            <line x1="84" y1="68" x2="98" y2="78" stroke="#94a3b8" stroke-width="3"/>
            <circle cx="106" cy="82" r="15" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
            <text x="106" y="86" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">O</text>
          </svg>
        `
      }
    };

    const updateDaltonUI = () => {
      const key = selectSys ? selectSys.value : 'c_o';
      const sys = DALTON_SYSTEMS[key] || DALTON_SYSTEMS.c_o;
      this.daltonState.system = key;

      if (labelRef) labelRef.textContent = `Massa Unsur Pertama yang Ditetapkan (${sys.elem1}):`;
      if (ch1Formula) ch1Formula.textContent = sys.c1Name;
      if (ch2Formula) ch2Formula.textContent = sys.c2Name;

      // Update Slider bounds
      if (sliderRef) {
        sliderRef.min = sys.baseRef;
        sliderRef.max = sys.baseRef * 3;
        sliderRef.step = sys.baseRef;
        sliderRef.value = sys.baseRef;
        if (badgeRef) badgeRef.textContent = `${sys.baseRef.toFixed(1)} g`;
      }

      // Update Molecule SVGs
      const mol1 = document.getElementById('dalton-mol-1');
      const mol2 = document.getElementById('dalton-mol-2');
      if (mol1) mol1.innerHTML = sys.svg1;
      if (mol2) mol2.innerHTML = sys.svg2;

      resetDaltonCalculations();
    };

    if (selectSys) selectSys.addEventListener('change', updateDaltonUI);

    if (sliderRef && badgeRef) {
      sliderRef.addEventListener('input', () => {
        badgeRef.textContent = `${parseFloat(sliderRef.value).toFixed(1)} g`;
        resetDaltonCalculations();
      });
    }

    const resetDaltonCalculations = () => {
      this.daltonState.hasSynthesized = false;
      const key = this.daltonState.system;
      const sys = DALTON_SYSTEMS[key] || DALTON_SYSTEMS.c_o;
      const currentRefMass = parseFloat(sliderRef.value) || sys.baseRef;
      const multiplier = currentRefMass / sys.baseRef;

      const mE2Ch1 = sys.c1E2Ratio * multiplier;
      const mE2Ch2 = sys.c2E2Ratio * multiplier;

      if (massC1E1) massC1E1.textContent = `${currentRefMass.toFixed(1)} g`;
      if (massC1E2) massC1E2.textContent = `${mE2Ch1.toFixed(1)} g`;
      if (massC2E1) massC2E1.textContent = `${currentRefMass.toFixed(1)} g`;
      if (massC2E2) massC2E2.textContent = `${mE2Ch2.toFixed(1)} g`;

      if (txtRefFixed) txtRefFixed.textContent = `Massa ${sys.elem1} = ${currentRefMass.toFixed(1)} gram`;
      if (txtE2Comp) txtE2Comp.textContent = `${mE2Ch1.toFixed(1)} g (${sys.c1Name.split(' ')[0]}) : ${mE2Ch2.toFixed(1)} g (${sys.c2Name.split(' ')[0]})`;
      if (txtRatioReduced) txtRatioReduced.textContent = sys.reducedRatio;

      if (statusChip) {
        statusChip.textContent = 'Siap Uji Senyawa Ganda';
        statusChip.style.background = '#e0f2fe';
        statusChip.style.color = '#0369a1';
      }
    };

    if (btnReset) btnReset.addEventListener('click', resetDaltonCalculations);

    // Jalankan Sintesis Paralel
    if (btnRun) {
      btnRun.addEventListener('click', () => {
        this.daltonState.hasSynthesized = true;
        const key = this.daltonState.system;
        const sys = DALTON_SYSTEMS[key] || DALTON_SYSTEMS.c_o;

        if (statusChip) {
          statusChip.textContent = 'Sintesis Dua Senyawa Berlangsung...';
          statusChip.style.background = '#fef3c7';
          statusChip.style.color = '#b45309';
        }

        const mol1 = document.getElementById('dalton-mol-1');
        const mol2 = document.getElementById('dalton-mol-2');
        if (mol1) mol1.style.transform = 'scale(1.08)';
        if (mol2) mol2.style.transform = 'scale(1.08)';

        setTimeout(() => {
          if (mol1) mol1.style.transform = 'scale(1)';
          if (mol2) mol2.style.transform = 'scale(1)';

          if (statusChip) {
            statusChip.textContent = 'Sintesis Paralel Berhasil!';
            statusChip.style.background = '#dcfce7';
            statusChip.style.color = '#166534';
          }

          resetDaltonCalculations();
        }, 600);
      });
    }

    // Mini Quiz Dalton Interaktif
    const quizOptions = document.querySelectorAll('.btn-quiz-opt');
    const feedbackBox = document.getElementById('dalton-quiz-feedback');
    quizOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.dataset.opt;
        if (feedbackBox) {
          feedbackBox.style.display = 'block';
          if (val === '1:2') {
            feedbackBox.className = 'quiz-feedback-box success';
            feedbackBox.innerHTML = `
              <strong>🎉 TEPAT SEKALI!</strong><br>
              Untuk massa Karbon berapapun (termasuk 24 g), rasio Oksigen pada CO : CO₂ adalah 32g : 64g = <strong>1 : 2</strong>. Inilah hakikat <em>Hukum Kelipatan Berganda Dalton</em>!
            `;
          } else {
            feedbackBox.className = 'quiz-feedback-box error';
            feedbackBox.innerHTML = `
              <strong>Kurang tepat.</strong> Perhatikan: jika C = 24g, massa O pada CO = 32g dan pada CO₂ = 64g. Rasio 32 : 64 jika disederhanakan adalah <strong>1 : 2</strong>.
            `;
          }
        }
      });
    });

    updateDaltonUI();
  }

  /* =============================================================
     D. KALKULATOR TEORI GAS (AVOGADRO & GAY-LUSSAC)
     ============================================================= */
  setupLawsCalculators() {
    // 1. Kalkulator Volume Gas Avogadro (STP)
    const btnCalcAvogadro = document.getElementById('btn-calc-avogadro');
    if (btnCalcAvogadro) {
      btnCalcAvogadro.addEventListener('click', () => {
        const mol = parseFloat(document.getElementById('input-avo-mol').value) || 0;
        const volume = (mol * 22.4).toFixed(2);
        const molecules = (mol * 6.022).toFixed(3);
        const resBox = document.getElementById('res-calc-avogadro');
        if (resBox) {
          resBox.innerHTML = `
            <div style="background:#f0f9ff; border:1px solid #7dd3fc; padding:0.75rem; border-radius:8px; margin-top:0.6rem;">
              <strong>Volume Gas pada STP (0°C, 1 atm):</strong> <span style="color:#0284c7; font-weight:800;">${volume} Liter</span><br>
              <strong>Jumlah Partikel/Molekul:</strong> ${molecules} × 10²³ molekul
            </div>
          `;
        }
      });
    }

    // 2. Kalkulator Volume Gas Gay-Lussac
    const btnCalcGayLussac = document.getElementById('btn-calc-gaylussac');
    if (btnCalcGayLussac) {
      btnCalcGayLussac.addEventListener('click', () => {
        const volH2 = parseFloat(document.getElementById('input-gl-vol').value) || 0;
        // 2 H2 (g) + O2 (g) -> 2 H2O (g)
        const volO2 = (volH2 / 2).toFixed(2);
        const volH2O = volH2.toFixed(2);
        const resBox = document.getElementById('res-calc-gaylussac');
        if (resBox) {
          resBox.innerHTML = `
            <div style="background:#f0fdf4; border:1px solid #86efac; padding:0.75rem; border-radius:8px; margin-top:0.6rem; color:#166534;">
              <strong>Volume Gas O₂ yang Dibutuhkan:</strong> <span style="color:#059669; font-weight:800;">${volO2} Liter</span> (½ × Volume H₂)<br>
              <strong>Volume Uap Air (H₂O) yang Dihasilkan:</strong> <span style="color:#059669; font-weight:800;">${volH2O} Liter</span><br>
              <small>Perbandingan volume H₂ : O₂ : H₂O = 2 : 1 : 2 (Sesuai koefisien reaksi Gay-Lussac!)</small>
            </div>
          `;
        }
      });
    }
  }

  /* =============================================================
     E. ALAT PERAGA ATOM & MOLEKUL MOLYMOD 3D (WEBGL THREE.JS)
     ============================================================= */
  initMolymodModule() {
    // Tombol pintas dari Simulator Atom Bohr ke Molymod
    const btnBohrToMoly = document.getElementById('btn-bohr-to-molymod');
    if (btnBohrToMoly) {
      btnBohrToMoly.addEventListener('click', () => {
        const molyTab = document.querySelector('[data-target="materi-view-molymod"]');
        if (molyTab) molyTab.click();
        this.selectMatchingMolymod(this.currentAtomKey);
      });
    }

    this.renderMolymodPresets();
    this.setupMolymodControls();
  }

  renderMolymodPresets() {
    const mount = document.getElementById('molymod-preset-mount');
    if (!mount) return;

    const keys = Object.keys(MOLYMOD_DATA);
    mount.innerHTML = keys.map(k => {
      const item = MOLYMOD_DATA[k];
      const isHidden = (this.molymod.filterCategory !== 'all' && item.category !== this.molymod.filterCategory);
      return `
        <div class="moly-card ${k === this.molymod.currentMoleculeId ? 'active' : ''} ${isHidden ? 'hidden' : ''}" data-molid="${k}">
          <div class="moly-card-header">
            <span class="moly-card-formula">${item.formula}</span>
            <span class="moly-card-cat">${item.category === 'organic' ? 'Organik' : (item.category === 'atoms' ? 'Bola Tunggal' : 'Anorganik')}</span>
          </div>
          <div class="moly-card-name">${item.name}</div>
          <div class="moly-card-vsepr">${item.vsepr.split('(')[0]}</div>
        </div>
      `;
    }).join('');

    // Listener klik kartu molekul
    mount.querySelectorAll('.moly-card').forEach(card => {
      card.addEventListener('click', () => {
        const molId = card.dataset.molid;
        if (molId) {
          this.selectMolymodMolecule(molId);
        }
      });
    });

    // Update kartu info detail pertama kali
    this.updateMolymodInfoCard(this.molymod.currentMoleculeId);
  }

  filterMolymodPresets(category) {
    this.molymod.filterCategory = category;
    document.querySelectorAll('.moly-card').forEach(card => {
      const molId = card.dataset.molid;
      const item = MOLYMOD_DATA[molId];
      if (!item) return;
      if (category === 'all' || item.category === category) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  selectMolymodMolecule(molId) {
    if (!MOLYMOD_DATA[molId]) return;
    this.molymod.currentMoleculeId = molId;

    document.querySelectorAll('.moly-card').forEach(c => {
      if (c.dataset.molid === molId) c.classList.add('active');
      else c.classList.remove('active');
    });

    this.loadMolymodMolecule(molId);
    this.updateMolymodInfoCard(molId);
  }

  selectMatchingMolymod(elementSymbol) {
    // Mapping dari atom Bohr ke molekul atau bola atom Molymod
    const map = {
      'H': 'h2',
      'C': 'ch4',
      'N': 'nh3',
      'O': 'h2o',
      'Cl': 'hcl',
      'Na': 'atom_na',
      'S': 'so2',
      'He': 'atom_h',
      'Li': 'atom_na',
      'Mg': 'atom_na',
      'Al': 'atom_c',
      'Si': 'ch4',
      'P': 'atom_n',
      'Ar': 'atom_cl',
      'K': 'atom_na',
      'Ca': 'atom_na'
    };
    const targetMol = map[elementSymbol] || 'h2o';
    this.selectMolymodMolecule(targetMol);
  }

  updateMolymodInfoCard(molId) {
    const data = MOLYMOD_DATA[molId];
    if (!data) return;

    const labelName = document.getElementById('molymod-display-name');
    const labelVsepr = document.getElementById('molymod-vsepr-tag');
    if (labelName) labelName.textContent = data.name;
    if (labelVsepr) labelVsepr.textContent = data.vsepr;

    const infoMount = document.getElementById('molymod-info-mount');
    if (infoMount) {
      infoMount.innerHTML = `
        <div class="moly-info-header">
          <h4>🧪 ${data.name}</h4>
          <span class="moly-badge-tag">${data.vseprCode}</span>
        </div>

        <div class="moly-info-grid">
          <div class="moly-info-pill">
            <strong>Geometri Molekul VSEPR</strong>
            <span style="color:var(--accent-blue);">${data.vsepr}</span>
          </div>
          <div class="moly-info-pill">
            <strong>Tipe Hibridisasi Orbital</strong>
            <span>${data.hybrid}</span>
          </div>
          <div class="moly-info-pill">
            <strong>Polaritas Molekul</strong>
            <span>${data.polarity}</span>
          </div>
          <div class="moly-info-pill">
            <strong>Karakter Ikatan Kimia</strong>
            <span>${data.bondType}</span>
          </div>
        </div>

        <div class="moly-anatomy-box">
          <div style="font-weight:700; color:var(--text-dark); margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
            <span>🔮</span> Aturan Alat Peraga Molymod:
          </div>
          <p style="font-size:0.84rem; color:var(--text-secondary); line-height:1.5;">${data.molymodHoles}</p>
        </div>

        <div class="moly-desc-box">
          <div style="font-weight:700; color:var(--text-dark); margin-bottom:0.35rem;">💡 Fakta Ilmiah & Fungsi:</div>
          <p style="font-size:0.84rem; color:var(--text-primary); line-height:1.5;">${data.desc}</p>
        </div>
      `;
    }
  }

  initMolymodViewer() {
    const container = document.getElementById('molymod-canvas-mount');
    if (!container) return;

    const width = container.clientWidth || 550;
    const height = container.clientHeight || 430;

    // Jika renderer belum ada, bangun Three.js scene
    if (!this.molymod.renderer) {
      if (typeof THREE === 'undefined') {
        console.error("Three.js belum dimuat.");
        return;
      }

      // 1. Scene
      this.molymod.scene = new THREE.Scene();

      // 2. Camera
      this.molymod.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.molymod.camera.position.set(0, 0, 7.8);

      // 3. Renderer
      this.molymod.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.molymod.renderer.setSize(width, height);
      this.molymod.renderer.setPixelRatio(window.devicePixelRatio || 1);
      this.molymod.renderer.shadowMap.enabled = true;
      container.appendChild(this.molymod.renderer.domElement);

      // 4. Pencahayaan (3-point Lighting + Highlights untuk plastik mengilap khas Molymod)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
      this.molymod.scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
      mainLight.position.set(6, 8, 6);
      this.molymod.scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.4);
      fillLight.position.set(-6, -4, -4);
      this.molymod.scene.add(fillLight);

      const rimLight = new THREE.PointLight(0xffffff, 0.6, 20);
      rimLight.position.set(0, 4, 4);
      this.molymod.scene.add(rimLight);

      // 5. Mesh Group
      this.molymod.meshGroup = new THREE.Group();
      this.molymod.scene.add(this.molymod.meshGroup);

      // 6. Muat molekul default
      this.loadMolymodMolecule(this.molymod.currentMoleculeId);

      // 7. Mulai Render Loop
      this.animateMolymod();
    } else {
      // Resize jika sudah pernah diinisialisasi
      this.molymod.camera.aspect = width / height;
      this.molymod.camera.updateProjectionMatrix();
      this.molymod.renderer.setSize(width, height);
    }
  }

  loadMolymodMolecule(molId) {
    if (!this.molymod.meshGroup) return;

    // Bersihkan objek 3D sebelumnya
    while (this.molymod.meshGroup.children.length > 0) {
      const obj = this.molymod.meshGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      this.molymod.meshGroup.remove(obj);
    }

    this.molymod.atomsList = [];
    this.molymod.bondsList = [];
    this.molymod.isExploded = false;
    this.molymod.explodeProgress = 0.0;

    const data = MOLYMOD_DATA[molId];
    if (!data) return;

    const isSpaceFilling = (this.molymod.displayMode === 'space_filling');
    const isWireframe = (this.molymod.displayMode === 'wireframe');

    // 1. Gambar Bola-Bola Atom Molymod
    data.atoms.forEach((atom, idx) => {
      const radius = isSpaceFilling ? (atom.radius * 1.65) : atom.radius;
      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);

      let sphereMat;
      if (isWireframe) {
        sphereMat = new THREE.MeshBasicMaterial({ color: atom.color, wireframe: true });
      } else {
        // Material plastik mengilap khas bola Molymod
        sphereMat = new THREE.MeshStandardMaterial({
          color: atom.color,
          roughness: 0.18,
          metalness: 0.08,
          emissive: atom.color,
          emissiveIntensity: 0.05
        });
      }

      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      const origPos = new THREE.Vector3(atom.pos[0], atom.pos[1], atom.pos[2]);
      sphereMesh.position.copy(origPos);
      sphereMesh.castShadow = true;
      sphereMesh.receiveShadow = true;

      this.molymod.meshGroup.add(sphereMesh);
      this.molymod.atomsList.push({
        mesh: sphereMesh,
        origPos: origPos.clone(),
        currentPos: origPos.clone(),
        targetPos: origPos.clone(),
        radius: radius
      });
    });

    // 2. Jika Mode Bola Tunggal dengan Lubang Molymod Fisik
    if (data.holes && data.holes.length > 0) {
      data.holes.forEach(holeCoord => {
        const holeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 16);
        const holeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a }); // Lubang hitam pekat soket pasak
        const holeMesh = new THREE.Mesh(holeGeo, holeMat);

        const hPos = new THREE.Vector3(holeCoord[0], holeCoord[1], holeCoord[2]);
        holeMesh.position.copy(hPos);

        const upVec = new THREE.Vector3(0, 1, 0);
        const dir = hPos.clone().normalize();
        holeMesh.quaternion.setFromUnitVectors(upVec, dir);

        this.molymod.meshGroup.add(holeMesh);
      });
    }

    // 3. Gambar Batang Penghubung Ikatan (Kecuali Space-Filling)
    if (!isSpaceFilling && data.bonds) {
      data.bonds.forEach(bond => {
        const atomA = data.atoms[bond.from];
        const atomB = data.atoms[bond.to];
        if (!atomA || !atomB) return;

        const posA = new THREE.Vector3(atomA.pos[0], atomA.pos[1], atomA.pos[2]);
        const posB = new THREE.Vector3(atomB.pos[0], atomB.pos[1], atomB.pos[2]);

        this.createMolymodBonds(posA, posB, bond.type, isWireframe);
      });
    }

    // Center model
    this.molymod.meshGroup.rotation.x = this.molymod.rotation.x;
    this.molymod.meshGroup.rotation.y = this.molymod.rotation.y;
    this.molymod.meshGroup.scale.set(this.molymod.zoom, this.molymod.zoom, this.molymod.zoom);
  }

  createMolymodBonds(posA, posB, type, isWireframe) {
    const dist = posA.distanceTo(posB);
    const dir = new THREE.Vector3().subVectors(posB, posA).normalize();
    const mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
    const upAxis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(upAxis, dir);

    let bondMat;
    if (isWireframe) {
      bondMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true });
    } else {
      // Batang plastik abu-abu khas Molymod
      bondMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.35,
        metalness: 0.15
      });
    }

    if (type === 'single') {
      // 1 Silinder Lurus
      const cylGeo = new THREE.CylinderGeometry(0.12, 0.12, dist, 16);
      const cylMesh = new THREE.Mesh(cylGeo, bondMat);
      cylMesh.position.copy(mid);
      cylMesh.quaternion.copy(quaternion);
      this.molymod.meshGroup.add(cylMesh);
      this.molymod.bondsList.push(cylMesh);
    } else if (type === 'double') {
      // 2 Silinder Paralel Lengkung
      let perp = new THREE.Vector3(0, 0, 1);
      if (Math.abs(dir.z) > 0.85) perp = new THREE.Vector3(1, 0, 0);
      perp.crossVectors(dir, perp).normalize().multiplyScalar(0.15);

      const cylGeo = new THREE.CylinderGeometry(0.09, 0.09, dist, 16);

      const m1 = new THREE.Mesh(cylGeo, bondMat);
      m1.position.copy(mid.clone().add(perp));
      m1.quaternion.copy(quaternion);
      this.molymod.meshGroup.add(m1);
      this.molymod.bondsList.push(m1);

      const m2 = new THREE.Mesh(cylGeo, bondMat);
      m2.position.copy(mid.clone().sub(perp));
      m2.quaternion.copy(quaternion);
      this.molymod.meshGroup.add(m2);
      this.molymod.bondsList.push(m2);
    } else if (type === 'triple') {
      // 3 Silinder Segitiga Paralel
      let p1 = new THREE.Vector3(0, 0, 1);
      if (Math.abs(dir.z) > 0.85) p1 = new THREE.Vector3(1, 0, 0);
      p1.crossVectors(dir, p1).normalize().multiplyScalar(0.16);

      let p2 = p1.clone().applyAxisAngle(dir, (Math.PI * 2) / 3);
      let p3 = p1.clone().applyAxisAngle(dir, (Math.PI * 4) / 3);

      const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, dist, 16);

      [p1, p2, p3].forEach(offset => {
        const m = new THREE.Mesh(cylGeo, bondMat);
        m.position.copy(mid.clone().add(offset));
        m.quaternion.copy(quaternion);
        this.molymod.meshGroup.add(m);
        this.molymod.bondsList.push(m);
      });
    }
  }

  animateMolymod() {
    this.molymod.animId = requestAnimationFrame(() => this.animateMolymod());

    if (!this.molymod.renderer || !this.molymod.scene || !this.molymod.camera) return;

    // Auto rotate jika aktif dan sedang tidak di-drag pengguna
    if (this.molymod.isAutoRotate && !this.molymod.isDragging && this.molymod.meshGroup) {
      this.molymod.meshGroup.rotation.y += 0.008;
      this.molymod.rotation.y = this.molymod.meshGroup.rotation.y;
    }

    // Animasi Exploded View (Bongkar Pasang)
    if (this.molymod.atomsList.length > 0) {
      const targetFactor = this.molymod.isExploded ? 1.85 : 1.0;
      this.molymod.atomsList.forEach(atom => {
        atom.targetPos.copy(atom.origPos).multiplyScalar(targetFactor);
        atom.mesh.position.lerp(atom.targetPos, 0.08);
      });

      // Batang ikatan mengecil/menghilang saat exploded view
      const bondScaleTarget = this.molymod.isExploded ? 0.001 : 1.0;
      this.molymod.bondsList.forEach(bond => {
        bond.scale.lerp(new THREE.Vector3(bondScaleTarget, bondScaleTarget, bondScaleTarget), 0.08);
      });
    }

    this.molymod.renderer.render(this.molymod.scene, this.molymod.camera);
  }

  setupMolymodControls() {
    const container = document.getElementById('molymod-canvas-mount');

    // 1. Mouse & Touch Dragging
    if (container) {
      const onStart = (clientX, clientY) => {
        this.molymod.isDragging = true;
        this.molymod.prevMouse = { x: clientX, y: clientY };
      };

      const onMove = (clientX, clientY) => {
        if (!this.molymod.isDragging || !this.molymod.meshGroup) return;
        const deltaX = clientX - this.molymod.prevMouse.x;
        const deltaY = clientY - this.molymod.prevMouse.y;

        this.molymod.meshGroup.rotation.y += deltaX * 0.01;
        this.molymod.meshGroup.rotation.x += deltaY * 0.01;

        this.molymod.rotation.x = this.molymod.meshGroup.rotation.x;
        this.molymod.rotation.y = this.molymod.meshGroup.rotation.y;

        this.molymod.prevMouse = { x: clientX, y: clientY };
      };

      const onEnd = () => {
        this.molymod.isDragging = false;
      };

      container.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
      window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', onEnd);

      container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          onStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      container.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          onMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      container.addEventListener('touchend', onEnd);

      // Scroll Zoom
      container.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
          this.molymod.zoom = Math.min(2.2, this.molymod.zoom + 0.1);
        } else {
          this.molymod.zoom = Math.max(0.4, this.molymod.zoom - 0.1);
        }
        if (this.molymod.meshGroup) {
          this.molymod.meshGroup.scale.set(this.molymod.zoom, this.molymod.zoom, this.molymod.zoom);
        }
      }, { passive: false });
    }

    // 2. Filter Kategori Molekul
    document.querySelectorAll('.moly-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.moly-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter || 'all';
        this.filterMolymodPresets(cat);
      });
    });

    // 3. Floating 3D Tool Buttons
    const btnBallStick = document.getElementById('btn-moly-ball-stick');
    const btnSpaceFill = document.getElementById('btn-moly-space-fill');
    const btnWireframe = document.getElementById('btn-moly-wireframe');
    const btnAutoRotate = document.getElementById('btn-moly-autorotate');
    const btnExplode = document.getElementById('btn-moly-explode');
    const btnResetView = document.getElementById('btn-moly-reset-view');

    const updateDisplayMode = (mode) => {
      this.molymod.displayMode = mode;
      [btnBallStick, btnSpaceFill, btnWireframe].forEach(b => {
        if (b) b.classList.remove('active');
      });
      if (mode === 'ball_stick' && btnBallStick) btnBallStick.classList.add('active');
      if (mode === 'space_filling' && btnSpaceFill) btnSpaceFill.classList.add('active');
      if (mode === 'wireframe' && btnWireframe) btnWireframe.classList.add('active');
      this.loadMolymodMolecule(this.molymod.currentMoleculeId);
    };

    if (btnBallStick) btnBallStick.addEventListener('click', () => updateDisplayMode('ball_stick'));
    if (btnSpaceFill) btnSpaceFill.addEventListener('click', () => updateDisplayMode('space_filling'));
    if (btnWireframe) btnWireframe.addEventListener('click', () => updateDisplayMode('wireframe'));

    if (btnAutoRotate) {
      btnAutoRotate.addEventListener('click', () => {
        this.molymod.isAutoRotate = !this.molymod.isAutoRotate;
        if (this.molymod.isAutoRotate) btnAutoRotate.classList.add('active');
        else btnAutoRotate.classList.remove('active');
      });
    }

    if (btnExplode) {
      btnExplode.addEventListener('click', () => {
        this.molymod.isExploded = !this.molymod.isExploded;
        if (this.molymod.isExploded) {
          btnExplode.classList.add('active');
          btnExplode.innerHTML = "🧩 Pasang Kembali";
        } else {
          btnExplode.classList.remove('active');
          btnExplode.innerHTML = "💥 Bongkar/Pasang";
        }
      });
    }

    if (btnResetView) {
      btnResetView.addEventListener('click', () => {
        this.molymod.rotation = { x: 0.25, y: 0.4 };
        this.molymod.zoom = 1.0;
        this.molymod.isExploded = false;
        if (btnExplode) {
          btnExplode.classList.remove('active');
          btnExplode.innerHTML = "💥 Bongkar/Pasang";
        }
        if (this.molymod.meshGroup) {
          this.molymod.meshGroup.rotation.x = this.molymod.rotation.x;
          this.molymod.meshGroup.rotation.y = this.molymod.rotation.y;
          this.molymod.meshGroup.scale.set(1.0, 1.0, 1.0);
        }
      });
    }
  }
}

/* ==========================================================================
   DATABASE ALAT PERAGA MOLYMOD 3D (PRESET MOLEKUL & BOLA ATOM TUNGGAL)
   ========================================================================== */
const MOLYMOD_DATA = {
  h2o: {
    id: 'h2o',
    name: 'Air (H₂O)',
    formula: 'H₂O',
    category: 'simple',
    vsepr: 'Bentuk V / Sudut (104.5°)',
    vseprCode: 'AX₂E₂ (Tetrahedral Terdistorsi)',
    hybrid: 'sp³',
    polarity: 'Polar (Momen Dipol 1.85 D)',
    bondType: '2 Ikatan Kovalen Tunggal (O—H)',
    desc: 'Molekul air esensial bagi kehidupan. Memiliki sudut ikatan 104.5° karena dorongan kuat 2 pasangan elektron bebas (PEB) pada atom Oksigen pusat.',
    molymodHoles: 'Atom O (merah) memiliki 2 lubang konektor yang membentuk sudut ~105°, atom H (putih) memiliki 1 lubang pasak.',
    atoms: [
      { id: 'O', symbol: 'O', name: 'Oksigen', color: 0xef4444, radius: 0.75, pos: [0, 0.25, 0] },
      { id: 'H1', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-0.95, -0.45, 0] },
      { id: 'H2', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [0.95, -0.45, 0] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
      { from: 0, to: 2, type: 'single' }
    ]
  },
  ch4: {
    id: 'ch4',
    name: 'Metana (CH₄)',
    formula: 'CH₄',
    category: 'organic',
    vsepr: 'Tetrahedral Simetris (109.5°)',
    vseprCode: 'AX₄ (Tetrahedral Sempurna)',
    hybrid: 'sp³',
    polarity: 'Nonpolar',
    bondType: '4 Ikatan Kovalen Tunggal (C—H)',
    desc: 'Senyawa hidrokarbon paling sederhana dan komponen utama gas alam. Atom Karbon berada di pusat dengan 4 atom Hidrogen terarah ke 4 sudut tetrahedral berjarak sudut sama 109.5°.',
    molymodHoles: 'Atom C (hitam) memiliki 4 lubang konektor tetrahedral 109.5°, atom H (putih) masing-masing 1 lubang pasak.',
    atoms: [
      { id: 'C', symbol: 'C', name: 'Karbon', color: 0x1e293b, radius: 0.82, pos: [0, 0, 0] },
      { id: 'H1', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [0, 1.25, 0] },
      { id: 'H2', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [1.18, -0.42, 0] },
      { id: 'H3', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-0.59, -0.42, 1.02] },
      { id: 'H4', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-0.59, -0.42, -1.02] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
      { from: 0, to: 2, type: 'single' },
      { from: 0, to: 3, type: 'single' },
      { from: 0, to: 4, type: 'single' }
    ]
  },
  co2: {
    id: 'co2',
    name: 'Karbon Dioksida (CO₂)',
    formula: 'CO₂',
    category: 'simple',
    vsepr: 'Linear Lurus (180°)',
    vseprCode: 'AX₂ (Linear)',
    hybrid: 'sp',
    polarity: 'Nonpolar (Momen Dipol Nol)',
    bondType: '2 Ikatan Kovalen Rangkap Dua (O=C=O)',
    desc: 'Gas penting dalam siklus karbon bumi. Karena tidak ada pasangan elektron bebas pada atom Karbon pusat, kedua ikatan rangkap dua saling bertolak lurus 180°.',
    molymodHoles: 'Pada kit Molymod asli, ikatan rangkap dua dirakit menggunakan 2 batang pegas fleksibel melengkung pada masing-masing sisi.',
    atoms: [
      { id: 'C', symbol: 'C', name: 'Karbon', color: 0x1e293b, radius: 0.82, pos: [0, 0, 0] },
      { id: 'O1', symbol: 'O', name: 'Oksigen', color: 0xef4444, radius: 0.75, pos: [-1.45, 0, 0] },
      { id: 'O2', symbol: 'O', name: 'Oksigen', color: 0xef4444, radius: 0.75, pos: [1.45, 0, 0] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'double' },
      { from: 0, to: 2, type: 'double' }
    ]
  },
  nh3: {
    id: 'nh3',
    name: 'Amonia (NH₃)',
    formula: 'NH₃',
    category: 'simple',
    vsepr: 'Trigonal Piramidal (107°)',
    vseprCode: 'AX₃E (Piramida Trigonal)',
    hybrid: 'sp³',
    polarity: 'Polar',
    bondType: '3 Ikatan Kovalen Tunggal (N—H)',
    desc: 'Senyawa basa nitrogen berbau tajam menyengat. Satu pasangan elektron bebas (PEB) pada Nitrogen menekan ketiga ikatan N—H sehingga sudutnya menjadi 107°.',
    molymodHoles: 'Atom N (biru) memiliki 3 lubang konektor yang mengarah ke piramida dasar segitiga.',
    atoms: [
      { id: 'N', symbol: 'N', name: 'Nitrogen', color: 0x2563eb, radius: 0.78, pos: [0, 0.35, 0] },
      { id: 'H1', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [0.98, -0.35, 0] },
      { id: 'H2', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-0.49, -0.35, 0.85] },
      { id: 'H3', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-0.49, -0.35, -0.85] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
      { from: 0, to: 2, type: 'single' },
      { from: 0, to: 3, type: 'single' }
    ]
  },
  o2: {
    id: 'o2',
    name: 'Gas Oksigen (O₂)',
    formula: 'O₂',
    category: 'simple',
    vsepr: 'Linear Homonuklir (180°)',
    vseprCode: 'Diatomik Homonuklir',
    hybrid: 'sp²',
    polarity: 'Nonpolar',
    bondType: '1 Ikatan Kovalen Rangkap Dua (O=O)',
    desc: 'Gas esensial penopang respirasi aerob. Dua atom Oksigen berbagi 2 pasang elektron membentuk ikatan rangkap dua.',
    molymodHoles: 'Kedua bola O (merah) dihubungkan dengan 2 konektor lengkung lentur khas Molymod.',
    atoms: [
      { id: 'O1', symbol: 'O', name: 'Oksigen', color: 0xef4444, radius: 0.75, pos: [-0.85, 0, 0] },
      { id: 'O2', symbol: 'O', name: 'Oksigen', color: 0xef4444, radius: 0.75, pos: [0.85, 0, 0] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'double' }
    ]
  },
  n2: {
    id: 'n2',
    name: 'Gas Nitrogen (N₂)',
    formula: 'N₂',
    category: 'simple',
    vsepr: 'Linear Homonuklir (180°)',
    vseprCode: 'Diatomik Homonuklir',
    hybrid: 'sp',
    polarity: 'Nonpolar',
    bondType: '1 Ikatan Kovalen Rangkap Tiga (N≡N)',
    desc: 'Gas terbanyak (78%) di atmosfer bumi. Memiliki ikatan kovalen rangkap tiga yang sangat kokoh dan berenergi disosiasi tinggi.',
    molymodHoles: 'Menggunakan 3 pasak fleksibel yang menghubungkan 3 lubang pada masing-masing bola N (biru).',
    atoms: [
      { id: 'N1', symbol: 'N', name: 'Nitrogen', color: 0x2563eb, radius: 0.78, pos: [-0.8, 0, 0] },
      { id: 'N2', symbol: 'N', name: 'Nitrogen', color: 0x2563eb, radius: 0.78, pos: [0.8, 0, 0] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'triple' }
    ]
  },
  h2: {
    id: 'h2',
    name: 'Gas Hidrogen (H₂)',
    formula: 'H₂',
    category: 'simple',
    vsepr: 'Linear Homonuklir (180°)',
    vseprCode: 'Diatomik Homonuklir',
    hybrid: '1s-1s',
    polarity: 'Nonpolar',
    bondType: 'Ikatan Kovalen Tunggal (H—H)',
    desc: 'Molekul paling ringan di alam semesta. Terdiri dari 2 atom Hidrogen yang berbagi 1 pasang elektron tunggal.',
    molymodHoles: '2 bola putih kecil dengan 1 pasang lubang tunggal terhubung batang lurus pendek.',
    atoms: [
      { id: 'H1', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-0.65, 0, 0] },
      { id: 'H2', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [0.65, 0, 0] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' }
    ]
  },
  hcl: {
    id: 'hcl',
    name: 'Asam Klorida (HCl)',
    formula: 'HCl',
    category: 'simple',
    vsepr: 'Linear Heteronuklir (180°)',
    vseprCode: 'Diatomik Polar',
    hybrid: 'sp³ (pada Cl)',
    polarity: 'Sangat Polar (Momen Dipol 1.08 D)',
    bondType: '1 Ikatan Kovalen Polar (H—Cl)',
    desc: 'Asam kuat pembentuk asam lambung manusia. Atom Klorin menarik kerapatan elektron lebih kuat daripada Hidrogen.',
    molymodHoles: '1 bola putih (H) terhubung batang lurus ke 1 bola hijau besar (Cl).',
    atoms: [
      { id: 'H', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-0.95, 0, 0] },
      { id: 'Cl', symbol: 'Cl', name: 'Klorin', color: 0x10b981, radius: 0.92, pos: [0.65, 0, 0] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' }
    ]
  },
  c2h4: {
    id: 'c2h4',
    name: 'Etena / Etilena (C₂H₄)',
    formula: 'C₂H₄',
    category: 'organic',
    vsepr: 'Trigonal Planar Datar (120°)',
    vseprCode: 'Alkena Rantai Datar',
    hybrid: 'sp²',
    polarity: 'Nonpolar',
    bondType: '1 Ikatan Rangkap Dua (C=C) + 4 Ikatan Tunggal (C—H)',
    desc: 'Hormon alami pematang buah pada tanaman dan monomer plastik polietilena. Semua atom berada pada satu bidang datar berkat hibridisasi sp².',
    molymodHoles: '2 bola C hitam dihubungkan 2 batang lengkung (C=C), masing-masing C mengikat 2 bola H putih.',
    atoms: [
      { id: 'C1', symbol: 'C', name: 'Karbon', color: 0x1e293b, radius: 0.82, pos: [-0.8, 0, 0] },
      { id: 'C2', symbol: 'C', name: 'Karbon', color: 0x1e293b, radius: 0.82, pos: [0.8, 0, 0] },
      { id: 'H1', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-1.45, 0.95, 0] },
      { id: 'H2', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-1.45, -0.95, 0] },
      { id: 'H3', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [1.45, 0.95, 0] },
      { id: 'H4', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [1.45, -0.95, 0] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'double' },
      { from: 0, to: 2, type: 'single' },
      { from: 0, to: 3, type: 'single' },
      { from: 1, to: 4, type: 'single' },
      { from: 1, to: 5, type: 'single' }
    ]
  },
  c2h2: {
    id: 'c2h2',
    name: 'Etuna / Asetilena (C₂H₂)',
    formula: 'C₂H₂',
    category: 'organic',
    vsepr: 'Linear Lurus Sempurna (180°)',
    vseprCode: 'Alkuna Linear',
    hybrid: 'sp',
    polarity: 'Nonpolar',
    bondType: '1 Ikatan Rangkap Tiga (C≡C) + 2 Ikatan Tunggal (C—H)',
    desc: 'Gas bahan bakar las karbit bersuhu nyala api tinggi (>3000°C). Struktur seluruh molekul lurus 180° berkat hibridisasi sp.',
    molymodHoles: '2 bola C hitam dihubungkan 3 batang penghubung paralel kaku (C≡C).',
    atoms: [
      { id: 'H1', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-2.1, 0, 0] },
      { id: 'C1', symbol: 'C', name: 'Karbon', color: 0x1e293b, radius: 0.82, pos: [-0.75, 0, 0] },
      { id: 'C2', symbol: 'C', name: 'Karbon', color: 0x1e293b, radius: 0.82, pos: [0.75, 0, 0] },
      { id: 'H2', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [2.1, 0, 0] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
      { from: 1, to: 2, type: 'triple' },
      { from: 2, to: 3, type: 'single' }
    ]
  },
  c2h5oh: {
    id: 'c2h5oh',
    name: 'Etanol / Alkohol (C₂H₅OH)',
    formula: 'C₂H₅OH',
    category: 'organic',
    vsepr: 'Kombinasi Tetrahedral & Bent (104.5°)',
    vseprCode: 'Alkohol Primer',
    hybrid: 'sp³ (pada C dan O)',
    polarity: 'Polar (Dapat membentuk Ikatan Hidrogen)',
    bondType: 'Ikatan Kovalen Tunggal Rantai Organik',
    desc: 'Alkohol antiseptik dan pelarut industri. Gugus -OH bersifat polar dan membentuk ikatan hidrogen dengan air.',
    molymodHoles: 'Rantai 2 atom C hitam, 5 atom H putih, 1 atom O merah, dan 1 atom H pada gugus hidroksil.',
    atoms: [
      { id: 'C1', symbol: 'C', name: 'Karbon 1', color: 0x1e293b, radius: 0.82, pos: [-1.4, -0.2, 0] },
      { id: 'H1', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-2.4, -0.2, 0] },
      { id: 'H2', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-1.4, 0.85, 0] },
      { id: 'H3', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [-1.4, -0.6, 0.95] },
      { id: 'C2', symbol: 'C', name: 'Karbon 2', color: 0x1e293b, radius: 0.82, pos: [0, 0.25, 0] },
      { id: 'H4', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [0, 1.3, 0] },
      { id: 'H5', symbol: 'H', name: 'Hidrogen', color: 0xffffff, radius: 0.48, pos: [0, -0.2, 0.95] },
      { id: 'O', symbol: 'O', name: 'Oksigen', color: 0xef4444, radius: 0.75, pos: [1.2, -0.4, 0] },
      { id: 'H6', symbol: 'H', name: 'Hidrogen (OH)', color: 0xffffff, radius: 0.48, pos: [1.9, 0.25, 0] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'single' },
      { from: 0, to: 2, type: 'single' },
      { from: 0, to: 3, type: 'single' },
      { from: 0, to: 4, type: 'single' },
      { from: 4, to: 5, type: 'single' },
      { from: 4, to: 6, type: 'single' },
      { from: 4, to: 7, type: 'single' },
      { from: 7, to: 8, type: 'single' }
    ]
  },
  so2: {
    id: 'so2',
    name: 'Belerang Dioksida (SO₂)',
    formula: 'SO₂',
    category: 'simple',
    vsepr: 'Bentuk V / Sudut (119°)',
    vseprCode: 'AX₂E (Bengkok Trigonal Planar)',
    hybrid: 'sp²',
    polarity: 'Polar (Momen Dipol 1.63 D)',
    bondType: 'Ikatan Kovalen Resonansi (S=O)',
    desc: 'Gas polutan hasil pembakaran bahan bakar fosil. Satu pasangan elektron bebas pada atom Belerang menekan sudut ikatan menjadi 119°.',
    molymodHoles: '1 bola S (kuning) di pusat dihubungkan ke 2 bola O (merah) membentuk sudut V.',
    atoms: [
      { id: 'S', symbol: 'S', name: 'Belerang', color: 0xeab308, radius: 0.88, pos: [0, 0.35, 0] },
      { id: 'O1', symbol: 'O', name: 'Oksigen', color: 0xef4444, radius: 0.75, pos: [-1.25, -0.4, 0] },
      { id: 'O2', symbol: 'O', name: 'Oksigen', color: 0xef4444, radius: 0.75, pos: [1.25, -0.4, 0] }
    ],
    bonds: [
      { from: 0, to: 1, type: 'double' },
      { from: 0, to: 2, type: 'single' }
    ]
  },
  // Single Atoms Inspector
  atom_c: {
    id: 'atom_c',
    name: 'Bola Molymod Karbon (C)',
    formula: 'C (Tetrahedral 4-Lubang)',
    category: 'atoms',
    vsepr: 'Valensi 4 (Tetrahedral)',
    vseprCode: 'Tetrahedral 109.5°',
    hybrid: 'sp³',
    polarity: 'Unsur Murni',
    bondType: '4 Lubang Konektor Pasak',
    desc: 'Bola Molymod Karbon berwarna hitam dengan 4 lubang berjarak sudut 109.5° untuk membentuk 4 ikatan kovalen.',
    molymodHoles: 'Warna Hitam (Black) • Diameter 23 mm • 4 Lubang Tetrahedral.',
    atoms: [
      { id: 'C', symbol: 'C', name: 'Karbon', color: 0x1e293b, radius: 1.25, pos: [0, 0, 0] }
    ],
    bonds: [],
    holes: [
      [0, 1.25, 0],
      [1.18, -0.42, 0],
      [-0.59, -0.42, 1.02],
      [-0.59, -0.42, -1.02]
    ]
  },
  atom_o: {
    id: 'atom_o',
    name: 'Bola Molymod Oksigen (O)',
    formula: 'O (Sudut 2-Lubang)',
    category: 'atoms',
    vsepr: 'Valensi 2 (Sudut 104.5°)',
    vseprCode: 'Bent / Sudut V',
    hybrid: 'sp³',
    polarity: 'Unsur Murni',
    bondType: '2 Lubang Konektor Pasak',
    desc: 'Bola Molymod Oksigen berwarna merah dengan 2 lubang bersudut ~105° sesuai geometri molekul air.',
    molymodHoles: 'Warna Merah (Red) • Diameter 23 mm • 2 Lubang Bersudut.',
    atoms: [
      { id: 'O', symbol: 'O', name: 'Oksigen', color: 0xef4444, radius: 1.20, pos: [0, 0, 0] }
    ],
    bonds: [],
    holes: [
      [-0.95, -0.72, 0],
      [0.95, -0.72, 0]
    ]
  },
  atom_n: {
    id: 'atom_n',
    name: 'Bola Molymod Nitrogen (N)',
    formula: 'N (Trigonal 3-Lubang)',
    category: 'atoms',
    vsepr: 'Valensi 3 (Piramida Trigonal)',
    vseprCode: 'Trigonal Piramidal 107°',
    hybrid: 'sp³',
    polarity: 'Unsur Murni',
    bondType: '3 Lubang Konektor Pasak',
    desc: 'Bola Molymod Nitrogen berwarna biru tua dengan 3 lubang berorientasi piramida trigonal.',
    molymodHoles: 'Warna Biru (Blue) • Diameter 23 mm • 3 Lubang Piramida.',
    atoms: [
      { id: 'N', symbol: 'N', name: 'Nitrogen', color: 0x2563eb, radius: 1.22, pos: [0, 0, 0] }
    ],
    bonds: [],
    holes: [
      [1.15, -0.4, 0],
      [-0.58, -0.4, 1.0],
      [-0.58, -0.4, -1.0]
    ]
  },
  atom_na: {
    id: 'atom_na',
    name: 'Bola Molymod Logam Natrium (Na)',
    formula: 'Na (Logam Alkali)',
    category: 'atoms',
    vsepr: 'Valensi 1 (Ikatan Logam / Ionik)',
    vseprCode: 'Sferis Logam',
    hybrid: '3s¹',
    polarity: 'Elektropositif Tinggi',
    bondType: '1 Lubang Konektor',
    desc: 'Bola Molymod logam alkali berwarna abu-abu perak dengan ukuran bola lebih besar mencerminkan jari-jari atom logam.',
    molymodHoles: 'Warna Abu-abu Perak (Silver/Grey) • Diameter 25 mm • 1 Lubang.',
    atoms: [
      { id: 'Na', symbol: 'Na', name: 'Natrium', color: 0x94a3b8, radius: 1.35, pos: [0, 0, 0] }
    ],
    bonds: [],
    holes: [
      [1.35, 0, 0]
    ]
  }
};

window.MOLYMOD_DATA = MOLYMOD_DATA;
window.ChemicalTheoryModule = ChemicalTheoryModule;
