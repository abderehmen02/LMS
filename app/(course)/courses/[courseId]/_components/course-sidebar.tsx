import { auth } from "@clerk/nextjs";
import {
  Chapter,
  Course,
  Lesson,
  UserProgress,
  Quiz,
  UserQuizPoints,
} from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CourseProgress } from "@/components/course-progress";

import { CourseSidebarItem } from "./course-sidebar-item";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { headers } from "next/headers";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      lessons: (Lesson & {
        userProgress: UserProgress[] | null;
      })[];
      quiz: (Quiz & { userQuizPoints: UserQuizPoints[] | null }) | null;
    })[];
  };
  progressCount: number;
}

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }
  const headersList = headers();

  const pathname = headersList.get("x-invoke-path") || "";

  const takingExamination = pathname?.includes("exam");
  const viewingCertificate = pathname?.includes("certificate");
  const takingQuiz = pathname?.includes("quiz");

  const exam = await db.exam.findUnique({
    where: {
      courseId: course.id,
      isPublished: true,
    },
    include: {
      certificate: true,
      questions: {
        where: {
          isPublished: true,
        },
        include: {
          options: true,
        },
      },
    },
  });

  const certificateId = exam?.certificate?.find(
    (certificate) =>
      certificate.userId === userId && certificate.nameOfStudent != null
  );

  const hasCertificate = certificateId != undefined;

  // if (progressCount === 100 && exam) {
  //   redirect(`/courses/${course.id}/exam/${exam.id}`);
  // }

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
        <div className="mt-10">
          <CourseProgress variant="success" value={progressCount} />
        </div>
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            courseId={course.id}
            lessons={chapter.lessons}
            quiz={chapter.quiz}
            exam={exam}
          />
        ))}
      </div>
      {!takingExamination && !viewingCertificate && !takingQuiz && (
        <div
          className={`mt-auto border-t border-teal-600 bg-teal-100/50 ${
            !hasCertificate && "pt-4"
          } `}
        >
          {!hasCertificate ? (
            progressCount <= 0 ? (
              <p className="px-4 pb-4 text-xs italic">
                You can Take the course exams before you start the course. Your
                score will be compared with the scire you when you take the
                exams at the end of the course and you can track your
                improvememt. A 10 percent progress will be awarded to you if you
                answer over 50% of the question correctly
              </p>
            ) : progressCount === 100 ? (
              <p className="px-4 pb-4 text-xs italic">
                You have finished the course{" "}
                <span className={cn(!exam?.id && "hidden")}>
                  please take the exam. You will get a certificate!
                </span>
              </p>
            ) : (
              <p className="px-4 pb-4 text-xs italic">
                There an exam at the end of the course offers certification, but
                you have to the course to take it. Keep climbing!
              </p>
            )
          ) : null}
          {exam?.id ? (
            hasCertificate ? (
              <Link
                href={`/courses/${course.id}/exam/${exam.id}/certificate/${certificateId}}`}
                prefetch={false}
                className={cn(
                  "flex items-center text-right gap-x-2 px-4 bg-emerald-500/20 text-emerald-500 text-sm font-[500] py-4 transition-all hover:text-emerald-600 hover:bg-emerald-500/20"
                )}
              >
                See your Certificate{" "}
                <ArrowRight
                  className={cn(
                    "ml-4 text-slate-500",
                    progressCount === 100 && "text-emerald-500"
                  )}
                />
              </Link>
            ) : (
              <Link
                href={`/courses/${course.id}/exam/${exam.id}`}
                prefetch={false}
                className={cn(
                  "flex items-center text-right gap-x-2 px-4 bg-slate-500/20 text-slate-500 text-sm font-[500] py-4 transition-all hover:text-slate-600 hover:bg-slate-500/20",
                  progressCount > 0 && progressCount < 100
                    ? "cursor-not-allowed"
                    : "animate-pulse text-emerald-500 bg-emerald-500/20 hover:text-emerald-600 hover:bg-emerald-600/20"
                )}
              >
                Take exam the course?{" "}
                <ArrowRight
                  className={cn(
                    "ml-4 text-slate-500",
                    progressCount === 100 && "text-emerald-500"
                  )}
                />
              </Link>
            )
          ) : null}
        </div>
      )}
    </div>
  );
};
