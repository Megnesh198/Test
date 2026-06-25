// Initialization of secure EmailJS dispatch vectors
emailjs.init("UalhuFSQLiaeY4o2a");

// Secure layout environment adaptive checker
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Enterprise Cluster Configuration Variables
const firebaseConfig = {
    apiKey: "AIzaSyA6NgyT_wXp1FmXDNXKbHGzkeMoBsmwlo",
    authDomain: "jay-ambe-tiffin-service.firebaseapp.com",
    databaseURL: "https://jay-ambe-tiffin-service-default-rtdb.firebaseio.com",
    projectId: "jay-ambe-tiffin-service",
    storageBucket: "jay-ambe-tiffin-service.appspot.com",
    messagingSenderId: "741224227914",
    appId: "1:741224227914:web:aaad241b8f36b12f9c11ef"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let systemPassword = "Minu@198";
let analyticsChartInstance = null;
let currentCachedOrders = {}; // Cache map for Spreadsheet Engine

function bindImageEncoder(fileId, hiddenId) {
    const element = document.getElementById(fileId);
    if(element) {
        element.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) { document.getElementById(hiddenId).value = ev.target.result; };
                reader.readAsDataURL(file);
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    bindImageEncoder('thaliImageFile', 'thaliImageBase64');
    loadMenuManagementStream(); 
});

function authenticateAdminMode() {
    if(document.getElementById('adminPassword').value === systemPassword) {
        document.getElementById('admin-auth-view').classList.add('hidden');
        document.getElementById('admin-dashboard-view').classList.remove('hidden');
        loadRealtimeOrdersStream();
    } else { alert("❌ Authorization Denied: Key string mismatch!"); }
}

