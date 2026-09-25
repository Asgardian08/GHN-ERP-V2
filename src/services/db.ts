import {
  DatabaseSchema,
  FarmSettings,
  User,
  ProductionRecord,
  InventoryItem,
  InventoryTransaction,
  Customer,
  Sale,
  PreOrder,
  Income,
  Expense,
  Receivable,
  ReceivablePayment,
  Payable,
  PayablePayment,
  CapitalTransaction,
  CashTransaction,
  MonthlyReport,
  PaymentMethod,
  PaymentStatus,
  ExpenseCategory,
  PreOrderStatus,
} from '../types/database';

const DB_STORAGE_KEY = 'ghn_erp_lite_database_v2';

// Seed Initial Data
const DEFAULT_SETTINGS: FarmSettings = {
  farmName: 'GHN Egg Farm Nusantara',
  tagline: 'Solusi Telur Berkualitas, Segar & Terpercaya',
  address: 'Jl. Raya Agrobisnis No. 88, Malang, Jawa Timur',
  phone: '+62 812-3456-7890',
  email: 'halo@ghneggfarm.id',
  currency: 'IDR',
  defaultEggPrice: 26500,
  chickenPopulation: 2500,
  lowStockThresholdKg: 50,
  receiptFooter: 'Terima kasih telah berbelanja di GHN Egg Farm Nusantara. Simpan struk ini sebagai bukti pembelian sah.',
  bankName: 'BCA (Bank Central Asia)',
  bankAccount: '829-0182-990',
  bankAccountName: 'GHN EGG FARM NUSANTARA PT',
  qrisImageUrl: '',
};

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_owner',
    name: 'Septywan Farhan',
    role: 'owner',
    email: 'septywanf@gmail.com',
    password: 'Farhan234!',
    phone: '+62 812-3456-7890',
    isActive: true,
    createdAt: '2026-09-01 08:00',
    permissions: {
      canAccessDashboard: true,
      canAccessProduksi: true,
      canAccessKasir: true,
      canAccessPreOrder: true,
      canAccessStok: true,
      canAccessPelanggan: true,
      canAccessKeuangan: true,
      canAccessLaporan: true,
      canAccessPengaturan: true,
    },
  },
  {
    id: 'usr_staff_1',
    name: 'Ahmad Fauzi (Kandang & Logistik)',
    role: 'staff',
    email: 'staff@ghneggfarm.id',
    password: 'Staff123!',
    phone: '+62 813-9876-5432',
    isActive: true,
    createdAt: '2026-09-10 09:00',
    permissions: {
      canAccessDashboard: true,
      canAccessProduksi: true,
      canAccessKasir: true,
      canAccessPreOrder: true,
      canAccessStok: true,
      canAccessPelanggan: true,
      canAccessKeuangan: false,
      canAccessLaporan: false,
      canAccessPengaturan: false,
    },
  },
  {
    id: 'usr_staff_2',
    name: 'Siti Rahmawati (Kasir & Pre Order)',
    role: 'staff',
    email: 'kasir@ghneggfarm.id',
    password: 'Kasir123!',
    phone: '+62 815-5555-1234',
    isActive: true,
    createdAt: '2026-09-15 10:30',
    permissions: {
      canAccessDashboard: true,
      canAccessProduksi: false,
      canAccessKasir: true,
      canAccessPreOrder: true,
      canAccessStok: true,
      canAccessPelanggan: true,
      canAccessKeuangan: false,
      canAccessLaporan: false,
      canAccessPengaturan: false,
    },
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv_telur',
    name: 'Telur Ayam Segar Grade A',
    category: 'produk',
    unit: 'kg',
    stock: 245.5,
    minStock: 50,
    avgCost: 21500,
    notes: 'Telur segar hasil panen kandang GHN hari ini',
    lastUpdated: '2026-09-24 16:30',
  },
  {
    id: 'inv_pakan_layer',
    name: 'Pakan Layer Konsentrat KL-36',
    category: 'pakan',
    unit: 'kg',
    stock: 1450,
    minStock: 500,
    avgCost: 8900,
    notes: 'Pakan pabrikan protein 36% untuk fase layer',
    lastUpdated: '2026-09-24 08:00',
  },
  {
    id: 'inv_jagung',
    name: 'Jagung Pipil Kering Giling',
    category: 'pakan',
    unit: 'kg',
    stock: 2200,
    minStock: 600,
    avgCost: 5500,
    notes: 'Kadar air < 14%, kualitas super',
    lastUpdated: '2026-09-23 14:00',
  },
  {
    id: 'inv_dedak',
    name: 'Dedak Padi Halus (Bekatul)',
    category: 'pakan',
    unit: 'kg',
    stock: 850,
    minStock: 300,
    avgCost: 3800,
    notes: 'Dedak murni tanpa sekam',
    lastUpdated: '2026-09-22 10:00',
  },
  {
    id: 'inv_konsentrat',
    name: 'Premix Mineral & Asam Amino',
    category: 'pakan',
    unit: 'kg',
    stock: 120,
    minStock: 30,
    avgCost: 28000,
    notes: 'Campuran penguat cangkang telur & daya tahan',
    lastUpdated: '2026-09-20 11:00',
  },
  {
    id: 'inv_vitamin',
    name: 'Egg Stimulant & Multivitamin',
    category: 'supplies',
    unit: 'botol',
    stock: 18,
    minStock: 5,
    avgCost: 45000,
    notes: 'Peningkat produksi dan ketahanan cuaca',
    lastUpdated: '2026-09-21 09:00',
  },
  {
    id: 'inv_obat',
    name: 'Antiseptik & Desinfektan Kandang (Medisep)',
    category: 'supplies',
    unit: 'liter',
    stock: 12,
    minStock: 4,
    avgCost: 65000,
    notes: 'Penyemprotan kandang 2x seminggu',
    lastUpdated: '2026-09-21 09:00',
  },
  {
    id: 'inv_kemasan',
    name: 'Egg Tray Karton (Kapasitas 30 Butir)',
    category: 'supplies',
    unit: 'pcs',
    stock: 480,
    minStock: 100,
    avgCost: 2200,
    notes: 'Tray standar distribusi grosir & toko',
    lastUpdated: '2026-09-24 10:00',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cst_1',
    name: 'Toko Berkah Sembako (Bu Sri)',
    phone: '081299887711',
    address: 'Pasar Induk Gadang Kios No. 14, Malang',
    type: 'Grosir',
    totalPurchases: 28,
    totalKg: 1450,
    totalSpent: 38425000,
    outstandingReceivable: 0,
    notes: 'Pelanggan utama harian, bayar tunai/transfer tepat waktu',
    createdAt: '2026-07-01',
  },
  {
    id: 'cst_2',
    name: 'Agen Telur Barokah (Pak Haji Mahmud)',
    phone: '085711223344',
    address: 'Jl. Ahmad Yani No. 102, Kepanjen',
    type: 'Agen',
    totalPurchases: 19,
    totalKg: 980,
    totalSpent: 25970000,
    outstandingReceivable: 1500000,
    notes: 'Beli rutin tiap selasa & kamis, sistem tempo 3 hari',
    createdAt: '2026-07-15',
  },
  {
    id: 'cst_3',
    name: 'Bakery & Cake Delima Rasa',
    phone: '081344556677',
    address: 'Jl. Soekarno Hatta No. 45, Malang',
    type: 'Langganan',
    totalPurchases: 14,
    totalKg: 420,
    totalSpent: 11235000,
    outstandingReceivable: 0,
    notes: 'Butuh telur segar bersih grade A untuk adonan roti premium',
    createdAt: '2026-08-01',
  },
  {
    id: 'cst_4',
    name: 'Martabak & Terang Bulan 88',
    phone: '087811992288',
    address: 'Jl. Sulfat Raya No. 12, Malang',
    type: 'Langganan',
    totalPurchases: 22,
    totalKg: 330,
    totalSpent: 8745000,
    outstandingReceivable: 530000,
    notes: 'Pengambilan sore jam 16:30',
    createdAt: '2026-08-10',
  },
  {
    id: 'cst_5',
    name: 'Ibu Rahma (Warga Perumahan)',
    phone: '081900112233',
    address: 'Perum Permata Jingga Blok F-8',
    type: 'Retail',
    totalPurchases: 6,
    totalKg: 18,
    totalSpent: 486000,
    outstandingReceivable: 0,
    notes: 'Beli eceran untuk konsumsi keluarga',
    createdAt: '2026-09-02',
  },
];

// Helper to generate IDs
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

// Seed initial production for the last 7 days (September 18-24, 2026)
const INITIAL_PRODUCTION: ProductionRecord[] = [
  {
    id: 'prod_1',
    date: '2026-09-18',
    chickenCount: 2500,
    eggsCount: 2110,
    eggWeightKg: 132.8,
    brokenCount: 12,
    hdp: 84.4,
    avgGramPerEgg: 62.9,
    notes: 'Produksi stabil, cuaca cerah',
    createdAt: '2026-09-18 09:15',
  },
  {
    id: 'prod_2',
    date: '2026-09-19',
    chickenCount: 2500,
    eggsCount: 2145,
    eggWeightKg: 135.2,
    brokenCount: 8,
    hdp: 85.8,
    avgGramPerEgg: 63.0,
    notes: 'Kualitas kerabang sangat tebal',
    createdAt: '2026-09-19 09:20',
  },
  {
    id: 'prod_3',
    date: '2026-09-20',
    chickenCount: 2498,
    eggsCount: 2120,
    eggWeightKg: 133.5,
    brokenCount: 15,
    hdp: 84.87,
    avgGramPerEgg: 62.9,
    notes: '2 ekor afkir dipisahkan',
    createdAt: '2026-09-20 09:10',
  },
  {
    id: 'prod_4',
    date: '2026-09-21',
    chickenCount: 2498,
    eggsCount: 2160,
    eggWeightKg: 136.4,
    brokenCount: 9,
    hdp: 86.47,
    avgGramPerEgg: 63.1,
    notes: 'Pemberian vitamin booster',
    createdAt: '2026-09-21 09:25',
  },
  {
    id: 'prod_5',
    date: '2026-09-22',
    chickenCount: 2498,
    eggsCount: 2175,
    eggWeightKg: 137.2,
    brokenCount: 7,
    hdp: 87.07,
    avgGramPerEgg: 63.1,
    notes: 'HDP optimal diatas target 85%',
    createdAt: '2026-09-22 09:15',
  },
  {
    id: 'prod_6',
    date: '2026-09-23',
    chickenCount: 2496,
    eggsCount: 2155,
    eggWeightKg: 135.8,
    brokenCount: 11,
    hdp: 86.34,
    avgGramPerEgg: 63.0,
    notes: '2 ekor mati karena kepanasan siang',
    createdAt: '2026-09-23 09:20',
  },
  {
    id: 'prod_7',
    date: '2026-09-24',
    chickenCount: 2496,
    eggsCount: 2180,
    eggWeightKg: 137.9,
    brokenCount: 6,
    hdp: 87.34,
    avgGramPerEgg: 63.2,
    notes: 'Panen pagi tuntas, telur langsung masuk gudang sortir',
    createdAt: '2026-09-24 09:30',
  },
];

