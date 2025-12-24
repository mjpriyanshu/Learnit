import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Code, Server, Database, Globe, Lock, Cpu,
    Terminal, Layers, Search, Zap, X, Loader, ZoomIn, ZoomOut, RotateCcw, History
} from 'lucide-react';
import api from '../lib/api';

// Icon mapping for dynamic tree
const iconMap = {
    Code, Server, Database, Globe, Lock, Cpu,
    Terminal, Layers, Search, Zap
};

// Default fallback skill tree
const defaultSkillTree = {
    id: 'root',
    title: 'Mastery Map',
    nodes: [
        // --- FOUNDATION ---
        {
            id: 'cs-basics',
            title: 'CS Fundamentals',
            x: 50, y: 2,
            status: 'completed',
            category: 'foundation',
            icon: Cpu,
            description: 'Computers, Binary, and Logic.',
            videoId: 'zOjov-2OZ0E', // CS50
            connections: ['python-basics', 'js-basics']
        },

        // --- PYTHON BRANCH ---
        {
            id: 'python-basics',
            title: 'Python Basics',
            x: 20, y: 20,
            status: 'unlocked',
            category: 'python',
            icon: Terminal,
            description: 'Syntax, loops, and types.',
            videoId: '_uQrJ0TkZlc', // Mosh
            connections: ['dsa-basics', 'python-advanced']
        },
        {
            id: 'python-advanced',
            title: 'Advanced Python',
            x: 8, y: 42,
            status: 'locked',
            category: 'python',
            icon: Code,
            description: 'Decorators, generators, OOP.',
            videoId: 'jJ44UiErcXk',
            connections: ['data-science']
        },
        {
            id: 'data-science',
            title: 'Data Science',
            x: 5, y: 66,
            status: 'locked',
            category: 'python',
            icon: Database,
            description: 'Pandas, NumPy, Matplotlib.',
            videoId: 'ua-CiDNNj30',
            connections: ['ai-ml']
        },
        {
            id: 'ai-ml',
            title: 'AI & ML',
            x: 5, y: 90,
            status: 'locked',
            category: 'python',
            icon: Zap,
            description: 'Neural networks & models.',
            videoId: '7w8yv5X2O0',
            connections: []
        },

        // --- DSA BRANCH ---
        {
            id: 'dsa-basics',
            title: 'DSA: Arrays & Strings',
            x: 50, y: 50,
            status: 'locked',
            category: 'dsa',
            icon: Layers,
            description: 'Lists, Maps, and basic algos.',
            videoId: '8hly31xKli0',
            connections: ['dsa-trees', 'dsa-graphs']
        },
        {
            id: 'dsa-trees',
            title: 'Trees & Graphs',
            x: 40, y: 74,
            status: 'locked',
            category: 'dsa',
            icon: Layers, // Fallback icon
            description: 'BFS, DFS, Binary Trees.',
            videoId: 't0Cq6tVNRBA',
            connections: ['dsa-dp']
        },
        {
            id: 'dsa-dp',
            title: 'Dynamic Programming',
            x: 50, y: 95,
            status: 'locked',
            category: 'dsa',
            icon: Search,
            description: 'Optimization & complexity.',
            videoId: 'oBt53YbR9Kk',
            connections: []
        },

        // --- WEB DEV BRANCH ---
        {
            id: 'js-basics',
            title: 'JavaScript',
            x: 80, y: 20,
            status: 'unlocked',
            category: 'web',
            icon: Code,
            description: 'The language of the web.',
            videoId: 'PkZNo7MFNFg',
            connections: ['frontend-react', 'backend-node']
        },
        {
            id: 'frontend-react',
            title: 'React & UI',
            x: 65, y: 44,
            status: 'locked',
            category: 'web',
            icon: Globe,
            description: 'Components & Hooks.',
            videoId: 'SqcY0GlETk4',
            connections: ['state-management']
        },
        {
            id: 'backend-node',
            title: 'Node & APIs',
            x: 92, y: 44,
            status: 'locked',
            category: 'web',
            icon: Server,
            description: 'Express, REST, databases.',
            videoId: 'Oe421EPjeBE',
            connections: ['database-design']
        },
        {
            id: 'state-management',
            title: 'State Architecture',
            x: 60, y: 68,
            status: 'locked',
            category: 'web',
            icon: Layers,
            description: 'Redux, Context, Signals.',
            videoId: 'poQXNp9ItL4',
            connections: ['fullstack']
        },
        {
            id: 'database-design',
            title: 'SQL & NoSQL',
            x: 93, y: 68,
            status: 'locked',
            category: 'web',
            icon: Database,
            description: 'Postgres, Mongo, Prisma.',
            videoId: 'P_LeF37k3a4',
            connections: ['fullstack']
        },
        {
            id: 'fullstack',
            title: 'Full Stack Master',
            x: 77, y: 92,
            status: 'locked',
            category: 'web',
            icon: Zap,
            description: 'Deployment & CI/CD.',
            videoId: 'Nu3q5fjdE_0',
            connections: []
        }
    ]
};

