"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="text-center py-20 px-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Automation Without Limits,
          <br />
          Power ⚡ Without Effort
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Effortlessly connect your tools, streamline tasks, and unlock a new
          era of productivity powered by seamless automation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Your Business Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg whitespace-nowrap">
            Subscribe
          </Button>
        </div>

        <div className="relative">
          <span className="text-emerald-500 font-medium">
            Get 3 months trial now!
          </span>
          <svg
            className="absolute -right-8 top-2 w-16 h-8 text-emerald-500"
            viewBox="0 0 64 32"
            fill="currentColor"
          >
            <path d="M2 16c0-7.732 6.268-14 14-14s14 6.268 14 14-6.268 14-14 14S2 23.732 2 16zm30 0l16-8v16l-16-8z" />
          </svg>
        </div>

        <p className="text-gray-500 mt-6">Trusted by Company</p>

        <div className="flex items-center justify-center space-x-8 mt-8 opacity-60">
          <span className="text-gray-400 font-medium">Polymath</span>
          <span className="text-gray-400 font-medium">Acme Corp</span>
          <span className="text-gray-400 font-medium">Nietzsche</span>
          <span className="text-gray-400 font-medium">Epicurious</span>
          <span className="text-gray-400 font-medium">CloudWatch</span>
          <span className="text-gray-400 font-medium">Acme Corp</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
