import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Video } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { ExamTitleForm } from "./_components/exam-title-form";
import { ExamActions } from "./_components/exam-actions";
import { QuestionForm } from "./_components/question-form";
import { FaQuestion } from "react-icons/fa";
import { TimeToFinishForm } from "./_components/timeToFinishForm";

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; examId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const exam = await db.exam.findUnique({
    where: {
      id: params.examId,
      courseId: params.courseId,
    },
    include : {
      questions: true 
    } 
  });

if(exam?.questions) {
  exam.questions = exam.questions.sort((a, b) => a.position - b.position)
}

  if (!exam) {
    return redirect("/");
  }

  const requiredFields = [
    exam.title,
    exam.description,
    exam.questions.some((question) => question.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);
  return (
    <>
      {!exam.isPublished && (
        <Banner
          variant="warning"
          label="This exam is unpublished. It will not be visible in the course"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${params.courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Exam Creation</h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText}
                </span>
              </div>
              <ExamActions
                disabled={!isComplete}
                courseId={params.courseId}
                examId={params.examId}
                isPublished={exam.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your chapter</h2>
              </div>
              <ExamTitleForm
                initialData={exam}
                courseId={params.courseId}
                examId={params.examId}
              />
              <TimeToFinishForm                 initialData={{...exam , timeToFinish : String(exam.timeToFinish) || String(900000) }}
                courseId={params.courseId}
                examId={params.examId}
 />
 
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={FaQuestion} />
              <h2 className="text-xl">Add Questions</h2>
            </div>
            <QuestionForm
              initialData={exam}
              examId={exam.id}
              courseId={params.courseId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
