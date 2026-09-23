## Update Maia Engine 

Maia-3 Online: Human-Behavioral Chess Engine

Tentang Proyek

Maia Engine adalah platform eksperimental yang berfokus pada studi perilaku catur manusia melalui Machine Learning. Berbeda dengan engine catur konvensional seperti Stockfish yang dirancang untuk mencapai keakuratan matematis tertinggi, proyek ini menggunakan model Maia-3 (NeurIPS 2024) yang dilatih dengan jutaan data permainan manusia.

Tujuan utama dari proyek ini adalah mensimulasikan pola pikir, kesalahan, dan gaya bermain manusia dalam berbagai kondisi, sehingga dapat menjadi alat untuk memahami psikologi catur, bukan sebagai alat bantu dalam kompetisi.


Ide Dasar

Proyek ini berangkat dari hipotesis bahwa untuk memahami permainan catur manusia, kita tidak memerlukan engine yang "sempurna", melainkan engine yang "manusiawi". Dengan mengintegrasikan sistem Fatigue (kelelahan) dan Emotion (emosi) ke dalam model probabilitas, proyek ini mengeksplorasi bagaimana faktor internal pemain mempengaruhi kualitas pengambilan keputusan di atas papan.

Fitur Utama
1. Persona-Based Gameplay

Sistem ini menggunakan parameter persona untuk membedakan gaya bermain:

    Style Bias: Memungkinkan simulasi gaya bermain spesifik (Aggressive, Positional, Solid, Technical, Universal).

    Temperature Control: Mengatur tingkat keacakan langkah (dari konsisten hingga impulsif).

2. Dinamika Psikologis (Bio-Feedback Simulation)

Proyek ini mengimplementasikan dua sistem unik untuk meniru fluktuasi performa manusia:

    Fatigue System: Model simulasi penurunan akurasi pada permainan durasi panjang (misalnya: transisi dari Blitz ke Rapid).

    Emotion System: Fitur yang membuat model bereaksi terhadap posisi tertentu, yang secara dinamis mempengaruhi temperature (tingkat keacakan langkah) berdasarkan situasi permainan.

3. Arsitektur Teknis

Proyek ini menggabungkan deep learning dengan sistem web-server yang modular:

    Core Model: Berbasis Maia-2, model neural network yang memprediksi langkah manusia berdasarkan database permainan di tingkat ELO tertentu.

    Flask Backend: API server yang mengelola logika persona dan evaluasi posisi.

    Web UI: Antarmuka untuk visualisasi best move, probabilitas kemenangan, dan pemantauan status "mood" engine secara real-time.

Struktur Proyek

    /servermaia2: Logika backend dan API endpoints.

    /maia2: Library inti dan arsitektur model neural network.

    /maia2_models: Penyimpanan weights model untuk berbagai target ELO.

    /extension: Komponen interaksi untuk pengujian integrasi browser-based.

    /templates: Struktur antarmuka pengguna untuk visualisasi data evaluasi.


title: Maia-2 Human-like Chess Engine
emoji: ♟️
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false

Maia-2 Human-like Chess Engine

Chess Engine + Flask Server berbasis Maia-2 (NeurIPS 2024) — model AI catur yang memprediksi langkah seperti manusia berdasarkan level ELO, bukan engine penghitung varian.

Berbeda dengan Stockfish/LC0 yang mencari langkah terkuat, Maia-2 memprediksi langkah yang paling mungkin dimainkan manusia di rating tertentu. Proyek ini menambahkan layer persona, emosi, fatigue, style biasing, dan repertoire memory di atas Maia-2 untuk simulasi kepribadian yang lebih realistis.
Dual-Server Mode

Proyek mendukung dua mode koneksi:
Mode 	URL 	Kegunaan
Local 	http://127.0.0.1:5000 	Development, offline, tanpa internet
Online (HF Spaces) 	https://hmnf31-maia2online.hf.space 	Produksi, langsung pakai, tanpa instal Python

Fitur

Persona System
6 kepribadian dengan parameter unik:
Persona 	ELO 	Temperamen 	Gaya 	Emosi 	Fatigue
Pemula Antusias 	1200 	0.95 	Agresif 	Aktif 	Aktif
Pemain Klub 	1500 	0.70 	Solid 	Aktif 	Aktif
Tournament Grinder 	1800 	0.45 	Positional 	Aktif 	Aktif
Talenta Muda 	2100 	0.35 	Agresif 	Aktif 	Nonaktif
Master Senior 	2400 	0.15 	Technical 	Nonaktif 	Nonaktif
The Joker 	1400 	1.50 	Acak 	Aktif 	Aktif

Human-like Behaviour

    Stochastic Sampling — memilih langkah dengan sampling dari distribusi probabilitas (bukan argmax), dikontrol oleh temperature

    Emotion State Machine — mood berubah berdasarkan performa: calm, confident, frustrated, tired, pressured, aggressive

    Style Biasing — preferensi gaya main (positional, aggressive, solid, technical)

    Fatigue System — akurasi menurun pada game panjang (>40 langkah)

    Transposition Table — repertoire konsisten: posisi yang sama selalu dijawab langkah yang sama

Features

    Eval Bar — win probability bar real-time
    Blunder Detection — peringatan jika langkah menyimpang jauh dari rekomendasi
    End Game Analysis — analisis otomatis setelah game selesai
    API Key Support — proteksi server online dengan key


## Irwin Analitics 

📁 Struktur Proyek (Modular)



