"use client";

import { useState, useEffect } from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useFetcher } from "@remix-run/react";
import { Customer } from "@prisma/client";

export function CustomerAutoComplete({ form }: { form: any }) {
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number>();
  const [customers, setCustomers] = useState<Customer[]>([]);

  const handleOnChangeCapture = (e: any) => {
    const value = e.target.value;
    fetcher.submit(
      { q: value },
      {
        method: "POST",
        action: "/search",
      }
    );
  };

  useEffect(() => {
    if (fetcher.data) {
      console.log(fetcher.data);
      setCustomers(fetcher.data);
      // console.log(fetcher.data);
    }
  }, [fetcher.data]);

  return (
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
                    "w-[200px] justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ?? "Select Customer"}
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search framework..."
                  className="h-9"
                  // onChangeCapture={handleOnChangeCapture}
                />
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {customers.map((customer) => (
                    <CommandItem
                      value={String(customer.id)}
                      key={customer.id}
                      onSelect={() => {
                        form.setValue("id", customer.id);
                      }}
                    >
                      {customer.name}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          customer.id === field.value
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
          <FormDescription>Select the customer for transaction</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
