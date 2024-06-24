"use client";
import Image from "next/image";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/utils/constant";
import { signIn, useSession } from "next-auth/react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ButtonWithLoader from "@/components/buttonwithloader";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const FormSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
    })
    .min(1, { message: "Username is required" }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(1, { message: "Password is required" }),
});

export default function Login({ callbackUrl }) {
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (status === "authenticated") {
      let redirectUrl = callbackUrl ?? "/reports";
      if (session?.user?.userRole === "ADMIN") {
        redirectUrl = "/admin/dashboard";
      }
      router.push(redirectUrl);
    }
  }, [status]); //eslint-disable-line

  const submitHandler = async (data, event) => {
    event.preventDefault();
    setLoader(true);

    try {
      const res = await signIn("credentials", {
        username: data?.username,
        password: data?.password,
        redirect: false,
      });

      if (res.error) {
        setShowError(res.error);
      }
      if (res.ok) {
        setShowError("");
        setSuccess("Login successfully. redirecting...");
      }
    } catch (error) {
      console.log(error);
    }
    setLoader(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="w-full h-full p-4 lg:p-0">
        <div className="w-full lg:grid lg:min-h-dvh lg:grid-cols-2">
          <div className="hidden bg-muted lg:block">
            <Image
              src="/images/img-login.png"
              alt="Vantage Fly"
              width="845"
              height="633"
              className="h-full w-full object-contain p-12"
              priority={true}
            />
          </div>
          <div className="flex items-center justify-center py-12">
            <div>
              {/*eslint-disable-next-line*/}
              <img
                src="/images/logo.svg"
                width="380"
                height="56"
                alt="Vantage Fly"
                className="h-14 mb-8"
              />
              <div className="mx-auto w-full max-w-96 space-y-8">
                <h1 className="text-xl lg:text-3xl font-bold">Sign in to your account</h1>
                <Form {...form}>
                  <form
                    method="POST"
                    onSubmit={form.handleSubmit(submitHandler)}
                  >
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-card-foreground">
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-card-foreground">
                              Password
                            </FormLabel>
                            <div className="relative">
                              <Input
                                placeholder="Enter Password"
                                type={`${showPassword ? "text" : "password"}`}
                                {...field}
                                className="pr-12"
                              />
                              <Button
                                variant="ghost"
                                type="button"
                                className="absolute top-1/2 right-4 -translate-y-1/2 p-0 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <Eye size={20} />
                                ) : (
                                  <EyeOff size={20} />
                                )}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <ButtonWithLoader
                        type="submit"
                        name="login"
                        size="sm"
                        variant="default"
                        buttonText="Login"
                        loader={loader}
                        className="h-10"
                      />
                      {showError && (
                        <p className="text-sm font-semibold text-center text-destructive">
                          {showError}
                        </p>
                      )}
                      {success && (
                        <p className="text-sm font-semibold text-center text-green-600">
                          {success}
                        </p>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
