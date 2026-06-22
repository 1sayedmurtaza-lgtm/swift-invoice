import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swift Invoice Generator",
  description: "High-velocity field operations invoice system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 m-0 p-0 text-gray-900">
        
        {/* Core application screen viewport */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Global Professional Footer Link Signature */}
        <footer className="w-full text-center py-6 bg-transparent text-xs font-semibold text-gray-400 print:hidden mt-auto">
          Developed by{" "}
          <a 
            href="https://www.nematy.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-emerald-600 hover:text-emerald-700 hover:underline transition-all"
          >
            Murtaza Nematy
          </a>
        </footer>

      </body>
    </html>
  );
}