// Initialize EmailJS
emailjs.init("UalhuFSQLiaeY4o2a"); 

// Theme Sync Engine
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Firebase Initialization
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

let customRequestsArray = [];
let masterAvailableChecklistItems = [];

// Quantity Counter Management
function adjustQtyVal(elementId, change) {
    const el = document.getElementById(elementId);
    let val = parseInt(el.innerText) || 1;
    val += change; if(val < 1) val = 1;
    el.innerText = val;
}

// Custom Tag System
function handleCustomRequestEnter(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const inputVal = e.target.value.trim();
        if (inputVal && !customRequestsArray.includes(inputVal)) {
            customRequestsArray.push(inputVal); 
            renderCustomTags();
        }
        e.target.value = "";
    }
}

function renderCustomTags() {
    const container = document.getElementById('custom-items-tags-container');
    container.innerHTML = "";
    customRequestsArray.forEach((item, index) => {
        container.innerHTML += `<span class="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5">${item}<button type="button" onclick="removeCustomTag(${index})" class="text-indigo-500 font-black">×</button></span>`;
    });
}

function removeCustomTag(index) { 
    customRequestsArray.splice(index, 1); 
    renderCustomTags(); 
}

// Synchronize Checklist Checklist 
function synchronizeChecklistDom() {
    const container = document.getElementById('dynamic-items-checklist');
    container.innerHTML = "";
    masterAvailableChecklistItems.forEach((item, idx) => {
        const safeId = `qty_counter_${idx}`;
        container.innerHTML += `
            <div class="flex items-center justify-between bg-white dark:bg-slate-800 border dark:border-slate-700 p-3 rounded-xl shadow-sm">
                <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                    <input type="checkbox" name="loungeCheckboxes" value="${item}" data-counter-id="${safeId}" class="w-4 h-4 text-orange-500 focus:ring-orange-500">
                    <span>${item}</span>
                </label>
                <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg">
                    <button type="button" onclick="adjustQtyVal('${safeId}', -1)" class="w-5 h-5 font-black text-slate-500">-</button>
                    <span id="${safeId}" class="w-6 text-center font-extrabold">1</span>
                    <button type="button" onclick="adjustQtyVal('${safeId}', 1)" class="w-5 h-5 font-black text-slate-500">+</button>
                </div>
            </div>`;
    });
}

// Dynamic UI Data Fetching
database.ref('tiffinThalis').on('value', (snapshot) => {
    const thalis = snapshot.val() || {};
    const grid = document.getElementById('client-thalis-grid');
    grid.innerHTML = "";
    Object.keys(thalis).forEach(key => {
        const t = thalis[key];
        if (!masterAvailableChecklistItems.includes(t.title)) masterAvailableChecklistItems.push(t.title);
        const imgTag = (t.image) ? `<img src="${t.image}" class="w-full h-44 object-cover">` : `<div class="h-44 w-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-4xl">🍛</div>`;
        grid.innerHTML += `
            <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-md overflow-hidden border dark:border-slate-700 flex flex-col justify-between">
                <div>
                    <div class="relative">${imgTag} <span class="absolute top-3 right-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-orange-500 text-white">₹${t.price}</span></div>
                    <div class="p-5"><h4 class="text-base font-extrabold text-slate-900 dark:text-white mb-2">${t.title}</h4></div>
                </div>
            </div>`;
    });
    synchronizeChecklistDom();
});

database.ref('extraItems').on('value', (snapshot) => {
    const addons = snapshot.val() || {};
    const clientContainer = document.getElementById('client-addons-container');
    clientContainer.innerHTML = "";
    Object.keys(addons).forEach(key => {
        const item = addons[key];
        if(!masterAvailableChecklistItems.includes(item.name)) masterAvailableChecklistItems.push(item.name);
        const imgMarkup = (item.image) ? `<img src="${item.image}" class="w-12 h-12 object-cover rounded-xl">` : `<div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">🍲</div>`;
        clientContainer.innerHTML += `
            <div class="bg-white dark:bg-slate-800 border dark:border-slate-700/60 p-2.5 rounded-2xl shadow-sm flex items-center gap-3">
                ${imgMarkup}<div><h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">${item.name}</h4><p class="text-xs font-black text-orange-500">₹${item.price}</p></div>
            </div>`;
    });
    synchronizeChecklistDom();
});

