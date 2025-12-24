import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Mail, MailOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

const MessagesPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllNotifications();
    }, []);

    const fetchAllNotifications = async () => {
        try {
            const response = await api.get('/notifications?limit=100');
            if (response.data.success) {
                setNotifications(response.data.data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success('Message deleted');
        } catch (error) {
            console.error('Failed to delete:', error);
            toast.error('Failed to delete message');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All messages marked as read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            toast.error('Failed to update messages');
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-20">
            <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition"
                        >
                            <ArrowLeft size={20} />
                            Back to Dashboard
                        </button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">Messages</h1>
                                <p className="text-gray-400">
                                    {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
                                >
                                    Mark All Read
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Filter Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-2 mb-6"
                    >
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'unread', label: 'Unread' },
                            { key: 'read', label: 'Read' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filter === tab.key
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </motion.div>

                    {/* Messages List */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                                <p className="text-gray-400 mt-4">Loading messages...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
                            >
                                <span className="text-6xl">📭</span>
                                <p className="text-gray-400 mt-4 text-lg">
                                    {filter === 'unread' ? 'No unread messages' : 
                                     filter === 'read' ? 'No read messages' : 'No messages yet'}
                                </p>
                            </motion.div>
                        ) : (
                            filteredNotifications.map((notification, index) => (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-white/5 backdrop-blur-xl border rounded-xl p-5 hover:bg-white/10 transition group ${
                                        !notification.isRead ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10'
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        <div className="text-4xl">
                                            {notification.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.isRead && (
                                                        <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(notification._id)}
                                                            className="p-2 text-gray-400 hover:text-indigo-400 transition"
                                                            title="Mark as read"
                                                        >
                                                            <Mail size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification._id)}
                                                        className="p-2 text-gray-400 hover:text-red-400 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 mb-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    {notification.isRead ? <MailOpen size={14} /> : <Mail size={14} />}
                                                    {notification.isRead ? 'Read' : 'Unread'}
                                                </span>
                                                <span>•</span>
                                                <span>{formatTime(notification.createdAt)}</span>
                                                {notification.type && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="capitalize">{notification.type}</span>
                                                    </>
                                                )}
                                            </div>
                                            {notification.actionText && notification.link && (
                                                <button
                                                    onClick={() => navigate(notification.link)}
                                                    className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
                                                >
                                                    {notification.actionText}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
    );
};

export default MessagesPage;
