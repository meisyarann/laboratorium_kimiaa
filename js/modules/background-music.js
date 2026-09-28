/* ==========================================================================
   CHEMVIRTUAL LAB - BACKGROUND MUSIC (BGM) MANAGER
   Sistem Audio Latar Belakang Sains & Laboratorium Multimedia Interaktif
   Menggunakan Procedural Web Audio Ambient Soundscape (100% Bebas Hak Cipta,
   Bekerja Offline, Ringan, Menenangkan untuk Konsentrasi Belajar)
   ========================================================================== */

class BackgroundMusicManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.compressor = null;
    this.isPlaying = false;
    this.volume = 0.22; // Volume latar default yang nyaman (22%)
    this.currentPreset = 'ambient-lab'; // 'ambient-lab' | 'deep-focus'

    // Node & Timers untuk Ambient Engine
    this.padOscillators = [];
    this.padGains = [];
    this.filterNode = null;
    this.filterLfo = null;
    this.chordInterval = null;
    this.chimeInterval = null;
    this.droneOsc = null;
    this.currentChordIndex = 0;

    // Chord Progresi: Nada Meditatif & Estetis Sains (Frekuensi dalam Hz)
    // Cmaj9, Am9, Fmaj7#11, Gsus4/G6
    this.chords = [
      // 0: Cmaj9 (C3, G3, B3, D4, E4)
      [130.81, 196.00, 246.94, 293.66, 329.63],
      // 1: Am9 (A2, E3, G3, C4, B4)
      [110.00, 164.81, 196.00, 261.63, 493.88],
      // 2: Fmaj9 (F2, C3, A3, C4, E4)
      [87.31, 130.81, 220.00, 261.63, 329.63],
      // 3: Gsus4 -> G6 (G2, D3, G3, C4, E4)
      [98.00, 146.83, 196.00, 261.63, 329.63]
    ];

    // Nada Sparkling Chimes Pentatonik (Kilauan Molekul / Kristal Kaca Lab)
    this.chimeNotes = [
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50, // C6
      1174.66  // D6
    ];

    // Elemen DOM
    this.fabBtn = null;
    this.popoverCard = null;
    this.volumeSlider = null;
    this.volumeLabel = null;
    this.statusBadge = null;
    this.toggleActionBtn = null;
    this.hintChip = null;

    // Baca preferensi tersimpan
    this.loadPreferences();
  }

  loadPreferences() {
    try {
      const savedVol = localStorage.getItem('chemvirtuallab_bgm_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
      }
      const savedPreset = localStorage.getItem('chemvirtuallab_bgm_preset');
      if (savedPreset) {
        this.currentPreset = savedPreset;
      }
    } catch (e) {}
  }

  savePreferences() {
    try {
      localStorage.setItem('chemvirtuallab_bgm_volume', this.volume.toString());
      localStorage.setItem('chemvirtuallab_bgm_preset', this.currentPreset);
      localStorage.setItem('chemvirtuallab_bgm_was_playing', this.isPlaying.toString());
    } catch (e) {}
  }

  init() {
    this.createDomElements();
    this.bindEvents();

    // Periksa apakah sebelumnya user mengaktifkan musik
    const wasPlaying = localStorage.getItem('chemvirtuallab_bgm_was_playing') === 'true';
    if (wasPlaying) {
      // Tunggu interaksi pertama user untuk memenuhi Audio Autoplay Policy browser
      const onFirstInteract = () => {
        if (!this.isPlaying) {
          this.startMusic();
        }
        document.removeEventListener('click', onFirstInteract);
        document.removeEventListener('touchstart', onFirstInteract);
      };
      document.addEventListener('click', onFirstInteract, { once: true });
      document.addEventListener('touchstart', onFirstInteract, { once: true });
    }
  }

  createDomElements() {
    // Buat Container Widget di Bawah Kanan Layar
    const container = document.createElement('div');
    container.className = 'floating-music-widget';
    container.id = 'floating-music-widget';
    container.innerHTML = `
      <!-- Tooltip Hint Awal -->
      <div class="music-fab-hint" id="music-fab-hint">
        <span>🎵</span> Putar Musik Latar Lab
      </div>

      <!-- Popover Kontrol Audio -->
      <div class="music-popover-card" id="music-popover-card">
        <div class="popover-header">
          <div class="popover-title-wrap">
            <span class="popover-title">🎵 Backsound Laboratorium</span>
            <span class="popover-subtitle">Ambient Sains & Konsentrasi</span>
          </div>
          <button class="popover-close-btn" id="btn-close-music-popover" title="Tutup Menu">&times;</button>
        </div>

        <div class="popover-status-badge" id="music-status-badge">
          <span class="status-dot"></span>
          <span id="music-status-text">Musik Dijeda</span>
        </div>

        <!-- Slider Pengatur Volume -->
        <div class="music-volume-row">
          <div class="volume-label-group">
            <span>Volume Suara</span>
            <span id="music-volume-percent">${Math.round(this.volume * 100)}%</span>
          </div>
          <div class="volume-slider-wrapper">
            <span class="volume-icon" id="music-vol-icon">🔉</span>
            <input type="range" class="music-volume-range" id="music-volume-slider" min="0" max="1" step="0.01" value="${this.volume}">
            <span class="volume-icon">🔊</span>
          </div>
        </div>

        <!-- Pilihan Suasana Soundscape -->
        <div class="soundscape-selector-group">
          <span class="soundscape-label">Suasana Musik:</span>
          <div class="soundscape-btn-row">
            <button class="soundscape-opt-btn ${this.currentPreset === 'ambient-lab' ? 'active' : ''}" data-preset="ambient-lab">
              🧪 Lab Tenang
            </button>
            <button class="soundscape-opt-btn ${this.currentPreset === 'deep-focus' ? 'active' : ''}" data-preset="deep-focus">
              🌌 Fokus Dalam
            </button>
          </div>
        </div>

        <!-- Tombol Utama Play / Pause -->
        <div class="popover-main-action">
          <button class="btn-toggle-playback" id="btn-popover-toggle">
            <span id="btn-toggle-icon">▶️</span>
            <span id="btn-toggle-label">Putar Musik Latar</span>
          </button>
        </div>
      </div>

      <!-- Tombol Floating Mengambang (FAB) -->
      <button class="music-fab-button" id="btn-floating-music" title="Buka / Putar Musik Latar Laboratorium" aria-label="Toggle Background Music">
        <!-- Ikon Saat Paused -->
        <div class="music-muted-icon">
          <span>🎵</span>
        </div>

        <!-- Animated Equalizer Bars Saat Playing -->
        <div class="music-equalizer">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
      </button>
    `;

    document.body.appendChild(container);

    // Simpan referensi DOM
    this.fabBtn = document.getElementById('btn-floating-music');
    this.popoverCard = document.getElementById('music-popover-card');
    this.volumeSlider = document.getElementById('music-volume-slider');
    this.volumeLabel = document.getElementById('music-volume-percent');
    this.statusBadge = document.getElementById('music-status-badge');
    this.toggleActionBtn = document.getElementById('btn-popover-toggle');
    this.hintChip = document.getElementById('music-fab-hint');

    // Sembunyikan hint otomatis setelah 6 detik
    setTimeout(() => {
      if (this.hintChip) {
        this.hintChip.classList.add('hidden');
      }
    }, 6500);
  }

  bindEvents() {
    // Klik FAB: Jika sedang pause, langsung putar & buka kontrol. Jika sedang putar, toggle atau buka popover
    if (this.fabBtn) {
      this.fabBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.hintChip) this.hintChip.classList.add('hidden');

        if (!this.isPlaying) {
          this.startMusic();
          this.openPopover();
        } else {
          // Toggle buka/tutup panel kontrol
          this.togglePopover();
        }
      });
    }

    // Tombol close popover
    const btnClose = document.getElementById('btn-close-music-popover');
    if (btnClose) {
      btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closePopover();
      });
    }

    // Klik di luar popover menutup popover
    document.addEventListener('click', (e) => {
      if (this.popoverCard && this.popoverCard.classList.contains('open')) {
        const widget = document.getElementById('floating-music-widget');
        if (widget && !widget.contains(e.target)) {
          this.closePopover();
        }
      }
    });

    // Tombol Toggle Play / Pause di dalam popover
    if (this.toggleActionBtn) {
      this.toggleActionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMusic();
      });
    }

    // Slider Volume
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.setVolume(val);
      });
    }

    // Icon volume klik untuk mute/unmute cepat
    const volIcon = document.getElementById('music-vol-icon');
    if (volIcon) {
      volIcon.addEventListener('click', () => {
        if (this.volume > 0) {
          this.prevVolume = this.volume;
          this.setVolume(0);
          if (this.volumeSlider) this.volumeSlider.value = 0;
        } else {
          const restore = this.prevVolume || 0.22;
          this.setVolume(restore);
          if (this.volumeSlider) this.volumeSlider.value = restore;
        }
      });
    }

    // Pemilihan Suasana / Soundscape Preset
    document.querySelectorAll('.soundscape-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.soundscape-opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.dataset.preset;
        this.setPreset(preset);
      });
    });
  }

  togglePopover() {
    if (this.popoverCard) {
      this.popoverCard.classList.toggle('open');
    }
  }

  openPopover() {
    if (this.popoverCard) {
      this.popoverCard.classList.add('open');
    }
  }

  closePopover() {
    if (this.popoverCard) {
      this.popoverCard.classList.remove('open');
    }
  }

  /* -------------------------------------------------------------
     WEB AUDIO SYNTHESIZER ENGINE (LAB AMBIENT SOUNDSCAPE)
     ------------------------------------------------------------- */
  initAudioEngine() {
    if (this.audioCtx) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      // Master Compressor untuk memastikan dinamika suara halus & tidak pecah
      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-24, this.audioCtx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.audioCtx.currentTime);
      this.compressor.ratio.setValueAtTime(6, this.audioCtx.currentTime);
      this.compressor.attack.setValueAtTime(0.01, this.audioCtx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.audioCtx.currentTime);

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);

      // Routing: MasterGain -> Compressor -> Destination
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.audioCtx.destination);

      // Lowpass Filter dengan slow LFO Modulation (efek pad mengambang)
      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(580, this.audioCtx.currentTime);
      this.filterNode.Q.setValueAtTime(1.4, this.audioCtx.currentTime);

      // LFO penggerak filter perlahan
      this.filterLfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      this.filterLfo.frequency.setValueAtTime(0.08, this.audioCtx.currentTime); // 0.08 Hz (siklus per 12 detik)
      lfoGain.gain.setValueAtTime(160, this.audioCtx.currentTime); // Modulasi +/- 160Hz
      this.filterLfo.connect(lfoGain);
      lfoGain.connect(this.filterNode.frequency);
      this.filterLfo.start();

      this.filterNode.connect(this.masterGain);
    } catch (e) {
      console.warn("Web Audio API tidak didukung pada browser ini.", e);
    }
  }

  startMusic() {
    this.initAudioEngine();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.isPlaying = true;
    this.updateUiState();

    // Fade-in volume secara lembut
    const now = this.audioCtx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 1.8);

    // Mulai layer pad chord progresif
    this.playChord(this.currentChordIndex);
    this.chordInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
      this.playChord(this.currentChordIndex);
    }, 7000);

    // Mulai layer crystalline chimes (butiran kristal praktikum kimia)
    this.scheduleNextChime();

    // Mulai drone halus latar
    this.startSubDrone();

    this.savePreferences();
  }

  pauseMusic() {
    if (!this.isPlaying || !this.audioCtx) return;

    this.isPlaying = false;
    this.updateUiState();

    // Fade-out volume secara lembut sebelum berhenti
    const now = this.audioCtx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);

    // Bersihkan interval
    if (this.chordInterval) {
      clearInterval(this.chordInterval);
      this.chordInterval = null;
    }
    if (this.chimeTimeout) {
      clearTimeout(this.chimeTimeout);
      this.chimeTimeout = null;
    }

    setTimeout(() => {
      this.stopCurrentOscillators();
      this.stopSubDrone();
    }, 1300);

    this.savePreferences();
  }

  toggleMusic() {
    if (this.isPlaying) {
      this.pauseMusic();
    } else {
      this.startMusic();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.volumeLabel) {
      this.volumeLabel.textContent = `${Math.round(this.volume * 100)}%`;
    }
    if (this.isPlaying && this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.1);
    }
    this.savePreferences();
  }

  setPreset(preset) {
    this.currentPreset = preset;
    if (this.filterNode && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      if (preset === 'deep-focus') {
        // Nada lebih hangat, frekuensi lebih rendah
        this.filterNode.frequency.linearRampToValueAtTime(420, now + 1.5);
      } else {
        // Lab Tenang (lebih bercahaya)
        this.filterNode.frequency.linearRampToValueAtTime(620, now + 1.5);
      }
    }
    this.savePreferences();
  }

  /* Mainkan Suara Pad Chords dengan Overlap Lembut */
  playChord(chordIndex) {
    if (!this.audioCtx || !this.isPlaying) return;

    const freqs = this.chords[chordIndex];
    const now = this.audioCtx.currentTime;
    const fadeTime = 2.8;
    const duration = 7.5;

    // Fade out chord sebelumnya
    this.padGains.forEach(g => {
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0.0001, now + fadeTime);
      } catch (e) {}
    });

    const newOscs = [];
    const newGains = [];

    freqs.forEach((freq, idx) => {
      // 2 Oscillator sedikit detuned per nada untuk suara lush chorus tebal
      [-2.5, 2.5].forEach(detuneCents => {
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        // Tipe gelombang: sine halus & triangle untuk harmonics lembut
        osc.type = (idx === 0 || idx === 1) ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detuneCents, now);

        // Volume nada individu proporsional
        const targetGain = 0.08 / freqs.length;
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(targetGain, now + fadeTime);

        osc.connect(noteGain);
        noteGain.connect(this.filterNode);

        osc.start(now);
        osc.stop(now + duration + fadeTime);

        newOscs.push(osc);
        newGains.push(noteGain);
      });
    });

    this.padOscillators = newOscs;
    this.padGains = newGains;
  }

  /* Crystalline Droplets / Chimes (Kilauan Kaca Lab) */
  scheduleNextChime() {
    if (!this.isPlaying) return;

    // Delay acak antara 2.2 sampai 4.8 detik
    const delay = Math.random() * 2600 + 2200;
    this.chimeTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.playRandomChime();
        this.scheduleNextChime();
      }
    }, delay);
  }

  playRandomChime() {
    if (!this.audioCtx || !this.isPlaying || this.currentPreset === 'deep-focus') return;

    try {
      const now = this.audioCtx.currentTime;
      const noteFreq = this.chimeNotes[Math.floor(Math.random() * this.chimeNotes.length)];

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const panner = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, now);

      // Pitch glide sangat lembut ke bawah (karakter air / kristal)
      osc.frequency.exponentialRampToValueAtTime(noteFreq * 0.992, now + 1.6);

      // Envelope: Fast attack, gentle long decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      // Panning acak kiri-kanan
      if (panner) {
        panner.pan.setValueAtTime((Math.random() * 1.2) - 0.6, now);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);
      } else {
        osc.connect(gain);
        gain.connect(this.masterGain);
      }

      osc.start(now);
      osc.stop(now + 1.9);
    } catch (e) {}
  }

  /* Sub Drone Hangat untuk Rasa Tenang & Keamanan Laboratorium */
  startSubDrone() {
    if (!this.audioCtx || this.droneOsc) return;

    try {
      const now = this.audioCtx.currentTime;
      this.droneOsc = this.audioCtx.createOscillator();
      this.droneGain = this.audioCtx.createGain();

      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(65.41, now); // C2 Sub-bass hangat

      this.droneGain.gain.setValueAtTime(0.0001, now);
      this.droneGain.gain.linearRampToValueAtTime(0.028, now + 3);

      this.droneOsc.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc.start(now);
    } catch (e) {}
  }

  stopSubDrone() {
    if (this.droneOsc) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
      } catch (e) {}
      this.droneOsc = null;
    }
  }

  stopCurrentOscillators() {
    this.padOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.padOscillators = [];
    this.padGains = [];
  }

  /* Pembaruan Visual Antarmuka */
  updateUiState() {
    if (this.fabBtn) {
      if (this.isPlaying) {
        this.fabBtn.classList.add('playing');
        this.fabBtn.setAttribute('title', 'Jeda Musik Latar Lab (BGM)');
      } else {
        this.fabBtn.classList.remove('playing');
        this.fabBtn.setAttribute('title', 'Putar Musik Latar Lab (BGM)');
      }
    }

    if (this.statusBadge) {
      const statusText = document.getElementById('music-status-text');
      if (this.isPlaying) {
        this.statusBadge.classList.add('active');
        if (statusText) statusText.textContent = 'Musik Sedang Berputar';
      } else {
        this.statusBadge.classList.remove('active');
        if (statusText) statusText.textContent = 'Musik Dijeda';
      }
    }

    if (this.toggleActionBtn) {
      const icon = document.getElementById('btn-toggle-icon');
      const label = document.getElementById('btn-toggle-label');
      if (this.isPlaying) {
        this.toggleActionBtn.classList.add('playing');
        if (icon) icon.textContent = '⏸️';
        if (label) label.textContent = 'Jeda Musik Latar';
      } else {
        this.toggleActionBtn.classList.remove('playing');
        if (icon) icon.textContent = '▶️';
        if (label) label.textContent = 'Putar Musik Latar';
      }
    }
  }
}

// Inisialisasi Otomatis Saat Dokumen Siap
document.addEventListener('DOMContentLoaded', () => {
  window.bgMusicManager = new BackgroundMusicManager();
  window.bgMusicManager.init();
});
