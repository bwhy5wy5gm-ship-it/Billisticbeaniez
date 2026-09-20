import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@supabase/supabase-js";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

async function getFavicon(): Promise<string> {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return "/favicon.png";
    const sb = createClient(url, key);
    const { data } = await sb.from("SiteContent").select("value").eq("key", "site.favicon").limit(1).single();
    return data?.value || "/favicon.png";
  } catch {
    return "/favicon.png";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const favicon = await getFavicon();

  return {
    metadataBase: new URL("https://billisticbeaniez.com"),
    title: {
      default: "Billistic Beaniez | Robotics & STEM",
      template: "%s | Billistic Beaniez",
    },
    description:
      "Billistic Beaniez is a FIRST LEGO League robotics team combining engineering, coding, and STEM innovation to solve real world problems. Meet our robot, explore our innovation project, and follow our journey.",
    keywords: [
      "Billistic Beaniez",
      "FLL",
      "FIRST LEGO League",
      "robotics",
      "STEM",
      "engineering",
      "LEGO robot",
      "coding",
      "innovation",
      "ocean science",
    ],
    authors: [{ name: "Billistic Beaniez" }],
    creator: "Billistic Beaniez",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://billisticbeaniez.com",
      siteName: "Billistic Beaniez",
      title: "Billistic Beaniez | Robotics & STEM",
      description:
        "A FIRST LEGO League robotics team combining engineering, coding, and STEM innovation to solve real world problems.",
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: "Billistic Beaniez — FLL Robotics & STEM Team",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Billistic Beaniez | Robotics & STEM",
      description:
        "A FIRST LEGO League robotics team combining engineering, coding, and STEM innovation to solve real world problems.",
      images: ["/og-image.svg"],
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
      icon: favicon,
    },
  };
}

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
            <main className="flex-1 bg-page-pattern">{children}</main>
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
