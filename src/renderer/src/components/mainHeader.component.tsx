import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "store";
import { getByKey } from "store/slices/settingsSlice";
import { closeDaily, getDaily, openDaily } from "store/slices/dailySlice";
import { SidebarTrigger } from "./ui/sidebar";
import Modal from "./common/dynamic-modal.component";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { HeaderActions } from "./common/headerAction.component";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function MainHeader() {
  const [openSettings, setOpenSettings] = useState(false);
  const [openPrice, setOpenPrice] = useState(0);
  const [closePrice, setClosePrice] = useState(0);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { daily } = useSelector((state: RootState) => state.daily);
  useEffect(() => {
    async function fetchData() {
      try {
        const openResult = await dispatch(getByKey("open")).unwrap();
        setOpenSettings(openResult.data.value === "true");
        dispatch(getDaily());
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    }
    fetchData();
  }, [dispatch]);
  //
  const handleOpen = async () => {
    dispatch(openDaily(openPrice));
    dispatch(getDaily());
    setOpenPrice(0);
    setClosePrice(0);
    setOpen(false);
  };

  const handleClose = async () => {
    dispatch(closeDaily(closePrice));
    dispatch(getDaily());
    setOpenPrice(0);
    setClosePrice(0);
    setOpen(false);
  };
  return (
    <div className=" flex justify-between w-full sticky right-0 rounded-t-2xl top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 shrink-0 items-center gap-2 border-b p-4 z-50">
      <SidebarTrigger className=" w-5 h-5 absolute top-5" />
      <Modal
        confirmLabel={daily.length === 0 ? "فتح" : "غلق"}
        cancelLabel="إلغاء"
        onConfirm={daily.length === 0 ? handleOpen : handleClose}
        title={daily.length === 0 ? "فتح اليومية" : "غلق اليومية"}
        open={open}
        onClose={() => setOpen(false)}
      >
        {daily.length === 0 && openSettings === true && (
          <Input
            type="number"
            min={0}
            placeholder="المبلغ الافتتاحي"
            value={openPrice}
            onChange={(e) => setOpenPrice(+e.target.value)}
          />
        )}
        {/* Add any content you want to render when daily.length > 0 and openSettings is true */}
        {daily.length > 0 && openSettings && (
          <div className="flex flex-col gap-1">
            <span className=" w-fit">المبلغ المسحوب</span>
            <Input
              className=" w-full"
              type="number"
              min={0}
              placeholder="المبلغ المسحوب"
              value={closePrice}
              onChange={(e) => setClosePrice(+e.target.value)}
            />
          </div>
        )}
        {/*  */}
        {daily.length > 0 && (
          <div>
            <div className="flex gap-2">
              <span>المبلغ الكلي:</span>
              <span>{Number(daily[0]?.cashInDrawer).toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <span>اجمالي المبيعات:</span>
              <span>{Number(daily[0]?.total_sales).toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <span>اجمالي المصروفات:</span>
              <span>{Number(daily[0]?.total_expenses).toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <span>اجمالي المرتجعات:</span>
              <span>{Number(daily[0]?.total_returns).toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
      <div className="flex  items-center  justify-between w-full ">
        <div></div>
        <div className="  flex gap-2 items-center">
          {daily.length === 0 && (
            <Button
              onClick={() => setOpen(true)}
              type="button"
              variant="outline"
            >
              بدء اليومية
            </Button>
          )}
          {daily.length > 0 && (
            <span>
              تاريخ بداية اليومية :{" "}
              {formatDate(
                typeof daily[0].opened_at === "string"
                  ? daily[0].opened_at
                  : new Date(daily[0].opened_at).toISOString()
              )}
            </span>
          )}
          <Button
            onClick={() => setOpen(true)}
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
