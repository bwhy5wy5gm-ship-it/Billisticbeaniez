import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FaviconUpdater } from "@/components/favicon-updater";
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
      "Meet Billistic Beaniez, a student FIRST LEGO League robotics team. Explore our robot, engineering, Innovation Project, research, achievements, and FLL journey.",
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
        "Meet Billistic Beaniez, a student FIRST LEGO League robotics team. Explore our robot, engineering, Innovation Project, research, achievements, and FLL journey.",
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: "Billistic Beaniez — FIRST LEGO League Robotics Team",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Billistic Beaniez | FIRST LEGO League Robotics Team",
      description:
        "Meet Billistic Beaniez, a student FIRST LEGO League robotics team. Explore our robot, engineering, Innovation Project, research, achievements, and FLL journey.",
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Billistic Beaniez",
  url: "https://billisticbeaniez.com",
  description:
    "Billistic Beaniez is a student FIRST LEGO League (FLL) robotics team. The team designs, builds, and programs LEGO robots, develops Innovation Projects, and competes in FLL robotics competitions, combining engineering, programming, research, and STEM innovation.",
  logo: "https://billisticbeaniez.com/og-image.svg",
  sameAs: [],
  foundingDate: "2025",
  keywords: "FIRST LEGO League, FLL, robotics team, STEM, engineering, LEGO robot, innovation project",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Billistic Beaniez",
  url: "https://billisticbeaniez.com",
  description:
    "Billistic Beaniez is a student FIRST LEGO League robotics team. Explore our robot, Innovation Project, research, and FLL journey.",
  publisher: {
    "@type": "Organization",
    name: "Billistic Beaniez",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
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
