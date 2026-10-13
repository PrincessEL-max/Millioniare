UI PACK  (kartu properti + toko)
================================
js/sound.js          -> suara: tuk() ketukan palu, ching() kasir, nope() gagal beli
js/icons.js          -> ikon bawaan: 'bomb', 'sign', 'placeholder'
js/items.js          -> DAFTAR ITEM (isi / gabungkan di sini)
js/property-card.js  -> createPropertyCard(el, {name, cost, rent, onClose, onStrike})
js/shop-panel.js     -> createShopPanel(el, {items, onBuy, onSelect, formatPrice})
index.html           -> contoh pemakaian

Jalankan di VS Code: install extension "Live Server", klik kanan index.html > Open with Live Server.
(Modul .js tidak bisa jalan kalau index.html dibuka dengan double-click.)

TOKO
----
Placeholder item (isi di js/items.js atau panggil shop.setItems([...])):
  { id, name, price, description, icon }
  icon bisa: 'bomb' | 'sign' | 'placeholder' | '<svg ...>' | 'gambar/item.png' | elemen HTML | function(box){}
Daftar bisa di-scroll (mouse wheel / sentuh / panah atas-bawah). Ketuk item untuk memilih,
item terpilih tampil di panel besar. Ketuk kasir (atau tekan Enter) untuk membeli -> "ching!".

  const shop = createShopPanel(el, { items: ITEMS,
    onBuy(item){ if(uang < item.price) return false;  // false = gagal, bunyi "bzzt"
                 uang -= item.price; } });
  shop.setItems(itemBaru);  shop.select(2);  shop.buy();
Event DOM di elemen: 'shop:select', 'shop:buy'  (event.detail = {item, index})
Slot isian di tiap baris untuk kode lain: [data-slot="icon" | "name" | "description" | "price"]

KARTU PROPERTI
--------------
  const card = createPropertyCard(el, { name:'Swanston  st', cost:200, rent:50 });
  card.setData({ name, cost, rent });   card.strike();   // strike() = palu mengetuk + "tuk"
Event DOM: 'card:strike', 'card:close'.

Memakai suara sendiri di luar komponen:  import {tuk, ching, nope} from './js/sound.js';
