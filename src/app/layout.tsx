import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FaviconUpdater } from "@/components/favicon-updater";
import { JsonLd } from "@/components/json-ld";
import { createClient } from "@supabase/supabase-js";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

async function getFavicon(): Promise<string> {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return "";
    const sb = createClient(url, key);
    const { data } = await sb.from("SiteContent").select("value").eq("key", "site.favicon").limit(1).single();
    return data?.value || "";
  } catch {
    return "";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const favicon = await getFavicon();

  return {
    metadataBase: new URL("https://billisticbeaniez.com"),
    title: {
      default: "Billistic Beaniez | FIRST LEGO League Robotics Team",
      template: "%s | Billistic Beaniez",
    },
    description:
      "Billistic Beaniez (Team 3818) is a FIRST LEGO League robotics team from Perth, WA. 2025 Innovation Award winners. Explore our robot, project, and journey.",
    keywords: [
      "Billistic Beaniez",
      "FLL",
      "FIRST LEGO League",
      "robotics team",
      "STEM",
      "engineering",
      "LEGO robot",
      "robotics",
      "innovation project",
      "student robotics",
      "FLL competition",
      "robot design",
      "Perth robotics",
      "Western Australia",
      "team 3818",
      "FLL 3818",
    ],
    authors: [{ name: "Billistic Beaniez" }],
    creator: "Billistic Beaniez",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://billisticbeaniez.com",
      siteName: "Billistic Beaniez",
      title: "Billistic Beaniez | FIRST LEGO League Robotics Team",
      description:
        "Billistic Beaniez (Team 3818) is a FIRST LEGO League robotics team from Perth, WA. 2025 Innovation Award winners. Explore our robot, project, and journey.",
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: "Billistic Beaniez, FIRST LEGO League Robotics Team",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Billistic Beaniez | FIRST LEGO League Robotics Team",
      description:
        "Billistic Beaniez (Team 3818) is a FIRST LEGO League robotics team from Perth, WA. 2025 Innovation Award winners. Explore our robot, project, and journey.",
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
      icon: favicon || "/favicon.png",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="canonical" href="https://billisticbeaniez.com/" />
        <meta name="theme-color" content="#0891b2" />
        <link rel="preconnect" href="https://eemruvvaeemlcbgyjwnh.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <JsonLd />
        <FaviconUpdater />
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
