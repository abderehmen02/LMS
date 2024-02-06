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

export function ChatWidgetTabs() {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chatbot">Chat Bot</TabsTrigger>
        <TabsTrigger value="chatgpt">Chat GPT</TabsTrigger>
      </TabsList>
      <TabsContent value="chatbot">
        <Card className="shadow-none border-none">
          <CardHeader>
            <CardTitle>Chat Bot</CardTitle>
            <CardDescription>To do</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2"></CardContent>
          <CardFooter></CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="chatgpt">
        <Card className="shadow-none border-none">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>In developement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2"></CardContent>
          <CardFooter></CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
