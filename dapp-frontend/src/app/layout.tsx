import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "EnergyCredits DApp",
  description: "Gerencie seus créditos de energia de forma moderna e segura.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className="bg-white text-black dark:bg-black dark:text-white">
      <body className={`${inter.variable} min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 font-sans text-2xl`}> 
        <main className="w-full max-w-2xl px-4 py-8 flex flex-col gap-8">
          {children}
        </main>
      </body>
    </html>
  );
}
