"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { User } from "@/generated/prisma";
import { CircleAlert, RotateCw, UserPlus, Users } from "lucide-react";

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<User[]>("/user");
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err?.message || "Failed to fetch users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post<User>("/user/create", newUser);
      setUsers((prev) => [...prev, data]);
      setNewUser({ name: "", email: "", password: "" });
      toast.success("User added successfully");
    } catch (err: any) {
      console.error("Error adding user:", err);
      toast.error(err?.message || "Failed to add user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="p-6 pt-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Users Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage user accounts
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="transition-colors">
                <UserPlus />
                Add New User
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader className="pb-4 border-b">
                <SheetTitle className="text-xl">Add New User</SheetTitle>
                <SheetDescription>
                  Create a new user account. The user will need to change their
                  password on first login.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-5 py-6 px-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    className="border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="font-medium">
                    Initial Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
              <div className="pt-4 px-4 border-t flex justify-end">
                <Button
                  onClick={handleAddUser}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-colors w-32"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    "Add User"
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg my-4 flex items-center gap-3 shadow-sm border border-destructive/20 animate-in fade-in duration-300">
            <CircleAlert />
            <span>{error}</span>
          </div>
        )}

        <Card className="shadow-md border-0 overflow-hidden py-0 gap-0">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b py-4">
            <CardTitle className="text-xl">All Users</CardTitle>
            <CardDescription>
              Manage all user accounts in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-4 p-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 animate-pulse"
                  >
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 px-6 text-muted-foreground">
                <Users size={60} className="mx-auto" />
                <p className="text-lg font-medium mb-2">No users found</p>
                <p>Add your first user to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Password Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                      >
                        <td className="py-4 px-4 font-medium">{user.name}</td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.passwordChanged
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {user.passwordChanged ? "Changed" : "Not Changed"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between py-4 px-6 bg-slate-50 dark:bg-slate-900/50 border-t">
            <div className="text-sm text-muted-foreground">
              Total users:{" "}
              <span className="font-medium text-foreground">
                {users.length}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={loading}
              className="gap-2 w-32"
            >
              <RotateCw />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Page;
