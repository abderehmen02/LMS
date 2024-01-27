import { auth } from "@clerk/nextjs";
import { Chapter, Course, Lesson, UserProgress } from "@prisma/client";
import { redirect, usePathname } from "next/navigation";

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

  const exam = await db.exam.findUnique({
    where: {
      courseId: course.id,
      isPublished: true,
    },
    include: {
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
            exam={exam}
          />
        ))}
      </div>
      {(!takingExamination || !viewingCertificate) && (
        <div className="mt-auto border-t border-teal-600 bg-teal-100/50 pt-4">
          {progressCount <= 0 ? (
            <p className="px-4 pb-4 text-xs italic">
              You can Take the course exams before you start the course. Your
              score will be compared with the scire you when you take the exams
              at the end of the course and you can track your improvememt. A 10
              percent progress will be awarded to you if you answer over 50% of
              the question correctly
            </p>
          ) : (
            <p className="px-4 pb-4 text-xs italic">
              There another exam at the end of the course offers certification,
              but you have to the course to take it. Keep climbing!
            </p>
          )}
          <Link
            href={`/courses/${course.id}/exam/${exam?.id}}`}
            prefetch={false}
            className={cn(
              "flex items-center text-right gap-x-2 px-4 bg-slate-500/20 text-slate-500 text-sm font-[500] py-4 transition-all hover:text-slate-600 hover:bg-slate-500/20",
              progressCount > 0 && progressCount < 100 && "cursor-not-allowed"
            )}
          >
            Take exam the course? <ArrowRight className="ml-4 text-slate-500" />
          </Link>
        </div>
      )}
    </div>
  );
};
