"use client";
import Link from "next/link";
import NavMenuList from "@/components/navmenulist";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Download, Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator"
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useSidebar } from "@/utils/sidebar-context";
import { ReportSidebar, ReportSideBarSkeleton } from "@/components/reportsidebar";

export default function Sidebar({ user_role }) {
  const [isLoading, setIsLoading] = useState(false);
  const { specificSidebarData } = useSidebar();
  return (
    <>
      <div className="hidden border-r bg-white fixed left-0 inset-y-0 lg:block lg:w-65">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex items-center border-b px-4 py-4 lg:px-6">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.svg"
                alt="Vantage-Fly"
                className="h-9 hidden sm:block"
              />
            </Link>
          </div>
          <div className="flex-1 flex flex-col justify-between border-r bg-white overflow-auto">
            <div className="hidden lg:block lg:w-64">
              {specificSidebarData && (
                <div className="hidden lg:block lg:w-64">
                  {specificSidebarData.pages.length ? <ReportSidebar
                    pages={specificSidebarData.pages}
                    activePage={specificSidebarData.activePage}
                    onClickHanlder={specificSidebarData.onClickHanlder}
                  /> : <ReportSideBarSkeleton />}
                </div>
              )}
              <NavMenuList user_role={user_role} />
            </div>
            <div className="px-2 py-4">
              <Separator className="my-4" />
              <Button
                onClick={() => {
                  setIsLoading(true);
                  signOut();
                }}
                size="xs"
                variant="Link"
                className={`gap-1.5 text-sm ${!isLoading ? "" : "ml-auto"}`}
              >
                {!isLoading ? <LogOut size={16} /> : <Loader2 className="h-4 w-4 animate-spin" />}
                <span className="hidden lg:block ml-1">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
