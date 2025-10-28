import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "@/app/globals.css";
import { Suspense } from "react";
import GaRouteTracker from "@/components/GaRouteTracker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/getDictionary";

export const runtime = 'edge';


const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BelajarFinance",
  description: "Learn personal finance in English and BM.",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className="scroll-smooth">
      <head>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { send_page_view: true });
            `,
          }}
        />
      </head>

      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-background text-foreground font-sans`}
      >
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Navbar/>
        </header>

        <Suspense fallback={null}>
          <GaRouteTracker />
        </Suspense>

        <main className="px-4 py-6 max-w-md mx-auto md:max-w-2xl lg:max-w-3xl">
          {children}
        </main>

        <Footer/>
      </body>
    </html>
  );
}