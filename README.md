# UseWhatYouHave – Recipe Discovery Website 🍳

> **"Cook Something Delicious with What You Already Have."**

UseWhatYouHave adalah aplikasi web statis discovery resep masakan berbasis frontend (HTML5, Tailwind CSS, Vanilla JavaScript, dan JSON) dengan dukungan pengumpulan data resep melalui Python Web Scraper.

---

## 🌟 Fitur Utama

### 1. Homepage / Recipe Discovery
- **Hero Section Informatif**: Headline menarik, pencarian instan, dan *quick query tags* ("🍳 Punya Telur?", "🍗 Punya Ayam?", "🍚 Nasi Sisa", dll).
- **Punya Bahan Apa? (Pantry / Fridge Mode)**: Pilih bahan-bahan yang Anda miliki di rumah, dan sistem akan langsung merekomendasikan masakan yang cocok beserta persentase kecocokan (*match percentage*).
- **Kategori Masakan Interaktif**: Masakan Indonesia, Masakan Asia, Masakan Western, Makanan Tradisional, Dessert, Minuman, Makanan Sehat.
- **Pencarian & Filter Real-Time**: Pencarian instan tanpa *reload* halaman berdasarkan nama resep, bahan, kategori, waktu memasak (≤ 20 mnt, ≤ 35 mnt, ≤ 60 mnt), serta tingkat kesulitan.
- **Pengurutan (Sorting)**: Berdasarkan relevansi, nama A-Z / Z-A, waktu memasak tercepat, dan tingkat kesulitan.
- **Pagination / Load More**: Menampilkan koleksi resep secara efisien dan rapi.
- **Empty State**: Tampilan ramah ketika resep tidak ditemukan lengkap dengan tombol reset.

### 2. Recipe Detail Page
- **Recipe Hero**: Foto hidangan berkualitas tinggi, kategori, estimasi durasi, tingkat kesulitan, porsi, dan deskripsi.
- **Dynamic Servings Scaler**: Tombol `+` dan `-` untuk mengubah porsi masakan yang secara otomatis menghitung ulang seluruh takaran bahan secara dinamis (*real-time*).
- **Checklist Bahan**: Pengguna dapat mencoret bahan yang sudah disiapkan.
- **Panduan Memasak Step-by-Step**:
  - *Progress indicator* bar persentase langkah.
  - Kartu langkah aktif dengan gambar proses, judul, estimasi waktu, dan instruksi jelas.
  - Tombol navigasi *Sebelumnya* dan *Selanjutnya*.
  - *Timeline Overview* langkah memasak untuk melompat langsung ke langkah yang diinginkan.
  - *Celebration Modal* saat selesai memasak.
- **Tips Rahasia Koki**: Kumpulan trik kuliner agar hidangan lebih pulen, wangi, atau renyah.
- **Alternatif Bahan (Ingredient Substitutes)**: Rekomendasi bahan pengganti jika bahan utama sedang tidak tersedia di dapur.
- **Atribusi Sumber Asli**: Informasi nama sumber dan tautan menuju website resep asli.
- **Resep Terkait**: 3 rekomendasi hidangan sejenis.
- **Fitur Bagikan & Cetak**: Salin tautan (*Web Share API* / *Clipboard*) dan mode cetak (*Print Friendly*).

---

## 🎨 Tema & Palet Warna (Warm & Creative)

| Warna | Hex | Kegunaan |
|---|---|---|
| Cream | `#FFF7F0` | Latar belakang utama |
| Light Peach | `#FFE5D3` | Aksen kartu & badge |
| Primary Orange | `#E58B4A` | Tombol utama, hover, dan sorotan |
| Dark Brown | `#542512` | Teks utama & heading |
| Soft Brown | `#8C5132` | Teks pendukung & deskripsi |
| White | `#FFFFFF` | Permukaan kartu |
| Success Green | `#78A85B` | Status mudah & alternatif sukses |

**Tipografi:**
- Heading: *Nunito Sans* (Extra Bold / Black)
- Body text: *Plus Jakarta Sans*

---

## 📁 Struktur Direktori

```text
usewhatyouhave/
├── index.html                  # Halaman utama (Discovery & Filter)
├── recipe-detail.html          # Halaman detail resep & panduan memasak
├── assets/
│   ├── icons/                  # Ikon SVG & favicon
│   ├── images/                 # Gambar pendukung
│   ├── ingredients/            # Aset bahan
│   └── steps/                  # Aset langkah memasak
├── css/
│   └── style.css               # Kustomisasi animasi, tema hangat, & print
├── js/
│   ├── data-fallback.js        # Fallback dataset untuk direct file:// protocol
│   ├── recipes.js              # Service pemuat data & relasi resep
│   ├── search.js               # Algoritma pencarian nama & kecocokan bahan
│   ├── filter.js               # State manager filter & sorting
│   ├── main.js                 # Controller halaman beranda
│   └── recipe-detail.js        # Controller halaman detail resep
├── data/
│   ├── recipes.json            # 28+ resep lengkap terverifikasi
│   ├── categories.json         # Metadata kategori masakan
│   └── ingredients.json        # Indeks bahan untuk pencarian
└── scraper/
    ├── scraper.py              # Web scraper & dataset generator
    ├── requirements.txt        # Dependensi Python scraper
    └── README.md               # Dokumentasi teknis scraper
```

---

## 🚀 Cara Menjalankan

### Opsi 1: Menjalankan Langsung di Browser
Cukup klik ganda file `index.html` pada File Explorer Anda. Aplikasi ini sudah dilengkapi sistem `data-fallback.js` sehingga dapat langsung dibuka melalui protokol `file://` tanpa hambatan CORS!

### Opsi 2: Menggunakan Local Web Server (Laragon / Live Server / Python)
Karena folder proyek berada di `C:\laragon\www\usewhatyouhave`, Anda dapat membukanya via Laragon:
```text
http://localhost/usewhatyouhave/
```
Atau menggunakan server bawaan Python:
```bash
python -m http.server 8000
```
Buka browser di `http://localhost:8000`.

---

## 🕷️ Menjalankan Scraper & Memperbarui Data

Jika ingin memproses ulang atau menambah resep:
```bash
cd scraper
pip install -r requirements.txt
python scraper.py
```
Data JSON pada folder `data/` akan diperbarui secara otomatis.
