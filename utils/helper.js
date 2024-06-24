import { startOfDay, format, startOfYear, subYears, endOfDay } from "date-fns";

export function filterMenuItems(pages) {
  const filterItems = [
    {
      pageKey: "reports",
      pageTitle: "Reports",
      icon: "reports",
      children: [],
    }
  ];

  if (pages.length) {
    pages.forEach(function (page) {
      const pageName = page.displayName;
      switch (pageName) {
        case "Home":
          const homePageMenu = {
            pageKey: "home",
            pageTitle: pageName,
            icon: "home",
            page: page,
          };
          filterItems.unshift(homePageMenu);
          break;
        case "data":
          break;
        default:
          filterItems.find((item) => item.pageKey === "reports").children.push(page);
          break;
      }
    });
  }
  return filterItems;
}

export function formatLocalDateWithoutTimezone(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");
}

export function toLocalISOStringWithZeroTime(date) {
  const startOfDayDate = startOfDay(date); // This sets the time to 00:00:00 in local time
  return formatLocalDateWithoutTimezone(startOfDayDate);
}

export function getStartOfPreviousYear() {
  const previousYearStartDate = startOfYear(subYears(new Date(), 1));
  return toLocalISOStringWithZeroTime(previousYearStartDate);
}

export function toLocalISOStringWithEndTime(date) {
  const endOfDayDate = endOfDay(date); // This sets the time to 23:59:59.999 in local time
  return formatLocalDateWithoutTimezone(endOfDayDate);
}
