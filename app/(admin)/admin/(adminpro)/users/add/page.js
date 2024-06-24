import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import UserInformationForm from "@/components/adduserform";
import { getClientLists } from "@/serveractions/clients";

export const metadata = {
  title: "Add User - Vantage Fly",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  const clients = await getClientLists();

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Add user</CardTitle>
      </CardHeader>
      <CardContent>
        <UserInformationForm clients={clients} />
      </CardContent>
    </Card>
  );
}
