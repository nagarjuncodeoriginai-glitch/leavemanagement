import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeOrigin.AI - HR Management System",
  description: "Advanced HR & Employee Management System by CodeOrigin.AI",
  keywords: ["HR", "Employee Management", "Leave Management", "CodeOrigin.AI", "HRMS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
