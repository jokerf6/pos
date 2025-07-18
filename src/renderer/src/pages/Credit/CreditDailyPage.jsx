import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showConfirmModal } from "../../store/slices/confirmModalSlice";
import { showSuccess } from "../../components/ui/sonner";
import columns from "./components/columns.component";
import DataDailyTable from "./components/data-table.daily.component";
import { deleteCredit, CreditByDaily } from "../../store/slices/creditSlice";
import { formatDate } from "../../utils/formDate";
function CreditPage() {
  const dispatch = useDispatch();
  const { dailyCredits, total } = useSelector((state) => state.credit);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(CreditByDaily());
  }, [dispatch]);

  const formattedProducts =
    dailyCredits &&
    dailyCredits?.map((item) => ({
      ...item,
      createdAt: formatDate(item.created_at), // Format date to YYYY-MM-DD
    }));
  console.log("formattedCredits", dailyCredits);
  const handleDelete = (item) => {
    dispatch(
      showConfirmModal({
        itemLabel: item.reason,
        onConfirm: () => {
          dispatch(deleteCredit(item.id))
            .unwrap()
            .then(() => {
              showSuccess("تم حذف المصروف بنجاح");
              dispatch(CreditByDaily());
            })
            .catch(() => showSuccess("فشل حذف المصروف"));
        },
      })
    );
  };

  return (
    <div className="flex flex-1 h-[85vh] ">
      {formattedProducts && (
        <DataDailyTable
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
