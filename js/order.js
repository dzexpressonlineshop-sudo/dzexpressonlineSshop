document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    // 1. إظهار الولايات فوراً بدون انتظار الجلب من الـ API لضمان عدم اختفائها
    const selectWilaya = document.getElementById("custWilaya");
    if (selectWilaya && typeof wilayasData !== 'undefined') {
        selectWilaya.innerHTML = '<option value="">اختر ولايتك</option>';
        wilayasData.forEach(w => {
            const opt = document.createElement("option");
            opt.value = w.id;
            opt.textContent = `${w.id} - ${w.name}`;
            selectWilaya.appendChild(opt);
        });
    }

    // 2. جلب المنتج وعرضه
    let product = null;
    try {
        // جلب مباشر من الـ API لضمان الأمان وعدم حدوث تضارب
        const response = await fetch(`https://sheetdb.io/api/v1/u2bi74veb32hq?sheet=product`);
        const products = await response.json();
        product = products.find(p => String(p.id).trim() === String(productId).trim());
    } catch (err) {
        console.error("Failed to load product", err);
    }

    if (!product) {
        const summary = document.getElementById("productSummary");
        if (summary) summary.innerHTML = "<p style='color:red; text-align:center; padding:10px;'>خطأ: تعذر تحميل بيانات المنتج، يرجى تحديث الصفحة.</p>";
        return;
    }

    // عرض ملخص المنتج
    const productSummary = document.getElementById("productSummary");
    if (productSummary) {
        productSummary.innerHTML = `
            <div class="summary-details">
                <h3>${product.name}</h3>
                <p class="price">${product.price} دج</p>
            </div>
        `;
    }

    const deliveryArea = document.getElementById("deliveryArea");
    const totalBox = document.getElementById("totalBox");
    const totalProduct = document.getElementById("totalProduct");
    const totalDelivery = document.getElementById("totalDelivery");
    const totalGrand = document.getElementById("totalGrand");

    let selectedDeliveryPrice = 0;
    let selectedDeliveryType = "";

    // منطق حساب أسعار التوصيل عند اختيار الولاية
    if (selectWilaya) {
        selectWilaya.addEventListener("change", () => {
            const wilayaId = selectWilaya.value;
            if (!wilayaId) {
                if (deliveryArea) deliveryArea.innerHTML = '<span class="hint">اختر الولاية أولاً ليظهر لك سعر التوصيل</span>';
                if (totalBox) totalBox.style.display = "none";
                return;
            }

            const wilaya = wilayasData.find(w => w.id == wilayaId);
            if (!wilaya) return;

            if (deliveryArea) {
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
            }

            if (totalBox) totalBox.style.display = "block";
            updatePrices(wilaya);

            deliveryArea.querySelectorAll('input[name="delType"]').forEach(radio => {
                radio.addEventListener('change', () => updatePrices(wilaya));
            });
        });
    }

    function updatePrices(wilaya) {
        const checkedRadio = deliveryArea.querySelector('input[name="delType"]:checked');
        if (!checkedRadio) return;
        
        const type = checkedRadio.value;
        selectedDeliveryPrice = type === 'home' ? parseFloat(wilaya.home_price) : parseFloat(wilaya.desk_price);
        selectedDeliveryType = type === 'home' ? 'توصيل للمنزل' : 'توصيل للمكتب';

        const pPrice = parseFloat(product.price) || 0;

        if (totalProduct) totalProduct.textContent = `${pPrice} دج`;
        if (totalDelivery) totalDelivery.textContent = `${selectedDeliveryPrice} دج`;
        if (totalGrand) totalGrand.textContent = `${pPrice + selectedDeliveryPrice} دج`;
    }

    // إرسال الطلبية إلى صفحة orders في SheetDB
    const form = document.getElementById("orderForm");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const name = document.getElementById("custName").value.trim();
            const phone = document.getElementById("custPhone").value.trim();
            const wilaya = selectWilaya.value;

            if (!name || !phone || !wilaya || !selectedDeliveryType) {
                alert("الرجاء ملء جميع الحقول المطلوبة واختيار طريقة التوصيل");
                return;
            }

            const submitBtn = document.getElementById("submitBtn");
            const submitLabel = document.getElementById("submitLabel");
            if (submitLabel) submitLabel.textContent = "جاري إرسال الطلب...";
            if (submitBtn) submitBtn.disabled = true;

            const orderId = "DZ-" + Math.floor(100000 + Math.random() * 900000);
            const pPrice = parseFloat(product.price) || 0;

            const orderData = {
                "order_id": orderId,
                "product_name": product.name,
                "customer_name": name,
                "phone": phone,
                "wilaya": wilaya,
                "delivery_type": selectedDeliveryType,
                "delivery_price": selectedDeliveryPrice,
                "total_price": pPrice + selectedDeliveryPrice
            };

            try {
                const response = await fetch(`https://sheetdb.io/api/v1/u2bi74veb32hq?sheet=orders`, {
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
                    throw new Error("error");
                }
            } catch (error) {
                const submitError = document.getElementById("submitError");
                if (submitError) submitError.classList.remove("hidden");
            } finally {
                if (submitLabel) submitLabel.textContent = "تأكيد الطلبية";
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});
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
