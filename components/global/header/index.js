"use client";
import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Download, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NavigationMenuBeast } from "@/components/navigation";
import getPowerBiToken from "@/serveractions/getpowerbitoken";
import { useAppContext } from "@/utils/appcontext";

export default function Header() {
  const context = useAppContext();
  const { siteGlobalState, setGlobalState } = context;
  const { pdfData } = siteGlobalState;
  const { reportId, groupId, pageName } = pdfData;
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportReport = async () => {
    if (exportLoading) {
      return;
    }
    setExportLoading(true);

    try {
      const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/ExportTo`;
      const token = await getPowerBiToken();
      if (!token.success) {
        console.error(`Error while retrieving token`);
        return;
      }
      const response = await fetch(reportUrl, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: "PDF",
          powerBIReportConfiguration: {
            pages: [{ pageName: pageName }],
          },
        }),
      });

      if (response.status === 202) {
        const { id: exportId } = await response.json();
        await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for export to complete

        const statusUrl = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/exports/${exportId}`;
        const statusResponse = await fetch(statusUrl, {
          headers: {
            Authorization: "Bearer " + token.accessToken,
          },
        });

        const { resourceLocation, reportName } = await statusResponse.json();
        const pdfFileResponse = await fetch(resourceLocation, {
          headers: {
            Authorization: "Bearer " + token.accessToken,
          },
        });

        const pdfFileBlob = await pdfFileResponse.blob();
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(pdfFileBlob);
        downloadLink.target = "_blank";
        downloadLink.download = reportName + ".pdf";
        downloadLink.click();
      }
      setExportLoading(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setExportLoading(false);
    }
  };
  return (
    <header className="flex-shrink-0 sticky top-0 z-50 border-b bg-white py-4">
      <div className="px-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.svg" alt="Ecomm-Embed" className="h-10 hidden sm:block" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/icon.svg" alt="Ecomm-Embed" className="h-10 block sm:hidden" />
            </Link>
            <Button onClick={() => setGlobalState({ type: "REPORT_SIDEBAR_TOGGLE" })} variant="outline" size="icon" className="shrink-0 lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </div>
          {groupId && reportId && pageName && (
            <Button onClick={handleExportReport} size="sm" variant="outline" className="ml-auto gap-1.5" disabled={exportLoading}>
              {!exportLoading ? <Download size={16} /> : <Loader2 className="h-4 w-4 animate-spin" />}
              <span className="hidden sm:block">Export PDF</span>
            </Button>
          )}
          <Button
            onClick={() => {
              setIsLoading(true);
              signOut();
            }}
            size="sm"
            variant="default"
            className={`gap-1.5 text-sm ${groupId && reportId ? "" : "ml-auto"}`}
          >
            {!isLoading ? <LogOut size={16} /> : <Loader2 className="h-4 w-4 animate-spin" />}
            <span className="hidden lg:block">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
