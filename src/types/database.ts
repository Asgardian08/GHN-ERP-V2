export type UserRole = 'owner' | 'staff' | 'operator';

export interface UserPermissions {
  canAccessDashboard?: boolean;
  canAccessProduksi?: boolean;
  canAccessKasir?: boolean;
  canAccessPreOrder?: boolean;
  canAccessStok?: boolean;
  canAccessPelanggan?: boolean;
  canAccessKeuangan?: boolean;
  canAccessLaporan?: boolean;
  canAccessPengaturan?: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  permissions?: UserPermissions;
}

export interface FarmSettings {
  farmName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  defaultEggPrice: number;
  chickenPopulation: number;
  lowStockThresholdKg: number;
  receiptFooter: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  qrisImageUrl?: string;
}

export interface ProductionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  chickenCount: number;
  eggsCount: number;
  eggWeightKg: number;
  brokenCount: number;
  hdp: number; // percentage, e.g. 84.5
  avgGramPerEgg: number; // e.g. 62.5
  notes?: string;
  createdAt: string;
}

export type InventoryCategory = 'produk' | 'pakan' | 'supplies';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: string; // kg, butir, liter, botol, pack, pcs, zak
  stock: number;
  minStock: number;
  avgCost: number; // IDR
  notes?: string;
  lastUpdated: string;
}

export type InventoryTxType = 'in' | 'out' | 'production' | 'sale' | 'adjustment';

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  date: string;
  type: InventoryTxType;
  quantity: number;
  balanceAfter: number;
  unitCost?: number;
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export type CustomerType = 'Grosir' | 'Toko' | 'Agen' | 'Langganan' | 'Retail';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: CustomerType;
  totalPurchases: number;
  totalKg: number;
  totalSpent: number;
  outstandingReceivable: number;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'Tunai' | 'Transfer Bank' | 'QRIS';
export type PaymentStatus = 'lunas' | 'dp' | 'belum_bayar';

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string; // GHN-YYYYMMDD-XXX
  customerId: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  items: SaleItem[];
  totalKg: number;
  pricePerKg: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  dueDate?: string;
  notes?: string;
  operatorName: string;
  createdAt: string;
}

export type PreOrderStatus = 'menunggu' | 'dp_masuk' | 'siap_diambil' | 'lunas' | 'selesai' | 'dibatalkan';

export interface PreOrder {
  id: string;
  orderNumber: string; // PO-YYYYMMDD-XXX
  customerId: string;
  customerName: string;
  phone: string;
  orderDate: string;
  pickupDate: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  dpAmount: number;
  balanceDue: number;
  status: PreOrderStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export type IncomeCategory = 'penjualan_telur' | 'produk_lain' | 'lain_lain';

export interface Income {
  id: string;
  date: string;
  category: IncomeCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  referenceId?: string; // e.g. sale id or preorder id
  createdAt: string;
}

export type ExpenseCategory = 
  | 'pakan'
  | 'vitamin'
  | 'obat'
  | 'listrik'
  | 'air'
  | 'transport'
  | 'kemasan'
  | 'perawatan'
  | 'gaji'
  | 'lainnya';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  supplier?: string;
  referenceId?: string;
  createdAt: string;
}

export interface Receivable {
  id: string;
  saleId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  phone?: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'belum_lunas' | 'lunas';
  notes?: string;
  createdAt: string;
}

export interface ReceivablePayment {
  id: string;
  receivableId: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Payable {
  id: string;
  supplierName: string;
  category: ExpenseCategory;
  date: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'belum_lunas' | 'lunas';
  description: string;
  createdAt: string;
}

export interface PayablePayment {
  id: string;
  payableId: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface CapitalTransaction {
  id: string;
  date: string;
  type: 'modal' | 'prive';
  amount: number;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  date: string;
  type: 'in' | 'out';
  category: string;
  amount: number;
  description: string;
  balanceAfter: number;
  referenceId?: string;
  createdAt: string;
}

export interface MonthlyReport {
  id: string;
  monthYear: string; // YYYY-MM
  monthName: string; // e.g. "September 2026"
  closedAt: string;
  population: number;
  totalEggs: number;
  totalKg: number;
  avgHdp: number;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  cashIn: number;
  cashOut: number;
  salesCount: number;
  preorderCount: number;
  notes?: string;
}

export interface DatabaseSchema {
  settings: FarmSettings;
  users: User[];
  currentUser: User;
  production: ProductionRecord[];
  inventory: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  customers: Customer[];
  sales: Sale[];
  preorders: PreOrder[];
  incomes: Income[];
  expenses: Expense[];
  receivables: Receivable[];
  receivablePayments: ReceivablePayment[];
  payables: Payable[];
  payablePayments: PayablePayment[];
  capitalTransactions: CapitalTransaction[];
  cashTransactions: CashTransaction[];
  monthlyReports: MonthlyReport[];
  openingCashBalance: number;
}