irwin-analytics/
├── config/
│   └── engine_config.py      # Pengaturan path Stockfish, kedalaman analisis (depth), dan threshold skor
├── core/
│   ├── __init__.py
│   ├── chess_api.py          # Mengambil data PGN dari API Chess.com / Lichess
│   ├── evaluator.py          # Menggunakan Stockfish untuk menghitung ACPL dan Top Engine Matches
│   ├── time_analyser.py      # Menghitung deviasi standar dan konsistensi waktu per langkah
│   └── maia_matcher.py       # Menghitung persentase kecocokan langkah dengan Model Maia
├── models/
│   └── irwin_model.py        # Algoritma skoring statistik & klasifikasi (Clean, Suspicious, Cheat)
├── tasks/
│   └── worker.py             # Manajemen antrean (Celery/BullMQ) untuk proses background asynchronous
├── main.py                   # Endpoint API (FastAPI) untuk memicu analisis
└── README.md                 # Dokumentasi fitur analisis



# 🧠 Irwin Cheat Analytics Engine (Anti-Cheat Module)

Modul ini adalah sistem deteksi kecurangan (*anti-cheat*) berbasis statistik untuk website klub catur. Terinspirasi dari algoritma **Irwin** milik Lichess, fitur ini menganalisis pola perilaku bermain dari puluhan game terakhir pengguna untuk mendeteksi anomali bantuan komputer (*selective/mixing engine cheat*), manipulasi rating, dan inkonsistensi manajemen waktu.

## 🚀 Fitur Utama

Sistem tidak mengandalkan deteksi *real-time* sekali langkah, melainkan menggunakan tiga pilar analisis data historis:
1. **Analisis Metrik Centipawn (ACPL & T3):** Mengukur stabilitas akurasi posisi menggunakan Stockfish.
2. **Analisis Telemetri Waktu (*Time Management Deviation*):** Mendeteksi pola melangkah yang terlalu konstan (ciri utama pelaku joki/user yang menyalin langkah dari perangkat lain).
3. **Maia Chess Match Rate:** Membandingkan keputusan langkah pemain dengan model perilaku manusia asli (**Maia Model**) versus model bot optimal (**Stockfish**).

---

## 📊 Metrik Evaluasi Inti

Sistem ini mengekstrak data dari PGN dan menghitung variabel-variabel berikut:

### 1. Average Centipawn Loss (ACPL)
Mengukur rata-rata penurunan kualitas posisi per langkah (1 Centipawn = 1/100 dari keunggulan pion).
*   **Manusia (Rating 1000 - 1800):** ACPL berkisar antara `30.0` hingga `60.0`.
*   **Engine/Cheater:** ACPL konsisten di bawah `12.0` pada fase posisi rumit (*middle-game*).

### 2. Top Engine Match (T3)
Menghitung persentase seberapa sering langkah pemain cocok dengan rekomendasi Top 1, Top 2, atau Top 3 dari Stockfish pada kedalaman (*depth*) 15. Kenaikan drastis T1 ($>85\%$) pada situasi taktis yang rumit memicu bendera peringatan (*flag*).

### 3. Standar Deviasi Waktu (*Move Time Variance*)
Manusia melangkah cepat pada teori pembukaan dan melambat saat kalkulasi rumit. Modul ini menghitung varians waktu:
$$\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^{N}(t_i - \mu)^2}$$
Jika $\sigma$ mendekati 0 (misalnya, pemain selalu melangkah konstan setiap 4-5 detik baik pada langkah paksaan maupun posisi rumit), akun ditandai sebagai pengguna bantuan eksternal.

### 4. Maia Match Rate (Metrik Unik Klub)
Mengukur kecocokan langkah dengan **Maia Chess Model** yang sesuai rating target. Jika pemain rating 1200 memiliki kecocokan rendah dengan Maia-1200 tetapi memiliki kecocokan $90\%$ dengan Stockfish Top Line, tingkat probabilitas kecurangan meningkat secara signifikan.

---

## 🛠️ Alur Kerja Sistem (Workflow)

[Input Username]
│
▼
[Fetch 30-50 Games via Chess.com API]
│
▼
[Push to Celery Queue Worker]  <--- Mencegah server utama blocking/timeout
│
▼
[Run Parallel Evaluation]
├── core/evaluator.py (Hitung ACPL & T3 via Stockfish)
├── core/time_analyser.py (Hitung Deviasi Waktu dari PGN)
└── core/maia_matcher.py (Hitung Maia Match Rate)
│
▼
[Statistical Scoring Model]    <--- Menggabungkan bobot semua metrik
│
▼
[Output Result JSON & UI Flag] <--- Hijau / Kuning / Merah

---

## 🖥️ Spesifikasi Output API

Endpoint `POST /api/v1/analytics/analyze` akan mengembalikan struktur data berikut:

```json
{
  "username": "target_account",
  "games_analyzed": 30,
  "verdict": "HIGHLY_SUSPICIOUS",
  "confidence_score": 88.5,
  "metrics_summary": {
    "average_acpl": 14.2,
    "top_1_match_rate": 82.4,
    "time_standard_deviation": 0.85,
    "maia_match_rate": 31.2
  },
  "flags": [
    "ACPL_BELOW_THRESHOLD_IN_COMPLEX_POSITIONS",
    "ABNORMAL_MOVE_TIME_CONSISTENCY"
  ]
}

Klasifikasi Status di UI Website:

    🟢 CLEAN: Perilaku statistik normal dan sesuai dengan performa rating manusia.

    🟡 SUSPICIOUS: Terdapat indikasi mixing engine (akurasi melonjak tajam hanya di fase kritis). Memerlukan review manual oleh Admin Klub.

    🔴 HIGHLY PROBABLE CHEAT: Metrik melampaui batas toleransi manusia. Akun otomatis dilarang (banned) dari turnamen internal klub.

    