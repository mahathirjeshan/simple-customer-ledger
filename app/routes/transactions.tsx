import {
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { LoaderArgs, json } from "@remix-run/server-runtime";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getTransactions } from "~/services/transaction.services";
import format from "date-fns/format";
import { Separator } from "~/components/ui/separator";
import { useCallback, useState } from "react";
import { Input } from "~/components/ui/input";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 20;
  const query = searchParams.get("query") || "";

  const customers = await getTransactions({
    page: Number(page),
    limit: Number(limit),
    query: String(query),
  });

  return json(customers);
}

export default function Customer() {
  const navigate = useNavigate();
  const { transactions, hasNext, hasPrev, currentPage, totalPages } =
    useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-5 h-full">
      <div className="flex items-center justify-between space-y-2 mb-5">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate("/transactions/new")}>
            Create New
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-6 space-x-5 h-full">
        <div className="col-span-6 lg:col-span-4">
          {/* <DataTable columns={columns} data={customers} /> */}
          <SearchForm />
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-center">Customer Name</TableHead>
                  <TableHead className="text-center">Due</TableHead>
                  <TableHead className="text-center">Payment</TableHead>
                  <TableHead className="text-center">Balance at Tr.</TableHead>
                  <TableHead className="text-center">Inv. No.</TableHead>
                  <TableHead className="text-center">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tr) => (
                  <TableRow
                    key={tr.id}
                    onClick={() => navigate(`/transactions/${tr.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell className="font-medium">{tr.id}</TableCell>
                    <TableCell>
                      {format(
                        new Date(tr.createdAt),
                        "dd MMM yyyy 'at' hh:mm a"
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {tr?.customer?.name}
                    </TableCell>
                    <TableCell className="text-center">{tr?.due}</TableCell>
                    <TableCell className="text-center">{tr?.payment}</TableCell>
                    <TableCell className="text-center">
                      {tr?.balance_after_transaction}
                    </TableCell>
                    <TableCell className="text-center">
                      {tr?.invoiceId}
                    </TableCell>
                    <TableCell className="text-center">{tr?.notes}</TableCell>
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
              onClick={() => navigate(`/transactions?page=${currentPage - 1}`)}
            >
              Prev
            </Button>
            <div className="text-center">
              from {currentPage} of {totalPages}
            </div>
            <Button
              disabled={!hasNext}
              onClick={() => navigate(`/transactions?page=${currentPage + 1}`)}
            >
              Next
            </Button>
          </div>
        </div>
        <div className="col-span-6 lg:col-span-2 lg:border-l">
          <div className="lg:px-5">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchForm() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      const params = new URLSearchParams();
      params.set("query", query);
      setSearchParams(params);
    },
    [query]
  );

  const handleClearSearch = useCallback(() => {
    setQuery("");
    setSearchParams(new URLSearchParams());
  }, []);

  return (
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
  );
}
