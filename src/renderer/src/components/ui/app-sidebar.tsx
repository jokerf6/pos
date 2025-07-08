import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarRail,
} from "./sidebar";
import { VersionSwitcher } from "./version-switcher";
import SideBarItem from "./sidebarItem";
import { FaHome, FaCog, FaUser } from "react-icons/fa";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarItems = [
    {
      title: "Home",
      icon: <FaHome />,
      url: "/",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      url: "/settings",
    },
    {
      title: "Profile",
      icon: <FaUser />,
      url: "/profile",
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarInset>
        <SidebarHeader>
          <VersionSwitcher />
        </SidebarHeader>

        {sidebarItems.map((item) => (
          <SidebarContent>
            <SideBarItem item={item} />
          </SidebarContent>
        ))}

        {/* <SidebarFooter>
          <SideBarFooter
            user={{
              name: `${user?.name}`,
              email: user?.email,
              id: user?.id
            }}
          />
        </SidebarFooter> */}
        <SidebarRail />
      </SidebarInset>
    </Sidebar>
  );
}
