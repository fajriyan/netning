import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Helmet>
        <title>Page Not Found 404 | IPV</title>
        <meta
          name="description"
          content="Aplikasi Simple untuk mengetahui IP Public yang digunakan, dan informasi didalamnya"
        />
        <link rel="canonical" href="https://ipview.pages.dev/" />
      </Helmet>
      <div className="container mx-auto py-6 px-3 md:px-0 space-y-6">
        <div className=" p-3 rounded-xl overflow-hidden text-gray-100 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-100 via-violet-600 to-sky-900 relative">
          <div className="animate-pulse bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-300 via-violet-600 to-sky-900 absolute w-full h-full inset-0"></div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 shadow-2xl md:h-[90dvh] flex flex-wrap flex-col justify-center items-center overflow-hidden">
            <h1 className="font-semibold text-2xl">Error 404</h1>
            <Link
              to="/"
              className="bg-white/40 hover:bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full mt-2 text-xs text-yellow-800"
            >
              Back To Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
