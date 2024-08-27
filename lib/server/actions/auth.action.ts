"use server";

import { ActionError } from "@/lib/errors";
import prisma from "@/prisma/prisma";
import { compareSync, hashSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { omit } from "lodash";
import { cookies } from "next/headers";
import { PublicUserProps, userActionSchema } from "../auth.service";
import { auth, CookieKey } from "../utils";
import { client } from "./safe-client";

const schema = userActionSchema;

const cookie = {
  set(
    key: CookieKey,
    value?: string | number,
    options: {
      maxAge?: number;
    } = {},
  ) {
    if (!value) {
      cookies().delete(key);
    } else {
      cookies().set(key, value.toString(), {
        sameSite: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        ...options,
      });
    }
  },
  setAuthToken(user: PublicUserProps) {
    const token = sign(user, process.env.AUTH_SECRET!);
    cookie.set(CookieKey.authToken, token, {
      maxAge: 10,
    });
  },
};

export const register = client
  .schema(schema.register)
  .action(async ({ parsedInput: { name, email, password } }) => {
    email = email.toLowerCase().trim();
    password = hashSync(password);
    const result = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    cookie.setAuthToken(result);

    // TODO: Implement OTP Based Registration Verification
  });

export const loginWithPassword = client
  .schema(schema.loginWithPassword)
  .action(async ({ parsedInput: { email, password } }) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      omit: {
        password: false,
      },
    });

    if (compareSync(password, user?.password || "")) {
      cookie.setAuthToken(omit(user, "password"));
      return;
    }

    throw new ActionError("Invalid Credentials", "BadRequest");
  });

export const getCurrentUser = client.action(async () => auth.currentUser());
