'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/components/auth-provider';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiStar, FiEdit3, FiX, FiSend } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

function StarRating({ value, onChange, readonly = false }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                >
                    <FiStar
                        className={`w-5 h-5 transition-colors ${star <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                    />
                </button>
            ))}
        </div>
    );
}

function ReviewCard({ review }) {
    const timeAgo = review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : '';
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
                <img
                    src={review.student?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.student?.fullName}`}
                    alt={review.student?.fullName}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm">{review.student?.fullName}</p>
                        <span className="text-gray-600 text-xs">{timeAgo}</span>
                    </div>
                    <StarRating value={review.rating} readonly />
                </div>
            </div>
            {review.review && (
                <p className="text-gray-400 text-sm leading-relaxed">{review.review}</p>
            )}
        </div>
    );
}

// Inline review form (for after a completed session)
function ReviewForm({ mentorId, bookingId, onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) { toast.error('Please select a rating'); return; }
        try {
            setSubmitting(true);
            await api.post(`/mentor-reviews/${mentorId}`, {
                rating,
                review: reviewText,
                bookingId,
            });
            toast.success('Review submitted!');
            onSubmitted?.();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <p className="text-sm text-gray-400 mb-2">Your rating</p>
                <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share your experience with this mentor... (optional)"
                rows={3}
                className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none resize-none text-sm"
            />
            <button
                type="submit"
                disabled={submitting || !rating}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-5 py-2.5 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
                <FiSend className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}

// Full mentor reviews section (used on mentor profile pages)
export default function MentorReviews({ mentorId, showWriteReview = false }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [total, setTotal] = useState(0);
    const [avgRating, setAvgRating] = useState(0);
    const [distribution, setDistribution] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [canReview, setCanReview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const limit = 5;

    useEffect(() => {
        if (mentorId) {
            fetchReviews();
            if (user) checkCanReview();
        }
    }, [mentorId, page, user]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/mentor-reviews/${mentorId}?page=${page}&limit=${limit}`);
            setReviews(res.data.reviews || []);
            setTotal(res.data.total || 0);
            setAvgRating(res.data.avgRating || 0);
            setDistribution(res.data.distribution || {});
        } catch (err) {
            console.error('Reviews fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkCanReview = async () => {
        try {
            const res = await api.get(`/mentor-reviews/${mentorId}/can-review`);
            setCanReview(res.data);
        } catch { }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Summary bar */}
            {total > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="text-center">
                            <p className="text-5xl font-black text-amber-400">{avgRating.toFixed(1)}</p>
                            <StarRating value={Math.round(avgRating)} readonly />
                            <p className="text-gray-500 text-xs mt-1">{total} review{total !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex-1 space-y-2">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = distribution[star] || 0;
                                const pct = total > 0 ? (count / total) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2 text-xs">
                                        <span className="text-gray-500 w-3">{star}</span>
                                        <FiStar className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-gray-600 w-4">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Write review button */}
                    {showWriteReview && canReview?.canReview && !showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-4 py-2.5 rounded-2xl transition-all text-sm"
                        >
                            <FiEdit3 className="w-4 h-4" /> Write a Review
                        </button>
                    )}
                </div>
            )}

            {/* Review form */}
            <AnimatePresence>
                {showForm && canReview?.canReview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold">Write Your Review</h3>
                            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                                <FiX className="text-gray-400 w-4 h-4" />
                            </button>
                        </div>
                        <ReviewForm
                            mentorId={mentorId}
                            bookingId={canReview.bookingId}
                            onSubmitted={() => {
                                setShowForm(false);
                                setCanReview(null);
                                fetchReviews();
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reviews list */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-28 bg-white/5 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <FiStar className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p>No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {reviews.map((review) => <ReviewCard key={review._id} review={review} />)}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm disabled:opacity-40 transition-all"
                            >
                                Previous
                            </button>
                            <span className="text-gray-500 text-sm">{page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm disabled:opacity-40 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export { StarRating, ReviewForm };
