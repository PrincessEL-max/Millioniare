# Millionaire Tycoon 3D

    npm install
    npm run dev      # jalan di localhost
    npm run build    # hasil di dist/

Deploy ke Vercel: push ke GitHub, import di vercel.com/new (Vite terdeteksi otomatis).
Kontrol zoom papan: gunakan scroll mouse/trackpad atau tombol +, - dan 0 (reset). Titik Start hanya menjadi posisi awal dan tidak dapat dikunjungi lagi.

## Menu awal dan perlengkapan karakter
- Halaman awal berada di `ui/main-menu.js`; sebelum mulai, pilih mode, salah satu dari enam map, lalu karakter. Model karakter dan model 3D perlengkapan awal ditampilkan pada pemilihan karakter.
- Karakter: Mimi, Luna, PrincessEL, Rin, Tafa, dan Dika (4 perempuan, 2 laki-laki). Catatan: id internal `kai` menampilkan nama Tafa dan id `tafa` menampilkan nama Dika; id dipakai di simpanan game dan suara, jangan diganti sembarangan. Setiap karakter mulai dengan perlengkapan sesuai pemilihan menu.
- Map Jakarta: cash/bank $1.500; Jogja: $2.000/$2.000; Solo: $2.500/$2.500; Malang: $2.000/$2.000; Bandung: $2.500/$2.500; Indonesia: $5.000/$5.000.
- Efek suara dan musik permainan berada di `src/audio-assets/`; pengaturan **Sound effects** dan **Music** di menu awal mengaktifkan atau menonaktifkannya.

## Aplikasi Android
- Proyek Android dibangun dengan Capacitor; game berjalan di dalam aplikasi dan tidak membuka browser.
- Aplikasi dikunci ke orientasi landscape. Geser papan dengan satu jari; tombol +, −, dan ↺ di kiri bawah mengatur zoom.
- Tombol menu, alat, dan dadu berada di sisi kanan layar.
- Jalankan `npm install`, lalu `npm run android:sync`. Buka proyek dengan `npm run android:open`; di Android Studio pilih **Build → Build Bundle(s) / APK(s) → Build APK(s)**. APK debug tersedia di `android/app/build/outputs/apk/debug/app-debug.apk`.
- Setelah perubahan web, jalankan `npm run android:sync` lagi sebelum membuat APK baru.
- Di Android, geser dua jari pada papan untuk memutar kamera; cubit untuk zoom. Di komputer, klik kanan dan geser untuk memutar kamera.

## Bermain online
- Buat project Supabase, lalu salin Project URL dan anon/publishable key.
- Untuk lokal, salin `.env.example` menjadi `.env.local` dan isi `VITE_SUPABASE_URL` serta `VITE_SUPABASE_ANON_KEY`.
- Untuk Vercel, masukkan kedua nilai yang sama di **Project Settings → Environment Variables**, lalu deploy ulang.
- Buka game di dua perangkat, pilih **Online - beda perangkat**. Satu pemain membuat room dan membagikan kode 6 karakter; pemain kedua memilih **Gabung room** dan memasukkan kodenya.
- Pemain pembuat room mengatur saldo awal dan jumlah komputer sebelum memulai. Kedua perangkat melihat posisi pemain dan lemparan dadu secara langsung; kedua pemain manusia bergiliran mengendalikan pembelian, upgrade, dan keputusan bank dari perangkat masing-masing.

## Strategi komputer
- Komputer menilai pembelian dan upgrade lahan berdasarkan cadangan kas, nilai sewa, serta peluang melengkapi kelompok lahan.
- Komputer mengatur penarikan dari bank, memilih alat yang sesuai situasi, dan menyimpan alat sampai ada sasaran yang berguna. Remote Control membandingkan kemungkinan hasil dadu; alat penghalang diarahkan ke jalur yang diperkirakan dilalui lawan.
- Pet dinilai sesuai efeknya terhadap strategi dan kondisi keuangan komputer.

## Struktur src/
- map.js: bentuk jaringan jalan, titik start, lot, ikon, dan pohon. Persimpangan memilih arah acak; jalur buntu membuat pemain berbalik. Harga dan sewa lahan ditentukan oleh tingkat bintang area (`property-tiers.js` + tabel `PROPERTY_TIERS` di `config.js`): lahan kecil $100–$200, lahan besar (4x, memakai dua petak jalan) $200–$325, dengan harga bangunan dan sewa per level yang berbeda tiap bintang.
- items.js: katalog barang toko bus, mengambil item berharga dari `ui/items.js`. Toko menawarkan stok acak 2-11 alat per kunjungan dan menyembunyikan alat yang sudah ada di inventaris. Empat Street Sign arah layar tetap (↑ atas, → kanan, ↓ bawah, ← kiri) masing-masing seharga $75; Bomb ($50), Broom ($50), Computer ($50), Stop Sign ($125), Demolition ($175), For Rent ($150), Remote Control ($125), Lawyer ($325), Toolkit ($125), dan Thief ($125).
- config.js: harga, sewa, warna pemain, fungsi bantu.
- scene.js: renderer, kamera, cahaya.
- world.js: jalan, lot, pohon, bangunan.
- players.js: data pemain, karakter 3D, potret.
- dice.js: dadu 3D.
- ui.js: HUD, dialog, banner, simpan/muat, toko, dan penyimpanan alat.
- bot.js: evaluasi strategi komputer untuk uang, lahan, dadu, pet, dan penggunaan alat.
- multiplayer.js: room Supabase Realtime, sinkronisasi giliran, gerak pion, dan lemparan dadu online.
- game.js: aturan main dan giliran, penggunaan item lewat tombol **Alat** sebelum lempar dadu, rintangan jalan, rumah sakit, dan lelang.

