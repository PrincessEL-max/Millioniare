# Millionaire Tycoon 3D

    npm install
    npm run dev      # jalan di localhost
    npm run build    # hasil di dist/

Deploy ke Vercel: push ke GitHub, import di vercel.com/new (Vite terdeteksi otomatis).

## Struktur src/
- map.js: bentuk jaringan jalan, titik start, lot, ikon, dan pohon. Persimpangan memilih arah acak; jalur buntu membuat pemain berbalik. Lahan kecil berharga 135/sewa dasar 25; lahan besar berukuran 4x, memakai dua petak jalan, dan berharga 200/sewa dasar 50. Sewa dikalikan jumlah petak yang dimiliki pemain pada baris tersebut.
- items.js: daftar barang toko bus.
- config.js: harga, sewa, warna pemain, fungsi bantu.
- scene.js: renderer, kamera, cahaya.
- world.js: jalan, lot, pohon, bangunan.
- players.js: data pemain, karakter 3D, potret.
- dice.js: dadu 3D.
- ui.js: HUD, dialog, banner, simpan/muat, toko.
- game.js: aturan main dan giliran.
