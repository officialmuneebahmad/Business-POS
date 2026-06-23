# Muneeb Business POS Pro Ultimate

A professional, high-performance, offline-resilient Point of Sale (POS) system designed for retail operations. 

Developed by **Muneeb Ahmad** from Pakistan, this system leverages modern vanilla frontend technologies and integrates with Google Sheets as a simplified, no-code backend engine for non-technical users, alongside Firebase for secure auth control.

---

## 🚀 Key Features

* **Interactive Profit Analytics Dashboard:** Real-time metrics visualization tracking total orders, total revenue, and profit calculations with a 7-day trend chart powered by `Chart.js`.
* **Multi-Product Cart System:** Dynamic local shopping cart builder with stock-level validation, reactive totals, and support for notes.
* **Stock & Inventory Control:** Real-time inventory monitoring with unit configurations (`pc`, `kg`, `g`, `packet`, `box`, `liter`, etc.) and visual low-stock warnings based on custom alert thresholds.
* **Customer Directory & CRM:** Automated directory building grouping orders by phone number, displaying total items purchased, and offering a direct click-to-chat link for WhatsApp.
* **Google Sheets Cloud Integration:** Seamless synchronization (synchronous GET fetches to fetch cloud tables and POST requests to upload transaction logs) bypassing database hosting costs.
* **Client-Side PDF Invoicing:** Direct generation of standard A4 PDF invoices using `html2pdf.js` for instant physical receipt printing.
* **Timing-Based Debugger Defense:** Custom scripts to prevent right-clicking, inspection shortcut keys, and continuous debug loops to black out the page if developer tools are open.

---

## 🛠️ Technology Stack

| Layer | Technologies / Libraries Used |
| :--- | :--- |
| **Frontend Framework** | Pure Vanilla HTML5, CSS3, ES6 JavaScript |
| **Charts & Graphics** | `Chart.js` (Web CDN Integration) |
| **PDF Processing** | `html2pdf.js` (DOM-to-Canvas A4 rendering engine) |
| **User Identity** | Firebase Web Client SDK v10 (Auth & Firestore security observer) |
| **Backend / Database** | Google Sheets & Google Apps Script API endpoints |
| **Local Offline Cache** | LocalStorage Key Object State (`muneeb_pro_ultimate`) |

---

## 📁 Repository Directory Structure

```text
4. POS-System/
├── public/                       # Firebase project configuration and deployment files
│   ├── .firebase/                # Cache directories
│   ├── .firebaserc               # Firebase project routing configs
│   ├── firebase.json             # Hosting and database specifications
│   ├── firestore.indexes.json    # Firestore query indexes
│   ├── firestore.rules           # Security rules for document validation
│   └── public/                   # Client web assets (deployed to Firebase Hosting)
│       ├── index.html            # Core POS single-page application entry point
│       ├── 404.html              # Custom page-not-found route screen
│       ├── css/
│       │   └── style.css         # Custom responsive design variables and rules
│       └── js/
│           ├── firebase.js       # Firebase initialization and authentication callbacks
│           ├── invoice.js        # DOM invoice parsing and PDF converter pipeline
│           ├── protect.js        # Anti-debugging loop and keyboard shortcut block lists
│           └── app.min.js        # Core transactional app logic, synchronization, and cart
├── working-code/
│   └── index.html                # Unminified full source code file containing inline script logic
└── README.md                     # Project manual and installation guides
```

---

## 📊 Local Database Schema (localStorage)

The local state is cached in the browser's `localStorage` under the key `muneeb_pro_ultimate` to allow operations during offline network drops.

```json
{
  "orders": [
    {
      "id": "INV-1715887201994",
      "date": "5/17/2026",
      "day": "Sunday",
      "name": "Arshad Iqbal",
      "phone": "03001234567",
      "address": "Multan Cantt, Pakistan",
      "product": "Logitech Mouse x1, Dell Keyboard x1",
      "price": 1800,
      "qty": 2,
      "totalRevenue": 2800,
      "totalProfit": 900,
      "note": "Deliver after 5 PM",
      "cartData": [
        { "id": 1715886100112, "name": "Logitech Mouse", "price": 1200, "cost": 800, "qty": 1, "total": 1200 },
        { "id": 1715886122459, "name": "Dell Keyboard", "price": 1600, "cost": 1100, "qty": 1, "total": 1600 }
      ]
    }
  ],
  "products": [
    {
      "id": 1715886100112,
      "name": "Logitech Mouse",
      "cost": 800,
      "sale": 1200,
      "qty": 45,
      "alert": 5,
      "unit": "pc"
    }
  ],
  "customers": [
    {
      "name": "Arshad Iqbal",
      "phone": "03001234567",
      "address": "Multan Cantt, Pakistan",
      "lastOrder": "5/17/2026"
    }
  ],
  "settings": {
    "theme": "dark",
    "name": "Muneeb Business",
    "rate": 278,
    "url": "https://script.google.com/macros/s/AKfycb.../exec"
  }
}
```

---

## ⚡ Google Apps Script Core Codebase

This script must be deployed in Google Drive as a **Web App** associated with your target Google Sheet. It manages reading from and writing rows directly to sheets named `Products`, `Stocks`, `Orders`, and `Customers`.