Komponen `ui/property-card.js` dipakai untuk pembelian lahan dan peningkatan rumah/hotel dengan pratinjau model 3D per level melalui `ui/property-model.js`. Rumah menggunakan desain kedua dari `ui/building-kit-v2.js`, sedangkan hotel menggunakan desain pertama dari `ui/building-kit.js` yang dikirimkan. Tinggi rumah level 1–5 disesuaikan menjadi 1,1x, 1,3x, 1,4x, 1,5x, dan 1,7x tinggi acuan; tinggi hotel menjadi 1,5x tinggi sebelumnya pada tiap level. Pratinjau pembelian dan bangunan di papan memakai model serta skala yang sama. `ui/shop-ui.js` dipakai untuk toko bus dan penyimpanan alat: tombol centang memilih alat untuk digunakan, sedangkan tombol silang menutup penyimpanan. Folder `tools/` menyediakan aset model 3D; aturan dan pemakaian item diimplementasikan dalam `src/game.js`.

### Efek alat
- **Street Sign** dijual sebagai empat rambu arah layar tetap (↑ atas, → kanan, ↓ bawah, ← kiri); rambu memaksa pemain bergerak ke arah panah pada peta saat menabraknya, lalu hilang. Jika petak tidak memiliki jalur ke arah tersebut, rambu diabaikan.
- **Bomb** dapat dipasang di petak jalan mana pun dan meledak jika pion mengakhiri gerak tepat di atasnya. Korban tampak gosong, dibawa ke rumah sakit di luar papan, melewatkan 3 giliran, lalu kembali dari pintu keluar rumah sakit.
- **Broom** menampilkan petak merah dan meminta konfirmasi sebelum membersihkan rintangan di petak jalan mana pun. **Stop Sign** menghentikan pion saat menemuinya dan hilang setelah ditabrak.
- **Computer** menampilkan dialog bank untuk memilih jumlah uang yang ditarik dari tabungan.
- **Demolition** meminta konfirmasi dan dapat menyasar lahan kosong, lahan sendiri, atau lahan lawan; jika ada bangunan, visual peruntuhannya muncul di dekat lahan. **Toolkit** hanya dapat dipakai saat pion berhenti di lahan sendiri, menampilkan kartu peningkatan dengan biaya $0, pratinjau model level rumah/hotel berikutnya, dan sewa yang sesuai, lalu menaikkan satu level.
- **For Rent** dapat dimulai dengan mengetuk petak lahan mana pun—kosong, rumah, atau hotel—termasuk yang dimiliki pemain sendiri. Harga awal sama dengan harga lahan ditambah biaya bangunan; tawaran berikutnya naik $100 sampai semua penawar selain penawar tertinggi pass.
- **Remote Control** menampilkan dadu 2D yang dapat diklik untuk memilih angka 1–6; tekan **Go** untuk menyimpan hasil dadu berikutnya.
- **Lawyer** otomatis mengambil alih lahan lawan saat pion berhenti di sana dan menampilkan model alat. **Thief** mencuri 25% uang tunai pemain lain, bukan saldo bank, dengan model lebih besar di dekat target.
- Hewan peliharaan liar hanya dipungut jika pion mengakhiri gerakan tepat di petaknya; melintasi petak hewan tidak memungutnya.
- Rintangan dapat dipasang lewat **Alat → pilih item → arahkan kursor ke petak jalan** untuk melihat pratinjau, lalu klik petak sasaran. Item lainnya dapat dipakai lewat **Alat → pilih item** sebelum dadu dilempar. Komputer memakai alat otomatis dengan pilihan sesuai kondisi permainan.

## Performa dan baterai (HP)

- Layar sentuh dirender lebih ringan: antialias dimatikan, pixel ratio maksimal 1,25, dan render dibatasi sekitar 30 FPS (desktop sekitar 60 FPS). Atur di `src/scene.js` (`MOBILE_PIXEL_RATIO`) dan `src/game.js` (`FRAME_MS`).
- Render dan musik dijeda otomatis saat app/layar tidak aktif (`visibilitychange`).
- Thumbnail alat dan pratinjau properti di-cache, jadi toko dan kartu properti tidak membuat ulang WebGL context setiap dibuka.
- Build APK memakai variabel dari `.env.local` saat `npm run android:sync`. Variabel yang diisi di Vercel tidak ikut ke APK lokal; tanpa `.env.local` mode online di APK tidak akan berfungsi.