// PREMIUM RE-RENDER CONTROLLER FOR GRAPHICS MATRIX
function updateAnalyticsDashboardVisuals(pending, cooking, dispatched, delivered, cancelled) {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    if (analyticsChartInstance) { analyticsChartInstance.destroy(); }

    const isDark = document.documentElement.classList.contains('dark');

    analyticsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['⏳ Pending', '🍳 Cooking', '🛵 Dispatched', '✅ Delivered', '❌ Cancelled'],
            datasets: [{
                data: [pending, cooking, dispatched, delivered, cancelled],
                backgroundColor: ['#f59e0b', '#6366f1', '#3b82f6', '#22c55e', '#ef4444'],
                borderRadius: 10,
                barThickness: 28
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
                y: { 
                    beginAtZero: true, 
                    ticks: { stepSize: 1, color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Plus Jakarta Sans', weight: 600 } },
                    grid: { color: isDark ? '#334155' : '#f1f5f9' }
                },
                x: {
                    ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Plus Jakarta Sans', weight: 700 } },
                    grid: { display: false }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function loadRealtimeOrdersStream() {
    database.ref('orders').on('value', (snapshot) => {
        const container = document.getElementById('orders-container');
        container.innerHTML = "";
        const orders = snapshot.val();
        currentCachedOrders = orders || {}; 
        
        let total=0, pending=0, cooking=0, dispatched=0, delivered=0, cancelled=0;
        if(!orders) { updateAnalyticsDashboardVisuals(0,0,0,0,0); return; }

        Object.keys(orders).reverse().forEach(id => {
            const o = orders[id]; total++;
            if(o.status === "Pending") pending++;
            if(o.status === "Cooking") cooking++;
            if(o.status === "Out for Delivery") dispatched++;
            if(o.status === "Delivered") delivered++;
            if(o.status === "Cancelled") cancelled++;

            let statusColorSchema = "border-orange-100 bg-orange-50/60 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/20";
            if(o.status === "Cancelled") statusColorSchema = "border-red-100 bg-red-50/60 text-red-600 dark:bg-red-500/10 dark:border-red-500/20";
            if(o.status === "Delivered") statusColorSchema = "border-green-100 bg-green-50/60 text-green-600 dark:bg-green-500/10 dark:border-green-500/20";
            if(o.status === "Out for Delivery") statusColorSchema = "border-blue-100 bg-blue-50/60 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20";

            container.innerHTML += `
                <div class="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 text-xs flex flex-col justify-between shadow-sm transition hover:shadow-md">
                    <div class="space-y-2">
                        <div class="flex justify-between items-center gap-2">
                            <span class="font-extrabold text-slate-800 dark:text-white truncate text-sm">👤 ${o.customerName}</span>
                            <span class="text-[9px] font-bold px-2 py-0.5 border ${statusColorSchema} rounded-md whitespace-nowrap">${o.status}</span>
                        </div>
                        <p class="text-orange-500 font-bold tracking-wide">📞 ${o.phone} | ✉️ ${o.email || 'N/A'}</p>
                        <div class="p-2.5 bg-slate-50 dark:bg-[#151f32] rounded-xl border border-slate-100 dark:border-slate-800/60">
                            <p class="text-indigo-500 font-bold mb-0.5">📋 Pack Configuration Matrix:</p>
                            <span class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">${o.notes}</span>
                        </div>
                        <p class="text-slate-400 font-medium text-[11px] leading-snug">📍 ${o.address}</p>
                    </div>
                    <select onchange="updateOrderStatus('${id}', this.value)" class="mt-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151f32] text-slate-700 dark:text-slate-300 rounded-xl p-2.5 outline-none w-full font-bold cursor-pointer transition focus:ring-2 focus:ring-slate-500/10">
                        <option value="Pending" ${o.status==='Pending'?'selected':''}>⏳ Pending</option>
                        <option value="Cooking" ${o.status==='Cooking'?'selected':''}>🍳 Cooking</option>
                        <option value="Out for Delivery" ${o.status==='Out for Delivery'?'selected':''}>🛵 Out for Delivery</option>
                        <option value="Delivered" ${o.status==='Delivered'?'selected':''}>✅ Delivered</option>
                        <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>❌ Cancelled</option>
                    </select>
                </div>`;
        });
        
        document.getElementById('stat-monthly').innerText = total;
        document.getElementById('stat-pending').innerText = pending + cooking;
        document.getElementById('stat-picked').innerText = dispatched;
        document.getElementById('stat-delivered').innerText = delivered;

        updateAnalyticsDashboardVisuals(pending, cooking, dispatched, delivered, cancelled);
    });
}

function updateOrderStatus(orderId, statusState) {
    database.ref(`orders/${orderId}`).once('value', (snap) => {
        const data = snap.val();
        if(data) {
            database.ref(`orders/${orderId}`).update({ status: statusState, timestamp: new Date().toLocaleString('en-US', { hour12: true }) }, (err) => {
                if(!err) {
                    emailjs.send('service_bbr2v68', 'template_32a0oss', {
                        to_name: data.customerName,
                        customer_phone: data.phone,
                        customer_email: data.email || "jayambetiffin@gmail.com",
                        order_status: statusState,
                        items_summary: data.notes
                    });
                }
            });
        }
    });
}

// ================= THE ENTERPRISE SYSTEM SPREADSHEET CONTROLLER =================
function exportOrdersToSpreadsheet() {
    if(Object.keys(currentCachedOrders).length === 0) { alert("❌ Operational Trace: Data stream empty, export aborted."); return; }
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Added BOM metadata for proper Excel Indian localization parsing
    csvContent += "Timestamp Log,Customer Identity,Phone Vector,Email Node,Configuration Summary,Destination Address,Execution Status\n"; 

    Object.keys(currentCachedOrders).forEach(id => {
        const o = currentCachedOrders[id];
        const cleanNotes = o.notes ? o.notes.replace(/,/g, " |").replace(/"/g, "'") : "";
        const cleanAddress = o.address ? o.address.replace(/,/g, " ").replace(/"/g, "'") : "";
        
        let row = `"${o.timestamp || ''}","${o.customerName || ''}","${o.phone || ''}","${o.email || ''}","${cleanNotes}","${cleanAddress}","${o.status || ''}"\n`;
        csvContent += row;
    });

    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", `Master_Order_Spreadsheet_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// ================= DUAL ENGINE MODULAR CRUD HOOKS (THALIS & ADDONS) =================

function loadMenuManagementStream() {
    // Pipeline 1 Synchronization Engine: Thalis
    database.ref('tiffinThalis').on('value', (snapshot) => {
        const listContainer = document.getElementById('crud-thalis-list');
        listContainer.innerHTML = "";
        const thalis = snapshot.val();
        if(!thalis) { listContainer.innerHTML = `<p class="text-[10px] text-slate-400 italic">No Active Thali items live.</p>`; return; }

        Object.keys(thalis).forEach(id => {
            const t = thalis[id];
            listContainer.innerHTML += `
                <div class="flex items-center justify-between bg-slate-50 dark:bg-[#151f32] p-2.5 rounded-xl text-[11px] border border-slate-100 dark:border-slate-800">
                    <span class="truncate font-bold text-slate-700 dark:text-slate-300 max-w-[160px]">${t.title} <span class="text-orange-500">(₹${t.price})</span></span>
                    <div class="flex gap-3">
                        <button onclick="triggerEditThali('${id}', '${t.title}', '${t.items ? t.items.join(', ') : ''}', '${t.price}', '${t.image || ''}')" class="text-blue-500 hover:text-blue-600 font-bold transition">Edit</button>
                        <button onclick="deleteThaliRecord('${id}')" class="text-red-500 hover:text-red-600 font-bold transition">Delete</button>
                    </div>
                </div>`;
        });
    });

    // Pipeline 2 Synchronization Engine: Form 2 Extra Addons
    database.ref('tiffinAddons').on('value', (snapshot) => {
        const listContainer = document.getElementById('crud-addons-list');
        listContainer.innerHTML = "";
        const addons = snapshot.val();
        if(!addons) { listContainer.innerHTML = `<p class="text-[10px] text-slate-400 italic">No Active Extra Components live.</p>`; return; }

        Object.keys(addons).forEach(id => {
            const a = addons[id];
            listContainer.innerHTML += `
                <div class="flex items-center justify-between bg-slate-50 dark:bg-[#151f32] p-2.5 rounded-xl text-[11px] border border-slate-100 dark:border-slate-800">
                    <span class="truncate font-bold text-slate-700 dark:text-slate-300 max-w-[160px]">${a.title} <span class="text-blue-500">(₹${a.price})</span></span>
                    <div class="flex gap-3">
                        <button onclick="triggerEditAddon('${id}', '${a.title}', '${a.price}')" class="text-blue-500 hover:text-blue-600 font-bold transition">Edit</button>
                        <button onclick="deleteAddonRecord('${id}')" class="text-red-500 hover:text-red-600 font-bold transition">Delete</button>
                    </div>
                </div>`;
        });
    });
}

// FORM 1 INTEGRATED LOGIC DEPLOYER
function saveThaliRecord(e) {
    e.preventDefault();
    const editId = document.getElementById('editThaliId').value;
    const title = document.getElementById('thaliTitle').value.trim();
    const items = document.getElementById('thaliItems').value.split(',').map(i => i.trim());
    const price = document.getElementById('thaliPrice').value.trim();
    const base64Img = document.getElementById('thaliImageBase64').value;

    const payload = { title, items, price };
    if(base64Img) { payload.image = base64Img; }

    if(editId) {
        database.ref(`tiffinThalis/${editId}`).update(payload, (err) => {
            if(!err) { alert("✅ Thali modification logs synced safely."); resetThaliFormState(); }
        });
    } else {
        if(!base64Img) { payload.image = ""; }
        database.ref('tiffinThalis').push(payload, (err) => {
            if(!err) { alert("🎉 New Thali successfully deployed across nodes."); document.getElementById('adminThaliForm').reset(); }
        });
    }
}

function triggerEditThali(id, title, items, price, existingImg) {
    document.getElementById('editThaliId').value = id;
    document.getElementById('thaliTitle').value = title;
    document.getElementById('thaliItems').value = items;
    document.getElementById('thaliPrice').value = price;
    document.getElementById('thaliImageBase64').value = existingImg;
    document.getElementById('form-thali-title').innerText = "⚙️ Modify Mode: Edit Thali Target";
    document.getElementById('thaliSubmitBtn').innerText = "Apply Structure Modifications";
    document.getElementById('thaliSubmitBtn').className = "w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold transition";
    document.getElementById('cancel-thali-edit').classList.remove('hidden');
}

function resetThaliFormState() {
    document.getElementById('adminThaliForm').reset();
    document.getElementById('editThaliId').value = "";
    document.getElementById('thaliImageBase64').value = "";
    document.getElementById('form-thali-title').innerText = "Form 1: Add Premium Thali";
    document.getElementById('thaliSubmitBtn').innerText = "Publish Thali Menu";
    document.getElementById('thaliSubmitBtn').className = "w-full bg-orange-500 text-white py-2.5 rounded-xl font-bold transition";
    document.getElementById('cancel-thali-edit').classList.add('hidden');
}

function deleteThaliRecord(id) {
    if(confirm("🗑️ Are you sure you want to completely erase this Thali record entry?")) {
        database.ref(`tiffinThalis/${id}`).remove(() => { if(document.getElementById('editThaliId').value === id) resetThaliFormState(); });
    }
}

// FORM 2 INTEGRATED LOGIC DEPLOYER
function saveAddonRecord(e) {
    e.preventDefault();
    const editId = document.getElementById('editAddonId').value;
    const title = document.getElementById('addonTitle').value.trim();
    const price = document.getElementById('addonPrice').value.trim();

    const payload = { title, price };

    if(editId) {
        database.ref(`tiffinAddons/${editId}`).update(payload, (err) => {
            if(!err) { alert("✅ Extra Component modification logs synced safely."); resetAddonFormState(); }
        });
    } else {
        database.ref('tiffinAddons').push(payload, (err) => {
            if(!err) { alert("🎉 New component entry injected into active catalog."); document.getElementById('adminAddonForm').reset(); }
        });
    }
}

function triggerEditAddon(id, title, price) {
    document.getElementById('editAddonId').value = id;
    document.getElementById('addonTitle').value = title;
    document.getElementById('addonPrice').value = price;
    document.getElementById('form-addon-title').innerText = "⚙️ Modify Mode: Edit Addon Target";
    document.getElementById('addonSubmitBtn').innerText = "Apply Component Modifications";
    document.getElementById('addonSubmitBtn').className = "w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold transition";
    document.getElementById('cancel-addon-edit').classList.remove('hidden');
}

function resetAddonFormState() {
    document.getElementById('adminAddonForm').reset();
    document.getElementById('editAddonId').value = "";
    document.getElementById('form-addon-title').innerText = "Form 2: Add Extra Addons";
    document.getElementById('addonSubmitBtn').innerText = "Publish Extra Component";
    document.getElementById('addonSubmitBtn').className = "w-full bg-blue-500 text-white py-2.5 rounded-xl font-bold transition";
    document.getElementById('cancel-addon-edit').classList.add('hidden');
}

function deleteAddonRecord(id) {
    if(confirm("🗑️ Are you sure you want to completely erase this extra addon record entry?")) {
        database.ref(`tiffinAddons/${id}`).remove(() => { if(document.getElementById('editAddonId').value === id) resetAddonFormState(); });
    }
}