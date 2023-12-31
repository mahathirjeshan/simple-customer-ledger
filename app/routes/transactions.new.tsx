import { zodResolver } from "@hookform/resolvers/zod";
import {
  isRouteErrorResponse,
  useFetcher,
  useFetchers,
  useRouteError,
} from "@remix-run/react";
import {
  ActionArgs,
  LoaderArgs,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/server-runtime";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { CustomerAutoComplete } from "~/components/CustomerAutocomplete";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { useEffect, useState } from "react";
import { Customer } from "@prisma/client";
import { CheckIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { createTransaction } from "~/services/transaction.services";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

const formSchema = z.object({
  customerId: z.coerce.number({ required_error: "Customer is required." }),
  due: z.coerce.number({ required_error: "Due is required." }),
  payment: z.coerce.number({ required_error: "Payment is required." }),
  invoiceId: z.string().optional(),
  notes: z.string().optional(),
});

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  return {};
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const customerId = formData.get("customerId") as string;
  const due = formData.get("due") as string;
  const payment = formData.get("payment") as string;
  const invoiceId = formData.get("invoiceId") as string;
  const notes = formData.get("notes") as string;

  try {
    const transaction = await createTransaction({
      customerId: +customerId,
      due: +due,
      payment: +payment,
      invoiceId,
      notes,
    });

    return redirect(`/transactions/${transaction.id}`);
  } catch (error) {
    throw json({ error }, { status: 500 });
  }
};

export default function NewtransactionForm() {
  const fetcherAutocomplete = useFetcher();
  const fetcherCreateTransaction = useFetcher();
  const [customers, setCustomers] = useState<
    { label: string; value: number }[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: 0,
      due: 0,
      payment: 0,
      invoiceId: "",
      notes: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    fetcherCreateTransaction.submit(data, {
      method: "POST",
    });
  };

  const handleOnChangeCapture = (e: any) => {
    const value = e.target.value;
    fetcherAutocomplete.submit(
      { query: value },
      {
        method: "POST",
        action: "/search",
      }
    );
  };

  useEffect(() => {
    if (fetcherAutocomplete.data) {
      setCustomers(
        fetcherAutocomplete.data.map((customer: any) => ({
          value: +customer.id,
          label: customer.name + " - " + customer.phone,
        }))
      );
    }
  }, [fetcherAutocomplete?.data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Create Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2"></div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Customer</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? customers.find(
                                (customer) => +customer.value === field.value
                              )?.label
                            : "Select customer"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search customer..."
                          className="h-9"
                          onChangeCapture={handleOnChangeCapture}
                        />
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              value={customer.label}
                              key={customer.value}
                              onSelect={() => {
                                form.setValue("customerId", +customer.value);
                              }}
                            >
                              {customer.label}
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  +customer.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the customer for transaction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="John Doe" {...field} />
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
              name="payment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="01..." {...field} />
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
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice No.</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Some note here..." {...field} />
                  </FormControl>
                  {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    let errorContent = (
      <AlertDialogHeader>
        <AlertDialogTitle>{error.data.code}</AlertDialogTitle>
        <AlertDialogDescription>{error.data.message}</AlertDialogDescription>
      </AlertDialogHeader>
    );

    if (error.data.code === "CUS1002") {
      errorContent = (
        <AlertDialogHeader>
          <AlertDialogTitle>{error.data.message}</AlertDialogTitle>
          <AlertDialogDescription>
            Customer has transactions. Please, delete the transation first or
            create a new customer.
          </AlertDialogDescription>
        </AlertDialogHeader>
      );
    }

    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          {errorContent}
          <AlertDialogFooter>
            <AlertDialogCancel>OK</AlertDialogCancel>
            {/* <AlertDialogAction>Continue</AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  } else if (error instanceof Error) {
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{error.message}</AlertDialogTitle>
            <AlertDialogDescription>{error.stack}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>OK</AlertDialogCancel>
            {/* <AlertDialogAction>Continue</AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
