import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Pwa from "@/components/Pwa";
import { NjoftimetLive } from "@/components/NjoftimetLive";

export const metadata: Metadata = {
  title: "RideShare · Udhëtimet për AAB",
  description: "Demonstrim i rrjedhës së RideShare me të dhëna fiktive.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="sq"
      className="h-full"
    >
      <body className="min-h-full flex flex-col">
        <Pwa />
        <NjoftimetLive />
        {children}
      </body>
    </html>
  );
}
