"use client";
import { Session } from "next-auth";
import profilePicPlaceHolder from "@public/images/user/profile-pic-placeholder.jpg";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { UserCircleIcon, ArrowLeftStartOnRectangleIcon, ArrowRightEndOnRectangleIcon, UserPlusIcon, Cog8ToothIcon, ShieldCheckIcon, PlusCircleIcon, UserIcon } from "@heroicons/react/24/outline"
import Dropdown from "@/app/components/Dropdown";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Button } from '@/app/components/button'
import { useState, ReactElement } from 'react';
import { ThemeColorToggler } from '@/lib/theme/components/theme-color-toggle'
import { ThemeModeToggler } from '@/lib/theme/components/theme-mode-toggle'
import { ThemeRadiusToggler } from '@/lib/theme/components/theme-radius-toggle'

interface UiSettingModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

interface UiSettingToggleProps {
  title: string;
  description: string;
  toggle: ReactElement;
}

function UiSettingToggle(props: UiSettingToggleProps) {
  const {title, description, toggle} = props;
  return (
  <div className="mt-2 flex flex-row justify-between">
    <div>
    <h4 className="font-semibold text-foreground">{title}</h4>
    <p className="ml-2 mt-1 text-muted-foreground">{description}</p>
    </div>
    <div>
    {toggle}
    </div>
  </div>)
}

function UiSettingModal(props: UiSettingModalProps) {
  const {modalOpen, setModalOpen} = props;
  return (<Dialog open={modalOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setModalOpen(false)}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-popover p-6 text-foreground shadow-xl ring-1 ring-border backdrop-blur-2xl duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
            >
              <DialogTitle as="h3" className="mb-4 text-base/7 font-medium leading-7 text-foreground">
                App Ui Settings
              </DialogTitle>
              <UiSettingToggle title="Mode" description="Manually toggle 'light' or 'dark' mode." toggle=<ThemeModeToggler/> />
              <UiSettingToggle title="Color" description="Set the color theme." toggle=<ThemeColorToggler/> />
              <UiSettingToggle title="Radius" description="Set the radius for buttons." toggle=<ThemeRadiusToggler/> />
              <div className="mt-4 place-self-center">
                <Button
                  onClick={() => setModalOpen(false)}
                >
                  Looks good, thanks!
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>);
}

interface UserMenuButtonProps {
  session: Session | null;
}
export default function UserMenuButton({ session }: UserMenuButtonProps) {
  const loggedIn = session?.user;
  const isAdmin = session?.user?.isAdmin;
  const canManageSubject = session?.user?.permissions?.includes('manage_subject');
  const [modalOpen, setModalOpen] = useState(false);

  const userImage = loggedIn ? (
          <Image
            src={loggedIn?.image || profilePicPlaceHolder}
            alt="Profile picture"
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <UserCircleIcon className="h-6 w-6" />
        )

  const userOptions = loggedIn ? [
    {
      name: "Profile",
      description: "View and edit your profile.",
      href: "/profile",
      icon: UserIcon
    },
    ...(isAdmin ? [{
      name: "Manage Roles",
      description: "Manage user roles and permissions.",
      href: "/admin/roles",
      icon: ShieldCheckIcon
    }] : []),
    ...(canManageSubject ? [{
      name: "Manage Subjects",
      description: "Create and manage subjects in the app.",
      href: "/admin/subjects",
      icon: PlusCircleIcon
    }] : []),
    {name: "Settings", description: "Set the appearance of your app.", onClick: () => setModalOpen(true), icon: Cog8ToothIcon },
    {name: "Sign out", description: "Sign out from your personal account.", onClick: () => signOut({callbackUrl:"/"}), icon: ArrowLeftStartOnRectangleIcon }
  ] : [
    {name: "Sign In with Google", onClick: () => signIn("google", { callbackUrl: "/"}), icon: ArrowRightEndOnRectangleIcon, description: "Sign in with your personal Google account"},
    {name: "Sign In with Account", href: "/auth/signin", icon: ArrowRightEndOnRectangleIcon, description: "Sign in with your previously created account."},
    {name: "Create Account", href: "/auth/signup", icon: UserPlusIcon, description: "Create your own account for this app."}
  ]
  return (
    <>
    <Dropdown button={{icon: userImage}} popupOptions={userOptions} />
    <UiSettingModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
      </>
  );
}
