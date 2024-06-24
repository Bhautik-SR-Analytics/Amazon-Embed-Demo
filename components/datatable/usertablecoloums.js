"use client";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, Circle, CircleCheck, CircleHelp, CircleX, Timer } from "lucide-react";
import { DataTableColumnHeader } from "@/components/datatable/columnheader";
import { DataTableRowActions } from "@/components/datatable/rowactions";

export const columns = [
  {
    accessorKey: "username",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User name" />,
    cell: ({ row }) => {
      return <span className="max-w-[500px] truncate font-medium">{row.getValue("username")}</span>;
    },
  },
  {
    accessorKey: "user_role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User role" />,
    cell: ({ row }) => {
      return <span className="max-w-[500px] truncate font-medium">{row.getValue("user_role")}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
