/* ==========================================================================
   CHEMVIRTUAL LAB - MODUL 7: VIDEO KESALAHAN LAB & LKPD PROBLEM BASED LEARNING
   ========================================================================== */

class LKPDPBLModule {
  constructor() {
    this.storageKey = 'chemvirtuallab_lkpd_data';
  }

  init() {
    this.loadSavedLKPD();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Tombol Simpan Progres LKPD
    const btnSave = document.getElementById('btn-save-lkpd');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        this.saveLKPDData();
      });
    }

    // Tombol Cetak / Export LKPD
    const btnPrint = document.getElementById('btn-print-lkpd');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        this.printLKPD();
      });
    }

    // Tombol Reset LKPD
    const btnReset = document.getElementById('btn-reset-lkpd');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm("Apakah Anda yakin ingin mengosongkan seluruh isian LKPD ini?")) {
          this.resetLKPD();
        }
      });
    }

    // Autosave on input
    const form = document.getElementById('lkpd-pbl-form');
    if (form) {
      form.addEventListener('input', () => {
        this.saveLKPDData(false);
      });
    }
  }

  getFormData() {
    return {
      namaSiswa: document.getElementById('lkpd-nama')?.value || '',
      kelas: document.getElementById('lkpd-kelas')?.value || '',
      kelompok: document.getElementById('lkpd-kelompok')?.value || '',
      tanggal: document.getElementById('lkpd-tanggal')?.value || '',
      fase1: document.getElementById('lkpd-fase1')?.value || '',
      fase2: document.getElementById('lkpd-fase2')?.value || '',
      fase3: document.getElementById('lkpd-fase3')?.value || '',
      fase4: document.getElementById('lkpd-fase4')?.value || '',
      fase5: document.getElementById('lkpd-fase5')?.value || '',
      lastSaved: new Date().toLocaleString('id-ID')
    };
  }

  saveLKPDData(showNotification = true) {
    const data = this.getFormData();
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      // Update saved timestamp text
      const statusElem = document.getElementById('lkpd-save-status');
      if (statusElem) {
        statusElem.innerHTML = `💾 Tersimpan otomatis: <span style="font-family:var(--font-mono); font-weight:600;">${data.lastSaved}</span>`;
      }
      if (showNotification) {
        alert("✅ LKPD Problem-Based Learning berhasil disimpan ke memori sistem!");
      }
      // Sync student name with global profile if available
      if (data.namaSiswa && window.App) {
        window.App.setStudentName(data.namaSiswa);
      }
      if (window.AuthDashboard && window.AuthDashboard.currentUser) {
        window.AuthDashboard.recordOrUpdateStudentRecord(window.AuthDashboard.currentUser, {
          lkpdStatus: "Selesai",
          lkpdData: data
        });
      }
    } catch (e) {
      console.warn("Gagal menyimpan ke LocalStorage:", e);
    }
  }

  loadSavedLKPD() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return;
      const data = JSON.parse(saved);

      if (document.getElementById('lkpd-nama')) document.getElementById('lkpd-nama').value = data.namaSiswa || '';
      if (document.getElementById('lkpd-kelas')) document.getElementById('lkpd-kelas').value = data.kelas || '';
      if (document.getElementById('lkpd-kelompok')) document.getElementById('lkpd-kelompok').value = data.kelompok || '';
      if (document.getElementById('lkpd-tanggal')) document.getElementById('lkpd-tanggal').value = data.tanggal || '';
      if (document.getElementById('lkpd-fase1')) document.getElementById('lkpd-fase1').value = data.fase1 || '';
      if (document.getElementById('lkpd-fase2')) document.getElementById('lkpd-fase2').value = data.fase2 || '';
      if (document.getElementById('lkpd-fase3')) document.getElementById('lkpd-fase3').value = data.fase3 || '';
      if (document.getElementById('lkpd-fase4')) document.getElementById('lkpd-fase4').value = data.fase4 || '';
      if (document.getElementById('lkpd-fase5')) document.getElementById('lkpd-fase5').value = data.fase5 || '';

      const statusElem = document.getElementById('lkpd-save-status');
      if (statusElem && data.lastSaved) {
        statusElem.innerHTML = `💾 Tersimpan otomatis: <span style="font-family:var(--font-mono); font-weight:600;">${data.lastSaved}</span>`;
      }
    } catch (e) {
      console.warn("Gagal membaca LocalStorage:", e);
    }
  }

  resetLKPD() {
    localStorage.removeItem(this.storageKey);
    const form = document.getElementById('lkpd-pbl-form');
    if (form) form.reset();
    const statusElem = document.getElementById('lkpd-save-status');
    if (statusElem) statusElem.textContent = 'Data dikosongkan.';
  }

  printLKPD() {
    this.saveLKPDData(false);
    const data = this.getFormData();

    // Buat jendela cetak dokumen resmi LKPD
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Mohon izinkan popup browser untuk mencetak LKPD.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>LKPD Problem-Based Learning - Laboratorium Virtual Kimia</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 2.5cm 2cm; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 20px; }
          .header h2 { margin: 0; font-size: 16pt; text-transform: uppercase; }
          .header h3 { margin: 4px 0; font-size: 13pt; font-weight: normal; }
          .header p { margin: 0; font-size: 10pt; font-style: italic; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .meta-table td { padding: 4px 8px; font-size: 11pt; vertical-align: top; }
          .phase-card { border: 1px solid #333; padding: 12px 16px; margin-bottom: 16px; border-radius: 4px; }
          .phase-title { font-weight: bold; font-size: 11pt; margin-bottom: 6px; }
          .phase-prompt { font-size: 10pt; font-style: italic; color: #444; margin-bottom: 8px; }
          .phase-answer { font-size: 11pt; white-space: pre-wrap; min-height: 50px; }
          .footer-sign { width: 100%; margin-top: 40px; display: flex; justify-content: space-between; }
          .sign-box { text-align: center; width: 220px; font-size: 11pt; }
          @media print {
            body { padding: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>LEMBAR KERJA PESERTA DIDIK (LKPD)</h2>
          <h3>MODEL PEMBELAJARAN PROBLEM-BASED LEARNING (PBL)</h3>
          <p>Mata Pelajaran: Kimia &bull; Materi: Keselamatan Kerja & Prosedur Laboratorium Virtual</p>
          <p>Guru Pengampu: Fatma Alawiyah, S.Pd.,Gr (NIP: 200103272025212017)</p>
        </div>

        <table class="meta-table">
          <tr>
            <td style="width:18%;"><strong>Nama Siswa</strong></td>
            <td style="width:3%;">:</td>
            <td style="width:45%;">${data.namaSiswa || '................................'}</td>
            <td style="width:15%;"><strong>Kelas</strong></td>
            <td style="width:3%;">:</td>
            <td>${data.kelas || '................'}</td>
          </tr>
          <tr>
            <td><strong>Kelompok</strong></td>
            <td>:</td>
            <td>${data.kelompok || '................................'}</td>
            <td><strong>Tanggal</strong></td>
            <td>:</td>
            <td>${data.tanggal || new Date().toLocaleDateString('id-ID')}</td>
          </tr>
        </table>

        <div class="phase-card">
          <div class="phase-title">Fase 1: Orientasi Peserta Didik pada Masalah</div>
          <div class="phase-prompt">Berdasarkan video simulasi kesalahan praktikum lab, analisislah 3 kesalahan fatal dan insiden yang terjadi:</div>
          <div class="phase-answer">${data.fase1 || '(Belum diisi)'}</div>
        </div>

        <div class="phase-card">
          <div class="phase-title">Fase 2: Mengorganisasikan Peserta Didik untuk Belajar</div>
          <div class="phase-prompt">Rumuskan masalah ilmiah terkait bahaya zat kimia dan kelalaian APD pada kasus tersebut:</div>
          <div class="phase-answer">${data.fase2 || '(Belum diisi)'}</div>
        </div>

        <div class="phase-card">
          <div class="phase-title">Fase 3: Membimbing Penyelidikan Mandiri dan Kelompok</div>
          <div class="phase-prompt">Kajian SOP dan MSDS: Aturan keselamatan serta lembar data keselamatan bahan apa sajakah yang dilanggar?</div>
          <div class="phase-answer">${data.fase3 || '(Belum diisi)'}</div>
        </div>

        <div class="phase-card">
          <div class="phase-title">Fase 4: Mengembangkan dan Menyajikan Hasil Karya</div>
          <div class="phase-prompt">Rencana Aksi & Prosedur Tanggap Darurat: Rancanglah langkah darurat dan prosedur preventif yang tepat:</div>
          <div class="phase-answer">${data.fase4 || '(Belum diisi)'}</div>
        </div>

        <div class="phase-card">
          <div class="phase-title">Fase 5: Menganalisis dan Mengevaluasi Proses Pemecahan Masalah</div>
          <div class="phase-prompt">Evaluasi & Refleksi Kritis atas efektivitas solusi yang diajukan:</div>
          <div class="phase-answer">${data.fase5 || '(Belum diisi)'}</div>
        </div>

        <div class="footer-sign">
          <div class="sign-box">
            <p>Mengetahui / Menyetujui,<br>Guru Pengampu Kimia</p>
            <br><br><br>
            <p><strong>Fatma Alawiyah, S.Pd.,Gr</strong><br>NIP. 200103272025212017</p>
          </div>
          <div class="sign-box">
            <p>Praktikan / Siswa Bersangkutan</p>
            <br><br><br>
            <p><strong>${data.namaSiswa || 'Peserta Didik'}</strong></p>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}

window.LKPDPBLModule = LKPDPBLModule;
