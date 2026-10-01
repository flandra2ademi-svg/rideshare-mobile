import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RideShare · Udhëtimet për AAB",
  description: "Demonstrim i rrjedhës së RideShare me të dhëna fiktive.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sq"
      className="h-full"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
