import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-text mb-2">
            Page Not Found
          </h1>
          <p className="text-textSecondary">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/snippets"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium"
          >
            Browse Snippets
          </Link>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-textSecondary text-text rounded-lg hover:bg-textSecondary/10 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}