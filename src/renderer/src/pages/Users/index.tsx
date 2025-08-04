import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store"; // <-- import your AppDispatch type
import { getUsers, deleteUser } from "../../store/slices/usersSlice";
import DataTable from "./components/data-table.component";
import columns from "./components/columns.component";
import { useNavigate } from "react-router-dom";

import { showConfirmModal } from "../../store/slices/confirmModalSlice";
import { showSuccess } from "components/ui/sonner";
function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, total } = useSelector((state: any) => state.users);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUsers({}));
  }, [dispatch]);

  const formattedUsers =
    users &&
    users?.map((item: any) => ({
      ...item,
      createdAt: new Date(item.created_at).toISOString().split("T")[0], // Format date to YYYY-MM-DD
    }));

  const handleDelete = (user: any) => {
    dispatch(
      showConfirmModal({
        itemLabel: user.username,
        onConfirm: () => {
          dispatch(deleteUser(user.id))
            .unwrap()
            .then(() => {
              showSuccess("تم حذف المستخدم بنجاح");
              dispatch(getUsers({}));
            })
            .catch(() => showSuccess("فشل حذف المستخدم"));
        },
      })
    );
  };
  const handelEdit = (user: any) => {
    navigate(`/users/${user.id}`);
  };
  return (
    <div className="flex flex-1 h-[85vh] ">
      {formattedUsers && (
        <DataTable
          columns={columns}
          data={formattedUsers}
          dataTotal={total}
          onDelete={handleDelete}
          onEdit={handelEdit}
        />
      )}
    </div>
  );
}

export default UsersPage;
