import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import {
  ArrowPathIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
} from '@heroicons/react/24/outline'

const solutions = [
  { name: 'Analytics', description: 'Get a better understanding of your traffic', href: '#', icon: ChartPieIcon },
  { name: 'Engagement', description: 'Speak directly to your customers', href: '#', icon: CursorArrowRaysIcon },
  { name: 'Security', description: "Your customers' data will be safe and secure", href: '#', icon: FingerPrintIcon },
  { name: 'Integrations', description: 'Connect with third-party tools', href: '#', icon: SquaresPlusIcon },
  { name: 'Automations', description: 'Build strategic funnels that will convert', href: '#', icon: ArrowPathIcon },
]
const callsToAction = [
  { name: 'Watch demo', href: '#', icon: PlayCircleIcon },
  { name: 'Contact sales', href: '#', icon: PhoneIcon },
]

export default function Dropdown() {
  return (
    <Popover className="relative">
      <PopoverButton className="inline-flex items-center gap-x-1 text-sm/6 font-semibold">
        <span>Solutions</span>
        <ChevronDownIcon aria-hidden="true" className="size-5" />
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-popover text-sm/6 shadow-lg ring-1 ring-border">
          <div className="p-4">
            {solutions.map((item) => (
              <div key={item.name} className="group relative flex gap-x-6 rounded-lg p-4 transition-colors hover:bg-muted">
                <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-muted group-hover:bg-accent">
                  <item.icon aria-hidden="true" className="size-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <div>
                  <a href={item.href} className="font-semibold text-foreground hover:underline">
                    {item.name}
                    <span className="absolute inset-0" />
                  </a>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 divide-x divide-border bg-muted">
            {callsToAction.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-foreground hover:bg-accent"
              >
                <item.icon aria-hidden="true" className="size-5 flex-none text-muted-foreground group-hover:text-primary" />
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}
