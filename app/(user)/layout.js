import { SidebarProvider } from "@/utils/sidebar-context";
import Header from "@/components/global/header";
import { Suspense } from "react";
import Sidebar from "@/components/sidebar";
import { auth } from "@/utils/auth";

export default async function Layout({ children }) {
  const curruentUser = await auth();
  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col">
        {/* <Suspense fallback={null}>
        <Header />
      </Suspense> */}
        <div className="flex flex-1">
          <div className="flex-none w-64"> {/* Fixed width sidebar */}
            <Sidebar user_role={curruentUser?.userRole} />
          </div>
          <div className="flex-auto overflow-y-auto px-4 py-8"> {/* Main content area */}
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
