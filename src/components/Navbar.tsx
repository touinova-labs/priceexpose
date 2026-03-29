'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">PE</span>
            </div>
            <span className="text-2xl font-bold text-black hidden sm:inline">PriceExpose</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/hotels" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
              For Hotels
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              Download
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/hotels"
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              For Hotels
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 rounded transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors mt-2">
              Download
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
