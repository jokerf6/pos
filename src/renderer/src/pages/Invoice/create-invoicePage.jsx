import React, { useEffect, useRef, useState } from "react";
import Modal from "../../components/common/dynamic-modal.component";

export default function CreateInvoicePage() {
  const searchInputRef = useRef(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  const [openPrint, setOpenPrint] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "enter") {
        e.preventDefault();
        if (searchValue.trim().length > 0 && openPrint === false) {
          addProduct();
        } else if (openPrint === false) {
          console.log(openPrint);
          console.log("No product to add");
          handleSubmit();
        } else {
          setOpenPrint(false);
          console.log("Closing print modal");
          console.log(searchInputRef);
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 100);
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPrint]);

  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [invoiceDetails, setInvoiceDetails] = useState({
    customerName: "",
    customerPhone: "",
    journal: "",
    date: new Date().toISOString().slice(0, 10),
    paymentType: "خالص",
    invoiceDiscount: 0,
  });

  const addProduct = () => {
    if (!searchValue.trim()) return;
    const newProduct = {
      id: Date.now(),
      name: searchValue,
      quantity: 1,
      price: 100,
      discount: 0,
    };
    setProducts([...products, newProduct]);
    setSearchValue("");
    searchInputRef.current.focus();
  };

  const updateProduct = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: Number(value) || 0 } : p))
    );
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const calculateRowTotal = (product) =>
    product.quantity * product.price - product.discount;

  const total = products.reduce((sum, p) => sum + calculateRowTotal(p), 0);

  const netTotal = total - invoiceDetails.invoiceDiscount;

  const handleSubmit = () => {
    const invoice = {
      ...invoiceDetails,
      products,
      total,
      netTotal,
    };
    setOpenPrint(true);
    console.log("Invoice Submitted:", invoice);
    // Send to API or DB here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4 flex justify-between flex-col  h-full">
      <Modal
        open={openPrint}
        onClose={() => {
          setOpenPrint(false);
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 100);
          searchInputRef.current?.focus();
        }}
        onConfirm={() => {
          // handelPrint();
          // setOpenPrint(false);
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 100);
          searchInputRef.current?.focus();
        }}
        title="طباعة الفاتورة"
        confirmLabel="طباعة"
        cancelLabel="إلغاء"
      >
        <div></div>
      </Modal>
      {/* Search/Add Product */}
      <div className=" flex gap-1 flex-col">
        <div className="flex gap-2">
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            placeholder="اسم المنتج أو الباركود"
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={addProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            إضافة
          </button>
        </div>

        {/* Products Table */}
        <table className="w-full border">
          <thead className="bg-gray-100 text-center">
            <tr>
              <th>اسم المنتج</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الخصم</th>
              <th>الإجمالي</th>
              <th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="text-center">
                <td>{p.name}</td>
                <td>
                  <input
                    type="number"
                    value={p.quantity}
                    onChange={(e) =>
                      updateProduct(p.id, "quantity", e.target.value)
                    }
                    className="w-16 p-1 border text-center"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) =>
                      updateProduct(p.id, "price", e.target.value)
                    }
                    className="w-20 p-1 border text-center"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={p.discount}
                    onChange={(e) =>
                      updateProduct(p.id, "discount", e.target.value)
                    }
                    className="w-20 p-1 border text-center"
                  />
                </td>
                <td>{calculateRowTotal(p).toFixed(2)} ج</td>
                <td>
                  <button onClick={() => removeProduct(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Invoice Details */}
      <div>
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <input
            type="text"
            placeholder="اسم العميل"
            value={invoiceDetails.customerName}
            onChange={(e) =>
              setInvoiceDetails({
                ...invoiceDetails,
                customerName: e.target.value,
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="رقم تليفون العميل"
            value={invoiceDetails.customerPhone}
            onChange={(e) =>
              setInvoiceDetails({
                ...invoiceDetails,
                customerPhone: e.target.value,
              })
            }
            className="p-2 border rounded"
          />
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentType"
                value="خالص"
                checked={invoiceDetails.paymentType === "خالص"}
                onChange={(e) =>
                  setInvoiceDetails({
                    ...invoiceDetails,
                    paymentType: e.target.value,
                  })
                }
              />
              خالص
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentType"
                value="أجل"
                checked={invoiceDetails.paymentType === "أجل"}
                onChange={(e) =>
                  setInvoiceDetails({
                    ...invoiceDetails,
                    paymentType: e.target.value,
                  })
                }
              />
              أجل
            </label>
          </div>
          <div className="text-right space-y-1">
            <div>الإجمالي: {total.toFixed(2)} ج</div>
            <div>
              الخصم:{" "}
              <input
                type="number"
                value={invoiceDetails.invoiceDiscount}
                onChange={(e) =>
                  setInvoiceDetails({
                    ...invoiceDetails,
                    invoiceDiscount: Number(e.target.value) || 0,
                  })
                }
                className="p-1 border w-24 text-right"
              />{" "}
              ج
            </div>
            <div>الصافي: {netTotal.toFixed(2)} ج</div>
          </div>
        </div>

        <div className="text-center w-full">
          <button
            onClick={handleSubmit}
            className="bg-green-600 w-full text-white px-6 py-2 rounded mt-4"
          >
            حفظ الفاتورة
          </button>
        </div>
      </div>
    </div>
  );
}
