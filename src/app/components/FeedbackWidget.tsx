"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Star } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmitting(true);

    try {
      
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: feedback.trim(),
          rating,
          email: email.trim() || null,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Thank you for your feedback! 🙏");
        setFeedback("");
        setRating(0);
        setEmail("");
        setIsOpen(false);
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-lightGreen text-primary rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        title="Give feedback"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary border border-textSecondary rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Send Feedback</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-textSecondary hover:text-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  How would you rate Snippetly?
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? "text-yellow-400 fill-current"
                            : "text-textSecondary"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label
                  htmlFor="feedback"
                  className="block text-sm font-medium mb-2"
                >
                  Your feedback *
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What can we improve? Any bugs or feature requests?"
                  className="w-full p-3 border border-textSecondary rounded-lg bg-primary text-text placeholder-textSecondary focus:border-lightGreen focus:outline-none resize-none"
                  rows={4}
                  required
                  maxLength={500}
                />
                <p className="text-xs text-textSecondary mt-1">
                  {feedback.length}/500 characters
                </p>
              </div>

              {/* Email (optional) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email (optional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 border border-textSecondary rounded-lg bg-primary text-text placeholder-textSecondary focus:border-lightGreen focus:outline-none"
                />
                <p className="text-xs text-textSecondary mt-1">
                  We'll only use this to follow up on your feedback
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !feedback.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-lightGreen text-primary rounded-lg font-medium hover:bg-lightGreen/80 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitting ? "Sending..." : "Send Feedback"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={submitting}
                  className="px-4 py-3 bg-textSecondary text-primary rounded-lg font-medium hover:bg-textSecondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
