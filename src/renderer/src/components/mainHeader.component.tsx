import { SidebarTrigger } from "./ui/sidebar";
import { HeaderActions } from "./common/headerAction.component";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getDaily } from "../store/slices/dailySlice";
import { formatDate } from "../utils/formDate.js";
import { openDaily } from "../store/slices/dailySlice";
import { closeDaily } from "../store/slices/dailySlice";
export default function MainHeader() {
  const dispatch = useDispatch();
  const { daily } = useSelector((state: any) => state.daily);
  useEffect(() => {
    dispatch(getDaily());
  }, [dispatch]);

  const handleOpen = async () => {
    await dispatch(openDaily());
    dispatch(getDaily());
  };

  const handleClose = async () => {
    await dispatch(closeDaily());
    dispatch(getDaily());
  };
  return (
    <div className=" flex justify-between w-full sticky right-0 rounded-t-2xl top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 shrink-0 items-center gap-2 border-b p-4 z-50">
      <SidebarTrigger className=" w-5 h-5 absolute top-5" />

      <div className="flex  items-center  justify-between w-full ">
        <div></div>
        <div className="  flex gap-2 items-center">
          {daily.length === 0 && (
            <Button onClick={handleOpen} type="button" variant="outline">
              بدء اليومية
            </Button>
          )}
          {daily.length > 0 && (
            <span>
              تاريخ بداية اليومية :{" "}
              {formatDate(daily[0].opened_at.toISOString())}
            </span>
          )}
          <Button
            onClick={handleClose}
            type="button"
            className=" text-red-500"
            variant="outline"
          >
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
