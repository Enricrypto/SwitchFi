export function HomeFeatures() {
  return (
    <div className="bg-transparent pt-12 pb-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#2E83FF] to-[#1C4F99] opacity-30 rounded-full blur-[150px] top-[-100px] left-[-100px] z-0" />
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-[#4691FF] to-[#2669CA] opacity-30 rounded-full blur-[150px] top-[200px] right-[-100px] z-0" />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#2E83FF] to-[#1C4F99] opacity-50 rounded-full blur-[150px] top-[-100px] right-[-100px] z-0" />
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xl/7 font-semibold tracking-wide text-gradient-blue">Next-level Capabilities</h2>
          <p className="h2 mt-8">
            Supercharge Your App with Powerful DeFi Tools
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2 relative z-10">
          <div className="flex p-px lg:col-span-4 ">
            <div className="w-full overflow-hidden gradient-container rounded-lg outline outline-white/15 max-lg:rounded-t-4xl lg:rounded-tl-4xl relative z-10">
              <img
                alt=""
                src="images/home/pool.png"
                className="h-80 w-full object-cover"
              />
              <div className="p-10">
                <h3 className="text-sm/4 text-gradient-blue font-semibold text-gray-200">Liquidity Tools</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-white">Create Pools</p>
                <p className="mt-2 max-w-lg text-sm/5 text-gray-400">
                  Launch custom liquidity pools with just a few clicks — no coding required.
                </p>
            </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-2">
            <div className="w-full overflow-hidden rounded-lg gradient-container outline outline-white/15 lg:rounded-tr-4xl relative z-10">
              <img
                alt=""
                src="images/home/wallet.png"
                className="h-80 w-full object-cover"
              />
              <div className="p-10">
              <h3 className="text-sm/4 text-gradient-blue font-semibold text-gray-200">Non-Custodial Access</h3>
              <p className="mt-2 text-lg font-medium tracking-tight text-white">Connect Wallet</p>
              <p className="mt-2 max-w-lg text-sm/5 text-gray-400">
                Seamlessly connect your favorite wallet to get started in seconds.
              </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-2">
            <div className="w-full overflow-hidden rounded-lg gradient-container outline outline-white/15 lg:rounded-bl-4xl relative z-10">
              <img
                alt=""
                src="images/home/docs.png"
                className="h-80 w-full object-cover"
              />
                <div className="p-10">
                <h3 className="text-sm/4 text-gradient-blue font-semibold text-gray-200">For Builders</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-white">Developer Docs</p>
                <p className="mt-2 max-w-lg text-sm/5 text-gray-400 ">
                  Explore powerful APIs and guides to extend SwitchFi into your own apps.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-4">
            <div className="w-full overflow-hidden rounded-lg gradient-container outline outline-white/15 max-lg:rounded-b-4xl lg:rounded-br-4xl relative z-10">
              <img
                alt=""
                src="images/home/swap.png"
                className="h-80 w-full object-cover"
              />
              <div className="p-10">
                <h3 className="text-sm/4 text-gradient-blue font-semibold text-gray-200">Fast Trading</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-white">Swap Tokens</p>
                <p className="mt-2 max-w-lg text-sm/5 text-gray-400">
                  Trade assets instantly with low fees and no sign-up needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
