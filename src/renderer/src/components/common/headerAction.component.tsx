import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";
export function HeaderActions() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const { user } = useSelector((state: any) => state.auth);

  return (
    <div
      dir="rtl"
      className="flex flex-row-reverse items-start w-full space-x-4"
    >
      <div className="w-fit">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>
              <div className="flex items-center gap-2">
                <span className="">{user?.username}</span>
                <img
                  src={user?.avatar || "/images/avatar.png"}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width]  rounded-md shadow  bg-white border gap-2  text-right"
          >
            <DropdownMenuItem
              key={"logout"}
              onClick={handleLogout}
              className="cursor-pointer p-2"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
