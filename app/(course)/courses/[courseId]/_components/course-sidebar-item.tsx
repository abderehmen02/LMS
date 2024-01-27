"use client";

import { BookIcon, PlayCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Lesson, Prisma, UserProgress } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useRef } from "react";

type ExamWithQuestionAndOptions = Prisma.ExamGetPayload<{
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

interface CourseSidebarItemProps {
  lessons: (Lesson & {
    userProgress: UserProgress[] | null;
  })[];
  exam: ExamWithQuestionAndOptions | null;
  label: string;
  id: string;
  courseId: string;
}

export const CourseSidebarItem = ({
  label,
  lessons,
  id,
  courseId,
  exam,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const accordionTrigerRef = useRef<HTMLButtonElement>(null);

  let Icon = PlayCircle;
  const isActive = pathname?.includes(id);

  const onClick = (lessonId: string) => {
    router.push(`/courses/${courseId}/chapters/${id}/lessons/${lessonId}`);
  };
  const onChapterClick = () => {
    router.push(`/courses/${courseId}/chapters/${id}`);
  };

  useEffect(() => {
    const ref = accordionTrigerRef.current;

    const handleClick = () => {
      if (ref?.dataset.state === "open") {
        onChapterClick();
      }
    };

    ref?.addEventListener("click", handleClick);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      ref?.removeEventListener("click", handleClick);
    };
  }, []); // Empty dependency array to run the effect only once

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value={label}>
          <AccordionTrigger
            ref={accordionTrigerRef}
            className={cn(
              "flex items-center text-right gap-x-2 text-slate-500 text-sm font-[500] pl-6 pr-4 py-4 transition-all hover:text-slate-600 hover:bg-slate-300/20",
              isActive &&
                "text-slate-700 bg-slate-200/20 hover:bg-slate-200/20 hover:text-slate-700"
            )}
          >
            <p className="ml-auto">{label}</p>
          </AccordionTrigger>
          <AccordionContent className="pb-0 w-full">
            {lessons.map((lesson, index) => (
              <button
                key={index}
                onClick={() => onClick(lesson.id)}
                type="button"
                className={cn(
                  "flex items-center justify-end w-full gap-x-2 text-slate-600 text-sm font-[500] transition-all px-4 hover:text-slate-700 hover:bg-slate-300/20 border-r-4 border-opacity-0 hover:border-opacity-100  border-sky-600 h-full",
                  pathname?.includes(lesson.id) &&
                    "text-slate-700 bg-slate-200/20 hover:bg-slate-200/20 hover:text-slate-700"
                )}
              >
                <div className="flex items-center justify-between text-right w-full gap-x-2 py-4">
                  <Icon
                    size={22}
                    className={cn(
                      "text-slate-500",
                      isActive && "text-slate-700"
                    )}
                  />
                  <p>{lesson.title}</p>
                </div>
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
