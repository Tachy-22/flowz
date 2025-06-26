const Navigation = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <div className="flex items-center space-x-8">
        <div className=" font-bold flex items-center justify-center gap-1">
          <span className="text-white  w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center ">
            {" "}
            F
          </span>{" "}
          LOWZ
        </div>
        <div className="hidden md:flex items-center space-x-6 text-gray-600">
          <a href="#" className="hover:text-gray-900">
            How it Works
          </a>
          <a href="#" className="hover:text-gray-900">
            Success Stories
          </a>
          <a href="#" className="hover:text-gray-900">
            Pricing
          </a>
          <a href="/login" className="hover:text-gray-900">
            Sign in
          </a>
        </div>
      </div>
      <a
        href="/register"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
      >
        Get Started
      </a>
    </nav>
  );
};

export default Navigation;
