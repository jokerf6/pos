import { Home, User } from "lucide-react";

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

// Menu items.
const items = [
  {
    title: "الرئيسية",
    url: "#",
    icon: Home,
  },
  {
    title: "المستخدمين",
    url: "#",
    icon: User,
  },
];

export function AppSidebar() {
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
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="w-full text-xl font-semibold ease-in-out duration-200"
                >
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <span className="text-blue-500">
                        <item.icon />
                      </span>

                      <span className="text-xl ">{item.title}</span>
                    </a>
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
