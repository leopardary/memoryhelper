"use client"
import Link from "next/link";


interface ClientLinkProps {
  href: string;
  className: string;
  text: string;
}

export default function ClientLink (link: ClientLinkProps) {
  const closeDropdown = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem.blur();
    }
  }
  return (
<Link href={link.href} className={link.className} onClick={closeDropdown}>{link.text}</Link>
)}