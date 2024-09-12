"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { WriteStream } from "fs";
import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";

const page = () => {
  const [messages, setMessages] = useState([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex items-center justify-center h-full bg-gray-900 p-4">
      <div className="rounded-lg shadow-lg w-full p-6 bg-gray-800">
        {messages.map((m, idx) => (
          <Ai_Resposne_Box message={m} key={idx} />
        ))}
        <AI_Search_Box
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </div>
  );
};

export default page;

const AI_Search_Box = ({
  messages,
  isGenerating,
  setIsGenerating,
  setMessages,
}: {
  messages: Array<any>;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  setMessages: Dispatch<SetStateAction<Array<any>>>;
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    if (isGenerating) return toast.error("Working on the last query!");
    setIsGenerating(true);
    e.preventDefault();

    setMessages((prev) =>
      prev.concat({
        query: query,
        content: "",
      })
    );

    const response = await fetch(`/api/ai/search?query=${query}`, {
      method: "GET",
    });

    if (!response.body) {
      throw new Error("Readable stream not supported.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let text = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });

      text += chunk;

      setMessages((prev) => {
        let last_message = prev[prev.length - 1];
        console.log({ last_message });
        last_message = {
          ...last_message,
          content: text,
        };

        prev[prev.length - 1] = last_message;

        return prev.map((p, idx) =>
          idx === prev.length - 1 ? last_message : p
        );
      });
    }

    setQuery("");
    setIsGenerating(false);
  };

  return (
    <>
      {!messages.length && (
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Where should we start
        </h1>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center rounded-full bg-gray-700 p-2 shadow-inner sticky bottom-4 backdrop:blur-md"
      >
        <Input
          type="text"
          placeholder="Type your query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-none outline-none text-white placeholder-gray-400 px-4 py-2 transition-all duration-300 ease-in-out"
        />
        {isGenerating ? (
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 animate-spin stroke-zinc-400"
          >
            <path d="M12 3v3m6.366-.366-2.12 2.12M21 12h-3m.366 6.366-2.12-2.12M12 21v-3m-6.366.366 2.12-2.12M3 12h3m-.366-6.366 2.12 2.12"></path>
          </svg>
        ) : (
          <button
            type="submit"
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white rounded-full p-2 ml-2 transition-all duration-300"
          >
            <p className="h-6 w-6">S</p>
          </button>
        )}
      </form>
    </>
  );
};

const Ai_Resposne_Box = ({ message }) => {
  return (
    <div className="rounded-lg p-4 shadow-md mt-6 text-white">
      <h1 className="mb-5 text-3xl">{message.query}</h1>
      <ReactMarkDown
        children={message.content}
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-3xl font-extrabold text-white my-4 leading-tight"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-2xl font-bold text-white my-3 leading-snug border-b border-gray-700 pb-1"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-xl font-semibold text-gray-300 my-2 leading-snug"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="text-white mb-4 leading-relaxed" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-200" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside text-gray-400 mb-4 pl-5 space-y-2"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-300 mb-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-700 pl-4 text-gray-400 italic my-4"
              {...props}
            />
          ),
          code: ({ node, className, children, ...props }) => (
            <code
              className={`bg-gray-800 text-gray-200 rounded p-4 block my-2 overflow-auto`}
              {...props}
            >
              {children}
            </code>
          ),
        }}
      />
    </div>
  );
};
