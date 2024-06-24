"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import { useState } from "react";
import { CustomLoader } from "@/components/customloader";
import { Button } from "../ui/button";
import { useAppContext } from "@/utils/appcontext";
import { useSidebar } from "@/utils/sidebar-context";
import { ReportSidebar, ReportSideBarSkeleton } from "../reportsidebar";
import ReportDashboard from "../reportfilter";
import { toLocalISOStringWithZeroTime, toLocalISOStringWithEndTime } from "@/utils/helper";
import { addDays, subDays } from "date-fns";

export default function PowerBiReport({ emdedData }) {
  const { updateSidebarData } = useSidebar();
  const router = useRouter();
  const context = useAppContext();
  const { setGlobalState } = context;
  const [activeReport, setActiveReport] = useState("");
  const [activePage, setActivePage] = useState("");
  const [pages, setPages] = useState([]);
  const { data } = emdedData;
  const { reports, token, tokenExpiry, tokenId } = data;
  const [isLoading, setIsLoading] = useState(false);
  const [starterLoaded, setStartedLoaded] = useState(false);

  //get starter reports from all reports and load that first
  const starterReport = reports.find((report) => report.reportType === "PBI Starter Report" || report.reportType === "Starter Report");
  const otherReports = reports.filter((report) => report.reportType !== "PBI Starter Report" && report.reportType !== "Starter Report");

  const filter = {
    $schema: "http://powerbi.com/product/schema#advanced",
    filterType: models.FilterType.Advanced,
    target: {
      table: "Calendar",
      column: "Date",
    },
    logicalOperator: "And",
    conditions: [
      {
        operator: "GreaterThanOrEqual",
        value: toLocalISOStringWithZeroTime(addDays(new Date(), -28)),
      },
      {
        operator: "LessThan",
        value: toLocalISOStringWithEndTime(subDays(new Date(), 1)),
      },
    ],
  };

  const staterConfig = {
    type: "report",
    embedUrl: starterReport?.embedUrl ?? "",
    tokenType: models.TokenType.Embed,
    accessToken: token,
    settings: {
      panes: {
        pageNavigation: {
          visible: false,
        },
      },
    },
  };

  const staterEventHandlersMap = new Map([
    [
      "loaded",
      async (e) => {
        setStartedLoaded(true);
        const powerBiEmbed = e.target.powerBiEmbed;
        const reportPages = await powerBiEmbed.getPages();

        setPages((prevPages) => {
          const updatedPages = [...prevPages, ...reportPages];
          return updatedPages;
        });

        const homePage = reportPages.find((page) => page.displayName === "Vendor Profitability - Date of Sale");

        // Set the filter on all pages
        await Promise.all(
          reportPages.map(
            (page) => page.displayName !== "Vendor Profitability - Date of Sale" && page.updateFilters(models.FiltersOperations.Replace, [filter]).catch((error) => console.error(error))
          )
        );

        const initalActivePage = await powerBiEmbed.getActivePage();
        if (homePage && initalActivePage !== "Vendor Profitability - Date of Sale") {
          setTimeout(async () => {
            await onClickHanlder(homePage);
          }, 2000);
        }
      },
    ],
    [
      "rendered",
      async (e) => {
        setIsLoading(false);
      },
    ],
    [
      "error",
      (event) => {
        if (event) {
          // console.error(event.detail);
        }
      },
    ],
    ["visualClicked", () => console.log("visual clicked")],
    ["pageChanged", (event) => { }],
  ]);

  const activePageReport = pages.find((page) => page.name === activePage);

  const onClickHanlder = async (page, source, index) => {

    router.push("/reports")
    const name = page.name;

    const report = page.report;

    const reportId = report.config.id;
    const groupId = report.config.groupId;

    setActiveReport(reportId);
    setActivePage(name);

    report.setPage(name);

    setGlobalState({ type: "SET_PDF_DATA", payload: { groupId: groupId, reportId: reportId, pageName: name } });
    if (source === "sidebar") {
      setGlobalState({ type: "REPORT_SIDEBAR_TOGGLE" });
    }
  };

  useEffect(() => {
    updateSidebarData({ pages, activePage, onClickHanlder });
    return () => updateSidebarData(null);
  }, [pages, activePage]);

  return (
    <div className="flex flex-row h-full">
      {/* {pages.length ? <ReportSidebar pages={pages} activePage={activePage} onClickHanlder={onClickHanlder} /> : <ReportSideBarSkeleton />} */}

      <div className="flex-1 pt-4">
        {isLoading && <CustomLoader />}
        <div className="flex flex-col h-full">
          {/* {activePageReport && <ReportDashboard activePage={activePage} activePageReport={activePageReport} pages={pages} onClickHanlder={onClickHanlder} />} */}
          <div className="flex-1">
            {starterReport && (
              <PowerBIEmbed
                embedConfig={staterConfig}
                eventHandlers={staterEventHandlersMap}
                cssClassName={isLoading || activeReport !== starterReport.id ? "hidden" : "report-frame h-full"}
              />
            )}

            {(starterLoaded || !starterReport) &&
              otherReports.length &&
              otherReports.map((report, index) => {
                const config = {
                  type: "report",
                  embedUrl: report.embedUrl,
                  tokenType: models.TokenType.Embed,
                  accessToken: token,
                  settings: {
                    panes: {
                      pageNavigation: {
                        visible: false,
                      },
                    },
                  },
                };

                const eventHandlersMap = new Map([
                  [
                    "loaded",
                    async (e) => {
                      const powerBiEmbed = e.target.powerBiEmbed;
                      const reportPages = await powerBiEmbed.getPages();

                      setPages((prevPages) => {
                        const updatedPages = [...prevPages, ...reportPages];
                        return updatedPages;
                      });

                      const homePage = reportPages.find((page) => page.displayName === "Vendor Profitability - Date of Sale");

                      await Promise.all(
                        reportPages.map(
                          (page) =>
                            page.displayName !== "Vendor Profitability - Date of Sale" && page.updateFilters(models.FiltersOperations.Replace, [filter]).catch((error) => console.error(error))
                        )
                      );

                      const initalActivePage = await powerBiEmbed.getActivePage();
                      if (homePage && initalActivePage !== "Vendor Profitability - Date of Sale") {
                        setTimeout(async () => {
                          await onClickHanlder(homePage);
                        }, 2000);
                      }
                    },
                  ],
                  ["rendered", async (e) => { }],
                  [
                    "error",
                    (event) => {
                      if (event) {
                        // console.error(event.detail);
                      }
                    },
                  ],
                  ["visualClicked", () => console.log("visual clicked")],
                  ["pageChanged", (event) => { }],
                ]);

                return (
                  <PowerBIEmbed
                    key={report.id}
                    embedConfig={config}
                    eventHandlers={eventHandlersMap}
                    cssClassName={isLoading || activeReport !== report.id ? "hidden" : "report-frame h-full"}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
