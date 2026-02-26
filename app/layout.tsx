import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const uncageSans = localFont({
  src: [
    { path: "../font/UNCAGE-Regular.ttf", weight: "400", style: "normal" },
    { path: "../font/UNCAGE-Medium.ttf", weight: "500", style: "normal" },
    { path: "../font/UNCAGE-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-uncage-sans",
  display: "swap",
});

const uncageDisplay = localFont({
  src: [{ path: "../font/UNCAGE-Bold.ttf", weight: "700", style: "normal" }],
  variable: "--font-uncage-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eblen Sushi",
  description: "Быстрая доставка суши и сетов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${uncageSans.variable} ${uncageDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
