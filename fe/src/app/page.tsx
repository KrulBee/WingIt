'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import "./test.css";

export default function Home() {
  const router = useRouter();
  
  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      // If logged in, redirect to home feed
      router.push('/home');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl w-full mx-auto text-center">        <h1 className="text-4xl font-bold mb-6 text-primary test-heading">
          Welcome to WingIt
        </h1>
          <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
          Connect and share with the world through WingIt - built with Next.js, React, and TailwindCSS
        </p>
          <div className="flex justify-center mb-12">
          <Link href="/auth" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
            Sign In / Register
          </Link>
        </div>
        
        <div className="mt-8 flex justify-center">
          <ThemeToggle />
        </div>
        
        <div className="mt-12">
          <Link href="/home" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">
            Go to Home Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
