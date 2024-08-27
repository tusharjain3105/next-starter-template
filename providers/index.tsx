"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import GlobalProvider from "./GlobalProvider";
import { PortalProvider } from "./PortalProvider";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => {
        return count < 3;
      },
      staleTime: 2 * 60 * 60 * 1000,
    },
  },
});

export let router: ReturnType<typeof useRouter>;
export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalProvider>
        <ThemeProvider defaultTheme="light" attribute="class">
          <PortalProvider>
            <Toaster richColors closeButton />
            <ReactQueryDevtools />
            {children}
          </PortalProvider>
        </ThemeProvider>
      </GlobalProvider>
    </QueryClientProvider>
  );
}
