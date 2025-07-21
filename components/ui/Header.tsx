'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 h-20 bg-transparent">
      <Link href="/">
        <Image
          src="/logo2Switch.png" // path relative to /public
          alt="SwitchFi Logo"
          width={80} // desired width
          height={80} // desired height
          priority // loads it eagerly for important images like logos
          style={{ transform: 'scale(1.5)' }}
        />
      </Link>
      <nav className="flex gap-18 text-sm sm:text-base text-gray-400">
        <Link
          href="/create-pool"
          className="hover:text-purple-600 transition-colors duration-300"
        >
          Create Pool
        </Link>
        {/* Pools Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="hover:text-purple-600 transition-colors duration-300"
          >
            Pools
          </button>

          {dropdownOpen && (
            <div
              className="absolute top-full left-0 mt-2 bg-white border rounded shadow-lg text-gray-700 z-10 w-36"
              onMouseLeave={() => setDropdownOpen(false)} // close only when leaving dropdown
            >
              <Link
                href="/pools/all"
                className={`block px-4 py-2 hover:bg-purple-100 ${
                  isActive('/pools/all') ? 'bg-purple-200 font-semibold' : ''
                }`}
                onClick={() => setDropdownOpen(false)}
              >
                All Pools
              </Link>
              <Link
                href="/pools/user"
                className={`block px-4 py-2 hover:bg-purple-100 ${
                  isActive('/pools/user') ? 'bg-purple-200 font-semibold' : ''
                }`}
                onClick={() => setDropdownOpen(false)}
              >
                My Pools
              </Link>
            </div>
          )}
        </div>
        <Link
          href="/swap"
          className="hover:text-purple-600 transition-colors duration-300"
        >
          Swap
        </Link>
      </nav>
      <div>
        <ConnectButton />
      </div>
    </header>
  );
}
