import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store"; // <-- import your AppDispatch type

import { showConfirmModal } from "../../store/slices/confirmModalSlice";
import { showError, showSuccess } from "components/ui/sonner";
import { deleteUnit, getAll } from "store/slices/unitSlice";
import columns from "./components/columns.component";
import DataTable from "./components/data-table.component";
function UnitsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { units, total } = useSelector((state: any) => state.units);

  useEffect(() => {
    dispatch(getAll({}));
  }, [dispatch]);

  const formattedUnits =
    units &&
    units?.map((item: any) => ({
      ...item,
      createdAt: new Date(item.created_at).toISOString().split("T")[0], // Format date to YYYY-MM-DD
    }));

  const handleDelete = (unit: any) => {
    if(unit.is_default){
      showError("لا يمكن حذف الوحدة الافتراضية")
      return;
    }
    dispatch(
      showConfirmModal({
        itemLabel: unit.name,
        onConfirm: () => {
          dispatch(deleteUnit(unit.id))
            .unwrap()
            .then(() => {
              showSuccess("تم حذف الوحدة بنجاح");
              dispatch(getAll({}));
            })
            .catch(() => showSuccess("فشل حذف المستخدم"));
        },
      })
    );
  };
  return (
    <div className="flex flex-1 h-[85vh] ">
     {/* <pre>{JSON.stringify(formattedUnits, null, 2)}</pre> */}
      {formattedUnits && (
        <DataTable
          columns={columns}
          data={formattedUnits}
          dataTotal={total}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default UnitsPage;
