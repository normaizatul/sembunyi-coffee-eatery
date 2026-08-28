import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { MenuItem, Order, TableInfo, OrderStatus, OrderFeedback, PaymentDetails } from '../types';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES } from '../data/initialMenu';

const MENU_COLLECTION = 'menu';
const ORDERS_COLLECTION = 'orders';
const TABLES_COLLECTION = 'tables';

// Initial sample orders if Firestore is fresh
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1002',
    tableNumber: '02',
    customerName: 'Cik Nourul',
    items: [
      {
        cartItemId: 'c1',
        menuItem: INITIAL_MENU_ITEMS[0],
        quantity: 1,
        selectedOptions: { spiceLevel: 'Sederhana (Normal)', addOns: [] },
        unitPriceWithAddons: 15.90,
        totalPrice: 15.90
      },
      {
        cartItemId: 'c2',
        menuItem: INITIAL_MENU_ITEMS[6],
        quantity: 1,
        selectedOptions: { sugarLevel: 'Kurang Manis', addOns: [] },
        unitPriceWithAddons: 4.90,
        totalPrice: 4.90
      }
    ],
    subtotal: 20.80,
    tax: 1.25,
    totalAmount: 22.05,
    status: 'memasak',
    paymentMethod: 'counter',
    isPaid: true,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    estimatedMinutes: 8,
    estimatedCompletionTime: new Date(Date.now() - 4 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD-1004',
    tableNumber: '04',
    customerName: 'Encik Amir',
    items: [
      {
        cartItemId: 'c3',
        menuItem: INITIAL_MENU_ITEMS[1],
        quantity: 2,
        selectedOptions: { spiceLevel: 'Pedas Kaw', addOns: [] },
        unitPriceWithAddons: 17.50,
        totalPrice: 35.00
      }
    ],
    subtotal: 35.00,
    tax: 2.10,
    totalAmount: 37.10,
    status: 'diterima',
    paymentMethod: 'counter',
    isPaid: false,
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    estimatedMinutes: 12,
    estimatedCompletionTime: new Date(Date.now() + 8 * 60 * 1000).toISOString()
  }
];

// Helper to remove any undefined fields recursively so Firestore setDoc never fails
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return data;
}

// Initialize Firestore default data if empty
export async function initializeFirestoreData() {
  try {
    // 1. Menu
    for (const item of INITIAL_MENU_ITEMS) {
      await setDoc(doc(db, MENU_COLLECTION, item.id), sanitizeForFirestore(item), { merge: true });
    }

    // 2. Tables
    const tablesSnap = await getDocs(collection(db, TABLES_COLLECTION));
    if (tablesSnap.empty) {
      console.log('Seeding initial tables data to Firestore...');
      for (const table of INITIAL_TABLES) {
        await setDoc(doc(db, TABLES_COLLECTION, table.tableNumber), sanitizeForFirestore(table));
      }
    }

    // 3. Orders
    const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));
    if (ordersSnap.empty) {
      console.log('Seeding initial orders data to Firestore...');
      for (const order of INITIAL_ORDERS) {
        await setDoc(doc(db, ORDERS_COLLECTION, order.id), sanitizeForFirestore(order));
      }
    }
  } catch (err) {
    console.error('Error initializing Firestore data:', err);
  }
}

// Subscribe to real-time Menu items
export function subscribeToMenu(callback: (menu: MenuItem[]) => void) {
  const q = collection(db, MENU_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const menuList: MenuItem[] = [];
    snapshot.forEach((docSnap) => {
      menuList.push(docSnap.data() as MenuItem);
    });
    // Keep initial order
    callback(menuList.length > 0 ? menuList : INITIAL_MENU_ITEMS);
  }, (err) => {
    console.warn('Firestore menu snapshot notice (using local cache):', err?.message || err);
    callback(INITIAL_MENU_ITEMS);
  });
}

