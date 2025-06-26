import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { FirebaseProvider } from "@/integrations/firebase/context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Flowz – Visual Diagram Builder",
  description:
    "Flowz is a powerful, AI-assisted visual diagram builder for creating flowcharts, system architectures, and process diagrams with rectangles, circles, diamonds, triangles, and editable text. Collaborate, design, and visualize ideas effortlessly.",
  keywords: [
    "Flowz",
    "diagram builder",
    "flowchart",
    "AI diagrams",
    "visualization",
    "system architecture",
    "process diagram",
    "collaborative diagrams",
    "editable diagrams",
    "Next.js",
    "React",
  ],
  openGraph: {
    title: "Flowz – Visual Diagram Builder",
    description:
      "Create, edit, and collaborate on diagrams and flowcharts with AI-powered tools. Visualize your ideas with rectangles, circles, diamonds, triangles, and editable text.",
    url: "https://your-flowz-app-url.com",
    siteName: "Flowz",
    images: [
      {
        url: "https://your-flowz-app-url.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Flowz – Visual Diagram Builder",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowz – Visual Diagram Builder",
    description:
      "Create, edit, and collaborate on diagrams and flowcharts with AI-powered tools.",
    images: ["https://your-flowz-app-url.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FirebaseProvider>{children}</FirebaseProvider>
      </body>
    </html>
  );
}
