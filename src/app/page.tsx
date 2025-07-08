import Link from 'next/link';

export default function Home(){
  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Your AI-powered Snippet Brain</h1>
        <p className="text-lg text-neutral-600 max-w-xl mx-auto">
          Discover, save and share reusable code snippets. Like Spotify but for code. 
        </p>{/*digital Swiss Army Knife */}
        <Link href="/snippets"
        className="text-amber-300 inline-block px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition">Browse Snippets</Link>
      </div>
    </section>
  )
}
