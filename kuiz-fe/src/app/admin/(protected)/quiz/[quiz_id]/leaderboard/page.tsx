"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { QuizAttempt } from "@/generated/prisma";
import { toast } from "sonner";
import { Trophy, Medal, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardEntry extends QuizAttempt {
  user: {
    id: string;
    name: string | null;
  };
}

const Page = () => {
  const { quiz_id } = useParams();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<LeaderboardEntry[]>(
          `/quiz/attempt/${quiz_id}`
        );

        // Sort by score in descending order
        const sortedData = data.sort((a, b) => b.score - a.score);
        setEntries(sortedData);

        // If we have data, set the quiz title from the first entry
        if (data.length > 0 && data[0].quizId) {
          setQuizTitle(data[0].quizId);
        }
      } catch (err: any) {
        console.error("Error fetching leaderboard:", err);
        setError(err?.message || "Failed to fetch leaderboard data");
        toast.error("Failed to load leaderboard data", {
          description:
            err?.message || "An error occurred while fetching the leaderboard",
        });
      } finally {
        setLoading(false);
      }
    };

    if (quiz_id) {
      fetchLeaderboard();
    }
  }, [quiz_id]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return index + 1;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Loading leaderboard...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {quizTitle ? `Leaderboard: ${quizTitle}` : "Quiz Leaderboard"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No attempts have been made for this quiz yet.
              </p>
            </div>
          ) : (
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 w-16">
                    Rank
                  </th>
                  <th className="border border-gray-300 px-4 py-2">User</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Score
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Attempted
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id} className={index < 3 ? "font-medium" : ""}>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {getRankIcon(index)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {entry.user.name || "Anonymous User"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {entry.score}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {new Date(entry.attemptedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
