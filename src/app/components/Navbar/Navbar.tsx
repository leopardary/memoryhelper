import Link from "next/link";
import Image from "next/image";
import logo from "@public/favicon.png";
import UserMenuButton from "@/app/components/Navbar/UserMenuButton";
import { authOptions } from "@/lib/utils/authOptions";
import { getServerSession } from "next-auth/next";
import ClientLink from '@/app/components/ClientLink'
import '@/app/components/styles/Navbar.scss'

const Logo = () => (<div className="flex-1">
  <Link href="/" className="btn btn-ghost text-xl normal-case">
    <Image src={logo} height={40} width={40} alt="MemoryHelper logo" />
    MemoryHelper
  </Link>
</div>);

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
    <div className="bg-base-100">
      <div className="navbar max-w-7xl m-auto flex-col sm:flex-row gap-2">
        <Logo />
        <div className="flex flex-row gap-2 place-items-center">
          {session && (
            <div className="dropdown dropdown-bottom dropdown-end">
              <button className="btn btn-circle notification-button" popoverTarget="notificationActions">
                <BellIcon />
              </button>
              <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm notification-list"
                popover="auto" id="notificationActions">
                <li><ClientLink href="/review" className="text-sm normal-case" text="Review" /></li>
                <li><ClientLink href="/practice" className="text-sm normal-case" text="Practice" /></li>
              </ul>
            </div>
          )}
          <UserMenuButton session={session} />
        </div>
      </div>
    </div>
  );
}
