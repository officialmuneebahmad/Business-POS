// Database initialization
let db = JSON.parse(localStorage.getItem('muneeb_pro_ultimate')) || {
    orders: [],
    products: [],
    customers: [],
    settings: { theme: 'dark', name: 'Muneeb Business', rate: 278, url: '', sender: '', phone: '', address: '', website: '' }
};

let currentCart = [];

function save() {
    localStorage.setItem('muneeb_pro_ultimate', JSON.stringify(db));
    updateUI();
}

function toast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

function toggleTheme() {
    db.settings.theme = db.settings.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', db.settings.theme);
    document.getElementById('theme-btn').innerText = db.settings.theme === 'dark' ? '🌙' : '☀️';
    save();
}

function switchTab(id, el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    el.classList.add('active');
    if (id === 'dashboard') initChart();
    if (id === 'orders') renderCart();
}

async function syncEverythingFromCloud() {
    if (!db.settings.url) {
        toast("Please add Sheet URL in Settings");
        return;
    }
    toast("Syncing with Cloud...");
    try {
        const urlWithCacheBuster = db.settings.url + (db.settings.url.includes('?') ? '&' : '?') + 't=' + Date.now();
        const response = await fetch(urlWithCacheBuster);
        if (!response.ok) throw new Error('Network response was not ok');
        const cloudData = await response.json();
        
        if (cloudData.products) db.products = cloudData.products;
        if (cloudData.orders) db.orders = cloudData.orders;
        if (cloudData.customers) db.customers = cloudData.customers;
        
        save();
        toast("Sync Complete");
    } catch (e) {
        console.error("Sync Error:", e);
        toast("Sync Failed: Check URL or Permissions");
    }
}

function addProduct() {
    const n = document.getElementById('p-name').value.trim();
    const c = parseFloat(document.getElementById('p-cost').value);
    const s = parseFloat(document.getElementById('p-sale').value);

    if (!n || isNaN(c) || isNaN(s)) return alert('Fill all fields');

    const p = {
        action: 'addProduct',
        id: Date.now(),
        name: n, cost: c, sale: s, qty: 0, alert: 5, unit: 'pc'
    };

    db.products.push(p);
    save();

    if (db.settings.url) {
        fetch(db.settings.url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(p)
        });
    }
    toast('Product Added');
    document.getElementById('p-name').value = '';
    document.getElementById('p-cost').value = '';
    document.getElementById('p-sale').value = '';
}

function addToCart() {
    const productId = document.getElementById('o-product').value;
    const product = db.products.find(p => p.id == productId);
    const qty = parseFloat(document.getElementById('o-qty').value) || 0;
    if (!product || qty <= 0) return alert('Invalid Quantity');
    
    const cartQty = (currentCart.find(item => item.id == productId)?.qty) || 0;
    if (product.qty < qty + cartQty) return alert('Low Stock');
    
    const cartItem = currentCart.find(item => item.id == productId);
    if (cartItem) {
        cartItem.qty += qty;
        cartItem.total = cartItem.qty * product.sale;
    } else {
        currentCart.push({
            id: product.id,
            name: product.name,
            price: product.sale,
            cost: product.cost,
            qty: qty,
            total: product.sale * qty
        });
    }
    document.getElementById('o-qty').value = 1;
    renderCart();
}

function removeFromCart(index) {
    currentCart.splice(index, 1);
    renderCart();
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    if (currentCart.length === 0) {
        cartContainer.innerHTML = '<div class="small" style="text-align:center; padding:10px;">Cart is empty</div>';
        document.getElementById('o-grand-total').innerText = 'Rs. 0';
        return;
    }
    let grandTotal = 0;
    cartContainer.innerHTML = currentCart.map((item, index) => {
        grandTotal += item.total;
        return `
        <div class="item" style="padding:12px; display:flex; justify-content:space-between; align-items:center; background:var(--card-solid); border:1px solid var(--border); border-radius:12px;">
            <div>
                <b>${item.name}</b>
                <div class="small">Qty: ${item.qty} (@ Rs. ${item.price}) = Rs. ${item.total}</div>
            </div>
            <span style="color:var(--danger); cursor:pointer; font-weight:bold; padding:4px 8px; background:rgba(239,68,68,0.1); border-radius:8px;" onclick="removeFromCart(${index})">X</span>
        </div>
        `;
    }).join('');
    document.getElementById('o-grand-total').innerText = 'Rs. ' + grandTotal.toLocaleString();
}

