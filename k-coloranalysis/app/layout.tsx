import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-Color Analysis",
  description:
    "Mobile-first Korean personal color analysis with camera capture, palette matching, and styling recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
