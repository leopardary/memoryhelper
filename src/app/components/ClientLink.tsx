"use client"
import Link from "next/link";
import { ReactNode } from 'react';
import { FC } from 'react';

interface ClientLinkIconProps {
  icon: FC;
  className: string;
  name: string
}

interface ClientLinkProps {
  href: string;
  className: string;
  text: string;
  children?: ReactNode;
  icon?: ClientLinkIconProps;
}

export default function ClientLink (link: ClientLinkProps) {
  const closeDropdown = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem.blur();
    }
  }
  return (
<Link href={link.href} className={link.className} onClick={closeDropdown}>{link.text ? link.text : link.icon && <><link.icon.icon aria-hidden="true" className="size-5 flex-none text-muted-foreground group-hover:text-primary" /><span>{link.icon.name}</span></>}{link.children}</Link>
)}