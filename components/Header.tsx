'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Logo from '../components/Logo';
import { Button } from '@/components/ui/Button';

export function Header() {
  const [poolsDropdownOpen, setPoolsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-transparent w-full flex justify-between items-center px-3 py-2 sm:px-4 sm:py-3 lg:px-12 h-14 sm:h-16 lg:h-20 relative z-50">
      <Link href="/" className="flex-shrink-0">
        <Logo
          className="w-24 lg:h-24"
          aria-label="SwitchFi Logo"
        />
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-4 lg:gap-8 text-sm font-medium lg:text-base text-white">
        <Link
          href="/create-pool"
          className="hover:text-blue-400 transition-colors duration-300 whitespace-nowrap"
        >
          Create Pool
        </Link>
        {/* Pools Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPoolsDropdownOpen(!poolsDropdownOpen)}
            className="hover:text-blue-400 transition-colors duration-300 cursor-pointer"
          >
            Pools
          </button>

          {poolsDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-2 bg-white border rounded shadow-lg text-gray-700 z-10 w-36"
              onMouseLeave={() => setPoolsDropdownOpen(false)}
            >
              <Link
                href="/pools/all"
                className={`block px-4 py-2 hover:bg-purple-100 ${
                  isActive('/pools/all') ? 'bg-purple-200 font-semibold' : ''
                }`}
                onClick={() => setPoolsDropdownOpen(false)}
              >
                All Pools
              </Link>
              <Link
                href="/pools/user"
                className={`block px-4 py-2 hover:bg-purple-100 ${
                  isActive('/pools/user') ? 'bg-purple-200 font-semibold' : ''
                }`}
                onClick={() => setPoolsDropdownOpen(false)}
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
      
      {/* Right side container */}
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-1.5 hover:bg-white/10 rounded transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>

        {/* Connect Wallet Button - Desktop Only */}
        <div className="hidden md:flex flex-shrink-0">
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
                        <Button
                          onClick={openConnectModal}
                          variant="primary"
                          size="md"
                        >
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button
                          onClick={openChainModal}
                          variant="destructive"
                          size="sm"
                        >
                          Wrong network
                        </Button>
                      );
                    }

                    return (
                      <div className="flex gap-2">
                        <Button
                          onClick={openChainModal}
                          variant="primary"
                          size="sm"
                          leftIcon={
                            chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 16,
                                  height: 16,
                                  borderRadius: 999,
                                  overflow: 'hidden',
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
                            )
                          }
                        >
                          {chain.name}
                        </Button>

                        <Button
                          onClick={openAccountModal}
                          variant="primary"
                          size="md"
                        >
                          {account.displayName}
                          {account.displayBalance
                            ? ` (${account.displayBalance})`
                            : ''}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-darkblue border-t border-white/10 md:hidden z-40">
          <nav className="flex flex-col p-4 space-y-4 text-white">
            <Link
              href="/create-pool"
              className="hover:text-blue-400 transition-colors duration-300 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Pool
            </Link>
            <Link
              href="/pools/all"
              className="hover:text-blue-400 transition-colors duration-300 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Pools
            </Link>
            <Link
              href="/pools/user"
              className="hover:text-blue-400 transition-colors duration-300 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Pools
            </Link>
            <Link
              href="/swap"
              className="hover:text-blue-400 transition-colors duration-300 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Swap
            </Link>
            
            {/* Mobile Connect Wallet */}
            <div className="pt-2 border-t border-white/10">
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
                            <Button
                              onClick={() => {
                                openConnectModal();
                                setMobileMenuOpen(false);
                              }}
                              variant="primary"
                              size="md"
                              fullWidth={true}
                            >
                              Connect Wallet
                            </Button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <Button
                              onClick={() => {
                                openChainModal();
                                setMobileMenuOpen(false);
                              }}
                              variant="destructive"
                              size="md"
                              fullWidth={true}
                            >
                              Wrong network
                            </Button>
                          );
                        }

                        return (
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => {
                                openChainModal();
                                setMobileMenuOpen(false);
                              }}
                              variant="primary"
                              size="sm"
                              fullWidth={true}
                              leftIcon={
                                chain.hasIcon && (
                                  <div
                                    style={{
                                      background: chain.iconBackground,
                                      width: 16,
                                      height: 16,
                                      borderRadius: 999,
                                      overflow: 'hidden',
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
                                )
                              }
                            >
                              {chain.name}
                            </Button>

                            <Button
                              onClick={() => {
                                openAccountModal();
                                setMobileMenuOpen(false);
                              }}
                              variant="primary"
                              size="md"
                              fullWidth={true}
                            >
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
