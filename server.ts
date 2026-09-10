import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES } from './src/data/initialMenu';
import { Order, MenuItem, TableInfo } from './src/types';

const app = express();

// Port configuration:
// - In local/dev container: MUST bind strictly to 3000 (reverse proxy routes to 3000).
// - In Cloud Run production deployment: binds to process.env.PORT (injected by Cloud Run, defaults to 8080) or fallback to 3000.
const PORT = process.env.NODE_ENV === 'production' && process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3000;

app.use(express.json());

// API health endpoint for container readiness / liveness probes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

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

// AI Recommendation Route (Gemini API Integration with Smart Fallback Engine)
app.post('/api/ai/recommend', async (req, res) => {
  const { prompt = '', language = 'ms', currentCart = [] } = req.body;
  const isMs = language === 'ms';
  const query = prompt.toLowerCase().trim();

  // Helper: Smart Fallback Recommendation Generator based on live menu
  const generateLocalRecommendation = () => {
    let matchedDishes: MenuItem[] = [];
    let replyText = '';

    // Match criteria
    const isSpicyQuery = query.includes('pedas') || query.includes('spicy') || query.includes('chili') || query.includes('samyang') || query.includes('hot');
    const isBudgetQuery = query.includes('bajet') || query.includes('budget') || query.includes('murah') || query.includes('cheap') || query.includes('15') || query.includes('bawah');
    const isDrinkQuery = query.includes('minum') || query.includes('drink') || query.includes('kopi') || query.includes('coffee') || query.includes('teh') || query.includes('segar') || query.includes('refresh') || query.includes('air');
    const isBurgerQuery = query.includes('burger') || query.includes('daging') || query.includes('beef') || query.includes('cheeseburger') || query.includes('kaunter 2');
    const isWesternQuery = query.includes('western') || query.includes('chop') || query.includes('lamb') || query.includes('grill') || query.includes('chicken chop') || query.includes('steak');
    const isPastaPizza = query.includes('pasta') || query.includes('spaghetti') || query.includes('pizza') || query.includes('milano');
    const isSweetDessert = query.includes('manis') || query.includes('dessert') || query.includes('croffle') || query.includes('sweet') || query.includes('pastri');

    if (isSpicyQuery) {
      matchedDishes = currentMenu.filter((m) => m.isSpicy || m.nameMs.toLowerCase().includes('samyang') || m.nameMs.toLowerCase().includes('pedas') || m.descriptionMs.toLowerCase().includes('pedas')).slice(0, 3);
      if (matchedDishes.length === 0) matchedDishes = currentMenu.slice(0, 2);
      
      if (isMs) {
        replyText = `Pilihan terbaik untuk peminat pedas! 🔥 Saya cadangkan **${matchedDishes.map((m) => m.nameMs).join('** dan **')}**.\n\nHidangan ini dimasak segar dengan rasa pedas yang menyengat dan membangkitkan selera. Anda juga boleh memilih tahap kepedasan mengikut citarasa semasa membuat pesanan.`;
      } else {
        replyText = `Here are our top spicy recommendations! 🔥 I highly recommend **${matchedDishes.map((m) => m.nameEn || m.nameMs).join('** and **')}**.\n\nThese dishes deliver a bold, spicy kick cooked to perfection. You can also customize your spice level directly when adding to cart.`;
      }
    } else if (isBudgetQuery) {
      matchedDishes = currentMenu.filter((m) => m.price <= 15.00).sort((a, b) => a.price - b.price).slice(0, 3);
      if (matchedDishes.length === 0) matchedDishes = currentMenu.slice(0, 2);

      if (isMs) {
        replyText = `Pilihan hidangan bajet jimat (bawah RM15) yang lazat dan mengenyangkan! 💰\n\nSaya syorkan **${matchedDishes.map((m) => `${m.nameMs} (RM${m.price.toFixed(2)})`).join(', ')}**.\n\nPilihan yang sangat berbaloi untuk santapan harian anda di Kafe Sembunyi.`;
      } else {
        replyText = `Looking for great value under RM15? 💰\n\nI recommend **${matchedDishes.map((m) => `${m.nameEn || m.nameMs} (RM${m.price.toFixed(2)})`).join(', ')}**.\n\nDelicious, satisfying, and easy on your wallet.`;
      }
    } else if (isDrinkQuery) {
      matchedDishes = currentMenu.filter((m) => m.category === 'coffee' || m.category === 'non_coffee' || m.category === 'sparkling_refresher').slice(0, 3);
      if (matchedDishes.length === 0) matchedDishes = currentMenu.slice(0, 2);

      if (isMs) {
        replyText = `Untuk minuman yang menyegarkan tekak dan pembangkit semangat! ☕🥤\n\nCuba **${matchedDishes.map((m) => m.nameMs).join('**, **')}**.\n\nSesuai dinikmati sejuk bersama ketulan ais atau panas untuk menenangkan fikiran.`;
      } else {
        replyText = `Here are our most refreshing drinks and artisanal brews! ☕🥤\n\nI suggest trying **${matchedDishes.map((m) => m.nameEn || m.nameMs).join('**, **')}**.\n\nCrafted with premium beans and fresh ingredients for a delightful beverage experience.`;
      }
    } else if (isBurgerQuery) {
      matchedDishes = currentMenu.filter((m) => m.category === 'sembunyi_burger' || m.cashierStation === 'cashier_2').slice(0, 3);
      if (matchedDishes.length === 0) matchedDishes = currentMenu.slice(0, 2);

      if (isMs) {
        replyText = `Peminat burger sejati! 🍔 Nikmati hidangan istimewa dari Kaunter 2 (Sembunyi Burgers & Grill):\n\n**${matchedDishes.map((m) => m.nameMs).join('**, **')}**.\n\nPatty daging yang tebal dan berjus, disaluti sos buatan sendiri dan keju leleh.`;
      } else {
        replyText = `Calling all burger lovers! 🍔 Special creations from Counter 2 (Sembunyi Burgers & Grill):\n\n**${matchedDishes.map((m) => m.nameEn || m.nameMs).join('**, **')}**.\n\nFeaturing juicy, handcrafted patties topped with signature house sauces and melted cheese.`;
      }
    } else if (isWesternQuery) {
      matchedDishes = currentMenu.filter((m) => m.category === 'western_grill' || m.category === 'main_dish').slice(0, 3);
      if (matchedDishes.length === 0) matchedDishes = currentMenu.slice(0, 2);

      if (isMs) {
        replyText = `Pilihan hidangan Western Grill & Chop terhebat kami! 🥩🍗\n\nSaya amat syorkan **${matchedDishes.map((m) => m.nameMs).join('** dan **')}**.\n\nDihidangkan bersama sos lada hitam pekat buatan sendiri (*homemade blackpepper sauce*), kentang goreng rangup, dan coleslaw segar.`;
      } else {
        replyText = `Indulge in our signature Western Grills & Chops! 🥩🍗\n\nI highly recommend **${matchedDishes.map((m) => m.nameEn || m.nameMs).join('** and **')}**.\n\nServed with our signature rich homemade blackpepper sauce, crispy fries, and fresh salad.`;
      }
    } else if (isPastaPizza) {
      matchedDishes = currentMenu.filter((m) => m.category === 'pasta' || m.category === 'pizza').slice(0, 3);
      if (matchedDishes.length === 0) matchedDishes = currentMenu.slice(0, 2);

      if (isMs) {
        replyText = `Sajian cita rasa Itali Milano! 🍝🍕\n\nCuba hidangan popular kami: **${matchedDishes.map((m) => m.nameMs).join('** dan **')}**.\n\nKombinasi herba segar, keju berkualiti, dan sos buatan sendiri yang memikat selera.`;
      } else {
        replyText = `Italian culinary favorites! 🍝🍕\n\nTry our popular dishes: **${matchedDishes.map((m) => m.nameEn || m.nameMs).join('** and **')}**.\n\nRich in authentic flavors with generous melted cheese and aromatic herbs.`;
      }
    } else if (isSweetDessert) {
      matchedDishes = currentMenu.filter((m) => m.category === 'croffle_pastry' || m.category === 'side_snack').slice(0, 3);
      if (matchedDishes.length === 0) matchedDishes = currentMenu.slice(0, 2);

      if (isMs) {
        replyText = `Masa untuk pencuci mulut yang manis dan rangup! 🥐✨\n\nJangan lepaskan peluang mencuba **${matchedDishes.map((m) => m.nameMs).join('** dan **')}**.\n\nTekstur luar yang rangup dan lembut di dalam, enak dimakan bersama secawan kopi.`;
      } else {
        replyText = `Craving something sweet and crispy? 🥐✨\n\nDon't miss our **${matchedDishes.map((m) => m.nameEn || m.nameMs).join('** and **')}**.\n\nFlaky and buttery on the outside, soft inside, perfect when paired with an artisanal latte.`;
      }
    } else {
      // General popular recommendation
      matchedDishes = currentMenu.filter((m) => m.isPopular).slice(0, 3);
      if (matchedDishes.length === 0) matchedDishes = currentMenu.slice(0, 3);

      if (isMs) {
        replyText = `Selamat datang ke Kafe Sembunyi! ✨ Antara hidangan paling laris dan digemari tetamu kami hari ini ialah:\n\n1. **${matchedDishes[0]?.nameMs}** (RM${matchedDishes[0]?.price.toFixed(2)})\n2. **${matchedDishes[1]?.nameMs || 'Minuman Istimewa'}** (RM${matchedDishes[1]?.price.toFixed(2) || '0.00'})\n\nAnda boleh klik kad hidangan di bawah untuk memilih pilihan spesifik dan memasukkannya terus ke dalam troli pesanan!`;
      } else {
        replyText = `Welcome to Kafe Sembunyi! ✨ Here are our most beloved chef specials and guest favorites today:\n\n1. **${matchedDishes[0]?.nameEn || matchedDishes[0]?.nameMs}** (RM${matchedDishes[0]?.price.toFixed(2)})\n2. **${matchedDishes[1]?.nameEn || matchedDishes[1]?.nameMs || 'Specialty Drink'}** (RM${matchedDishes[1]?.price.toFixed(2) || '0.00'})\n\nYou can click the suggested dish cards below to customize and add them directly to your order!`;
      }
    }

    return {
      text: replyText,
      suggestedDishIds: matchedDishes.map((m) => m.id),
    };
  };

  // Try calling Google Gemini if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    try {
      const ai = getGeminiClient();

      const menuSummary = currentMenu
        .map(
          (m) =>
            `- [ID: ${m.id}] ${m.nameMs} / ${m.nameEn} (RM${m.price.toFixed(2)}, Prep: ${m.prepTimeMinutes}m, Station: ${m.cashierStation}) [Category: ${m.category}, Spicy: ${m.isSpicy ? 'Ya' : 'No'}, Popular: ${m.isPopular ? 'Ya' : 'No'}]: ${m.descriptionMs}`
        )
        .join('\n');

      const systemInstruction = `
You are SmartDine AI, a smart, polite, and welcoming virtual dining assistant for "SmartDinePlus" at Kafe Sembunyi (FYP Project of Cik Nourul Ain).
Your role: Recommend food, answer menu questions, suggest pairings, and guide guests.

MANDATORY LANGUAGE RULE:
The user has requested the response in: ${isMs ? 'BAHASA MELAYU (MALAY)' : 'ENGLISH'}.
You MUST respond 100% in ${isMs ? 'natural, friendly, polite Bahasa Melayu (e.g. "Selamat datang", "Saya mencadangkan...", "Selamat menjamu selera!")' : 'fluent, warm, professional English'}. Do not mix languages.

Current Restaurant Menu:
${menuSummary}

Cart contents: ${JSON.stringify(currentCart)}

Formatting Instructions:
1. Keep the response concise, friendly, and helpful (under 120 words).
2. When mentioning dishes, highlight their exact menu names in bold (e.g. **Chicken Chop with Homemade Blackpepper Sauce** or **Burger Special**) so the guest recognizes them.
3. Conclude with an encouraging remark inviting them to tap the dish cards to customize and place their order.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || '';
      if (replyText.trim().length > 0) {
        // Extract dish IDs mentioned in response text
        const mentionedDishIds = currentMenu
          .filter(
            (m) =>
              replyText.toLowerCase().includes(m.nameMs.toLowerCase()) ||
              replyText.toLowerCase().includes(m.nameEn.toLowerCase()) ||
              replyText.includes(m.id)
          )
          .map((m) => m.id);

        return res.json({
          success: true,
          text: replyText,
          suggestedDishIds: mentionedDishIds.length > 0 ? mentionedDishIds.slice(0, 4) : currentMenu.filter(m => m.isPopular).slice(0, 2).map(m => m.id),
        });
      }
    } catch (geminiError: any) {
      console.warn('Gemini API call failed, switching to local smart fallback engine:', geminiError?.message || geminiError);
      // Seamlessly fall through to smart local fallback engine!
    }
  }

  // Fallback execution
  const fallback = generateLocalRecommendation();
  return res.json({
    success: true,
    text: fallback.text,
    suggestedDishIds: fallback.suggestedDishIds,
    mode: 'smart_engine',
  });
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
    let distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath) && typeof __dirname !== 'undefined') {
      distPath = __dirname;
    }
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('SmartDinePlus service is running.');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartDinePlus server running on http://0.0.0.0:${PORT}`);
  });

  // In Cloud Run production: if PORT is not 3000, also bind port 3000 if available
  if (process.env.NODE_ENV === 'production' && PORT !== 3000) {
    try {
      app.listen(3000, '0.0.0.0', () => {
        console.log(`SmartDinePlus server also listening on fallback port 3000`);
      }).on('error', () => {
        // Safe no-op if port 3000 is unavailable
      });
    } catch {
      // Safe no-op
    }
  }

  // Graceful shutdown on SIGTERM (Cloud Run container lifecycle)
  process.on('SIGTERM', () => {
    console.log('SIGTERM received: shutting down gracefully');
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
