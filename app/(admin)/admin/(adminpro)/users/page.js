import Link from "next/link";

import { CirclePlus } from "lucide-react";

import { ADMIN_ROUTES } from "@/utils/constant";

import { buttonVariants } from "@/components/ui/button";

import { DataTable } from "@/components/datatable";

import { columns } from "@/components/datatable/usertablecoloums";
import { getUsers } from "@/serveractions/actions";
import { Suspense } from "react";
import ErrorBoundary from "@/components/errorboundrary";
import UserTableSkeleton from "@/components/skeleton/usertableskeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata = {
  title: "Users - Vantage Fly",
  robots: {
    index: false,
    follow: false,
  },
};

export async function UsersData() {
  const users = await getUsers();

  if (!users) {
    throw new Error("Fetch users failed, Try again");
  }
  return <DataTable data={users ?? []} columns={columns} />;
}

export default async function page() {
  return (
    <>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Users</h1>
        <Link
          href={ADMIN_ROUTES?.addUser}
          className={`${buttonVariants({
            variants: "default",
            size: "sm",
          })} gap-1`}
        >
          <CirclePlus size={16} />
          Add users
        </Link>
      </div>
      <ErrorBoundary>
        <Card>
          <CardContent className="!pt-6">
            <Suspense fallback={<UserTableSkeleton count={10} />}>
              <UsersData />
            </Suspense>
          </CardContent>
        </Card>
      </ErrorBoundary>
    </>
  );
}
