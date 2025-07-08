/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ChevronUp, LogOut } from "lucide-react";
import { Image } from "@radix-ui/react-avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./sidebar";
const API_IMG_URL = process.env.NEXT_PUBLIC_API_IMG_URL as string;
// ...existing code...

export const SideBarFooter: React.FC<{
  user: {
    name: string;
    email: string;
    image?: string;
    id: string;
  };
}> = ({ user }) => {
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-md transition-colors duration-150">
                <Image
                  className="rounded-full border border-gray-300 shadow-sm"
                  src={`${API_IMG_URL + user.image}`}
                  alt={user.name}
                  width={30}
                  height={30}
                  objectFit="cover"
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  {/* Uncomment below if you wish to show user email */}
                  {/* <p className="text-xs text-gray-500">{user.email}</p> */}
                </div>
                <ChevronUp className="ml-auto text-gray-600" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-56 bg-white rounded-md shadow-lg p-2 border border-gray-200"
            >
              <DropdownMenuItem className="rounded-md hover:bg-gray-100">
                {/* <Link
                  href={`/${locale}${routes.editProfile}`}
                  className="flex items-center px-3 py-2 text-sm font-semibold text-gray-700"
                >
                  <FaUserFriends />
                  {"My Account"}
                </Link> */}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-md hover:bg-gray-100">
                <button className="flex w-full items-center px-3 py-2 text-sm font-semibold text-gray-700">
                  <LogOut className="mr-2 h-4 w-4 text-gray-600" />
                  {"Logout"}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
    // ...existing code...
  );
};

// '''  <div className="flex items-center justify-between p-4">
//         <div>
//           <Popover.Root>
//             <Popover.Trigger asChild>
//               <button className="flex w-full items-center justify-between p-2">
//                 <div className="flex items-center justify-start space-x-2">
//                   <div className="w-6 h-6 rounded-full overflow-hidden">
//                     <Image
//                       className=""
//                       src={`${API_IMG_URL + user.image}`}
//                       alt={user.name}
//                       width={24}
//                       height={24}
//                       objectFit="cover"
//                     />
//                   </div>
//                   <div className="flex flex-col items-start justify-center">
//                     <p className="text-sm font-medium ms-2">{user.name}</p>
//                     <p className="text-xs text-muted-foreground">{user.email}</p>
//                   </div>
//                   <ChevronUp
//                     className={cn(
//                       "h-4 w-4 transition-transform duration-200",
//                       "data-[state=open]:rotate-180"
//                     )}
//                   />
//                 </div>
//               </button>
//             </Popover.Trigger>
//             <Popover.Portal>
//               <Popover.Content
//                 className="z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
//                 sideOffset={5}
//               >
//                 <div className="flex flex-col gap-0.5"></div>

//                 <div className="flex flex-col gap-0.5 p-2">
//                   <Link
//                     href={`/${locale}${routes.editProfile}`}
//                     className="flex items-center px-2 py-1.5 text-sm font-semibold"
//                   >
//                     <FaUser className="mr-2" /> {/* Icon with some margin to the right */}
//                     {t("My Account")}
//                   </Link>
//                   <div className="h-px bg-muted my-1" />
//                   <Button
//                     onClick={async () => {
//                       await removeToken();
//                     }}
//                     className="relative flex  select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-red-600"
//                   >
//                     <LogOut className="mr-2 h-4 w-4" />
//                     <span>{t("Logout")}</span>
//                   </Button>
//                 </div>
//               </Popover.Content>
//             </Popover.Portal>
//           </Popover.Root>
//         </div>'''
