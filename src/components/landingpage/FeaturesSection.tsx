"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState("AI Automation");

  const categories = [
    "AI Automation",
    "Lead Management",
    "Sales",
    "Marketing",
    "Support",
    "Finance",
    "HR",
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            Features
          </span>
          <h2 className="text-5xl font-bold text-gray-900 mt-4 mb-6">
            Save time and effort by using our
            <br />
            pre-designed templates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Boost efficiency with ready-to-use templates, streamlining tasks,
            reducing errors, and accelerating workflow automation effortlessly.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                activeTab === category
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500">
              <h3 className="font-semibold text-gray-900 mb-2">Inbox Email</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="h-2 bg-gray-200 rounded flex-1"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="h-2 bg-gray-200 rounded flex-1"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="h-2 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
              <Button className="bg-indigo-600 text-white text-xs px-4 py-1 rounded mt-4">
                Custom
              </Button>
            </div>

            <div className="text-left">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Craft personalized email responses
                <br />
                for customers effortlessly.
              </h4>
              <a
                href="#"
                className="inline-flex items-center text-gray-900 font-medium hover:text-indigo-600"
              >
                Learn more about <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
              <div className="flex justify-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg"></div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg"></div>
                <div className="w-10 h-10 bg-blue-500 rounded-lg"></div>
              </div>
              <Button className="bg-indigo-600 text-white px-6 py-2 rounded-lg">
                Generate
              </Button>
              <div className="mt-4 text-xs text-gray-500">analyzing...</div>
            </div>

            <div className="text-left">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Generate sales call summaries with
                <br />
                AI-powered insights.
              </h4>
              <a
                href="#"
                className="inline-flex items-center text-gray-900 font-medium hover:text-indigo-600"
              >
                Learn more about <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">Chatbot</span>
                <button className="p-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full"></div>
                  <div className="h-2 bg-gray-200 rounded flex-1"></div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full"></div>
                  <div className="h-2 bg-gray-200 rounded flex-1"></div>
                </div>
                <div className="flex justify-end">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                </div>
              </div>
              <button className="mt-4 p-2 bg-gray-100 rounded">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" />
                </svg>
              </button>
            </div>

            <div className="text-left">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Engage leads around the clock with
                <br />
                an intelligent sales chatbot.
              </h4>
              <a
                href="#"
                className="inline-flex items-center text-gray-900 font-medium hover:text-indigo-600"
              >
                Learn more about <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
