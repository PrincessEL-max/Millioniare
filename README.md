# Millionaire Tycoon 3D

    npm install
    npm run dev      # jalan di localhost
    npm run build    # hasil di dist/

Deploy ke Vercel: push ke GitHub, import di vercel.com/new (Vite terdeteksi otomatis).
Kontrol zoom papan: gunakan scroll mouse/trackpad atau tombol +, - dan 0 (reset). Titik Start hanya menjadi posisi awal dan tidak dapat dikunjungi lagi.

## Bermain online
- Buat project Supabase, lalu salin Project URL dan anon/publishable key.
- Untuk lokal, salin `.env.example` menjadi `.env.local` dan isi `VITE_SUPABASE_URL` serta `VITE_SUPABASE_ANON_KEY`.
- Untuk Vercel, masukkan kedua nilai yang sama di **Project Settings → Environment Variables**, lalu deploy ulang.
- Buka game di dua perangkat, pilih **Online - beda perangkat**. Satu pemain membuat room dan membagikan kode 6 karakter; pemain kedua memilih **Gabung room** dan memasukkan kodenya.
- Pemain pembuat room mengatur saldo awal dan jumlah komputer sebelum memulai. Kedua pemain manusia bergiliran mengendalikan dadu, pembelian, upgrade, dan keputusan bank dari perangkat masing-masing.

## Struktur src/
- map.js: bentuk jaringan jalan, titik start, lot, ikon, dan pohon. Persimpangan memilih arah acak; jalur buntu membuat pemain berbalik. Lahan kecil berharga 135/sewa dasar 25; lahan besar berukuran 4x, memakai dua petak jalan, dan berharga 200/sewa dasar 50. Sewa dikalikan jumlah petak yang dimiliki pemain pada baris tersebut.
- items.js: daftar barang toko bus.
- config.js: harga, sewa, warna pemain, fungsi bantu.
- scene.js: renderer, kamera, cahaya.
- world.js: jalan, lot, pohon, bangunan.
- players.js: data pemain, karakter 3D, potret.
- dice.js: dadu 3D.
- ui.js: HUD, dialog, banner, simpan/muat, toko.
- multiplayer.js: room Supabase Realtime dan sinkronisasi giliran permainan online.
- game.js: aturan main dan giliran.