// Order Submission Process
function submitCustomerOrder(e) {
    e.preventDefault();
    let segments = [];
    document.querySelectorAll('input[name="loungeCheckboxes"]:checked').forEach(cb => {
        const counterId = cb.getAttribute('data-counter-id');
        const qty = document.getElementById(counterId).innerText;
        segments.push(`${cb.value} (Qty: ${qty})`);
    });
    customRequestsArray.forEach(c => segments.push(`${c} (Custom Request)`));
    const finalSummary = segments.join(', ');
    if(!finalSummary) { alert("❌ Kripya menu se item select kijiye!"); return; }

    const clientMail = document.getElementById('custEmail').value.trim();
    const orderPayload = {
        customerName: document.getElementById('custName').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        email: clientMail,
        notes: finalSummary,
        address: document.getElementById('custAddress').value.trim(),
        status: "Pending",
        timestamp: new Date().toLocaleString('en-US', { hour12: true })
    };

    database.ref('orders').push(orderPayload, (err) => {
        if(!err) {
            alert("🎉 Order Booked! Confirmation mail sent.");
            emailjs.send('service_bbr2v68', 'template_32a0oss', {
                to_name: orderPayload.customerName,
                customer_phone: orderPayload.phone,
                customer_email: clientMail,
                order_status: "Pending (Confirmed)",
                items_summary: finalSummary,
                reply_to: "jayambetiffin@gmail.com"
            });
            document.getElementById('orderForm').reset();
            customRequestsArray = []; renderCustomTags();
        }
    });
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}


// Fetch and Render Public Reviews Live
database.ref('reviews').on('value', (snapshot) => {
    const grid = document.getElementById('public-reviews-grid');
    grid.innerHTML = "";
    const reviews = snapshot.val();
    
    if(!reviews) {
        grid.innerHTML = `<p class="text-xs text-slate-400 text-center col-span-2">No reviews yet. Be the first to rate us!</p>`;
        return;
    }

    Object.keys(reviews).reverse().forEach(id => {
        const r = reviews[id];
        let stars = "⭐".repeat(r.rating);
        grid.innerHTML += `
            <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border dark:border-slate-700 space-y-2">
                <div class="flex justify-between items-center">
                    <span class="font-extrabold text-xs text-slate-900 dark:text-white">👤 ${r.name}</span>
                    <span class="text-xs">${stars}</span>
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-300 italic">"${r.comment}"</p>
                <p class="text-[9px] text-slate-400 text-right">${r.timestamp}</p>
            </div>`;
    });
});



// Updated Order Submission Process with Diet Control Integration
function submitCustomerOrder(e) {
    e.preventDefault();
    let segments = [];
    
    // 1. Menu Items Selection
    document.querySelectorAll('input[name="loungeCheckboxes"]:checked').forEach(cb => {
        const counterId = cb.getAttribute('data-counter-id');
        const qty = document.getElementById(counterId).innerText;
        segments.push(`${cb.value} (Qty: ${qty})`);
    });
    
    // 2. Custom Tags Requests
    customRequestsArray.forEach(c => segments.push(`${c} (Custom Request)`));
    
    // 3. Make Your Own Thali: Diet Preferences Capture
    let selectedDiets = [];
    document.querySelectorAll('input[name="dietPrefs"]:checked').forEach(dp => {
        selectedDiets.push(dp.value);
    });
    
    const itemsSummaryText = segments.join(', ');
    if(!itemsSummaryText) { alert("❌ Kripya menu se item select kijiye!"); return; }

    const dietPreferencesText = selectedDiets.length > 0 ? selectedDiets.join(' | ') : "Standard (No Custom Diet)";
    // Dono ko combine karke final notes ready karenge
    const finalOrderNotes = `${itemsSummaryText} [Diet Preferences: ${dietPreferencesText}]`;

    const clientMail = document.getElementById('custEmail').value.trim();
    const orderPayload = {
        customerName: document.getElementById('custName').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        email: clientMail,
        notes: finalOrderNotes, // Pura synchronized customization data
        address: document.getElementById('custAddress').value.trim(),
        status: "Pending",
        timestamp: new Date().toLocaleString('en-US', { hour12: true })
    };

    database.ref('orders').push(orderPayload, (err) => {
        if(!err) {
            alert("🎉 Order Booked! Diet custom parameters integrated safely.");
            emailjs.send('service_bbr2v68', 'template_32a0oss', {
                to_name: orderPayload.customerName,
                customer_phone: orderPayload.phone,
                customer_email: clientMail,
                order_status: "Pending (Confirmed)",
                items_summary: finalOrderNotes,
                reply_to: "jayambetiffin@gmail.com"
            });
            
            // Clear inputs & Reset Form Layout
            document.getElementById('orderForm').reset();
            customRequestsArray = []; 
            renderCustomTags();
        }
    });
}