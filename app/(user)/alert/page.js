import { getAllAlertsFromDb, getAllAlertsHistoryFromDb } from "@/serveractions/alert-actions";
import dynamicComponent from "next/dynamic";
import { CustomLoader } from "@/components/customloader";

const Alert = dynamicComponent(() => import("@/components/alert"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export const metadata = {
  title: "Reports - Ecomm Embed",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function page() {
  const alert_configurations = await getAllAlertsFromDb();
  const alert_history = await getAllAlertsHistoryFromDb();

  return <Alert alert_configurations={alert_configurations} alert_history={alert_history} />;
}
