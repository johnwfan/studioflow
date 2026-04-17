import { ClerkProvider } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

import ThemeProvider from "@/components/theme-provider";
import { defaultTheme, isThemeId, themeCookieName } from "@/lib/themes";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "studioflow",
  description: "A creator workflow platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get(themeCookieName)?.value;
  const initialTheme =
    storedTheme && isThemeId(storedTheme) ? storedTheme : defaultTheme;
  const isDarkTheme = initialTheme === "noir";

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={[inter.variable, isDarkTheme ? "dark" : ""]
          .filter(Boolean)
          .join(" ")}
        data-theme={initialTheme}
        style={{ colorScheme: isDarkTheme ? "dark" : "light" }}
      >
        <body suppressHydrationWarning>
          <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
