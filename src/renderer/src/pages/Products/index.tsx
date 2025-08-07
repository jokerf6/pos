import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../store/slices/productsSlice";
import { showConfirmModal } from "../../store/slices/confirmModalSlice";
import { showSuccess } from "../../components/ui/sonner";
import columns from "./components/columns.component";
import DataTable from "./components/data-table.component";
function ProductsPage() {
  const dispatch = useDispatch();
  const { products, total } = useSelector((state: any) => state.products);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getProducts({}) as any);
  }, [dispatch]);

  const formattedProducts =
    products &&
    products?.map((item: any) => ({
      ...item,
      createdAt: new Date(item.created_at).toISOString().split("T")[0], // Format date to YYYY-MM-DD
    }));

  const handleDelete = (product: { id: number; name: string }) => {
    dispatch(
      showConfirmModal({
        itemLabel: product.name,
        onConfirm: () => {
          dispatch(deleteProduct(product.id) as any)
            .unwrap()
            .then(() => {
              showSuccess("تم حذف المنتج بنجاح");
              dispatch(getProducts({}) as any);
            })
            .catch(() => showSuccess("فشل حذف المنتج"));
        },
      })
    );
  };
  const handelEdit = (item: any) => {
    navigate(`/products/${item.barcode}`);
  };
  return (
    <div className="flex flex-1 min-h-screen bg-gray-50">
      {formattedProducts && (
        <DataTable
          columns={columns}
          data={formattedProducts}
          dataTotal={total}
          onDelete={handleDelete}
          onEdit={handelEdit}
        />
      )}
    </div>
  );
}

export default ProductsPage;
