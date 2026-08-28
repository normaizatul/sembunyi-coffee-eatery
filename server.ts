import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES } from './src/data/initialMenu';
import { Order, MenuItem, TableInfo } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for live sessions & demo persistence
let currentMenu: MenuItem[] = [...INITIAL_MENU_ITEMS];
let currentTables: TableInfo[] = [...INITIAL_TABLES];
let currentOrders: Order[] = [
  {
    id: 'ORD-1002',
    tableNumber: '02',
    customerName: 'Cik Nourul',
    items: [
      {
        cartItemId: 'c1',
        menuItem: INITIAL_MENU_ITEMS[0], // Nasi Lemak Royal
        quantity: 1,
        selectedOptions: { spiceLevel: 'Sederhana (Normal)' },
        unitPriceWithAddons: 15.90,
        totalPrice: 15.90
      },
      {
        cartItemId: 'c2',
        menuItem: INITIAL_MENU_ITEMS[6], // Teh Tarik Pandan
        quantity: 1,
        selectedOptions: { sugarLevel: 'Kurang Manis' },
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
    estimatedMinutes: 8
  },
  {
    id: 'ORD-1004',
    tableNumber: '04',
    customerName: 'Encik Amir',
    items: [
      {
        cartItemId: 'c3',
        menuItem: INITIAL_MENU_ITEMS[1], // Char Kway Teow
        quantity: 2,
        selectedOptions: { spiceLevel: 'Pedas Kaw' },
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
    estimatedMinutes: 12
  }
];

// Initialize Gemini Client Lazily or on demand
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAI;
}

// ---------------- API ENDPOINTS ----------------

// Get Menu Items
app.get('/api/menu', (req, res) => {
  res.json({ success: true, menu: currentMenu });
});

// Update Menu Item
app.post('/api/menu', (req, res) => {
  const updatedItem: MenuItem = req.body;
  const index = currentMenu.findIndex((item) => item.id === updatedItem.id);
  if (index >= 0) {
    currentMenu[index] = updatedItem;
  } else {
    currentMenu.push(updatedItem);
  }
  res.json({ success: true, menu: currentMenu });
});

// Get Orders
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: currentOrders });
});

// Create Order
app.post('/api/orders', (req, res) => {
  const newOrder: Order = req.body;
  if (!newOrder.id) {
    newOrder.id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  const createdDate = newOrder.createdAt ? new Date(newOrder.createdAt) : new Date();
  newOrder.createdAt = createdDate.toISOString();
  if (!newOrder.estimatedCompletionTime) {
    const prepMinutes = newOrder.estimatedMinutes || 15;
    newOrder.estimatedCompletionTime = new Date(createdDate.getTime() + prepMinutes * 60 * 1000).toISOString();
  }
  currentOrders.unshift(newOrder);

  // Update table status
  const tableIndex = currentTables.findIndex(
    (t) => t.tableNumber === newOrder.tableNumber
  );
  if (tableIndex >= 0) {
    currentTables[tableIndex].status = 'menunggu_makanan';
    currentTables[tableIndex].activeOrderId = newOrder.id;
  }

  res.json({ success: true, order: newOrder });
});

// Update Order Status
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, isPaid } = req.body;

  const order = currentOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak dijumpai' });
  }

  if (status) order.status = status;
  if (isPaid !== undefined) order.isPaid = isPaid;

  // Update associated table
  const table = currentTables.find((t) => t.tableNumber === order.tableNumber);
  if (table) {
    if (status === 'memasak') {
      table.status = 'menunggu_makanan';
    } else if (status === 'sedia') {
      table.status = 'sedang_dijamu';
    } else if (status === 'selesai') {
      table.status = 'kosong';
      table.activeOrderId = undefined;
    }
  }

  res.json({ success: true, order });
});

// Get Tables
app.get('/api/tables', (req, res) => {
  res.json({ success: true, tables: currentTables });
});

// Table Staff Call
app.post('/api/tables/call-waiter', (req, res) => {
  const { tableNumber, reason } = req.body;
  const tableIndex = currentTables.findIndex((t) => t.tableNumber === tableNumber);
  if (tableIndex >= 0) {
    currentTables[tableIndex].status = reason === 'bil' ? 'minta_bil' : 'panggil_pelayan';
    currentTables[tableIndex].lastServiceCall = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
  }
  res.json({ success: true, message: `Permintaan pelayan untuk Meja ${tableNumber} telah dihantar.` });
});

// ---------------- CASHIER / COUNTER PAYMENT ENDPOINTS ----------------

