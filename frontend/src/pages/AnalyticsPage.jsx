import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, ArcElement, BarElement } from 'chart.js';
import api from '../lib/api';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, ArcElement, BarElement);

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [patterns, setPatterns] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, patternsRes, recsRes] = await Promise.all([
                api.get('/analytics'),
                api.get('/analytics/patterns'),
                api.get('/analytics/recommendations')
            ]);
            if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
            if (patternsRes.data.success) setPatterns(patternsRes.data.data);
            if (recsRes.data.success) setRecommendations(recsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const radarData = {
        labels: analytics?.skillRadar?.map(s => s.topic) || [],
        datasets: [{
            label: 'Skill Proficiency',
            data: analytics?.skillRadar?.map(s => s.proficiency) || [],
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
            borderColor: '#6366f1',
            borderWidth: 2,
            pointBackgroundColor: '#a855f7'
        }]
    };

    const activityData = {
        labels: analytics?.activityHeatmap?.map(d => d.date.slice(5)) || [],
        datasets: [{
            label: 'Daily Activity',
            data: analytics?.activityHeatmap?.map(d => d.activity) || [],
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            tension: 0.4
        }]
    };

    const difficultyData = {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
            data: [analytics?.difficultyBreakdown?.easy || 0, analytics?.difficultyBreakdown?.medium || 0, analytics?.difficultyBreakdown?.hard || 0],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
        }]
    };

    const hourlyData = {
        labels: patterns?.hourlyActivity?.map(h => h.hour) || [],
        datasets: [{
            label: 'Learning Activity',
            data: patterns?.hourlyActivity?.map(h => h.count) || [],
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderRadius: 4
        }]
    };

    return (
        <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">📊 Learning Analytics</h1>
                    <p className="text-gray-400">Insights into your learning journey</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    {[
                        { label: 'Total XP', value: analytics?.overview?.totalXP, icon: '⚡', color: '#f59e0b' },
                        { label: 'Level', value: analytics?.overview?.level, icon: '🏆', color: '#6366f1' },
                        { label: 'Streak', value: `${analytics?.overview?.currentStreak} days`, icon: '🔥', color: '#ef4444' },
                        { label: 'Lessons', value: analytics?.overview?.totalLessonsCompleted, icon: '📚', color: '#10b981' },
                        { label: 'Quizzes', value: analytics?.overview?.totalQuizzesTaken, icon: '🎯', color: '#06b6d4' },
                        { label: 'Badges', value: analytics?.overview?.badgeCount, icon: '🏅', color: '#a855f7' }
                    ].map((stat, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-xl text-center" style={{ background: 'rgba(15, 23, 42, 0.7)', border: `1px solid ${stat.color}40` }}>
                            <span className="text-2xl">{stat.icon}</span>
                            <p className="text-2xl font-bold text-white mt-2">{stat.value || 0}</p>
                            <p className="text-xs text-gray-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Skill Radar */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-6 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <h3 className="text-white font-semibold mb-4">🎯 Skill Proficiency</h3>
                        <div className="h-64">
                            {analytics?.skillRadar?.length > 0 ? (
                                <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, angleLines: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#9ca3af' }, ticks: { display: false } } }, plugins: { legend: { display: false } } }} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">Complete more lessons to see skill data</div>
                            )}
                        </div>
                    </motion.div>

                    {/* Activity Trend */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        className="p-6 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <h3 className="text-white font-semibold mb-4">📈 Activity Trend (30 Days)</h3>
                        <div className="h-64">
                            <Line data={activityData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#9ca3af' }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } } }, plugins: { legend: { display: false } } }} />
                        </div>
                    </motion.div>

                    {/* Difficulty Breakdown */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="p-6 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <h3 className="text-white font-semibold mb-4">📊 Difficulty Completed</h3>
                        <div className="h-64 flex items-center justify-center">
                            <Doughnut data={difficultyData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } } }} />
                        </div>
                    </motion.div>

                    {/* Hourly Activity */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="p-6 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <h3 className="text-white font-semibold mb-4">⏰ Best Learning Hours</h3>
                        <div className="h-64">
                            <Bar data={hourlyData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#9ca3af', maxTicksLimit: 12 }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } } }, plugins: { legend: { display: false } } }} />
                        </div>
                    </motion.div>
                </div>

                {/* Insights & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Insights */}
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <h3 className="text-white font-semibold mb-4">💡 Insights</h3>
                        <div className="space-y-3">
                            {analytics?.insights?.length > 0 ? analytics.insights.map((insight, idx) => (
                                <div key={idx} className={`p-3 rounded-lg ${insight.type === 'positive' ? 'bg-green-500/10 border-l-4 border-green-500' : 'bg-yellow-500/10 border-l-4 border-yellow-500'}`}>
                                    <p className="text-gray-300 text-sm">{insight.message}</p>
                                </div>
                            )) : <p className="text-gray-400">Keep learning to get personalized insights!</p>}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <h3 className="text-white font-semibold mb-4">🎯 Recommendations</h3>
                        <div className="space-y-3">
                            {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-indigo-500/10 flex items-start gap-3">
                                    <span className="text-2xl">{rec.icon}</span>
                                    <div>
                                        <p className="text-white font-medium">{rec.title}</p>
                                        <p className="text-gray-400 text-sm">{rec.message}</p>
                                    </div>
                                </div>
                            )) : <p className="text-gray-400">No recommendations at this time!</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
