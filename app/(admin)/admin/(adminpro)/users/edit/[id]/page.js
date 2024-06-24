import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import UserInformationForm from "@/components/adduserform";
import { getUserDataByUserID } from "@/serveractions/actions";
import { getClientLists } from "@/serveractions/clients";
import { getReportsOptions } from "@/serveractions/clients";

export const metadata = {
  title: "Edit User - Ecomm Embed",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function page({ params, searchParams }) {
  const response = await getUserDataByUserID(params?.id);
  const clients = await getClientLists();
  let reportsoptionsArray = [];

  if (response?.client_id) {
    const reportsData = await getReportsOptions(response?.client_id);
    reportsoptionsArray = reportsData.map((report) => {
      return {
        value: `${report.report_id}`,
        label: report.report_name,
      };
    });
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Edit user</CardTitle>
      </CardHeader>
      <CardContent>
        <UserInformationForm
          formData={response}
          clients={clients}
          reportsoptionsArray={reportsoptionsArray}
        />
      </CardContent>
    </Card>
  );
}
