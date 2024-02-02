"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";

import { Preview } from "@/components/preview";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Prisma, Certificate } from "@prisma/client";
import axios from "axios";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { getProgress } from "@/actions/get-progress";
import { Banner } from "@/components/banner";
import { PrepareCertificateModal } from "@/components/modals/exam-certificate-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type QuizWithQuestionsAndOptions = Prisma.QuizGetPayload<{
  include: {
    certificate: true;
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
  params: { courseId: string; examId: string; chapterId: string };
}) => {
  const { userId } = useAuth();

  const router = useRouter();

  const confetti = useConfettiStore();

  const [quiz, setQuiz] = useState<QuizWithQuestionsAndOptions | null>();

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

  const [points, setPoints] = useState<number>();

  const hasTakenQuiz = quiz && quiz.userId !== "nil";

  const handleOptionChange = (questionId: string, optionPosition: number) => {
    setUserSelections((prevSelections) => ({
      ...prevSelections,
      [questionId]: optionPosition,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setIsSubmitting(true);

    try {
      const response = await axios.patch(
        `/api/courses/${params.courseId}/chapters/${params.chapterId}/quiz/${quiz.id}`,
        {
          userId: userId,
        }
      );

      toast.success("Quiz Submitted Successfully.", { duration: 4000 });

      console.log("====================================");
      console.log(response);
      console.log("====================================");

      if (points != undefined && points > 50) {
        const quizResponse = await axios.put(
          `/api/courses/${params.courseId}/chapters/${params.chapterId}/quiz/${quiz.id}/progress`,
          {
            points,
          }
        );

        console.log("====================================");
        console.log(quizResponse);
        console.log("====================================");

        sethasSubmitted(true);

        toast.success("congratulations for passing the quiz", {
          duration: 4000,
        });

        confetti.onOpen();
        return;
      }
      toast.error("you have to take the course again", {
        duration: 4000,
      });

      router.refresh();
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
    if (hasTakenQuiz && hasSubmitted) {
      sethasSubmitted(true);
    }
  }, [hasSubmitted, hasTakenQuiz]);

  useEffect(() => {
    if (hasSubmitted) return;
    const totalQuestions = quiz?.questions.length;

    let numberOfCorrectAnswers = 0;

    if (!totalQuestions) return;

    quiz?.questions.forEach((question) => {
      const questionId = question.id;
      const userSelectedPosition = userSelections[questionId];
      const correctAnswerPosition = parseInt(question.answer);

      if (userSelectedPosition !== undefined) {
        setAnswersQuestions((prev) => prev + 1);

        if (userSelectedPosition === correctAnswerPosition) {
          setCorrectAnswers((prev) => prev + 1);
          numberOfCorrectAnswers++;
        } else {
          setWrongAnswers((prev) => prev + 1);
        }
      }
    });

    setPoints((numberOfCorrectAnswers / totalQuestions) * 100);
  }, [quiz?.questions, userSelections, hasSubmitted]);

  useEffect(() => {
    if (answeredQuestions === quiz?.questions.length)
      setCanSubmit((current) => !current);
  }, [answeredQuestions, quiz?.questions.length]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `/api/courses/${params.courseId}/chapters/${params.chapterId}`
        );

        setQuiz(response.data.quiz);

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
  }, [params.chapterId, params.courseId, userId]);

  if (!userId) {
    return redirect("/");
  }

  return (
    <>
      {quiz ? (
        <div>
          {hasSubmitted ? (
            <Banner
              variant={wrongAnswers > correctAnswers ? "warning" : "success"}
              label={`Answered Questions: ${answeredQuestions}    |    Correct Answers: ${correctAnswers}    |    Wrong Answers: ${wrongAnswers} `}
            />
          ) : (
            <div className="w-full flex justify-end items-center h-12 bg-sky-400/50">
              <div className="flex space-x-4 px-4">
                <p className="text-sm">{quiz?.title}</p>
                <p className="text-sm">
                  Total questions {quiz?.questions.length}
                </p>
              </div>
              <button
                onClick={handleSubmit}
                className={cn(
                  "bg-teal-500 w-fit py-3 text-white h-full font-bold text-sm px-4",
                  (!canSubmit || isSubmitting || hasSubmitted) &&
                    "bg-slate-400 cursor-not-allowed"
                )}
              >
                Finish Quiz
              </button>
            </div>
          )}
          <div className="flex flex-col max-w-4xl mx-10 mt-10 pb-20 space-y-12">
            {quiz?.questions.map((question, index) => (
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
                  {question.options.map((option, index) => (
                    <label key={option.position} className="block">
                      {hasSubmitted || isSubmitting ? (
                        <input
                          className="mr-2"
                          type="radio"
                          name={question.id}
                          value={index + 1}
                          disabled
                        />
                      ) : (
                        <input
                          className="mr-2"
                          type="radio"
                          name={question.id}
                          value={index + 1}
                          onChange={() =>
                            handleOptionChange(question.id, index + 1)
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
              {hasSubmitted && points != undefined ? (
                <p>
                  {`You scored ${points.toFixed(2)} points
              `}
                </p>
              ) : (
                <p className="">Are you confident that you are done?</p>
              )}
              <div className="flex flex-row space-x-4 items-center">
                {hasSubmitted ? (
                  <Link
                    href={`/courses/${params.courseId}/chapters/${params.chapterId}`}
                    className={cn(
                      "bg-teal-500 text-white w-fit font-bold text-sm px-5 py-3 rounded-md"
                    )}
                  >
                    Go back to your course
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={cn(
                      "bg-teal-500 text-white w-fit font-bold text-sm px-5 py-3 rounded-md",
                      (!canSubmit || isSubmitting || hasSubmitted) &&
                        "bg-slate-400 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    Submit
                  </button>
                )}
              </div>
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
