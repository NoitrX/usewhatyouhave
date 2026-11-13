# Web Scraper – UseWhatYouHave

Modul ini bertanggung jawab untuk mengumpulkan, memproses, dan membersihkan data resep masakan agar siap digunakan oleh antarmuka frontend **UseWhatYouHave**.

## 📌 Fitur Utama Scraper
- **Robots.txt & Ethics Compliant**: Menggunakan User-Agent yang jelas, jeda waktu (*polite delay*), dan mematuhi aturan crawling.
- **Schema.org / JSON-LD & HTML Parser**: Mengekstrak metadata resep standar (nama, deskripsi, bahan, takaran, langkah memasak, estimasi waktu, porsi, gambar).
- **Data Normalizer**: Mengonversi takaran, membersihkan string, mengelompokkan kategori, dan menyematkan alternatif bahan (*ingredient alternatives*).
- **Curated Dataset Generator**: Menghasilkan 28+ resep lengkap terverifikasi dalam format JSON yang siap dipakai secara instan.

## 📁 Struktur Folder
```text
scraper/
├── scraper.py          # Script utama web scraper & dataset builder
├── requirements.txt    # Dependensi Python (requests, beautifulsoup4)
└── README.md           # Dokumentasi operasional scraper
```

## ⚙️ Persyaratan Sistem
- Python 3.8 atau lebih tinggi
- PIP (Python Package Installer)

## 🚀 Cara Instalasi & Menjalankan

1. Masuk ke direktori `scraper`:
   ```bash
   cd scraper
   ```

2. Instal dependensi:
   ```bash
   pip install -r requirements.txt
   ```

3. Jalankan scraper untuk memproses dan memperbarui data:
   ```bash
   python scraper.py
   ```

Setelah proses selesai, file berikut akan diperbarui di direktori `../data/`:
- `data/recipes.json` (Katalog lengkap 28+ resep dengan gambar, langkah, takaran, tips, alternatif)
- `data/categories.json` (Daftar kategori resep beserta statistik jumlah resep dan ikon)
- `data/ingredients.json` (Daftar bahan-bahan populer untuk fitur filter 'Punya Bahan Apa')

## 🛡️ Etika Pengambilan Data (Ethics & Best Practices)
1. **Atribusi Sumber**: Setiap resep wajib mencantumkan nama sumber dan URL asli (`source.name` dan `source.url`).
2. **Tidak Mengklaim Hak Cipta**: Gambar langkah memasak yang tidak tersedia diganti dengan representasi visual/ilustrasi yang jujur tanpa memanipulasi keaslian foto.
3. **Penyimpanan Statis**: Scraping dijalankan saat proses pembaruan data secara berkala (*offline/pre-build*), bukan saat pengguna membuka website.
