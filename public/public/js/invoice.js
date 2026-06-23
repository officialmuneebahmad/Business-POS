function generateInvoice(order){
    printInvoice(order.id);
}

function printInvoice(orderId){

    const o = db.orders.find(x => x.id === orderId);

    if(!o) return;

    document.getElementById('inv-shop').innerText = db.settings.name || 'Business';
    document.getElementById('inv-sender').innerText = db.settings.sender || '';
    document.getElementById('inv-phone').innerText = db.settings.phone || '';
    document.getElementById('inv-address').innerText = db.settings.address || '';
    document.getElementById('inv-website').innerText = db.settings.website || '';
    document.getElementById('inv-id').innerText = o.id;
    document.getElementById('inv-date').innerText = formatDate(o.date);
    document.getElementById('inv-day').innerText = o.day || '';
    document.getElementById('inv-customer').innerText = o.name;
    document.getElementById('inv-cust-phone').innerText = o.phone || '';
    document.getElementById('inv-cust-addr').innerText = o.address;

    document.getElementById('inv-subtotal').innerText =
        'PKR ' + Number(o.totalRevenue).toLocaleString();

    document.getElementById('inv-total').innerText =
        'PKR ' + Number(o.totalRevenue).toLocaleString();

    let itemsHTML = '';

    // IMPORTANT FIX
    let cartItems = [];

    if(Array.isArray(o.cartData)){

        cartItems = o.cartData;

    } else {

        try{
            cartItems = JSON.parse(o.cartData || '[]');
        }catch(err){
            cartItems = [];
        }

    }

    // MULTIPLE PRODUCTS
    if(cartItems.length > 0){

        cartItems.forEach(item => {

            itemsHTML += `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.qty}</td>
                <td>PKR ${Number(item.price).toLocaleString()}</td>
                <td>PKR ${Number(item.total).toLocaleString()}</td>
            </tr>
            `;

        });

    } else {

        // OLD ORDERS FALLBACK
        itemsHTML = `
        <tr>
            <td><strong>${o.product}</strong></td>
            <td>${o.qty}</td>
            <td>PKR ${Number(o.price).toLocaleString()}</td>
            <td>PKR ${Number(o.totalRevenue).toLocaleString()}</td>
        </tr>
        `;

    }

    document.getElementById('inv-items').innerHTML = itemsHTML;

    const el = document.getElementById('invoice');

    const opt = {
        margin:0,
        filename:`${o.id}.pdf`,
        image:{ type:'jpeg', quality:1 },

        html2canvas:{
            scale:4,
            useCORS:true,
            logging:false
        },

        jsPDF:{
            unit:'mm',
            format:'a4',
            orientation:'portrait'
        }
    };

    toast('Generating Invoice PDF...');

    setTimeout(()=>{

        html2pdf()
            .set(opt)
            .from(el)
            .save()
            .then(()=>toast('Invoice Downloaded!'));

    },300);

}