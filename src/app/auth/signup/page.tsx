'use client';
import { useState } from "react";
import { Field, Fieldset, Input, Label, Legend } from '@headlessui/react'
import { useRouter } from "next/navigation";
import { Button } from '@/app/components/button';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/auth/signin");
    } else {
      alert("Signup failed");
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="w-full justify-items-center px-4">
      <div className="w-full md:w-10/12 lg:w-8/12 xl:w-6/12">
        <Fieldset className="space-y-6 rounded-xl bg-gray-100 dark:bg-gray-900 p-6 sm:p-10">
          <Legend className="text-base/7 font-semibold text-foreground border-b">Sign Up</Legend>
          <Field>
            <Label className="text-sm/6 font-medium text-foreground">Name</Label>
            <Input
              type="name"
              className='mt-3 block w-full rounded-lg border-none bg-gray-900/5 dark:bg-gray-100/5 px-3 py-1.5 text-sm/6 text-foreground focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Field>
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
            <Button type="submit" onClick={handleSubmit}>Sign Up</Button>
          </div>
        </Fieldset>
      </div>
    </div>
  );
}
