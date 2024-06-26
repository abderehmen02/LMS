"use client";

import { QuizQuestion } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { ChevronDownSquare, Delete, Grip, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

interface QuestionListProps {
  items: QuizQuestion[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const QuestionList = ({
  items,
  onReorder,
  onEdit,
}: QuestionListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [questions, setQuestions] = useState(items);
  const [currentDeletingItemId , setCurrentDeletingItemId ] = useState<string | null>(null)
  const  {courseId , chapterId , quizId }= useParams()
  const router = useRouter()
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setQuestions(items);
  }, [items]);



  const onDelete = async (questionId : string )=>{
    try {
      setCurrentDeletingItemId(questionId)
      await axios.delete(
        `/api/courses/${courseId}/chapters/${chapterId}/quiz/${quizId}/questions/${questionId}`
      );

      toast.success("Question deleted");      router.refresh();

    }
     catch(err){
      console.error("error"  ,  err)
      toast.error("something went wrong!")
     }
     finally {
      setCurrentDeletingItemId(null)
     }
  }


  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;


    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedQuestions = items.slice(startIndex, endIndex + 1);

    setQuestions(items);

    const bulkUpdateData = updatedQuestions.map((questions) => ({
      id: questions.id,
      prompt : questions.prompt ,
      position: items.findIndex((item) => item.id === questions.id) + 1,
    }));


    onReorder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="questions">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {questions.map((question, index) => (
              <Draggable
                key={question.id}
                draggableId={question.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center bg-sky-100 border-sky-200 text-sky-700 gap-x-2 border rounded-md mb-4 text-sm",
                      question.isPublished &&
                        "bg-green-100 border-green-200 text-green-700" , 
                        currentDeletingItemId === question.id && "bg-red-100 border-red-200 text-red-700 animate-pulse"

                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-sky-200 hover:bg-sky-200 rounded-l-md transition"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {question.prompt}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <Badge
                        className={cn(
                          "bg-slate-500",
                          question.isPublished && "bg-sky-700"
                        )}
                      >
                        {question.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {!currentDeletingItemId && (
                      <div className="ml-auto pr-2 flex items-center gap-x-2">
                        <Delete
                          onClick={() => {
                            onDelete(question.id);
                          }}
                          className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                        />

                      </div>)}
                      <Pencil
                        onClick={() => onEdit(question.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
