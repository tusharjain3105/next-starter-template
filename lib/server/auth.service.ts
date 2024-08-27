import { User } from "@prisma/client";
import {
  getCurrentUser,
  loginWithPassword,
  register,
} from "./actions/auth.action";
import { z } from "zod";

export type PublicUserProps = Pick<User, "id" | "name" | "email">;

interface AuthService {
  currentUser(): Promise<PublicUserProps | undefined>;
  register: {
    initiate(user: z.infer<typeof userActionSchema.register>): void;
    verify(otp: string): void;
  };

  login: {
    withOtp(email: string): void;
    verifyOtp(otp: string): void;
    withPassword(email: string, password: string): void;
    withGoogle: {
      authToken(email: string, authToken: string): void;
      accessToken(email: string, accessToken: string): void;
    };
  };

  reset: {
    resetPassword(email: string): void;
    verifyOtp(otp: string): void;
  };
}

const authService: AuthService = {
  async currentUser() {
    const res = await getCurrentUser();
    return res?.data;
  },
  register: {
    initiate: register,
    verify(otp) {
      // TODO: Implement OTP Based Registration Verification
    },
  },

  login: {
    verifyOtp(otp) {
      // TODO: Implement OTP Based authentication
    },
    withOtp(email) {
      // TODO: Implement OTP Based authentication
    },
    async withPassword(email, password) {
      return loginWithPassword({ email, password });
    },
    withGoogle: {
      // TODO: Implement Google authentication
      accessToken(accessToken) {},
      authToken(authToken) {},
    },
  },

  // TODO: Implement OTP Based authentication
  reset: {
    resetPassword(email) {},
    verifyOtp(otp) {},
  },
};

export default authService;

const types = {
  email: z.string().toLowerCase().trim(),
  password: z.string().min(8),
};

export const userActionSchema = {
  register: z
    .object({
      email: types.email,
      name: z.string().trim().min(2).includes(" "),
      password: types.password,
      confirmPassword: z.string(),
    })
    .refine(
      ({ password, confirmPassword }) => {
        return password !== confirmPassword;
      },
      {
        message: "Password does not match",
        path: ["confirmPassword"],
      },
    ),
  loginWithPassword: z.object({
    email: types.email,
    password: types.password,
  }),
};
