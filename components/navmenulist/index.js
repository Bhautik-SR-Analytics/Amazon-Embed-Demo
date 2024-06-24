"use client";
import { ADMIN_ROUTES } from "@/utils/constant";
import { Home, UsersRound, BarChartBig, BellRing } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/utils/sidebar-context";
import { ReportSidebar } from "@/components/reportsidebar";

const admin_menu = [
  {
    id: "dashbord-1",
    path: ADMIN_ROUTES?.dashboard,
    label: "Dashboard",
    icon: <Home size={16} />,
  },
  {
    id: "users-2",
    path: ADMIN_ROUTES?.users,
    label: "Users",
    icon: <UsersRound size={16} />,
  },
];

const user_menu = [
  {
    id: "Reports",
    path: ADMIN_ROUTES?.reports,
    label: "Reports",
    icon: <BarChartBig size={16} />,
  },
  {
    id: "Alerts",
    path: ADMIN_ROUTES?.alert,
    label: "Alerts",
    icon: <BellRing size={16} />,
  },
];

export default function NavMenuList({ user_role, toggleSideMenu }) {
  const { specificSidebarData } = useSidebar();
  const pathname = usePathname();
  const handleClose = () => {
    if (toggleSideMenu) toggleSideMenu(false);
  };
  return (
    // <nav className="grid items-start text-base font-medium lg:px-6">
    <>
      {(user_role == "ADMIN" ? admin_menu : user_menu).map((menuItem) => {
        if(specificSidebarData?.pages?.length && menuItem.id == "Reports"){
          return;
        }
        return (
          <Link key={menuItem?.id} href={menuItem?.path} variant="link">
            <Button
              key={menuItem?.id}
              className={`p-2 w-full hover:no-underline justify-start transition-colors font-normal  ${pathname === menuItem?.path ? "text-black font-medium" : "hover:bg-gray-100 text-gray-600 hover:text-black"
                }`}
              variant="link"
            >
              <span className="flex items-center gap-1.5 leading-0">
                {menuItem?.icon}
                <span className="flex">
                  {menuItem?.label}
                </span>
              </span>
            </Button>
          </Link>
        );
      })}
    </>
    // </nav>
  );
}
