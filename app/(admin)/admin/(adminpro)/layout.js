import AdminDashboardHeader from "@/components/global/admindashboardheader";
import Sidebar from "@/components/sidebar";
import { auth } from "@/utils/auth";
import { SidebarProvider } from "@/utils/sidebar-context";

export default async function Layout({ children }) {
  const curruentUser = await auth();
  return (
    <SidebarProvider>
      <div className="bg-white">
        <Sidebar user_role={curruentUser?.userRole} />
        <div className="w-full flex flex-col min-h-screen lg:pl-72">
          {/* <AdminDashboardHeader /> */}
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
