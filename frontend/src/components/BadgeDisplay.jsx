import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

const BadgeDisplay = ({ badges = [], compact = false }) => {
    const [allBadges, setAllBadges] = useState([]);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllBadges();
    }, []);

    const fetchAllBadges = async () => {
        try {
            const response = await api.get('/gamification/badges');
            if (response.data.success) {
                setAllBadges(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch badges:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className="w-12 h-12 rounded-lg animate-pulse"
                        style={{ background: 'rgba(99, 102, 241, 0.2)' }}
                    />
                ))}
            </div>
        );
    }

    if (compact) {
        // Show only earned badges in a compact view
        const earnedBadges = allBadges.filter(b => b.earned === true);
        return (
            <div className="flex flex-wrap gap-2">
                {earnedBadges.length === 0 ? (
                    <span className="text-gray-500 text-sm">No badges yet</span>
                ) : (
                    earnedBadges.slice(0, 5).map((badge, index) => (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl cursor-pointer"
                            style={{
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3))',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            onClick={() => setSelectedBadge(badge)}
                            title={badge.name}
                        >
                            {badge.icon}
                        </motion.div>
                    ))
                )}
                {earnedBadges.length > 5 && (
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-purple-400"
                        style={{
                            background: 'rgba(99, 102, 241, 0.2)',
                            border: '1px solid rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        +{earnedBadges.length - 5}
                    </div>
                )}
            </div>
        );
    }

    // Full badge grid
    return (
        <>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {allBadges.map((badge, index) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative p-3 rounded-xl flex flex-col items-center justify-center cursor-pointer ${badge.earned ? '' : 'opacity-40 grayscale'
                            }`}
                        style={{
                            background: badge.earned
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3))'
                                : 'rgba(30, 41, 59, 0.5)',
                            border: `1px solid ${badge.earned ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.2)'}`,
                            minHeight: '100px'
                        }}
                        whileHover={{
                            scale: badge.earned ? 1.05 : 1.02,
                            borderColor: 'rgba(168, 85, 247, 0.5)'
                        }}
                        onClick={() => setSelectedBadge(badge)}
                    >
                        <motion.span
                            className="text-3xl mb-2"
                            animate={badge.earned ? {
                                y: [0, -5, 0],
                                rotate: [0, -5, 5, 0]
                            } : {}}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3
                            }}
                        >
                            {badge.earned ? badge.icon : '🔒'}
                        </motion.span>
                        <span className="text-xs text-center text-gray-300 font-medium">
                            {badge.name}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Badge Detail Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
                        onClick={() => setSelectedBadge(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="p-8 rounded-2xl max-w-sm w-full text-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <motion.div
                                className="text-7xl mb-4"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, -10, 10, 0]
                                }}
                                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                            >
                                {selectedBadge.earned ? selectedBadge.icon : '🔒'}
                            </motion.div>

                            <h3 className="text-2xl font-bold text-white mb-2">
                                {selectedBadge.name}
                            </h3>

                            <p className="text-gray-400 mb-4">
                                {selectedBadge.description}
                            </p>

                            {selectedBadge.earned ? (
                                <div className="text-sm text-green-400">
                                    ✓ Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">
                                    Keep learning to unlock this badge!
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedBadge(null)}
                                className="mt-6 px-6 py-2 rounded-lg font-medium text-white"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BadgeDisplay;
