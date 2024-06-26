import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatGPTTab from "./chat-gpt-tab";
import { BotIcon, Headphones } from "lucide-react";
import SupportBotTab from "./support-bot-tab";

export function ChatWidgetTabs() {

  return (
    <Tabs defaultValue="chatbot" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2 p-0 bg-white">
        <TabsTrigger
          className="data-[state=active]:shadow-none data-[state=active]:text-emerald-600 data-[state=active]:border-b-2 border-emerald-600 rounded-none py-3"
          value="supportBot"
        >
          <CardTitle className="flex space-x-2 items-center font-bold text-xs">
            <div className="rounded-full h-7 w-7 p-1 flex items-center border bg-emerald-600 justify-center">
              <Headphones size={15} className="text-white" />
            </div>
            <h2>Support Bot</h2>
          </CardTitle>
        </TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:shadow-none data-[state=active]:text-emerald-600 data-[state=active]:border-b-2 border-emerald-600 rounded-none py-3"
          value="chatbot"
        >
          <CardTitle className="flex space-x-2 items-center font-bold text-xs">
            <div className="rounded-full h-7 w-7 p-1 flex items-center border bg-emerald-600 justify-center">
              <BotIcon size={15} className="text-white" />
            </div>
            <h2>Learner Assisstant</h2>
          </CardTitle>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="chatbot">
        <ChatGPTTab />
      </TabsContent>
      <TabsContent value="supportBot">
        <SupportBotTab />
      </TabsContent>
    </Tabs>
  );
}
