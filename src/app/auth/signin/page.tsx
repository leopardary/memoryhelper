'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Fieldset, Legend } from '@headlessui/react'
import { Button } from '@/app/components/button';
import { FormField } from '@/app/components/FormField';
import { toast } from 'sonner';

const signinSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type SigninFormData = z.infer<typeof signinSchema>;

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    mode: "onBlur" // Validate on blur for better UX
  });

  const onSubmit = async (data: SigninFormData) => {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else if (result?.ok) {
        toast.success("Welcome back!");
        window.location.href = "/";
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="w-full justify-items-center px-4">
      <div className="w-full md:w-10/12 lg:w-8/12 xl:w-6/12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Fieldset className="space-y-6 rounded-xl bg-gray-100 dark:bg-gray-900 p-6 sm:p-10">
            <Legend className="text-base/7 font-semibold text-foreground border-b">Sign In</Legend>

            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              register={register}
              error={errors.email}
              disabled={isSubmitting}
              className="bg-gray-900/5 dark:bg-gray-100/5"
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              register={register}
              error={errors.password}
              disabled={isSubmitting}
              className="bg-gray-900/5 dark:bg-gray-100/5"
            />

            <div className="w-full flex justify-between mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </Fieldset>
        </form>
      </div>
    </div>
  );
}
