import db from "~/db.server";
import { Transaction, Customer } from "@prisma/client";
import { Decimal } from "decimal.js";

export const getTransactions = async ({
  limit,
  page,
  query,
}: {
  limit?: number;
  page?: number;
  query?: string;
}) => {
  const take = limit || 10;
  const skip = page ? (page - 1) * take : 0;

  const transactions = await db.transaction.findMany({
    include: {
      customer: true,
    },
    where: {
      OR: [
        {
          customer: {
            name: {
              contains: query,
            },
          },
        },
        {
          customer: {
            phone: {
              contains: query,
            },
          },
        },
      ],
    },
    take,
    skip,
    orderBy: { createdAt: "desc" },
  });

  const count = await db.transaction.count();

  return {
    transactions,
    count,
    hasNext: count > take + skip,
    hasPrev: skip > 0,
    currentPage: page || 1,
    totalPages: Math.ceil(count / take),
  };
};

export const getTransactionById = async (id: number) => {
  return await db.transaction.findUnique({
    where: { id },
    include: { customer: true },
  });
};

export const getTransactionsByCustomerId = async (customerId: number) => {
  return await db.transaction.findMany({ where: { customerId } });
};

export const createTransaction = async (transaction: Partial<Transaction>) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Calculate the balance of the transaction
    const due = new Decimal(transaction.due as number);
    const payment = new Decimal(transaction.payment as number);

    const balance = payment.sub(due).toNumber();

    // 2. Update the customer's balance
    const customer = await tx.customer.update({
      where: { id: transaction.customerId },
      data: {
        balance: {
          increment: balance,
        },
        total_due: {
          increment: due.toNumber(),
        },
        total_payment: {
          increment: payment.toNumber(),
        },
      },
    });

    // 3. Create the transaction
    const createdTransaction = await tx.transaction.create({
      data: {
        ...(transaction as Transaction),
        due: due.toNumber(),
        payment: payment.toNumber(),
        balance_after_transaction: customer.balance,
      },
      include: {
        customer: true,
      },
    });

    return createdTransaction;
  });
};

export const deleteTransaction = async (id: number): Promise<Transaction> => {
  return await prisma.$transaction(async (tx) => {
    // 1. find the transaction
    const transaction = await tx.transaction.findUnique({ where: { id } });

    if (!transaction) {
      throw new Error(`Transaction number ${id} not found.`);
    }

    // 2. Calculate the balance of the transaction
    const due = new Decimal(transaction?.due as number);
    const payment = new Decimal(transaction?.payment as number);

    const balance = payment.sub(due).toNumber();

    console.log({ due, payment, balance });

    // 3. Update the customer's balance
    const customer = await tx.customer.update({
      where: { id: transaction.customerId },
      data: {
        balance: {
          decrement: balance,
        },
        total_due: {
          decrement: due.toNumber(),
        },
        total_payment: {
          decrement: payment.toNumber(),
        },
      },
    });

    // 4. Delete the transaction
    const deletedTransaction = await tx.transaction.delete({
      where: { id },
    });

    return deletedTransaction;
  });
};

const searchTransaction = async () => {};
