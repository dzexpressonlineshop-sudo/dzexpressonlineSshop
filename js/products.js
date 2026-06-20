// دالة جلب المنتجات من SheetDB مع معالجة الكاش والخطأ المباشر
async function fetchProducts() {
    try {
        // نستخدم رابط الـ API ونحدد صفحة product بدقة مع إضافة عشوائية لمنع كاش المتصفح
        const response = await fetch(`${CONFIG.SHEETDB_API_URL}?sheet=product&_nocache=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`تعذر الاتصال بـ SheetDB: ${response.status}`);
        }

        const products = await response.json();

        // في حال كانت الصيغة راجعة بداخل كائن يحتوي على داتا أو مصفوفة مباشرة
        const items = Array.isArray(products) ? products : (products.data || []);

        // تحويل الأسعار وتجهيز البيانات
        return items.map(p => ({
            id: p.id ? String(p.id).trim() : "",
            name: p.name ? String(p.name).trim() : "منتج بدون اسم",
            price: parseFloat(p.price) || 0,
            description: p.description || "",
            image: p.image || ""
        })).filter(p => p.id !== ""); // تصفية السطور الفارغة تماماً
        
    } catch (error) {
        console.error("حدث خطأ أثناء جلب المنتجات:", error);
        return [];
    }
}

// دالة جلب منتج واحد بواسطة الـ ID الخاص به لصفحة الدفع
async function getProductById(id) {
    const products = await fetchProducts();
    return products.find(p => p.id === String(id).trim());
}
