import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { GamificationContext } from '../context/GamificationContext';

const StreakCounter = ({ showLabel = true }) => {
    const { stats } = useContext(GamificationContext);

    const { currentStreak, longestStreak } = stats;

    // Determine fire intensity based on streak
    const getFireEmoji = () => {
        if (currentStreak >= 30) return '🔥🔥🔥';
        if (currentStreak >= 14) return '🔥🔥';
        if (currentStreak >= 7) return '🔥';
        if (currentStreak >= 3) return '⚡';
        return '✨';
    };

    const getStreakColor = () => {
        if (currentStreak >= 30) return '#ef4444'; // Red
        if (currentStreak >= 14) return '#f97316'; // Orange
        if (currentStreak >= 7) return '#eab308'; // Yellow
        if (currentStreak >= 3) return '#a855f7'; // Purple
        return '#6366f1'; // Indigo
    };

    return (
        <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
                background: `${getStreakColor()}20`,
                border: `1px solid ${getStreakColor()}40`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.span
                className="text-lg"
                animate={{
                    scale: currentStreak > 0 ? [1, 1.2, 1] : 1,
                    rotate: currentStreak > 0 ? [0, -10, 10, 0] : 0
                }}
                transition={{
                    duration: 0.5,
                    repeat: currentStreak >= 7 ? Infinity : 0,
                    repeatDelay: 2
                }}
            >
                {getFireEmoji()}
            </motion.span>
            <div className="flex flex-col">
                <span
                    className="text-sm font-bold"
                    style={{ color: getStreakColor() }}
                >
                    {currentStreak} day{currentStreak !== 1 ? 's' : ''}
                </span>
                {showLabel && (
                    <span className="text-xs text-gray-400">
                        Best: {longestStreak}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default StreakCounter;
