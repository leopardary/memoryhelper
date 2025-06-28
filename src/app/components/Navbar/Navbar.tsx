import Link from "next/link";
import Image from "next/image";
import logo from "@public/favicon.png";
import UserMenuButton from "@/app/components/Navbar/UserMenuButton";
import { authOptions } from "@/lib/utils/authOptions";
import { getServerSession } from "next-auth/next";
import ClientLink from '@/app/components/ClientLink'
import '@/app/components/styles/Navbar.scss'
import { ThemeColorToggler } from '@/components/theme-color-toggle'
import { ThemeModeToggler } from '@/components/theme-mode-toggle'
import { ThemeRadiusToggler } from '@/components/theme-radius-toggle'
import {Button} from '@/app/components/button'

const Logo = () => (
  <Link href="/" className="flex flex-row text-xl items-center">
    <Image src={logo} alt="MemoryHelper logo" className="mr-3 flex-none w-10 h-10"/>
    MemoryHelper
  </Link>);

const BellIcon = () => (        
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="Notifications">
  <path stroke="currentColor" strokeLinecap="round" d="M15 18.5a3 3 0 1 1-6 0">
    </path>
    <path stroke="currentColor" strokeLinejoin="round" d="M5.5 10.532V9a6.5 6.5 0 0 1 13 0v1.532c0 1.42.564 2.782 1.568 3.786l.032.032c.256.256.4.604.4.966v2.934a.25.25 0 0 1-.25.25H3.75a.25.25 0 0 1-.25-.25v-2.934c0-.363.144-.71.4-.966l.032-.032A5.35 5.35 0 0 0 5.5 10.532Z">
      </path>
      </svg>
      )

export default async function Navbar() {
  const session = await 
  getServerSession(authOptions);
  return (
      <div className="max-w-7xl m-auto flex flex-col sm:flex-row gap-2">
        <Logo />
        <div className="flex flex-row gap-2 place-items-center">
          <ThemeModeToggler />
          <ThemeColorToggler />
          <ThemeRadiusToggler />
          <Button>This is a dynamic theme btn</Button>
          {session && (
            <div className="dropdown dropdown-bottom dropdown-end">
              <button className="btn btn-circle notification-button" popoverTarget="notificationActions">
                <BellIcon />
              </button>
              <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm notification-list"
                popover="auto" id="notificationActions">
                <li><ClientLink href="/review" className="text-sm normal-case" text="Review" /></li>
                <li><ClientLink href="/practice" className="text-sm normal-case" text="Practice" /></li>
                <li><ClientLink href="/performance" className="text-sm normal-case" text="Performance" /></li>
              </ul>
            </div>
          )}
          <UserMenuButton session={session} />
        </div>
      </div>
  );
}
