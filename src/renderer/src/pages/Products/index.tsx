import { useEffect, useMemo } from "react";
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
const { selectedBranch } = useSelector((state: any) => state.branches);

  useEffect(() => {
    dispatch(getProducts({}) as any);
  }, [dispatch, selectedBranch]);
const formattedProducts = useMemo(() => {
  return products?.map((item: any) => ({
    ...item,
    createdAt: new Date(item.created_at).toISOString().split("T")[0],
  }));
}, [products]);
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
  const handelInfo = (item: any) => {
    navigate(`/products/statistics/${item.id}`);

  }
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-gray-50">
      {formattedProducts && (
        <DataTable
          columns={columns}
          data={formattedProducts}
          dataTotal={total}
          // onDelete={handleDelete}
          onEdit={handelEdit}
          onInfo={handelInfo}
        />
      )}

    </div>
  );
}

export default ProductsPage;
