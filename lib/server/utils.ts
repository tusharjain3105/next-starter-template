import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { PublicUserProps } from "./auth.service";

export enum CookieKey {
  authToken = "auth-token",
  registerOtp = "register-otp",
  loginOtp = "login-otp",
  resetOtp = "reset-otp",
}

export const auth = {
  currentUser: () => {
    const token = cookies().get(CookieKey.authToken)?.value;
    if (token) {
      const user = verify(token, process.env.SECRET_KEY!) as PublicUserProps;
      if (user) {
        return user;
      }
      cookies().delete(CookieKey.authToken);
    }
  },
};
