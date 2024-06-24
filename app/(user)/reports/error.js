"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="bg-red-50 container rounded-lg py-10 px-5 text-center my-10">
      <h2 className="mb-5">Oops, there is an error!</h2>
      <Button type="button" variant="destructive" onClick={() => reset()}>
        Reset
      </Button>
    </div>
  );
}
