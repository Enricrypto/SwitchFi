import { Button } from '@/components/ui/Button';


export function HomeHero() {
  return (
    <div className="relative">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-6 lg:px-8">
        {/* Gradient Blob Component */}
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#2E83FF] to-[#1C4F99] opacity-30 rounded-full blur-[150px] top-[-100px] left-[-100px] z-0" />
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-[#4691FF] to-[#2669CA] opacity-30 rounded-full blur-[150px] top-[200px] right-[-100px] z-0" />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#2E83FF] to-[#1C4F99] opacity-50 rounded-full blur-[150px] top-[-100px] right-[-100px] z-0" />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#2E83FF] to-[#1C4F99] opacity-40 rounded-full blur-[150px] top-[400px] right-[-400px] z-0" />
        {/* Hero Content */}
        <div className="px-6 py-24 lg:px-0 lg:py-32 lg:col-span-8">
          <div className="mx-auto max-w-lg lg:mx-0">
            <h1 className="text-5xl font-semibold tracking-tight leading-tight text-pretty text-white  lg:text-7xl">
              Build, Swap, and Earn Effortlessly.
            </h1>
            <p className="mt-8 text-lg font-light tracking-wide text-pretty text-gray-200 lg:text-xl/6">
              DeFi made simple: swap, earn, and build with zero fuss.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button variant="primary"  as="a" href="#">
                Get started
              </Button>
              <Button variant="secondary" as="a" href="#">
                Learn more <span aria-hidden="true">→</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="relative m w-full overflow-hidden rounded-lg  lg:col-span-4 lg:mt-0">
          <img
            src="/images/home/window.png"
            alt="App screenshot"
            className="absolute inset-0 h-full w-full object-contain"
          />
      </div>
    </div>
    </div>
  )
}
