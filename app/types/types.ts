import { Customer } from "@prisma/client";

export interface ITransaction {
  id: number;
  customer: Customer;
  customerId: number;
  invoiceId: string;
  amount: number;
  payment: number;
  createdAt: string;
  updatedAtateTime: string;
}

export interface ICustomer {
  id: number;
  name: string;
  phone: string;
  remark?: string | null;
  address?: string | null;
  transactions: ITransaction[];
  balance: number;
  createdAt: string;
  updatedAt: string;
}
