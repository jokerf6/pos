import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCategories,
  deleteCategory,
} from "../../store/slices/categoriesSlice"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom";
import { showConfirmModal } from "../../store/slices/confirmModalSlice";
import { showSuccess } from "../../components/ui/sonner";
import columns from "./components/columns.component";
import DataTable from "./components/data-table.component";
function CategoriesPage() {
  const dispatch = useDispatch();
  const categories = useSelector((state: any) => state.categories);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCategories() as any);
    console.log("categories", categories);
  }, [dispatch]);

  const formattedCategories =
    (categories &&
      categories.categories?.map((item: any) => ({
        ...item,
        created_at: item.created_at?.toString(), // أو `.toISOString()`
      }))) ||
    [];
  const handleDelete = (item: any) => {
    dispatch(
      showConfirmModal({
        itemLabel: item.name,
        onConfirm: () => {
          dispatch(deleteCategory(item.id) as any)
            .unwrap()
            .then(() => {
              showSuccess("تم حذف القسم بنجاح");
              dispatch(getCategories() as any);
            })
            .catch(() => showSuccess("فشل حذف المستخدم"));
        },
      })
    );
  };
  const handelEdit = (item: any) => {
    navigate(`/categories/${item.id}`);
  };
     useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+") {
        e.preventDefault();
        navigate("/categories/create");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className="flex flex-1 h-[85vh] ">
      {formattedCategories && (
        <DataTable
          columns={columns}
          data={formattedCategories}
          dataTotal={0}
          onDelete={handleDelete}
          onEdit={handelEdit}
        />
      )}
    </div>
  );
}

export default CategoriesPage;
