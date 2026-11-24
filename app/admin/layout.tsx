import type { Metadata } from "next";
export const metadata: Metadata = { title: { default: "Admin", template: "%s | E&J Admin" }, robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
