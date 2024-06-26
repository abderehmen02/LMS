import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, LayoutDashboard, Pointer, Video } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { QuestionPromptForm } from "./_components/question-prompt-form";
import { QuestionExplanationForm } from "./_components/question-explanation-form";
import { QuestionActions } from "./_components/question-actions";
import { QuestionAnswerForm } from "./_components/question-answer-form";
import { OptionForm } from "./_components/option-form";
import { QuestionLessonForm } from "./_components/question-lesson";
import { Chapter, Lesson } from "@prisma/client";

const QuestinoIdPage = async ({
  params,
}: {
  params: {
    chapterId: string;
    quizId: string;
    questionId: string;
    courseId: string;
  };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }


  const allChapters = await db.chapter.findMany({
    where :{
       courseId : params.courseId
    }
  })
  const allLessons :{ lessons : Lesson[] , chapter : Chapter }[] = []
 await Promise.all(allChapters.map( async chapter=>{ 
const chapterLessons = await db.lesson.findMany({
  where : {
    chapterId : chapter.id 
  }
})
allLessons.push({chapter , lessons : chapterLessons})

 }))

  const question = await db.quizQuestion.findUnique({
    where: {
      id: params.questionId,
      quizId: params.quizId,
    },
    include: {
      options: {
        orderBy: {
          position: "asc",
        },
      },
      lesson : true 
    },
  });

  if (!question) {
    return redirect("/");
  }

  const requiredFields = [
    question.prompt,
    question.explanation,
    question.answer !== null,
    question.options.length >= 2 && question.options.length <= 4,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!question.isPublished && (
        <Banner
          variant="warning"
          label="This question is unpublished. It will not be visible in the exam"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${params.courseId}/chapters/${params.chapterId}/quiz/${params.quizId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to quiz setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Question Creation</h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText}
                </span>
              </div>
              <QuestionActions
                disabled={!isComplete}
                courseId={params.courseId}
                quizId={params.quizId}
                chapterId={params.chapterId}
                questionId={params.questionId}
                isPublished={question.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize the Question</h2>
              </div>
              <QuestionPromptForm
                initialData={question}
                courseId={params.courseId}
                quizId={params.quizId}
                chapterId={params.chapterId}
                questionId={params.questionId}
              />
              <QuestionAnswerForm
                initialData={question}
                courseId={params.courseId}
                quizId={params.quizId}
                chapterId={params.chapterId}
                questionId={params.questionId}
                optionLength={question.options.length}
              />
              <QuestionExplanationForm
                initialData={question}
                courseId={params.courseId}
                quizId={params.quizId}
                chapterId={params.chapterId}
                questionId={params.questionId}
              />
              <QuestionLessonForm quizId={params.quizId} allLessons={allLessons} chapterId={params.chapterId } courseId={params.courseId} questionId={params.questionId} initialData={{lesson : question.lesson}} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Pointer} />
              <h2 className="text-xl">Add a Options</h2>
            </div>
            <OptionForm
              initialData={question}
              courseId={params.courseId}
              quizId={params.quizId}
              chapterId={params.chapterId}
              questionId={params.questionId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestinoIdPage;