```javascript
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Ensure all required sheets exist
  const productsSheet = ss.getSheetByName("Products") || ss.insertSheet("Products");
  const stocksSheet = ss.getSheetByName("Stocks") || ss.insertSheet("Stocks");
  const ordersSheet = ss.getSheetByName("Orders") || ss.insertSheet("Orders");
  const customersSheet = ss.getSheetByName("Customers") || ss.insertSheet("Customers");

  // Initialize Headers if sheets are empty
  if (productsSheet.getLastRow() === 0) {
    productsSheet.appendRow(["ID", "NAME", "COST", "SALE"]);
  }
  if (stocksSheet.getLastRow() === 0) {
    stocksSheet.appendRow(["ID", "NAME", "QTY", "ALERT", "UNIT"]);
  }
  if (ordersSheet.getLastRow() === 0) {
    ordersSheet.appendRow([
      "INV #", "DATE", "DAY", "CUSTOMER", "PHONE", "ADDRESS",
      "PRODUCT", "PRICE", "QTY", "TOTAL", "PROFIT", "NOTES", "CART_DATA"
    ]);
  }
  if (customersSheet.getLastRow() === 0) {
    customersSheet.appendRow(["Name", "Phone", "Address", "Last Order Date"]);
  }

  const productsData = productsSheet.getDataRange().getValues();
  const stocksData = stocksSheet.getDataRange().getValues();
  const ordersData = ordersSheet.getDataRange().getValues();
  const customersData = customersSheet.getDataRange().getValues();

  let result = { products: [], orders: [], customers: [] };

  // 1. Fetch Products + Stocks
  for (let i = 1; i < productsData.length; i++) {
    const p = productsData[i];
    let stockQty = 0, stockAlert = 5, stockUnit = "pc";

    for (let j = 1; j < stocksData.length; j++) {
      if (String(stocksData[j][0]) === String(p[0])) {
        stockQty = Number(stocksData[j][2]) || 0;
        stockAlert = Number(stocksData[j][3]) || 5;
        stockUnit = stocksData[j][4] || "pc";
        break;
      }
    }
    result.products.push({
      id: p[0], name: p[1], cost: Number(p[2]) || 0, sale: Number(p[3]) || 0,
      qty: stockQty, alert: stockAlert, unit: stockUnit
    });
  }

  // 2. Fetch Orders
  for (let i = 1; i < ordersData.length; i++) {
    const o = ordersData[i];
    let parsedCart = [];
    try {
      parsedCart = JSON.parse(o[12] || "[]");
    } catch(err) {
      parsedCart = [];
    }
    result.orders.push({
      id: o[0], date: o[1], day: o[2], name: o[3], phone: String(o[4] || ""),
      address: o[5], product: o[6], price: Number(o[7]) || 0, qty: Number(o[8]) || 0,
      totalRevenue: Number(o[9]) || 0, totalProfit: Number(o[10]) || 0, note: o[11], cartData: parsedCart
    });
  }

  // 3. Fetch Customers
  for (let i = 1; i < customersData.length; i++) {
    const c = customersData[i];
    result.customers.push({
      name: c[0], phone: String(c[1] || ""), address: c[2],
      lastOrder: Utilities.formatDate(new Date(c[3]), Session.getScriptTimeZone(), "dd/MM/yyyy")
    });
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const productsSheet = ss.getSheetByName("Products");
  const stocksSheet = ss.getSheetByName("Stocks");
  const ordersSheet = ss.getSheetByName("Orders");
  const data = JSON.parse(e.postData.contents);

  // ADD PRODUCT ACTION
  if (data.action === "addProduct") {
    productsSheet.appendRow([data.id, data.name, data.cost, data.sale]);
    stocksSheet.appendRow([data.id, data.name, data.qty || 0, data.alert || 5, data.unit || "pc"]);
  }

  // UPDATE STOCK ACTION
  if (data.action === "updateStock") {
    const rows = stocksSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(data.id)) {
        stocksSheet.getRange(i + 1, 3).setValue(data.qty);
        stocksSheet.getRange(i + 1, 4).setValue(data.alert);
        stocksSheet.getRange(i + 1, 5).setValue(data.unit);
        break;
      }
    }
  }

  // PLACE ORDER ACTION
  if (data.action === "placeOrder") {
    ordersSheet.appendRow([
      data.id, data.date, data.day, data.name, data.phone, data.address,
      data.product, data.price, data.qty, data.totalRevenue, data.totalProfit, data.note,
      JSON.stringify(Array.isArray(data.cartData) ? data.cartData : [])
    ]);
  }

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}
```

---

## 🔒 Security Configuration Details

### 1. Firebase Identity observer
Authentication checks restrict dashboard panel mounting unless credentials match registered store profiles:
```javascript
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
});
```

### 2. Timed Debugger Guard (Anti-DevTools Loop)
To safeguard pricing schemas, margins, and script keys, `protect.js` implements timing-delta tests that trigger if code evaluation pauses (which is the case when developer tools windows are open):
```javascript
setInterval(function () {
  const before = new Date().getTime();
  debugger;
  const after = new Date().getTime();
  if (after - before > 100) {
    document.body.innerHTML = `<div style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:Arial; background:#111; color:white; font-size:30px;">Developer Tools Detected</div>`;
  }
}, 1000);
```

---

## ⚙️ Deployment & Sync Guide

### Part A: Google Apps Script Web App Deployment
1. Open a Google Sheet and name it `POS Cloud DB`.
2. Go to **Extensions** > **Apps Script**.
3. Paste the Apps Script codebase from above, save, and click **Deploy** > **New Deployment**.
4. Select Type: **Web App**. Set access rules:
   * **Execute as:** `Me (your-email@gmail.com)`
   * **Who has access:** `Anyone` (necessary for webhook requests).
5. Click **Deploy**, accept authorization prompts, and copy the generated Web App URL.

### Part B: Client Configuration Setup
1. Launch the POS interface in your browser.
2. Sign in with your operator credentials.
3. Open the **Settings** tab (gear icon).
4. Paste the Web App URL in the **Google Script URL** input field.
5. Set your exchange rate (e.g. `278` PKR per USD) and click **Save Settings**.
6. Trigger the **Sync** button in the top navigation panel to sync database templates to Google Sheets.
