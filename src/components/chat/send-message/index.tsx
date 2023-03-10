'use client';

import { useState } from "react";
import { createParser } from 'eventsource-parser'
import { v4 as uuidv4 } from 'uuid'
import { streamAsyncIterable } from "@/utils/stream-async-iterable";

type ChatMessage = {
  id: string
  text: string
  role: string
  name?: string
  delta?: string
  detail?: any
}
const map = new Map<string, ChatMessage>()
const result: ChatMessage = {
  role: 'assistant',
  id: uuidv4(),
  text: ''
}

const parser = createParser((event) => {
  console.log(event)
  if (event.type === 'event') {
    if(event.data === '[DONE]') {
      result.text = result.text.trim()
      map.set(result.id, result)
    } else {
      try {
        const response = JSON.parse(event.data)
        if (response.id) {
          result.id = response.id
          if (response?.choices?.length) {
            const delta = response.choices[0].delta
            result.delta = delta.content
            if (delta?.content) result.text += delta.content
            result.detail = response

            if (delta.role) {
              result.role = delta.role
            }
            console.log('result', result)

            
          }
        }
      } catch (error) {
        
      }
    }
  }
})
const SendMessage = () => {
  const [content, setContent] = useState('')
  const sendMsg = async () => {
    const res = await fetch('/api/message', {
      method: 'POST',
      body: JSON.stringify({
        content,
      }),
    })
    if(res.ok) {
      if(res.body) {
        for await (const chunk of streamAsyncIterable(res.body)) {
          const str = new TextDecoder().decode(chunk)
          parser.feed(str)
        }
      }
    }
  }
  return (
    <>
      <input type="text" placeholder="input message" value={content} onChange={e => setContent(e.target.value)} />
      <button type="button" onClick={sendMsg}>send</button>
    </>
  )
}

export default SendMessage