const SkillTreePage = () => {
    const navigate = useNavigate();
    const [selectedNode, setSelectedNode] = useState(null);
    const [skillTree, setSkillTree] = useState(defaultSkillTree);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [interests, setInterests] = useState('');
    const [zoom, setZoom] = useState(1);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Fetch history on mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/skill-tree/history');
                if (response.data.success) {
                    setHistory(response.data.history);
                }
            } catch (error) {
                console.error('Failed to fetch history:', error);
            }
        };
        fetchHistory();
    }, []);

    // Generate skill tree based on user input
    const handleGenerateTree = async () => {
        if (!interests.trim()) {
            setError('Please enter your interests');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/skill-tree/personalized', {
                interests: interests.split(',').map(i => i.trim()).filter(Boolean)
            });
            if (response.data.success) {
                setSkillTree(response.data.skillTree);
                // Refresh history
                const historyResponse = await api.get('/skill-tree/history');
                if (historyResponse.data.success) {
                    setHistory(historyResponse.data.history);
                }
            } else {
                setError('Failed to generate tree. Using default.');
                setSkillTree(defaultSkillTree);
            }
        } catch (error) {
            console.error('Failed to fetch skill tree:', error);
            setError('Failed to generate tree. Using default.');
            setSkillTree(defaultSkillTree);
        } finally {
            setLoading(false);
        }
    };

    // SVG Line calculation helper
    const renderConnections = () => {
        if (!skillTree || !skillTree.nodes) return null;
        return skillTree.nodes.flatMap((node) =>
            node.connections.map(targetId => {
                const target = skillTree.nodes.find(n => n.id === targetId);
                if (!target) return null;

                const strokeColor = node.status === 'completed' ? '#8b5cf6' : '#334155';

                return (
                    <motion.line
                        key={`${node.id}-${target.id}`}
                        x1={`${node.x}%`} y1={`${node.y}%`}
                        x2={`${target.x}%`} y2={`${target.y}%`}
                        stroke={strokeColor}
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                );
            })
        );
    };

    const handleNodeClick = (node) => {
        setSelectedNode(node);
    };

    return (
        <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
            <div className="max-w-7xl mx-auto flex flex-col">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-4xl font-bold text-white mb-2">Learning Mind Map</h1>
                    <p className="text-gray-400 mb-4">Generate your personalized skill tree</p>
                    
                    {/* Interest Input */}
                    <div className="max-w-2xl mx-auto">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleGenerateTree()}
                                placeholder="Enter your interests (e.g., Python, React, Machine Learning, DSA)"
                                className="flex-1 px-4 py-3 bg-slate-800/50 border border-indigo-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                                onClick={handleGenerateTree}
                                disabled={loading}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-2"
                            >
                                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Zap size={20} />}
                                {loading ? 'Generating...' : 'Generate Tree'}
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </div>
                </motion.div>

                {/* Zoom Controls and History Button */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
                            title="Zoom In"
                        >
                            <ZoomIn size={20} />
                        </button>
                        <button
                            onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
                            title="Zoom Out"
                        >
                            <ZoomOut size={20} />
                        </button>
                        <button
                            onClick={() => setZoom(1)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
                            title="Reset Zoom"
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-2"
                    >
                        <History size={20} />
                        History ({history.length})
                    </button>
                </div>

                {/* Skill Tree Content */}
                <div className="relative w-full min-h-[600px] h-auto bg-slate-900/40 backdrop-blur-md rounded-3xl border border-indigo-500/20 shadow-2xl overflow-auto">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50">
                            <div className="text-center">
                                <Loader className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-2" />
                                <p className="text-white font-semibold">Creating your learning path...</p>
                            </div>
                        </div>
                    )}

                    {/* Scrollable Inner Container */}
                    <div className="relative w-full min-h-[600px] h-full p-8" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.2s ease' }}>{/* Background Grid */}
                    <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }} />

                        {/* Connection Lines Layer */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {renderConnections()}
                        </svg>

                        {/* Nodes Layer */}
                        <div className="absolute inset-0 w-full h-full">
                            {skillTree && skillTree.nodes && skillTree.nodes.map((node) => {
                                const Icon = typeof node.icon === 'string' ? iconMap[node.icon] : node.icon;
                            return (
                                <motion.div
                                    key={node.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                >
                                    <div className="relative group">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleNodeClick(node)}
                                            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg transition-all z-10 relative ${node.status === 'completed' ? 'bg-indigo-600 border-indigo-400' :
                                                    node.status === 'unlocked' ? 'bg-slate-700 border-white text-white' :
                                                        'bg-slate-800 border-slate-600 text-gray-600'
                                                }`}
                                        >
                                            {node.status === 'locked' ? <Lock size={18} /> : <Icon size={24} />}
                                        </motion.button>

                                        {/* Label */}
                                        <div className={`absolute left-1/2 -translate-x-1/2 mt-2 w-32 text-center text-xs font-bold transition-colors ${node.status !== 'locked' ? 'text-white' : 'text-gray-500'}`}>
                                            {node.title}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    </div>
                </div>

                {/* Selected Node Details Panel */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-lg p-6 bg-slate-800/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl z-40 ml-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedNode.title}</h3>
                                    <span className={`text-xs font-bold uppercase ${selectedNode.category === 'python' ? 'text-blue-400' :
                                            selectedNode.category === 'dsa' ? 'text-orange-400' :
                                                'text-purple-400'
                                        }`}>{selectedNode.category}</span>
                                </div>
                                <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <p className="text-gray-300">{selectedNode.description}</p>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        selectedNode.status === 'completed' ? 'bg-green-600/30 text-green-300' :
                                        selectedNode.status === 'unlocked' ? 'bg-indigo-600/30 text-indigo-300' :
                                        'bg-slate-700 text-gray-400'
                                    }`}>
                                        {selectedNode.status === 'completed' ? '✓ Completed' :
                                         selectedNode.status === 'unlocked' ? 'Ready to Learn' :
                                         '🔒 Locked'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* History Sidebar */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="fixed right-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-l border-indigo-500/30 shadow-2xl z-50 overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Saved Mind Maps</h3>
                                    <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white">
                                        <X size={24} />
                                    </button>
                                </div>

                                {history.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">No saved mind maps yet</p>
                                ) : (
                                    <div className="space-y-4">
                                        {history.map((record) => (
                                            <motion.div
                                                key={record.id}
                                                whileHover={{ scale: 1.02 }}
                                                className="p-4 bg-slate-800/50 rounded-xl border border-indigo-500/20 cursor-pointer hover:border-indigo-500/50 transition-all"
                                                onClick={() => {
                                                    setSkillTree(record.tree);
                                                    setInterests(record.interests.join(', '));
                                                    setShowHistory(false);
                                                }}
                                            >
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {record.interests.map((interest, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-indigo-600/30 text-indigo-300 text-xs rounded-full">
                                                            {interest}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-gray-400 text-xs">
                                                    {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString()}
                                                </p>
                                                <p className="text-white text-sm mt-1">
                                                    {record.tree.nodes?.length || 0} nodes
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SkillTreePage;
