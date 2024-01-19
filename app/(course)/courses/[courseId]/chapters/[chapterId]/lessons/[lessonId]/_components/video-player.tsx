"use client";

import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface VideoPlayerProps {
  playbackId: string;
  courseId: string;
  chapterId: string;
  nextLessonId?: string;
  completeOnEnd: boolean;
  title: string;
}

export const VideoPlayer = ({
  playbackId,
  courseId,
  chapterId,
  nextLessonId,
  completeOnEnd,
  title,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            isCompleted: true,
          }
        );

        if (!nextLessonId) {
          confetti.onOpen();
        }

        toast.success("Progress updated");
        router.refresh();

        if (nextLessonId) {
          router.push(`/courses/${courseId}/chapters/${nextLessonId}`);
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="relative aspect-video">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}

      <MuxPlayer
        title={title}
        className={cn(!isReady && "hidden")}
        onCanPlay={() => setIsReady(true)}
        onEnded={onEnd}
        autoPlay
        playbackId={playbackId}
      />
    </div>
  );
};
