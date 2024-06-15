import "@/styles/globals.css";
import { Inter as FontSans } from "next/font/google";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {process.env.OMP_WEB_GUI === "true" ? (
            children
          ) : (
            <main className="fixed inset-0 z-40 flex text-center items-center justify-center">
              <p className="mt-3 text-lg font-semibold leading-6">
                The OpenMojangProject Web GUI has been disabled by the system
                administrator.
              </p>
            </main>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
