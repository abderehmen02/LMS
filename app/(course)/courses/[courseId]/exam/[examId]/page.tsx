"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { File, PlayCircle, Text } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { getProgress } from "@/actions/get-progress";
import { Banner } from "@/components/banner";

type ExamWithQuestionsAndOptions = Prisma.ExamGetPayload<{
  include: {
    questions: {
      where: {
        isPublished: true;
      };
      include: {
        options: true;
      };
    };
  };
}>;

const ExamIdPage = ({
  params,
}: {
  params: { courseId: string; examId: string };
}) => {
  const { userId } = useAuth();

  const confetti = useConfettiStore();

  const [exam, setExam] = useState<ExamWithQuestionsAndOptions | null>();

  const [progressCount, setProgressCount] = useState<number>();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [hasSubmitted, sethasSubmitted] = useState<boolean>(false);

  const [canSubmit, setCanSubmit] = useState<boolean>(false);

  // State to store the user's selected options
  const [userSelections, setUserSelections] = useState<{
    [key: string]: number;
  }>({});

  const [answeredQuestions, setAnswersQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [scorePercentage, setScorePercentage] = useState(0);

  const hasTakenTheExamBefore = exam && exam.userId !== "nil";

  const isBeforeCourseExam = progressCount != undefined && progressCount <= 0;

  const handleOptionChange = (questionId: string, optionPosition: number) => {
    setUserSelections((prevSelections) => ({
      ...prevSelections,
      [questionId]: optionPosition,
    }));
  };

  const handleSubmit = async () => {
    if (!exam) return;

    setIsSubmitting(true);

    try {
      const fieldToUpdate = isBeforeCourseExam ? "beforeScore" : "afterScore";

      const response = await axios.patch(
        `/api/courses/${params.courseId}/exam/${exam.id}`,
        {
          [fieldToUpdate]: scorePercentage,
          userId: userId,
        }
      );

      sethasSubmitted(true);

      toast.success(
        "Exam Submitted Successfully. " +
          "You scored Score Percentage: " +
          scorePercentage.toFixed(2) +
          "%" +
          `${
            isBeforeCourseExam
              ? "Your score will be added and aggregated with the score you get when you take the exam after learning the course"
              : hasTakenTheExamBefore
              ? "This score will be compared to your previous score and your progress calculated"
              : "Congratulations!"
          }`,
        { duration: 4000 }
      );

      confetti.onOpen();

      console.log("====================================");
      console.log(response.data);
      console.log("====================================");
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");

      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      (hasTakenTheExamBefore && exam.afterScore && exam.afterScore > 0) ||
      (hasSubmitted && isBeforeCourseExam)
    ) {
      redirect(`/courses/${params.courseId}`);
    }
  }, [
    exam?.afterScore,
    hasSubmitted,
    hasTakenTheExamBefore,
    isBeforeCourseExam,
    params.courseId,
  ]);

  useEffect(() => {
    const totalQuestions = exam?.questions.length;

    if (!totalQuestions) return;

    exam?.questions.forEach((question) => {
      const questionId = question.id;
      const userSelectedPosition = userSelections[questionId];
      const correctAnswerPosition = parseInt(question.answer);

      if (userSelectedPosition !== undefined) {
        setAnswersQuestions(answeredQuestions + 1);

        if (userSelectedPosition === correctAnswerPosition) {
          setCorrectAnswers(correctAnswers + 1);
        } else {
          setWrongAnswers(wrongAnswers + 1);
        }
      }
    });

    console.log("====================================");
    console.log("hi");
    console.log("====================================");

    setScorePercentage((correctAnswers / totalQuestions) * 100);
  }, [exam?.questions, userSelections]);

  useEffect(() => {
    if (answeredQuestions === exam?.questions.length)
      setCanSubmit((current) => !current);
  }, [answeredQuestions, exam?.questions.length]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/api/courses/${params.courseId}`);

        setExam(response.data.exams);

        console.log("====================================");
        console.log(response.data);
        console.log("====================================");
      } catch (error) {
        console.log("====================================");
        console.log(error);
        console.log("====================================");
        toast.error("Something went wrong");
      }
    })();

    (async () => {
      if (!userId) return;

      const progressCount = await getProgress(userId, params.courseId);
      setProgressCount(progressCount);
    })();
  }, [params.courseId, userId]);

  if (!userId) {
    return redirect("/");
  }

  // if (!course) {
  //   console.log("====================================");
  //   console.log(course, "error");
  //   console.log("====================================");
  //   return redirect("/");
  // }

  return (
    <>
      {exam ? (
        <div>
          {hasSubmitted ? (
            <Banner
              variant={wrongAnswers > correctAnswers ? "warning" : "success"}
              label={`Answered Questions: ${answeredQuestions}    |    Correct Answers: ${correctAnswers}    |    Wrong Answers: ${wrongAnswers}
`}
            />
          ) : (
            <div className="w-full flex justify-end items-center h-12 bg-sky-400/50">
              <div className="flex space-x-4 px-4">
                <p className="text-sm">{exam?.title}</p>
                <p className="text-sm">
                  Total questions {exam?.questions.length}
                </p>
              </div>
              <button className="bg-teal-500 text-white h-full font-bold text-sm px-4">
                Finish Exam
              </button>
            </div>
          )}
          <div className="flex flex-col max-w-4xl mx-10 mt-10 pb-20 space-y-12">
            {exam?.questions.map((question, index) => (
              <div
                key={index}
                className="border-b border-slate-200  w-full flex flex-col items-end"
              >
                <p className="font-bold text-slate-700 mb-6 text-right">
                  Question {index + 1}
                </p>
                <p className="text-slate-500">{question.prompt}</p>
                {question.explanation && (
                  <div className="text-slate-500 -mr-4 mb-4">
                    <Preview value={question.explanation} />
                  </div>
                )}
                <div className="border border-slate-200 rounded-lg p-4 space-y-4 w-fit mb-6">
                  {question.options.map((option) => (
                    <label key={option.position} className="block">
                      {hasSubmitted || isSubmitting ? (
                        <input
                          className="mr-2"
                          type="radio"
                          name={question.id}
                          value={option.position}
                          disabled
                        />
                      ) : (
                        <input
                          className="mr-2"
                          type="radio"
                          name={question.id}
                          value={option.position}
                          onChange={() =>
                            handleOptionChange(question.id, option.position)
                          }
                        />
                      )}
                      {option.text}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col justify-center items-center w-full space-y-3">
              <p className="">Are you confident that you are done?</p>
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "bg-teal-500 text-white w-fit font-bold text-sm px-5 py-3 rounded-lg",
                  (!canSubmit || isSubmitting || hasSubmitted) &&
                    "bg-slate-400 cursor-not-allowed"
                )}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full">
          <p className="font-bold text-2xl text-slate-500 animate-pulse">
            Loading questions...
          </p>
        </div>
      )}
    </>
  );
};

export default ExamIdPage;
