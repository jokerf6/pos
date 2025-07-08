import React from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { AppSidebar } from "../components/ui/app-sidebar";

type Params = { [key: string]: string }; // Define Params type or import it if available

export const RoutesLayout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}): Promise<React.ReactElement> => {
  return (
    <SidebarProvider>
      <AppSidebar side={"right"} />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 w-full flex-row-reverse me-3">
            {/* <UserDropdown roleId={roleId} user={data?.data} />
            <LanguageSwitcher />
            <Notifications />
            <ThemeSwitcher /> */}
          </div>
        </header>
        <div className=" p-5 md:p-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};
