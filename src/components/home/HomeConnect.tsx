import { QuestionMarkCircleIcon, NewspaperIcon, UserGroupIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const sections = [
  {
    title: 'Help Center',
    description: 'Get support and find help to your questions',
    icon: QuestionMarkCircleIcon,
    links: [
      { name: 'Support', href: '#', icon: 'chevronRight' },
    ],
  },
  {
    title: 'News & Updates',
    description: 'Stay informed about the latest developments',
    icon: NewspaperIcon,
    links: [
      { name: 'Blog', href: '#', icon: 'chevronRight' },
    ],
  },
  {
    title: 'Socials',
    description: 'Connect with us on social media',
    icon: UserGroupIcon,
    links: [
      { name: 'Discord', href: '#', icon: 'discord' },
    ],
  },
]

export  function HomeConnect() {
  return (
    <div className="bg-transparent py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
         {/* Gradient Blob Component */}
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#2E83FF] to-[#1C4F99] opacity-30 rounded-full blur-[150px] bottom-[-1800px] left-[-150px] z-0" />
        <div className="absolute w-[700px] h-[400px] bg-gradient-to-br from-[#2E83FF] to-[#1C4F99] opacity-25 rounded-full blur-[150px] top-[+2300px] left-[+600px] z-0" />
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-00 sm:text-5xl">Stay Updated</h2>
          <p className="mt-6 text-lg/8 text-gray-100">
            Explore our docs, join the conversation, and help shape the future of DeFi.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className="gradient-container rounded-lg gradient-border p-6">
              <div className="rounded-md p-2 w-fit mb-4" style={{background: 'linear-gradient(to bottom, #4691FF, #2669CA)'}}>
                <section.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg/8 font-semibold tracking-tight text-gray-100">{section.title}</h3>
              <p className="mt-2 text-base/7 text-gray-400">{section.description}</p>
              <div className="mt-6 space-y-3">
                {section.links.map((link) => (
                  <div key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                    >
                      {link.icon === 'chevronRight' && (
                        <ChevronRightIcon className="size-4" aria-hidden="true" />
                      )}
                      {link.icon === 'discord' && (
                        <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" className="size-4">
                          <path d="M16.942 4.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-8.662ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z"/>
                        </svg>
                      )}
                      <span>{link.name}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
