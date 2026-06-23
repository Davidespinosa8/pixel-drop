import type { Metadata } from "next";
import { pressStart2P, inter, jetbrainsMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel Drop",
  description: "Descargador familiar de YouTube",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`h-full ${pressStart2P.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text-primary font-body">
        {children}
      </body>
    </html>
  );
}
