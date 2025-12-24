import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GamificationContext } from '../context/GamificationContext';

const XPBar = () => {
    const { stats, showXPPopup, xpGained } = useContext(GamificationContext);

    const { xp, level, progressToNextLevel } = stats;

    return (
        <div className="relative flex items-center gap-3">
            {/* Level Badge */}
            <motion.div
                className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm"
                style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="text-white">{level}</span>
            </motion.div>

            {/* XP Bar */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-purple-300">Level {level}</span>
                    <span className="text-xs text-gray-400">{xp} XP</span>
                </div>
                <div
                    className="w-24 h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(99, 102, 241, 0.2)' }}
                >
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNextLevel}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* XP Gain Popup */}
            <AnimatePresence>
                {showXPPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{ opacity: 1, y: -30, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.5 }}
                        className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full font-bold text-sm whitespace-nowrap"
                        style={{
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.5)'
                        }}
                    >
                        <span className="text-white">+{xpGained} XP</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default XPBar;
