import {
  Home,
  Users,
  FolderOpen,
  ReceiptText,
  CreditCard,
  Package,
  Settings,
  ChevronDown,
  PlusCircle,
  ListOrdered,
  DollarSign,
  Wallet,
  Boxes,
  BarChart3,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// Extend the Window interface to include the 'assets' property

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

// Menu items with required permissions
const items = [
  {
    title: "الرئيسية",
    url: "/",
    group: [],
    icon: Home,
    daily: false,
    permissions: [], // No permissions required for home page
  },
  {
    title: "المستخدمين",
    url: "/users",
    group: [],
    icon: Users,
    daily: false,

    permissions: ["users.view"], // Requires users.view permission
  },
  {
    title: "الاقسام",
    url: "/categories",
    group: [],
    icon: FolderOpen,
    daily: false,
    permissions: ["category.view"], // Requires inventory.view permission
  },
  {
    title: "الاصناف",
    group: [],
    url: "/products",
    icon: Package,
    daily: false,
    permissions: ["inventory.view"], // Show if user has inventory view permission
  },
  {
    title: "الوحدات",
    url: "/units",
    group: [],
    icon: Boxes,
    daily: false,
    permissions: ["units.view"], // Requires units.view permission
  },
  {
    title: "الفواتير",
    url: "/invoiceManagement",
    daily: true,
    group: [
      {
        title: "إنشاء فاتورة",
        url: "/invoice/create",
        icon: PlusCircle,
        permissions: ["sales.create"],
      },
      {
        title: "كل الفواتير",
        url: "/invoice",
        icon: ListOrdered,
        permissions: ["sales.view"],
      },
    ],
    icon: ReceiptText,
    permissions: ["sales.view", "sales.create"], // Show if user has any sales permission
  },
  {
    title: "المصروفات",
    daily: true,
    group: [
      {
        title: "مصروفات اليوم",
        url: "/credit/daily",
        icon: DollarSign,
        permissions: ["credit.create"],
      },
      {
        title: "كل المصروفات",
        url: "/credit",
        icon: Wallet,
        permissions: ["credit.view"],
      },
    ],
    url: "/credit",
    icon: CreditCard,
    permissions: ["credit.view", "credit.create"], // Show if user has financial reports permission
  },
  {
    title: "التقارير",
    url: "/reports",
    group: [],
    daily: false,
    icon: BarChart3,
    permissions: ["reports.view"], // Requires reports.view permission
  },
  {
    title: "الاعدادات",
    url: "/settings",
    group: [],
    daily: false,
    icon: Settings,
    permissions: ["settings.view"], // Requires system.settings permission
  },
];

export function AppSidebar() {
  const { user } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const { daily } = useSelector((state: any) => state.daily);
  // Helper function to check if user has any of the required permissions
  const hasPermission = (requiredPermissions: string[]): boolean => {
    console.log("Checking permissions for user:", requiredPermissions);
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (user?.role === "admin") return true;
    return requiredPermissions.some((p) => user?.permissions?.includes(p));
  };
  // Helper function to check if user has permission for any sub-item in a group
  const hasGroupPermission = (group: any[]): boolean => {
    return group.some((subItem) => hasPermission(subItem.permissions || []));
  };

  const usedItems = items.map((item) => ({
    ...item,
    hide:
      !hasPermission(item.permissions) &&
      (item.group.length === 0 || !hasGroupPermission(item.group)),
    active:
      location.pathname === item.url ||
      (item.group &&
        item.group.some((subItem) => location.pathname === subItem.url)),
  }));

  return (
    <div className="">
      <Sidebar className="w-[20%] text-white border-none">
        <SidebarContent className="py-6 px-4">
          <SidebarGroup>
            <SidebarGroupLabel className="flex flex-col">
              <SidebarGroupLabel className="pt-8 pb-8 font-bold text-3xl text-center flex items-center justify-center">
                <img
                  src={"images/logo.png"}
                  alt="Logo"
                  className="w-24 h-24 object-contain"
                />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu
                  dir="rtl"
                  className="flex flex-col gap-3 text-lg mt-8"
                >
                  {usedItems.map((item) =>
                    item?.group?.length === 0 ? (
                      <SidebarMenuItem
                        key={item.title}
                        className={`w-full rounded-lg transition-all duration-200 ease-in-out
                      ${item.active ? "bg-[#1B67B3]" : " hover:bg-sidebar-accent"}
                      ${(item?.daily === true && daily?.success === false) || item.hide ? "hidden" : ""}`}
                      >
                        <SidebarMenuButton
                          asChild
                          disabled={!item.daily && !daily}
                          className={`flex items-center gap-3 py-3 px-4 text-lg w-full text-right
                        ${item.active ? "text-white" : "text-[#111111]"}
                      `}
                        >
                          <Link to={item.url}>
                            <span className="text-current">
                              <item.icon size={20} />
                            </span>
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ) : (
                      <Collapsible
                        key={item.title}
                        className={`group/collapsible rounded-lg

                      ${(item.daily === true && daily?.success === false) || item.hide ? "hidden" : ""}`}
                      >
                        <SidebarGroupLabel asChild>
                          <CollapsibleTrigger
                            className={`flex justify-between  items-center gap-3  py-3 px-4 w-full text-right rounded-lg
                          ${item.active ? "text-white" : "text-[#111111]"}
                        `}
                          >
                            <div className="flex items-center  gap-3">
                              <span className="text-current">
                                <item.icon
                                  size={20}
                                  className="text-[#111111]"
                                />
                              </span>
                              <span className="font-medium   text-[19px] text-[#111111]">
                                {item.title}
                              </span>
                            </div>
                            <ChevronDown
                              size={18}
                              className="transition-transform group-data-[state=open]/collapsible:rotate-180"
                            />
                          </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent className="mt-2 pb-2 pr-4">
                          {item.group
                            .filter((subItem) =>
                              hasPermission(subItem.permissions || [])
                            )
                            .map((subItem) => (
                              <SidebarMenuItem
                                key={subItem.title}
                                className={`w-full rounded-lg  transition-all duration-200 ease-in-out
                            ${location.pathname === subItem.url ? "bg-blue-700" : ""}`}
                              >
                                <SidebarMenuButton asChild>
                                  <Link
                                    className={`flex  items-center gap-3 py-2 px-4  w-full text-right
                                ${location.pathname === subItem.url ? "text-white" : "text-[#555555] hover:bg-sidebar-accent"}
                              `}
                                    to={subItem.url}
                                  >
                                    <span className="text-current">
                                      <subItem.icon size={18} />
                                    </span>
                                    <span className=" text-lg font-normal">
                                      {subItem.title}
                                    </span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
