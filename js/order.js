document.addEventListener("DOMContentLoaded", async () => {
  // 1. استخراج معرف المنتج من الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = 'index.html';
    return;
  }

  // جلب المنتجات للتأكد والعثور على المنتج المطلوب
  const allProducts = await fetchProducts();
  const product = allProducts.find(p => p.id == productId);

  if (!product) {
    alert("المنتج غير موجود!");
    window.location.href = 'index.html';
    return;
  }

  // عرض ملخص المنتج
  const productSummary = document.getElementById("productSummary");
  if (productSummary) {
    productSummary.innerHTML = `
      <h3>${product.name}</h3>
      <p style="font-weight: bold; color: #b89345; font-size: 1.2rem;">${product.price} دج</p>
    `;
  }

  // إعدادات الولايات والتوصيل (تعتمد على ملف wilayas.js الأصلي لديك)
  const wilayaSelect = document.getElementById("custWilaya");
  const deliveryArea = document.getElementById("deliveryArea");
  const totalBox = document.getElementById("totalBox");
  const totalProduct = document.getElementById("totalProduct");
  const totalDelivery = document.getElementById("totalDelivery");
  const totalGrand = document.getElementById("totalGrand");
  
  let selectedDeliveryPrice = 0;

  // ملء قائمة الولايات
  if (typeof wilayas !== 'undefined' && wilayaSelect) {
    wilayas.forEach(w => {
      const opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = `${w.id} - ${w.name}`;
      wilayaSelect.appendChild(opt);
    });
  }

  // عند تغيير الولاية
  wilayaSelect?.addEventListener("change", () => {
    const wId = parseInt(wilayaSelect.value);
    const wilayaData = wilayas.find(w => w.id === wId);

    if (!wilayaData) {
      deliveryArea.innerHTML = '<span class="hint">اختر الولاية أولاً ليظهر لك سعر التوصيل</span>';
      totalBox.style.display = "none";
      return;
    }

    // بناء خيارات التوصيل (مكتب أو بيت)
    deliveryArea.innerHTML = `
      <label class="delivery-opt">
        <input type="radio" name="delType" value="home" checked>
        البيت (${wilayaData.home} دج)
      </label>
      ${wilayaData.desk ? `
      <label class="delivery-opt">
        <input type="radio" name="delType" value="desk">
        المكتب (${wilayaData.desk} دج)
      </label>` : ''}
    `;

    totalBox.style.display = "block";
    updatePrices(wilayaData);

    // عند تغيير طريقة التوصيل
    deliveryArea.querySelectorAll('input[name="delType"]').forEach(radio => {
      radio.addEventListener('change', () => updatePrices(wilayaData));
    });
  });

  function updatePrices(wilayaData) {
    const checkedOpt = deliveryArea.querySelector('input[name="delType"]:checked').value;
    selectedDeliveryPrice = checkedOpt === 'home' ? wilayaData.home : wilayaData.desk;

    totalProduct.textContent = `${product.price} دج`;
    totalDelivery.textContent = `${selectedDeliveryPrice} دج`;
    totalGrand.textContent = `${product.price + selectedDeliveryPrice} دج`;
  }

  // 2. معالجة إرسال الفورم إلى SheetDB
  const orderForm = document.getElementById("orderForm");
  const submitBtn = document.getElementById("submitBtn");
  const submitLabel = document.getElementById("submitLabel");
  const submitError = document.getElementById("submitError");
  const orderView = document.getElementById("orderView");
  const successView = document.getElementById("successView");
  const orderIdDisplay = document.getElementById("orderIdDisplay");

  orderForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitError.classList.add("hidden");

    // التحقق البسيط من الحقول
    const custName = document.getElementById("custName").value.trim();
    const custPhone = document.getElementById("custPhone").value.trim();
    const custWilaya = wilayaSelect.options[wilayaSelect.selectedIndex].text;
    const delTypeInput = deliveryArea.querySelector('input[name="delType"]:checked');

    if (!custName || !custPhone || wilayaSelect.value === "" || !delTypeInput) {
      alert("الرجاء ملء جميع الحقول المطلوبة واختيار طريقة التوصيل");
      return;
    }

    const deliveryType = delTypeInput.value === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب';
    const finalTotal = product.price + selectedDeliveryPrice;
    const generatedOrderId = "DZ-" + Math.floor(100000 + Math.random() * 900000);

    // تجهيز البيانات لـ SheetDB
    const orderData = {
      data: [{
        order_id: generatedOrderId,
        custName: custName,
        custPhone: custPhone,
        custWilaya: custWilaya,
        deliveryType: deliveryType,
        productName: product.name,
        totalGrand: `${finalTotal} دج`,
        date: new Date().toLocaleString('ar-DZ')
      }]
    };

    // تغيير حالة الزر أثناء الإرسال
    submitBtn.disabled = true;
    submitLabel.textContent = "جاري إرسال الطلب...";

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}?sheet=${CONFIG.ORDERS_TAB}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error("خطأ في الشبكة");

      // نجاح الإرسال
      orderView.classList.add("hidden");
      successView.classList.remove("hidden");
      if (orderIdDisplay) orderIdDisplay.textContent = `رقم الطلب: ${generatedOrderId}`;
      
    } catch (error) {
      console.error(error);
      submitError.classList.remove("hidden");
      submitBtn.disabled = false;
      submitLabel.textContent = "تأكيد الطلبية";
    }
  });
});
