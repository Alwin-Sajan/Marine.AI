"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata = {
  title: "My App",
  description: "An example app with a splash screen",
};

export default function RootLayout({ children }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if splash was already shown in this session
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
      setIsLoading(false);
    }
  }, []);

  const handleSplashFinish = () => {
    // sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
    setIsLoading(false);
    // Add a small delay before showing content for smooth transition
    setTimeout(() => {
      setIsLoading(false);
    }, 30);
  };

  


  return (
    <html lang="en">
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        {!isLoading && children}
      </body>
    </html>
  );
}