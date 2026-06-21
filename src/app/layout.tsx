import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DashboardProvider } from "@/context/DashboardContext";

export const metadata: Metadata = {
  title: "HariTva – The AI Sustainability Operating System",
  description: "Predict future impact. Simulate alternatives. Make smarter decisions for the planet.",
  keywords: ["Sustainability", "AI", "Carbon Footprint", "Climate Change", "Decision Intelligence", "Eco OS"],
  authors: [{ name: "HariTva Team" }],
  openGraph: {
    title: "HariTva – The AI Sustainability Operating System",
    description: "Predict future impact. Simulate alternatives. Make smarter decisions for the planet.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090d10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans selection:bg-neon-green/30 selection:text-white">
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </body>
    </html>
  );
}