// Seed initial sales
const INITIAL_SALES: Sale[] = [
  {
    id: 'sale_1',
    invoiceNumber: 'GHN-20260923-001',
    customerId: 'cst_1',
    customerName: 'Toko Berkah Sembako (Bu Sri)',
    customerPhone: '081299887711',
    date: '2026-09-23',
    items: [
      {
        id: 'item_1',
        productId: 'inv_telur',
        productName: 'Telur Ayam Segar Grade A',
        quantity: 80,
        unit: 'kg',
        pricePerUnit: 26500,
        subtotal: 2120000,
      },
    ],
    totalKg: 80,
    pricePerKg: 26500,
    subtotal: 2120000,
    discount: 0,
    totalAmount: 2120000,
    paidAmount: 2120000,
    balanceDue: 0,
    paymentMethod: 'Transfer Bank',
    paymentStatus: 'lunas',
    notes: 'Pengiriman pagi dengan pick-up farm',
    operatorName: 'Ahmad Fauzi',
    createdAt: '2026-09-23 10:45',
  },
  {
    id: 'sale_2',
    invoiceNumber: 'GHN-20260924-001',
    customerId: 'cst_2',
    customerName: 'Agen Telur Barokah (Pak Haji Mahmud)',
    customerPhone: '085711223344',
    date: '2026-09-24',
    items: [
      {
        id: 'item_2',
        productId: 'inv_telur',
        productName: 'Telur Ayam Segar Grade A',
        quantity: 100,
        unit: 'kg',
        pricePerUnit: 26500,
        subtotal: 2650000,
      },
    ],
    totalKg: 100,
    pricePerKg: 26500,
    subtotal: 2650000,
    discount: 0,
    totalAmount: 2650000,
    paidAmount: 1150000,
    balanceDue: 1500000,
    paymentMethod: 'Tunai',
    paymentStatus: 'dp',
    dueDate: '2026-09-27',
    notes: 'DP Rp 1.150.000 tunai, sisa Rp 1.500.000 tempo 3 hari',
    operatorName: 'Ahmad Fauzi',
    createdAt: '2026-09-24 11:15',
  },
  {
    id: 'sale_3',
    invoiceNumber: 'GHN-20260924-002',
    customerId: 'cst_3',
    customerName: 'Bakery & Cake Delima Rasa',
    customerPhone: '081344556677',
    date: '2026-09-24',
    items: [
      {
        id: 'item_3',
        productId: 'inv_telur',
        productName: 'Telur Ayam Segar Grade A',
        quantity: 35,
        unit: 'kg',
        pricePerUnit: 26500,
        subtotal: 927500,
      },
    ],
    totalKg: 35,
    pricePerKg: 26500,
    subtotal: 927500,
    discount: 0,
    totalAmount: 927500,
    paidAmount: 927500,
    balanceDue: 0,
    paymentMethod: 'QRIS',
    paymentStatus: 'lunas',
    notes: 'Diambil sendiri ke farm',
    operatorName: 'Ahmad Fauzi',
    createdAt: '2026-09-24 14:20',
  },
];

// Seed Pre-Orders
const INITIAL_PREORDERS: PreOrder[] = [
  {
    id: 'po_1',
    orderNumber: 'PO-20260924-001',
    customerId: 'cst_4',
    customerName: 'Martabak & Terang Bulan 88',
    phone: '087811992288',
    orderDate: '2026-09-23',
    pickupDate: '2026-09-24',
    quantityKg: 25,
    pricePerKg: 26500,
    totalAmount: 662500,
    dpAmount: 200000,
    balanceDue: 462500,
    status: 'siap_diambil',
    paymentMethod: 'Tunai',
    notes: 'Diambil sore hari pukul 17:00',
    createdAt: '2026-09-23 15:00',
  },
  {
    id: 'po_2',
    orderNumber: 'PO-20260924-002',
    customerId: 'cst_1',
    customerName: 'Toko Berkah Sembako (Bu Sri)',
    phone: '081299887711',
    orderDate: '2026-09-24',
    pickupDate: '2026-09-25',
    quantityKg: 120,
    pricePerKg: 26500,
    totalAmount: 3180000,
    dpAmount: 1000000,
    balanceDue: 2180000,
    status: 'dp_masuk',
    paymentMethod: 'Transfer Bank',
    notes: 'Untuk pasokan akhir pekan, kirim jam 07:00 pagi',
    createdAt: '2026-09-24 10:00',
  },
  {
    id: 'po_3',
    orderNumber: 'PO-20260922-001',
    customerId: 'cst_5',
    customerName: 'Ibu Rahma (Warga Perumahan)',
    phone: '081900112233',
    orderDate: '2026-09-21',
    pickupDate: '2026-09-23',
    quantityKg: 5,
    pricePerKg: 27000,
    totalAmount: 135000,
    dpAmount: 0,
    balanceDue: 135000,
    status: 'menunggu',
    paymentMethod: 'Tunai',
    notes: 'Pengambilan tertunda, belum diambil pelanggan',
    createdAt: '2026-09-21 16:00',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    date: '2026-09-21',
    category: 'pakan',
    amount: 5500000,
    paymentMethod: 'Transfer Bank',
    description: 'Beli 1 ton jagung pipil super kadar air rendah',
    supplier: 'UD Sumber Tani Makmur',
    createdAt: '2026-09-21 11:00',
  },
  {
    id: 'exp_2',
    date: '2026-09-22',
    category: 'vitamin',
    amount: 450000,
    paymentMethod: 'Tunai',
    description: 'Beli 10 botol multivitamin booster & elektrolit cuaca panas',
    supplier: 'Apotek Ternak Sehat',
    createdAt: '2026-09-22 14:00',
  },
  {
    id: 'exp_3',
    date: '2026-09-23',
    category: 'listrik',
    amount: 875000,
    paymentMethod: 'Transfer Bank',
    description: 'Pembayaran listrik PLN kandang otomatis & blower ventilasi',
    createdAt: '2026-09-23 08:30',
  },
  {
    id: 'exp_4',
    date: '2026-09-24',
    category: 'kemasan',
    amount: 440000,
    paymentMethod: 'Tunai',
    description: 'Beli 200 pcs egg tray karton tebal',
    supplier: 'Pabrik Kemasan Abadi',
    createdAt: '2026-09-24 10:15',
  },
];

const INITIAL_INCOMES: Income[] = [
  {
    id: 'inc_1',
    date: '2026-09-23',
    category: 'penjualan_telur',
    amount: 2120000,
    paymentMethod: 'Transfer Bank',
    description: 'Penjualan Telur 80 kg ke Toko Berkah Sembako (GHN-20260923-001)',
    referenceId: 'sale_1',
    createdAt: '2026-09-23 10:45',
  },
  {
    id: 'inc_2',
    date: '2026-09-24',
    category: 'penjualan_telur',
    amount: 1150000,
    paymentMethod: 'Tunai',
    description: 'Pembayaran DP Penjualan Telur 100 kg ke Agen Barokah (GHN-20260924-001)',
    referenceId: 'sale_2',
    createdAt: '2026-09-24 11:15',
  },
  {
    id: 'inc_3',
    date: '2026-09-24',
    category: 'penjualan_telur',
    amount: 927500,
    paymentMethod: 'QRIS',
    description: 'Penjualan Telur 35 kg ke Bakery Delima Rasa (GHN-20260924-002)',
    referenceId: 'sale_3',
    createdAt: '2026-09-24 14:20',
  },
  {
    id: 'inc_4',
    date: '2026-09-24',
    category: 'penjualan_telur',
    amount: 1000000,
    paymentMethod: 'Transfer Bank',
    description: 'DP Pre Order Telur 120 kg dari Toko Berkah Sembako (PO-20260924-002)',
    referenceId: 'po_2',
    createdAt: '2026-09-24 10:00',
  },
];

const INITIAL_RECEIVABLES: Receivable[] = [
  {
    id: 'rcv_1',
    saleId: 'sale_2',
    invoiceNumber: 'GHN-20260924-001',
    customerId: 'cst_2',
    customerName: 'Agen Telur Barokah (Pak Haji Mahmud)',
    phone: '085711223344',
    date: '2026-09-24',
    dueDate: '2026-09-27',
    totalAmount: 2650000,
    paidAmount: 1150000,
    remainingAmount: 1500000,
    status: 'belum_lunas',
    notes: 'Tempo 3 hari sesuai kesepakatan agen',
    createdAt: '2026-09-24 11:15',
  },
  {
    id: 'rcv_2',
    saleId: 'sale_prev_1',
    invoiceNumber: 'GHN-20260920-003',
    customerId: 'cst_4',
    customerName: 'Martabak & Terang Bulan 88',
    phone: '087811992288',
    date: '2026-09-20',
    dueDate: '2026-09-25',
    totalAmount: 530000,
    paidAmount: 0,
    remainingAmount: 530000,
    status: 'belum_lunas',
    notes: 'Piutang pembelian 20 kg tanggal 20 September',
    createdAt: '2026-09-20 17:00',
  },
];

const INITIAL_PAYABLES: Payable[] = [
  {
    id: 'pyb_1',
    supplierName: 'PT Charoen Feedmill Indonesia',
    category: 'pakan',
    date: '2026-09-15',
    dueDate: '2026-09-30',
    totalAmount: 12500000,
    paidAmount: 5000000,
    remainingAmount: 7500000,
    status: 'belum_lunas',
    description: 'Pembelian konsentrat pakan layer 1.5 ton term 15 hari',
    createdAt: '2026-09-15 08:00',
  },
];

