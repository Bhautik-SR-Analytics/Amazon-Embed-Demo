import { getEmbedParamsForMultipleReports } from "@/serveractions/powerbi";
import dynamicComponent from "next/dynamic";
import { CustomLoader } from "@/components/customloader";

const PowerBiReport = dynamicComponent(() => import("@/components/powerbireport"), {
  ssr: false,
});

export const metadata = {
  title: "Reports - Ecomm Embed",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function page() {
  const userReports = await getEmbedParamsForMultipleReports();
  
  if (userReports.success === false) {
    throw Error("User reports Loading Failed");
  }

  return <PowerBiReport emdedData={userReports} />;
}
