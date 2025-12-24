import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
  Link, FileText, Youtube, BookOpen, Clock,
  Plus, Mic, Sparkles, X, Globe, AlignLeft
} from 'lucide-react';

const AddContentPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentURL: '',
    sourceType: 'video',
    difficulty: 'beginner',
    estimatedTimeMin: 30,
    tags: [],
    customContent: '' // For text notes
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('link'); // link, text, ai

  // Mouse animation
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const detectContentType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
    if (url.includes('medium.com') || url.includes('dev.to') || url.includes('blog')) return 'article';
    return 'article'; // Default fallback
  };

  const handleURLChange = (url) => {
    setFormData(prev => ({ ...prev, contentURL: url }));
    if (url && activeTab === 'link') {
      const detectedType = detectContentType(url);
      setFormData(prev => ({ ...prev, sourceType: detectedType }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim().toLowerCase()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Please enter a title');

    // Validation
    if (activeTab === 'link' && !formData.contentURL.trim()) return toast.error('Please enter a URL');
    if (activeTab === 'text' && !formData.customContent?.trim()) return toast.error('Please enter some content');

    setIsSubmitting(true);

    try {
      // If "Text/Note" mode, we might need to handle it differently backend-side 
      // or just pack it into description/contentURL as a data blob?
      // For now, let's assume standard flow but maybe prepend [NOTE] to title if backend is strict
      // The current backend likely expects contentURL. 
      // If Text Mode, we can use a "data:" URL or just store it in description if backend allows large text?
      // Or we send it as a special "custom" type lesson.

      const payload = { ...formData };
      if (activeTab === 'text') {
        payload.sourceType = 'article';
        payload.isCustomText = true;
        // Hack: store text in description if backend doesn't support body
        // Or ideally backend supports 'contentBody'
        payload.description = formData.customContent; // Using desc for now as content
        payload.contentURL = 'local://note';
      }

      const response = await api.post('/lessons/custom', payload);

      if (response.data.success) {
        toast.success(activeTab === 'text' ? 'Note added!' : 'Content imported!');
        navigate('/learning-path');
      }
    } catch (error) {
      toast.error('Failed to add content');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen relative overflow-hidden flex items-center justify-center p-6' style={{ background: '#0a0a1e' }}>

      {/* COSMIC BACKGROUND */}
      <div className='fixed inset-0 pointer-events-none' style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.2,
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'moveGrid 20s linear infinite'
        }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div style={{
          position: 'absolute', left: mousePosition.x, top: mousePosition.y,
          width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)',
          transform: 'translate(-50%, -50%)', pointerEvents: 'none'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8'
      >
        {/* LEFT SIDEBAR: TYPE SELECTION */}
        <div className='lg:col-span-1 space-y-4'>
          <div className='bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6'>
            <h1 className='text-3xl font-black text-white mb-2 leading-tight'>Add Content</h1>
            <p className='text-gray-400 mb-6'>Expand your library with custom resources.</p>

            <div className='space-y-2'>
              <button
                onClick={() => setActiveTab('link')}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${activeTab === 'link'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-800/50 border-white/5 text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Link size={20} />
                <div>
                  <div className='font-bold'>Import Link</div>
                  <div className='text-xs opacity-70'>YouTube, Articles, Blogs</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('text')}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${activeTab === 'text'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-800/50 border-white/5 text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <AlignLeft size={20} />
                <div>
                  <div className='font-bold'>Quick Note</div>
                  <div className='text-xs opacity-70'>Paste code snippets or text</div>
                </div>
              </button>

              <div className='relative overflow-hidden p-4 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 group'>
                <div className='absolute -right-4 -top-4 w-20 h-20 bg-purple-500/20 blur-xl rounded-full' />
                <div className='flex items-center gap-3 text-white mb-1'>
                  <Sparkles className='text-purple-400' size={20} />
                  <span className='font-bold'>AI Generator</span>
                </div>
                <p className='text-xs text-purple-200 mb-3'>Let AI build a lesson for you.</p>
                <button onClick={() => navigate('/learning-path')} className='w-full py-2 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-lg transition-colors'>
                  Go to Generator
                </button>
              </div>
            </div>
          </div>

          <div className='bg-green-500/10 border border-green-500/20 rounded-3xl p-6'>
            <div className='flex items-center gap-2 text-green-400 font-bold mb-2'>
              <CheckCircle size={18} /> Pro Tip
            </div>
            <p className='text-xs text-green-200/80 leading-relaxed'>
              Adding your own content counts towards your <strong>Daily Streak</strong> and helps you earn the "Curator" badge!
            </p>
          </div>
        </div>

        {/* MAIN FORM */}
        <div className='lg:col-span-2'>
          <div className='bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl'>
            <form onSubmit={handleSubmit} className='space-y-6'>

              {/* DYNAMIC INPUT AREA */}
              <AnimatePresence mode='wait'>
                {activeTab === 'link' ? (
                  <motion.div
                    key="link"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <label className='text-xs font-bold text-gray-500 uppercase mb-2 block'>Resource URL</label>
                    <div className='relative'>
                      <Globe className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500' size={20} />
                      <input
                        type='url'
                        value={formData.contentURL}
                        onChange={(e) => handleURLChange(e.target.value)}
                        placeholder='https://youtube.com/...'
                        className='w-full pl-12 pr-4 py-4 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-medium'
                        required
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <label className='text-xs font-bold text-gray-500 uppercase mb-2 block'>Your Notes / Snippet</label>
                    <textarea
                      value={formData.customContent}
                      onChange={(e) => setFormData(prev => ({ ...prev, customContent: e.target.value }))}
                      placeholder='# My Study Notes...'
                      className='w-full p-4 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all font-mono text-sm min-h-[150px]'
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='text-xs font-bold text-gray-500 uppercase mb-2 block'>Title</label>
                  <input
                    type='text'
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className='w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all'
                    placeholder='Lesson Title'
                    required
                  />
                </div>
                <div>
                  <label className='text-xs font-bold text-gray-500 uppercase mb-2 block'>Est. Time (min)</label>
                  <div className='relative'>
                    <Clock className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500' size={16} />
                    <input
                      type='number'
                      value={formData.estimatedTimeMin}
                      onChange={(e) => setFormData({ ...formData, estimatedTimeMin: parseInt(e.target.value) })}
                      className='w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-all'
                    />
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <label className='text-xs font-bold text-gray-500 uppercase mb-2 block'>Category</label>
                  <select
                    value={formData.sourceType}
                    onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                    className='w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500'
                  >
                    <option value="video">🎥 Video</option>
                    <option value="article">📄 Article</option>
                    <option value="tutorial">💻 Tutorial</option>
                  </select>
                </div>
                <div>
                  <label className='text-xs font-bold text-gray-500 uppercase mb-2 block'>Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className='w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500'
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* TAGS */}
              <div>
                <label className='text-xs font-bold text-gray-500 uppercase mb-2 block'>Tags</label>
                <div className='flex gap-2 mb-3'>
                  <input
                    type='text'
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder='Add a tag (press Enter)'
                    className='flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500'
                  />
                  <button
                    type='button' onClick={addTag}
                    className='px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors'
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className='flex flex-wrap gap-2 min-h-[30px]'>
                  {formData.tags.map(tag => (
                    <span key={tag} className='px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm flex items-center gap-2 animate-in fade-in zoom-in duration-200'>
                      {tag}
                      <button type='button' onClick={() => removeTag(tag)} className='hover:text-white'><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className='pt-4 flex gap-4 border-t border-white/5'>
                <button
                  type='button' onClick={() => navigate(-1)}
                  className='px-6 py-4 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? (
                    <span className='flex items-center justify-center gap-2'>
                      <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Saving...
                    </span>
                  ) : (
                    'Add to Library'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </motion.div>

      <style>{`
            @keyframes moveGrid {
                0% { transform: translate(0,0); }
                100% { transform: translate(50px, 50px); }
            }
      `}</style>
    </div>
  );
};

// Simple Icon Component needed if Lucide icons aren't importing correctly (handled by imports usually)
const CheckCircle = ({ size, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

export default AddContentPage;
