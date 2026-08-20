import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquareText, Send } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionName?: string;
  // Called with the rating (1-5) and review text when the user submits.
  // Wire this up to your store / API call.
  onSubmit: (rating: number, reviewText: string) => void | Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, institutionName, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const MAX_LEN = 500;

  const handleClose = () => {
    // Reset after the close animation has time to play
    setTimeout(() => {
      setRating(0);
      setHoverRating(0);
      setReviewText('');
      setSubmitting(false);
      setSubmitted(false);
    }, 250);
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(rating, reviewText.trim());
      setSubmitted(true);
      setTimeout(handleClose, 1400);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-[#0f0a1e] border border-white/10 rounded-2xl z-50 overflow-hidden shadow-2xl shadow-violet-900/40"
          >
            {submitted ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30"
                >
                  <Star className="w-8 h-8 text-white fill-white" />
                </motion.div>
                <h3 className="text-lg font-black text-white mb-1">Thanks for the feedback!</h3>
                <p className="text-gray-400 text-sm">Your review helps improve the canteen.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <MessageSquareText className="w-5 h-5 text-violet-400" />
                      Rate & Review
                    </h2>
                    {institutionName && (
                      <p className="text-gray-400 text-xs mt-0.5 truncate">{institutionName}</p>
                    )}
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-xl bg-white/8 hover:bg-white/15 text-gray-400 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Star rating */}
                  <div>
                    <p className="text-sm font-semibold text-gray-300 mb-2">How was your experience?</p>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => {
                        const filled = star <= (hoverRating || rating);
                        return (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                              }`}
                            />
                          </motion.button>
                        );
                      })}
                    </div>
                    {rating > 0 && (
                      <p className="text-xs text-violet-300 mt-1.5 font-medium">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                      </p>
                    )}
                  </div>

                  {/* Review text box */}
                  <div>
                    <p className="text-sm font-semibold text-gray-300 mb-2">Tell us more (optional)</p>
                    <textarea
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value.slice(0, MAX_LEN))}
                      placeholder="Food quality, wait time, service, hygiene..."
                      rows={4}
                      className="w-full bg-white/8 border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all resize-none"
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-gray-500">{reviewText.length}/{MAX_LEN}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <motion.button
                    whileHover={{ scale: rating === 0 ? 1 : 1.02 }}
                    whileTap={{ scale: rating === 0 ? 1 : 0.98 }}
                    onClick={handleSubmit}
                    disabled={rating === 0 || submitting}
                    className={`w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                      rating === 0 || submitting
                        ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25'
                    }`}
                  >
                    {submitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Review
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;