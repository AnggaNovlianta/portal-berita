-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 03 Jun 2026 pada 22.37
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `portal_berita`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `category`
--

INSERT INTO `category` (`id`, `name`, `slug`, `createdAt`, `updatedAt`) VALUES
(1, 'Berita Prabumulih', 'berita-prabumulih', '2026-05-30 15:04:38.210', '2026-05-30 15:04:38.210'),
(2, 'Umum', 'umum', '2026-05-31 22:24:05.140', '2026-05-31 22:24:05.140'),
(3, 'Nasional', 'nasional', '2026-05-31 22:24:05.140', '2026-05-31 22:24:05.140'),
(4, 'Internasional', 'internasional', '2026-05-31 22:24:05.140', '2026-05-31 22:24:05.140'),
(5, 'Ekonomi & Bisnis', 'ekonomi-bisnis', '2026-05-31 22:24:05.140', '2026-05-31 22:24:05.140'),
(6, 'Teknologi', 'teknologi', '2026-05-31 22:24:05.140', '2026-05-31 22:24:05.140'),
(7, 'Opini', 'opini', '2026-05-31 22:24:05.140', '2026-05-31 22:24:05.140');

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `parentId` int(11) DEFAULT NULL,
  `orderIndex` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `post`
--

CREATE TABLE `post` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `thumbnail` varchar(191) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `views` int(11) NOT NULL DEFAULT 0,
  `authorId` varchar(191) DEFAULT NULL,
  `categoryId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `post`
--

INSERT INTO `post` (`id`, `title`, `slug`, `content`, `thumbnail`, `image`, `published`, `views`, `authorId`, `categoryId`, `createdAt`, `updatedAt`) VALUES
('1c541ae8-b24e-4f81-9927-cee0dfc4b765', 'Revitalisasi Jalur Logistik Komuter Palembang-Prabumulih Masuki Fase Akhir', 'revitalisasi-jalur-logistik-komuter-palembang-prabumulih-masuki-fase-akhir', '<p>Proyek&nbsp;perbaikan&nbsp;infrastruktur&nbsp;jalan&nbsp;utama&nbsp;dan&nbsp;jalur&nbsp;kereta&nbsp;logistik&nbsp;yang&nbsp;menghubungkan&nbsp;Kota&nbsp;Palembang.</p>', '/uploads/berita-1780278598173.webp', NULL, 1, 6, NULL, 3, '2026-05-31 22:24:48.867', '2026-06-03 20:21:04.043'),
('4e97f1f1-3935-484d-9dd7-fe608c495240', 'Inovasi Ritel Abad 21: Strategi Manajemen Rantai Pasok Berbasis Kecerdasan Buatan', 'inovasi-ritel-abad-21-strategi-manajemen-rantai-pasok-berbasis-kecerdasan-buatan', 'Manajemen stok logistik selalu menjadi tantangan terbesar bagi pelaku bisnis grosir dan eceran.', NULL, NULL, 1, 0, NULL, 5, '2026-05-31 22:24:48.867', '2026-05-31 22:24:48.867'),
('4f917ef0-bfac-4044-9040-d493f311e044', 'Malam Sibuk di Pustaka Publik: Sistem Redaksi Mulai Beroperasi', 'malam-sibuk-pustaka-publik-v2', 'Sistem backend dan frontend akhirnya terhubung dengan sempurna malam ini. Pemimpin redaksi siap menyajikan berita terkini.', NULL, NULL, 1, 5, 'f4a9512b-a656-4245-ac82-2e6ad0dd71a7', 1, '2026-05-30 16:29:15.254', '2026-06-03 19:48:33.205'),
('4f99cacf-c387-4b0e-8142-3a0830ff5b41', 'Geliat Ritel Modern Daerah: AAC Freshmart Dorong Ekonomi Lokal Prabumulih', 'geliat-ritel-modern-daerah-aac-freshmart-dorong-ekonomi-lokal-prabumulih', 'Perkembangan industri ritel di Sumatera Selatan menunjukkan tren positif di kuartal kedua tahun 2026. Salah satu penggerak utamanya adalah ekspansi ritel modern lokal seperti AAC Freshmart di Kota Prabumulih.', NULL, NULL, 1, 0, NULL, 5, '2026-05-31 22:24:48.867', '2026-05-31 22:24:48.867'),
('6c1f1149-26df-4ca8-93a7-2bc8e129f5bd', 'Penerapan Kurikulum Berbasis Kecerdasan Buatan Mulai Diuji Coba di Kampus Daerah', 'penerapan-kurikulum-berbasis-kecerdasan-buatan-mulai-diuji-coba-di-kampus-daerah', '<p>Sejumlah&nbsp;perguruan&nbsp;tinggi&nbsp;di&nbsp;daerah&nbsp;mulai&nbsp;mengintegrasikan&nbsp;metodologi&nbsp;pemrograman&nbsp;tingkat&nbsp;lanjut.</p>', '/uploads/1780247451544-5741827.jpg', NULL, 1, 4, NULL, 2, '2026-05-31 22:24:48.867', '2026-06-01 06:24:25.264'),
('7b16d97a-bf2a-42c4-8839-68d5b40601f6', 'Pemerintah Tingkatkan Target Akses Digitalisasi untuk Sektor UMKM Sumatera Selatan', 'pemerintah-tingkatkan-target-akses-digitalisasi-untuk-sektor-umkm-sumatera-selatan', 'Kementerian Koperasi dan UMKM menetapkan target ambisius untuk tahun 2026.', NULL, NULL, 1, 0, NULL, 3, '2026-05-31 22:24:48.867', '2026-05-31 22:24:48.867'),
('98fa7a55-938b-4dd7-b3c9-0e427b7c36f2', 'Menjaga Integritas Jurnalisme di Tengah Gempuran Konten AI Generatif', 'menjaga-integritas-jurnalisme-di-tengah-gempuran-konten-ai-generatif', 'Kehadiran alat pembuat teks otomatis berbasis kecerdasan buatan memicu perdebatan sengit di ruang redaksi global.', NULL, NULL, 1, 0, NULL, 7, '2026-05-31 22:24:48.867', '2026-05-31 22:24:48.867'),
('99d6179d-e7f2-44c3-96ab-7e7d06221a79', 'Mengenal Arsitektur Prisma 7: Mengapa Koneksi Database Kini Wajib Menggunakan Adapter?', 'mengenal-arsitektur-prisma-7-mengapa-koneksi-database-kini-wajib-menggunakan-adapter', 'Rilisnya Prisma versi 7 membawa perubahan drastis dalam ekosistem Node.js dan TypeScript.', NULL, NULL, 1, 0, NULL, 6, '2026-05-31 22:24:48.867', '2026-05-31 22:24:48.867'),
('c150ea33-3112-4a26-8832-2111a0213a8b', 'Viral Surat Terbuka Ujang, Sopir Taksi Online, untuk Komisi II DPRD: Ubah Pasar Prabumulih dari “Raksasa Pincang” Jadi Penggerak Ekonomi', 'viral-surat-terbuka-ujang-sopir-taksi-online-untuk-komisi-ii-dprd-ubah-pasar-prabumulih-dari-raksasa-pincang-jadi-penggerak-ekonomi', '<p>PRABUMULIH,&nbsp;zonamerahnews.id&nbsp;–&nbsp;Sebuah&nbsp;surat&nbsp;terbuka&nbsp;yang&nbsp;ditulis&nbsp;oleh&nbsp;sosok&nbsp;bernama&nbsp;Ujang,&nbsp;warga&nbsp;asli&nbsp;Prabumulih&nbsp;yang&nbsp;kini&nbsp;berprofesi&nbsp;sebagai&nbsp;sopir&nbsp;taksi&nbsp;online&nbsp;di&nbsp;Jakarta,&nbsp;belakangan&nbsp;ini&nbsp;menjadi&nbsp;perbincangan&nbsp;hangat&nbsp;dan&nbsp;viral&nbsp;di&nbsp;media&nbsp;sosial.&nbsp;Lewat&nbsp;tulisannya,&nbsp;Ujang&nbsp;ingin&nbsp;menyampaikan&nbsp;pandangan&nbsp;kritis&nbsp;sekaligus&nbsp;saran&nbsp;strategis&nbsp;mengenai&nbsp;urat&nbsp;nadi&nbsp;perekonomian&nbsp;Kota&nbsp;Prabumulih&nbsp;kepada&nbsp;salah&nbsp;satu&nbsp;Anggota&nbsp;Komisi&nbsp;II&nbsp;DPRD&nbsp;Kota&nbsp;Prabumulih.&nbsp;Surat&nbsp;terbuka&nbsp;tersebut&nbsp;ditulis&nbsp;secara&nbsp;khusus&nbsp;pada&nbsp;Jum’at&nbsp;(22/5/2026).&nbsp;</p><p></p><p>Dalam&nbsp;pesannya&nbsp;yang&nbsp;lugas&nbsp;dan&nbsp;berisi&nbsp;itu,&nbsp;Ujang&nbsp;mengajak&nbsp;DPRD&nbsp;Kota&nbsp;Prabumulih&nbsp;untuk&nbsp;bersama-sama&nbsp;meneliti,&nbsp;membedah,&nbsp;dan&nbsp;membenahi&nbsp;jantung&nbsp;perekonomian&nbsp;warga,&nbsp;yakni&nbsp;kawasan&nbsp;Pasar&nbsp;Prabumulih,&nbsp;yang&nbsp;meliputi&nbsp;Pasar&nbsp;Tradisional&nbsp;Modern&nbsp;(PTM&nbsp;1)&nbsp;dan&nbsp;Pasar&nbsp;Tradisional&nbsp;Modern&nbsp;(PTM&nbsp;2).&nbsp;Menurut&nbsp;pengamatan&nbsp;Ujang,&nbsp;Prabumulih&nbsp;adalah&nbsp;kota&nbsp;perlintasan&nbsp;yang&nbsp;memiliki&nbsp;posisi&nbsp;sangat&nbsp;strategis&nbsp;dalam&nbsp;jaringan&nbsp;ekonomi&nbsp;dan&nbsp;logistik&nbsp;wilayah.&nbsp;Transaksi&nbsp;keuangan&nbsp;di&nbsp;kawasan&nbsp;pasar&nbsp;ini&nbsp;disebutnya&nbsp;mencapai&nbsp;miliaran&nbsp;rupiah&nbsp;setiap&nbsp;harinya.&nbsp;Pasar&nbsp;Prabumulih&nbsp;menjadi&nbsp;pusat&nbsp;pertemuan&nbsp;ribuan&nbsp;pedagang&nbsp;dan&nbsp;pembeli&nbsp;yang&nbsp;tidak&nbsp;hanya&nbsp;berasal&nbsp;dari&nbsp;kota&nbsp;ini&nbsp;saja,&nbsp;melainkan&nbsp;juga&nbsp;datang&nbsp;dari&nbsp;luar&nbsp;daerah&nbsp;seperti&nbsp;dari&nbsp;Kabupaten&nbsp;Muara&nbsp;Enim,&nbsp;Penukal&nbsp;Abab&nbsp;Lematang&nbsp;Ilir&nbsp;(PALI),&nbsp;hingga&nbsp;Ogan&nbsp;Ilir.&nbsp;“Pasar&nbsp;Prabumulih&nbsp;ini&nbsp;ibarat&nbsp;raksasa&nbsp;ekonomi&nbsp;yang&nbsp;cukup&nbsp;besar.&nbsp;Tapi&nbsp;sayang&nbsp;sekali,&nbsp;raksasa&nbsp;ini&nbsp;bajunya&nbsp;compang-camping&nbsp;dan&nbsp;jalannya&nbsp;pincang,”&nbsp;tulis&nbsp;Ujang&nbsp;dalam&nbsp;suratnya&nbsp;yang&nbsp;penuh&nbsp;perumpamaan.&nbsp;Ujang&nbsp;pun&nbsp;memaparkan&nbsp;kondisi&nbsp;riil&nbsp;yang&nbsp;ia&nbsp;temukan&nbsp;di&nbsp;lapangan,&nbsp;mulai&nbsp;dari&nbsp;kemacetan&nbsp;parah,&nbsp;bangunan&nbsp;dengan&nbsp;atap&nbsp;bocor,&nbsp;saluran&nbsp;air&nbsp;yang&nbsp;sering&nbsp;tersumbat,&nbsp;hingga&nbsp;sistem&nbsp;manajemen&nbsp;yang&nbsp;dinilai&nbsp;berjalan&nbsp;di&nbsp;tempat.&nbsp;Menurut&nbsp;analisisnya,&nbsp;akar&nbsp;dari&nbsp;segala&nbsp;permasalahan&nbsp;tersebut&nbsp;terletak&nbsp;pada&nbsp;sistem&nbsp;pengelolaan&nbsp;yang&nbsp;masih&nbsp;menggunakan&nbsp;pola&nbsp;Unit&nbsp;Pelaksana&nbsp;Teknis&nbsp;Daerah&nbsp;(UPTD)&nbsp;di&nbsp;bawah&nbsp;naungan&nbsp;Dinas&nbsp;Perindustrian&nbsp;dan&nbsp;Perdagangan&nbsp;(Disperindag)&nbsp;Kota&nbsp;Prabumulih.&nbsp;Ujang&nbsp;memberikan&nbsp;analogi&nbsp;tegas&nbsp;kepada&nbsp;Anggota&nbsp;DPRD&nbsp;tersebut:&nbsp;mempertahankan&nbsp;pengelolaan&nbsp;pasar&nbsp;sekelas&nbsp;Pasar&nbsp;Prabumulih&nbsp;dengan&nbsp;sistem&nbsp;UPTD&nbsp;itu&nbsp;sama&nbsp;artinya&nbsp;dengan&nbsp;“menyuruh&nbsp;mobil&nbsp;F1&nbsp;balapan,&nbsp;tapi&nbsp;mesin&nbsp;yang&nbsp;dipakai&nbsp;justru&nbsp;mesin&nbsp;potong&nbsp;rumput”.&nbsp;</p><p></p><p>Berikut&nbsp;adalah&nbsp;empat&nbsp;alasan&nbsp;utama&nbsp;yang&nbsp;dikemukakan&nbsp;Ujang&nbsp;mengapa&nbsp;sistem&nbsp;UPTD&nbsp;sudah&nbsp;tidak&nbsp;relevan&nbsp;dan&nbsp;harus&nbsp;diubah&nbsp;menjadi&nbsp;Perusahaan&nbsp;Umum&nbsp;Daerah&nbsp;(Perumda)&nbsp;atau&nbsp;Badan&nbsp;Usaha&nbsp;Milik&nbsp;Daerah&nbsp;(BUMD):&nbsp;</p><p></p><p>1.&nbsp;Anggaran&nbsp;Kaku&nbsp;vs&nbsp;Kebutuhan&nbsp;Lapangan&nbsp;Pada&nbsp;sistem&nbsp;UPTD,&nbsp;seluruh&nbsp;pendapatan&nbsp;dari&nbsp;sewa&nbsp;ruko,&nbsp;los,&nbsp;hingga&nbsp;retribusi&nbsp;wajib&nbsp;disetorkan&nbsp;penuh&nbsp;ke&nbsp;Kas&nbsp;Daerah&nbsp;dan&nbsp;masuk&nbsp;sebagai&nbsp;Pendapatan&nbsp;Asli&nbsp;Daerah&nbsp;(PAD).&nbsp;Akibatnya,&nbsp;UPTD&nbsp;tidak&nbsp;memiliki&nbsp;dana&nbsp;operasional&nbsp;mandiri&nbsp;untuk&nbsp;melakukan&nbsp;perbaikan&nbsp;secara&nbsp;cepat.&nbsp;Jika&nbsp;ada&nbsp;kerusakan&nbsp;seperti&nbsp;atap&nbsp;bocor&nbsp;atau&nbsp;saluran&nbsp;mampet,&nbsp;pengelola&nbsp;harus&nbsp;menunggu&nbsp;proses&nbsp;pengajuan&nbsp;dan&nbsp;persetujuan&nbsp;Anggaran&nbsp;Pendapatan&nbsp;dan&nbsp;Belanja&nbsp;Daerah&nbsp;(APBD)&nbsp;yang&nbsp;berbelit.&nbsp;Sebaliknya,&nbsp;jika&nbsp;dikelola&nbsp;BUMD,&nbsp;pengelola&nbsp;memiliki&nbsp;otonomi&nbsp;keuangan.&nbsp;Dana&nbsp;retribusi&nbsp;masuk&nbsp;ke&nbsp;kas&nbsp;perusahaan,&nbsp;sehingga&nbsp;jika&nbsp;ada&nbsp;kerusakan&nbsp;hari&nbsp;ini,&nbsp;Direksi&nbsp;bisa&nbsp;langsung&nbsp;memperbaikinya&nbsp;hari&nbsp;itu&nbsp;juga.&nbsp;Lebih&nbsp;fleksibel,&nbsp;cepat,&nbsp;dan&nbsp;profesional.&nbsp;</p><p>2.&nbsp;Birokrasi&nbsp;ASN&nbsp;vs&nbsp;Insting&nbsp;Bisnis&nbsp;Kepala&nbsp;UPTD&nbsp;adalah&nbsp;Aparatur&nbsp;Sipil&nbsp;Negara&nbsp;(ASN)&nbsp;yang&nbsp;pola&nbsp;kerjanya&nbsp;didesain&nbsp;untuk&nbsp;taat&nbsp;aturan&nbsp;dan&nbsp;birokrasi,&nbsp;bukan&nbsp;berorientasi&nbsp;pada&nbsp;ekspansi&nbsp;bisnis.&nbsp;Lebih&nbsp;jauh&nbsp;lagi,&nbsp;jika&nbsp;pejabat&nbsp;kepala&nbsp;UPTD&nbsp;dirotasi,&nbsp;maka&nbsp;program&nbsp;pengembangan&nbsp;pasar&nbsp;sering&nbsp;kali&nbsp;ikut&nbsp;berhenti&nbsp;atau&nbsp;berubah&nbsp;arah.&nbsp;Berbeda&nbsp;dengan&nbsp;BUMD&nbsp;yang&nbsp;dipimpin&nbsp;oleh&nbsp;tenaga&nbsp;profesional&nbsp;(bisa&nbsp;dari&nbsp;kalangan&nbsp;swasta).&nbsp;Mereka&nbsp;memiliki&nbsp;naluri&nbsp;bisnis&nbsp;yang&nbsp;tajam,&nbsp;pola&nbsp;pendekatan&nbsp;Business&nbsp;to&nbsp;Business&nbsp;(B-to-B),&nbsp;bukan&nbsp;pola&nbsp;kerja&nbsp;“siap&nbsp;pimpinan”&nbsp;yang&nbsp;kaku.&nbsp;</p><p>3.&nbsp;Penataan&nbsp;PKL:&nbsp;Kucing-kucingan&nbsp;vs&nbsp;Solusi&nbsp;Komersial&nbsp;Selama&nbsp;ini,&nbsp;penanganan&nbsp;Pedagang&nbsp;Kaki&nbsp;Lima&nbsp;(PKL)&nbsp;yang&nbsp;tumpah&nbsp;ruah&nbsp;ke&nbsp;jalan&nbsp;hanya&nbsp;mengandalkan&nbsp;pentungan&nbsp;Satpol&nbsp;PP.&nbsp;Polanya&nbsp;selalu&nbsp;berulang:&nbsp;hari&nbsp;ini&nbsp;diusir,&nbsp;besok&nbsp;balik&nbsp;lagi.&nbsp;Sangat&nbsp;melelahkan&nbsp;dan&nbsp;tidak&nbsp;selesai.&nbsp;Melalui&nbsp;BUMD,&nbsp;pengelola&nbsp;pasar&nbsp;punya&nbsp;kekuatan&nbsp;hukum&nbsp;dan&nbsp;aset&nbsp;untuk&nbsp;mencari&nbsp;pinjaman&nbsp;modal&nbsp;ke&nbsp;bank&nbsp;atau&nbsp;menggandeng&nbsp;investor&nbsp;swasta&nbsp;guna&nbsp;membangun&nbsp;kantong&nbsp;pasar&nbsp;baru&nbsp;atau&nbsp;tempat&nbsp;istirahat&nbsp;(rest&nbsp;area).&nbsp;BUMD&nbsp;bisa&nbsp;menyediakan&nbsp;lapak&nbsp;yang&nbsp;layak&nbsp;dengan&nbsp;harga&nbsp;terjangkau&nbsp;bagi&nbsp;PKL&nbsp;tanpa&nbsp;harus&nbsp;bergantung&nbsp;sepenuhnya&nbsp;pada&nbsp;anggaran&nbsp;APBD.&nbsp;</p><p>4.&nbsp;Terhambat&nbsp;Berinovasi&nbsp;karena&nbsp;Selalu&nbsp;Menunggu&nbsp;Anggaran&nbsp;Selama&nbsp;ini,&nbsp;wajah&nbsp;dan&nbsp;fasilitas&nbsp;pasar&nbsp;kita&nbsp;rasanya&nbsp;hanya&nbsp;itu-itu&nbsp;saja,&nbsp;tidak&nbsp;ada&nbsp;perubahan&nbsp;berarti&nbsp;sejak&nbsp;zaman&nbsp;dahulu&nbsp;kala,&nbsp;semata-mata&nbsp;karena&nbsp;segala&nbsp;hal&nbsp;harus&nbsp;menunggu&nbsp;kucuran&nbsp;dana&nbsp;APBD.&nbsp;Padahal,&nbsp;jika&nbsp;dikelola&nbsp;oleh&nbsp;BUMD,&nbsp;pengelola&nbsp;memiliki&nbsp;kebebasan&nbsp;untuk&nbsp;berekspansi&nbsp;dan&nbsp;berinovasi&nbsp;mengembangkan&nbsp;bisnis.&nbsp;BUMD&nbsp;bisa&nbsp;membangun&nbsp;fasilitas&nbsp;Cold&nbsp;Storage&nbsp;atau&nbsp;gudang&nbsp;pendingin&nbsp;terpusat,&nbsp;agar&nbsp;harga&nbsp;bahan&nbsp;pokok&nbsp;seperti&nbsp;ayam&nbsp;potong,&nbsp;daging,&nbsp;dan&nbsp;ikan&nbsp;tetap&nbsp;terjaga&nbsp;kestabilannya&nbsp;dan&nbsp;terhindar&nbsp;dari&nbsp;kenaikan&nbsp;harga&nbsp;tak&nbsp;wajar.&nbsp;Selain&nbsp;itu,&nbsp;BUMD&nbsp;juga&nbsp;bisa&nbsp;mengolah&nbsp;sampah&nbsp;pasar&nbsp;menjadi&nbsp;produk&nbsp;bernilai&nbsp;ekonomi&nbsp;seperti&nbsp;pupuk&nbsp;kompos,&nbsp;bahkan&nbsp;mampu&nbsp;mengembangkan&nbsp;sistem&nbsp;teknologi&nbsp;berupa&nbsp;aplikasi&nbsp;digital&nbsp;untuk&nbsp;memanajemen&nbsp;stok&nbsp;dan&nbsp;harga&nbsp;bahan&nbsp;pokok&nbsp;secara&nbsp;lebih&nbsp;modern&nbsp;dan&nbsp;teratur.&nbsp;Dalam&nbsp;uraiannya,&nbsp;Ujang&nbsp;menyatakan&nbsp;bahwa&nbsp;kita&nbsp;tidak&nbsp;perlu&nbsp;merasa&nbsp;sungkan&nbsp;atau&nbsp;malu&nbsp;untuk&nbsp;belajar&nbsp;dari&nbsp;keberhasilan&nbsp;daerah&nbsp;lain&nbsp;sebagai&nbsp;bahan&nbsp;acuan.&nbsp;Contoh&nbsp;nyata&nbsp;bisa&nbsp;dilihat&nbsp;dari&nbsp;kinerja&nbsp;Perumda&nbsp;Pasar&nbsp;Jaya&nbsp;di&nbsp;Jakarta&nbsp;yang&nbsp;sukses&nbsp;besar&nbsp;mengelola&nbsp;kawasan&nbsp;Tanah&nbsp;Abang&nbsp;hingga&nbsp;menjadi&nbsp;pusat&nbsp;perdagangan&nbsp;grosir&nbsp;terbesar&nbsp;di&nbsp;Asia&nbsp;Tenggara.&nbsp;Keberhasilan&nbsp;serupa&nbsp;juga&nbsp;ditunjukkan&nbsp;oleh&nbsp;Perumda&nbsp;Pasar&nbsp;Pakuan&nbsp;Jaya&nbsp;di&nbsp;Kota&nbsp;Bogor,&nbsp;maupun&nbsp;Perumda&nbsp;Pasar&nbsp;Sewakadarma&nbsp;di&nbsp;Denpasar,&nbsp;Bali.&nbsp;Di&nbsp;tempat-tempat&nbsp;tersebut,&nbsp;pasar&nbsp;dikelola&nbsp;dengan&nbsp;sangat&nbsp;rapi,&nbsp;bersih,&nbsp;modern,&nbsp;dan&nbsp;terbukti&nbsp;mampu&nbsp;menyumbang&nbsp;keuntungan&nbsp;yang&nbsp;besar&nbsp;bagi&nbsp;pendapatan&nbsp;daerah&nbsp;setempat.&nbsp;</p><p></p><p>Di&nbsp;bagian&nbsp;akhir&nbsp;suratnya,&nbsp;Ujang&nbsp;menarik&nbsp;kesimpulan&nbsp;tegas&nbsp;dan&nbsp;berharap&nbsp;agar&nbsp;Anggota&nbsp;Komisi&nbsp;II&nbsp;DPRD&nbsp;Kota&nbsp;Prabumulih&nbsp;tersebut&nbsp;dapat&nbsp;segera&nbsp;mendorong&nbsp;langkah&nbsp;strategis&nbsp;itu.&nbsp;Status&nbsp;pengelolaan&nbsp;pasar&nbsp;Prabumulih&nbsp;harus&nbsp;segera&nbsp;ditingkatkan&nbsp;atau&nbsp;dipisahkan&nbsp;secara&nbsp;mandiri&nbsp;(spin-off),&nbsp;dari&nbsp;sebelumnya&nbsp;berstatus&nbsp;UPTD&nbsp;berubah&nbsp;menjadi&nbsp;Perumda&nbsp;atau&nbsp;BUMD.&nbsp;Ujang&nbsp;pun&nbsp;bersedia&nbsp;untuk&nbsp;menggelar&nbsp;Rapat&nbsp;Dengar&nbsp;Pendapat&nbsp;(RDP)&nbsp;dengan&nbsp;semua&nbsp;pihak&nbsp;terkait&nbsp;di&nbsp;ruangan&nbsp;rapat&nbsp;DPRD&nbsp;Kota&nbsp;Prabumulih.&nbsp;“Jangan&nbsp;biarkan&nbsp;aset&nbsp;ekonomi&nbsp;andalan&nbsp;kita&nbsp;ini&nbsp;terus&nbsp;berjalan&nbsp;lambat&nbsp;dengan&nbsp;kecepatan&nbsp;siput&nbsp;birokrasi,”&nbsp;tulis&nbsp;Ujang&nbsp;menutup&nbsp;surat&nbsp;terbukanya.&nbsp;Tampilkan&nbsp;lebih&nbsp;sedikit</p>', '/uploads/1780240125663-192368768.jpg', NULL, 1, 86, 'f4a9512b-a656-4245-ac82-2e6ad0dd71a7', 1, '2026-05-30 16:46:44.127', '2026-06-03 20:16:13.942'),
('c3ad273a-9c43-4f28-82ce-f59af007bb6d', 'Langkah Antisipasi Serangan Ransomware Pada Sistem Database Perusahaan', 'langkah-antisipasi-serangan-ransomware-pada-sistem-database-perusahaan', 'Keamanan siber menjadi prioritas mutlak bagi korporasi yang mengelola data pelanggan dalam jumlah besar.', NULL, NULL, 1, 0, NULL, 6, '2026-05-31 22:24:48.867', '2026-05-31 22:24:48.867'),
('d4663921-97f4-46b6-ade4-17d4f9beffa5', 'Tren Pemasaran Visual 2026: Mengapa Desain Standing Banner Tetap Efektif di Era Digital', 'tren-pemasaran-visual-2026-mengapa-desain-standing-banner-tetap-efektif-di-era-digital', 'Meskipun iklan digital di media sosial merajai anggaran pemasaran, media promosi fisik luar ruang tetap efektif.', NULL, NULL, 1, 0, NULL, 5, '2026-05-31 22:24:48.867', '2026-05-31 22:24:48.867'),
('fbe5d276-6b41-455f-93c6-dac22cdb0643', 'KTT Teknologi Hijau Jenewa Sepakati Regulasi Baru Emisi Pusat Data Global', 'ktt-teknologi-hijau-jenewa-sepakati-regulasi-baru-emisi-pusat-data-global', 'Pertemuan tingkat tinggi yang berlangsung di Jenewa, Swiss, akhirnya ketuk palu mengenai regulasi emisi karbon yang dihasilkan oleh pusat data.', NULL, NULL, 1, 4, NULL, 4, '2026-05-31 22:24:48.867', '2026-06-01 06:57:28.568');

-- --------------------------------------------------------

--
-- Struktur dari tabel `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `role`
--

