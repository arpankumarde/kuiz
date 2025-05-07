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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Quiz } from "@/generated/prisma";
import {
  CircleAlert,
  RotateCw,
  Plus,
  BookOpen,
  Trash2,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface ExtendedQuiz extends Quiz {
  _count: {
    questions: number;
  };
}

const Page = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<ExtendedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ExtendedQuiz[]>("/quiz");
      setQuizzes(data);
    } catch (err: any) {
      console.error("Error fetching quizzes:", err);
      setError(err?.message || "Failed to fetch quizzes");
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    setIsDeleting(true);
    try {
      await api.delete(`/quiz/${id}`);
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
      toast.success("Quiz deleted successfully");
    } catch (err: any) {
      console.error("Error deleting quiz:", err);
      toast.error(err?.message || "Failed to delete quiz");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewQuiz((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddQuiz = async () => {
    if (!newQuiz.title) {
      toast.error("Please enter a quiz title");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post<Quiz>("/quiz/create", newQuiz);
      setQuizzes((prev) => [...prev, { ...data, _count: { questions: 0 } }]);
      setNewQuiz({ title: "" });
      toast.success("Quiz added successfully");
    } catch (err: any) {
      console.error("Error adding quiz:", err);
      toast.error(err?.message || "Failed to add quiz");
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
              Quiz Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage quizzes
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="transition-colors">
                <Plus className="mr-2 h-4 w-4" />
                Add New Quiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Quiz</DialogTitle>
                <DialogDescription>
                  Create a new quiz for your users.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="font-medium">
                    Quiz Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={newQuiz.title}
                    onChange={handleInputChange}
                    placeholder="Enter quiz title"
                    required
                    className="border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddQuiz}
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
                    "Add Quiz"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg my-4 flex items-center gap-3 shadow-sm border border-destructive/20 animate-in fade-in duration-300">
            <CircleAlert />
            <span>{error}</span>
          </div>
        )}

        <Card className="shadow-md border-0 overflow-hidden py-0 gap-0">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b py-4">
            <CardTitle className="text-xl">All Quizzes</CardTitle>
            <CardDescription>Manage all quizzes in the system</CardDescription>
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
            ) : quizzes.length === 0 ? (
              <div className="text-center py-12 px-6 text-muted-foreground">
                <BookOpen size={60} className="mx-auto" />
                <p className="text-lg font-medium mb-2">No quizzes found</p>
                <p>Add your first quiz to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Questions
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Created At
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((quiz) => (
                      <tr
                        key={quiz.id}
                        className="border-b transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20 cursor-pointer"
                      >
                        <td className="py-4 px-4 font-medium">
                          <Link
                            href={`/admin/quiz/${quiz.id}`}
                            className="text-indigo-800"
                          >
                            {quiz.title}
                          </Link>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          <Link
                            href={`/admin/quiz/${quiz.id}`}
                            className="text-indigo-800"
                          >
                            {quiz.id}
                          </Link>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {quiz._count?.questions || 0}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {quiz.createdAt
                            ? new Date(quiz.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                            onClick={(e) => e.stopPropagation()}
                            asChild
                          >
                            <Link href={`/admin/quiz/${quiz.id}/leaderboard`}>
                              <Trophy className="h-4 w-4" />
                            </Link>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this quiz?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
              Total quizzes:{" "}
              <span className="font-medium text-foreground">
                {quizzes.length}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={fetchQuizzes}
              disabled={loading}
              className="gap-2 w-32"
            >
              <RotateCw className="h-4 w-4" />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Page;
