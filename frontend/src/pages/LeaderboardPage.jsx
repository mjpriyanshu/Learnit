import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';

const LeaderboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [userStats, setUserStats] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await api.get('/gamification/leaderboard');
            if (response.data.success) {
                setLeaderboard(response.data.data.leaderboard);
                setUserRank(response.data.data.userRank);
                setUserStats(response.data.data.userStats);
            }
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return '👑';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getRankStyle = (rank) => {
        if (rank === 1) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
        if (rank === 2) return 'bg-gray-400/20 border-gray-400/50 text-gray-300';
        if (rank === 3) return 'bg-orange-700/20 border-orange-700/50 text-orange-300';
        return 'bg-slate-800/50 border-white/5 text-gray-400';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a1e]">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                        Global Leaderboard
                    </h1>
                    <p className="text-gray-400">Top learners competing for glory</p>
                </div>

                {/* Current User Stats Card */}
                {userStats && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6 mb-8 flex justify-between items-center shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/30">
                                You
                            </div>
                            <div>
                                <div className="text-sm text-indigo-300 font-semibold uppercase tracking-wider">Your Rank</div>
                                <div className="text-3xl font-bold text-white">#{userRank || '-'}</div>
                            </div>
                        </div>
                        <div className="flex gap-8 text-center">
                            <div>
                                <div className="text-sm text-gray-400">Total XP</div>
                                <div className="text-xl font-bold text-white">{userStats.xp}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Level</div>
                                <div className="text-xl font-bold text-white">{userStats.level}</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Leaderboard List */}
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-6">Learner</div>
                        <div className="col-span-2 text-center">Level</div>
                        <div className="col-span-2 text-right">XP</div>
                    </div>

                    <div className="p-2 space-y-2">
                        {leaderboard.map((user, index) => (
                            <motion.div
                                key={user.userId || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`grid grid-cols-12 gap-4 p-4 rounded-xl items-center border transition-all ${getRankStyle(user.rank)}`}
                            >
                                <div className="col-span-2 flex justify-center text-2xl font-bold">
                                    {getRankBadge(user.rank)}
                                </div>

                                <div className="col-span-6 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-slate-700/50 text-white`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">{user.name}</div>
                                        <div className="text-xs text-gray-400">{user.badgeCount} Badges</div>
                                    </div>
                                </div>

                                <div className="col-span-2 text-center font-mono text-indigo-300">
                                    Lvl {user.level}
                                </div>

                                <div className="col-span-2 text-right font-bold text-white">
                                    {user.xp.toLocaleString()}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
