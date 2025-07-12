import { ChevronDown, Home, User } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
// Menu items.
const items = [
  {
    title: "الرئيسية",
    url: "/",
    group: [],
    icon: Home,
    user: true,
  },
  {
    title: "المستخدمين",
    url: "/users",
    group: [],
    icon: User,
    user: false,
  },
  {
    title: "الاقسام",
    url: "/categories",
    group: [],
    icon: User,
    user: false,
  },
  {
    title: "إداره الاصناف",
    group: [
      {
        title: "الاصناف",
        url: "/products",
        icon: User,
        user: false,
      },
      {
        title: "حركه الصنف",
        url: "/transaction/products",
        icon: User,
        user: false,
      },
    ],
    url: "/products",
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
              {usedItems.map((item) =>
                item?.group?.length === 0 ? (
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
                ) : (
                  <Collapsible className="group/collapsible mr-[-7px] mt-[-7px]">
                    <SidebarGroup>
                      <SidebarGroupLabel asChild>
                        <CollapsibleTrigger>
                          <div className="flex justify-between  w-full">
                            <div className=" flex w-fit gap-2 ">
                              <span className="text-indigo-600">
                                <item.icon />
                              </span>

                              <span
                                className={`text-xl ${item.active ? "text-indigo-600" : "text-black font-bold"}`}
                              >
                                {item.title}
                              </span>
                            </div>
                            <ChevronDown className="mr-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </div>
                        </CollapsibleTrigger>
                      </SidebarGroupLabel>
                      <CollapsibleContent className=" mr-[35px] mt-[10px]">
                        {item.group.map((subItem) => (
                          <SidebarMenuItem
                            key={subItem.title}
                            className="w-full text-xl font-semibold ease-in-out duration-200"
                          >
                            <SidebarMenuButton asChild>
                              <Link
                                className="flex items-center gap-2"
                                to={subItem.url}
                              >
                                <span
                                  className={`text-md ${
                                    location.pathname === subItem.url
                                      ? "text-indigo-600"
                                      : ""
                                  }`}
                                >
                                  {subItem.title}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </CollapsibleContent>
                    </SidebarGroup>
                  </Collapsible>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
