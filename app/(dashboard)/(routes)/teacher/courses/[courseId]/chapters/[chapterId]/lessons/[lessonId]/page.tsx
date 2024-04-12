import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, File, LayoutDashboard, Video } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { LessonTitleForm } from "./_components/lesson-title-form";
import { LessonDescriptionForm } from "./_components/lesson-description-form";
import { LessonVideoForm } from "./_components/lesson-video-form";
import { LessonActions } from "./_components/lesson-actions";
import { AttachmentForm } from "./_components/attachment-form";

const LessonIdPage = async ({
  params,
}: {
  params: { chapterId: string; lessonId: string; courseId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const lesson = await db.lesson.findUnique({
    where: {
      id: params.lessonId,
      chapterId: params.chapterId,
    },
    include : {
      attachments : true 
    }
  });

  if (!lesson) {
    return redirect("/");
  }

  const requiredFields = [lesson.title, lesson.description || lesson.videoUrl];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!lesson.isPublished && (
        <Banner
          variant="warning"
          label="This lesson is unpublished. It will not be visible in the course"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${params.courseId}/chapters/${params.chapterId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to chapter setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Lesson Creation</h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText} - You must have a
                  description or a video
                </span>
              </div>
              <LessonActions
                disabled={!isComplete}
                courseId={params.courseId}
                chapterId={params.chapterId}
                lessonId={params.lessonId}
                isPublished={lesson.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your lesson</h2>
              </div>
              <LessonTitleForm
                initialData={lesson}
                courseId={params.courseId}
                chapterId={params.chapterId}
                lessonId={params.lessonId}
              />
              <LessonDescriptionForm
                initialData={lesson}
                courseId={params.courseId}
                chapterId={params.chapterId}
                lessonId={params.lessonId}
              />
                          <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-xl">Resources & Attachments (Optional)</h2>
              </div>
              <AttachmentForm initialData={{...lesson , attachments : lesson.attachments }}   />
            </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl">Add a video</h2>
            </div>
            <LessonVideoForm
              initialData={lesson}
              chapterId={params.chapterId}
              lessonId={params.lessonId}
              courseId={params.courseId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonIdPage;
