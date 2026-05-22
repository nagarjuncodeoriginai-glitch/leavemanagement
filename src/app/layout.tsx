import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HRMS - Human Resource Management System",
  description: "Advanced HR & Employee Management System with Leave Tracking",
  keywords: ["HR", "Employee Management", "Leave Management", "HRMS"],
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
