"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Admin } from "@/generated/prisma";

type AdminLoginResponse = {
  user: Admin;
  accessToken: string;
};

const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      const { data } = await api.post<AdminLoginResponse>(
        "/admin/login",
        payload
      );

      if (!data?.accessToken) {
        toast.error("Error: Invalid credentials");
        return;
      }

      toast.success("Login successful!");

      localStorage.setItem("__session_token", data.accessToken);

      router.push("/admin/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(
        `Error: ${error?.message || "Something went wrong. Please try again."}`
      );
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center">
              <Image src="/brand/logo.png" alt="Logo" width={40} height={40} />
            </div>
            Kuiz
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Admin Login</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Login to access the admin dashboard
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/admin/forgot-password"
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </div>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  href="/admin/register"
                  className="underline underline-offset-4"
                >
                  Register
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/static/app-background.png"
          alt="Background"
          width={500}
          height={300}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default Page;
