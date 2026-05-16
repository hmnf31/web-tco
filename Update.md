## Update 

1. Navbar
** Buatkan 1 Page Baru Sponsorship , lalu di tambahkan ke bagian landing page untuk sesi Ruang Kolaborasi ini menjadi link ke page baru Sponsorship , lalu isi Page sponsorship ini dengan cara menjadi Sponsor atau ingin menjadi Sponsor TCO hubungi kontak CTA ke Whatsapp , lalu tambahkan Sesi link Tambahan kolom seperti Reservasi , nama , isi Pesan lalu tombol kirim langsung template rspv masuk untuk ke pesan Whatsapp

** Di bar bagian player lagu atau musik player tambahkan untuk atur Volume , lalu tambahkan running teks kecil "Klik disini , untuk membuka musik player Playlist TCO!"

2. Landing Page 

- Dibagian Artikel Jadikan setiap artikel menjadi Page Baru , lalu untuk Page artikel terbaru di landing page untuk berita atau artikel terbaru berada di bagian Kanan , jadi artikel Arena kings yang bulan Mei jadi yang terbaru.

- Untuk dinding prestasi sama bulan terbaru jadikan paling atas jadi urutannya Arena kings mei di bagian atas , bulan april bagian tengah, maret paling bawah

- Setelah bagian Dinding Prestasi Masukan tambahan keterangan Untuk Divisi Chess lalu ada tombol CTA untuk ke Page Divisi Chess.


3. Page Divisi

- ubah Top Player menjadi Member TCO Internal 
- lalu update player menjadi ini adalah username chess.com semua member TCO Internal : 

45had0w
69hehehehehehehehehehe69
 aanmarino
 Abdi0324
 Abdul_493
 adikember
 adwar3184
 afiatul
 Ai_isdarliansyah
 Akun_Pemalu
 Akun_Pemaluu
 andre_31_1993
 arshakabumi
 asaches03
 BaldwinKingsIV
 blitzkkrieg
 Blunders69
 bobob77
bung_iky
 carilho_pablo_eskobar199
 carilho_pablo_eskobar1993
 caturaga2018
 CH3VROLET
 chessjunior0
 Chris_Amoeba
 Depri_i
 Derpandora
 dewacucibaju
 diah89
 El_NorthDoustan
 Fans-TLID-RAFFY
 Galih_Citra
 gtempur
 Harjay_TCO
 Heex86
 indra11611
 IwanTambunan
 Iyus_515
 KingWalkVariations
 KKajow
 Kudojingkrak
 Linnxyn
 Liyaannnnnnn
 LoveAyyme
 mal_21j
 Munaa377
 Ochhi_03
 Official_TCO
 oke23q
 Pak_RT_05
 PangeranKe17
 patris01
 Pixelfern8
 PutraRian
 rais88
 rendi-Yanto
 Restu_Azikusuma
 Revelation_T
 runarunarunaruna
 Shakabumi
 StreetChess0502
 Sulfancuk
 SultanAulia
 Supri_adi_22
 szeschaa
 TCO_Constantine
 TCO_JAYA
 TeddyPlays_IG
 TheDartVine
 vozodd
 vpol3
 W-indrayana
 W_Ochhi
XICOLAGI

- ini untuk Link Club TCO : https://www.chess.com/club/turnamen-tiktok-chess-online-club

- Lalu kamu coba clone git ini dan pelajari cara wrapper API chess.com : https://github.com/andyruwruw/chess-web-api.git

- lalu buatkan ketika di list player ini ketika di klik memunculkan Tampilan untuk player 
Nama , Negara, fotoprofil di chess.com .
Rating Stats : Bullet , Blitz , Rapid
 ambil semua data dari API chess.com lalu tampilkan di kolom Setiap player yang di klik nantinya

- lalu untuk klub ambil stats klub dari API juga 



4. Page Arena Training

