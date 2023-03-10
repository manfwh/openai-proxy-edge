import Image from 'next/image'
import styles from './page.module.css'
import SendMessage from '@/components/chat/send-message'

export default function Home() {
  return (
    <main>
      <SendMessage />
    </main>
  )
}
