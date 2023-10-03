import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  LoaderArgs,
  SerializeFrom,
  json,
  redirect,
} from "@remix-run/server-runtime";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getCustomerById, updateCustomer } from "~/services/customer.services";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ICustomer } from "~/types/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import db from "~/db.server";
import { Customer } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z
    .string()
    .min(11, {
      message: "Phone must be at least 11 characters.",
    })
    .max(11, {
      message: "Phone must be at most 11 characters.",
    }),
  address: z.string().optional(),
  remark: z.string().optional(),
});

export const loader = async ({ request, params }: LoaderArgs) => {
  const { customerId } = params;
  if (!customerId)
    throw json({ message: `Customer not found` }, { status: 404 });
  const customer = await getCustomerById(+customerId);
  return json({ customer });
};

export const action = async ({ request, params }: LoaderArgs) => {
  const customerId = params.customerId as string;

  if (request.method === "DELETE") {
    await db.customer.delete({
      where: {
        id: +customerId,
      },
    });
    return redirect("/customers");
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const phone = formData.get("phone");
  const address = formData.get("address");
  const remark = formData.get("remark");

  const customer = await updateCustomer(+customerId, {
    name,
    phone,
    address,
    remark,
  } as Customer);

  return json({ customer });
};

export default function CustomersPage() {
  const fetcher = useFetcher();
  const { customer } = useLoaderData<typeof loader>();
  const [mode, setMode] = useState<"view" | "edit">("view");

  const onCancel = useCallback(() => {
    setMode("view");
  }, [mode]);

  const onSuccess = useCallback(() => {
    setMode("view");
  }, [mode]);

  return (
    <>
      {mode === "view" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Customer Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 mt-2">
            <div>
              <strong>Name:</strong> {customer?.name}
            </div>
            <div>
              <strong>Addr.:</strong> {customer?.address}
            </div>
            <div>
              <strong>Phone:</strong> {customer?.phone}
            </div>
            <div>
              <strong>Remark:</strong> {customer?.remark}
            </div>
            <div>
              <strong>Balance:</strong> {customer?.balance}
            </div>
            <div>
              <strong>Total Due:</strong> {customer?.total_due}
            </div>
            <div>
              <strong>Total Payment:</strong> {customer?.total_payment}
            </div>
          </CardContent>
          <CardFooter className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Button
              type="button"
              variant={"default"}
              onClick={() => setMode("edit")}
            >
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger>
                <Button type="button" variant={"destructive"}>
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      fetcher.submit(null, {
                        method: "DELETE",
                      });
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      )}
      {mode === "edit" && (
        <CustomerEditForm
          customer={customer as unknown as Customer}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      )}
    </>
  );
}

export function CustomerEditForm({
  onSuccess,
  onCancel,
  customer,
}: {
  onSuccess: () => void;
  onCancel: () => void;
  customer: Customer;
}) {
  const fetcher = useFetcher();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer?.name,
      phone: customer?.phone,
      address: customer?.address as string,
      remark: customer?.remark as string,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    fetcher.submit(values, {
      method: "POST",
    });
  };

  useEffect(() => {
    if (fetcher.data) {
      onSuccess();
    }
  }, [fetcher.data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Customer Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 mt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="01..." {...field} />
                  </FormControl>
                  {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="vill: Sarappur" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remark</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Button type="submit">Submit</Button>
              <Button type="button" onClick={onCancel} variant={"ghost"}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