// Subscribe to real-time Orders
export function subscribeToOrders(callback: (orders: Order[]) => void) {
  const q = collection(db, ORDERS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const ordersList: Order[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data) {
        const sanitizedOrder: Order = {
          id: data.id || docSnap.id,
          tableNumber: data.tableNumber || '01',
          customerName: data.customerName || 'Tetamu',
          customerPhone: data.customerPhone || '',
          items: Array.isArray(data.items)
            ? data.items.map((it: any) => ({
                ...it,
                quantity: it?.quantity || 1,
                totalPrice: it?.totalPrice || 0,
                unitPriceWithAddons: it?.unitPriceWithAddons || 0,
                selectedOptions: {
                  ...(it?.selectedOptions || {}),
                  addOns: Array.isArray(it?.selectedOptions?.addOns) ? it.selectedOptions.addOns : [],
                },
                menuItem: it?.menuItem || {
                  id: 'unknown',
                  nameMs: 'Hidangan',
                  nameEn: 'Dish',
                  price: 0,
                  category: 'main_dish',
                  descriptionMs: '',
                  descriptionEn: '',
                  imageUrl: '',
                  calories: 0,
                  prepTimeMinutes: 10,
                  isAvailable: true,
                },
              }))
            : [],
          subtotal: data.subtotal || 0,
          tax: data.tax || 0,
          totalAmount: data.totalAmount || 0,
          status: data.status || 'diterima',
          paymentMethod: 'counter',
          isPaid: !!data.isPaid,
          createdAt: data.createdAt || new Date().toISOString(),
          estimatedMinutes: data.estimatedMinutes || 10,
          estimatedCompletionTime: data.estimatedCompletionTime || undefined,
          feedback: data.feedback ? {
            rating: Number(data.feedback.rating) || 5,
            review: data.feedback.review || '',
            quickTags: Array.isArray(data.feedback.quickTags) ? data.feedback.quickTags : [],
            submittedAt: data.feedback.submittedAt || new Date().toISOString()
          } : undefined,
          paymentDetails: data.paymentDetails ? {
            transactionId: data.paymentDetails.transactionId || '',
            gateway: 'counter',
            receiptNumber: data.paymentDetails.receiptNumber || '',
            paidAt: data.paymentDetails.paidAt || '',
            cashierName: data.paymentDetails.cashierName || 'Juruwang Kafe',
            paymentType: data.paymentDetails.paymentType || 'tunai',
            payerName: data.paymentDetails.payerName || '',
            notes: data.paymentDetails.notes || ''
          } : undefined,
        };
        ordersList.push(sanitizedOrder);
      }
    });
    // Sort by createdAt descending
    ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(ordersList.length > 0 ? ordersList : INITIAL_ORDERS);
  }, (err) => {
    console.warn('Firestore orders snapshot notice (using local cache):', err?.message || err);
    callback(INITIAL_ORDERS);
  });
}

// Subscribe to real-time Tables
export function subscribeToTables(callback: (tables: TableInfo[]) => void) {
  const q = collection(db, TABLES_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const tablesList: TableInfo[] = [];
    snapshot.forEach((docSnap) => {
      tablesList.push(docSnap.data() as TableInfo);
    });
    tablesList.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber));
    callback(tablesList.length > 0 ? tablesList : INITIAL_TABLES);
  }, (err) => {
    console.warn('Firestore tables snapshot notice (using local cache):', err?.message || err);
    callback(INITIAL_TABLES);
  });
}

// Update menu item availability
export async function updateMenuItemInFirestore(item: MenuItem) {
  try {
    await setDoc(doc(db, MENU_COLLECTION, item.id), item, { merge: true });
  } catch (err) {
    console.error('Failed to update menu item in Firestore:', err);
  }
}

