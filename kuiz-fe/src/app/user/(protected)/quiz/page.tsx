"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleAlert, BookOpen, BarChart3, BookCheck } from "lucide-react";
import Link from "next/link";
import { Quiz, QuizAttempt } from "@/generated/prisma";

interface ExtendedQuiz extends Quiz {
  _count: {
    questions: number;
  };
  quizAttempts?: QuizAttempt[];
}

const Page = () => {
  const [quizzes, setQuizzes] = useState<ExtendedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ExtendedQuiz[]>("/quiz");
      console.log("Fetched quizzes:", data);
      setQuizzes(data);
    } catch (err: any) {
      console.error("Error fetching quizzes:", err);
      setError(err?.message || "Failed to fetch quizzes");
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const hasAttempted = (quiz: ExtendedQuiz) => {
    return quiz.quizAttempts && quiz.quizAttempts.length > 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Available Quizzes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-md">
              <CardHeader className="pb-2">
                <Skeleton className="h-7 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Quizzes</h1>

      {error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg my-4 flex items-center gap-3 shadow-sm border border-destructive/20">
          <CircleAlert />
          <span>{error}</span>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <BookOpen size={64} className="mx-auto text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold">No Quizzes Available</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            There are currently no quizzes available for you to attempt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="overflow-hidden border-0 shadow-md pt-0"
            >
              <CardHeader className="bg-indigo-100 dark:bg-slate-900/50 py-3">
                <CardTitle className="text-xl">{quiz.title}</CardTitle>
                <CardDescription>
                  {quiz._count.questions} question
                  {quiz._count.questions !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {quiz.description ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {quiz.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No description provided
                  </p>
                )}

                {hasAttempted(quiz) && (
                  <div className="mt-3 flex items-center text-sm text-green-600 dark:text-green-400">
                    <BookCheck className="h-4 w-4 mr-1" />
                    <span>Previously attempted</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {hasAttempted(quiz) ? (
                  <div className="text-sm font-medium">
                    Score: {quiz.quizAttempts![0].score}/10
                  </div>
                ) : (
                  <Button asChild variant="default">
                    <Link href={`/user/quiz/${quiz.id}`}>Start Quiz</Link>
                  </Button>
                )}

                {hasAttempted(quiz) && (
                  <Button variant="ghost" asChild>
                    <Link
                      href={`/user/quiz/${quiz.id}/leaderboard`}
                      className="flex items-center"
                    >
                      <BarChart3 className="mr-1 h-4 w-4" />
                      Leaderboard
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
