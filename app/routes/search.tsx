import { ActionArgs, json } from "@remix-run/server-runtime";
import db from "~/db.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const query = formData.get("query") as string;

  // const customer = await db.customer.findMany({
  //   where: {
  //     name: {
  //       contains: query,
  //     },
  //   },
  // });

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
  });

  console.log(customers);

  return json(customers);
};
