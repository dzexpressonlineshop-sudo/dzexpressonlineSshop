// دالة لجلب المنتجات من صفحة product في Google Sheet عبر SheetDB
async function fetchProducts() {
    try {
        const response = await fetch(`${CONFIG.SHEETDB_API_URL}?sheet=product`);
        if (!response.ok) throw new Error("فشل في جلب المنتجات");
        const products = await response.json();
        
        // تحويل الأسعار إلى أرقام للتأكد من الحسابات لاحقاً
        return products.map(p => ({
            ...p,
            price: parseFloat(p.price) || 0
        }));
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

// دالة للحصول على منتج واحد بـ ID (تُستخدم في صفحة الطلب)
async function getProductById(id) {
    const products = await fetchProducts();
    return products.find(p => p.id == id);
}
