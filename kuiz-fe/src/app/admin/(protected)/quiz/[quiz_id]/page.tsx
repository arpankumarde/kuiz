"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  CircleAlert,
  Trash2,
  ArrowLeft,
  FileQuestion,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Question, Quiz, Difficulty } from "@/generated/prisma";

interface ExtendedQuiz extends Quiz {
  questions: Question[];
}

const Page = () => {
  const params = useParams();
  const quizId = params.quiz_id as string;

  const [quiz, setQuiz] = useState<ExtendedQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null
  );
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState<{
    text: string;
    difficulty: Difficulty;
    options: string[];
    answer: number;
  }>({
    text: "",
    difficulty: Difficulty.MEDIUM,
    options: ["", "", "", ""],
    answer: 0,
  });

  // Constants for quiz constraints
  const MAX_QUESTIONS = 10;
  const MAX_EASY_QUESTIONS = 5;
  const MAX_MEDIUM_QUESTIONS = 3;
  const MAX_HARD_QUESTIONS = 2;

  // Calculate the count of questions by difficulty
  const getQuestionCountsByDifficulty = () => {
    if (!quiz) return { easy: 0, medium: 0, hard: 0, total: 0 };

    const counts = {
      easy: 0,
      medium: 0,
      hard: 0,
      total: quiz.questions.length,
    };

    quiz.questions.forEach((q) => {
      if (q.difficulty === Difficulty.EASY) counts.easy++;
      else if (q.difficulty === Difficulty.MEDIUM) counts.medium++;
      else if (q.difficulty === Difficulty.HARD) counts.hard++;
    });

    return counts;
  };

  const questionCounts = getQuestionCountsByDifficulty();

  useEffect(() => {
    fetchQuizDetails();
  }, [quizId]);

  const fetchQuizDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ExtendedQuiz>(`/quiz/${quizId}`);
      setQuiz(data);
    } catch (err: any) {
      console.error("Error fetching quiz details:", err);
      setError(err?.message || "Failed to fetch quiz details");
      toast.error("Failed to load quiz details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setDeletingQuestionId(questionId);
    try {
      await api.delete(`/quiz/question/${questionId}`);

      // Update the local state to remove the deleted question
      if (quiz) {
        setQuiz({
          ...quiz,
          questions: quiz.questions.filter((q) => q.id !== questionId),
        });
      }

      toast.success("Question deleted successfully");
    } catch (err: any) {
      console.error("Error deleting question:", err);
      toast.error(err?.message || "Failed to delete question");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.text || newQuestion.options.some((opt) => !opt.trim())) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check if we've reached the maximum number of questions
    if (questionCounts.total >= MAX_QUESTIONS) {
      toast.error(
        `This quiz already has the maximum of ${MAX_QUESTIONS} questions`
      );
      return;
    }

    // Check if we've reached the maximum number of questions for this difficulty
    if (
      (newQuestion.difficulty === Difficulty.EASY &&
        questionCounts.easy >= MAX_EASY_QUESTIONS) ||
      (newQuestion.difficulty === Difficulty.MEDIUM &&
        questionCounts.medium >= MAX_MEDIUM_QUESTIONS) ||
      (newQuestion.difficulty === Difficulty.HARD &&
        questionCounts.hard >= MAX_HARD_QUESTIONS)
    ) {
      toast.error(
        `Cannot add more ${newQuestion.difficulty.toLowerCase()} questions. The limit has been reached.`
      );
      return;
    }

    setIsAddingQuestion(true);
    try {
      // Format the request body according to the API requirements
      const requestBody = {
        text: newQuestion.text,
        difficulty: newQuestion.difficulty,
        options: newQuestion.options,
        answer: newQuestion.answer, // index of correct option
      };

      const { data } = await api.post(
        `/quiz/add-question/${quizId}`,
        requestBody
      );

      // Update the local state to add the new question
      if (quiz) {
        setQuiz({
          ...quiz,
          questions: [...quiz.questions, data],
        });
      }

      // Reset form
      setNewQuestion({
        text: "",
        difficulty: Difficulty.MEDIUM,
        options: ["", "", "", ""],
        answer: 0,
      });

      toast.success("Question added successfully");
    } catch (err: any) {
      console.error("Error adding question:", err);
      toast.error(err?.message || "Failed to add question");
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-12 w-3/4 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/quiz">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Back to Quizzes</h1>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg my-4 flex items-center gap-3 shadow-sm border border-destructive/20">
          <CircleAlert />
          <span>{error}</span>
        </div>
      ) : quiz ? (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
            <p className="text-muted-foreground mt-1">
              Quiz ID: {quiz.id} | Created:{" "}
              {new Date(quiz.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="mb-6">
            <Card className="shadow-md border-0 overflow-hidden pt-0">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b flex flex-row items-center justify-between py-4">
                <CardTitle className="text-xl">Questions</CardTitle>
                <CardDescription>
                  {quiz.questions.length} out of 10 question
                  {quiz.questions.length !== 1 ? "s" : ""} in this quiz
                  {quiz.questions.length > 0 && (
                    <div className="mt-1 text-xs">
                      <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full mr-1">
                        Easy: {questionCounts.easy}/{MAX_EASY_QUESTIONS}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full mr-1">
                        Medium: {questionCounts.medium}/{MAX_MEDIUM_QUESTIONS}
                      </span>
                      <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                        Hard: {questionCounts.hard}/{MAX_HARD_QUESTIONS}
                      </span>
                    </div>
                  )}
                </CardDescription>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button disabled={questionCounts.total >= MAX_QUESTIONS}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add New Question</DialogTitle>
                      <DialogDescription>
                        Create a new question for this quiz.
                        {questionCounts.total > 0 && (
                          <div className="mt-2 text-xs font-medium">
                            Remaining slots:
                            <span className="ml-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full mr-1">
                              Easy: {MAX_EASY_QUESTIONS - questionCounts.easy}
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full mr-1">
                              Medium:{" "}
                              {MAX_MEDIUM_QUESTIONS - questionCounts.medium}
                            </span>
                            <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                              Hard: {MAX_HARD_QUESTIONS - questionCounts.hard}
                            </span>
                          </div>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="question-text">Question Text</Label>
                        <Input
                          id="question-text"
                          value={newQuestion.text}
                          onChange={(e) =>
                            setNewQuestion({
                              ...newQuestion,
                              text: e.target.value,
                            })
                          }
                          placeholder="Enter your question"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select
                          value={newQuestion.difficulty}
                          onValueChange={(value) => {
                            if (
                              Object.values(Difficulty).includes(
                                value as Difficulty
                              )
                            ) {
                              setNewQuestion({
                                ...newQuestion,
                                difficulty: value as Difficulty,
                              });
                            }
                          }}
                        >
                          <SelectTrigger id="difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value={Difficulty.EASY}
                              disabled={
                                questionCounts.easy >= MAX_EASY_QUESTIONS
                              }
                            >
                              Easy{" "}
                              {questionCounts.easy >= MAX_EASY_QUESTIONS
                                ? "(Max reached)"
                                : ""}
                            </SelectItem>
                            <SelectItem
                              value={Difficulty.MEDIUM}
                              disabled={
                                questionCounts.medium >= MAX_MEDIUM_QUESTIONS
                              }
                            >
                              Medium{" "}
                              {questionCounts.medium >= MAX_MEDIUM_QUESTIONS
                                ? "(Max reached)"
                                : ""}
                            </SelectItem>
                            <SelectItem
                              value={Difficulty.HARD}
                              disabled={
                                questionCounts.hard >= MAX_HARD_QUESTIONS
                              }
                            >
                              Hard{" "}
                              {questionCounts.hard >= MAX_HARD_QUESTIONS
                                ? "(Max reached)"
                                : ""}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Options</Label>
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <Input
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                              placeholder={`Option ${String.fromCharCode(
                                65 + index
                              )}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="correct-answer">Correct Answer</Label>
                        <Select
                          value={newQuestion.answer.toString()}
                          onValueChange={(value) =>
                            setNewQuestion({
                              ...newQuestion,
                              answer: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger id="correct-answer">
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {newQuestion.options.map((_, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                Option {String.fromCharCode(65 + index)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddQuestion}
                        disabled={
                          isAddingQuestion ||
                          questionCounts.total >= MAX_QUESTIONS ||
                          (newQuestion.difficulty === Difficulty.EASY &&
                            questionCounts.easy >= MAX_EASY_QUESTIONS) ||
                          (newQuestion.difficulty === Difficulty.MEDIUM &&
                            questionCounts.medium >= MAX_MEDIUM_QUESTIONS) ||
                          (newQuestion.difficulty === Difficulty.HARD &&
                            questionCounts.hard >= MAX_HARD_QUESTIONS)
                        }
                      >
                        {isAddingQuestion ? "Adding..." : "Add Question"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                {quiz.questions.length === 0 ? (
                  <div className="text-center py-12 px-6 text-muted-foreground">
                    <FileQuestion size={60} className="mx-auto" />
                    <p className="text-lg font-medium mb-2">
                      No questions found
                    </p>
                    <p>Add questions to this quiz to get started.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {quiz.questions.map((question, index) => (
                      <div key={question.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-lg">
                                {index + 1}. {question.text}
                              </h3>
                              {question.difficulty && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    question.difficulty === "EASY"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : question.difficulty === "MEDIUM"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  }`}
                                >
                                  {question.difficulty}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 ml-6">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`py-1 px-2 rounded ${
                                    optIndex === question.answer
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : ""
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                  {optIndex === question.answer && " (Correct)"}
                                </div>
                              ))}
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Question
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this question?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteQuestion(question.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                  disabled={deletingQuestionId === question.id}
                                >
                                  {deletingQuestionId === question.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Page;
