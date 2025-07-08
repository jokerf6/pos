import { AppSidebar } from "../components/app-sidebar.component";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import MainHeader from "../components/mainHeader.component";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider dir="rtl">
      <div className=" w-full flex   flex-row ">
        <div className="  w-[20%] h-full" dir="rtl">
          <AppSidebar />
        </div>
        <div className="w-[80%] " dir="rtl">
          <SidebarInset>
            <MainHeader />
            <div className="p-4">{children}</div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};
