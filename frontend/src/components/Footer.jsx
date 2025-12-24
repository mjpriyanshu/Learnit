import React from 'react';

const Footer = () => {
  return (
    <footer 
      className='border-t mt-auto'
      style={{
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(99, 102, 241, 0.2)'
      }}
    >
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Brand Section */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <div 
                className='w-8 h-8 rounded-lg flex items-center justify-center'
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)'
                }}
              >
                <span className='text-white font-bold text-lg'>L</span>
              </div>
              <span 
                className='text-xl font-bold'
                style={{
                  backgroundImage: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                LearnIT
              </span>
            </div>
            <p className='text-gray-400 text-sm'>
              Personalized learning paths powered by intelligent recommendations.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className='font-semibold text-gray-200 mb-4'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <a href='/dashboard' className='text-gray-400 hover:text-purple-400 transition text-sm'>
                  Dashboard
                </a>
              </li>
              <li>
                <a href='/progress' className='text-gray-400 hover:text-purple-400 transition text-sm'>
                  Progress
                </a>
              </li>
            </ul>
          </div>
          
          {/* Info */}
          <div>
            <h3 className='font-semibold text-gray-200 mb-4'>About</h3>
            <p className='text-gray-400 text-sm'>
              LearnIT helps you master new skills with AI-driven personalized learning recommendations.
            </p>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div 
          className='mt-8 pt-6 text-center'
          style={{ borderTop: '1px solid rgba(99, 102, 241, 0.2)' }}
        >
          <p className='text-gray-400 text-sm'>
            © {new Date().getFullYear()} LearnIT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;




