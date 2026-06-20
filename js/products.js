// مصفوفة المنتجات ستكون فارغة في البداية ويتم ملؤها من السيرفر
let products = [];

// دالة لجلب المنتجات من صفحة Product في الجوجل شيت عبر SheetDB
async function fetchProducts() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}?sheet=${CONFIG.PRODUCTS_TAB}`);
    if (!response.ok) throw new Error("فشل في جلب المنتجات");
    
    const data = await response.json();
    
    // تحويل الأسعار إلى أرقام للتأكد من الحسابات الصحيحة
    products = data.map(p => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price) || 0,
      description: p.description || "",
      image: p.image || ""
    }));
    
    return products;
  } catch (error) {
    console.error("خطأ في جلب المنتجات:", error);
    return [];
  }
}
];
