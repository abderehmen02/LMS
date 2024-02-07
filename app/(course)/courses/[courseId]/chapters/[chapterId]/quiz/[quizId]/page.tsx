"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Preview } from "@/components/preview";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Chapter, Course, Prisma } from "@prisma/client";
import axios from "axios";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { Banner } from "@/components/banner";
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

  const [course, setCourse] = useState<Course | null>();

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
    async function fetchData() {
      try {
        const [chapterResponse, courseResponse] = await Promise.all([
          axios.get(
            `/api/courses/${params.courseId}/chapters/${params.chapterId}`
          ),
          axios.get(`/api/courses/${params.courseId}`),
        ]);

        setQuiz(chapterResponse.data.quiz);
        setCourse(courseResponse.data);

        console.log("====================================");
        console.log(chapterResponse.data);
        console.log(courseResponse.data);
        console.log("====================================");
      } catch (error) {
        console.log("====================================");
        console.log(error);
        console.log("====================================");
        toast.error("Something went wrong");
      }
    }

    fetchData();
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
            <div className="w-full flex flex-col justify-center items-end h-12 pt-12 px-6">
              <div className="flex space-x-4 items-center">
                <h1 className="text-lg md:text-2xl font-medium capitalize">
                  Exam time
                </h1>
                <span className="mx-4">|</span>

                <h1 className="text-lg md:text-2xl font-medium capitalize">
                  {quiz?.title} <span>quiz</span>
                </h1>
                <span className="mx-4">|</span>
                <h1 className="text-lg md:text-2xl font-medium capitalize">
                  {course?.title}
                </h1>
              </div>
              <div className="flex space-x-3 ">
                <p className="text-md">{quiz?.description}</p>
                <p className="text-md">
                  Total questions {quiz?.questions.length}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col px-10 mt-10 items-center relative">
            <Carousel className="w-[98%] md:w-[95%] p-4 mb-3 ">
              <CarouselContent>
                {quiz?.questions.map((question, index) => (
                  <CarouselItem key={index} className="">
                    <div className="bg-sky-100 border border-slate-200 rounded-lg p-4 max-w-full ">
                      <div className="w-full flex h-fit flex-col items-end">
                        <p className="font-medium text-slate-500 mb-4 text-right">
                          Question {index + 1}
                        </p>
                        <p className="text-slate-700 font-bold text-lg">
                          {question.prompt}
                        </p>
                        {question.explanation && (
                          <div className="text-slate-700 font-bold -mr-4 -mt-1 mb-4">
                            <Preview value={question.explanation} />
                          </div>
                        )}
                        <div className="flex flex-col items-end space-y-2 w-full mb-4 ">
                          {question.options.map((option, index) => (
                            <div key={option.id}>
                              {hasSubmitted || isSubmitting ? (
                                <div className="flex space-x-2">
                                  <label className="capitalize text-sm">
                                    {option.text}
                                  </label>
                                  <input
                                    className="mr-2"
                                    type="radio"
                                    name={question.id}
                                    value={index + 1}
                                    disabled
                                  />
                                </div>
                              ) : (
                                <div className="flex space-x-2">
                                  <label className="block capitalize text-sm">
                                    {option.text}
                                  </label>

                                  <input
                                    className="mr-2"
                                    type="radio"
                                    name={question.id}
                                    value={index + 1}
                                    onChange={() =>
                                      handleOptionChange(question.id, index + 1)
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {quiz.questions.length > 1 ? (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              ) : null}
            </Carousel>
            <div className="flex flex-col justify-end items-end w-full space-y-3 mr-12 md:mr-20">
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
                      "bg-teal-500 text-white w-fit font-bold text-sm px-4 py-2 rounded-md"
                    )}
                  >
                    Go back to your course
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={cn(
                      "bg-teal-500 text-white w-fit font-bold text-sm px-4 py-2 rounded-md",
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
