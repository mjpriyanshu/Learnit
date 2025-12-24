import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';

const ForumPage = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPost, setSelectedPost] = useState(null);
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
    const [newComment, setNewComment] = useState('');

    useEffect(() => { fetchData(); }, [selectedCategory]);

    const fetchData = async () => {
        try {
            const [postsRes, catsRes] = await Promise.all([
                api.get(`/forum/posts?category=${selectedCategory}`),
                api.get('/forum/categories')
            ]);
            if (postsRes.data.success) setPosts(postsRes.data.data.posts);
            if (catsRes.data.success) setCategories(catsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch forum data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPost = async (postId) => {
        try {
            const response = await api.get(`/forum/posts/${postId}`);
            if (response.data.success) setSelectedPost(response.data.data);
        } catch (error) {
            toast.error('Failed to load post');
        }
    };

    const createPost = async (e) => {
        e.preventDefault();
        if (!newPost.title || !newPost.content) return toast.error('Fill all fields');
        try {
            const response = await api.post('/forum/posts', newPost);
            if (response.data.success) {
                toast.success('Post created!');
                setShowNewPost(false);
                setNewPost({ title: '', content: '', category: 'general' });
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to create post');
        }
    };

    const votePost = async (postId, voteType) => {
        try {
            const response = await api.post(`/forum/posts/${postId}/vote`, { voteType });
            if (response.data.success) {
                setPosts(prev => prev.map(p => p._id === postId ? { ...p, voteScore: response.data.data.voteScore } : p));
                if (selectedPost?._id === postId) {
                    setSelectedPost(prev => ({ ...prev, voteScore: response.data.data.voteScore }));
                }
            }
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    const addComment = async () => {
        if (!newComment.trim() || !selectedPost) return;
        try {
            const response = await api.post(`/forum/posts/${selectedPost._id}/comments`, { content: newComment });
            if (response.data.success) {
                toast.success('Comment added!');
                setNewComment('');
                fetchPost(selectedPost._id);
            }
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const formatTime = (date) => {
        const diff = Date.now() - new Date(date);
        const hours = Math.floor(diff / 3600000);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const categoryIcons = { general: '💬', javascript: '🟨', python: '🐍', react: '⚛️', node: '🟢', database: '🗄️', career: '💼', help: '🆘' };

    return (
        <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">💬 Discussion Forum</h1>
                        <p className="text-gray-400">Ask questions, share knowledge, help others</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowNewPost(true)}
                        className="px-6 py-3 rounded-xl text-white font-semibold" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                        + New Post
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Categories Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <h3 className="text-white font-semibold mb-4">Categories</h3>
                            <button onClick={() => setSelectedCategory('all')}
                                className={`w-full text-left px-3 py-2 rounded-lg mb-2 ${selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                                📋 All Posts
                            </button>
                            {categories.map(cat => (
                                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                                    <span>{categoryIcons[cat.id] || '📁'}</span>
                                    <span>{cat.name}</span>
                                    <span className="ml-auto text-xs opacity-60">{cat.postCount}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Posts List or Post Detail */}
                    <div className="lg:col-span-3">
                        {selectedPost ? (
                            /* Post Detail View */
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <div className="p-6">
                                    <button onClick={() => setSelectedPost(null)} className="text-indigo-400 hover:text-indigo-300 mb-4">← Back to posts</button>
                                    <div className="flex gap-4">
                                        {/* Vote */}
                                        <div className="flex flex-col items-center gap-1">
                                            <button onClick={() => votePost(selectedPost._id, 'up')} className="text-gray-400 hover:text-green-400 text-xl">▲</button>
                                            <span className="text-white font-bold">{selectedPost.voteScore || 0}</span>
                                            <button onClick={() => votePost(selectedPost._id, 'down')} className="text-gray-400 hover:text-red-400 text-xl">▼</button>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-white mb-2">{selectedPost.title}</h2>
                                            <p className="text-gray-300 whitespace-pre-wrap mb-4">{selectedPost.content}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>👤 {selectedPost.author?.name || 'Anonymous'}</span>
                                                <span>📅 {formatTime(selectedPost.createdAt)}</span>
                                                <span className="px-2 py-1 rounded-full bg-gray-700">{categoryIcons[selectedPost.category]} {selectedPost.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div className="border-t border-gray-700 p-6">
                                    <h3 className="text-white font-semibold mb-4">💬 Comments ({selectedPost.comments?.length || 0})</h3>
                                    <div className="flex gap-2 mb-6">
                                        <input type="text" placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && addComment()}
                                            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white" />
                                        <button onClick={addComment} className="px-4 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>Send</button>
                                    </div>
                                    {selectedPost.comments?.map(comment => (
                                        <div key={comment._id} className="p-4 rounded-lg bg-gray-800/50 mb-3">
                                            <p className="text-gray-300">{comment.content}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span>👤 {comment.author?.name}</span>
                                                <span>{formatTime(comment.createdAt)}</span>
                                                {comment.isAcceptedAnswer && <span className="text-green-400">✓ Accepted</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            /* Posts List */
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-12"><div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" /></div>
                                ) : posts.length === 0 ? (
                                    <div className="text-center py-12 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.7)' }}>
                                        <span className="text-6xl">💬</span>
                                        <p className="text-gray-400 mt-4">No posts yet. Start a discussion!</p>
                                    </div>
                                ) : posts.map(post => (
                                    <motion.div key={post._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        onClick={() => fetchPost(post._id)}
                                        className="p-4 rounded-xl cursor-pointer hover:border-indigo-500 transition"
                                        style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                                <button onClick={e => { e.stopPropagation(); votePost(post._id, 'up'); }} className="hover:text-green-400">▲</button>
                                                <span className="text-white font-bold">{post.voteScore || post.upvotes?.length - post.downvotes?.length || 0}</span>
                                                <button onClick={e => { e.stopPropagation(); votePost(post._id, 'down'); }} className="hover:text-red-400">▼</button>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white hover:text-indigo-400">{post.title}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-2 mt-1">{post.content}</p>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                    <span>👤 {post.author?.name}</span>
                                                    <span>💬 {post.commentCount || 0}</span>
                                                    <span>👁️ {post.views}</span>
                                                    <span>{formatTime(post.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* New Post Modal */}
                {showNewPost && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewPost(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
                            className="w-full max-w-lg p-6 rounded-2xl" style={{ background: 'rgba(15, 23, 42, 0.98)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                            <h2 className="text-xl font-bold text-white mb-4">Create New Post</h2>
                            <form onSubmit={createPost} className="space-y-4">
                                <input type="text" placeholder="Title *" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white" required />
                                <select value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white">
                                    {Object.entries(categoryIcons).map(([key, icon]) => <option key={key} value={key}>{icon} {key}</option>)}
                                </select>
                                <textarea placeholder="Content *" value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white" rows={5} required />
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowNewPost(false)} className="flex-1 p-3 rounded-lg bg-gray-700 text-white">Cancel</button>
                                    <button type="submit" className="flex-1 p-3 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>Post</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForumPage;
