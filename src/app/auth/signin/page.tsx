'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Field, Fieldset, Input, Label, Legend } from '@headlessui/react'
import { Button } from '@/app/components/button';

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", { email, password, callbackUrl: "/" });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
    setPassword('');
  };

  return (
    <div className="w-full justify-items-center px-4">
      <div className="w-full md:w-10/12 lg:w-8/12 xl:w-6/12">
        <Fieldset className="space-y-6 rounded-xl bg-gray-100 dark:bg-gray-900 p-6 sm:p-10">
          <Legend className="text-base/7 font-semibold text-foreground border-b">Sign In</Legend>
          <Field>
            <Label className="text-sm/6 font-medium text-foreground">Email</Label>
            <Input
              type="email"
              className='mt-3 block w-full rounded-lg border-none bg-gray-900/5 dark:bg-gray-100/5 px-3 py-1.5 text-sm/6 text-foreground focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <Label className="text-sm/6 font-medium text-foreground">Password</Label>
            <Input
              type="password"
              className='mt-3 block w-full rounded-lg border-none bg-gray-900/5 dark:bg-gray-100/5 px-3 py-1.5 text-sm/6 text-foreground focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </Field>
          <div className="w-full flex justify-between mt-4">
            <Button variant="outline" type="reset" onClick={handleReset}>Reset</Button>
            <Button type="submit" onClick={handleSubmit}>Sign In</Button>
          </div>
        </Fieldset>
      </div>
    </div>
  );
}
