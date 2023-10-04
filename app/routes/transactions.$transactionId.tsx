import { useFetcher, useLoaderData } from "@remix-run/react";
import { LoaderArgs, json, redirect } from "@remix-run/server-runtime";
import format from "date-fns/format";
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
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  getTransactionById,
  deleteTransaction,
} from "~/services/transaction.services";

export const loader = async ({ request, params }: LoaderArgs) => {
  const transactionId = params.transactionId as string;

  const transaction = await getTransactionById(+transactionId as number);
  return json({ transaction });
};

export const action = async ({ request, params }: LoaderArgs) => {
  const transactionId = params.transactionId as string;

  const deletedTransaction = await deleteTransaction(+transactionId);

  return redirect("/transactions");
};

export default function () {
  const { transaction } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Transaction Details: </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 mt-2">
        {transaction && (
          <div>
            <strong>Transaction at:</strong>{" "}
            {format(
              new Date(transaction.createdAt as string),
              "dd MMM yyyy 'at' hh:mm a"
            )}
          </div>
        )}
        <div>
          <strong>Customer Name:</strong> {transaction?.customer?.name}
        </div>
        <div>
          <strong>Invoice:</strong> {transaction?.invoiceId}
        </div>
        <div>
          <strong>Due:</strong> {transaction?.due}
        </div>
        <div>
          <strong>Payment:</strong> {transaction?.payment}
        </div>
        <div>
          <strong>Balance after transaction:</strong>{" "}
          {transaction?.balance_after_transaction}
        </div>
        <div>
          <strong>Notes:</strong> {transaction?.notes}
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-center justify-between space-y-0 pb-2">
        <AlertDialog>
          <AlertDialogTrigger type="button" style={{ color: "red" }}>
            {/* <Button type="button" variant={"destructive"}> */}
            Delete
            {/* </Button> */}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                account.
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
  );
}
