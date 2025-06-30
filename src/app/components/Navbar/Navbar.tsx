import Link from "next/link";
import Image from "next/image";
import logo from "@public/favicon.png";
import UserMenuButton from "@/app/components/Navbar/UserMenuButton";
import { authOptions } from "@/lib/utils/authOptions";
import { getServerSession } from "next-auth/next";
import '@/app/components/styles/Navbar.scss'
import Dropdown from '@/app/components/Dropdown'
import {
  ChartPieIcon,
  RectangleStackIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline'

const Logo = () => (
  <Link href="/" className="flex flex-row text-xl items-center font-serif">
    <Image src={logo} alt="MemoryHelper logo" className="mr-3 flex-none w-10 h-10"/>
    MemoryHelper
  </Link>);

export default async function Navbar() {
  const session = await 
  getServerSession(authOptions);
  return (
      <div className="max-w-7xl m-auto flex flex-col sm:flex-row gap-2 justify-between">
        <Logo />
        <div className="flex flex-row gap-2 items-center">
          {session && <Dropdown button={{icon: <BellIcon className='h-6 w-6' />}} popupOptions={[
            { name: 'Review', description: 'Review the subscribed memory pieces', href: '/review', icon: RectangleStackIcon },
            { name: 'Practice', description: 'Today\'s practice task', href: '/practice', icon: ClockIcon }, 
            { name: 'Performance', description: 'Performance dashboard', href: '/performance', icon: ChartPieIcon }]}/>}
          <UserMenuButton session={session} />
        </div>
      </div>
  );
}
