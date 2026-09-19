import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://billisticbeaniez.com"),
  title: {
    default: "Billistic Beaniez | FLL Ocean CO₂ Innovation Project",
    template: "%s | Billistic Beaniez",
  },
  description:
    "Billistic Beaniez is a FIRST LEGO League team using seaweed and phytoplankton to remove CO₂ from ocean water. Explore our robot, innovation project, and team journey.",
  keywords: [
    "FLL",
    "FIRST LEGO League",
    "robotics",
    "ocean science",
    "CO₂ removal",
    "seaweed",
    "phytoplankton",
    "STEM",
    "LEGO robot",
    "innovation project",
    "Billistic Beaniez",
  ],
  authors: [{ name: "Billistic Beaniez" }],
  creator: "Billistic Beaniez",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://billisticbeaniez.com",
    siteName: "Billistic Beaniez",
    title: "Billistic Beaniez | FLL Ocean CO₂ Innovation Project",
    description:
      "A FIRST LEGO League team using seaweed and phytoplankton to remove CO₂ from ocean water.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Billistic Beaniez FLL Team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Billistic Beaniez | FLL Ocean CO₂ Innovation Project",
    description:
      "A FIRST LEGO League team using seaweed and phytoplankton to remove CO₂ from ocean water.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
