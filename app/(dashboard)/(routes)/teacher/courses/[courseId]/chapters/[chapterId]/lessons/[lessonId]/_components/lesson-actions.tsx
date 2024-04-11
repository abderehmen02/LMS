"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface LessonActionsProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  lessonId: string;
  isPublished: boolean;
}

export const LessonActions = ({
  disabled,
  courseId,
  chapterId,
  lessonId,
  isPublished,
}: LessonActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient , setIsClient ] = useState(false)
  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/unpublish`
        );
        toast.success("Lesson unpublished");
      } else {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/publish`
        );
        toast.success("Lesson published");
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);

      await axios.delete(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`
      );

      toast.success("Lesson deleted");
      router.refresh();
      
      isClient &&      window.location.replace(`/teacher/courses/${courseId}/chapters/${chapterId}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
useEffect(()=>{
setIsClient(true )
} , [] )
  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
