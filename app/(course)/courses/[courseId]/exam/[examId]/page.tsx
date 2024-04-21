"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { Preview } from "@/components/preview";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import { Prisma, Certificate, Course, Lesson } from "@prisma/client";
import axios from "axios";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { getProgress } from "@/actions/get-progress";
import { Banner } from "@/components/banner";
import { PrepareCertificateModal } from "@/components/modals/exam-certificate-modal";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { db } from "@/lib/db";
import Link  from "next/link";
import { workerData } from "worker_threads";

type ExamWithQuestionsAndOptions = Prisma.ExamGetPayload<{
    select : {
      timeToFinish : true
    } ,
    include: {
    certificate: true;
    questions: {
      where: {
        isPublished: true;
      };
      include: {
        options: true;
        lesson : true
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

  const [course, setCourse] = useState<Course | null>();

  const [certificateId, setCertificateId] = useState("");

  const [progressCount, setProgressCount] = useState<number>();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [hasSubmitted, sethasSubmitted] = useState<boolean>(false);

  const [canSubmit, setCanSubmit] = useState<boolean>(false);

  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // State to store the user's selected options
  const [userSelections, setUserSelections] = useState<{
    [key: string]: number;
  }>({});

  // Calculate the time per question (5 minutes)
  
  const [answeredQuestions, setAnswersQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<{questionId : string , lesson : Lesson | null }[]>([]);
  const [scorePercentage, setScorePercentage] = useState(0);

  const hasTakenTheExamBefore =
    exam && exam.userId !== "nil" && exam.beforeScore;

  const hasUserSelections = Object.keys(userSelections).length > 0;
  



  console.log("user selectors" , userSelections)
  const handleOptionChange = (questionId: string, optionPosition: number) => {
    setUserSelections((prevSelections) => ({
      ...prevSelections,
      [questionId]: optionPosition,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!exam || !hasUserSelections || hasSubmitted) return;

    setIsSubmitting(true);

    try {
      const fieldToUpdate = hasTakenTheExamBefore
        ? "afterScore"
        : "beforeScore";

      const response = await axios.patch(
        `/api/courses/${params.courseId}/exam/${exam.id}`,
        {
          [fieldToUpdate]: scorePercentage,
          userId: userId,
        }
      );

      sethasSubmitted(true);

      toast.success("Exam Submitted Successfully.", { duration: 4000 });

      if (scorePercentage > 50) {
        const certificateResponse = await axios.post(
          `/api/courses/${params.courseId}/exam/${response.data.id}/certificate`
        );

        if (certificateResponse.status === 200) {
          toast.success("Your certificate is ready!");
          setCertificateId(certificateResponse.data.id);
          confetti.onOpen();
        } else {
          toast.error("Cannot create certificate at this time, sorry!");
        }
      }

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
  }, [
    confetti,
    exam,
    hasUserSelections,
    hasSubmitted,
    hasTakenTheExamBefore,
    params.courseId,
    scorePercentage,
    userId,
  ]);

  // Get the exam data and update the time remaining
  useEffect(() => {
    // Calculate the total time based on the number of questions
    if (exam) {
;
      setTimeRemaining(exam?.timeToFinish ||  5 * 60 * 1000);
    }
  }, [ exam]);

  // Function to decrement the time remaining every second
  const countdown = () => {
    setTimeRemaining((prevTime) => {
      const newTime = Math.max(0, prevTime - 1000);
      return newTime;
    });
  };

  useEffect(() => {
    // Start the countdown timer when the component mounts
    const timerId = setInterval(countdown, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    // If time is up, set isSubmitting to true
    if (timeRemaining === 0 && !hasSubmitted) {
      handleSubmit();
    }
  }, [handleSubmit, hasSubmitted, timeRemaining]);

  // useEffect(() => {
  //   if (
  //     (hasTakenTheExamBefore && exam.afterScore && exam.afterScore > 50) ||
  //     (hasSubmitted && hasTakenTheExamBefore)
  //   ) {
  //     sethasSubmitted(true);
  //   }
  // }, [exam?.afterScore, hasSubmitted, hasTakenTheExamBefore, params.courseId]);

  useEffect(() => {
    if (hasSubmitted) return;
    const totalQuestions = exam?.questions.length;

    let correct = 0;
    let answered = 0;
    let wrong = 0;

    if (!totalQuestions) return;

    exam?.questions.forEach((question) => {
      const questionId = question.id;
      const userSelectedPosition = userSelections[questionId];
      const correctAnswerPosition = parseInt(question.answer);

      if (userSelectedPosition !== undefined) {
        answered++;
        if (userSelectedPosition === correctAnswerPosition) {
          correct++;
        } else {
          setWrongAnswers(curr=>curr.find(item=>item.questionId=== question.id) ? curr :  [...curr , {questionId :question.id , lesson : question.lesson }])
        }
      }
    });

    setAnswersQuestions(answered);
    setCorrectAnswers(correct);
    setScorePercentage((correct / totalQuestions) * 100);

    // Enable submission when all questions are answered
    
    setCanSubmit(answered === totalQuestions);
  }, [exam?.questions, userSelections, hasSubmitted]);

  useEffect(() => {
    if (answeredQuestions === exam?.questions.length)
      setCanSubmit(answeredQuestions === exam?.questions.length);
  }, [answeredQuestions, exam?.questions.length]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`/api/courses/${params.courseId}`);

        setExam(response.data.exams);

        console.log("====================================");
        console.log(response.data);
        console.log("====================================");

        setCourse(response.data);

        console.log("====================================");
        console.log(response.data.exams.certificate);
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
console.log("wrong answers" , wrongAnswers)
  return (
    <>
      {exam ? (
        <div className="pb-10">
          {hasSubmitted ? (
            <Banner
              variant={wrongAnswers.length > correctAnswers ? "warning" : "success"}
              label={`Correct Answers: ${correctAnswers}    |    Wrong Answers: ${wrongAnswers.length} `}
            />
          ) : (
            <div className="w-full flex flex-col justify-center items-end h-12 pt-12 px-6">
              <div className="flex space-x-4 items-center">
                <h1 className="text-lg md:text-xl font-medium capitalize">
                  Time Remaining: {Math.floor(timeRemaining / 60000)}:
                  {((timeRemaining % 60000) / 1000).toFixed(0).padStart(2, "0")}
                </h1>

                <span className="mx-4">|</span>

                <h1 className="text-lg md:text-2xl font-medium capitalize">
                  {exam?.title} 
                </h1>
                {/* <span className="mx-4">|</span> */}
                {/* <h1 className="text-lg md:text-2xl font-medium capitalize">
                  {course?.title}
                </h1> */}
              </div>
              <div className="flex space-x-3 ">
                {/* <p className="text-md">{exam?.description}</p> */}
                <p className="text-md">
                  Total questions {exam?.questions.length}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col px-10 mt-10  gap-4 w-full items-center  relative">
          
                {exam?.questions.map((question, index) =>{
                  const wrongAnswerData = hasSubmitted ?  wrongAnswers.find(wrongAnswerInfo=>wrongAnswerInfo.questionId === question.id) : null
                  return  (
          
                    <div className="bg-sky-100 border border-slate-200 w-full rounded-lg p-4 max-w-full ">
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
                                      handleOptionChange(
                                        question.id,
                                        option.position
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {wrongAnswerData?.lesson ? <div >please take a look at <Link className="font-bold" href={`/courses/${course?.id}/chapters/${wrongAnswerData.lesson.chapterId}/lessons/${wrongAnswerData.lesson.id}`}>{wrongAnswerData.lesson.title}</Link> to learn more </div> : null}
                      </div>
                    </div>
      
                )})}
            <div className="flex flex-col justify-end items-end w-full space-y-3 mr-12 md:mr-20">
              {hasSubmitted && scorePercentage != undefined ? (
                <p className="text-right w-1/2">
                  {`You scored Percentage ${Math.floor(scorePercentage)}% ${
                    hasTakenTheExamBefore
                      ? "Your score will be added and aggregated with the score you get when you take the exam after learning the course"
                      : "Congratulations!"
                  } `}
                </p>
              ) : (
                <p className="">Are you confident that you are done?</p>
              )}
              <div className="flex flex-row space-x-4 items-center">
                <div className="flex flex-row space-x-4 items-center">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={cn(
                      "bg-teal-500 text-white w-fit font-bold text-sm px-4 py-2 rounded-md",
                      (!canSubmit || isSubmitting || hasSubmitted) &&
                        "bg-slate-400 cursor-not-allowed"
                    )}
                  >
                    Submit
                  </button>
                  {certificateId !== "" &&
                    certificateId !== undefined &&
                    hasSubmitted &&
                    scorePercentage > 50 && (
                      <PrepareCertificateModal
                        courseId={params.courseId}
                        examId={params.examId}
                        certificateId={certificateId}
                      >
                        <Button
                          size="sm"
                          className="bg-sky-500 text-white hover:bg-sky-400"
                        >
                          Get your certificate
                        </Button>
                      </PrepareCertificateModal>
                    )}
                </div>
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
