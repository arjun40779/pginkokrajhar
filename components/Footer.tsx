'use client';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold">ComfortStay PG</span>
            </div>
            <p className="text-gray-400">
              Your home away from home. Comfortable, secure, and affordable
              accommodation for students and professionals.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/rooms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Rooms & Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li>📞 +91 98765 43210</li>
              <li>📧 info@comfortstay.com</li>
              <li>📍 123 MG Road, Bangalore - 560001</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 ComfortStay PG. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

