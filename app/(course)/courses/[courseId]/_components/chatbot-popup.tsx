import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import { ChatWidgetTabs } from "./chat-tabs";

interface ChatWidgetProps {
  children: React.ReactNode;
}

export function ChatWidget({ children }: ChatWidgetProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-fit rounded-lg ml-5">
        <ChatWidgetTabs />
      </PopoverContent>
    </Popover>
  );
}
