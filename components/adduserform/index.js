"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { createUser, updateUser } from "@/serveractions/actions";
import ButtonWithLoader from "@/components/buttonwithloader";
import { useRouter } from "next/navigation";
import { MultiSelect } from "../ui/multiselect";
import { getReportsOptions } from "@/serveractions/clients";
import { revalidatePage } from "@/serveractions/revalidate";

const addFormSchema = z.object({
  username: z
    .string({
      required_error: "User name is required.",
    })
    .min(1, { message: "Username is required." }),
  password: z.string().min(2, {
    message: "Password is required.",
  }),
  client_id: z.string().min(2, {
    message: "Please select clients.",
  }),
  user_role: z.string().min(2, {
    message: "Please select User role.",
  }),
  report_list: z.string().array().nonempty({
    message: "Please select report list.",
  }),
});

const editFormSchema = z.object({
  username: z
    .string({
      required_error: "User name is required.",
    })
    .min(1, { message: "Username is required." }),
  password: z.string(),
  client_id: z.string().min(2, {
    message: "Please select clients.",
  }),
  user_role: z.string().min(2, {
    message: "Please select User role.",
  }),
  report_list: z.string().array().nonempty({
    message: "Please select report list.",
  }),
});

export default function UserInformationForm({
  formData,
  clients,
  reportsoptionsArray = [],
}) {
  const formSchema = formData?.user_id ? editFormSchema : addFormSchema;
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);
  const [reportsOptions, setReportOptions] = useState(reportsoptionsArray);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: formData?.username ? formData.username : "",
      password: "",
      client_id: formData?.client_id ? formData.client_id : "",
      user_role: formData?.user_role ? formData.user_role : "",
      report_list: formData?.report_list ? formData.report_list.split(",") : [],
    },
  });

  const { setValue } = form;

  async function onSubmit(data) {
    setLoader(true);
    const client_id = data.client_id;
    const client = clients.find((client) => client.client_id === client_id);

    let response = null;
    const finalData = {
      ...data,
      report_list: data.report_list.toString(),
    };
    try {
      if (formData?.user_id) {
        response = await updateUser(
          finalData,
          client?.client_name,
          formData?.user_id
        );
      } else {
        response = await createUser(finalData, client?.client_name);
      }
    } catch (error) {
      console.error(error);
    }

    toast(response?.msg ?? "Something went wrong");
    if (response?.success) {
      const path = "/admin/users/";
      await revalidatePage(path);
      router.push("/admin/users");
    }
    setLoader(false);
  }

  async function clientChangeHandler(selectedValue, field) {
    field.onChange(selectedValue);

    if (selectedValue) {
      const reports = await getReportsOptions(selectedValue);
      if (reports) {
        const optionsArray = reports.map((report) => {
          return {
            value: `${report.report_id}`,
            label: report.report_name,
          };
        });
        setReportOptions(optionsArray);
        setValue("report_list", []);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} method="post">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">User name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
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
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Client</FormLabel>
                <Select
                  onValueChange={(selectedValue) => {
                    clientChangeHandler(selectedValue, field);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients &&
                      clients.length > 0 &&
                      clients.map((client) => (
                        <SelectItem
                          key={client.client_id}
                          value={client?.client_id?.toString()}
                        >
                          {client.client_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="user_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">User role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="report_list"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Report list</FormLabel>
                <MultiSelect
                  className="sm:w-96"
                  selected={field.value}
                  options={reportsOptions}
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <ButtonWithLoader
          className="mt-10"
          type="submit"
          name="submit"
          size="default"
          variant="default"
          buttonText="Submit"
          loader={loader}
        />
      </form>
    </Form>
  );
}
