'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <form className="w-full flex flex-col items-center m-2" onSubmit={handleSubmit}>
        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">Name: </legend>
          <input type="name" className="input w-full" value={name} onChange={e => setName(e.target.value)} />
        </fieldset>
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
          <button className="btn btn-primary" type="submit">Sign Up</button>
        </div>
      </form>
  );
}
