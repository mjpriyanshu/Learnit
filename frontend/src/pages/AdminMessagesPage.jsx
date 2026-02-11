import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Send, Mail, MailOpen, Users, ArrowLeft, MessageSquare, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AdminMessagesPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [forumPosts, setForumPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notifications'); // notifications or forum
    const [filter, setFilter] = useState('all');
    const [showSendForm, setShowSendForm] = useState(false);
    const [notificationForm, setNotificationForm] = useState({
        title: '',
        message: '',
        icon: '📢',
        sendToAll: true
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [notifRes, forumRes] = await Promise.all([
                api.get('/notifications?limit=1000'),
                api.get('/forum/posts?limit=1000')
            ]);
            
            if (notifRes.data.success) {
                setNotifications(notifRes.data.data.notifications);
            }
            
            if (forumRes.data.success) {
                setForumPosts(forumRes.data.data.posts);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success('Message deleted');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const deleteForumPost = async (id) => {
        try {
            await api.delete(`/forum/posts/${id}`);
            setForumPosts(prev => prev.filter(p => p._id !== id));
            toast.success('Forum post deleted');
        } catch (error) {
            toast.error('Failed to delete forum post');
        }
    };

    const handleSendNotification = async () => {
        if (!notificationForm.title || !notificationForm.message) {
            toast.error('Please fill in title and message');
            return;
        }

        try {
            const response = await api.post('/notifications/create', {
                title: notificationForm.title,
                message: notificationForm.message,
                icon: notificationForm.icon
            });

            if (response.data.success) {
                toast.success('Notification sent to all users! 📢');
                setNotificationForm({ title: '', message: '', icon: '📢', sendToAll: true });
                setShowSendForm(false);
                fetchAllData();
            } else {
                toast.error(response.data.message || 'Failed to send notification');
            }
        } catch (error) {
            toast.error('Failed to send notification');
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Mail className="text-indigo-400" />
                                Admin Messages
                            </h1>
                            <p className="text-gray-400 mt-1">Manage notifications & student forum queries</p>
                        </div>
                        <button
                            onClick={() => setShowSendForm(!showSendForm)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-2 font-medium"
                        >
                            <Send size={18} />
                            {showSendForm ? 'Cancel' : 'Send Notification'}
                        </button>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                            activeTab === 'notifications'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800/50 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Bell size={18} />
                        Notifications ({notifications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('forum')}
                        className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                            activeTab === 'forum'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800/50 text-gray-400 hover:text-white'
                        }`}
                    >
                        <MessageSquare size={18} />
                        Forum Posts ({forumPosts.length})
                    </button>
                </div>

                {/* Send Notification Form */}
                {showSendForm && activeTab === 'notifications' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-6 rounded-xl border"
                        style={{ background: 'rgba(15, 23, 42, 0.7)', borderColor: 'rgba(99, 102, 241, 0.2)' }}
                    >
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Send className="text-indigo-400" size={20} />
                            New Notification
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
                                <div className="flex gap-2">
                                    {['📢', '🎉', '✨', '🔔', '💡', '⚠️'].map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => setNotificationForm({ ...notificationForm, icon: emoji })}
                                            className={`text-2xl p-3 rounded-lg border transition ${
                                                notificationForm.icon === emoji
                                                    ? 'border-indigo-500 bg-indigo-500/20'
                                                    : 'border-white/10 hover:border-white/30'
                                            }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={notificationForm.title}
                                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                                    placeholder="e.g., New Feature Released!"
                                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                <textarea
                                    value={notificationForm.message}
                                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                                    placeholder="Write your message here..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-indigo-500 outline-none resize-none"
                                />
                            </div>
                            <button
                                onClick={handleSendNotification}
                                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Send to All Users
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Filter Tabs - Only for Notifications */}
                {activeTab === 'notifications' && (
                    <div className="flex gap-3 mb-6">
                        {[
                            { key: 'all', label: 'All', count: notifications.length },
                            { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
                            { key: 'read', label: 'Read', count: notifications.filter(n => n.isRead).length }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filter === tab.key
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-800/50 text-gray-400 hover:text-white'
                                }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                )}

                {/* Notifications List */}
                {activeTab === 'notifications' && (
                    <div className="space-y-3">
                        {filteredNotifications.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Mail size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No messages found</p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl border transition-all group ${
                                        notification.isRead
                                            ? 'bg-slate-900/30 border-white/5'
                                            : 'bg-indigo-900/10 border-indigo-500/20'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="text-3xl">{notification.icon || '📢'}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-white">{notification.title}</h3>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                                                    )}
                                                </div>
                                                <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteNotification(notification._id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* Forum Posts List */}
                {activeTab === 'forum' && (
                    <div className="space-y-3">
                        {forumPosts.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No forum posts found</p>
                            </div>
                        ) : (
                            forumPosts.map((post) => (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 rounded-xl border bg-slate-900/30 border-white/10 hover:border-indigo-500/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            {/* Post Header */}
                                            <div className="flex items-start gap-3 mb-3">
                                                <MessageSquare className="text-indigo-400 mt-1" size={20} />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-white text-lg">{post.title}</h3>
                                                        {post.isPinned && (
                                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                                                Pinned
                                                            </span>
                                                        )}
                                                        {post.isResolved && (
                                                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                                                Resolved
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-400 text-sm mb-2">{post.content}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span>By: {post.author?.name || 'Unknown'}</span>
                                                        <span>•</span>
                                                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">
                                                            {post.category}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>👍 {post.voteScore || (post.upvotes?.length || 0) - (post.downvotes?.length || 0)}</span>
                                                        <span>💬 {post.comments?.length || 0}</span>
                                                        <span>👁️ {post.views || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteForumPost(post._id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                                            title="Delete Post"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessagesPage;
