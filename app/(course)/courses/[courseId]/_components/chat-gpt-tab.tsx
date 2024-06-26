"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FaSpinner } from "react-icons/fa";

interface Message {
  text: string;
  isUserMessage: boolean;
}

const ChatGPTTab = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on initial render
    return [];
  });
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Save messages to localStorage whenever messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      await handleSubmitMessage(inputValue);
      setInputValue("");
    }
  };

  const handleSubmitMessage = async (message: string) => {
    // Add the user message to the messages array
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, isUserMessage: true },
      // Add an empty message for the loading dot
      { text: "", isUserMessage: false },
    ]);

    try {
      // Construct queryMessages from the last 10 messages
      const queryMessages = messages
        .slice(-10) // Take the last 10 messages
        .map((msg) => ({
          role: msg.isUserMessage ? "user" : "assistant",
          content: msg.text,
        }));

      // Add the current user message to queryMessages
      queryMessages.push({ role: "user", content: message });
      console.log(process.env.NEXT_PUBLIC_CHATGPY_API_KEY)
      // Fetch response from ChatGPT
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: queryMessages,
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CHATGPY_API_KEY}`,
          },
        }
      );
      console.log("response" , response)
      // Extract the ChatGPT response
      const chatGPTResponse: string = response.data.choices[0].message.content;

      // Update messages array with ChatGPT response
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), // Remove the empty message
        {
          text: chatGPTResponse,
          isUserMessage: false,
        },
      ]);
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
    }
  };

  return (
    <Card className="shadow-none border-none p-0">
      <CardContent className="space-y-2 mt-3.5 pt-9 h-[300px] max-h-[300px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex text-white text-sm ${
                msg.isUserMessage ? "justify-end" : "justify-start"
              }`}
            >
              {msg.isUserMessage ? (
                <div className="bg-emerald-500 rounded-xl rounded-br-none w-fit max-w-xs px-3 py-2">
                  {msg.text}
                </div>
              ) : (
                <div className="bg-sky-500 rounded-xl rounded-bl-none w-fit max-w-xs px-3 py-2 whitespace-pre-wrap">
                  {msg.text === "" ? (
                    <FaSpinner className="text-lg animate-spin" />
                  ) : (
                    msg.text
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <Input
          type="text"
          className="w-full border-none focus-visible:ring-0 bg-slate-100 mt-5"
          placeholder="Type your message..."
          value={inputValue}
          multiple
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
      </CardFooter>
    </Card>
  );
};

export default ChatGPTTab;