const INITIAL_CAPITAL: CapitalTransaction[] = [
  {
    id: 'cap_1',
    date: '2026-09-01',
    type: 'modal',
    amount: 50000000,
    paymentMethod: 'Transfer Bank',
    notes: 'Suntikan Modal Kerja Awal Bulan September oleh H. Bambang',
    createdAt: '2026-09-01 08:00',
  },
  {
    id: 'cap_2',
    date: '2026-09-15',
    type: 'prive',
    amount: 5000000,
    paymentMethod: 'Transfer Bank',
    notes: 'Penarikan Prive Pemilik (H. Bambang Septiawan) - Bukan Beban Operasional',
    createdAt: '2026-09-15 15:00',
  },
];

const INITIAL_CASH_TX: CashTransaction[] = [
  {
    id: 'ctx_0',
    date: '2026-09-20',
    type: 'in',
    category: 'Saldo Awal',
    amount: 32000000,
    description: 'Saldo Kas Operasional Berjalan',
    balanceAfter: 32000000,
    createdAt: '2026-09-20 00:00',
  },
  {
    id: 'ctx_1',
    date: '2026-09-21',
    type: 'out',
    category: 'Beban Pakan',
    amount: 5500000,
    description: 'Beli 1 ton jagung pipil super (exp_1)',
    balanceAfter: 26500000,
    referenceId: 'exp_1',
    createdAt: '2026-09-21 11:00',
  },
  {
    id: 'ctx_2',
    date: '2026-09-22',
    type: 'out',
    category: 'Beban Vitamin',
    amount: 450000,
    description: 'Beli vitamin booster (exp_2)',
    balanceAfter: 26050000,
    referenceId: 'exp_2',
    createdAt: '2026-09-22 14:00',
  },
  {
    id: 'ctx_3',
    date: '2026-09-23',
    type: 'out',
    category: 'Beban Listrik',
    amount: 875000,
    description: 'PLN kandang & blower ventilasi (exp_3)',
    balanceAfter: 25175000,
    referenceId: 'exp_3',
    createdAt: '2026-09-23 08:30',
  },
  {
    id: 'ctx_4',
    date: '2026-09-23',
    type: 'in',
    category: 'Penjualan Telur',
    amount: 2120000,
    description: 'Penjualan 80 kg ke Toko Berkah Sembako (sale_1)',
    balanceAfter: 27295000,
    referenceId: 'sale_1',
    createdAt: '2026-09-23 10:45',
  },
  {
    id: 'ctx_5',
    date: '2026-09-24',
    type: 'in',
    category: 'Pre Order DP',
    amount: 1000000,
    description: 'DP Pre Order 120 kg dari Toko Berkah Sembako (po_2)',
    balanceAfter: 28295000,
    referenceId: 'po_2',
    createdAt: '2026-09-24 10:00',
  },
  {
    id: 'ctx_6',
    date: '2026-09-24',
    type: 'out',
    category: 'Beban Kemasan',
    amount: 440000,
    description: 'Beli 200 pcs egg tray karton (exp_4)',
    balanceAfter: 27855000,
    referenceId: 'exp_4',
    createdAt: '2026-09-24 10:15',
  },
  {
    id: 'ctx_7',
    date: '2026-09-24',
    type: 'in',
    category: 'Penjualan Telur',
    amount: 1150000,
    description: 'DP Penjualan Telur 100 kg ke Agen Barokah (sale_2)',
    balanceAfter: 29005000,
    referenceId: 'sale_2',
    createdAt: '2026-09-24 11:15',
  },
  {
    id: 'ctx_8',
    date: '2026-09-24',
    type: 'in',
    category: 'Penjualan Telur',
    amount: 927500,
    description: 'Penjualan Telur 35 kg ke Bakery Delima Rasa (sale_3)',
    balanceAfter: 29932500,
    referenceId: 'sale_3',
    createdAt: '2026-09-24 14:20',
  },
];

const INITIAL_INVENTORY_TX: InventoryTransaction[] = [
  {
    id: 'itx_1',
    itemId: 'inv_telur',
    itemName: 'Telur Ayam Segar Grade A',
    date: '2026-09-23',
    type: 'production',
    quantity: 135.8,
    balanceAfter: 327.6,
    notes: 'Hasil panen harian kandang (2.155 butir)',
    createdAt: '2026-09-23 09:20',
  },
  {
    id: 'itx_2',
    itemId: 'inv_telur',
    itemName: 'Telur Ayam Segar Grade A',
    date: '2026-09-23',
    type: 'sale',
    quantity: -80,
    balanceAfter: 247.6,
    referenceId: 'sale_1',
    notes: 'Penjualan Toko Berkah Sembako (GHN-20260923-001)',
    createdAt: '2026-09-23 10:45',
  },
  {
    id: 'itx_3',
    itemId: 'inv_telur',
    itemName: 'Telur Ayam Segar Grade A',
    date: '2026-09-24',
    type: 'production',
    quantity: 137.9,
    balanceAfter: 385.5,
    notes: 'Hasil panen harian kandang (2.180 butir)',
    createdAt: '2026-09-24 09:30',
  },
  {
    id: 'itx_4',
    itemId: 'inv_telur',
    itemName: 'Telur Ayam Segar Grade A',
    date: '2026-09-24',
    type: 'sale',
    quantity: -100,
    balanceAfter: 285.5,
    referenceId: 'sale_2',
    notes: 'Penjualan Agen Telur Barokah (GHN-20260924-001)',
    createdAt: '2026-09-24 11:15',
  },
  {
    id: 'itx_5',
    itemId: 'inv_telur',
    itemName: 'Telur Ayam Segar Grade A',
    date: '2026-09-24',
    type: 'sale',
    quantity: -35,
    balanceAfter: 250.5,
    referenceId: 'sale_3',
    notes: 'Penjualan Bakery Delima Rasa (GHN-20260924-002)',
    createdAt: '2026-09-24 14:20',
  },
  {
    id: 'itx_6',
    itemId: 'inv_telur',
    itemName: 'Telur Ayam Segar Grade A',
    date: '2026-09-24',
    type: 'adjustment',
    quantity: -5,
    balanceAfter: 245.5,
    notes: 'Koreksi sortir telur retak mikro & telur uji kualitas',
    createdAt: '2026-09-24 16:30',
  },
];

const INITIAL_MONTHLY_REPORTS: MonthlyReport[] = [
  {
    id: 'mr_2026_08',
    monthYear: '2026-08',
    monthName: 'Agustus 2026',
    closedAt: '2026-09-01 00:00',
    population: 2500,
    totalEggs: 65120,
    totalKg: 4102.5,
    avgHdp: 84.02,
    totalRevenue: 106665000,
    totalExpense: 68420000,
    netProfit: 38245000,
    cashIn: 104500000,
    cashOut: 68420000,
    salesCount: 84,
    preorderCount: 22,
    notes: 'Laporan Tutup Buku Resmi Bulan Agustus 2026 - Kinerja optimal',
  },
];

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

class DatabaseService {
  private schema: DatabaseSchema;
  private listeners: Array<() => void> = [];

  constructor() {
    this.schema = this.loadFromStorage();
  }

  private getDefaultSchema(): DatabaseSchema {
    return deepClone({
      settings: DEFAULT_SETTINGS,
      users: DEFAULT_USERS,
      currentUser: DEFAULT_USERS[0],
      production: INITIAL_PRODUCTION,
      inventory: INITIAL_INVENTORY,
      inventoryTransactions: INITIAL_INVENTORY_TX,
      customers: INITIAL_CUSTOMERS,
      sales: INITIAL_SALES,
      preorders: INITIAL_PREORDERS,
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      receivables: INITIAL_RECEIVABLES,
      receivablePayments: [],
      payables: INITIAL_PAYABLES,
      payablePayments: [],
      capitalTransactions: INITIAL_CAPITAL,
      cashTransactions: INITIAL_CASH_TX,
      monthlyReports: INITIAL_MONTHLY_REPORTS,
      openingCashBalance: 25000000,
    });
  }

