import { useLoaderData } from "@remix-run/react";
import db from "~/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export async function loader() {
  const totalDue = await db.customer.aggregate({
    _sum: {
      total_due: true,
    },
  });

  const totalpayment = await db.customer.aggregate({
    _sum: {
      total_payment: true,
    },
  });

  const totalBalance = await db.customer.aggregate({
    _sum: {
      balance: true,
    },
  });

  const totalDueThisMonth = await db.transaction.aggregate({
    _sum: {
      due: true,
    },
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      },
    },
  });

  const totalPaymentThisMonth = await db.transaction.aggregate({
    _sum: {
      payment: true,
    },
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      },
    },
  });

  const newCustomersThisMonth = await db.customer.count({
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      },
    },
  });

  const newCsutomersLastMonth = await db.customer.count({
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      },
    },
  });

  console.log(new Date().getFullYear(), new Date().getMonth(), 1);

  return {
    totalDue,
    totalpayment,
    totalBalance,
    totalDueThisMonth,
    totalPaymentThisMonth,
    newCustomersThisMonth,
    newCsutomersLastMonth,
  };
}

export default function Index() {
  const {
    totalDue,
    totalpayment,
    totalBalance,
    totalDueThisMonth,
    totalPaymentThisMonth,
    newCustomersThisMonth,
    newCsutomersLastMonth,
  } = useLoaderData<typeof loader>();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 py-5">
      {totalBalance?._sum && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <TakaSign />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {String(totalBalance?._sum.balance)}
            </div>
          </CardContent>
        </Card>
      )}

      {totalDue?._sum && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <TakaSign />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDue?._sum.total_due}</div>
          </CardContent>
        </Card>
      )}

      {totalpayment?._sum && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payment</CardTitle>
            <TakaSign />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(totalpayment?._sum.total_payment)}
            </div>
          </CardContent>
        </Card>
      )}

      {!!newCustomersThisMonth && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Customer this month
            </CardTitle>
            <TakaSign />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCustomersThisMonth}</div>
            <p className="text-slate-300">
              New customer on last month was {newCsutomersLastMonth}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TakaSign() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="#000"
      className="icon flat-color"
      data-name="Flat Color"
      viewBox="0 0 24 24"
    >
      <path
        fill="#000"
        d="M18.67 12.16a3.9 3.9 0 00-2.32-2.11 1 1 0 00-.63 1.9 1.87 1.87 0 011.12 2.53l-1.75 3.94A2.66 2.66 0 0110 17.34V12h2a1 1 0 000-2h-2V6a4 4 0 00-4-4 1 1 0 000 2 2 2 0 012 2v4H6a1 1 0 000 2h2v5.34a4.66 4.66 0 008.92 1.89l1.75-3.93a3.9 3.9 0 000-3.14z"
      ></path>
    </svg>
  );
}
