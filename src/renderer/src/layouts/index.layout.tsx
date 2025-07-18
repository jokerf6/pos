import { AppSidebar } from "../components/app-sidebar.component";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "../components/ui/sidebar";
import MainHeader from "../components/mainHeader.component";
import ConfirmDeleteModal from "../components/common/confirm-delete.component";
import { useDispatch, useSelector } from "react-redux";
import { hideConfirmModal } from "../store/slices/confirmModalSlice";
import { Toaster } from "../components/ui/sonner";
import ConfirmImageModal from "../components/common/image-model.component";
import { hideImageModal } from "../store/slices/imageModal";

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  const { open } = useSidebar();
  const handleClose = () => dispatch(hideConfirmModal());

  const {
    open: OpenModel,
    itemLabel,
    onConfirm,
  } = useSelector((state: any) => state.confirmModal);

  const { open: OpenImage, image } = useSelector(
    (state: any) => state.imageModal
  );

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    dispatch(hideConfirmModal());
  };
  return (
    <div
      className="w-full py-2 flex flex-row border-r border-t border-b"
      dir="rtl"
    >
      <ConfirmDeleteModal
        open={OpenModel}
        onClose={handleClose}
        onConfirm={handleConfirm}
        itemLabel={itemLabel}
      />
      <ConfirmImageModal
        open={OpenImage}
        onClose={() => dispatch(hideImageModal())}
        image={image} // Assuming 'image' is available in the state
      />
      <Toaster />

      <div
        className={` border-r
           transition-all duration-500 ease-in-out
          ${open ? "w-[20%] opacity-100" : "w-0 opacity-0 overflow-hidden"}
        `}
        dir="rtl"
      >
        <AppSidebar />
      </div>

      <div
        className="flex-1 border-r rounded-2xl border-t border-b shadow  "
        dir="rtl"
      >
        <SidebarInset className=" rounded-t-2xl ">
          <MainHeader />
          <div className="p-4 h-[90vh]">{children}</div>
        </SidebarInset>
      </div>
    </div>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider dir="rtl">
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};