- Sesuaikan Bar Evaluation Jadi ketika User bermain sebagai Putih Bar Putih di bawah dan hitam di atas , sebaliknya jika user bermain hitam di balikan jadi Bar hitam berada di bawah dan putih di atas untuk progres kemenangannya.

- Update untuk Setiap Bot menjadi sesuai player anggota TCO Divisi Catur lalu sesuaikan Elo nya dengan stats Blitz saat itu .
- lalu di sisi engine atau bot nya sesuaikan lagi agar tidak terlalu bodoh untuk settingan Depth dan Nodes nya aga di perbesar namun di optimasi agar tidak terlalu berat di browser nantinya.

- Bagian Analisis ketika user memasukan username chess.com atau lichess nya ada tombol refresh untuk refresh game terbaru user , lalu di kolom bawah untuk prev , next page layout game user yang di masukannya.

lalu tambahkan sesi Review game nya menjadi 2 , pertama game analisis secara bar evaluation saja , lalu ke dua depth analisis secara mendalam seperti Ulasan Permainan di chess.com dengan klik tombol analisis game dulu untuk sesi ini 

 1. ENGINE INTEGRATION (Lozza Engine)
   - Load the Lozza engine (lozza.js) in a Web Worker.
   - For every move in the uploaded PGN (or fetched Chess.com/Lichess game), feed the position to Lozza using UCI commands ('position fen ...' followed by 'go depth 12' or 'go movetime 1000').
   - Capture the 'info score cp X' or 'mate Y' outputs from Lozza to map out the evaluation chart.

2. MOVE CLASSIFICATION LOGIC
   Create a function to compare the evaluation of the played move (Ev) against the engine's best move evaluation (Eb). Classify the move based on Centipawn (cp) Loss:
   - Book: If the move matches standard opening theory (use a basic chess opening book JSON array).
   - Best Move: Played move matches Lozza's top recommendation.
   - Brilliant: Played move involves a piece sacrifice but maintains or improves a winning evaluation.
   - Great Move: The only single move that prevents the position from becoming losing.
   - Good / Excellent: Centipawn loss is minimal (0 to 30 cp loss).
   - Inaccuracy: Centipawn loss is minor (31 to 75 cp loss).
   - Mistake: Centipawn loss is significant (76 to 150 cp loss).
   - Blunder: Centipawn loss is catastrophic (greater than 150 cp loss, or dropping from winning to completely losing/mated).

3. CHESS.COM-STYLE GAME REVIEW UI
   Once the user clicks "Mulai Analisis", show a modern dashboard containing:
   - Interactive Evaluation Bar: A vertical sidebar next to the chessboard showing a smooth transition between white and black advantage based on the current move's evaluation score.
   - Review Summary Cards: Display a grid counting the total badges for each category: Brilliant [Blue], Great [Cyan], Best [Green], Book [Grey], Inaccurate [Yellow], Mistake [Orange], Blunder [Red].
   - Performance Rating Estimate: Calculate an overall Accuracy Percentage (CAPS score formula) and convert it to a performance Elo rating display (e.g., "Akurasi: 87.5% - Estimasi Performa: 1850 Elo").
   - Evaluation Graph: A horizontal line chart (using Chart.js or Recharts) plotting the evaluation score across all moves so players can see the exact moment the game slipped.

4. USER INTERACTION
   - Users can click on any move in the moves list or any point on the chart, and the 'react-chessboard' component will automatically jump to that specific board position, showing the colored badge overlay on the board for that move.

Styling must match our dark premium esports theme (slate-950 background, electric blue accents, and responsive layout for mobile and desktop screens). Provide full implementation code

- bagian puzzle page , tambahkan puzzle lebih banyak sesi lagi dengan tema yang berbeda lalu di awal ada keterangan langkah siapa yang jalan lalu apa perintah puzzle ini , lalu untuk tombol hint menampilkan langkah yang benar atau langkah puzzle yang benar


