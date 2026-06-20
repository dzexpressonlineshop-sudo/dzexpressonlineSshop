document.addEventListener("DOMContentLoaded", async () => {
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) return;

    productGrid.innerHTML = '<p class="loading">جاري تحميل المنتجات...</p>';

    const products = await fetchProducts();

    if (products.length === 0) {
        productGrid.innerHTML = '<p class="error-msg">لا توجد منتجات حالياً أو حدث خطأ في التحميل.</p>';
        return;
    }

    productGrid.innerHTML = ""; // تنظيف رسالة التحميل

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        // التحقق من وجود صورة أو وضع أيقونة افتراضية
        const imgHtml = product.image 
            ? `<img src="${product.image}" alt="${product.name}" class="product-img">`
            : `<div class="product-img-placeholder">📦</div>`;

        card.innerHTML = `
            ${imgHtml}
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description || ''}</p>
                <div class="product-meta">
                    <span class="product-price">${product.price} دج</span>
                    <a href="order.html?id=${product.id}" class="btn btn-gold">اطلب الآن</a>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
});
