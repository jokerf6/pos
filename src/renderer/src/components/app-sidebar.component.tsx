import { Home, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { useSelector } from "react-redux";
// Menu items.
const items = [
  {
    title: "الرئيسية",
    url: "/",
    icon: Home,
    user: true,
  },
  {
    title: "المستخدمين",
    url: "/users",
    icon: User,
    user: false,
  },
];
export function AppSidebar() {
  const { user } = useSelector((state: any) => state.auth);

  const location = useLocation();
  const usedItems = items.map((item) => ({
    ...item,
    hide: user.role !== "admin" && !item.user, // Hide items that are not for the current user
    active: location.pathname === item.url, // Check if the current path matches the item's URL
    // Filter out items that are not used in the current path
  }));

  return (
    <Sidebar className="w-[20%] ">
      <SidebarContent className="py-[20px]">
        <SidebarGroup>
          <SidebarGroupLabel className="pt-[50px] font-bold text-3xl text-center flex items-center justify-center  ">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-[100px] h-[100px]"
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu
              dir={"rtl"}
              className="flex flex-col gap-6 text-xl mt-20"
            >
              {usedItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="w-full text-xl font-semibold ease-in-out duration-200"
                >
                  <SidebarMenuButton
                    asChild
                    className={` ${item.hide ? "hidden" : ""}`}
                  >
                    <Link className="flex items-center gap-2" to={item.url}>
                      <span className="text-indigo-600">
                        <item.icon />
                      </span>

                      <span
                        className={`text-xl ${item.active ? "text-indigo-600" : ""}`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
