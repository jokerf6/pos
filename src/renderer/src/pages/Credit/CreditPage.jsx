import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showConfirmModal } from "../../store/slices/confirmModalSlice";
import { showSuccess } from "../../components/ui/sonner";
import columns from "./components/columns.component";
import DataTable from "./components/data-table.component";
import { deleteCredit, getCredit } from "../../store/slices/creditSlice";
import { formatDate } from "../../utils/formDate";
function CreditPage() {
  const dispatch = useDispatch();
  const { credits, total } = useSelector((state) => state.credit);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCredit());
  }, [dispatch]);

  const formattedProducts =
    credits &&
    credits?.map((item) => ({
      ...item,
      createdAt: formatDate(item.created_at), // Format date to YYYY-MM-DD
    }));
  console.log("formattedCredits", credits);
  const handleDelete = (item) => {
    dispatch(
      showConfirmModal({
        itemLabel: item.reason,
        onConfirm: () => {
          dispatch(deleteCredit(item.id))
            .unwrap()
            .then(() => {
              showSuccess("تم حذف المصروف بنجاح");
              dispatch(getCredit());
            })
            .catch(() => showSuccess("فشل حذف المصروف"));
        },
      })
    );
  };

  return (
    <div className="flex flex-1 h-[85vh] ">
      {formattedProducts && (
        <DataTable
          columns={columns}
          data={formattedProducts}
          dataTotal={total}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default CreditPage;
