document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.getElementById("productGrid");
  if (!productGrid) return;

  // إظهار رسالة جاري التحميل
  productGrid.innerHTML = '<p class="loading-text" style="grid-column: 1/-1; text-align: center; padding: 40px; font-weight: bold;">جاري تحميل المنتجات...</p>';

  // جلب المنتجات من الجوجل شيت
  const fetchedProducts = await fetchProducts();

  if (fetchedProducts.length === 0) {
    productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">عذراً، لا توجد منتجات متوفرة حالياً.</p>';
    return;
  }

  // تنظيف مكان العرض واضافة المنتجات
  productGrid.innerHTML = "";
  
  fetchedProducts.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    // التحقق من وجود صورة أو وضع أيقونة افتراضية
    const imgHtml = product.image 
      ? `<img src="${product.image}" alt="${product.name}" class="product-img">`
      : `<div class="product-img-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div>`;

    card.innerHTML = `
      ${imgHtml}
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-meta">
          <span class="product-price">${product.price} دج</span>
          <a href="order.html?id=${product.id}" class="btn btn-gold btn-sm">اطلب الآن</a>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
});
document.addEventListener('DOMContentLoaded', renderProducts);