INSERT INTO `role` (`id`, `name`) VALUES
(1, 'Admin'),
(2, 'Jurnalis'),
(3, 'Redaktur');

-- --------------------------------------------------------

--
-- Struktur dari tabel `setting`
--

CREATE TABLE `setting` (
  `id` int(11) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `setting`
--

INSERT INTO `setting` (`id`, `key`, `value`) VALUES
(1, 'site_name', 'PUSTAKA PUBLIK'),
(2, 'site_logo', '/uploads/logo-1780330627386-900.webp'),
(5, 'smtp_host', 'smtp.gmail.com'),
(6, 'smtp_port', '587'),
(7, 'smtp_user', ''),
(8, 'smtp_pass', ''),
(14, 'editorial_board', '[{\"id\":\"1780321035961\",\"name\":\"Tidang Baskoro\",\"role\":\"Direktur Utama\",\"description\":\"Boss Paling Besar\",\"photo\":\"/uploads/board-1780321237506-214.webp\"},{\"id\":\"1780321084458\",\"name\":\"M Jei Rakash Pakarlasah, SH.Adv\",\"role\":\"Legal\",\"description\":\"Si Paling Legal\",\"photo\":\"/uploads/board-1780321237662-738.webp\"},{\"id\":\"1780321400992\",\"name\":\"Annisa\",\"role\":\"Sekretaris Sexy\",\"description\":\"Ngasih Makan, Cium, dan Peluk, Wartawan\",\"photo\":\"/uploads/board-1780321441776-418.webp\"}]'),
(22, 'site_motto', 'Rujukan Informasi Akurat dan Edukatif'),
(23, 'company_address', 'PT. Prabu Nusa Berdikari'),
(24, 'company_phone', '0713 320826'),
(25, 'company_email', 'admin@pustakapublik.com'),
(26, 'social_facebook', ''),
(27, 'social_twitter', ''),
(28, 'social_instagram', ''),
(29, 'social_youtube', ''),
(58, 'ad_leaderboard_link', ''),
(59, 'ad_sidebar_link', ''),
(60, 'ad_article_top_link', ''),
(61, 'ad_article_bottom_link', ''),
(66, 'ad_sidebar', '/uploads/ad_sidebar-1780328703930-238.webp'),
(81, 'ad_leaderboard_slot', ''),
(82, 'ad_sidebar_slot', ''),
(83, 'ad_article_top_slot', ''),
(84, 'ad_article_bottom_slot', '');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `isApproved` tinyint(1) NOT NULL DEFAULT 0,
  `resetPasswordToken` varchar(191) DEFAULT NULL,
  `resetPasswordExpires` datetime(3) DEFAULT NULL,
  `roleId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `name`, `isApproved`, `resetPasswordToken`, `resetPasswordExpires`, `roleId`, `createdAt`, `updatedAt`) VALUES
('27bf5234-afd6-489d-90ff-48546c0a3de9', 'angganovliantast@gmail.com', '$2b$10$zdSfra8LFqYLR2JEs2KpieWNBBQlXSP.PDTB0emjI/kajJNUdRx/K', 'Angga Novlianta', 1, NULL, NULL, 1, '2026-06-01 13:01:56.408', '2026-06-03 18:59:53.553'),
('b02fb9c1-bf4b-478d-bcea-92726d3e48ae', 'anjarolanza@gmail.com', '$2b$10$eDKX7l8EyJBrjFKy70RKiO4hEckm9kvPBoaIl687WXtX0nHhiRsya', 'Anja Rolanza', 1, NULL, NULL, 3, '2026-06-01 07:58:21.807', '2026-06-01 14:58:29.252'),
('cb1b575a-90fc-4bee-a92c-5cc01696a9a5', 'angganovlianta@gmail.com', '$2b$10$BeTkdBvD28G7O3SXnXahVuZGOrfd4TyZDkJ5VBcOPJzVdkZkvrW3K', 'Angga Novlianta', 1, NULL, NULL, 2, '2026-06-01 07:15:19.528', '2026-06-01 07:56:44.270'),
('f4a9512b-a656-4245-ac82-2e6ad0dd71a7', 'admin@kompas-clone.com', '$2b$10$30Wahyul8Q/2tNjSr3d8m.Mmm7rxh6UDduKz5K1jvPbR3dbgW2ycy', 'Admin Utama', 1, NULL, NULL, 1, '2026-05-30 14:36:11.848', '2026-06-01 07:56:51.202');

-- --------------------------------------------------------

--
-- Struktur dari tabel `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('8bee0f63-803f-4090-bd3a-befdb672e9ba', 'b45b017fca6164d8ee7c5c2f90de2dba7217ce47ae2a8f53e81244a21a3195f7', '2026-06-03 17:48:28.596', '20260603174827_init', NULL, NULL, '2026-06-03 17:48:27.605', 1);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Category_name_key` (`name`),
  ADD UNIQUE KEY `Category_slug_key` (`slug`);

--
-- Indeks untuk tabel `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Menu_parentId_fkey` (`parentId`);

--
-- Indeks untuk tabel `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Post_slug_key` (`slug`),
  ADD KEY `Post_authorId_fkey` (`authorId`),
  ADD KEY `Post_categoryId_fkey` (`categoryId`);

--
-- Indeks untuk tabel `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Role_name_key` (`name`);

--
-- Indeks untuk tabel `setting`
--
ALTER TABLE `setting`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Setting_key_key` (`key`);

--
-- Indeks untuk tabel `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_roleId_fkey` (`roleId`);

--
-- Indeks untuk tabel `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `setting`
--
ALTER TABLE `setting`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `Menu_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `menu` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
