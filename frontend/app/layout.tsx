import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DSS System AHP-MOORA",
  description: "Decision Support System using AHP and MOORA methods",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}