  private loadFromStorage(): DatabaseSchema {
    try {
      const serialized = localStorage.getItem(DB_STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        const defaultData = this.getDefaultSchema();
        
        // Ensure owner septywanf@gmail.com with password Farhan234! is always set
        let users: User[] = Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : defaultData.users;
        const ownerIndex = users.findIndex((u: User) => u.email?.toLowerCase() === 'septywanf@gmail.com' || u.role === 'owner');
        if (ownerIndex >= 0) {
          users[ownerIndex] = {
            ...users[ownerIndex],
            name: users[ownerIndex].name || 'Septywan Farhan',
            email: 'septywanf@gmail.com',
            password: 'Farhan234!',
            role: 'owner',
            isActive: true,
            permissions: {
              canAccessDashboard: true,
              canAccessProduksi: true,
              canAccessKasir: true,
              canAccessPreOrder: true,
              canAccessStok: true,
              canAccessPelanggan: true,
              canAccessKeuangan: true,
              canAccessLaporan: true,
              canAccessPengaturan: true,
            },
          };
        } else {
          users.unshift(DEFAULT_USERS[0]);
        }

        // Ensure default staff exists
        if (!users.some((u: User) => u.role === 'staff' || u.role === 'operator')) {
          users.push(DEFAULT_USERS[1]);
          users.push(DEFAULT_USERS[2]);
        }

        // Check if there's a stored session
        let currentUser = users[0];
        try {
          const sessionRaw = localStorage.getItem('ghn_erp_auth_session_v2');
          if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            const foundUser = users.find((u: User) => u.id === session.userId && u.isActive !== false);
            if (foundUser) {
              currentUser = foundUser;
            }
          }
        } catch {
          // ignore
        }

        return {
          ...defaultData,
          ...parsed,
          users,
          currentUser,
        };
      }
    } catch (e) {
      console.warn('Failed to parse database from localStorage, initializing defaults', e);
    }
    const defaultData = this.getDefaultSchema();
    this.saveToStorage(defaultData);
    return defaultData;
  }

  private saveToStorage(schema: DatabaseSchema) {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(schema));
    } catch (e) {
      console.error('Error saving database to localStorage', e);
    }
  }

  private notify() {
    this.saveToStorage(this.schema);
    for (const listener of this.listeners) {
      listener();
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Get current snapshot
  public getData(): DatabaseSchema {
    return this.schema;
  }

  // ==========================================
  // AUTHENTICATION & USER SESSION METHODS
  // ==========================================

  public getAuthSession(): User | null {
    try {
      const sessionRaw = localStorage.getItem('ghn_erp_auth_session_v2');
      if (!sessionRaw) return null;
      const session = JSON.parse(sessionRaw);
      const user = this.schema.users.find((u) => u.id === session.userId);
      if (user && user.isActive !== false) {
        return user;
      }
    } catch {
      // ignore
    }
    return null;
  }

  public login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = this.schema.users.find((u) => u.email.trim().toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        error: 'Email tidak ditemukan dalam sistem GHN ERP Lite.',
      };
    }

    if (user.isActive === false) {
      return {
        success: false,
        error: 'Akun Anda sedang dinonaktifkan. Silakan hubungi Owner.',
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        error: 'Kata sandi tidak cocok. Silakan periksa kembali.',
      };
    }

    // Save session
    localStorage.setItem(
      'ghn_erp_auth_session_v2',
      JSON.stringify({ userId: user.id, loggedAt: new Date().toISOString() })
    );

    this.schema.currentUser = user;
    this.notify();
    return { success: true, user };
  }

  public logout(): void {
    localStorage.removeItem('ghn_erp_auth_session_v2');
    // Set currentUser to default or keep in memory
    this.notify();
  }

  // Set user role / active user directly
  public setCurrentUser(role: 'owner' | 'staff' | 'operator') {
    const user = this.schema.users.find((u) => u.role === role) || this.schema.users[0];
    this.schema.currentUser = user;
    localStorage.setItem(
      'ghn_erp_auth_session_v2',
      JSON.stringify({ userId: user.id, loggedAt: new Date().toISOString() })
    );
    this.notify();
  }

  public setCurrentUserById(userId: string) {
    const user = this.schema.users.find((u) => u.id === userId);
    if (user) {
      this.schema.currentUser = user;
      localStorage.setItem(
        'ghn_erp_auth_session_v2',
        JSON.stringify({ userId: user.id, loggedAt: new Date().toISOString() })
      );
      this.notify();
    }
  }

  // ==========================================
  // STAFF MANAGEMENT METHODS (Pengaturan)
  // ==========================================

  public addStaff(params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'owner' | 'staff' | 'operator';
    permissions?: User['permissions'];
  }): { success: boolean; user?: User; error?: string } {
    const cleanEmail = params.email.trim().toLowerCase();
    if (!params.name.trim()) {
      return { success: false, error: 'Nama lengkap wajib diisi.' };
    }
    if (!cleanEmail) {
      return { success: false, error: 'Email login wajib diisi.' };
    }
    if (!params.password || params.password.length < 4) {
      return { success: false, error: 'Kata sandi minimal 4 karakter.' };
    }

    const emailExists = this.schema.users.some(
      (u) => u.email.trim().toLowerCase() === cleanEmail
    );
    if (emailExists) {
      return { success: false, error: 'Email sudah digunakan oleh akun lain.' };
    }

    const newUser: User = {
      id: generateId('usr'),
      name: params.name.trim(),
      email: cleanEmail,
      password: params.password,
      phone: params.phone?.trim() || '',
      role: params.role || 'staff',
      isActive: true,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      permissions: params.permissions || {
        canAccessDashboard: true,
        canAccessProduksi: true,
        canAccessKasir: true,
        canAccessPreOrder: true,
        canAccessStok: true,
        canAccessPelanggan: true,
        canAccessKeuangan: false,
        canAccessLaporan: false,
        canAccessPengaturan: false,
      },
    };

    this.schema.users.push(newUser);
    this.notify();
    return { success: true, user: newUser };
  }

  public updateStaff(
    id: string,
    updates: Partial<User>
  ): { success: boolean; error?: string } {
    const index = this.schema.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    if (updates.email) {
      const cleanEmail = updates.email.trim().toLowerCase();
      const duplicate = this.schema.users.some(
        (u) => u.id !== id && u.email.trim().toLowerCase() === cleanEmail
      );
      if (duplicate) {
        return { success: false, error: 'Email sudah digunakan oleh akun lain.' };
      }
      updates.email = cleanEmail;
    }

    this.schema.users[index] = {
      ...this.schema.users[index],
      ...updates,
    };

    if (this.schema.currentUser.id === id) {
      this.schema.currentUser = this.schema.users[index];
    }

    this.notify();
    return { success: true };
  }

  public deleteStaff(id: string): { success: boolean; error?: string } {
    const user = this.schema.users.find((u) => u.id === id);
    if (!user) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    if (user.email.toLowerCase() === 'septywanf@gmail.com' || user.id === 'usr_owner') {
      return { success: false, error: 'Akun Owner utama tidak dapat dihapus.' };
    }

    if (this.schema.currentUser.id === id) {
      return {
        success: false,
        error: 'Tidak dapat menghapus akun yang sedang aktif digunakan.',
      };
    }

    this.schema.users = this.schema.users.filter((u) => u.id !== id);
    this.notify();
    return { success: true };
  }

  public toggleStaffStatus(id: string): { success: boolean; error?: string } {
    const user = this.schema.users.find((u) => u.id === id);
    if (!user) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    if (user.email.toLowerCase() === 'septywanf@gmail.com' || user.role === 'owner') {
      return { success: false, error: 'Akun Owner utama tidak dapat dinonaktifkan.' };
    }

    user.isActive = user.isActive === false ? true : false;
    this.notify();
    return { success: true };
  }

  // Update Settings
  public updateSettings(newSettings: Partial<FarmSettings>) {
    this.schema.settings = {
      ...this.schema.settings,
      ...newSettings,
    };
    this.notify();
  }

  // ==========================================
  // CORE PHILOSOPHY INTEGRATED TRANSACTIONS
  // ==========================================

  /**
   * 1. RECORD PRODUCTION
   * Input: Tanggal, Jumlah Ayam, Jumlah Telur, Berat Telur (kg), Catatan
   * Automatically:
   * - Calculates HDP: (Jumlah Telur / Jumlah Ayam) * 100
   * - Calculates avg egg weight in grams: (Berat kg * 1000) / Jumlah Telur
   * - Increases Egg Stock by Berat Telur (kg)
   * - Records inventory transaction ('production')
   * - Updates Dashboard metrics
   */
  public recordProduction(params: {
    date: string;
    chickenCount: number;
    eggsCount: number;
    eggWeightKg: number;
    brokenCount?: number;
    notes?: string;
  }): ProductionRecord {
    const hdp = Number(((params.eggsCount / params.chickenCount) * 100).toFixed(2));
    const avgGram = params.eggsCount > 0
      ? Number(((params.eggWeightKg * 1000) / params.eggsCount).toFixed(1))
      : 0;

    const prodRecord: ProductionRecord = {
      id: generateId('prod'),
      date: params.date,
      chickenCount: params.chickenCount,
      eggsCount: params.eggsCount,
      eggWeightKg: params.eggWeightKg,
      brokenCount: params.brokenCount || 0,
      hdp,
      avgGramPerEgg: avgGram,
      notes: params.notes || '',
      createdAt: new Date().toISOString(),
    };

    // 1. Save production
    this.schema.production.unshift(prodRecord);

    // 2. Automatically Increase Egg Stock
    const eggItem = this.schema.inventory.find((i) => i.id === 'inv_telur');
    if (eggItem) {
      const newStock = Number((eggItem.stock + params.eggWeightKg).toFixed(2));
      eggItem.stock = newStock;
      eggItem.lastUpdated = `${params.date} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

      // 3. Record Inventory Transaction
      const invTx: InventoryTransaction = {
        id: generateId('itx'),
        itemId: eggItem.id,
        itemName: eggItem.name,
        date: params.date,
        type: 'production',
        quantity: params.eggWeightKg,
        balanceAfter: newStock,
        referenceId: prodRecord.id,
        notes: `Panen harian: ${params.eggsCount.toLocaleString()} butir (${hdp}% HDP)`,
        createdAt: new Date().toISOString(),
      };
      this.schema.inventoryTransactions.unshift(invTx);
    }

    // 4. Update flock count if specified in settings
    this.schema.settings.chickenPopulation = params.chickenCount;

    this.notify();
    return prodRecord;
  }

  /**
   * 2. RECORD SALE (POS KASIR)
   * Example: Selling 2 kg eggs should automatically update:
   * - Egg stock (decreases by 2 kg)
   * - Customer history (purchases, kg, spent, receivable)
   * - Cash / Receivable
   * - Revenue
   * - Financial report & dashboard
   */
  public recordSale(params: {
    customerId: string;
    customerName: string;
    customerPhone?: string;
    totalKg: number;
    pricePerKg: number;
    discount?: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    dueDate?: string;
    notes?: string;
    customItems?: { id: string; name: string; quantity: number; unit: string; price: number }[];
  }): Sale {
    const today = new Date().toISOString().split('T')[0];
    const dateCode = today.replace(/-/g, '');
    const todaysSalesCount = this.schema.sales.filter((s) => s.date === today).length + 1;
    const invoiceNumber = `GHN-${dateCode}-${String(todaysSalesCount).padStart(3, '0')}`;

    const subtotal = Number((params.totalKg * params.pricePerKg).toFixed(2));
    const discount = params.discount || 0;
    const totalAmount = Math.max(0, subtotal - discount);
    const paidAmount = params.paidAmount;
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    // Prepare items
    const items = params.customItems && params.customItems.length > 0
      ? params.customItems.map((item) => ({
          id: generateId('sitem'),
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unit: item.unit,
          pricePerUnit: item.price,
          subtotal: item.quantity * item.price,
        }))
      : [
          {
            id: generateId('sitem'),
            productId: 'inv_telur',
            productName: 'Telur Ayam Segar Grade A',
            quantity: params.totalKg,
            unit: 'kg',
            pricePerUnit: params.pricePerKg,
            subtotal,
          },
        ];

    const sale: Sale = {
      id: generateId('sale'),
      invoiceNumber,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      date: today,
      items,
      totalKg: params.totalKg,
      pricePerKg: params.pricePerKg,
      subtotal,
      discount,
      totalAmount,
      paidAmount,
      balanceDue,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentStatus,
      dueDate: params.dueDate,
      notes: params.notes || '',
      operatorName: this.schema.currentUser.name,
      createdAt: new Date().toISOString(),
    };

    // 1. Save Sale
    this.schema.sales.unshift(sale);

    // 2. Automatically Decrease Egg Stock
    const eggItem = this.schema.inventory.find((i) => i.id === 'inv_telur');
    if (eggItem) {
      const newStock = Number((eggItem.stock - params.totalKg).toFixed(2));
      eggItem.stock = newStock;
      eggItem.lastUpdated = `${today} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

      // Record inventory transaction
      const invTx: InventoryTransaction = {
        id: generateId('itx'),
        itemId: eggItem.id,
        itemName: eggItem.name,
        date: today,
        type: 'sale',
        quantity: -params.totalKg,
        balanceAfter: newStock,
        referenceId: sale.id,
        notes: `Penjualan ${invoiceNumber} ke ${params.customerName}`,
        createdAt: new Date().toISOString(),
      };
      this.schema.inventoryTransactions.unshift(invTx);
    }

    // 3. Cash / Income Update if any payment was received
    if (paidAmount > 0) {
      // Record Income
      const income: Income = {
        id: generateId('inc'),
        date: today,
        category: 'penjualan_telur',
        amount: paidAmount,
        paymentMethod: params.paymentMethod,
        description: `Penjualan Telur ${params.totalKg} kg (${invoiceNumber}) - ${params.paymentStatus === 'dp' ? 'Uang Muka/DP' : 'Lunas'}`,
        referenceId: sale.id,
        createdAt: new Date().toISOString(),
      };
      this.schema.incomes.unshift(income);

      // Record Cash Transaction
      const currentCash = this.getCashBalance();
      const newCash = currentCash + paidAmount;
      const cashTx: CashTransaction = {
        id: generateId('ctx'),
        date: today,
        type: 'in',
        category: 'Penjualan Telur',
        amount: paidAmount,
        description: `Kasir: ${invoiceNumber} (${params.customerName})`,
        balanceAfter: newCash,
        referenceId: sale.id,
        createdAt: new Date().toISOString(),
      };
      this.schema.cashTransactions.unshift(cashTx);
    }

    // 4. Receivable Update if there is a remaining balance
    if (balanceDue > 0) {
      const dueDate = params.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      const receivable: Receivable = {
        id: generateId('rcv'),
        saleId: sale.id,
        invoiceNumber,
        customerId: params.customerId,
        customerName: params.customerName,
        phone: params.customerPhone,
        date: today,
        dueDate,
        totalAmount,
        paidAmount,
        remainingAmount: balanceDue,
        status: 'belum_lunas',
        notes: params.notes || `Piutang transaksi ${invoiceNumber}`,
        createdAt: new Date().toISOString(),
      };
      this.schema.receivables.unshift(receivable);
    }

    // 5. Update Customer Ledger
    const customer = this.schema.customers.find((c) => c.id === params.customerId);
    if (customer) {
      customer.totalPurchases += 1;
      customer.totalKg = Number((customer.totalKg + params.totalKg).toFixed(2));
      customer.totalSpent += totalAmount;
      customer.outstandingReceivable += balanceDue;
    }

    this.notify();
    return sale;
  }

  /**
   * 3. RECORD PRE-ORDER
   */
  public recordPreOrder(params: {
    customerId: string;
    customerName: string;
    phone: string;
    orderDate: string;
    pickupDate: string;
    quantityKg: number;
    pricePerKg: number;
    dpAmount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): PreOrder {
    const today = new Date().toISOString().split('T')[0];
    const dateCode = today.replace(/-/g, '');
    const todaysPOCount = this.schema.preorders.filter((p) => p.orderDate === today).length + 1;
    const orderNumber = `PO-${dateCode}-${String(todaysPOCount).padStart(3, '0')}`;

    const totalAmount = params.quantityKg * params.pricePerKg;
    const dpAmount = params.dpAmount || 0;
    const balanceDue = Math.max(0, totalAmount - dpAmount);

    let status: PreOrderStatus = 'menunggu';
    if (dpAmount >= totalAmount) {
      status = 'lunas';
    } else if (dpAmount > 0) {
      status = 'dp_masuk';
    }

    const preorder: PreOrder = {
      id: generateId('po'),
      orderNumber,
      customerId: params.customerId,
      customerName: params.customerName,
      phone: params.phone,
      orderDate: params.orderDate,
      pickupDate: params.pickupDate,
      quantityKg: params.quantityKg,
      pricePerKg: params.pricePerKg,
      totalAmount,
      dpAmount,
      balanceDue,
      status,
      paymentMethod: params.paymentMethod,
      notes: params.notes || '',
      createdAt: new Date().toISOString(),
    };

    this.schema.preorders.unshift(preorder);

    // If DP was entered, record cash flow & income
    if (dpAmount > 0) {
      const income: Income = {
        id: generateId('inc'),
        date: params.orderDate,
        category: 'penjualan_telur',
        amount: dpAmount,
        paymentMethod: params.paymentMethod,
        description: `DP Pre Order ${orderNumber} (${params.customerName})`,
        referenceId: preorder.id,
        createdAt: new Date().toISOString(),
      };
      this.schema.incomes.unshift(income);

      const currentCash = this.getCashBalance();
      const newCash = currentCash + dpAmount;
      const cashTx: CashTransaction = {
        id: generateId('ctx'),
        date: params.orderDate,
        type: 'in',
        category: 'Pre Order DP',
        amount: dpAmount,
        description: `DP Masuk: ${orderNumber} (${params.customerName})`,
        balanceAfter: newCash,
        referenceId: preorder.id,
        createdAt: new Date().toISOString(),
      };
      this.schema.cashTransactions.unshift(cashTx);
    }

    this.notify();
    return preorder;
  }

  /**
   * 4. UPDATE PRE-ORDER STATUS & COMPLETE ORDER
   * When order completed:
   * - Egg stock decreases by quantityKg
   * - Remaining payment is processed and added to Cash & Revenue
   * - Status becomes Selesai
   * - Sale invoice is generated
   */
  public updatePreOrderStatus(
    preorderId: string,
    newStatus: PreOrderStatus,
    paymentOptions?: { paymentMethod: PaymentMethod; amountPaidNow: number }
  ) {
    const po = this.schema.preorders.find((p) => p.id === preorderId);
    if (!po) return;

    if (newStatus === 'selesai' && po.status !== 'selesai') {
      const today = new Date().toISOString().split('T')[0];
      const remainingToPay = paymentOptions ? paymentOptions.amountPaidNow : po.balanceDue;
      const finalPaymentMethod = paymentOptions?.paymentMethod || po.paymentMethod;

      // 1. Egg stock decreases
      const eggItem = this.schema.inventory.find((i) => i.id === 'inv_telur');
      if (eggItem) {
        const newStock = Number((eggItem.stock - po.quantityKg).toFixed(2));
        eggItem.stock = newStock;
        eggItem.lastUpdated = `${today} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

        const invTx: InventoryTransaction = {
          id: generateId('itx'),
          itemId: eggItem.id,
          itemName: eggItem.name,
          date: today,
          type: 'sale',
          quantity: -po.quantityKg,
          balanceAfter: newStock,
          referenceId: po.id,
          notes: `Pengambilan Pre Order ${po.orderNumber} oleh ${po.customerName}`,
          createdAt: new Date().toISOString(),
        };
        this.schema.inventoryTransactions.unshift(invTx);
      }

      // 2. Process remaining payment into Cash & Income
      if (remainingToPay > 0) {
        const income: Income = {
          id: generateId('inc'),
          date: today,
          category: 'penjualan_telur',
          amount: remainingToPay,
          paymentMethod: finalPaymentMethod,
          description: `Pelunasan Pre Order ${po.orderNumber} (${po.customerName})`,
          referenceId: po.id,
          createdAt: new Date().toISOString(),
        };
        this.schema.incomes.unshift(income);

        const currentCash = this.getCashBalance();
        const newCash = currentCash + remainingToPay;
        const cashTx: CashTransaction = {
          id: generateId('ctx'),
          date: today,
          type: 'in',
          category: 'Pelunasan Pre Order',
          amount: remainingToPay,
          description: `Pelunasan: ${po.orderNumber} (${po.customerName})`,
          balanceAfter: newCash,
          referenceId: po.id,
          createdAt: new Date().toISOString(),
        };
        this.schema.cashTransactions.unshift(cashTx);
      }

      // 3. Mark pre-order as completed
      po.status = 'selesai';
      po.balanceDue = Math.max(0, po.balanceDue - remainingToPay);
      po.dpAmount = po.totalAmount - po.balanceDue;
      po.completedAt = new Date().toISOString();

      // 4. Update Customer Ledger
      const customer = this.schema.customers.find((c) => c.id === po.customerId);
      if (customer) {
        customer.totalPurchases += 1;
        customer.totalKg = Number((customer.totalKg + po.quantityKg).toFixed(2));
        customer.totalSpent += po.totalAmount;
      }
    } else {
      po.status = newStatus;
    }

    this.notify();
  }

  /**
   * 5. RECORD EXPENSE (PENGELUARAN)
   * Categories: Pakan, Vitamin, Obat, Listrik, Air, Transport, Kemasan, Perawatan, Gaji, Lainnya
   */
  public recordExpense(params: {
    date: string;
    category: ExpenseCategory;
    amount: number;
    paymentMethod: PaymentMethod;
    description: string;
    supplier?: string;
  }): Expense {
    const expense: Expense = {
      id: generateId('exp'),
      date: params.date,
      category: params.category,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      description: params.description,
      supplier: params.supplier,
      createdAt: new Date().toISOString(),
    };

    this.schema.expenses.unshift(expense);

    // Deduct cash immediately
    const currentCash = this.getCashBalance();
    const newCash = currentCash - params.amount;
    const cashTx: CashTransaction = {
      id: generateId('ctx'),
      date: params.date,
      type: 'out',
      category: `Beban ${params.category.toUpperCase()}`,
      amount: params.amount,
      description: params.description,
      balanceAfter: newCash,
      referenceId: expense.id,
      createdAt: new Date().toISOString(),
    };
    this.schema.cashTransactions.unshift(cashTx);

    this.notify();
    return expense;
  }

  /**
   * 6. RECORD FEED USAGE / STOCK OUT (PENGGUNAAN PAKAN)
   * Automatically:
   * - Feed Stock decreases
   * - Inventory transaction is recorded
   */
  public recordStockUsage(params: {
    itemId: string;
    quantity: number; // e.g. 150 kg
    date: string;
    notes?: string;
  }) {
    const item = this.schema.inventory.find((i) => i.id === params.itemId);
    if (!item) return;

    const newStock = Math.max(0, Number((item.stock - params.quantity).toFixed(2)));
    item.stock = newStock;
    item.lastUpdated = `${params.date} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    const invTx: InventoryTransaction = {
      id: generateId('itx'),
      itemId: item.id,
      itemName: item.name,
      date: params.date,
      type: 'out',
      quantity: -params.quantity,
      balanceAfter: newStock,
      notes: params.notes || `Pemakaian rutin kandang: ${params.quantity} ${item.unit}`,
      createdAt: new Date().toISOString(),
    };
    this.schema.inventoryTransactions.unshift(invTx);

    this.notify();
  }

  /**
   * 7. RESTOCK / PURCHASE INVENTORY (PEMBELIAN PAKAN / SUPPLIES)
   * Purchasing feed should automatically:
   * - Feed Stock +
   * - Expense +
   * - Cash or Payable
   */
  public recordRestock(params: {
    itemId: string;
    quantity: number;
    unitCost: number;
    totalAmount: number;
    date: string;
    paymentType: 'cash' | 'payable'; // Tunai/Transfer atau Hutang Tempo
    paymentMethod: PaymentMethod;
    supplier?: string;
    dueDate?: string;
    notes?: string;
  }) {
    const item = this.schema.inventory.find((i) => i.id === params.itemId);
    if (!item) return;

    // 1. Stock increases
    const newStock = Number((item.stock + params.quantity).toFixed(2));
    item.stock = newStock;
    item.avgCost = params.unitCost;
    item.lastUpdated = `${params.date} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    const invTx: InventoryTransaction = {
      id: generateId('itx'),
      itemId: item.id,
      itemName: item.name,
      date: params.date,
      type: 'in',
      quantity: params.quantity,
      unitCost: params.unitCost,
      balanceAfter: newStock,
      notes: `Restock/Pembelian: ${params.notes || item.name} dari ${params.supplier || 'Supplier'}`,
      createdAt: new Date().toISOString(),
    };
    this.schema.inventoryTransactions.unshift(invTx);

    // 2. Expense & Payment
    const category: ExpenseCategory = item.category === 'pakan' ? 'pakan' : item.category === 'supplies' ? 'obat' : 'lainnya';

    if (params.paymentType === 'cash') {
      // Cash payment
      this.recordExpense({
        date: params.date,
        category,
        amount: params.totalAmount,
        paymentMethod: params.paymentMethod,
        description: `Pembelian ${item.name} (${params.quantity} ${item.unit})`,
        supplier: params.supplier,
      });
    } else {
      // Payable (Hutang Usaha)
      const payable: Payable = {
        id: generateId('pyb'),
        supplierName: params.supplier || 'Supplier Ternak',
        category,
        date: params.date,
        dueDate: params.dueDate || params.date,
        totalAmount: params.totalAmount,
        paidAmount: 0,
        remainingAmount: params.totalAmount,
        status: 'belum_lunas',
        description: `Hutang pembelian ${item.name} (${params.quantity} ${item.unit})`,
        createdAt: new Date().toISOString(),
      };
      this.schema.payables.unshift(payable);
      this.notify();
    }
  }

  /**
   * 8. STOCK ADJUSTMENT (OPNAME)
   */
  public recordStockAdjustment(params: {
    itemId: string;
    newStock: number;
    reason: string;
    date: string;
  }) {
    const item = this.schema.inventory.find((i) => i.id === params.itemId);
    if (!item) return;

    const diff = Number((params.newStock - item.stock).toFixed(2));
    item.stock = params.newStock;
    item.lastUpdated = `${params.date} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    const invTx: InventoryTransaction = {
      id: generateId('itx'),
      itemId: item.id,
      itemName: item.name,
      date: params.date,
      type: 'adjustment',
      quantity: diff,
      balanceAfter: params.newStock,
      notes: `Penyesuaian Opname: ${params.reason}`,
      createdAt: new Date().toISOString(),
    };
    this.schema.inventoryTransactions.unshift(invTx);

    this.notify();
  }

  /**
   * 9. RECEIVABLE PAYMENT (BAYAR PIUTANG)
   */
  public payReceivable(params: {
    receivableId: string;
    amount: number;
    date: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) {
    const rcv = this.schema.receivables.find((r) => r.id === params.receivableId);
    if (!rcv) return;

    const payAmount = Math.min(params.amount, rcv.remainingAmount);
    rcv.paidAmount += payAmount;
    rcv.remainingAmount = Math.max(0, rcv.remainingAmount - payAmount);
    if (rcv.remainingAmount === 0) {
      rcv.status = 'lunas';
    }

    // Record payment receipt
    const paymentRecord: ReceivablePayment = {
      id: generateId('rp'),
      receivableId: rcv.id,
      date: params.date,
      amount: payAmount,
      paymentMethod: params.paymentMethod,
      notes: params.notes || '',
      createdAt: new Date().toISOString(),
    };
    this.schema.receivablePayments.unshift(paymentRecord);

    // Record Cash IN
    const currentCash = this.getCashBalance();
    const newCash = currentCash + payAmount;
    const cashTx: CashTransaction = {
      id: generateId('ctx'),
      date: params.date,
      type: 'in',
      category: 'Pelunasan Piutang',
      amount: payAmount,
      description: `Pembayaran piutang faktur ${rcv.invoiceNumber} (${rcv.customerName})`,
      balanceAfter: newCash,
      referenceId: rcv.id,
      createdAt: new Date().toISOString(),
    };
    this.schema.cashTransactions.unshift(cashTx);

    // Update customer outstanding receivable
    const customer = this.schema.customers.find((c) => c.id === rcv.customerId);
    if (customer) {
      customer.outstandingReceivable = Math.max(0, customer.outstandingReceivable - payAmount);
    }

    this.notify();
  }

  /**
   * 10. PAYABLE PAYMENT (BAYAR HUTANG KE SUPPLIER)
   */
  public payPayable(params: {
    payableId: string;
    amount: number;
    date: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) {
    const pyb = this.schema.payables.find((p) => p.id === params.payableId);
    if (!pyb) return;

    const payAmount = Math.min(params.amount, pyb.remainingAmount);
    pyb.paidAmount += payAmount;
    pyb.remainingAmount = Math.max(0, pyb.remainingAmount - payAmount);
    if (pyb.remainingAmount === 0) {
      pyb.status = 'lunas';
    }

    // Record payment receipt
    const paymentRecord: PayablePayment = {
      id: generateId('pp'),
      payableId: pyb.id,
      date: params.date,
      amount: payAmount,
      paymentMethod: params.paymentMethod,
      notes: params.notes || '',
      createdAt: new Date().toISOString(),
    };
    this.schema.payablePayments.unshift(paymentRecord);

    // Record Cash OUT
    const currentCash = this.getCashBalance();
    const newCash = currentCash - payAmount;
    const cashTx: CashTransaction = {
      id: generateId('ctx'),
      date: params.date,
      type: 'out',
      category: 'Pembayaran Hutang',
      amount: payAmount,
      description: `Bayar hutang ${pyb.supplierName}: ${pyb.description}`,
      balanceAfter: newCash,
      referenceId: pyb.id,
      createdAt: new Date().toISOString(),
    };
    this.schema.cashTransactions.unshift(cashTx);

    this.notify();
  }

  /**
   * 11. CAPITAL & PRIVE (MODAL & PRIVE)
   * Do not classify Prive as expense!
   */
  public recordCapitalTransaction(params: {
    date: string;
    type: 'modal' | 'prive';
    amount: number;
    paymentMethod: PaymentMethod;
    notes: string;
  }) {
    const capTx: CapitalTransaction = {
      id: generateId('cap'),
      date: params.date,
      type: params.type,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };
    this.schema.capitalTransactions.unshift(capTx);

    const currentCash = this.getCashBalance();
    const isModal = params.type === 'modal';
    const newCash = isModal ? currentCash + params.amount : currentCash - params.amount;

    const cashTx: CashTransaction = {
      id: generateId('ctx'),
      date: params.date,
      type: isModal ? 'in' : 'out',
      category: isModal ? 'Suntikan Modal Pemilik' : 'Penarikan Prive Pemilik',
      amount: params.amount,
      description: params.notes,
      balanceAfter: newCash,
      referenceId: capTx.id,
      createdAt: new Date().toISOString(),
    };
    this.schema.cashTransactions.unshift(cashTx);

    this.notify();
  }

  /**
   * 12. CUSTOMER MANAGEMENT
   */
  public addCustomer(data: Omit<Customer, 'id' | 'totalPurchases' | 'totalKg' | 'totalSpent' | 'outstandingReceivable' | 'createdAt'>): Customer {
    const customer: Customer = {
      id: generateId('cst'),
      ...data,
      totalPurchases: 0,
      totalKg: 0,
      totalSpent: 0,
      outstandingReceivable: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.schema.customers.unshift(customer);
    this.notify();
    return customer;
  }

  public updateCustomer(id: string, data: Partial<Customer>) {
    const idx = this.schema.customers.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.schema.customers[idx] = { ...this.schema.customers[idx], ...data };
      this.notify();
    }
  }

  /**
   * 13. INVENTORY MANAGEMENT (Add new Item)
   */
  public addInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem {
    const newItem: InventoryItem = {
      id: generateId('inv'),
      ...item,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    this.schema.inventory.push(newItem);
    this.notify();
    return newItem;
  }

  /**
   * INVENTORY MANAGEMENT: Tambah Stok Cepat Manual (Direct Stock Addition)
   */
  public addStockManual(params: {
    itemId: string;
    quantity: number;
    reason: string;
    date?: string;
  }): { success: boolean; message: string } {
    const item = this.schema.inventory.find((i) => i.id === params.itemId);
    if (!item) return { success: false, message: 'Barang tidak ditemukan dalam inventaris.' };

    const date = params.date || new Date().toISOString().split('T')[0];
    const qty = Number(params.quantity);
    if (isNaN(qty) || qty <= 0) {
      return { success: false, message: 'Jumlah stok harus lebih dari 0.' };
    }

    const newStock = Number((item.stock + qty).toFixed(2));
    item.stock = newStock;
    item.lastUpdated = `${date} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    const invTx: InventoryTransaction = {
      id: generateId('itx'),
      itemId: item.id,
      itemName: item.name,
      date,
      type: 'in',
      quantity: qty,
      balanceAfter: newStock,
      notes: `Penambahan Stok Manual: ${params.reason || 'Koreksi / Penambahan Langsung'}`,
      createdAt: new Date().toISOString(),
    };
    this.schema.inventoryTransactions.unshift(invTx);
    this.notify();
    return {
      success: true,
      message: `Stok ${item.name} berhasil ditambah +${qty} ${item.unit}! (Stok sekarang: ${newStock} ${item.unit})`,
    };
  }

  /**
   * INVENTORY MANAGEMENT: Hapus / Kurangi Stok (Pemusnahan / Susut / Rusak / Telur Pecah)
   */
  public discardStock(params: {
    itemId: string;
    quantity: number;
    reason: string;
    date?: string;
  }): { success: boolean; message: string } {
    const item = this.schema.inventory.find((i) => i.id === params.itemId);
    if (!item) return { success: false, message: 'Barang tidak ditemukan dalam inventaris.' };

    const date = params.date || new Date().toISOString().split('T')[0];
    const qty = Number(params.quantity);
    if (isNaN(qty) || qty <= 0) {
      return { success: false, message: 'Jumlah yang dikurangi harus lebih dari 0.' };
    }

    const actualQty = Math.min(qty, item.stock);
    const newStock = Math.max(0, Number((item.stock - actualQty).toFixed(2)));
    item.stock = newStock;
    item.lastUpdated = `${date} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    const invTx: InventoryTransaction = {
      id: generateId('itx'),
      itemId: item.id,
      itemName: item.name,
      date,
      type: 'out',
      quantity: -actualQty,
      balanceAfter: newStock,
      notes: `Pengurangan / Hapus Stok: ${params.reason || 'Pemusnahan / Susut'}`,
      createdAt: new Date().toISOString(),
    };
    this.schema.inventoryTransactions.unshift(invTx);
    this.notify();
    return {
      success: true,
      message: `Stok ${item.name} berhasil dikurangi -${actualQty} ${item.unit} (${params.reason}). Sisa stok: ${newStock} ${item.unit}`,
    };
  }

  /**
   * INVENTORY MANAGEMENT: Hapus Item dari Inventaris (Delete Inventory Item)
   */
  public deleteInventoryItem(itemId: string): { success: boolean; message: string } {
    if (itemId === 'inv_telur') {
      return {
        success: false,
        message: 'Produk inti Telur Ayam tidak dapat dihapus dari daftar komoditas farm. Gunakan fitur kurangi/hapus stok jika ingin mereset angka stok.',
      };
    }

    const idx = this.schema.inventory.findIndex((i) => i.id === itemId);
    if (idx === -1) {
      return { success: false, message: 'Barang tidak ditemukan.' };
    }

    const item = this.schema.inventory[idx];
    this.schema.inventory.splice(idx, 1);
    this.schema.inventoryTransactions = this.schema.inventoryTransactions.filter((tx) => tx.itemId !== itemId);
    this.notify();

    return {
      success: true,
      message: `Barang "${item.name}" berhasil dihapus permanen dari inventaris!`,
    };
  }

  /**
   * INVENTORY MANAGEMENT: Batalkan Transaksi Mutasi Stok (Revert Mutation)
   */
  public cancelInventoryTransaction(txId: string): { success: boolean; message: string } {
    const idx = this.schema.inventoryTransactions.findIndex((t) => t.id === txId);
    if (idx === -1) {
      return { success: false, message: 'Catatan mutasi stok tidak ditemukan.' };
    }

    const tx = this.schema.inventoryTransactions[idx];
    const item = this.schema.inventory.find((i) => i.id === tx.itemId);
    if (item) {
      // Revert quantity back to stock
      const reverted = Number((item.stock - tx.quantity).toFixed(2));
      item.stock = Math.max(0, reverted);
      item.lastUpdated = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    }

    this.schema.inventoryTransactions.splice(idx, 1);
    this.notify();
    return {
      success: true,
      message: `Mutasi stok ${tx.itemName} berhasil dibatalkan dan stok dikembalikan!`,
    };
  }

  // =========================================================================
  // PEMBATALAN INPUT / VOID TRANSACTIONS (UNTUK JAGA-JAGA SALAH INPUT)
  // =========================================================================

  /**
   * PEMBATALAN 1: Batalkan Input Panen Telur (Revert Production Record)
   * Mengembalikan stok telur (-eggWeightKg) dan menghapus catatan produksi panen.
   */
  public cancelProduction(productionId: string): { success: boolean; message: string } {
    const idx = this.schema.production.findIndex((p) => p.id === productionId);
    if (idx === -1) {
      return { success: false, message: 'Catatan panen produksi tidak ditemukan.' };
    }
    const prod = this.schema.production[idx];

    // Revert egg stock
    const eggItem = this.schema.inventory.find((i) => i.id === 'inv_telur');
    if (eggItem) {
      eggItem.stock = Math.max(0, Number((eggItem.stock - prod.eggWeightKg).toFixed(2)));
      eggItem.lastUpdated = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

      // Remove corresponding inventory transaction
      this.schema.inventoryTransactions = this.schema.inventoryTransactions.filter(
        (tx) => tx.referenceId !== prod.id
      );
    }

    // Remove production record
    this.schema.production.splice(idx, 1);
    this.notify();

    return {
      success: true,
      message: `Catatan panen tanggal ${prod.date} (${prod.eggsCount.toLocaleString()} butir / ${prod.eggWeightKg} kg) berhasil dibatalkan & stok telur disesuaikan kembali!`,
    };
  }

  /**
   * PEMBATALAN 2: Batalkan Transaksi Kasir POS (Void Sale)
   * Mengembalikan stok telur (+totalKg), membatalkan penerimaan kas, dan menghapus piutang terkait.
   */
  public cancelSale(saleId: string, reason?: string): { success: boolean; message: string } {
    const idx = this.schema.sales.findIndex((s) => s.id === saleId);
    if (idx === -1) {
      return { success: false, message: 'Transaksi penjualan kasir tidak ditemukan.' };
    }
    const sale = this.schema.sales[idx];

    // 1. Revert egg stock (+totalKg back to inventory)
    const eggItem = this.schema.inventory.find((i) => i.id === 'inv_telur');
    if (eggItem) {
      eggItem.stock = Number((eggItem.stock + sale.totalKg).toFixed(2));
      eggItem.lastUpdated = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

      // Clean up sale inventory transaction
      this.schema.inventoryTransactions = this.schema.inventoryTransactions.filter(
        (tx) => tx.referenceId !== sale.id
      );
    }

    // 2. Revert cash & income if any amount was paid
    if (sale.paidAmount > 0) {
      // Remove related income
      this.schema.incomes = this.schema.incomes.filter((inc) => inc.referenceId !== sale.id);

      // Record reversal cash outflow
      const currentCash = this.getCashBalance();
      const newCash = Math.max(0, currentCash - sale.paidAmount);
      const cashTx: CashTransaction = {
        id: generateId('ctx'),
        date: new Date().toISOString().split('T')[0],
        type: 'out',
        category: 'Pembatalan Kasir POS',
        amount: sale.paidAmount,
        description: `Batal Transaksi: Faktur ${sale.invoiceNumber} (${sale.customerName})${reason ? ` - ${reason}` : ''}`,
        balanceAfter: newCash,
        referenceId: sale.id,
        createdAt: new Date().toISOString(),
      };
      this.schema.cashTransactions.unshift(cashTx);
    }

    // 3. Revert receivable if there was balance due
    if (sale.balanceDue > 0) {
      this.schema.receivables = this.schema.receivables.filter(
        (rcv) => rcv.saleId !== sale.id && rcv.invoiceNumber !== sale.invoiceNumber
      );
    }

    // 4. Revert customer ledger totals
    const customer = this.schema.customers.find((c) => c.id === sale.customerId);
    if (customer) {
      customer.totalPurchases = Math.max(0, customer.totalPurchases - 1);
      customer.totalKg = Math.max(0, Number((customer.totalKg - sale.totalKg).toFixed(2)));
      customer.totalSpent = Math.max(0, customer.totalSpent - sale.totalAmount);
      customer.outstandingReceivable = Math.max(0, customer.outstandingReceivable - sale.balanceDue);
    }

    // 5. Remove sale record
    this.schema.sales.splice(idx, 1);
    this.notify();

    return {
      success: true,
      message: `Faktur penjualan ${sale.invoiceNumber} (${sale.totalKg} kg) berhasil dibatalkan! Stok telur telah dikembalikan & kas disesuaikan.`,
    };
  }

  /**
   * PEMBATALAN 3: Batalkan / Hapus Beban Pengeluaran (Revert Expense)
   * Mengembalikan saldo kas (+amount) dan menghapus catatan beban pengeluaran.
   */
  public cancelExpense(expenseId: string): { success: boolean; message: string } {
    const idx = this.schema.expenses.findIndex((e) => e.id === expenseId);
    if (idx === -1) {
      return { success: false, message: 'Catatan beban pengeluaran tidak ditemukan.' };
    }
    const exp = this.schema.expenses[idx];

    // Revert cash balance
    const currentCash = this.getCashBalance();
    const newCash = currentCash + exp.amount;
    const cashTx: CashTransaction = {
      id: generateId('ctx'),
      date: new Date().toISOString().split('T')[0],
      type: 'in',
      category: 'Koreksi Batal Beban',
      amount: exp.amount,
      description: `Batal Beban: ${exp.description} (${exp.category})`,
      balanceAfter: newCash,
      referenceId: exp.id,
      createdAt: new Date().toISOString(),
    };
    this.schema.cashTransactions.unshift(cashTx);

    // Remove expense
    this.schema.expenses.splice(idx, 1);
    this.notify();

    return {
      success: true,
      message: `Beban ${exp.description} berhasil dibatalkan & saldo kas Rp ${exp.amount.toLocaleString('id-ID')} telah dikembalikan!`,
    };
  }

  /**
   * PEMBATALAN 4: Batalkan / Hapus Catatan Pemasukan (Revert Income)
   * Menyesuaikan saldo kas (-amount) dan menghapus catatan pendapatan.
   */
  public cancelIncome(incomeId: string): { success: boolean; message: string } {
    const idx = this.schema.incomes.findIndex((i) => i.id === incomeId);
    if (idx === -1) {
      return { success: false, message: 'Catatan pendapatan tidak ditemukan.' };
    }
    const inc = this.schema.incomes[idx];

    const currentCash = this.getCashBalance();
    const newCash = Math.max(0, currentCash - inc.amount);
    const cashTx: CashTransaction = {
      id: generateId('ctx'),
      date: new Date().toISOString().split('T')[0],
      type: 'out',
      category: 'Koreksi Batal Pendapatan',
      amount: inc.amount,
      description: `Batal Pendapatan: ${inc.description}`,
      balanceAfter: newCash,
      referenceId: inc.id,
      createdAt: new Date().toISOString(),
    };
    this.schema.cashTransactions.unshift(cashTx);

    this.schema.incomes.splice(idx, 1);
    this.notify();

    return {
      success: true,
      message: `Catatan pendapatan "${inc.description}" berhasil dibatalkan & kas disesuaikan!`,
    };
  }

  /**
   * PEMBATALAN 5: Batalkan Pre Order (Cancel Pre-Order)
   * Mengembalikan uang DP (jika ada) dan mengubah status atau menghapus PO.
   */
  public cancelPreOrder(preorderId: string, reason?: string): { success: boolean; message: string } {
    const po = this.schema.preorders.find((p) => p.id === preorderId);
    if (!po) {
      return { success: false, message: 'Pre Order tidak ditemukan.' };
    }

    // Return DP if customer paid DP
    if (po.dpAmount > 0) {
      this.schema.incomes = this.schema.incomes.filter((inc) => inc.referenceId !== po.id);

      const currentCash = this.getCashBalance();
      const newCash = Math.max(0, currentCash - po.dpAmount);
      const cashTx: CashTransaction = {
        id: generateId('ctx'),
        date: new Date().toISOString().split('T')[0],
        type: 'out',
        category: 'Retur DP PO Batal',
        amount: po.dpAmount,
        description: `Retur DP Pre Order ${po.orderNumber} (${po.customerName})${reason ? `: ${reason}` : ''}`,
        balanceAfter: newCash,
        referenceId: po.id,
        createdAt: new Date().toISOString(),
      };
      this.schema.cashTransactions.unshift(cashTx);
    }

    po.status = 'dibatalkan';
    po.notes = `${po.notes ? po.notes + ' | ' : ''}Dibatalkan: ${reason || 'Pembatalan salah input / permintaan pelanggan'}`;
    this.notify();

    return {
      success: true,
      message: `Pre Order ${po.orderNumber} (${po.customerName}) berhasil dibatalkan!${po.dpAmount > 0 ? ' Uang DP kas telah dikembalikan.' : ''}`,
    };
  }

  /**
   * 14. AUTOMATIC MONTHLY CLOSING (TUTUP BUKU BULANAN)
   * Generates summary, registers monthly archive without deleting historical records!
   */
  public closeMonth(monthYear: string): MonthlyReport {
    // Check if already closed
    const existing = this.schema.monthlyReports.find((r) => r.monthYear === monthYear);
    if (existing) {
      return existing;
    }

    const [year, month] = monthYear.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthName = `${monthNames[parseInt(month, 10) - 1]} ${year}`;

    // Filter data for this month
    const monthProds = this.schema.production.filter((p) => p.date.startsWith(monthYear));
    const totalEggs = monthProds.reduce((sum, p) => sum + p.eggsCount, 0);
    const totalKg = Number(monthProds.reduce((sum, p) => sum + p.eggWeightKg, 0).toFixed(2));
    const avgHdp = monthProds.length > 0
      ? Number((monthProds.reduce((sum, p) => sum + p.hdp, 0) / monthProds.length).toFixed(2))
      : 0;

    const monthSales = this.schema.sales.filter((s) => s.date.startsWith(monthYear));
    const totalRevenue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);

    const monthExpenses = this.schema.expenses.filter((e) => e.date.startsWith(monthYear));
    const totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalRevenue - totalExpense;

    const monthCashIn = this.schema.cashTransactions
      .filter((c) => c.date.startsWith(monthYear) && c.type === 'in')
      .reduce((sum, c) => sum + c.amount, 0);

    const monthCashOut = this.schema.cashTransactions
      .filter((c) => c.date.startsWith(monthYear) && c.type === 'out')
      .reduce((sum, c) => sum + c.amount, 0);

    const monthPOs = this.schema.preorders.filter((p) => p.orderDate.startsWith(monthYear));

    const report: MonthlyReport = {
      id: generateId('mr'),
      monthYear,
      monthName,
      closedAt: new Date().toISOString(),
      population: this.schema.settings.chickenPopulation,
      totalEggs,
      totalKg,
      avgHdp,
      totalRevenue,
      totalExpense,
      netProfit,
      cashIn: monthCashIn,
      cashOut: monthCashOut,
      salesCount: monthSales.length,
      preorderCount: monthPOs.length,
      notes: `Tutup Buku Bulanan ${monthName} dibuat otomatis oleh GHN ERP Lite.`,
    };

    this.schema.monthlyReports.unshift(report);
    this.notify();
    return report;
  }

  /**
   * Helper: Calculate current cash balance
   */
  public getCashBalance(): number {
    if (this.schema.cashTransactions.length > 0) {
      return this.schema.cashTransactions[0].balanceAfter;
    }
    return this.schema.openingCashBalance;
  }

  /**
   * Helper: Muat Ulang / Reset ke Data Demo Percontohan September 2026
   */
  public resetToDemoData(): { success: boolean; message: string } {
    const demoData = this.getDefaultSchema();
    
    // Preserve existing users so active logged-in user isn't disrupted
    const currentUsers = this.schema.users && this.schema.users.length > 0 ? this.schema.users : demoData.users;
    const currentSessionUser = this.schema.currentUser || currentUsers[0];

    this.schema = {
      ...demoData,
      users: currentUsers,
      currentUser: currentSessionUser,
    };

    this.notify();
    return {
      success: true,
      message: 'Data demo percontohan September 2026 berhasil dimuat lengkap!',
    };
  }

  /**
   * Helper: Reset All Data: Kosongkan seluruh transaksi dan inventaris (Database Bersih dari Nol)
   */
  public resetAllData(options?: {
    openingCash?: number;
    resetFarmSettings?: boolean;
    clearCustomers?: boolean;
  }): { success: boolean; message: string } {
    const defaultData = this.getDefaultSchema();
    const openingCash = typeof options?.openingCash === 'number' && !isNaN(options.openingCash)
      ? options.openingCash
      : 0;

    // Zeroed inventory catalog
    const emptyInventory: InventoryItem[] = [
      {
        id: 'inv_telur',
        name: 'Telur Ayam Segar Grade A',
        category: 'produk',
        unit: 'kg',
        stock: 0,
        minStock: 50,
        avgCost: 21500,
        notes: 'Telur segar hasil panen kandang',
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
      {
        id: 'inv_pakan_layer',
        name: 'Pakan Layer Konsentrat KL-36',
        category: 'pakan',
        unit: 'kg',
        stock: 0,
        minStock: 500,
        avgCost: 8900,
        notes: 'Pakan pabrikan protein 36%',
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
      {
        id: 'inv_jagung',
        name: 'Jagung Pipil Kering Giling',
        category: 'pakan',
        unit: 'kg',
        stock: 0,
        minStock: 500,
        avgCost: 5400,
        notes: 'Bahan baku karbohidrat pakan',
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
      {
        id: 'inv_katul',
        name: 'Katul / Dedak Padi Halus Super',
        category: 'pakan',
        unit: 'kg',
        stock: 0,
        minStock: 300,
        avgCost: 3800,
        notes: 'Serat & energi pakan layer',
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
      {
        id: 'inv_tray',
        name: 'Tray Telur Kertas (Kapasitas 30 Butir)',
        category: 'supplies',
        unit: 'pcs',
        stock: 0,
        minStock: 100,
        avgCost: 1200,
        notes: 'Kemasan karton standar egg tray',
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
      {
        id: 'inv_vitamin',
        name: 'Vitamin & Suplemen Egg Boost 1L',
        category: 'supplies',
        unit: 'botol',
        stock: 0,
        minStock: 10,
        avgCost: 85000,
        notes: 'Multivitamin perangsang produksi',
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
    ];

    const currentUsers = this.schema.users && this.schema.users.length > 0 ? this.schema.users : defaultData.users;
    const currentSessionUser = this.schema.currentUser || currentUsers[0];

    const initialCashTx: CashTransaction[] = [];
    if (openingCash > 0) {
      initialCashTx.push({
        id: generateId('ctx'),
        date: new Date().toISOString().split('T')[0],
        type: 'in',
        category: 'modal',
        amount: openingCash,
        balanceAfter: openingCash,
        description: 'Saldo Awal Pembukuan Baru Kas Farm',
        referenceId: 'OPENING_BALANCE',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
    }

    this.schema = {
      settings: options?.resetFarmSettings ? defaultData.settings : { ...this.schema.settings },
      users: currentUsers,
      currentUser: currentSessionUser,
      production: [],
      inventory: emptyInventory,
      inventoryTransactions: [],
      customers: options?.clearCustomers ? [] : deepClone(this.schema.customers || []),
      sales: [],
      preorders: [],
      incomes: [],
      expenses: [],
      receivables: [],
      receivablePayments: [],
      payables: [],
      payablePayments: [],
      capitalTransactions: [],
      cashTransactions: initialCashTx,
      monthlyReports: [],
      openingCashBalance: openingCash,
    };

    this.notify();
    return {
      success: true,
      message: 'Seluruh data transaksi dan stok berhasil dikosongkan. Pembukuan siap dimulai dari nol!',
    };
  }

  /**
   * Helper: Reset database to fresh factory seed (alias to resetToDemoData)
   */
  public resetToDefaults() {
    this.resetToDemoData();
  }

  /**
   * Helper: Export DB as JSON string
   */
  public exportToJson(): string {
    return JSON.stringify(this.schema, null, 2);
  }

  /**
   * Helper: Import DB from JSON string
   */
  public importFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings && parsed.inventory) {
        this.schema = parsed;
        this.notify();
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON data', e);
    }
    return false;
  }
}

export const db = new DatabaseService();
