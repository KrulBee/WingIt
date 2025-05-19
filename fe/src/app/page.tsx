'use client';

import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import "./test.css";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl w-full mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 text-primary test-heading">
          Welcome to Social Platform
        </h1>
        
        <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
          A modern social experience built with Next.js, React, and TailwindCSS
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
            Login
          </Link>
          <Link href="/register" className="bg-white hover:bg-gray-100 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white font-bold py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600">
            Register
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
