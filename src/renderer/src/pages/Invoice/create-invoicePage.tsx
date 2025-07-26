import { ArrowLeft, ArrowRight, PlusCircle, Printer } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../components/common/dynamic-modal.component";
import { Button } from "../../components/ui/button";

interface InvoiceHeaderProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoBefore: boolean;
  onNewInvoice: () => void;
}

interface CustomerDetailsProps {
  details: InvoiceDetails;
  handleDetailChange: (field: string, value: string | number) => void;
  isReadOnly: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  [key: string]: any;
}

interface InvoiceDetails {
  customerName: string;
  customerPhone: string;
  paymentType: string;
  invoiceDiscount: number;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  onPrevious,
  onNext,
  canGoBefore,
  onNewInvoice,
}) => (
  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm">
    <Button onClick={onPrevious} disabled={!canGoBefore} variant="outline">
      <ArrowLeft className="mr-2 h-4 w-4" /> فاتورة سابقة
    </Button>
    <Button onClick={onNewInvoice} variant="default">
      <PlusCircle className="mr-2 h-4 w-4" /> فاتورة جديدة
    </Button>
    <Button onClick={onNext} variant="outline">
      فاتورة تالية <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
);

const CustomerDetailsSection: React.FC<CustomerDetailsProps> = ({
  details,
  handleDetailChange,
  isReadOnly,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <input
        type="text"
        placeholder="اسم العميل (اختياري)"
        value={details.customerName}
        onChange={(e) => handleDetailChange("customerName", e.target.value)}
        className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 read-only:bg-gray-100 read-only:cursor-not-allowed"
        readOnly={isReadOnly}
      />
      <input
        type="text"
        placeholder="رقم هاتف العميل (اختياري)"
        value={details.customerPhone}
        onChange={(e) => handleDetailChange("customerPhone", e.target.value)}
        className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 read-only:bg-gray-100 read-only:cursor-not-allowed"
        readOnly={isReadOnly}
      />
    </div>
  );
};

const CreateInvoicePage: React.FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [openPrint, setOpenPrint] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    customerName: "",
    customerPhone: "",
    paymentType: "خالص",
    invoiceDiscount: 0,
  });

  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [isViewingArchived, setIsViewingArchived] = useState(false);
  const [isInvoiceCreated, setIsInvoiceCreated] = useState(false);
  const [canGoBefore, setCanGoBefore] = useState(true);

  const focusSearchInput = () => {
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    focusSearchInput();
  }, []);

  const resetInvoice = useCallback(() => {
    setProducts([]);
    setInvoiceDetails({
      customerName: "",
      customerPhone: "",
      paymentType: "خالص",
      invoiceDiscount: 0,
    });
    setCurrentInvoiceId(null);
    setIsViewingArchived(false);
    setIsInvoiceCreated(false);
    focusSearchInput();
  }, []);

  const handleDetailChange = (field: string, value: string | number) => {
    setInvoiceDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add more methods as needed for the full functionality
  // This is a simplified version to get TypeScript conversion started

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <InvoiceHeader
        onPrevious={() => {
          /* implement */
        }}
        onNext={() => {
          /* implement */
        }}
        canGoBefore={canGoBefore}
        onNewInvoice={resetInvoice}
      />

      <CustomerDetailsSection
        details={invoiceDetails}
        handleDetailChange={handleDetailChange}
        isReadOnly={isViewingArchived}
      />

      {/* Search input */}
      <div className="mb-4">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="ابحث عن منتج..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Products table would go here */}
      <div className="min-h-[400px] border rounded-lg p-4">
        <p className="text-center text-gray-500">
          يتم عرض المنتجات والفاتورة هنا
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={() => setOpenPrint(true)} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          طباعة
        </Button>
        <Button onClick={resetInvoice} variant="default">
          حفظ الفاتورة
        </Button>
      </div>

      {/* Print Modal */}
      <Modal
        onConfirm={() => {}}
        open={openPrint}
        onClose={() => setOpenPrint(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">طباعة الفاتورة</h3>
          <p className="text-gray-600">سيتم طباعة الفاتورة...</p>
        </div>
      </Modal>
    </div>
  );
};

export default CreateInvoicePage;
