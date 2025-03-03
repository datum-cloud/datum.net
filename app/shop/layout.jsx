import "@/app/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Header from '@/components/header';
import Footer from '@/components/footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <div className="bg-white mx-auto px-4 py-8">
          {children}
        </div>
        <Footer/>
      </body>
    </html>
  );
}
