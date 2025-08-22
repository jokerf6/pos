import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store"; // <-- import your AppDispatch type
import DataTable from "./components/data-table.component";
import columns from "./components/columns.component";
import { useNavigate } from "react-router-dom";

import { showConfirmModal } from "../../store/slices/confirmModalSlice";
import { showSuccess } from "components/ui/sonner";
import { deleteBranch, getBranches } from "store/slices/branchesSlice";
function BranchesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { branches, total } = useSelector((state: any) => state.branches);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getBranches({}));
  }, [dispatch]);

  const formattedBranches =
    branches &&
    branches?.map((item: any) => ({
      ...item,
      createdAt: new Date(item.created_at).toISOString().split("T")[0], // Format date to YYYY-MM-DD
    }));

  const handleDelete = (branch: any) => {
    dispatch(
      showConfirmModal({
        itemLabel: branch.name,
        onConfirm: () => {
          dispatch(deleteBranch(branch.id))
            .unwrap()
            .then(() => {
              showSuccess("تم حذف الفرع بنجاح");
              dispatch(getBranches({}));
            })
            .catch(() => showSuccess("فشل حذف المستخدم"));
        },
      })
    );
  };
  return (
    <div className="flex flex-1 h-[85vh] ">
     {/* <pre>{JSON.stringify(formattedBranches, null, 2)}</pre> */}
      {formattedBranches && (
        <DataTable
          columns={columns}
          data={formattedBranches}
          dataTotal={total}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default BranchesPage;
