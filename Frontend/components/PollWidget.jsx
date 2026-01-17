'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaChartBar, FaTimes } from 'react-icons/fa';

export default function PollWidget({ projectId }) {
    const [polls, setPolls] = useState([]);
    const [showCreatePoll, setShowCreatePoll] = useState(false);
    const [newPoll, setNewPoll] = useState({
        question: '',
        options: ['', ''],
        allowMultipleVotes: false,
        isAnonymous: false,
    });

    useEffect(() => {
        fetchPolls();
    }, [projectId]);

    const fetchPolls = async () => {
        try {
            const { data } = await axios.get(`/api/polls/project/${projectId}`);
            setPolls(data);
        } catch (error) {
            console.error('Error fetching polls:', error);
        }
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();

        if (!newPoll.question.trim()) {
            toast.error('Question is required');
            return;
        }

        const validOptions = newPoll.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            toast.error('At least 2 options are required');
            return;
        }

        try {
            await axios.post('/api/polls', {
                projectId,
                question: newPoll.question,
                options: validOptions,
                allowMultipleVotes: newPoll.allowMultipleVotes,
                isAnonymous: newPoll.isAnonymous,
            });

            setNewPoll({ question: '', options: ['', ''], allowMultipleVotes: false, isAnonymous: false });
            setShowCreatePoll(false);
            await fetchPolls();
            toast.success('Poll created!');
        } catch (error) {
            toast.error('Failed to create poll');
        }
    };

    const handleVote = async (pollId, optionIndex) => {
        try {
            await axios.post(`/api/polls/${pollId}/vote`, { optionIndex });
            await fetchPolls();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to vote');
        }
    };

    const addOption = () => {
        setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    };

    const updateOption = (index, value) => {
        const updatedOptions = [...newPoll.options];
        updatedOptions[index] = value;
        setNewPoll({ ...newPoll, options: updatedOptions });
    };

    const removeOption = (index) => {
        if (newPoll.options.length > 2) {
            setNewPoll({ ...newPoll, options: newPoll.options.filter((_, i) => i !== index) });
        }
    };

    const getTotalVotes = (poll) => {
        return poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
    };

    const getPercentage = (votes, total) => {
        return total === 0 ? 0 : Math.round((votes / total) * 100);
    };

    return (
        <div className="space-y-4">
            {/* Create Poll Button */}
            {!showCreatePoll && (
                <button
                    onClick={() => setShowCreatePoll(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                >
                    Create New Poll
                </button>
            )}

            {/* Create Poll Form */}
            {showCreatePoll && (
                <motion.form
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleCreatePoll}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Create a Poll</h3>
                        <button
                            type="button"
                            onClick={() => setShowCreatePoll(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <input
                        type="text"
                        value={newPoll.question}
                        onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                        placeholder="Ask a question..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <div className="space-y-2">
                        {newPoll.options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {newPoll.options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="px-3 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addOption}
                        className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
                    >
                        + Add Option
                    </button>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newPoll.allowMultipleVotes}
                                onChange={(e) => setNewPoll({ ...newPoll, allowMultipleVotes: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm">Allow multiple votes</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newPoll.isAnonymous}
                                onChange={(e) => setNewPoll({ ...newPoll, isAnonymous: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm">Anonymous voting</span>
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                            Create Poll
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCreatePoll(false)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.form>
            )}

            {/* Polls List */}
            <div className="space-y-4">
                {polls.map(poll => {
                    const totalVotes = getTotalVotes(poll);

                    return (
                        <motion.div
                            key={poll._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                    <FaChartBar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold mb-1">{poll.question}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                                        {!poll.isActive && ' • Closed'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {poll.options.map((option, index) => {
                                    const percentage = getPercentage(option.votes.length, totalVotes);

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => poll.isActive && handleVote(poll._id, index)}
                                            disabled={!poll.isActive}
                                            className="w-full text-left p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
                                        >
                                            {/* Progress bar */}
                                            <div
                                                className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />

                                            {/* Content */}
                                            <div className="relative flex items-center justify-between">
                                                <span className="font-medium">{option.text}</span>
                                                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                    {percentage}%
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );
                })}

                {polls.length === 0 && !showCreatePoll && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No polls yet. Create one to engage your squad!
                    </p>
                )}
            </div>
        </div>
    );
}
