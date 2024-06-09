import type { ActionFunction } from "@remix-run/node";
import { deleteHighlight } from "~/features/Highlight/apis/deleteHighlight";
import invariant from "tiny-invariant";
import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { setToastInSession } from "~/features/Notification/functions/setToastInSession.server";

export const action: ActionFunction = async ({
  request,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const highlightId = formData.get("highlightId");

  invariant(typeof highlightId === "string", "highlightId must be a string");

  const result = await deleteHighlight(highlightId, context);

  if (result.status === 201) {
    const headers = await setToastInSession(request, "HighlightDeleted");
    return redirect("/highlights/all", { headers });
  } else {
    return json({ message: "An error occurred" }, { status: 500 });
  }
};
