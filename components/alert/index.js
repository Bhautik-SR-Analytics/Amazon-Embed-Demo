"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CaretSortIcon,
  Pencil1Icon,
  TrashIcon,
  CalendarIcon
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "sonner";
import AddUpdateAlert from "./add-update-alert";
import ButtonWithLoader from "../buttonwithloader";

import { addAlertToDb, updateAlertInDb, deleteAlertFromDb } from "@/serveractions/alert-actions";
import { revalidatePage } from "@/serveractions/revalidate";

const FREQUENCY = {
  0: "daily",
  1: "weekly",
  2: "daily",
};

const METRIC = {
  cancels_0_to_3_days: "Cancels (0-3 Days)",
  cancels: "Cancels",
  per_cancels: "% Cancels",
  rebill_cycle_1_per: "Rebill Cycle 1 %",
  initials: "Initials",
  initials_revenue: "Initials Revenue",
  rebills: "Rebills",
  rebills_revenue: "Rebills Revenue",
  straight_sales: "Straight Sales",
  straight_sales_revenue: "Straight Sales Revenue",
  gross_revenue: "Gross Revenue",
  net_revenue: "Net Revenue ",
  refund_count: "Refund Count",
  refund: "Refund $",
  chargebacks_count: "Chargebacks Count",
  chargebacks: "Chargebacks $",
  initials_approval_rate: "Initials Approval Rate",
}

