"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover";

export function DatePickerWithRange({ className, buttonClass, selectedRange, onRangeChange }) {
  // const [date, setDate] = React.useState({
  //   from: new Date(2022, 0, 20),
  //   to: addDays(new Date(2022, 0, 20), 20),
  // });

  const [isOpen, setIsOpen] = React.useState(false);

  function changeDetector(value) {
    setIsOpen(value);
  }

  return (
    <>
      <div className={cn("grid gap-2", className)}>
        <Popover onOpenChange={changeDetector}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn("w-[250px] justify-start text-left font-normal", !selectedRange && "text-muted-foreground", buttonClass)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedRange?.from ? (
                selectedRange.to ? (
                  <>
                    {format(selectedRange.from, "LLL dd, y")} - {format(selectedRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(selectedRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar initialFocus mode="range" defaultMonth={selectedRange?.from} selected={selectedRange} onSelect={onRangeChange} numberOfMonths={2} />
          </PopoverContent>
        </Popover>
      </div>
      {isOpen && <div className="fixed inset-0 size-full"></div>}
    </>
  );
}
