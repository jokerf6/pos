import { 
  Home, 
  Users, 
  FolderOpen, 
  ReceiptText, 
  CreditCard, 
  Package, 
  Settings, 
  ChevronDown, 
  LayoutDashboard, 
  PlusCircle, 
  ListOrdered, 
  DollarSign, 
  Wallet, 
  Boxes, 
  MoveRight
} from "lucide-react";
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
import { usePermission } from "hooks/use-permissions";

// Menu items.
const items = [
  {
    title: "الرئيسية",
    url: "/",
    group: [],
    icon: Home,
  },
  {
    title: "المستخدمين",
    url: "/users",
    group: [],
    icon: Users,
  },
  {
    title: "الاقسام",
    url: "/categories",
    group: [],
    icon: FolderOpen,
  },
  {
    title: "إدارة الفواتير",
    url: "/",
    group: [
      {
        title: "إنشاء فاتورة",
        url: "/invoice/create",
        icon: PlusCircle,
      },
      {
        title: "كل الفواتير",
        url: "/invoice",
        icon: ListOrdered,
      },
    ],
    icon: ReceiptText,
    user: false,
  },
  {
    title: "إداره المصروفات",
    group: [
      {
        title: "مصروفات اليوم",
        url: "/credit/daily",
        icon: DollarSign,
      },
      {
        title: "كل المصروفات",
        url: "/credit",
        icon: Wallet,
      },
    ],
    url: "/products", // This URL seems incorrect for the group, it should be a placeholder or removed if not directly navigable
    icon: CreditCard,
  },
  {
    title: "إداره الاصناف",
    group: [
      {
        title: "الاصناف",
        url: "/products",
        icon: Boxes,
      },
      {
        title: "حركه الصنف",
        url: "/transaction/products",
        icon: MoveRight,
      },
    ],
    url: "/products",
    icon: Package,
  },
  {
    title: "الاعدادات",
    url: "/settings",
    group: [],
    icon: Settings,
  },
];

export function AppSidebar() {
  const { user } = useSelector((state: any) => state.auth);
  const location = useLocation();

  const usedItems = items.map((item) => ({
    ...item,
    hide: user.role !== "admin" && !item.user,
    active: location.pathname === item.url || 
            (item.group && item.group.some(subItem => location.pathname === subItem.url)),
  }));
  const canDelete = usePermission("delete_user");

  return (
    <Sidebar className="w-[20%] bg-gray-900 text-white border-none">
      <SidebarContent className="py-6 px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="pt-4 pb-8 font-bold text-3xl text-center flex items-center justify-center">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-24 h-24 object-contain"
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu
              dir="rtl"
              className="flex flex-col gap-2 text-lg mt-8"
            >
              {usedItems.map((item) =>
                item?.group?.length === 0 ? (
                  <SidebarMenuItem
                    key={item.title}
                    className={`w-full rounded-lg transition-all duration-200 ease-in-out
                      ${item.active ? "bg-blue-600 " : ""}`}
                  >
                    <SidebarMenuButton
                      asChild
                      className={`flex items-center gap-3 py-3 px-4 w-full text-right
                        ${item.hide ? "hidden" : ""}
                        ${item.active ? "text-white" : "text-[#111111]"}
                      `}
                    >
                      <Link to={item.url}>
                        <span className="text-current">
                          <item.icon size={20} />
                        </span>
                        <span className="font-medium">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  <Collapsible 
                    key={item.title}
                    className={`group/collapsible rounded-lg 
                      ${item.active ? "bg-blue-600 hover:bg-blue-600" : ""}`}
                  >
                    <SidebarGroupLabel asChild>
                      <CollapsibleTrigger 
                        className={`flex justify-between items-center gap-3 py-3 px-4 w-full text-right rounded-lg
                          ${item.active ? "text-white" : "text-[#111111]"}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-current">
                            <item.icon size={20} className="text-[#111111]" />
                          </span>
                          <span className="font-medium text-[#111111]">
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
                      {item.group.map((subItem) => (
                        <SidebarMenuItem
                          key={subItem.title}
                          className={`w-full rounded-lg transition-all duration-200 ease-in-out
                           
                            ${location.pathname === subItem.url ? "bg-blue-700" : ""}`}
                        >
                          <SidebarMenuButton asChild>
                            <Link
                              className={`flex items-center gap-3 py-2 px-4 w-full text-right
                                ${location.pathname === subItem.url ? "text-white" : "text-[#555555]"}
                              `}
                              to={subItem.url}
                            >
                              <span className="text-current">
                                <subItem.icon size={18} />
                              </span>
                              <span className="text-sm font-normal">
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
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}



