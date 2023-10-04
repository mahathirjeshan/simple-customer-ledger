import { useFetcher, useNavigate } from "@remix-run/react";
import {
  ActionArgs,
  LoaderArgs,
  json,
  redirect,
} from "@remix-run/server-runtime";
import { useForm } from "react-hook-form";
import { string, z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import db from "~/db.server";
import { createCustomer } from "~/services/customer.services";
import { Customer } from "@prisma/client";

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
  balance: z.coerce.number(),
  remark: z.string().optional(),
});

export async function loader({ request }: LoaderArgs) {
  return {};
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const balance = formData.get("balance");
  const remark = formData.get("remark") as string;

  const newCustomer = await createCustomer({
    name,
    phone,
    address,
    balance: Number(balance),
    remark: remark,
  } as Customer);
  return redirect("/customers");
}

export default function () {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      balance: 0,
      remark: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    fetcher.submit(values, {
      method: "POST",
    });
  };

  return (
    <div className="grid grid-cols-4">
      <div className="col-span-4">
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
                    <Input placeholder="for ex. Sarappur" {...field} />
                  </FormControl>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
