import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { File } from "lucide-react";

import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";

import { VideoPlayer } from "./_components/video-player";
import { CourseProgressButton } from "./_components/course-progress-button";
const LessonIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string; lessonId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const {
    lesson,
    chapter,
    course,
    attachments,
    nextLesson,
    nextChapter,
    lessonAttachments , 
    userProgress,
  } = await getChapter({
    userId,
    chapterId: params.chapterId,
    courseId: params.courseId,
    lessonId: params.lessonId,
  });

  if (!chapter || !course || !lesson) {
    return redirect("/");
  }

  const completeOnEnd = !userProgress?.isCompleted;




  return (
    <div>
    {userProgress?.isCompleted && (
        <Banner variant="success" label="You already completed this lesson." />
      )} 
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        {lesson.videoUrl && (
          <div className="p-4">
       <VideoPlayer
              chapterId={params.chapterId}
              title={chapter.title}
              lessonId={lesson.id}
              courseId={params.courseId}
              nextLessonId={nextLesson?.id}
              nextChapterId={nextChapter?.id}
              nextChapterFirstLessonId={nextChapter?.lessons[0].id}
              completeOnEnd={completeOnEnd}
              url={lesson.videoUrl}
            /> 
          </div>
        )}
        <div className="space-y-4">
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{lesson.title}</h2>
              <p className="text-base font-medium">Lesson {lesson.position}</p>
            </div>
            <CourseProgressButton
              lessonId={params.lessonId}
              chapterId={params.chapterId}
              courseId={params.courseId}
              nextLessonId={nextLesson?.id}
              nextChapterId={nextChapter?.id}
              nextChapterFirstLessonId={nextChapter?.lessons[0].id}
              isCompleted={!!userProgress?.isCompleted}
            />
          </div>
          <Separator />
          <div>
            <p className="text-lg text-slate-700 px-4">Lesson Description</p>
            <Preview value={lesson.description!} />
          </div>
          <Separator />

          {!!lessonAttachments.length && (
            <div>
              <p className="text-lg text-slate-700 px-4">Lesson attachments</p>
              <div className="p-4">
                {lessonAttachments.map((attachment) => (
                  <a
                    href={attachment.url}
                    target="_blank"
                    key={attachment.id}
                    className="flex space-x-2 items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                  >
                    <File />
                    <p className="line-clamp-1">{attachment.name}</p>
                  </a>
                ))}
              </div>
              </div>
          )}

          {!!attachments.length && (
            <>
              <Separator />
              <div className="p-4">
                {attachments.map((attachment) => (
                  <a
                    href={attachment.url}
                    target="_blank"
                    key={attachment.id}
                    className="flex space-x-2 items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                  >
                    <File />
                    <p className="line-clamp-1">{attachment.name}</p>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonIdPage;
