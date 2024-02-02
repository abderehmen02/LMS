import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";

import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          lessons: {
            where: {
              isPublished: true,
            },
            include: {
              userProgress: {
                where: {
                  userId,
                },
              },
            },
            orderBy: {
              position: "asc",
            },
          },
          quiz: {
            where: {
              isPublished: true,
            },
            include: {
              userQuizPoints: {
                where: {
                  userId,
                },
              },
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  const exam = await db.exam.findUnique({
    where: {
      courseId: params.courseId,
      userId: userId,
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

  if (!course) {
    return redirect("/");
  }

  let progressCount = await getProgress(userId, course.id);

  if (exam?.beforeScore && exam?.beforeScore >= 50 && progressCount < 100) {
    progressCount = Math.min(progressCount + 10, 100);
  }
  return (
    <div className="h-full">
      <div className="h-[80px] md:pr-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar course={course} progressCount={progressCount} />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed right-0 inset-y-0 z-50">
        <CourseSidebar course={course} progressCount={progressCount} />
      </div>
      <main className="md:pr-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default CourseLayout;
