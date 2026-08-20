import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquareText, User } from 'lucide-react';
import { Review } from '../../store/useStore';
import { timeAgo } from '../../utils/helpers';

interface AdminReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
  averageRating: number;
}

export const AdminReviewsModal: React.FC<AdminReviewsModalProps> = ({ isOpen, onClose, reviews, averageRating }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto max-h-[80vh] bg-[#0f0a1e] border border-white/10 rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl shadow-violet-900/40"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <MessageSquareText className="w-5 h-5 text-violet-400" />
                  Student Reviews
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-yellow-300 font-semibold">{averageRating}</span>
                    <span className="text-xs text-gray-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/8 hover:bg-white/15 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No reviews yet</p>
                  <p className="text-sm text-gray-500">Student reviews will appear here</p>
                </div>
              ) : (
                reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-violet-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{review.userName}</p>
                          <p className="text-xs text-gray-500">{timeAgo(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.reviewText && (
                      <p className="text-sm text-gray-300 leading-relaxed">{review.reviewText}</p>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminReviewsModal;