import { useMemo, useRef, useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, subDays, startOfDay, format, startOfYear, subYears } from "date-fns";
import { models } from "powerbi-client";
import { DatePickerWithRange } from "../ui/datepicker";

import { FacetedFilter } from "../ui/faceted-filter";

import { formatLocalDateWithoutTimezone, toLocalISOStringWithZeroTime, getStartOfPreviousYear, toLocalISOStringWithEndTime } from "@/utils/helper";

const predefinedRanges = {
  Yesterday: {
    from: toLocalISOStringWithZeroTime(subDays(new Date(), 1)), // Start of yesterday
    to: toLocalISOStringWithEndTime(subDays(new Date(), 1)),
  },
  "Last 7 days": {
    from: toLocalISOStringWithZeroTime(addDays(new Date(), -7)), // Start date is 7 days ago
    to: toLocalISOStringWithEndTime(subDays(new Date(), 1)), // End date is yesterday
  },
  "Last 4 weeks": {
    from: toLocalISOStringWithZeroTime(addDays(new Date(), -28)), // Start date is 28 days ago
    to: toLocalISOStringWithEndTime(subDays(new Date(), 1)), // End date is yesterday
  },
  "Last 3 months": {
    from: toLocalISOStringWithZeroTime(addDays(new Date(), -92)), // Start date is 90 days ago
    to: toLocalISOStringWithEndTime(subDays(new Date(), 1)), // End date is yesterday
  },
  "Last 12 months": {
    from: toLocalISOStringWithZeroTime(addDays(new Date(), -366)), // Start date is 365 days ago
    to: toLocalISOStringWithEndTime(subDays(new Date(), 1)), // End date is yesterday
  },
  "Month to date": {
    from: toLocalISOStringWithZeroTime(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    to: toLocalISOStringWithEndTime(new Date()),
  },
  "Year to date": {
    from: toLocalISOStringWithZeroTime(new Date(new Date().getFullYear(), 0, 1)),
    to: toLocalISOStringWithEndTime(new Date()),
  },
  "All time": {
    from: getStartOfPreviousYear(),
    to: toLocalISOStringWithEndTime(new Date()),
  },
  Custom: {}, // Placeholder for custom range
};

const cycleeOptions = [
  { value: " Initials", label: "Initials" },
  { value: "Cycle 1", label: "Cycle 1" },
  { value: "Cycle 2", label: "Cycle 2" },
  { value: "Cycle 3", label: "Cycle 3" },
  { value: "Cycle 4", label: "Cycle 4" },
  { value: "Cycle 5", label: "Cycle 5" },
  { value: "Cycle 6+", label: "Cycle 6+" },
];

const attemptOptions = [
  { value: `1`, label: "1" },
  { value: `2`, label: "2" },
  { value: `3`, label: "3" },
  { value: `4`, label: "4" },
  { value: `5`, label: "5" },
  { value: `6+`, label: "6+" },
];

function PageTabs({ approvalMenuTabs, onClickHanlder, activePage }) {
  const borderRef = useRef(null);
  const tabsRef = useRef([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    function setTabPosition() {
      const borderRefEle = borderRef?.current;
      const currentTab = tabsRef?.current ? tabsRef?.current[activeTabIndex] : undefined;

      if (borderRefEle && currentTab) {
        const offsetLeft = currentTab?.offsetLeft ?? 0;
        const clientWidth = currentTab?.clientWidth ?? 0;

        borderRefEle.style.setProperty("left", offsetLeft + "px");
        borderRefEle.style.setProperty("width", clientWidth + "px");
      }
    }

    setTabPosition();
    window.addEventListener("resize", setTabPosition);

    return () => window.removeEventListener("resize", setTabPosition);
  }, [activeTabIndex]);

  function onTabClickHandler(tab, index) {
    onClickHanlder(tab);
    setActiveTabIndex(index);
  }

  return (
    <div className="border-b-2 border-[#E2E8F0] flex gap-4 sm:gap-7 pb-2 relative">
      {approvalMenuTabs.map((tab, index) => (
        <button
          ref={(el) => (tabsRef.current[index] = el)}
          className={`text-sm sm:text-lg font-semibold ${activePage === tab.name ? "text-indigo-600" : ""}`}
          key={tab.name}
          variant="link"
          onClick={() => onTabClickHandler(tab, index)}
        >
          {tab.displayName === "Approval % - Subscriptions" && "Subscriptions"}
          {tab.displayName === "Approval % - Straight Sales" && "Straight Sales"}
        </button>
      ))}
      <span ref={borderRef} className="h-0.5 -mb-[2px] bg-indigo-600 absolute bottom-0 transition-all duration-300 z-10"></span>
    </div>
  );
}

function ReportFilter({ activePageReport }) {
  const [state, setState] = useState({
    from: toLocalISOStringWithZeroTime(addDays(new Date(), -28)),
    to: toLocalISOStringWithEndTime(subDays(new Date(), 1)),
  });

  const [dateSelect, setDateSelect] = useState(
    JSON.stringify({
      from: toLocalISOStringWithZeroTime(addDays(new Date(), -28)),
      to: toLocalISOStringWithEndTime(subDays(new Date(), 1)),
    })
  );

  const [billingCycle, setBillingCycle] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const handleRangeChange = async (range) => {
    if (typeof range === "string") {
      range = JSON.parse(range);
    }

    let from = range?.from;
    let to = range?.to;

    if (from instanceof Date) {
      from = toLocalISOStringWithZeroTime(from);
    }

    if (to instanceof Date) {
      to = toLocalISOStringWithEndTime(to);
    }

    // Check if the range matches any predefined range
    const matchingRange = Object.keys(predefinedRanges).find((key) => {
      const predefinedRange = predefinedRanges[key];
      return predefinedRange?.from === from && predefinedRange?.to === to;
    });

    const selectData = matchingRange ? JSON.stringify({ from: from, to: to }) : JSON.stringify({});

    setState({ from: from, to: to });
    setDateSelect(selectData);
    filterReport({ from: from, to: to });
  };

  async function filterReport(range) {
    if (range.from && range.to) {
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
            value: range.from,
          },
          {
            operator: "LessThan",
            value: range.to,
          },
        ],
      };

      console.log(await activePageReport.getFilters());

      await activePageReport.updateFilters(models.FiltersOperations.Replace, [filter]).catch((error) => console.error(error));

      console.log(await activePageReport.getFilters());
    }
  }

  async function HanldeBillingCycleFilter(value) {
    if (value) {
      const Operator = value.length === cycleeOptions.length || value.length === 0 ? "All" : "In";
      const filterArray = value.length === cycleeOptions.length || value.length === 0 ? [] : value;

      let uniqueArray = [...new Set(filterArray)];

      const filter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
          table: "order_details",
          column: "Billing Cycle",
        },
        operator: Operator,
        requireSingleSelection: false,
        values: uniqueArray,
      };

      await activePageReport.updateFilters(models.FiltersOperations.Replace, [filter]).catch((error) => console.error(error));

      setBillingCycle(value);
    }
  }

  async function HanldeAttemptFilter(value) {
    if (value) {
      const Operator = value.length === cycleeOptions.length || value.length === 0 ? "All" : "In";
      const filterArray = value.length === cycleeOptions.length || value.length === 0 ? [] : value;

      let uniqueArray = [...new Set(filterArray)];

      const filter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
          table: "order_details",
          column: "Attempt Count",
        },
        operator: Operator,
        requireSingleSelection: false,
        values: uniqueArray,
      };

      await activePageReport.updateFilters(models.FiltersOperations.Replace, [filter]).catch((error) => console.error(error));

      setAttempts(value);
    }
  }

  const needCycleFilter =
    activePageReport.displayName === "Approval % - Subscriptions" ||
    activePageReport.displayName === "AI Insights - Approval %" ||
    activePageReport.displayName === "AI Insights - Sales";

  const needAttempFilter =
    activePageReport.displayName === "Approval % - Subscriptions" ||
    activePageReport.displayName === "Approval % - Straight Sales" ||
    activePageReport.displayName === "AI Insights - Approval %" ||
    activePageReport.displayName === "AI Insights - Sales";

  useEffect(() => {
    if (needCycleFilter) {
      HanldeBillingCycleFilter([" Initials"]);
    }
  }, [activePageReport]); // eslint-disable-line

  useEffect(() => {
    if (needAttempFilter) {
      HanldeAttemptFilter(["1"]);
    }
  }, [activePageReport]); // eslint-disable-line

  useEffect(() => {
    filterReport(state);
  }, [activePageReport]); // eslint-disable-line

  return (
    <div className="flex gap-2 md:gap-5 flex-wrap">
      <div className="date-filter flex">
        <Select value={dateSelect} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-[120px] md:w-[150px] rounded-tr-none rounded-br-none focus:ring-0 -mr-[1px] text-xs md:text-sm">
            <SelectValue placeholder="Select a date" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.keys(predefinedRanges).map((range) => {
                return (
                  <SelectItem key={range} value={JSON.stringify(predefinedRanges[range])}>
                    {range}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DatePickerWithRange
          selectedRange={state}
          onRangeChange={handleRangeChange}
          buttonClass="rounded-tl-none rounded-bl-none text-xs md:text-sm w-[200px] md:w-[250px]"
        />
      </div>

      {needCycleFilter && (
        <div className="cycle-filter">
          <FacetedFilter options={cycleeOptions} selected={billingCycle} onChange={HanldeBillingCycleFilter} title="Cycle" />
        </div>
      )}
      {needAttempFilter && (
        <div className="attempt-filter">
          <FacetedFilter options={attemptOptions} selected={attempts} onChange={HanldeAttemptFilter} title="Attempt" />
        </div>
      )}
    </div>
  );
}

export default function ReportDashboard({ activePageReport, pages, onClickHanlder, activePage }) {
  const name = activePageReport?.displayName ?? "";
  const approvalMenuTabs = useMemo(() => {
    return pages.filter((page) => page.displayName === "Approval % - Subscriptions" || page.displayName === "Approval % - Straight Sales");
  }, [pages]);

  if (name === "Vendor Profitability - Date of Sale") {
    return null;
  }

  return (
    <div className="px-4 flex-shrink-0 mb-4">
      <div className="report-header space-y-4">
        {name !== "Vendor Profitability - Date of Sale" && name && (
          <div className="">
            <h1 className="text-xl sm:text-3xl font-bold">
              {name === "Approval % - Subscriptions" || name === "Approval % - Straight Sales" ? "Approval %" : name}
            </h1>
          </div>
        )}

        {(name === "Approval % - Subscriptions" || name === "Approval % - Straight Sales") && (
          <PageTabs approvalMenuTabs={approvalMenuTabs} onClickHanlder={onClickHanlder} activePage={activePage} />
        )}
        <ReportFilter activePageReport={activePageReport} />
      </div>
    </div>
  );
}