export default function Alert({ alert_configurations, alert_history }) {
  const [isModalOpen, setAlertModalOpen] = React.useState(false);
  const [openDeleteModal, setDeleteModal] = React.useState(false);
  const [loader, setLoader] = React.useState(false);

  const [currentAlert, setCurrentAlert] = React.useState(undefined);

  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const router = useRouter();

  const alert_columns = [
    {
      accessorKey: "alert_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Alert Name
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("alert_name")}</div>
      ),
    },
    {
      accessorKey: "alert_type",
      header: "Type",
      cell: ({ row }) => {
        const { metric, condition, value, frequency } = row.original;
        return (
          <div className="capitalize">
            <p>Alert me when <b>{METRIC[metric]}</b> Hits <b>{condition ? "above" : "below"} {value}</b> on <b>{FREQUENCY[frequency]}</b> basis.</p>
          </div>
        );
      },
    },
    {
      accessorKey: "destination_platform",
      header: "Deliver alert on",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("destination_platform")}</div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row.original)} // Replace with your edit logic
          >
            <Pencil1Icon className="ml-2 h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original)} // Replace with your delete logic
          >
            <TrashIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      ),
    }
  ];

  const history_columns = [
    {
      accessorKey: "alert_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Alert Name
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("alert_name")}</div>
      ),
    },
    {
      accessorKey: "alert_type",
      header: "Description",
      cell: ({ row }) => {
        const { metric, condition, metric_value, value } = row.original;
        return (
          <div className="capitalize">
            <p>Alert Triggered! {METRIC[metric]} was {condition ? "above" : "below"} {value}, <b>Actual {METRIC[metric]} value - {metric_value}.</b></p>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("date")}</div>
      ),
    }
  ];

  const alert_table = useReactTable({
    data: alert_configurations,
    columns: alert_columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const history_table = useReactTable({
    data: alert_history,
    columns: history_columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleAlertPageClick = (pageIndex) => {
    alert_table.setPageIndex(pageIndex);
  };

  const handleHistoryPageClick = (pageIndex) => {
    alert_table.setPageIndex(pageIndex);
  };

  const handleOpenAlertModal = () => setAlertModalOpen(true);
  const handleCloseAlertModal = () => {
    setAlertModalOpen(false)
    setCurrentAlert(undefined)
  }

  const handleEdit = (alert_id) => {
    setAlertModalOpen(true);
    setCurrentAlert(alert_id)
  }

  const handleDelete = (alert_id) => {
    setDeleteModal(true);
    setCurrentAlert(alert_id)
  }

  const deleteRecordHandler = async (id) => {
    if (id) {
      setLoader(true);
      const response = await deleteAlertFromDb(id);
      toast(response.msg ?? "somewhere went wrong");
      setLoader(false);
      setDeleteModal(false);
      if (response.success) {
        router.refresh();
      }
    }
  };

  const handleAddUpdateAlert = async (data) => {
    setLoader(true);
    let alert_obj = {
      alert_type: data.condition ? "Positive" : "Negative",
      alert_name: data.alert_name,
      metric: data.metric,
      condition: data.condition,
      value: Number(data.value),
      frequency: data.frequency,
      destination_platform: data.destination_platform,
    }

    let response = null;

    if (data.id) {
      alert_obj.id = data.id;
      response = await updateAlertInDb(alert_obj)
    } else {
      response = await addAlertToDb(alert_obj)
    }

    setLoader(false);
    handleCloseAlertModal();
    toast(response?.msg ?? "Something went wrong");
    if (response?.success) {
      const path = "/alert";
      await revalidatePage(path);
      router.push("/alert");
    }
  };

  const renderAlertPageButtons = () => {
    const currentPage = alert_table.getState().pagination.pageIndex;
    const totalPages = alert_table.getPageCount();
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              handleAlertPageClick(i);
            }}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return pages;
  };

  const renderHistoryPageButtons = () => {
    const currentPage = history_table.getState().pagination.pageIndex;
    const totalPages = history_table.getPageCount();
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              handleHistoryPageClick(i);
            }}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-row h-full">
      <div className="flex flex-col w-full">
        <div className="mb-4">
          <div className="report-header space-y-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">Alerts</h1>
            </div>
          </div>
        </div>
        <Tabs defaultValue="alerts" className="w-full my-2">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-[350px] grid-cols-2">
              <TabsTrigger value="alerts">Alerts ({alert_configurations.length})</TabsTrigger>
              <TabsTrigger value="alert_history">Alert History ({alert_history.length})</TabsTrigger>
            </TabsList>
            <Button className="ml-auto" onClick={handleOpenAlertModal} >Add Alert</Button>
          </div>

          <TabsContent value="alerts" className="w-full">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {alert_table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {alert_table.getRowModel().rows?.length ? (
                    alert_table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={alert_columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="relative py-4">
              <Pagination className="fixed right-0 w-[300px]">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        alert_table.previousPage();
                      }}
                      disabled={!alert_table.getCanPreviousPage()}
                      variant="Link"
                    ><ChevronLeft size={16} /> Previous</Button>
                  </PaginationItem>
                  {renderAlertPageButtons()}
                  <PaginationItem>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        alert_table.nextPage();
                      }}
                      disabled={!alert_table.getCanNextPage()}
                      variant="Link"
                    >Next <ChevronRight size={16} /></Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>
          <TabsContent value="alert_history" className="w-full">
            {/* {alert_history.map(alert => (
            <Card key={alert.id} className="border rounded-lg shadow-sm px-2 mb-4 flex items-center justify-between">
              <div className="flex-1">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg font-semibold">{alert.alert_name}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                  {METRIC[alert.metric]} was {alert.condition ? "above" : "below"} {alert.metric_value}.
                  </CardDescription>
                </CardHeader>
              </div>
              <div className="flex items-center text-gray-500 ml-4">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">{alert.date}</span>
              </div>
            </Card>
          ))} */}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {history_table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {history_table.getRowModel().rows?.length ? (
                    history_table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={history_columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="relative py-4">
              <Pagination className="fixed right-0 w-[300px]">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        history_table.previousPage();
                      }}
                      disabled={!history_table.getCanPreviousPage()}
                      variant="Link"
                    ><ChevronLeft size={16} /> Previous</Button>
                  </PaginationItem>
                  {renderHistoryPageButtons()}
                  <PaginationItem>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        history_table.nextPage();
                      }}
                      disabled={!history_table.getCanNextPage()}
                      variant="Link"
                    >Next <ChevronRight size={16} /></Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setAlertModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleOpenAlertModal} className="hidden">Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{!currentAlert ? "Create alert" : "Update Alert"}</DialogTitle>
            <DialogDescription>
              {!currentAlert ? "Create a new alert here. Click save when you're done." : "Update your alert here. Click update when you're done."}
            </DialogDescription>
          </DialogHeader>
          <AddUpdateAlert onSubmit={handleAddUpdateAlert} currentAlert={currentAlert} loader={loader} />
        </DialogContent>
      </Dialog>

      <Dialog open={openDeleteModal} onOpenChange={setDeleteModal}>
        <DialogTrigger asChild>
          <Button onClick={setDeleteModal} className="hidden">Open</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
            <DialogDescription>Are you sure you want to delete this alert.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
            <ButtonWithLoader
              type="button"
              name="delete"
              size="default"
              variant="destructive"
              buttonText="Delete"
              onClick={() => {
                deleteRecordHandler(currentAlert?.id);
              }}
              loader={loader}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
