# Business POS Pro Ultimate

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
│           └── app.js            # Core transactional app logic, synchronization, and cart (unminified)
├── working-code/
│   └── index.html                # Unminified full source code file containing inline script logic
└── README.md                     # Project manual and installation guides
```

---

## 📊 Local Database Schema (localStorage)

The local state is cached in the browser's `localStorage` under the key `muneeb_pro_ultimate` to allow operations during offline network drops.

<<<<<<< HEAD
<<<<<<< HEAD
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
    "url": "https://script.google.com/macros/s/AKfycb.../exec",
    "sender": "Muneeb Ahmad",
    "phone": "03070655275",
    "address": "Al-Rehman Avenue, Al-Quresh Phase # 3, Sher Shah Road, Multan",
    "website": "www.multantech.store"
  }
}
```

---

=======
>>>>>>> bfec1e713b7e4d91892bcd2b3d44c8e384f5e830
=======
>>>>>>> bfec1e713b7e4d91892bcd2b3d44c8e384f5e830
## ⚡ Google Apps Script Core Codebase

This script must be deployed in Google Drive as a **Web App** associated with your target Google Sheet. It manages reading from and writing rows directly to sheets named `Products`, `Stocks`, `Orders`, and `Customers`.

## 🔒 Security Configuration Details

### 1. Firebase Identity observer
Authentication checks restrict dashboard panel mounting unless credentials match registered store profiles:

### 2. Timed Debugger Guard (Anti-DevTools Loop)
To safeguard pricing schemas, margins, and script keys, `protect.js` implements timing-delta tests that trigger if code evaluation pauses (which is the case when developer tools windows are open):

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
5. Enter your exchange rate (e.g. `278` PKR per USD), Sender Name, Phone, Address, and Website details, then click **Save Settings**.
6. Trigger the **Sync** button in the top navigation panel to sync database templates to Google Sheets.
