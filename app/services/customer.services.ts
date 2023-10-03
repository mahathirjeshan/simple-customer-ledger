import db from "~/db.server";
import { Customer } from "@prisma/client";
import { Decimal } from "decimal.js";

export const getCustomers = async ({
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

  const customers = await db.customer.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
          },
        },
        {
          phone: {
            contains: query,
          },
        },
      ],
    },
    take,
    skip,
    orderBy: { createdAt: "desc" },
  });

  const count = await db.customer.count();

  return {
    customers,
    count,
    hasNext: count > take + skip,
    hasPrev: skip > 0,
    currentPage: page || 1,
    totalPages: Math.ceil(count / take),
    query: query || "",
  };
};

export const getCustomerById = async (id: number) => {
  return await db.customer.findUnique({ where: { id } });
};

export const createCustomer = async (
  customer: Omit<Customer, "id" | "createdAt" | "updatedAt">
): Promise<Customer> => {
  const balance = new Decimal(customer.balance).toNumber();
  return await db.customer.upsert({
    where: { phone: customer.phone },
    create: {
      ...customer,
      total_due: new Decimal(0).toNumber(),
      total_payment: new Decimal(0).toNumber(),
      balance: balance,
    },
    update: {
      ...customer,
      balance: balance,
    },
  });
};

export const updateCustomer = async (
  id: number,
  customer: Omit<Customer, "id" | "createdAt" | "updatedAt">
): Promise<Customer> => {
  return await db.customer.update({
    where: { id },
    data: {
      ...customer,
    },
  });
};

export const deleteCustomer = async (id: number): Promise<Customer> => {
  return await db.customer.delete({ where: { id } });
};
