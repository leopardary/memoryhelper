import Link from "next/link";
import Image from "next/image";
import logo from "@public/favicon.png";
import UserMenuButton from "@/app/components/Navbar/UserMenuButton";
import { authOptions } from "@/lib/utils/authOptions";
import { getServerSession } from "next-auth/next";
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
      <div className="w-full max-w-7xl flex flex-row gap-2 justify-between font-serif sticky top-0 bg-background z-10">
        <Logo />
        <div className="my-1 mx-3 flex flex-row gap-2 items-center">
          {session && 
          <div className='flex flex-row items-center'>
            <span className="text-base/7 font-semibold text-foreground mr-9">
            {`Hi, ${session.user.name.split(' ')[0]}`}
            </span>
            <UserSessionDropDown/>
          </div>}
          <UserMenuButton session={session} />
        </div>
      </div>
  );
}
