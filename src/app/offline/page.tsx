export default function OfflinePage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary text-text">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-2xl font-bold mb-4">You're offline</h1>
          <p className="text-textSecondary mb-6">
            Don't worry! You can still browse cached snippets and any changes you make will sync when you're back online.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }