import Link from "next/link";
import { useUserStore } from "@/integrations/zustand";
import { authService } from "@/integrations/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const Navigation = () => {
  const { user, resetUserState } = useUserStore();
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">FZ</span>
          </div>
          <span className="font-semibold text-gray-900">Flowz</span>
        </Link>
        <div className="hidden md:flex items-center space-x-6 text-gray-600">
          {/* <a href="#" className="hover:text-gray-900">
            How it Works
          </a>
          <a href="#" className="hover:text-gray-900">
            Success Stories
          </a>
          <a href="#" className="hover:text-gray-900">
            Pricing
          </a> */}
          {user ? (
            <Link href="/workspace" className="hover:text-gray-900">
              Workspace
            </Link>
          ) : (
            <Link href="/login" className="hover:text-gray-900">
              Sign in
            </Link>
          )}
        </div>
      </div>
      {user ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Avatar className="w-7 h-7">
              <AvatarImage
                src={user?.photoURL || undefined}
                alt={user?.displayName || user?.email || "User"}
              />
              <AvatarFallback>
                {user?.displayName
                  ? user.displayName[0]
                  : user?.email
                  ? user.email[0]
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-700 max-w-32 truncate">
              {user?.displayName || user?.email}
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              authService.signOut();
              resetUserState();
            }}
          >
            Sign out
          </Button>
        </div>
      ) : (
        <a
          href="/register"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
        >
          Get Started
        </a>
      )}
    </nav>
  );
};

export default Navigation;
