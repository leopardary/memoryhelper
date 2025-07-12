import Link from "next/link";
import Image from "next/image";
import logo from "@public/favicon.png";
import UserMenuButton from "@/app/components/Navbar/UserMenuButton";
import { authOptions } from "@/lib/utils/authOptions";
import { getServerSession } from "next-auth/next";
import '@/app/components/styles/Navbar.scss'
import UserSessionDropDown from './UserSessionDropDown';

const Logo = () => (
  <Link href="/" className="flex flex-row text-xl items-center">
    <Image src={logo} alt="MemoryHelper logo" className="m-3 flex-none w-10 h-10 rounded-md"/>
    MemoryHelper
  </Link>);

export default async function Navbar() {
  const session = await 
  getServerSession(authOptions);
  return (
      <div className="max-w-7xl m-auto flex flex-row gap-2 justify-between font-serif">
        <Logo />
        <div className="m-3 flex flex-row gap-2 items-center">
          {session && <UserSessionDropDown/>}
          <UserMenuButton session={session} />
        </div>
      </div>
  );
}
