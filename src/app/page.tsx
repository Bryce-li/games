import type { Metadata } from 'next'
import HomePage from '@/components/HomePage'

export const metadata: Metadata = {
  title: "Free Online Games on CrazyGames | Play Now!",
  description: "Play free online games at CrazyGames, the best place to play high-quality browser games. We add new games every day. Have fun!",
}

export default function Page() {
  return <HomePage />
}