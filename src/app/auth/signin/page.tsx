'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";

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
    <form className="w-full flex flex-col items-center m-2" onSubmit={handleSubmit}>
      <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Email: </legend>
          <input type="email" className="input w-full" value={email} onChange={e => setEmail(e.target.value)} />
        </fieldset>
        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Password: </legend>
          <input type="password" className="input w-full" value={password} onChange={e => setPassword(e.target.value)} />
        </fieldset>
      <div className="w-full flex justify-between mt-4">
          <button className="btn btn-secondary" type="reset" onClick={handleReset}>Reset</button>
          <button className="btn btn-primary" type="submit">Sign In</button>
        </div>
    </form>
  );
}
