"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deleteUser } from "@/serveractions/actions";
import { useState } from "react";
import ButtonWithLoader from "../buttonwithloader";
import { toast } from "sonner";
import Link from "next/link";
import { ADMIN_ROUTES } from "@/utils/constant";
import { useRouter } from "next/navigation";

export function DataTableRowActions({ row }) {
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [loader, setLoader] = useState(false);
  const rowData = row.original;
  const router = useRouter();

  const deleteRecordHandler = async (id) => {
    if (id) {
      setLoader(true);
      const response = await deleteUser(id);
      toast(response.msg ?? "somewhere went wrong");
      setLoader(false);
      setDeleteModal(false);
      if (response.success) {
        router.refresh();
      }
    }
  };

  return (
    <div className="flex gap-2">
      {/* <Link
        herf="#"
        className={buttonVariants({ variant: "default", size: "sm" })}
      >
        <Pencil size={16} />
      </Link> */}
      <Link href={`${ADMIN_ROUTES?.editUser}/${rowData?.user_id}`} className={buttonVariants({ variant: "default", size: "sm" })}>
        <Pencil size={16} />
      </Link>
      {/* <Button size="sm" variant="default">
        <Pencil size={16} />
      </Button> */}
      <Dialog open={openDeleteModal} onOpenChange={setDeleteModal}>
        <DialogTrigger asChild>
          <Button size="sm" variant="destructive" onClick={setDeleteModal}>
            <Trash2 size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
            <DialogDescription>Are you sure you want to delete this record.</DialogDescription>
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
                deleteRecordHandler(rowData?.user_id);
              }}
              loader={loader}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
