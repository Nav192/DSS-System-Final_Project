# Sistem Pendukung Keputusan (SPK) Pemilihan Restoran

Sistem ini adalah aplikasi berbasis web yang dirancang untuk membantu pengguna memilih restoran terbaik berdasarkan berbagai kriteria menggunakan metode **Analytical Hierarchy Process (AHP)** dan **Multi-Objective Optimization on the basis of Ratio Analysis (MOORA)**.

## 🚀 Fitur Utama

- **AHP Weighting**: Menghitung bobot kepentingan untuk setiap kriteria berdasarkan perbandingan berpasangan (pairwise comparison) dengan pengecekan Consistency Ratio (CR).
- **MOORA Ranking**: Melakukan perangkingan alternatif restoran secara objektif berdasarkan bobot kriteria yang telah ditentukan.
- **Manajemen Restoran**: Kelola data restoran (Tambah, Lihat, Ubah, Hapus) yang akan dijadikan alternatif pilihan.
- **Visualisasi Data**: Menampilkan hasil perhitungan dan bobot kriteria dalam bentuk grafik yang interaktif.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Visualisasi**: [Recharts](https://recharts.org/)
- **Bahasa**: TypeScript

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Komputasi**: [NumPy](https://numpy.org/)
- **Validasi Data**: Pydantic

## 📊 Kriteria Penilaian

Sistem ini menggunakan 7 kriteria utama dalam penilaian:
1. **Harga**: Biaya rata-rata makan.
2. **Rasa**: Kualitas dan kelezatan makanan.
3. **Kebersihan**: Tingkat kebersihan area makan dan dapur.
4. **Kenyamanan**: Suasana dan fasilitas tempat duduk.
5. **Pelayanan**: Kecepatan dan keramahan staf.
6. **Fasilitas**: Ketersediaan WiFi, parkir, toilet, dll.
7. **Popularitas**: Rating atau ulasan dari pelanggan lain.

## 🏁 Cara Menjalankan Project

### 1. Prasyarat
- Node.js & npm (untuk Frontend)
- Python 3.8+ (untuk Backend)

### 2. Setup Backend
Masuk ke direktori backend, instal dependensi, dan jalankan server:
```bash
cd backend
# Buat virtual environment (opsional)
python -m venv venv
source venv/bin/activate  # Untuk Windows: venv\Scripts\activate

# Instal dependensi
pip install fastapi uvicorn numpy pydantic

# Jalankan server
uvicorn main:app --reload
```
Backend akan berjalan di `http://localhost:8000`.

### 3. Setup Frontend
Masuk ke direktori frontend, instal dependensi, dan jalankan aplikasi:
```bash
cd frontend
# Instal dependensi
npm install

# Jalankan aplikasi
npm run dev
```
Frontend akan berjalan di `http://localhost:3000`.

## 📂 Struktur Folder

- `/backend`: Berisi logika perhitungan AHP, MOORA, dan API FastAPI.
- `/frontend`: Berisi antarmuka pengguna berbasis Next.js.
- `/frontend/app`: Folder utama aplikasi (App Router).
- `/frontend/components`: Komponen UI yang dapat digunakan kembali.

---
