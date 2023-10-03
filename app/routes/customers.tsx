import {
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { LoaderArgs, json } from "@remix-run/server-runtime";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/DataTable";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Separator } from "~/components/ui/separator";
import { getCustomers } from "~/services/customer.services";
import { ICustomer } from "~/types/types";
import { Input } from "~/components/ui/input";
import { useState } from "react";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 20;
  const query = searchParams.get("query") || "";

  const customers = await getCustomers({
    page: Number(page),
    limit: Number(limit),
    query: String(query),
  });

  return json(customers);
}

export default function Customer() {
  const navigate = useNavigate();
  // const fetcher = useFetcher();
  const { customers, hasNext, hasPrev, count, currentPage, totalPages } =
    useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    navigate(`/customers?query=${query}&page=${currentPage}`);
  };

  const handleClearSearch = () => {
    setQuery("");
    navigate(`/customers`);
  };

  return (
    <div className="container mx-auto py-5 h-full">
      <div className="flex items-center justify-between space-y-2 mb-5">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate("/customers/new")}>Create New</Button>
        </div>
      </div>
      <div className="grid grid-cols-4 lg:space-x-5 h-full">
        <div className="col-span-4 lg:col-span-2">
          <form
            method="get"
            className="flex w-full max-w-sm items-center space-x-2 mb-4"
            onSubmit={handleSearchSubmit}
          >
            <Input
              name="query"
              type="text"
              placeholder="search with name or phone number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" variant={"default"}>
              Search
            </Button>
            <Button type="button" variant={"ghost"} onClick={handleClearSearch}>
              Clear
            </Button>
          </form>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell className="text-right">
                      {customer.balance}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="w-full py-4 h-[1px]" />
          <Separator />
          <div className="w-full py-5 flex justify-between items-center">
            <Button
              disabled={!hasPrev}
              onClick={() => navigate(`/customers?page=${currentPage - 1}`)}
            >
              Prev
            </Button>
            <div className="text-center">
              from {currentPage} of {totalPages}
            </div>
            <Button
              disabled={!hasNext}
              onClick={() => navigate(`/customers?page=${currentPage + 1}`)}
            >
              Next
            </Button>
          </div>
        </div>
        <div className="col-span-4 lg:col-span-2 lg:border-l">
          <div className="lg:px-5">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
