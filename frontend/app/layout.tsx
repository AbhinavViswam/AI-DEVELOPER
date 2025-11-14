import { Metadata } from "next";
import "./globals.css";
import { ClientProvider } from "@/clientProvider";

export const metadata: Metadata = {
  title: 'Z CODE',
  description: 'Collaborate and build with AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
