"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "@/components/SplashScreen";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const splashShown = sessionStorage.getItem("splashShown");

    if (splashShown) {
      router.replace("/chatbot");
    }
  }, [router]);

  const handleSplashFinish = () => {
    sessionStorage.setItem("splashShown", "true");

    // Small delay for smooth transition
    setTimeout(() => {
      router.replace("/chatbot");
    }, 300);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return null;
}
