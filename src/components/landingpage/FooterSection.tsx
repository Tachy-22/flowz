import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Linkedin, Facebook } from "lucide-react";

const FooterSection = () => {
  return (
    <section className="py-20 px-6 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Sign up for our newsletter and stay updated with the latest news.
            </h2>
          </div>

          <div>
            <div className="mb-8">
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                RECEIVE UPDATES FROM US.
              </span>
              <div className="flex mt-4">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-transparent border-b border-gray-600 rounded-none px-0 py-3 text-white placeholder-gray-400 focus:border-white focus:ring-0"
                />
                <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg ml-4">
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-800">
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Who We Are
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Join Our Team
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  News & Updates
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Meet Our Leaders
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Get in Touch
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Expert Articles
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Webinars & Events
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Solutions</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Smart Hiring
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Engaged Teams
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Insightful Analytics
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Effortless Automation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Scalable Growth
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  System Status Updates
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Community Forum
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Email Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Onboarding & Training
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 AutoMesh . All Right Reserved
          </p>
        </div>
      </div>
    </section>
  );
};

export default FooterSection;
