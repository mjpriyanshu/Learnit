import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';

const NotesPanel = ({ lessonId, isOpen, onToggle }) => {
    const [note, setNote] = useState({ content: '', title: '', isBookmarked: false });
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        if (lessonId && isOpen) {
            fetchNote();
        }
    }, [lessonId, isOpen]);

    const fetchNote = async () => {
        try {
            const response = await api.get(`/notes/lesson/${lessonId}`);
            if (response.data.success) {
                setNote(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch note:', error);
        }
    };

    const saveNote = async () => {
        setSaving(true);
        try {
            const response = await api.post(`/notes/lesson/${lessonId}`, {
                content: note.content,
                title: note.title,
                isBookmarked: note.isBookmarked
            });
            if (response.data.success) {
                setLastSaved(new Date());
                toast.success('Note saved!', { duration: 1500 });
            }
        } catch (error) {
            toast.error('Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    const toggleBookmark = async () => {
        try {
            const response = await api.patch(`/notes/lesson/${lessonId}/bookmark`);
            if (response.data.success) {
                setNote(prev => ({ ...prev, isBookmarked: response.data.data.isBookmarked }));
                toast.success(response.data.data.isBookmarked ? 'Bookmarked!' : 'Bookmark removed');
            }
        } catch (error) {
            toast.error('Failed to toggle bookmark');
        }
    };

    // Auto-save after 2 seconds of inactivity
    useEffect(() => {
        if (!note.content || !lessonId) return;
        const timer = setTimeout(() => {
            saveNote();
        }, 2000);
        return () => clearTimeout(timer);
    }, [note.content]);

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                onClick={onToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed right-4 bottom-24 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                }}
            >
                <span className="text-xl">📝</span>
            </motion.button>

            {/* Notes Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed right-0 top-0 h-full w-96 z-50 flex flex-col"
                        style={{
                            background: 'rgba(15, 23, 42, 0.98)',
                            backdropFilter: 'blur(16px)',
                            borderLeft: '1px solid rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📝</span>
                                <h3 className="text-white font-semibold">Notes</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleBookmark}
                                    className={`p-2 rounded-lg transition ${note.isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                                        }`}
                                >
                                    {note.isBookmarked ? '⭐' : '☆'}
                                </button>
                                <button
                                    onClick={onToggle}
                                    className="p-2 text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Title Input */}
                        <input
                            type="text"
                            placeholder="Note title (optional)"
                            value={note.title || ''}
                            onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
                            className="mx-4 mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />

                        {/* Note Content */}
                        <textarea
                            placeholder="Write your notes here... (Markdown supported)"
                            value={note.content || ''}
                            onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
                            className="flex-1 m-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500"
                            style={{ minHeight: '200px' }}
                        />

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Auto-save enabled'}
                            </div>
                            <button
                                onClick={saveNote}
                                disabled={saving}
                                className="px-4 py-2 rounded-lg text-white font-medium transition disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default NotesPanel;
