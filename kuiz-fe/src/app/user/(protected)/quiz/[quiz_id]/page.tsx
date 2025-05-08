"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { Quiz, Question, Difficulty } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ExtendedQuiz extends Quiz {
  questions: Question[];
}

const Page = () => {
  const params = useParams();
  const quizId = params.quiz_id as string;

  const [quiz, setQuiz] = useState<ExtendedQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

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

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Check if all questions have been answered
    const unansweredQuestions = quiz.questions.filter(
      (q) => userAnswers[q.id] === undefined
    );

    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions before submitting`);
      return;
    }

    setSubmitting(true);
    try {
      // Format answers for submission according to UserQuizAttemptInput format
      // { inputs: { questionId: optionIndex } }
      const inputs = {};

      // Map each question ID to its selected answer index
      Object.assign(inputs, userAnswers);

      const { data } = await api.post(`/quiz/attempt/${quizId}`, { inputs });
      setScore(data.score);
      setQuizCompleted(true);
      toast.success("Quiz submitted successfully!");
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      toast.error(err?.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return "bg-green-500 text-white px-3 py-1.5 rounded-lg";
      case Difficulty.MEDIUM:
        return "bg-amber-500 text-white px-3 py-1.5 rounded-lg";
      case Difficulty.HARD:
        return "bg-red-500 text-white px-3 py-1.5 rounded-lg";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="mb-4">{error}</p>
        <Button asChild>
          <Link href="/user/quiz">Go Back to Quizzes</Link>
        </Button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
        <Button asChild>
          <Link href="/user/quiz">Go Back to Quizzes</Link>
        </Button>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Quiz Completed!
            </CardTitle>
            <CardDescription>
              You have completed the quiz: {quiz.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">
                Your Score: {score} / {quiz.questions.length}
              </h2>
              <p className="text-muted-foreground">
                {score === quiz.questions.length
                  ? "Perfect score! Excellent work!"
                  : score! >= Math.floor(quiz.questions.length * 0.7)
                  ? "Great job! You did well!"
                  : "Good attempt! Keep practicing!"}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/user/quiz">Back to Quizzes</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Make sure currentQuestion exists before trying to access its properties
  const currentQuestion =
    quiz.questions.length > 0 ? quiz.questions[currentQuestionIndex] : null;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/user/quiz">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quizzes
          </Link>
        </Button>
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-muted-foreground">{quiz.description}</p>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </p>
        {currentQuestion && (
          <p
            className={`text-sm font-medium ${getDifficultyColor(
              currentQuestion.difficulty
            )}`}
          >
            {currentQuestion.difficulty} Difficulty
          </p>
        )}
      </div>

      {currentQuestion ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={userAnswers[currentQuestion.id]?.toString() || ""}
              onValueChange={(value) =>
                handleAnswerSelect(currentQuestion.id, parseInt(value))
              }
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50"
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-grow cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">No questions available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This quiz doesn't have any questions yet.</p>
          </CardContent>
        </Card>
      )}

      {quiz.questions.length > 0 ? (
        <>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button onClick={handleNextQuestion}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                    index === currentQuestionIndex
                      ? "bg-primary text-primary-foreground"
                      : userAnswers[quiz.questions[index].id] !== undefined
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/user/quiz">Back to Quizzes</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;
