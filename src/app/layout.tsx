import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "VivaBuddy — Practice the viva", description: "Practice your viva with a local AI examiner, grounded in your own study material." };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
