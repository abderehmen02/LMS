import React from "react";
import { auth, clerkClient } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserQuizPoints } from "@prisma/client";
import { User } from "@clerk/nextjs/server";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import RankCard from "./_components/rank-card";
import { obfuscateEmailMiddleCharacters } from "@/lib/utils";

type UserQuizPointsWithUserDetails = UserQuizPoints & {
  fullName: string;
  numberOfTakenQuizzes: number;
  rank: number;
  imageUrl: string | null;
};

const Leaderboard = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  let pointsWithUserDetails: UserQuizPointsWithUserDetails[] = [];
  const usersQuizCounts: {
    [userId: string]: {
      quizCount: number;
      uniqueQuizzes: Set<string>;
      totalPoints: number;
    };
  } = {};
  const points = await db.userQuizPoints.findMany({
    orderBy: {
      points: "desc",
    },
  });

  let currentRank = 1;

  for (const point of points) {
    const userEntry = usersQuizCounts[point.userId];
    if (!userEntry) {
      console.log("pont user" , point)
      // First time encountering this user
      const user: User = await clerkClient.users.getUser(point.userId);
      const fullName =
        user.firstName && user.lastName // Check if both firstName and lastName are not null
          ? `${user.firstName} ${user.lastName}` // If both are present, concatenate them
          : user.emailAddresses[0].emailAddress; // If any is null,

      usersQuizCounts[point.userId] = {
        quizCount: 1,
        uniqueQuizzes: new Set([point.quizId]),
        totalPoints: point.points,
      };
      pointsWithUserDetails.push({
        ...point,
        fullName,
        rank: currentRank,
        imageUrl: user.imageUrl,
        numberOfTakenQuizzes: 1,
      });
    } else {
      // User already encountered, update quiz count and unique quizzes
      userEntry.quizCount++;
      userEntry.uniqueQuizzes.add(point.quizId);
      userEntry.totalPoints += point.points;

      // Find the corresponding entry in pointsWithUserDetails and update its values
      const existingEntryIndex = pointsWithUserDetails.findIndex(
        (entry) => entry.userId === point.userId
      );
      if (existingEntryIndex !== -1) {
        pointsWithUserDetails[existingEntryIndex].points += point.points;
        pointsWithUserDetails[existingEntryIndex].numberOfTakenQuizzes =
          userEntry.quizCount;
      }
    }
    currentRank++;
  }

  // Sort pointsWithUserDetails first by points, then by quiz count, and finally by creation timestamp
  pointsWithUserDetails.sort((a, b) => {
    if (a.points === b.points) {
      if (a.numberOfTakenQuizzes === b.numberOfTakenQuizzes) {
        // Use getTime() to get the numeric value representing the time for comparison
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      return b.numberOfTakenQuizzes - a.numberOfTakenQuizzes; // Sort by quiz count in descending order
    }
    return b.points - a.points; // Sort by points in descending order
  });

  // Assign final ranks based on the sorted order
  pointsWithUserDetails.forEach((user, index) => {
    // Check for ties and assign the same rank to users with the same points, quiz count, and creation timestamp
    if (
      index > 0 &&
      user.points === pointsWithUserDetails[index - 1].points &&
      user.numberOfTakenQuizzes ===
        pointsWithUserDetails[index - 1].numberOfTakenQuizzes &&
      user.createdAt.getTime() ===
        pointsWithUserDetails[index - 1].createdAt.getTime()
    ) {
      user.rank = pointsWithUserDetails[index - 1].rank;
    } else {
      user.rank = index + 1;
    }
  });

  const firstThreePointsWithUserDetails = pointsWithUserDetails.slice(0, 3);
  const userPoints = pointsWithUserDetails.find(
    (point) => point.userId === userId
  );

  return (
    <div className="p-6 flex flex-col">
      <div>
        <h1 className="text-2xl font-medium text-right">Leaderboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        {firstThreePointsWithUserDetails.map((pointWithUser) => (
          <div key={pointWithUser.id}>
            <RankCard
              fullName={pointWithUser.fullName}
              imageUrl={pointWithUser.imageUrl}
              points={pointWithUser.points}
              rank={pointWithUser.rank}
            />
          </div>
        ))}
      </div>
      <div className="rounded-md border bg-slate-100 w-fit px-3 py-2 mt-5 mb-1 self-center">
        <p>
          You have <span className="font-bold">{userPoints?.points}</span> quiz
          points and are ranked{" "}
          <span className="font-bold">{userPoints?.rank}</span> today out of{" "}
          <span className="font-bold">{pointsWithUserDetails.length}</span>{" "}
          total learners.
        </p>
      </div>
      <div className="">
        <DataTable columns={columns} data={pointsWithUserDetails.slice(3)} />
      </div>
    </div>
  );
};

export default Leaderboard;
