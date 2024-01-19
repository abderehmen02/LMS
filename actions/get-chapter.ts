import { db } from "@/lib/db";
import { Attachment, Chapter, Lesson } from "@prisma/client";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
  lessonId: string;
}

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
  lessonId,
}: GetChapterProps) => {
  try {
    const course = await db.course.findUnique({
      where: {
        isPublished: true,
        id: courseId,
      },
    });

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        isPublished: true,
      },
    });

    const lesson = await db.lesson.findUnique({
      where: {
        id: lessonId,
        isPublished: true,
      },
    });

    if (!chapter || !course || !lesson) {
      throw new Error("Chapter or course not found");
    }

    let muxData = null;
    let attachments: Attachment[] = [];
    let nextLesson: Lesson | null = null;

    attachments = await db.attachment.findMany({
      where: {
        courseId: courseId,
      },
    });

    muxData = await db.muxData.findUnique({
      where: {
        lessonId: lessonId,
      },
    });

    nextLesson = await db.lesson.findFirst({
      where: {
        chapterId: chapterId,
        isPublished: true,
        position: {
          gt: chapter?.position,
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    return {
      chapter,
      lesson,
      course,
      muxData,
      attachments,
      nextLesson,
      userProgress,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      lesson: null,
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextLesson: null,
      userProgress: null,
    };
  }
};
