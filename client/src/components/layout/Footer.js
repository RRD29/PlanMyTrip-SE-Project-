import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-300">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/about" className="text-base hover:text-white">About</Link></li>
              <li><Link to="/careers" className="text-base hover:text-white">Careers</Link></li>
              <li><Link to="/press" className="text-base hover:text-white">Press</Link></li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-300">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/help" className="text-base hover:text-white">Help Center</Link></li>
              <li><Link to="/safety" className="text-base hover:text-white">Trust & Safety</Link></li>
              <li><Link to="/blog" className="text-base hover:text-white">Blog</Link></li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-300">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/privacy" className="text-base hover:text-white">Privacy</Link></li>
              <li><Link to="/terms" className="text-base hover:text-white">Terms</Link></li>
              <li><Link to="/cookies" className="text-base hover:text-white">Cookie Policy</Link></li>
            </ul>
          </div>
          
          {}
          <div className="col-span-2 md:col-span-1">
             <Link to="/" className="text-white text-2xl font-bold">
              PlanMyTrip ✈️
            </Link>
            <p className="mt-4 text-base">
              Your personal travel planning companion.
            </p>
          </div>

        </div>

        {}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-center">
            &copy; {new Date().getFullYear()} PlanMyTrip, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;