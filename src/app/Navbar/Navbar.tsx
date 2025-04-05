import Link from "next/link";
import Image from "next/image";
import logo from "@public/globe.svg";
import { redirect } from "next/navigation";
import UserMenuButton from "@/app/Navbar/UserMenuButton";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

async function searchProducts(formData: FormData) {
  "use server";
  const searchQuery = formData.get("searchQuery")?.toString();
  if (searchQuery) {
    redirect("/search?query=" + searchQuery);
  }
}

const Logo = () => (<div className="flex-1">
  <Link href="/" className="btn btn-ghost text-xl normal-case">
    <Image src={logo} height={40} width={40} alt="MemoryHelper logo" />
    MemoryHelper
  </Link>
</div>);

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  return (
    <div className="bg-base-100">
      <div className="navbar max-w-7xl m-auto flex-col sm:flex-row gap-2">
        <Logo />
        <div className="flex-none gap-2">
          <UserMenuButton session={session} />
        </div>
      </div>
    </div>
  );
}
