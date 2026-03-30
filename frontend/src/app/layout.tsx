import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/core/ThemeProvider";
import { GlobalParticles } from "@/components/core/GlobalParticles";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulsePo!nt — Neural Health Intelligence",
  description: "Modern AI healthcare platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-white`}>
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
  );
}
