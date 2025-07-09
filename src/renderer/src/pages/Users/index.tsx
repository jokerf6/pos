import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUsers } from "../../store/slices/usersSlice";
import DataTable from "./components/data-table.component";
import columns from "./components/columns.component";
import { useNavigate } from "react-router-dom";

import { showConfirmModal } from "../../store/slices/confirmModalSlice";
function UsersPage() {
  const dispatch = useDispatch();
  const { users } = useSelector((state: any) => state.users);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const formattedUsers =
    users &&
    users?.users?.map((item) => ({
      ...item,
      createdAt: new Date(item.created_at).toISOString().split("T")[0], // Format date to YYYY-MM-DD
    }));

  const handleDelete = (user: any) => {
    dispatch(
      showConfirmModal({
        itemLabel: user.username,
        onConfirm: () => {
          // dispatch(deleteUser(user.id))
          //   .unwrap()
          //   .then(() => toast.success("تم حذف المستخدم بنجاح"))
          //   .catch(() => toast.error("فشل حذف المستخدم"));
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
          onDelete={handleDelete}
          onEdit={handelEdit}
        />
      )}
    </div>
  );
}

export default UsersPage;
