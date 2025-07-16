import { SidebarTrigger } from "./ui/sidebar";
import { HeaderActions } from "./common/headerAction.component";
import { Button } from "./ui/button";
export default function MainHeader() {
  return (
    <div className=" flex justify-between w-full sticky right-0 rounded-t-2xl top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 shrink-0 items-center gap-2 border-b p-4 z-50">
      <SidebarTrigger className=" w-5 h-5 absolute top-5" />

      <div className="flex  items-center  justify-between w-full ">
        <div></div>
        <div className="  flex gap-2">
          <Button type="button" variant="outline">
            بدء اليومية
          </Button>
          <Button type="button" className=" text-red-500" variant="outline">
            غلق اليومية
          </Button>
        </div>
        <div className="flex   w-fit items-center space-x-4">
          <HeaderActions />
        </div>
      </div>
    </div>
  );
}
