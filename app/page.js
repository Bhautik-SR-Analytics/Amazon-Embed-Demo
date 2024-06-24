import Login from "@/components/login";

export const metadata = {
  title: "Login - Ecomm Embed",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page({ searchParams }) {
  const callbackUrl = searchParams.callbackUrl ?? null;
  return <Login callbackUrl={callbackUrl} />;
}
