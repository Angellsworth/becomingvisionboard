"use client"

import { useState, useEffect } from "react"

const quotes = [
  {
    text: "There is no greater agony than bearing an untold story inside you.",
    author: "Maya Angelou",
    color: "border-pacific",
  },
  {
    text: "Owning our story and loving ourselves through that process is the bravest thing that we'll ever do.",
    author: "Brené Brown",
    color: "border-grape",
  },
  {
    text: "You may not control all the events that happen to you, but you can decide not to be reduced by them.",
    author: "Maya Angelou",
    color: "border-dusk",
  },
  {
    text: "Vulnerability is not winning or losing; it's having the courage to show up and be seen when we have no control over the outcome.",
    author: "Brené Brown",
    color: "border-pacific",
  },
  {
    text: "My mission in life is not merely to survive, but to thrive; and to do so with some passion, some compassion, some humor, and some style.",
    author: "Maya Angelou",
    color: "border-grape",
  },
  {
    text: "Courage starts with showing up and letting ourselves be seen.",
    author: "Brené Brown",
    color: "border-dusk",
  },
  {
    text: "Do the best you can until you know better. Then when you know better, do better.",
    author: "Maya Angelou",
    color: "border-pacific",
  },
  {
    text: "Imperfections are not inadequacies; they are reminders that we're all in this together.",
    author: "Brené Brown",
    color: "border-grape",
  },
  {
    text: "If you don't like something, change it. If you can't change it, change your attitude.",
    author: "Maya Angelou",
    color: "border-dusk",
  },
  {
    text: "You are imperfect, you are wired for struggle, but you are worthy of love and belonging.",
    author: "Brené Brown",
    color: "border-pacific",
  },
]

export function RotatingQuote() {
  const [currentQuote, setCurrentQuote] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 8000) // Change quote every 8 seconds

    return () => clearInterval(interval)
  }, [])

  const quote = quotes[currentQuote]

  return (
    <div className="my-20">
      <blockquote className={`border-l-4 ${quote.color} pl-6 py-2 transition-all duration-500`}>
        <p className="font-serif text-2xl text-foreground/90 leading-relaxed italic mb-3">"{quote.text}"</p>
        <footer className="text-muted text-sm">— {quote.author}</footer>
      </blockquote>
    </div>
  )
}
