"use client";
import { Session } from "next-auth";
import profilePicPlaceHolder from "@public/images/user/profile-pic-placeholder.jpg";
import Image from "next/image";
import ClientLink from '@/app/components/ClientLink'
import { signIn, signOut } from "next-auth/react";

const TripleDots = () => (<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  className="inline-block h-5 w-5 stroke-current"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
  />
</svg>);

interface UserMenuButtonProps {
  session: Session | null;
}
export default function UserMenuButton({ session }: UserMenuButtonProps) {
  const user = session?.user;
  return (
    <div className="dropdown dropdown-end pr-2">
      <label tabIndex={0} className="btn btn-ghost btn-circle">
        {user ? (
          <Image
            src={user?.image || profilePicPlaceHolder}
            alt="Profile picture"
            width={40}
            height={40}
            className="w-10 rounded-full"
          />
        ) : (
          <TripleDots />
        )}
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box menu-sm z-30 mt-3 w-52 bg-base-100 p-2 shadow"
      >
        
          {user ? (
            <li>
            <button onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </button>
            </li>
          ) : (
            <>
              <li key='gmail'>
                <button onClick={() => signIn("google", { callbackUrl: "/" })}>Sign In with Google</button>
              </li>
              <li key='email'>
                <ClientLink href="/auth/signin" className="text-sm normal-case" text="Sign In with Account" />
              </li>
              <div className="divider">or</div>
              <li key='signup'>
                <ClientLink href="/auth/signup" className="text-sm normal-case" text="Create Account" />
              </li>
            </>
          )}
      </ul>
    </div>
  );
}
