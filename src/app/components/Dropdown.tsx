import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import ClientLink from '@/app/components/ClientLink'
import { FC, ReactElement } from 'react';

// Reference：https://tailwindcss.com/plus/ui-blocks/marketing/elements/flyout-menus

interface DropdownButton {
  title?: 'string'
  icon?: ReactElement;
}

/**
 * Options for the dropdown. 
 * @param name  The title of the option. 
 * @param description Brief description for this option, will be shown under the name.
 * @param href  The url to go to if this is filled. This takes preference over `onClick`.
 * @param onClick The eventHandler when user click on this option. Effective only when `href` is empty.
 * @param icon  icon to show in front of the name if it is given.
 */
interface PopupOption {
  name: string,
  description?: string,
  href?: string,
  onClick?: () => void,
  icon?: FC
}

interface QuickAction {
  name: string,
  href: string,
  icon?: FC
}

interface DropdownProps {
  button: DropdownButton;
  popupOptions?: PopupOption[];
  quickActions?: QuickAction[];
}

export default function Dropdown(props: DropdownProps) {
  const { button, popupOptions, quickActions } = props;
  return (
    <Popover className="relative mt-1.5">
      <PopoverButton className="inline-flex items-center gap-x-1 text-sm/6 font-semibold">
        {button.title && <span>{button.title}</span>}
        {button.icon}
        <ChevronDownIcon aria-hidden="true" className="size-5 fill-muted-foreground" />
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-popover text-sm/6 shadow-lg ring-1 ring-border">
          <div className="p-4">
            {popupOptions?.map((item) => (
              <div key={item.name} className="group relative flex gap-x-6 rounded-lg p-4 transition-colors hover:bg-muted">
                <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-muted group-hover:bg-accent">
                  {item.icon && <item.icon aria-hidden="true" className="size-6 text-muted-foreground group-hover:text-primary" />}
                </div>
                <div>
                  {item.href ? <ClientLink href={item.href} className="font-semibold text-foreground hover:underline" text={item.name}><span className="absolute inset-0" /></ClientLink> : <button className="font-semibold text-foreground hover:underline" onClick={item.onClick}>{item.name}<span className="absolute inset-0" /></button>}
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 divide-x divide-border bg-muted">
            {quickActions?.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-foreground hover:bg-accent"
              >
                {item.icon && <item.icon aria-hidden="true" className="size-5 flex-none text-muted-foreground group-hover:text-primary" />}
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}
