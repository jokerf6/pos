import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import { getUsers, deleteUser } from "../../store/slices/usersSlice";
import DataTable from "./components/data-table.component";
import columns from "./components/columns.component";
import { useNavigate } from "react-router-dom";
import { showConfirmModal } from "../../store/slices/confirmModalSlice";
import { showSuccess } from "components/ui/sonner";
import { Button } from "../../components/ui/button";
import { Plus, Users, Shield, UserCheck } from "lucide-react";

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
      createdAt: new Date(item.created_at).toISOString().split("T")[0],
      permissions: item.permissions || [],
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

  const handleEdit = (user: any) => {
    navigate(`/users/${user.id}`);
  };

  const handleCreateUser = () => {
    navigate("/users/create");
  };

  const adminCount = users?.filter((user: any) => user.role === "admin").length || 0;
  const cashierCount = users?.filter((user: any) => user.role === "cashier").length || 0;

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6" dir="rtl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المستخدمين</h1>
            <p className="text-gray-600">إدارة وتنظيم مستخدمي النظام وصلاحياتهم</p>
          </div>
          <Button
            onClick={handleCreateUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            إضافة مستخدم جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900">{total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">المديرين</p>
                <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">الكاشيرين</p>
                <p className="text-2xl font-bold text-gray-900">{cashierCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {formattedUsers && (
          <DataTable
            columns={columns}
            data={formattedUsers}
            dataTotal={total}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}

export default UsersPage;

