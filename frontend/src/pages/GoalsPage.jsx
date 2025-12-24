import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
    Target, Calendar, Flag, CheckCircle, Clock,
    Plus, Sparkles, TrendingUp, Trophy, ArrowRight,
    Star, Trash2, AlertCircle
} from 'lucide-react';

const GoalsPage = () => {
    const [goals, setGoals] = useState([]);
    const [stats, setStats] = useState({ totalGoals: 0, activeGoals: 0, completedGoals: 0, completionRate: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [isGenerating, setIsGenerating] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'General',
        targetLessons: 5,
        deadline: '',
        priority: 'Medium' // New field (mocked persistence via description or just local if backend ignores)
    });

    // Background Mouse Effect
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => { fetchData(); }, [filter]);

    const fetchData = async () => {
        try {
            const [goalsRes, statsRes] = await Promise.all([
                api.get(`/goals?status=${filter}`),
                api.get('/goals/stats')
            ]);
            if (goalsRes.data.success) setGoals(goalsRes.data.data);
            if (statsRes.data.success) setStats(statsRes.data.data);
        } catch (error) {
            toast.error('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const handleMagicCreate = () => {
        setIsGenerating(true);
        // Mock AI Generation
        setTimeout(() => {
            const suggestions = [
                { title: 'Master React Hooks', desc: 'Complete all advanced React lessons', cat: 'React', target: 12, days: 14 },
                { title: 'Python for Data Science', desc: 'Learn Pandas and NumPy basics', cat: 'Data Science', target: 8, days: 30 },
                { title: 'Build a Portfolio', desc: 'Create 3 projects for resume', cat: 'General', target: 3, days: 21 }
            ];
            const random = suggestions[Math.floor(Math.random() * suggestions.length)];

            const date = new Date();
            date.setDate(date.getDate() + random.days);

            setFormData({
                title: random.title,
                description: random.desc,
                category: random.cat,
                targetLessons: random.target,
                deadline: date.toISOString().split('T')[0],
                priority: 'High'
            });
            setIsGenerating(false);
            toast.success("AI generated a goal plan! 🤖");
        }, 1500);
    };

    const createGoal = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/goals', formData);
            if (response.data.success) {
                toast.success('Goal created successfully! 🎯', {
                    style: { background: '#10b981', color: 'white' }
                });
                setShowModal(false);
                setFormData({ title: '', description: '', category: 'General', targetLessons: 5, deadline: '', priority: 'Medium' });
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to create goal');
        }
    };

    const deleteGoal = async (goalId) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        try {
            await api.delete(`/goals/${goalId}`);
            toast.success('Goal deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete goal');
        }
    };

    const getDaysRemaining = (deadline) => {
        const diff = new Date(deadline) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const categories = ['General', 'JavaScript', 'Python', 'React', 'Node.js', 'Data Science', 'Web Dev'];
    const priorities = ['High', 'Medium', 'Low'];

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0a1e' }}>

            {/* COSMIC BACKGROUND */}
            <div className='fixed inset-0 pointer-events-none' style={{ zIndex: 0 }}>
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.2,
                    backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                    animation: 'moveGrid 20s linear infinite'
                }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
                <div style={{
                    position: 'absolute', left: mousePosition.x, top: mousePosition.y,
                    width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)',
                    transform: 'translate(-50%, -50%)', pointerEvents: 'none'
                }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-8">

                {/* HERO HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className='flex items-center gap-2 mb-2'>
                            <div className='bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider'>
                                Planning Hub
                            </div>
                        </div>
                        <h1 className="text-5xl font-black text-white mb-2 leading-tight">
                            Goals & Focus
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl">
                            "Setting goals is the first step in turning the invisible into the visible."
                        </p>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowModal(true)}
                        className="px-8 py-4 rounded-2xl text-white font-bold shadow-xl shadow-indigo-500/20 flex items-center gap-3 transition-all hover:bg-opacity-90"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                    >
                        <Plus size={24} /> New Goal
                    </motion.button>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Goals', value: stats.totalGoals, icon: Target, color: '#8b5cf6' },
                        { label: 'Active', value: stats.activeGoals, icon: Sparkles, color: '#f59e0b' },
                        { label: 'Completed', value: stats.completedGoals, icon: CheckCircle, color: '#10b981' },
                        { label: 'Success Rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: '#06b6d4' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-6 rounded-2xl relative overflow-hidden group"
                            style={{
                                background: 'rgba(30, 41, 59, 0.4)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                <stat.icon size={80} color={stat.color} />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 rounded-xl" style={{ background: `${stat.color}20`, color: stat.color }}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FILTERS & LIST */}
                <div className="mb-20">
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                        {['all', 'active', 'completed', 'failed'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-6 py-2.5 rounded-xl capitalize font-bold transition-all ${filter === f
                                    ? 'bg-white text-black shadow-lg shadow-white/10'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-20"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                    ) : goals.length === 0 ? (
                        <div className="text-center py-24 rounded-3xl border border-dashed border-gray-700 bg-gray-900/20">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎯</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No goals found</h3>
                            <p className="text-gray-400 mb-8 max-w-sm mx-auto">Create a goal to start tracking your journey towards mastery.</p>
                            <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500">
                                Create First Goal
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {goals.map((goal, idx) => {
                                    const daysLeft = getDaysRemaining(goal.deadline);
                                    const isExpired = daysLeft < 0;
                                    const progress = goal.progressPercent || 0;

                                    return (
                                        <motion.div
                                            key={goal._id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group relative rounded-3xl p-6 overflow-hidden hover:-translate-y-2 transition-transform duration-300"
                                            style={{
                                                background: 'rgba(30, 41, 59, 0.4)',
                                                backdropFilter: 'blur(20px)',
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)'
                                            }}
                                        >
                                            {/* Hover Glow */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                            <div className="flex justify-between items-start mb-6">
                                                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 border border-gray-700">
                                                    {goal.category}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${goal.status === 'completed' ? 'text-green-400 bg-green-900/30' :
                                                            goal.status === 'failed' ? 'text-red-400 bg-red-900/30' : 'text-yellow-400 bg-yellow-900/30'
                                                        }`}>
                                                        {goal.status}
                                                    </span>
                                                    <button onClick={() => deleteGoal(goal._id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{goal.title}</h3>
                                            <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">{goal.description || 'No description provided.'}</p>

                                            {/* Progress Section */}
                                            <div className="mb-6 p-4 rounded-2xl bg-black/20">
                                                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                                    <span>PROGRESS</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden mb-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                                                    />
                                                </div>
                                                <div className="text-xs text-gray-500 flex justify-between">
                                                    <span>{goal.completedLessons} completed</span>
                                                    <span>Target: {goal.targetLessons}</span>
                                                </div>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                                                <div className={`flex items-center gap-2 text-sm font-bold ${isExpired ? 'text-red-400' : daysLeft < 3 ? 'text-orange-400' : 'text-gray-400'}`}>
                                                    <Clock size={16} />
                                                    {isExpired ? 'Expired' : `${daysLeft} days left`}
                                                </div>
                                                {progress === 100 ? (
                                                    <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle size={16} /> Done</span>
                                                ) : (
                                                    <span className="text-indigo-400 font-bold text-xs flex items-center gap-1 cursor-pointer hover:underline">
                                                        Update <ArrowRight size={14} />
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* CREATE MODAL */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">New Goal</h2>
                                        <p className="text-gray-400">Define your target for this sprint.</p>
                                    </div>
                                    <button
                                        onClick={handleMagicCreate}
                                        disabled={isGenerating}
                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                                    >
                                        {isGenerating ? <div className='animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full' /> : <Sparkles size={14} />}
                                        AI Magic Fill
                                    </button>
                                </div>

                                <form onSubmit={createGoal} className="space-y-5">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Goal Title</label>
                                        <input
                                            type="text" placeholder="e.g., Master Advanced React Patterns" value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-indigo-500 focus:bg-gray-800 transition-all font-semibold"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category</label>
                                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-indigo-500">
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Priority</label>
                                            <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-indigo-500">
                                                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Target Lessons</label>
                                            <input type="number" min={1} value={formData.targetLessons} onChange={e => setFormData({ ...formData, targetLessons: Number(e.target.value) })}
                                                className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-indigo-500 font-mono" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deadline</label>
                                            <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-indigo-500" required />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description (Optional)</label>
                                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none" />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl bg-transparent border border-gray-700 text-gray-300 font-bold hover:bg-gray-800">
                                            Cancel
                                        </button>
                                        <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-transform" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                                            Create Goal
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default GoalsPage;
