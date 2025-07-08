import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem } from "./sidebar";

type SidebarItem = {
  title: string | React.JSX.Element;
  icon?: React.JSX.Element | string;
  url: string;
  items?: {
    title: string | React.JSX.Element;
    url: string;
    icon?: React.JSX.Element | string;
  }[];
};

type Props = {
  item: SidebarItem;
};

export default function SideBarItem({ item }: Props) {
  const location = useLocation();

  const isActive = location.pathname === item.url;

  return (
    <SidebarMenuItem className="hover:bg-primary/15 rounded" key={item.url}>
      <SidebarMenuButton
        className={`rounded hover:bg-primary/15 ${isActive ? "bg-primary/80 text-primary-foreground" : ""}`}
        asChild
        isActive={isActive}
      >
        <Link
          to={item.url}
          className={`rounded hover:bg-primary/15 text-foreground ${
            isActive ? "bg-primary/80 text-primary-foreground" : ""
          }`}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.title}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
