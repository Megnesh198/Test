// Theme Initialization
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Firebase Configurations
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

// Live Order Tracker Lookup
function trackCustomerOrderLive() {
    const phoneInput = document.getElementById('trackPhoneInput').value.trim();
    const resultBox = document.getElementById('tracking-result-box');
    if(!phoneInput) { alert("Please enter phone number!"); return; }

    database.ref('orders').once('value', (snapshot) => {
        const orders = snapshot.val();
        resultBox.innerHTML = ""; resultBox.classList.remove('hidden');
        if(!orders) { resultBox.innerHTML = `<div class="text-center text-red-500 font-bold text-xs">No orders found.</div>`; return; }

        let found = [];
        Object.keys(orders).forEach(id => { if(orders[id].phone === phoneInput) found.push(orders[id]); });

        if(found.length === 0) {
            resultBox.innerHTML = `<div class="text-center text-red-500 font-bold text-xs">No orders found under this number.</div>`;
        } else {
            found.reverse().forEach(o => {
                let col = "text-amber-500 bg-amber-50 border-amber-200";
                if(o.status === "Delivered") col = "text-green-600 bg-green-50 border-green-200";
                if(o.status === "Cancelled") col = "text-red-600 bg-red-50 border-red-200";
                if(o.status === "Out for Delivery") col = "text-blue-600 bg-blue-50 border-blue-200";


                let reviewFormMarkup = "";
                // Agar order delivered hai, toh usi card ke andar feedback option do
                if(o.status === "Delivered") {
                    reviewFormMarkup = `
                        <div class="mt-4 pt-4 border-t dark:border-slate-700 space-y-3">
                            <p class="text-[11px] font-bold text-slate-500">Kaisa tha aapka garmagaram tiffin? Share your rating:</p>
                            <div class="flex gap-2 text-sm">
                                <select id="rating-score-${index}" class="border dark:border-slate-600 dark:bg-slate-700 rounded-lg p-1 text-xs font-bold">
                                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                                    <option value="3">⭐⭐⭐ (3/5)</option>
                                    <option value="2">⭐⭐ (2/5)</option>
                                    <option value="1">⭐ (1/5)</option>
                                </select>
                                <input type="text" id="rating-comment-${index}" class="flex-1 border dark:border-slate-600 dark:bg-slate-700 rounded-lg p-1 text-xs placeholder-slate-400" placeholder="Write a short review...">
                                <button onclick="submitTiffinReview('${o.customerName}', ${index})" class="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1 rounded-lg text-xs font-bold">Submit</button>
                            </div>
                        </div>`;
                }

                resultBox.innerHTML += `
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border dark:border-slate-700 shadow-md space-y-2">
                        <div class="flex justify-between items-center"><span class="font-extrabold text-xs">Order Account: ${o.customerName}</span><span class="text-[10px] uppercase font-black px-2 py-0.5 rounded border ${col}">${o.status}</span></div>
                        <p class="text-xs text-orange-500 font-bold">🍱 Pack: <span class="text-slate-600 dark:text-slate-300 font-medium">${o.notes}</span></p>
                        <p class="text-[10px] text-slate-400">📅 Updates: ${o.timestamp}</p>
                    </div>`;
            });
        }
    });
}



// Submit Customer Review Function
function submitTiffinReview(custName, index) {
    const ratingVal = document.getElementById(`rating-score-${index}`).value;
    const commentVal = document.getElementById(`rating-comment-${index}`).value.trim();

    if(!commentVal) {
        alert("⚠️ Kripya feedback mein kuch zaroor likhein!");
        return;
    }

    const reviewPayload = {
        name: custName,
        rating: parseInt(ratingVal),
        comment: commentVal,
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    database.ref('reviews').push(reviewPayload, (err) => {
        if(!err) {
            alert("🎉 Thank you! Aapka review live feed par submit ho gaya hai.");
            // Form inputs ko clear/hide karne ke liye page reload ya state refresh kar sakte hain
            document.getElementById(`rating-comment-${index}`).value = "";
        }
    });
}