import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import LocationFilter from "@/components/LocationFilter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sameer Hotel Booking App",
  description: "This is an ecommerce Hotel Booking App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex flex-col min-h-screen bg-secondary">
              <Navbar />
              <LocationFilter />
              <section className="flex-grow">
                <Container>{children}</Container>
                <Toaster />
              </section>
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
