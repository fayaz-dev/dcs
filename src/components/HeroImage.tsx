import React from 'react';
import './HeroImage.css';

interface HeroImageProps {
  className?: string;
}

export const HeroImage: React.FC<HeroImageProps> = ({ className = '' }) => {
  return (
    <div className={`hero-image ${className}`}>
      <svg
        width="400"
        height="200"
        viewBox="0 0 400 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hero-svg"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(102, 126, 234, 0.2)" />
            <stop offset="50%" stopColor="rgba(118, 75, 162, 0.2)" />
            <stop offset="100%" stopColor="rgba(240, 147, 251, 0.2)" />
          </linearGradient>
          
          {/* Code editor gradient */}
          <linearGradient id="editorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(102, 126, 234, 0.8)" />
            <stop offset="100%" stopColor="rgba(118, 75, 162, 0.8)" />
          </linearGradient>
          
          {/* Trophy gradient */}
          <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
          
          {/* Rocket gradient */}
          <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(67, 233, 123, 0.8)" />
            <stop offset="100%" stopColor="rgba(56, 249, 215, 0.8)" />
          </linearGradient>
          
          {/* Stars gradient */}
          <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.6)" />
          </radialGradient>
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated background stars */}
        <g className="stars">
          <circle cx="50" cy="30" r="1.5" fill="url(#starGradient)" className="star star-1" />
          <circle cx="350" cy="50" r="1" fill="url(#starGradient)" className="star star-2" />
          <circle cx="80" cy="170" r="1.2" fill="url(#starGradient)" className="star star-3" />
          <circle cx="320" cy="180" r="0.8" fill="url(#starGradient)" className="star star-4" />
          <circle cx="150" cy="40" r="1" fill="url(#starGradient)" className="star star-5" />
          <circle cx="380" cy="120" r="1.3" fill="url(#starGradient)" className="star star-6" />
        </g>
        
        {/* Main code editor window */}
        <g className="code-editor" transform="translate(50, 60)">
          {/* Window frame */}
          <rect
            x="0"
            y="0"
            width="180"
            height="120"
            rx="8"
            fill="url(#editorGradient)"
            className="editor-frame"
            filter="url(#glow)"
          />
          
          {/* Window header */}
          <rect x="8" y="8" width="164" height="20" rx="4" fill="rgba(0, 0, 0, 0.3)" />
          
          {/* Traffic lights */}
          <circle cx="18" cy="18" r="3" fill="#FF5F57" className="traffic-light" />
          <circle cx="30" cy="18" r="3" fill="#FFBD2E" className="traffic-light" />
          <circle cx="42" cy="18" r="3" fill="#28CA42" className="traffic-light" />
          
          {/* Code lines */}
          <g className="code-lines">
            <rect x="12" y="36" width="80" height="3" rx="1.5" fill="rgba(255, 255, 255, 0.7)" className="code-line line-1" />
            <rect x="16" y="44" width="60" height="3" rx="1.5" fill="rgba(102, 126, 234, 0.8)" className="code-line line-2" />
            <rect x="12" y="52" width="90" height="3" rx="1.5" fill="rgba(240, 147, 251, 0.7)" className="code-line line-3" />
            <rect x="20" y="60" width="45" height="3" rx="1.5" fill="rgba(67, 233, 123, 0.7)" className="code-line line-4" />
            <rect x="12" y="68" width="75" height="3" rx="1.5" fill="rgba(255, 255, 255, 0.6)" className="code-line line-5" />
            <rect x="16" y="76" width="55" height="3" rx="1.5" fill="rgba(118, 75, 162, 0.8)" className="code-line line-6" />
          </g>
          
          {/* Cursor */}
          <rect x="68" y="84" width="2" height="12" fill="#FFFFFF" className="cursor" />
        </g>
        
        {/* Trophy */}
        <g className="trophy" transform="translate(280, 70)">
          {/* Trophy base */}
          <ellipse cx="30" cy="85" rx="25" ry="8" fill="url(#trophyGradient)" opacity="0.6" />
          <rect x="20" y="75" width="20" height="10" rx="2" fill="url(#trophyGradient)" />
          
          {/* Trophy cup */}
          <path
            d="M10 30 Q10 20 20 20 L40 20 Q50 20 50 30 L48 60 Q48 70 38 70 L22 70 Q12 70 12 60 Z"
            fill="url(#trophyGradient)"
            filter="url(#glow)"
            className="trophy-cup"
          />
          
          {/* Trophy handles */}
          <path d="M8 35 Q5 35 5 40 Q5 45 8 45" stroke="url(#trophyGradient)" strokeWidth="3" fill="none" />
          <path d="M52 35 Q55 35 55 40 Q55 45 52 45" stroke="url(#trophyGradient)" strokeWidth="3" fill="none" />
          
          {/* Star on trophy */}
          <polygon
            points="30,35 32,41 38,41 33,45 35,51 30,47 25,51 27,45 22,41 28,41"
            fill="#FFFFFF"
            className="trophy-star"
          />
        </g>
        
        {/* Rocket */}
        <g className="rocket" transform="translate(120, 40)">
          {/* Rocket body */}
          <ellipse cx="20" cy="35" rx="8" ry="25" fill="url(#rocketGradient)" className="rocket-body" />
          
          {/* Rocket tip */}
          <path d="M20 10 Q15 15 12 25 Q20 20 28 25 Q25 15 20 10" fill="rgba(255, 255, 255, 0.9)" />
          
          {/* Rocket fins */}
          <path d="M12 50 L8 65 L16 58 Z" fill="rgba(102, 126, 234, 0.8)" />
          <path d="M28 50 L32 65 L24 58 Z" fill="rgba(102, 126, 234, 0.8)" />
          
          {/* Rocket window */}
          <circle cx="20" cy="30" r="4" fill="rgba(255, 255, 255, 0.8)" />
          <circle cx="20" cy="30" r="2" fill="rgba(102, 126, 234, 0.6)" />
          
          {/* Flame */}
          <g className="flame">
            <path d="M16 60 Q20 70 24 60 Q20 75 16 60" fill="#FF6B35" className="flame-outer" />
            <path d="M18 60 Q20 68 22 60 Q20 70 18 60" fill="#FFD700" className="flame-inner" />
          </g>
        </g>
        
        {/* Floating code symbols */}
        <g className="floating-symbols">
          <text x="30" y="100" fontSize="18" fill="rgba(102, 126, 234, 0.6)" className="symbol symbol-1">&lt;/&gt;</text>
          <text x="350" y="140" fontSize="16" fill="rgba(240, 147, 251, 0.6)" className="symbol symbol-2">{}</text>
          <text x="70" y="50" fontSize="14" fill="rgba(67, 233, 123, 0.6)" className="symbol symbol-3">()</text>
          <text x="320" y="40" fontSize="20" fill="rgba(118, 75, 162, 0.6)" className="symbol symbol-4">#</text>
        </g>
        
        {/* Connecting lines/network */}
        <g className="network" opacity="0.3">
          <line x1="100" y1="80" x2="160" y2="120" stroke="url(#editorGradient)" strokeWidth="1" className="network-line line-1" />
          <line x1="250" y1="100" x2="300" y2="140" stroke="url(#rocketGradient)" strokeWidth="1" className="network-line line-2" />
          <line x1="180" y1="90" x2="220" y2="110" stroke="url(#trophyGradient)" strokeWidth="1" className="network-line line-3" />
        </g>
      </svg>
    </div>
  );
};
