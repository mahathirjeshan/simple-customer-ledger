import { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { app, dialog } from "~/electron.server";
import { Button } from "~/components/ui/button";
import { useFetcher, useLoaderData } from "@remix-run/react";

export const loader = ({ request }: LoaderArgs) => {
  return {};
};

export const action = ({ request }: ActionArgs) => {
  dialog.showSaveDialog({});
  return {};
};

export default function () {
  const fetcher = useFetcher();
  return (
    <Button
      onClick={() =>
        fetcher.submit(null, {
          method: "POST",
        })
      }
    >
      Open Dialog
    </Button>
  );
}
