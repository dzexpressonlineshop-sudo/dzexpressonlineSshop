document.addEventListener("DOMContentLoaded", async () => {
    const productGrid = document.getElementById("productGrid");

    if (!productGrid) return;

    productGrid.innerHTML = '<p class="loading">جاري تحميل المنتجات...</p>';

    // جلب المنتجات باستخدام الدالة المعرفة في products.js
    const products = await fetchProducts();

    if (products.length === 0) {
        productGrid.innerHTML = '<p class="error-msg">لا توجد منتجات معروضة حالياً أو حدث خطأ في الاتصال.</p>';
        return;
    }

    productGrid.innerHTML = ""; // تنظيف رسالة التحميل

    // توليد المنتجات ديناميكياً
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        // التأكد من وجود رابط الصورة أو وضع صورة افتراضية
        const imgSrc = product.image ? product.image.trim() : "assets/logo.png";

        card.innerHTML = `
            <div class="product-img-box">
                <img src="${imgSrc}" alt="${product.name}" onerror="this.src='assets/logo.png'">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="description">${product.description || ''}</p>
                <div class="product-meta">
                    <span class="price">${product.price} دج</span>
                    <a href="order.html?id=${product.id}" class="btn btn-gold">اطلب الآن</a>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
});
