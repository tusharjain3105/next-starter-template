import { ActionError, AuthenticationError } from "@/lib/errors";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { headers } from "next/headers";

export const client = createSafeActionClient({
  handleReturnedServerError(e): string {
    if (e instanceof ActionError || e instanceof AuthenticationError)
      return e.message;

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  defaultValidationErrorsShape: "flattened",
}).use(async ({ next }) => {
  const url = new URL(headers().get("referer")!);

  const _headers = Object.fromEntries(headers().entries());

  const ctx = {
    cookies: Object.fromEntries(parseCookie(_headers.cookie || "").entries()),
    href: url.href,
    path: url.pathname,
    search: url.search,
  };

  return next({ ctx });
});

export const authClient = client.use(async ({ ctx, next }) => {
  // TODO: Fetch User
  const user = null;

  if (!user) {
    throw new ActionError(
      "You are not authorized to perform this action",
      "Unauthorized",
    );
  }

  return next({ ctx: { ...ctx, user } });
});

export const adminClient = authClient.use(async ({ ctx, next }) => {
  // TODO: Validate Admin
  const isAdmin = false;

  if (!isAdmin) {
    throw new ActionError(
      "You are not authorized to perform this action",
      "Unauthorized",
    );
  }
  return next({ ctx });
});