// Get Payment Configuration & Status
app.get('/api/payment/config', (req, res) => {
  res.json({
    success: true,
    currency: 'MYR',
    merchant: {
      name: 'Kafe Sembunyi (Sembunyi Enterprise)',
      registrationNo: 'SSM 202401089241 (SA-059281)',
      bank: 'Maybank Islamic Berhad',
      accountNumber: '5628 3491 8802',
    },
    paymentMode: 'cashier_only',
    message: 'Semua bayaran dibuat di Kaunter Juruwang (Tunai / Kad / QR Kaunter)'
  });
});

// Cashier / Staff confirms payment at counter
app.post('/api/payment/cashier-pay', (req, res) => {
  try {
    const { 
      orderId, 
      paymentType = 'tunai', 
      cashierName = 'Juruwang Kafe Sembunyi', 
      notes = '' 
    } = req.body;

    const order = currentOrders.find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak dijumpai' });
    }

    const paidTimestamp = new Date().toISOString();
    const receiptNum = `REC-CSH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    order.isPaid = true;
    order.paymentMethod = 'counter';
    order.paymentDetails = {
      transactionId: `TXN-CSH-${Date.now().toString().slice(-6)}`,
      gateway: 'counter',
      receiptNumber: receiptNum,
      paidAt: paidTimestamp,
      cashierName,
      paymentType,
      payerName: order.customerName || 'Tetamu Meja ' + order.tableNumber,
      notes
    };

    if (order.status === 'diterima') {
      order.status = 'memasak';
    }

    // Update associated table
    const table = currentTables.find((t) => t.tableNumber === order.tableNumber);
    if (table && table.status === 'minta_bil') {
      table.status = 'sedang_dijamu';
    }

    res.json({
      success: true,
      message: `Bayaran di kaunter (${paymentType.toUpperCase()}) berjaya disahkan untuk Pesanan #${order.id}`,
      order,
      receipt: order.paymentDetails
    });
  } catch (err: any) {
    console.error('Error in /api/payment/cashier-pay:', err);
    res.status(500).json({ success: false, message: 'Gagal memproses bayaran kaunter' });
  }
});

// AI Recommendation Route (Gemini API Integration)
app.post('/api/ai/recommend', async (req, res) => {
  try {
    const { prompt, language = 'ms', currentCart = [] } = req.body;

    const ai = getGeminiClient();

    const menuSummary = currentMenu
      .map(
        (m) =>
          `- [ID: ${m.id}] ${m.nameMs} / ${m.nameEn} (RM${m.price.toFixed(
            2
          )}, ${m.calories} kcal, Prep: ${m.prepTimeMinutes}m) [Tag: ${
            m.category
          }, Spicy: ${m.isSpicy ? 'Ya' : 'Tidak'}, Popular: ${
            m.isPopular ? 'Ya' : 'Tidak'
          }]: ${m.descriptionMs}`
      )
      .join('\n');

    const systemInstruction = `
You are SmartDine AI, an intelligent, helpful, and friendly virtual butler/waiter for the "SmartDinePlus" Smart Dining QR Restaurant System (created for Cik Nourul Ain's FYP project).
Your job is to recommend food and drinks, answer questions about menu ingredients, calories, allergens, and suggest perfect food pairings or combos.

Language: ${language === 'ms' ? 'Bahasa Melayu' : 'English'}.

Current Restaurant Menu:
${menuSummary}

Items already in user cart: ${JSON.stringify(currentCart)}

Guidelines:
1. Be warm, professional, and concise.
2. If recommending specific dishes from the menu, explicitly mention their exact name and ID so the UI can present them as clickable cards.
3. End response with a short suggestion on how they can add the items to their order directly via the QR Menu.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Maaf, saya tidak dapat memproses permintaan anda sekarang.';

    // Extract dish IDs mentioned in response text
    const mentionedDishIds = currentMenu
      .filter((m) => replyText.toLowerCase().includes(m.nameMs.toLowerCase()) || replyText.toLowerCase().includes(m.nameEn.toLowerCase()) || replyText.includes(m.id))
      .map((m) => m.id);

    res.json({
      success: true,
      text: replyText,
      suggestedDishIds: mentionedDishIds,
    });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghubungi SmartDine AI.',
      error: error?.message || 'Server error',
    });
  }
});

// ---------------- STATIC FILES SETUP ----------------
// Always serve /images and public folder directly
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images'), { maxAge: '1d' }));
app.use(express.static(path.join(process.cwd(), 'public')));

// ---------------- VITE & SPA SETUP ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartDinePlus server running on http://localhost:${PORT}`);
  });
}

startServer();
