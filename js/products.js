// دالة أساسية لجلب المنتجات من SheetDB مباشرة
async function fetchProducts() {
    try {
        const response = await fetch(`https://sheetdb.io/api/v1/u2bi74veb32hq?sheet=product&_nocache=${Date.now()}`);
        if (!response.ok) throw new Error("خطأ في الاتصال بالخادم");
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

// دالة لجلب منتج واحد بواسطة الـ ID الخاص به
async function getProductById(id) {
    try {
        const products = await fetchProducts();
        return products.find(p => String(p.id).trim() === String(id).trim());
    } catch (e) {
        return null;
    }
}
}
