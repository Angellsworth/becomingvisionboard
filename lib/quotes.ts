// Curated quote rotation — chosen for the audience this app is built for.
// One per day, picked deterministically from the date so it stays constant all day.

export interface Quote {
  text: string
  author: string
}

const QUOTES: Quote[] = [
  { text: "You may not control all the events that happen to you, but you can decide not to be reduced by them.", author: "Maya Angelou" },
  { text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
  { text: "Owning our story and loving ourselves through that process is the bravest thing we'll ever do.", author: "Brené Brown" },
  { text: "Vulnerability is not winning or losing; it's having the courage to show up.", author: "Brené Brown" },
  { text: "You are imperfect, you are wired for struggle, but you are worthy of love and belonging.", author: "Brené Brown" },
  { text: "We tell ourselves stories in order to live.", author: "Joan Didion" },
  { text: "I learned a long time ago the wisest thing I can do is be on my own side.", author: "Maya Angelou" },
  { text: "Caring for myself is not self-indulgence, it is self-preservation.", author: "Audre Lorde" },
  { text: "I am deliberate and afraid of nothing.", author: "Audre Lorde" },
  { text: "If I had to live my life again, I'd make the same mistakes, only sooner.", author: "Tallulah Bankhead" },
  { text: "You don't have to be pretty. You don't owe prettiness to anyone.", author: "Erin McKean" },
  { text: "I am no longer accepting the things I cannot change. I am changing the things I cannot accept.", author: "Angela Davis" },
  { text: "I would rather have a few flowers in my own garden than have the choicest in someone else's.", author: "Henrik Ibsen" },
  { text: "She remembered who she was, and the game changed.", author: "Lalah Delia" },
  { text: "Tell me, what is it you plan to do with your one wild and precious life?", author: "Mary Oliver" },
  { text: "Instructions for living a life: Pay attention. Be astonished. Tell about it.", author: "Mary Oliver" },
  { text: "You only are free when you realize you belong no place — you belong every place — no place at all.", author: "Maya Angelou" },
  { text: "I will not have my life narrowed down. I will not bow down to somebody else's whim or to someone else's ignorance.", author: "bell hooks" },
  { text: "The most exhausting thing in life is being insincere.", author: "Anne Morrow Lindbergh" },
  { text: "You have been criticizing yourself for years and it hasn't worked. Try approving of yourself and see what happens.", author: "Louise L. Hay" },
  { text: "We do not grow absolutely, chronologically. We grow sometimes in one dimension, and not in another.", author: "Anaïs Nin" },
  { text: "And the day came when the risk to remain tight in a bud was more painful than the risk it took to blossom.", author: "Anaïs Nin" },
  { text: "Be soft. Do not let the world make you hard.", author: "Iain Thomas" },
  { text: "She is not starting over. She is becoming.", author: "Becoming" },
  { text: "The way you tell your story to yourself matters.", author: "Amy Cuddy" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "Wholeness does not mean perfection: it means embracing brokenness as an integral part of life.", author: "Parker Palmer" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Comparison is the thief of joy.", author: "Theodore Roosevelt" },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "Let everything happen to you: beauty and terror. Just keep going. No feeling is final.", author: "Rainer Maria Rilke" },
]

// Day-of-year, leap-safe. Returns 0–365.
function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getFullYear(), 0, 0)
  const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.floor((now - start) / 86_400_000)
}

export function quoteForDate(date: Date): Quote {
  return QUOTES[dayOfYear(date) % QUOTES.length]
}

export function allQuotes(): Quote[] {
  return QUOTES
}