function placeOrder() {
    if (currentCart.length === 0) return alert('Cart is empty');
    
    const order = {
        action: 'placeOrder',
        id: 'INV-' + Date.now(),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        name: document.getElementById('o-name').value || 'Customer',
        phone: document.getElementById('o-phone').value,
        address: document.getElementById('o-address').value,
        product: currentCart.map(item => item.name + ' (x' + item.qty + ')').join(', '),
        price: currentCart.reduce((sum, item) => sum + item.price, 0),
        qty: currentCart.reduce((sum, item) => sum + item.qty, 0),
        totalRevenue: currentCart.reduce((sum, item) => sum + item.total, 0),
        totalProfit: currentCart.reduce((sum, item) => sum + (item.price - item.cost) * item.qty, 0),
        note: document.getElementById('o-note').value,
        cartData: [...currentCart]
    };
    
    // Update inventory local stock
    currentCart.forEach(item => {
        const product = db.products.find(p => p.id == item.id);
        if (product) {
            product.qty -= item.qty;
            if (db.settings.url) {
                fetch(db.settings.url, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        action: 'updateStock',
                        id: product.id,
                        qty: product.qty,
                        alert: product.alert,
                        unit: product.unit
                    })
                });
            }
        }
    });
    
    db.orders.push(order);
    
    // Update/add local customer
    const existingCust = db.customers.find(c => c.phone === order.phone);
    if (existingCust) {
        existingCust.name = order.name;
        existingCust.address = order.address;
        existingCust.lastOrder = order.date;
    } else if (order.phone) {
        db.customers.push({
            name: order.name,
            phone: order.phone,
            address: order.address,
            lastOrder: order.date
        });
    }
    
    save();
    
    if (db.settings.url) {
        fetch(db.settings.url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(order)
        });
    }
    
    generateInvoice(order);
    toast('Order Created');
    
    currentCart = [];
    renderCart();
    document.getElementById('o-name').value = '';
    document.getElementById('o-phone').value = '';
    document.getElementById('o-address').value = '';
    document.getElementById('o-note').value = '';
}

function copyScript() {
  const script = `function doGet() {
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
}`;

  navigator.clipboard.writeText(script)
    .then(() => {
      alert("Script copied successfully!");
    })
    .catch(err => {
      console.error("Failed to copy script:", err);
      alert("Failed to copy script.");
    });
}

function updateStock() {
    const p = db.products.find(x => x.id == document.getElementById('s-product').value);
    if (!p) return;

    const add = parseFloat(document.getElementById('s-qty').value) || 0;
    p.qty += add;
    p.alert = parseFloat(document.getElementById('s-alert').value) || 5;
    p.unit = document.getElementById('s-unit').value;

    if (db.settings.url) {
        fetch(db.settings.url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
                action: 'updateStock',
                id: p.id,
                qty: p.qty,
                alert: p.alert,
                unit: p.unit
            })
        });
    }
    save();
    toast('Stock Updated');
}

function saveSettings() {
    db.settings.name = document.getElementById('set-name').value;
    db.settings.rate = document.getElementById('set-rate').value;
    db.settings.url = document.getElementById('set-url').value;
    db.settings.sender = document.getElementById('set-sender').value;
    db.settings.phone = document.getElementById('set-phone').value;
    db.settings.address = document.getElementById('set-address').value;
    db.settings.website = document.getElementById('set-website').value;
    save();
    toast('Settings Saved');
}

