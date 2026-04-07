import type { Metadata } from "next";
import { Inter, Epilogue } from "next/font/google";
import "./globals.css";
// Native Neural Authentication Architecture Replacing Clerk
import { ThemeProvider } from "@/components/core/ThemeProvider";
import { GlobalParticles } from "@/components/core/GlobalParticles";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulsePo!int — Neural Health Intelligence",
  description: "Modern AI healthcare platform",
};

import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${epilogue.variable} antialiased min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-white font-sans`}>
          <ThemeProvider>
            <UserProvider>
              <GlobalParticles />
              <main className="w-full relative z-10 flex flex-col bg-transparent">
                {children}
              </main>
            </UserProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
