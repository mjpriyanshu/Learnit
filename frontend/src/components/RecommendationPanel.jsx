import React from 'react';
import { motion } from 'framer-motion';

const RecommendationPanel = ({ recommendations, onMarkComplete, onOpenLesson }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }
  
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {recommendations.map((item, index) => (
        <motion.div
          key={item._id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className='rounded-xl overflow-hidden relative group'
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(99, 102, 241, 0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.25)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
            e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(99, 102, 241, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Spotlight effect */}
          <div 
            className='absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300'
            style={{
              background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
          
          {/* Card Header */}
          <div 
            className='p-4 relative z-10'
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))'
            }}
          >
            <h3 className='text-white font-semibold text-lg line-clamp-2'>
              {item.title}
            </h3>
            {item.score && (
              <div className='mt-2 flex items-center gap-2'>
                <span className='text-purple-200 text-sm'>Match Score:</span>
                <span className='font-bold' style={{ color: '#6366f1' }}>{Math.round(item.score * 100)}%</span>
              </div>
            )}
          </div>
          
          {/* Card Body */}
          <div className='p-4 relative z-10'>
            {/* Description */}
            {item.description && (
              <p className='text-gray-300 text-sm mb-4 line-clamp-3'>
                {item.description}
              </p>
            )}
            
            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-4'>
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className='px-2 py-1 rounded-full text-xs font-medium'
                    style={{
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: '#a855f7',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span 
                    className='px-2 py-1 rounded-full text-xs font-medium'
                    style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#6366f1',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {/* Reason Badge */}
            {item.reason && (
              <div 
                className='mb-4 p-3 rounded-lg'
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}
              >
                <p className='text-sm text-purple-300'>
                  <span className='font-semibold text-purple-200'>Why this lesson: </span>
                  {item.reason}
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className='flex gap-2'>
              <button
                onClick={() => onOpenLesson(item)}
                className='flex-1 py-2 px-4 rounded-lg font-semibold text-white transition'
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Open
              </button>
              <button
                onClick={() => onMarkComplete(item._id)}
                className='flex-1 py-2 px-4 rounded-lg font-semibold transition hover:bg-opacity-80 hover:border-purple-400 text-gray-300'
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}
              >
                ✓ Complete
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecommendationPanel;