function updateUI() {
    // Update Shop Info
    document.getElementById('shop-name-top').innerText = db.settings.name;
    document.getElementById('exchange-top').innerText = `1 USD = ${db.settings.rate} PKR`;
    document.getElementById('total-orders').innerText = db.orders.length;
    document.getElementById('total-revenue').innerText = 'Rs. ' + db.orders.reduce((a, b) => a + (b.totalRevenue || 0), 0).toLocaleString();
    document.getElementById('total-profit').innerText = 'Rs. ' + db.orders.reduce((a, b) => a + (b.totalProfit || 0), 0).toLocaleString();

    // Update Product Selectors
    const options = db.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    document.getElementById('o-product').innerHTML = options;
    document.getElementById('s-product').innerHTML = options;

    // Update Stock List
    document.getElementById('stock-list').innerHTML = db.products.map(p => `
        <div class="item">
            <div><b>${p.name}</b><div class="small">Alert: ${p.alert}</div></div>
            <div class="badge ${p.qty <= p.alert ? 'low' : 'good'}">${p.qty} ${p.unit || 'pc'}</div>
        </div>
    `).join('');

    // Update Orders List
    document.getElementById('orders-list').innerHTML = [...db.orders].reverse().map((o) => `
        <div class="item">
            <div><b>${o.name}</b><div class="small">${o.product}</div></div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <b>Rs. ${o.totalRevenue}</b>
                <button onclick="printInvoice('${o.id}')" style="background:var(--card-solid);border:1px solid var(--border);color:var(--text);padding:7px 14px;border-radius:10px;font-weight:700;cursor:pointer;font-size:12px;">🧾 Invoice</button>
            </div>
        </div>
    `).join('');

    // Update Products List
    document.getElementById('products-list').innerHTML = [...db.products].reverse().map((o) => `
        <div class="item">
            <div><b>${o.name}</b><div class="small" style="padding:5px 0px;">COST PRICE: Rs. ${o.cost}</div></div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <b>Rs. ${o.sale}</b>
            </div>
        </div>
    `).join('');

    // Update Customers List (Optimized)
    const customerListEl = document.getElementById('customers-list');
    const customerMap = new Map();

    db.orders.forEach(o => {
        if (!o.phone) return;
        
        if (!customerMap.has(o.phone)) {
            customerMap.set(o.phone, {
                name: o.name,
                phone: o.phone,
                address: o.address || 'No Address',
                lastOrder: o.date,
                products: [o.product]
            });
        } else {
            const existing = customerMap.get(o.phone);
            existing.lastOrder = o.date;
            if (!existing.products.includes(o.product)) {
                existing.products.push(o.product);
            }
        }
    });

    if (customerMap.size > 0) {
        customerListEl.innerHTML = Array.from(customerMap.values()).map(c => `
            <div class="item">
                <div style="flex:1;">
                    <div style="display:flex; justify-content:between; align-items:center;">
                        <b>${c.name}</b>
                        <span class="small" style="margin-left:10px; color:var(--primary)">${formatDate(c.lastOrder)}</span>
                    </div>
                    <div class="small">${c.phone} ${c.address !== 'No Address' ? '· ' + c.address : ''}</div>
                    <div class="small" style="color:var(--success); margin-top:4px;">
                        <strong>Bought:</strong> ${c.products.join(', ')}
                    </div>
                </div>
                <div style="display:flex; gap:8px;">
                    <a href="https://wa.me/${c.phone.replace(/[^0-9]/g,'')}" target="_blank" class="wa-btn" style="text-decoration:none;">💬 WhatsApp</a>
                </div>
            </div>
        `).join('');
    } else {
        customerListEl.innerHTML = '<div style="color:var(--muted);padding:16px;text-align:center;">No customers found. Place an order first or Sync Cloud.</div>';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function wipeData() {
    if (confirm('Delete all data? This cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
}

let chartObj = null;
function initChart() {
    const ctx = document.getElementById('chart');
    if (chartObj) chartObj.destroy();
    chartObj = new Chart(ctx, {
        type: 'line',
        data: {
            labels: db.orders.slice(-7).map(o => formatDate(o.date)),
            datasets: [{
                label: 'Profit',
                data: db.orders.slice(-7).map(o => o.totalProfit),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,.2)',
                fill: true,
                tension: .4
            }]
        }
    });
}

window.onload = async () => {
    document.body.setAttribute('data-theme', db.settings.theme);
    document.getElementById('set-name').value = db.settings.name;
    document.getElementById('set-rate').value = db.settings.rate;
    document.getElementById('set-url').value = db.settings.url;
    document.getElementById('set-sender').value = db.settings.sender || '';
    document.getElementById('set-phone').value = db.settings.phone || '';
    document.getElementById('set-address').value = db.settings.address || '';
    document.getElementById('set-website').value = db.settings.website || '';
    renderCart();
    updateUI();
    initChart();
    await syncEverythingFromCloud();
};
