"use client";

import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import ReactPlayer, { ReactPlayerProps } from "react-player";

import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface VideoPlayerProps {
  courseId: string;
  chapterId: string;
  lessonId: string;
  nextLessonId?: string;
  completeOnEnd: boolean;
  title: string;
  url: string | null;
}

export const VideoPlayer = ({
  courseId,
  chapterId,
  lessonId,
  nextLessonId,
  completeOnEnd,
  title,
  url,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(
          `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/progress`,
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
    <div className="relative aspect-video h-fit w-full bg-red-600">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}

      {/* <MuxPlayer
        title={title}
        className={cn(!isReady && "hidden")}
        onCanPlay={() => setIsReady(true)}
        onEnded={onEnd}
        autoPlay
        playbackId={playbackId}
      /> */}

      <div className={cn(!isReady && "hidden ")}>
        <div className="bg-black px-10 py-2">
          <p className="text-white/70 capitalize">{title}</p>
        </div>
        {url && (
          <ReactPlayer
            url={url}
            playing={isReady} // Start paused initially
            onReady={() => setIsReady(true)}
            onEnded={onEnd}
            width={"100%"}
            height={450}
            controls={true} // Show player controls
          />
        )}
      </div>
    </div>
  );
};
