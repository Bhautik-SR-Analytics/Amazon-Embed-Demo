import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { useAppContext } from "@/utils/appcontext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChartBig } from "lucide-react";
import { filterMenuItems } from "@/utils/helper";
import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import Link from 'next/link';

import { BIIcon } from "@/components/ui/icons";

export function ReportSidebar({ pages, activePage, onClickHanlder }) {
  const context = useAppContext();
  const { setGlobalState, siteGlobalState } = context;
  const { reportSideBar } = siteGlobalState;

  const [activeAccordion, setActiveAccordion] = useState("item-0");

  function closeMenu() {
    setGlobalState({ type: "REPORT_SIDEBAR_TOGGLE" });
  }

  function NavMenu({ source }) {
    const filterItems = useMemo(() => filterMenuItems(pages), [pages]); // eslint-disable-line

    return filterItems.map((filterMenuItem, index) => {
      return (
        filterMenuItem.children ? (
          <Accordion key={filterMenuItem.pageKey} collapsible value={activeAccordion} onValueChange={(value) => setActiveAccordion(value)}>
            <AccordionItem className="border-b-0" value={`item-${index}`}>
              <AccordionTrigger className="p-2 hover:no-underline text-sm text-gray-600 rounded-lg hover:bg-gray-100 data-[state=open]:text-black">
                <span className="flex items-center gap-1.5">
                  <BIIcon name={filterMenuItem.icon} size={18} />
                  {filterMenuItem?.pageTitle}
                </span>
              </AccordionTrigger>
              <AccordionContent className="mt-1">
                <nav className="grid items-start text-sm font-medium ml-3">
                  {filterMenuItem?.children &&
                    filterMenuItem.children.map((page) => (
                      <Button
                        onClick={() => onClickHanlder(page, source)}
                        className={`py-0 h-8 hover:no-underline justify-start transition-colors font-normal  ${activePage === page.name ? "text-black font-medium" : "hover:bg-gray-100 text-gray-600 hover:text-black"
                          }`}
                        key={page.name}
                        variant="link"
                      >
                        {page.displayName === "Approval % - Subscriptions" ? "Approval %" : page.displayName}
                      </Button>
                    ))}
                </nav>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <Button
            onClick={() => onClickHanlder(filterMenuItem?.page, source)}
            className={`p-2 w-full hover:no-underline justify-start transition-colors font-normal  ${activePage === filterMenuItem.page.name ? "text-black font-medium" : "hover:bg-gray-100 text-gray-600 hover:text-black"
              }`}
            key={filterMenuItem?.page?.name}
            variant="link"
          >
            <span className="flex items-center gap-1.5 leading-0">
              <BIIcon name={filterMenuItem.icon} size={18} />
              <span className="flex">
                {filterMenuItem?.page?.displayName === "Approval % - Subscriptions" ? "Approval %" : filterMenuItem?.page?.displayName}
              </span>
            </span>
          </Button>
        )
      )
    }
    );
  }

  return (
    <>
      <NavMenu />
      {/* <div className="border-r bg-white">
        <div className="flex-1 hidden lg:block lg:w-64 py-5 px-2">
          <NavMenu />
        </div>
      </div>
      <Sheet open={reportSideBar} onOpenChange={closeMenu}>
        <SheetContent className="w-[275px] py-16" side="left">
          <NavMenu source="sidebar" />
        </SheetContent>
      </Sheet> */}
    </>
  );
}

export function ReportSideBarSkeleton() {
  return (
    <div className="border-r bg-white">
      <div className="flex-1 lg:w-72 py-5">
        <div className="grid items-start px-2 text-sm font-medium space-y-2 lg:px-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </div>
  );
}
