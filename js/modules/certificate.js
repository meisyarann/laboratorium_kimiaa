/* ==========================================================================
   CHEMVIRTUAL LAB - MODUL 10: GENERATOR SERTIFIKAT DIGITAL RESMI
   Guru Kimia: Fatma Alawiyah, S.Pd.,Gr (NIP: 200103272025212017)
   ========================================================================== */

class CertificateModule {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.studentName = "NAMA PESERTA DIDIK";
    this.studentClass = "";
    this.score = 85;
    this.teacherName = "Fatma Alawiyah, S.Pd.,Gr";
    this.teacherNIP = "200103272025212017";
    this.certNumber = "CVL/CHEM-MTP/2026/089";
  }

  init() {
    this.canvas = document.getElementById('certificate-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    // Load saved student name and score
    this.loadData();
    this.renderCertificateCanvas();
    this.setupEventListeners();
  }

  loadData() {
    const savedName = localStorage.getItem('chemvirtuallab_student_name');
    if (savedName && savedName.trim()) {
      this.studentName = savedName.trim();
    }

    const savedClass = localStorage.getItem('chemvirtuallab_student_class');
    if (savedClass && savedClass.trim()) {
      this.studentClass = savedClass.trim();
    }

    const savedScore = localStorage.getItem('chemvirtuallab_quiz_score');
    if (savedScore) {
      this.score = parseInt(savedScore, 10);
    }

    const nameInput = document.getElementById('cert-input-name');
    if (nameInput) {
      nameInput.value = this.studentName;
    }
  }

  setupEventListeners() {
    // Input Nama Siswa
    const nameInput = document.getElementById('cert-input-name');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        this.studentName = e.target.value.trim() || "NAMA PESERTA DIDIK";
        localStorage.setItem('chemvirtuallab_student_name', this.studentName);
        this.renderCertificateCanvas();
      });
    }

    // Tombol Perbarui Sertifikat
    const btnUpdate = document.getElementById('btn-update-cert');
    if (btnUpdate) {
      btnUpdate.addEventListener('click', () => {
        this.renderCertificateCanvas();
      });
    }

    // Tombol Download PNG Resolusi Tinggi
    const btnDownload = document.getElementById('btn-download-cert');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        this.downloadCertificatePNG();
      });
    }

    // Tombol Cetak Langsung (Print A4)
    const btnPrint = document.getElementById('btn-print-cert');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        this.printCertificate();
      });
    }
  }

  renderCertificateCanvas() {
    if (!this.canvas || !this.ctx) return;

    // Set Ukuran Canvas High-Resolution (1600 x 1130 ~ Rasio A4 Landscape)
    const w = 1600;
    const h = 1131;
    this.canvas.width = w;
    this.canvas.height = h;

    const ctx = this.ctx;

    // 1. BACKGROUND & GRADIENT MEWAH
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#f0f9ff');
    bgGrad.addColorStop(0.5, '#ffffff');
    bgGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. BINGKAI LUAR EMAS & BIRU TUA MEWAH
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, w - 96, h - 96);

    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(58, 58, w - 116, h - 116);

    // Ornamen Sudut Klasik Emas
    this.drawCornerOrnament(ctx, 48, 48, 60);
    this.drawCornerOrnament(ctx, w - 48, 48, 60, true, false);
    this.drawCornerOrnament(ctx, 48, h - 48, 60, false, true);
    this.drawCornerOrnament(ctx, w - 48, h - 48, 60, true, true);

    // Watermark Lambang Kimia di Belakang Teks
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. HEADER KOP INSTITUSI & JUDUL
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText("LABORATORIUM VIRTUAL KIMIA & MULTIMEDIA PEMBELAJARAN", w / 2, 140);

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 56px Outfit, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText("SERTIFIKAT KELULUSAN", w / 2, 220);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.letterSpacing = '1px';
    ctx.fillText(`Nomor Piagam: ${this.certNumber}`, w / 2, 260);

    // Garis Pemisah Emas
    const lineGrad = ctx.createLinearGradient(w / 2 - 250, 0, w / 2 + 250, 0);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.5, '#b45309');
    lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 250, 285);
    ctx.lineTo(w / 2 + 250, 285);
    ctx.stroke();

    // 4. KETERANGAN PENERIMA
    ctx.fillStyle = '#334155';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("Piagam penghargaan ini secara resmi diberikan kepada:", w / 2, 340);

    // NAMA SISWA
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 54px Outfit, sans-serif';
    ctx.fillText(this.studentName.toUpperCase(), w / 2, 430);

    // Garis Bawah Nama
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 320, 455);
    ctx.lineTo(w / 2 + 320, 455);
    ctx.stroke();

    // Kelas Siswa
    if (this.studentClass) {
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Peserta Didik &bull; Kelas ${this.studentClass}`, w / 2, 485);
    }

    // Keterangan Prestasi
    ctx.fillStyle = '#1e293b';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    const descLine1 = "Telah menyelesaikan seluruh rangkaian modul interaktif pembelajaran kimia praktikum, meliputi:";
    const descLine2 = "Kartun APD, Pengenalan Alat Lab & Aturan K3, LKPD PBL, Teori Kimia, serta Evaluasi Kuis";
    ctx.fillText(descLine1, w / 2, 520);
    ctx.fillText(descLine2, w / 2, 552);

    // Predikat Kelulusan
    const predicate = this.score >= 85 ? "SANGAT BAIK (DISTINCTION)" : "BAIK (COMPETENT)";
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.fillText(`Dengan Predikat: ${predicate}  |  Skor Evaluasi: ${this.score}/100`, w / 2, 600);

    // 5. STEMPEL PITA EMAS TENGAH (GOLD MEDAL SEAL)
    this.drawGoldMedal(ctx, w / 2, 730, 65);

    // 6. QR CODE VERIFIKASI (KIRI BAWAH)
    this.drawQRCodePlaceholder(ctx, 140, 830, 110);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("Verifikasi Keaslian Sertifikat Digital", 140, 960);
    ctx.fillText("Laboratorium Virtual Kimia (ChemVirtual)", 140, 978);

    // 7. TANDA TANGAN RESMI GURU KIMIA (KANAN BAWAH)
    const signX = w - 340;
    const signY = 820;
    ctx.textAlign = 'center';

    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    ctx.fillStyle = '#334155';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Diterbitkan pada: ${currentDate}`, signX, signY);

    ctx.fillText("Guru Pengampu Kimia,", signX, signY + 30);

    // Skrip Tanda Tangan Digital Artistik
    ctx.fillStyle = '#0369a1';
    ctx.font = 'italic bold 38px "Brush Script MT", cursive, sans-serif';
    ctx.fillText("Fatma Alawiyah", signX, signY + 85);

    // Garis Bawah Tanda Tangan
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(signX - 160, signY + 105);
    ctx.lineTo(signX + 160, signY + 105);
    ctx.stroke();

    // Nama Terang & NIP Guru
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.fillText(this.teacherName, signX, signY + 135);

    ctx.fillStyle = '#475569';
    ctx.font = '17px "JetBrains Mono", monospace';
    ctx.fillText(`NIP: ${this.teacherNIP}`, signX, signY + 160);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("Guru Kimia & Pengembang Laboratorium Virtual", signX, signY + 185);
  }

  drawCornerOrnament(ctx, x, y, size, flipX = false, flipY = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, size);
    ctx.moveTo(10, 10);
    ctx.lineTo(size - 10, 10);
    ctx.moveTo(10, 10);
    ctx.lineTo(10, size - 10);
    ctx.stroke();

    ctx.restore();
  }

  drawGoldMedal(ctx, x, y, r) {
    ctx.save();

    // Bayangan Medali
    ctx.shadowColor = 'rgba(217, 119, 6, 0.45)';
    ctx.shadowBlur = 18;

    // Pita Gantung
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(x - 24, y);
    ctx.lineTo(x - 36, y + r + 35);
    ctx.lineTo(x - 20, y + r + 25);
    ctx.lineTo(x, y + r + 35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.moveTo(x + 24, y);
    ctx.lineTo(x + 36, y + r + 35);
    ctx.lineTo(x + 20, y + r + 25);
    ctx.lineTo(x, y + r + 35);
    ctx.closePath();
    ctx.fill();

    // Piringan Emas
    const goldGrad = ctx.createRadialGradient(x, y, 5, x, y, r);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#f59e0b');
    goldGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(x, y, r - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Teks Medali
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 15px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("OFFICIAL", x, y - 10);
    ctx.font = 'bold 20px Outfit, sans-serif';
    ctx.fillText("VERIFIED", x, y + 12);
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.fillText("LAB PASS", x, y + 28);

    ctx.restore();
  }

  drawQRCodePlaceholder(ctx, x, y, s) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, s, s);

    // Pola QR Code Representatif
    ctx.fillStyle = '#0f172a';
    const p = 8;
    // 3 Sudut Persegi QR
    ctx.fillRect(x + p, y + p, 28, 28);
    ctx.clearRect(x + p + 6, y + p + 6, 16, 16);
    ctx.fillRect(x + p + 10, y + p + 10, 8, 8);

    ctx.fillRect(x + s - p - 28, y + p, 28, 28);
    ctx.clearRect(x + s - p - 22, y + p + 6, 16, 16);
    ctx.fillRect(x + s - p - 18, y + p + 10, 8, 8);

    ctx.fillRect(x + p, y + s - p - 28, 28, 28);
    ctx.clearRect(x + p + 6, y + s - p - 22, 16, 16);
    ctx.fillRect(x + p + 10, y + s - p - 18, 8, 8);

    // Titik-titik data QR
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(x + 44 + (i * 9), y + 44 + (j * 9), 6, 6);
        }
      }
    }
  }

  downloadCertificatePNG() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = `Sertifikat_Kimia_${this.studentName.replace(/\s+/g, '_')}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  printCertificate() {
    if (!this.canvas) return;
    const dataUrl = this.canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Mohon izinkan popup browser untuk mencetak sertifikat.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cetak Sertifikat - ${this.studentName}</title>
        <style>
          @page { size: A4 landscape; margin: 0; }
          body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
          img { width: 100%; max-height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="${dataUrl}">
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}

window.CertificateModule = CertificateModule;
