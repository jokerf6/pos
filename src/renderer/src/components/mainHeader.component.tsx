import { SidebarTrigger } from "./ui/sidebar";
import { HeaderActions } from "./common/headerAction.component";

export default function MainHeader() {
  //   const { data: permissions } = await fetchHelper({
  //     endPoint: API_ENDPOINTS.permissions,
  //     method: "GET",
  //     cache: "force-cache",
  //   });

  return (
    <div className=" w-full sticky right-0 rounded-t-2xl top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 shrink-0 items-center gap-2 border-b p-4 z-50">
      <SidebarTrigger className=" w-5 h-5 absolute top-5" />
      <div className="flex justify-between w-full ">
        <div className="flex w-full items-center space-x-4">
          <HeaderActions />
        </div>
      </div>
    </div>
  );
}
