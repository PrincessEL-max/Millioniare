PETS PACK (3D untuk diletakkan di jalur)
========================================
models/baby.glb       bayi memegang gelas (duduk)      animasi: Idle           tinggi 1.0
models/cat_white.glb  kucing putih (duduk)             animasi: Idle           tinggi 1.0
models/cat_black.glb  kucing hitam (berdiri)           animasi: Idle, Walk     tinggi 0.7
models/santa.glb      Santa berlari                    animasi: Run, Idle      tinggi 1.3

Semua model: pivot di tengah alas kaki (y=0 = lantai), menghadap +Z. Ukuran ~0.8-1.8 MB per file.
Cara pasang di jalur: clone model, taruh di posisi petak (x, 0, z), putar (rotation.y) sesuai arah jalan.
Animasi: panggil mixer.clipAction(clip bernama 'Idle' / 'Walk' / 'Run').play(); semuanya looping.
Bungkus model dalam group/parent supaya posisi petaknya tetap.

Contoh Three.js:
  new GLTFLoader().load('models/santa.glb', g => {
    const holder = new THREE.Group(); holder.position.set(x, 0, z); holder.add(g.scene); scene.add(holder);
    const mixer = new THREE.AnimationMixer(g.scene);
    mixer.clipAction(g.animations.find(a => a.name === 'Run')).play();   // mixer.update(dt) tiap frame
  });

React (paket react-dropin sebelumnya):
  <ModelViewer url="/assets/models/pets/santa.glb" animation="Run" />

Jalankan viewer di VS Code: install extension "Live Server", klik kanan index.html > Open with Live Server.
Satu petak = 1.7 unit; kalau papan kamu beda ukuran, scale model di engine.
