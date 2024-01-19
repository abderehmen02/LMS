import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { File, PlayCircle, Text } from "lucide-react";

import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import Link from "next/link";
import { IconBadge } from "@/components/icon-badge";

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string; lessonId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: {
      lessons: true,
    },
  });

  if (!chapter) {
    return redirect("/");
  }

  return (
    <div className="flex flex-col max-w-4xl mx-10 mt-10 pb-20">
      <div className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-medium">{chapter.title}</h1>
        <span className="text-sm text-slate-700">Chapter details</span>
      </div>
      <div className="w-full grid lg:grid-cols-2 gap-8 mt-10">
        <div className="col-span-1">
          {chapter.lessons.map((lesson) => (
            <Link
              href={`/courses/${params.courseId}/chapters/${params.chapterId}/lessons/${lesson.id}`}
              className={cn(
                "flex w-full items-center gap-x-2 bg-sky-100 border-sky-200 text-sky-700 border rounded-md mb-4 text-sm"
              )}
              key={lesson.id}
            >
              <div
                className={cn(
                  "px-2 py-3 border-r border-r-sky-200 hover:bg-sky-200 rounded-l-md transition"
                )}
              >
                <PlayCircle className="h-5 w-5" />
              </div>
              {lesson.title}
              <div className="ml-auto pr-2 flex items-center gap-x-2"></div>
            </Link>
          ))}
        </div>
        <div className="col-span-1">
          <div className="flex items-center gap-x-2 mb-4">
            <IconBadge icon={Text} />
            <h2 className="text-xl">Description</h2>
          </div>
          <Preview value={chapter.description!} />
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;
