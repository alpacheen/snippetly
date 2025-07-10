import Link from 'next/link';

export default function Hero() {
return (
<section className="bg-primary text-text py-24 px-6 text-center min-h-screen flex flex-col justify-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Your <span className='text-lightGreen '>AI-powered</span> Snippet Brain</h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto">
          Discover, save and share reusable code snippets. Like Spotify but for code. 
        </p>{/*digital Swiss Army Knife */}
        <Link href="/snippets"
        className="inline-block px-6 py-3 rounded-lg bg-lightGreen text-slate-900 font-semibold hover:bg-lightGreen/80 transition">Browse Snippets</Link>
      </div>
    </section>
)
}