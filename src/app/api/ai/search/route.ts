import axios from "axios";
import { NextResponse } from "next/server";
import { generateText, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const TAVILY_ENDPOINT = "https://api.tavily.com/search";

// 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

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const { textStream } = await streamText({
    model: openai("gpt-4o"),
    system: "You are a friendly assisstant!",
    prompt: searchParams.get("query"),
  });

  return new NextResponse(textStream, {
    status: 200,
  });
  /** 
   * Tavily
   * 
   *  const { data } = await axios.post(TAVILY_ENDPOINT, {
    query: searchParams.get("query"),
    api_key: "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",
    search_depth: "basic",
    topic: "general",
    include_answer: false,
    include_raw_content: false,
    include_images: false,
    include_image_descriptions: false,
    include_domains: [],
    max_results: 5,
  });
  const steam = new ReadableStream({
    async start(controller) {
      const { results } = data;
      const [{ content }] = results;
      await stream_data(content, controller);
      controller.close();
    },
  });

  async function stream_data(
    content: string,
    controller: ReadableStreamDefaultController<any>,
    idx = 0
  ) {
    if (idx >= content.length) return;
    await new Promise((resolve) => setTimeout(resolve, 1));

    console.log({ content, idx });
    controller.enqueue(content[idx]);

    await stream_data(content, controller, idx + 1);
  }
  return new NextResponse(steam, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
 */
};