// Create new order in Firestore and update table status
export async function createOrderInFirestore(order: Order): Promise<Order> {
  const orderToSave = { ...order };
  if (!orderToSave.id) {
    orderToSave.id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  const createdDate = orderToSave.createdAt ? new Date(orderToSave.createdAt) : new Date();
  orderToSave.createdAt = createdDate.toISOString();

  const prepMinutes = orderToSave.estimatedMinutes || 15;
  if (!orderToSave.estimatedCompletionTime) {
    const completionDate = new Date(createdDate.getTime() + prepMinutes * 60 * 1000);
    orderToSave.estimatedCompletionTime = completionDate.toISOString();
  }

  await setDoc(doc(db, ORDERS_COLLECTION, orderToSave.id), sanitizeForFirestore(orderToSave));

  // Update associated table status
  try {
    const tableRef = doc(db, TABLES_COLLECTION, orderToSave.tableNumber);
    await updateDoc(tableRef, {
      status: 'menunggu_makanan',
      activeOrderId: orderToSave.id
    });
  } catch (e) {
    // Table doc might not exist yet, setDoc instead
    await setDoc(doc(db, TABLES_COLLECTION, orderToSave.tableNumber), {
      tableNumber: orderToSave.tableNumber,
      seats: 4,
      status: 'menunggu_makanan',
      activeOrderId: orderToSave.id
    }, { merge: true });
  }

  return orderToSave;
}

// Update order status in Firestore and update table status
export async function updateOrderStatusInFirestore(orderId: string, status: OrderStatus, isPaid?: boolean) {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updates: Record<string, any> = { status };
    if (isPaid !== undefined) updates.isPaid = isPaid;

    await setDoc(orderRef, updates, { merge: true });

    // Fetch updated order to update table status
    const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));
    let tableNum = '';
    ordersSnap.forEach((d) => {
      if (d.id === orderId) {
        tableNum = d.data().tableNumber;
      }
    });

    if (tableNum) {
      const tableRef = doc(db, TABLES_COLLECTION, tableNum);
      if (status === 'memasak') {
        await setDoc(tableRef, { status: 'menunggu_makanan' }, { merge: true });
      } else if (status === 'sedia') {
        await setDoc(tableRef, { status: 'sedang_dijamu' }, { merge: true });
      } else if (status === 'selesai') {
        await setDoc(tableRef, { status: 'kosong', activeOrderId: '' }, { merge: true });
      }
    }
  } catch (err) {
    console.error('Error in updateOrderStatusInFirestore:', err);
  }
}

// Service call to waiter in Firestore
export async function callWaiterInFirestore(tableNumber: string, reason: string) {
  try {
    const tableRef = doc(db, TABLES_COLLECTION, tableNumber);
    const newStatus = reason === 'bil' ? 'minta_bil' : 'panggil_pelayan';
    const timeStr = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });

    await setDoc(tableRef, {
      tableNumber,
      status: newStatus,
      lastServiceCall: timeStr
    }, { merge: true });
  } catch (err) {
    console.error('Error in callWaiterInFirestore:', err);
  }
}

// Update table status directly
export async function updateTableStatusInFirestore(tableNumber: string, status: TableInfo['status'], activeOrderId: string = '') {
  try {
    const tableRef = doc(db, TABLES_COLLECTION, tableNumber);
    await setDoc(tableRef, {
      tableNumber,
      status,
      activeOrderId
    }, { merge: true });
  } catch (err) {
    console.error('Error in updateTableStatusInFirestore:', err);
  }
}

// Submit customer star-rating and review for an order
export async function submitOrderFeedbackInFirestore(orderId: string, feedback: OrderFeedback) {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const sanitizedFeedback = sanitizeForFirestore({
      rating: feedback.rating,
      review: feedback.review || '',
      quickTags: feedback.quickTags || [],
      submittedAt: feedback.submittedAt || new Date().toISOString()
    });
    await setDoc(orderRef, { feedback: sanitizedFeedback }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error in submitOrderFeedbackInFirestore:', err);
    throw err;
  }
}

// Update order payment status and transaction details
export async function updateOrderPaymentInFirestore(orderId: string, paymentDetails: PaymentDetails) {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const sanitizedDetails = sanitizeForFirestore(paymentDetails);
    await setDoc(orderRef, {
      isPaid: true,
      status: 'memasak',
      paymentDetails: sanitizedDetails
    }, { merge: true });

    // Also update table status to 'menunggu_makanan'
    const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));
    let tableNum = '';
    ordersSnap.forEach((d) => {
      if (d.id === orderId) {
        tableNum = d.data().tableNumber;
      }
    });

    if (tableNum) {
      const tableRef = doc(db, TABLES_COLLECTION, tableNum);
      await setDoc(tableRef, { status: 'menunggu_makanan', activeOrderId: orderId }, { merge: true });
    }

    return true;
  } catch (err) {
    console.error('Error in updateOrderPaymentInFirestore:', err);
    throw err;
  }
}

