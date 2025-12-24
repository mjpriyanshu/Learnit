import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Save, Youtube, BookOpen, FileText } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const ImportLessonForm = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        contentURL: '',
        sourceType: 'video',
        tags: '',
        difficulty: 'beginner'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Process tags from comma-separated string to array
            const processedData = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
            };

            const response = await api.post('/lessons/custom', processedData);

            if (response.data.success) {
                toast.success('Lesson imported successfully!');
                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    contentURL: '',
                    sourceType: 'video',
                    tags: '',
                    difficulty: 'beginner'
                });
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Import failed:', error);
            toast.error(error.response?.data?.message || 'Failed to import lesson');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                        background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-indigo-500/20">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <LinkIcon className="w-6 h-6 text-indigo-400" />
                                Import Custom Lesson
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">Add your own learning resources to the platform</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Lesson Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Advanced React Patterns"
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-indigo-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            {/* URL */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Resource URL</label>
                                <input
                                    type="url"
                                    name="contentURL"
                                    required
                                    value={formData.contentURL}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-indigo-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            {/* Source Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, sourceType: 'video' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${formData.sourceType === 'video'
                                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                                : 'bg-black/20 border-indigo-500/10 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        <Youtube className="w-4 h-4" /> Video
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, sourceType: 'article' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${formData.sourceType === 'article'
                                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                                : 'bg-black/20 border-indigo-500/10 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        <FileText className="w-4 h-4" /> Article
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, sourceType: 'docs' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${formData.sourceType === 'docs'
                                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                                : 'bg-black/20 border-indigo-500/10 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        <BookOpen className="w-4 h-4" /> Docs
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, sourceType: 'course' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${formData.sourceType === 'course'
                                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                                : 'bg-black/20 border-indigo-500/10 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        <BookOpen className="w-4 h-4" /> Course
                                    </button>
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-indigo-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            {/* Tags */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="react, javascript, hooks"
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-indigo-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description of what you'll learn..."
                                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-indigo-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-indigo-500/20">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                }}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Import Lesson
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ImportLessonForm;
