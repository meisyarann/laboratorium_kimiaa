/* ==========================================================================
   CHEMVIRTUAL LAB - MODUL 9: REFLEKSI SISWA MODEL 3-2-1 & KOMITMEN PRAKTIKAN
   ========================================================================== */

class ReflectionModule {
  constructor() {
    this.storageKey = 'chemvirtuallab_reflection_data';
    this.rating = 5;
  }

  init() {
    this.loadSavedReflection();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Rating Bintang
    const stars = document.querySelectorAll('.star-rating-btn');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        this.rating = parseInt(star.dataset.star, 10);
        stars.forEach((s, idx) => {
          if (idx < this.rating) s.textContent = '★';
          else s.textContent = '☆';
        });
      });
    });

    // Tombol Simpan Refleksi
    const btnSave = document.getElementById('btn-save-reflection');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        this.saveReflection();
      });
    }
  }

  saveReflection() {
    const data = {
      learn1: document.getElementById('ref-learn-1')?.value || '',
      learn2: document.getElementById('ref-learn-2')?.value || '',
      learn3: document.getElementById('ref-learn-3')?.value || '',
      interest1: document.getElementById('ref-interest-1')?.value || '',
      interest2: document.getElementById('ref-interest-2')?.value || '',
      question1: document.getElementById('ref-question-1')?.value || '',
      pledgeAgreed: document.getElementById('ref-pledge-check')?.checked || false,
      rating: this.rating,
      date: new Date().toLocaleDateString('id-ID')
    };

    localStorage.setItem(this.storageKey, JSON.stringify(data));
    alert("✅ Refleksi belajar dan komitmen keselamatan Anda telah tersimpan! Silakan lanjut ke Modul 10 untuk mencetak Sertifikat Kelulusan resmi.");

    if (window.App) {
      window.App.markModuleCompleted(9);
    }
  }

  loadSavedReflection() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return;
      const data = JSON.parse(saved);

      if (document.getElementById('ref-learn-1')) document.getElementById('ref-learn-1').value = data.learn1 || '';
      if (document.getElementById('ref-learn-2')) document.getElementById('ref-learn-2').value = data.learn2 || '';
      if (document.getElementById('ref-learn-3')) document.getElementById('ref-learn-3').value = data.learn3 || '';
      if (document.getElementById('ref-interest-1')) document.getElementById('ref-interest-1').value = data.interest1 || '';
      if (document.getElementById('ref-interest-2')) document.getElementById('ref-interest-2').value = data.interest2 || '';
      if (document.getElementById('ref-question-1')) document.getElementById('ref-question-1').value = data.question1 || '';
      if (document.getElementById('ref-pledge-check')) document.getElementById('ref-pledge-check').checked = !!data.pledgeAgreed;

      if (data.rating) {
        this.rating = data.rating;
        const stars = document.querySelectorAll('.star-rating-btn');
        stars.forEach((s, idx) => {
          if (idx < this.rating) s.textContent = '★';
          else s.textContent = '☆';
        });
      }
    } catch (e) {
      console.warn("Gagal membaca refleksi:", e);
    }
  }

  resetReflection() {
    localStorage.removeItem(this.storageKey);
    ['ref-learn-1', 'ref-learn-2', 'ref-learn-3', 'ref-interest-1', 'ref-interest-2', 'ref-question-1'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const pledgeCheck = document.getElementById('ref-pledge-check');
    if (pledgeCheck) pledgeCheck.checked = false;

    this.rating = 5;
    const stars = document.querySelectorAll('.star-rating-btn');
    stars.forEach(s => s.textContent = '★');
  }
}

window.ReflectionModule = ReflectionModule;
