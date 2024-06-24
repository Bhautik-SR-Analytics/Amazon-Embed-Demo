"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

import NavMenuList from "@/components/navmenulist";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, LogOut, Menu } from "lucide-react";
import { useState } from "react";

export default function AdminDashboardHeader() {
  const [isLoading, setIsLoading] = useState(false);
  const [toggleSideMenu, setToggleSideMenu] = useState(false);

  return (
    <header className="sticky top-0 inset-x-0 z-10 flex items-center gap-4 border-b bg-white px-4 py-4 lg:px-6">
      <Link href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.svg"
          alt="Vantage-Fly"
          className="h-10 block lg:hidden"
        />
      </Link>
      <Sheet open={toggleSideMenu} onOpenChange={setToggleSideMenu}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 ml-auto lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex flex-col gap-2 max-w-full w-full"
        >
          <Link href="#">
            <div
              className="flex items-center gap-2 text-lg font-semibold mb-3"
              onClick={() => setToggleSideMenu(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.svg"
                alt="Vantage-Fly"
                className="h-9 block lg:hidden"
              />
            </div>
          </Link>
          <NavMenuList toggleSideMenu={setToggleSideMenu} />
        </SheetContent>
      </Sheet>
      <Button
        onClick={() => {
          setIsLoading(true);
          signOut();
        }}
        size="sm"
        variant="default"
        className="gap-1.5 text-sm lg:ml-auto"
      >
        {!isLoading ? (
          <LogOut size={16} />
        ) : (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        <span className="hidden lg:block">Logout</span>
      </Button>
    </header>
  );
}
