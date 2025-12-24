import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';

export const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    const [stats, setStats] = useState({
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        hasCompletedAssessment: false,
        totalLessonsCompleted: 0,
        totalQuizzesTaken: 0,
        xpForNextLevel: 100,
        progressToNextLevel: 0,
        activityDates: []
    });

    const [loading, setLoading] = useState(true);
    const [showXPPopup, setShowXPPopup] = useState(false);
    const [xpGained, setXpGained] = useState(0);
    const [newBadge, setNewBadge] = useState(null);

    // Fetch stats on mount and when user changes
    useEffect(() => {
        if (user) {
            fetchStats();
            updateStreak();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/gamification/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch gamification stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStreak = async () => {
        try {
            const response = await api.post('/gamification/update-streak');
            if (response.data.success) {
                const { currentStreak, newBadges } = response.data.data;
                setStats(prev => ({ ...prev, currentStreak }));

                // Show badge notification
                if (newBadges && newBadges.length > 0) {
                    newBadges.forEach(badge => {
                        showBadgeUnlock(badge);
                    });
                }
            }
        } catch (error) {
            console.error('Failed to update streak:', error);
        }
    };

    const showXPGain = (amount) => {
        setXpGained(amount);
        setShowXPPopup(true);
        setTimeout(() => setShowXPPopup(false), 2000);
    };

    const showBadgeUnlock = (badge) => {
        setNewBadge(badge);
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg rounded-lg pointer-events-auto flex items-center p-4`}
            >
                <div className="text-4xl mr-4">{badge.icon}</div>
                <div>
                    <p className="text-lg font-bold text-white">Badge Unlocked!</p>
                    <p className="text-sm text-purple-200">{badge.name}</p>
                    <p className="text-xs text-purple-300">{badge.description}</p>
                </div>
            </div>
        ), { duration: 4000 });

        setTimeout(() => setNewBadge(null), 4000);
    };

    const recordLessonComplete = async () => {
        try {
            const response = await api.post('/gamification/lesson-complete');
            if (response.data.success) {
                const { xpEarned, totalXP, level, newBadges } = response.data.data;

                setStats(prev => ({
                    ...prev,
                    xp: totalXP,
                    level,
                    totalLessonsCompleted: prev.totalLessonsCompleted + 1
                }));

                showXPGain(xpEarned);

                if (newBadges && newBadges.length > 0) {
                    newBadges.forEach(badge => showBadgeUnlock(badge));
                }

                return response.data.data;
            }
        } catch (error) {
            console.error('Failed to record lesson completion:', error);
        }
    };

    const addXP = (amount, newBadges = []) => {
        setStats(prev => {
            const newXP = prev.xp + amount;
            const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
            return { ...prev, xp: newXP, level: newLevel };
        });

        showXPGain(amount);

        if (newBadges.length > 0) {
            newBadges.forEach(badge => showBadgeUnlock(badge));
        }
    };

    const refreshStats = () => {
        fetchStats();
    };

    return (
        <GamificationContext.Provider
            value={{
                stats,
                loading,
                showXPPopup,
                xpGained,
                newBadge,
                fetchStats,
                updateStreak,
                recordLessonComplete,
                addXP,
                refreshStats,
                showXPGain,
                showBadgeUnlock
            }}
        >
            {children}
        </GamificationContext.Provider>
    );
};

export default GamificationProvider;
