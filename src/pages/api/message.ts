import { streamAsyncIterable } from "@/utils/stream-async-iterable";
import { NextRequest } from "next/server";

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  if(!req.body) new Error('error')
  let data = ''
  for await (const chunk of streamAsyncIterable(req.body!)) {
    const str = new TextDecoder().decode(chunk)
    data += str
  }
  const { content } = JSON.parse(data)
  const currentDate = new Date().toISOString().split('T')[0]
  const body = {
    model: 'gpt-3.5-turbo',
    temperature: 0.8,
    top_p: 1.0,
    presence_penalty: 1.0,
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${currentDate}`
      },
      {
          role: 'user',
          content,
      }
    ]

  }
   const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.API_KEY}`
  };
  return fetch(`${process.env.APP_URL}/api/openai`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}