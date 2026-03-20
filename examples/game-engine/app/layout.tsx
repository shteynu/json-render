import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "json-render Game Engine",
  description:
    "3D game engine powered by json-render specs and React Three Fiber",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
