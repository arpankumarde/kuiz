"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { FormEvent, useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@/generated/prisma";

type extendedUser = User & {
  message?: string;
};

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    state: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Get email and state from URL query parameters
    const email = searchParams.get("id");
    const state = searchParams.get("state");

    if (!email || !state) {
      toast.error("Missing required parameters");
      router.push("/user/login");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      email,
      state,
    }));
  }, [searchParams, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.password) {
      setError("Please enter a new password");
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      const { data } = await api.post<extendedUser>(
        "/user/change-password",
        payload
      );

      if (data.passwordChanged) {
        // Store the state token as session token
        if (typeof window !== "undefined") {
          localStorage.setItem("__session_token", formData.state);
        }
        toast.success("Password changed successfully!");
        router.push("/user/dashboard");
      } else {
        setError(data.message || "Failed to change password");
        toast.error(data.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
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
                <h1 className="text-2xl font-bold">Change Password</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Please set a new password for your account
                </p>
              </div>
              <div className="grid gap-4">
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">New Password</Label>
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
                  Change Password
                </Button>
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
