'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full flex justify-between items-center p-12 h-20 bg-transparent">
      <Link href="/">
        <Logo
          className="w-20 h-20 transform scale-150"
          aria-label="SwitchFi Logo"
        />
      </Link>
      <nav className="flex gap-18 text-sm sm:text-base text-white">
        <Link
          href="/create-pool"
          className="hover:text-blue-400 transition-colors duration-300"
        >
          Create Pool
        </Link>
        {/* Pools Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="hover:text-blue-400 transition-colors duration-300 cursor-pointer"
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
          className="hover:text-blue-400 transition-colors duration-300"
        >
          Swap
        </Link>
      </nav>
      <div>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            // Note: If your app doesn't use authentication, you
            // can remove all 'authenticationStatus' checks
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="btn-primary"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="flex gap-2">
                      <button
                        onClick={openChainModal}
                        className="btn-primary-sm flex items-center gap-1"
                        type="button"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 16,
                              height: 16,
                              borderRadius: 999,
                              overflow: 'hidden',
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 16, height: 16 }}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>

                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="btn-primary"
                      >
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
