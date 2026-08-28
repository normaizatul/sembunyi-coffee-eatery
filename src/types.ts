export type CashierStation = 'cashier_1' | 'cashier_2';

export type CategoryType =
  | 'semua'
  | 'sembunyi_burger'
  | 'maggie_samyang'
  | 'chicken_wings'
  | 'sembunyi_snack'
  | 'fries_goncang'
  | 'western_grill'
  | 'main_dish'
  | 'pasta'
  | 'rice_set'
  | 'pizza'
  | 'side_snack'
  | 'croffle_pastry'
  | 'coffee'
  | 'non_coffee'
  | 'sparkling_refresher';

export type LanguageType = 'ms' | 'en';

export interface CustomizeOption {
  id: string;
  nameMs: string;
  nameEn: string;
  price: number;
}

export interface MenuItem {
  id: string;
  nameMs: string;
  nameEn: string;
  descriptionMs: string;
  descriptionEn: string;
  price: number;
  category: CategoryType;
  imageUrl: string;
  calories: number;
  prepTimeMinutes: number;
  isPopular?: boolean;
  isSpicy?: boolean;
  isHalal?: boolean;
  isVegetarian?: boolean;
  allergens?: string[];
  isAvailable: boolean;
  cashierStation?: CashierStation; // 'cashier_1' (Kafe Utama) or 'cashier_2' (Sembunyi Burgers & Grill)
  customization?: {
    pattyChoices?: string[];
    temperatures?: string[];
    spiceLevels?: string[];
    sugarLevels?: string[];
    addOns?: CustomizeOption[];
  };
}

export interface SelectedOptions {
  pattyChoice?: string;
  temperature?: string;
  spiceLevel?: string;
  sugarLevel?: string;
  addOns?: CustomizeOption[];
  specialInstruction?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOptions;
  unitPriceWithAddons: number;
  totalPrice: number;
}

export type OrderStatus = 'diterima' | 'memasak' | 'sedia' | 'selesai' | 'dibatalkan';

export type PaymentMethod = 'counter';

export interface PaymentDetails {
  transactionId?: string;
  gateway?: 'counter';
  receiptNumber?: string;
  paidAt?: string;
  cashierName?: string;
  paymentType?: 'tunai' | 'kad' | 'qr_kaunter';
  payerName?: string;
  notes?: string;
}

export interface OrderFeedback {
  rating: number;
  review?: string;
  quickTags?: string[];
  submittedAt: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
  estimatedMinutes: number;
  estimatedCompletionTime?: string;
  feedback?: OrderFeedback;
  paymentDetails?: PaymentDetails;
}

export interface TableInfo {
  tableNumber: string;
  seats: number;
  status: 'kosong' | 'sedang_dijamu' | 'menunggu_makanan' | 'panggil_pelayan' | 'minta_bil';
  activeOrderId?: string;
  lastServiceCall?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedDishIds?: string[];
}
