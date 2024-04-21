"use client";

import * as z from "zod";
import axios, { all } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chapter, Lesson } from "@prisma/client";
import { Select, SelectContent, SelectTrigger, SelectValue , SelectItem, SelectGroup } from "@/components/ui/select";

interface QuestionAnswerFormProps {
  initialData: {
    lesson? : Lesson , 
  };
  allLessons : {lessons :  Lesson[] , chapter : Chapter }[] ;

  courseId: string;

  examId: string;
  questionId: string;
}



const formSchema = z.object({
  answer: z.string(),
});

export const QuestionLessonForm = ({
  initialData,
  courseId,
  examId,
  questionId,
  allLessons
}: QuestionAnswerFormProps) => {
  const [selectedLesson , setSelectedLesson ] = useState<Lesson | undefined>(initialData.lesson)
  const [isLoading , setIsLoading ] = useState(false)
  const router = useRouter();


console.log("intial datz" ,  selectedLesson)

  const onSubmit = async (e : FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      console.log("checking")
      if(!selectedLesson) return 
      console.log("fetching api")
      await axios.patch(
        `/api/courses/${courseId}/exam/${examId}/questions/${questionId}`,
        {lessonId : selectedLesson?.id }
      );
      toast.success("Question updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
    finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Question Lesson
       
      </div>
     

        
          <form
            onSubmit={onSubmit}
            className="space-y-4 mt-4"
          >
            <div>
                  <Select onValueChange={(val)=>allLessons.forEach((chapter)=>{chapter.lessons.forEach(lesson=>lesson.title === val && setSelectedLesson(lesson))})} value={selectedLesson?.title}  >
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder={"Select a lesson"} />
  </SelectTrigger>
  <SelectContent>

    {
      allLessons.map(chapterLessons=><SelectGroup >    {
        chapterLessons.lessons.map(lesson=><SelectItem value={lesson.title}>{lesson.title}</SelectItem>)}</SelectGroup>    )
    }
  </SelectContent>
</Select>
                </div>
              
            
            <div className="flex items-center gap-x-2">
              <Button disabled={isLoading} type="submit">
                Save
              </Button>
            </div>
          </form>
        
      
    </div>
  );
};
