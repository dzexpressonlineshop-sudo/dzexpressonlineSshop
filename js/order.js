document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    // جلب بيانات المنتج من الـ Sheet
    const product = await getProductById(productId);
    if (!product) {
        document.getElementById("productSummary").innerHTML = "<p>المنتج غير موجود!</p>";
        return;
    }

    // عرض ملخص المنتج
    const productSummary = document.getElementById("productSummary");
    productSummary.innerHTML = `
        <div class="summary-details">
            <h3>${product.name}</h3>
            <p class="price">${product.price} دج</p>
        </div>
    `;

    // تفعيل قائمة الولايات (يفترض وجود ملف wilayas.js يحتوي على القائمة)
    const selectWilaya = document.getElementById("custWilaya");
    if (typeof wilayasData !== 'undefined') {
        wilayasData.forEach(w => {
            const opt = document.createElement("option");
            opt.value = w.id;
            opt.textContent = `${w.id} - ${w.name}`;
            selectWilaya.appendChild(opt);
        });
    }

    const deliveryArea = document.getElementById("deliveryArea");
    const totalBox = document.getElementById("totalBox");
    const totalProduct = document.getElementById("totalProduct");
    const totalDelivery = document.getElementById("totalDelivery");
    const totalGrand = document.getElementById("totalGrand");

    let selectedDeliveryPrice = 0;
    let selectedDeliveryType = "";

    // عند تغيير الولاية
    selectWilaya.addEventListener("change", () => {
        const wilayaId = selectWilaya.value;
        if (!wilayaId) {
            deliveryArea.innerHTML = '<span class="hint">اختر الولاية أولاً ليظهر لك سعر التوصيل</span>';
            totalBox.style.display = "none";
            return;
        }

        const wilaya = wilayasData.find(w => w.id == wilayaId);
        deliveryArea.innerHTML = `
            <label class="radio-label">
                <input type="radio" name="delType" value="home" checked>
                <span>توصيل للمنزل (${wilaya.home_price} دج)</span>
            </label>
            <label class="radio-label">
                <input type="radio" name="delType" value="desk">
                <span>توصيل للمكتب (${wilaya.desk_price} دج)</span>
            </label>
        `;

        totalBox.style.display = "block";
        updatePrices(wilaya);

        // مراقبة تغيير طريقة التوصيل
        deliveryArea.querySelectorAll('input[name="delType"]').forEach(radio => {
            radio.addEventListener('change', () => updatePrices(wilaya));
        });
    });

    function updatePrices(wilaya) {
        const type = deliveryArea.querySelector('input[name="delType"]:checked').value;
        selectedDeliveryPrice = type === 'home' ? wilaya.home_price : wilaya.desk_price;
        selectedDeliveryType = type === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب';

        totalProduct.textContent = `${product.price} دج`;
        totalDelivery.textContent = `${selectedDeliveryPrice} دج`;
        totalGrand.textContent = `${product.price + selectedDeliveryPrice} دج`;
    }

    // إرسال الاستمارة إلى SheetDB
    const form = document.getElementById("orderForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = document.getElementById("custName").value.trim();
        const phone = document.getElementById("custPhone").value.trim();
        const wilaya = selectWilaya.value;

        // تحقق بسيط من المدخلات
        if (!name || !phone || !wilaya || !selectedDeliveryType) {
            alert("الرجاء ملء جميع الحقول المطلوبة");
            return;
        }

        const submitBtn = document.getElementById("submitBtn");
        const submitLabel = document.getElementById("submitLabel");
        submitLabel.textContent = "جاري إرسال الطلب...";
        submitBtn.disabled = true;

        const orderId = "DZ-" + Math.floor(100000 + Math.random() * 900000);

        // البيانات المتوافقة مع أعمدة صفحة orders
        const orderData = {
            "order_id": orderId,
            "product_name": product.name,
            "customer_name": name,
            "phone": phone,
            "wilaya": wilaya,
            "delivery_type": selectedDeliveryType,
            "delivery_price": selectedDeliveryPrice,
            "total_price": product.price + selectedDeliveryPrice
        };

        try {
            // الإرسال إلى SheetDB مع تحديد الصفحة ?sheet=orders
            const response = await fetch(`${CONFIG.SHEETDB_API_URL}?sheet=orders`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: [orderData] })
            });

            if (response.ok) {
                document.getElementById("orderView").classList.add("hidden");
                document.getElementById("successView").classList.remove("hidden");
                document.getElementById("orderIdDisplay").textContent = `رقم الطلبية: ${orderId}`;
            } else {
                throw new Error("حدث خطأ أثناء الإرسال");
            }
        } catch (error) {
            console.error(error);
            document.getElementById("submitError").classList.remove("hidden");
        } finally {
            submitLabel.textContent = "تأكيد الطلبية";
            submitBtn.disabled = false;
        }
    });
});
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
