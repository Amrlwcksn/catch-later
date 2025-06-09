# Catch Later — Ekstensi Penyimpan Artikel

**Catch Later** adalah ekstensi Chrome yang membantu Anda menyimpan artikel dari berbagai situs web agar bisa dibaca kembali kapan saja.

## Fitur Utama

- 💾 **Simpan Artikel dengan Mudah**  
  Tangkap konten artikel hanya dengan satu klik dari halaman web.

- 📚 **Kelola Koleksi Artikel**  
  Akses dan kelola semua artikel yang sudah tersimpan lewat antarmuka yang simpel dan rapi.

- 🔍 **Pencarian Cepat**  
  Cari artikel berdasarkan judul atau isi dengan mudah.

- 📊 **Statistik Ringkas**  
  Lihat jumlah artikel, estimasi waktu baca, dan aktivitas baca mingguan.

- ⏱️ **Estimasi Waktu Membaca**  
  Fitur otomatis yang memperkirakan durasi membaca artikel.

- 🎨 **Desain Responsif dan Modern**  
  Tampilan yang menarik dan nyaman di berbagai perangkat.

## Cara Instalasi

1. Unduh atau clone repository ini ke komputer Anda.  
2. Buka Google Chrome dan akses `chrome://extensions/`.  
3. Aktifkan mode **Developer** di pojok kanan atas.  
4. Klik **Load unpacked** dan pilih folder ekstensi Catch Later.  
5. Ekstensi siap digunakan dan muncul di toolbar Chrome Anda.

## Cara Menggunakan

1. Buka halaman artikel yang ingin disimpan.  
2. Klik ikon Catch Later di toolbar Chrome.  
3. Tekan tombol **Simpan Artikel** untuk menyimpan konten.  
4. Untuk melihat artikel tersimpan, klik **Lihat Artikel Tersimpan** pada popup ekstensi.  
5. Kelola artikel melalui halaman yang disediakan.

## Struktur Berkas

├── manifest.json # Konfigurasi ekstensi Chrome
├── popup.html # Antarmuka popup
├── popup.js # Logika popup
├── content.js # Skrip pengambil konten artikel
├── saved-articles.html # Halaman untuk melihat artikel tersimpan
├── saved-articles.js # Logika halaman artikel tersimpan
└── README.md # Dokumentasi ini
