import React, { useState, useRef, useEffect } from 'react';
import CyberpunkPanel from './ui/cyberpunk-panel';

interface Podcast {
  id: string;
  title: string;
  file: string;
  duration: string;
  category: string;
  description: string;
}

export default function PodcastPlayer() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    // Load podcast metadata
    fetch('/podcasts.json')
      .then(res => res.json())
      .then(data => setPodcasts(data.podcasts))
      .catch(err => console.error('Failed to load podcasts:', err));
  }, []);
  
  const playPodcast = (podcast: Podcast) => {
    if (currentPodcast?.id === podcast.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentPodcast(podcast);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = `/${podcast.file}`;
        audioRef.current.play();
      }
    }
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentPodcast]);
  
  return (
    <CyberpunkPanel 
      title="STORMVERSE PODCASTS" 
      position="bottom-right"
      className="podcast-player w-[500px]"
    >
      <div className="podcast-content">
        {/* Audio Element */}
        <audio ref={audioRef} />
        
        {/* Current Playing */}
        {currentPodcast && (
          <div className="now-playing mb-4 p-3 bg-purple-900/30 border border-purple-700 rounded">
            <h3 className="text-sm font-bold text-purple-400 mb-2">NOW PLAYING</h3>
            <p className="text-xs text-white mb-2">{currentPodcast.title}</p>
            <div className="progress-bar bg-gray-800 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="progress bg-purple-500 h-full transition-all"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
        
        {/* Podcast List */}
        <div className="podcast-list space-y-2 max-h-[400px] overflow-y-auto">
          {podcasts.map(podcast => (
            <div 
              key={podcast.id}
              className={`podcast-item p-3 bg-black/50 border rounded cursor-pointer transition-all ${
                currentPodcast?.id === podcast.id 
                  ? 'border-purple-500 bg-purple-900/20' 
                  : 'border-gray-700 hover:border-purple-700'
              }`}
              onClick={() => playPodcast(podcast)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-1">
                    {podcast.title}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">
                    {podcast.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-purple-400">{podcast.category}</span>
                    <span className="text-gray-500">{podcast.duration}</span>
                  </div>
                </div>
                <button 
                  className={`play-button ml-3 p-2 rounded-full transition-colors ${
                    currentPodcast?.id === podcast.id && isPlaying
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-purple-700 hover:text-white'
                  }`}
                >
                  {currentPodcast?.id === podcast.id && isPlaying ? '⏸' : '▶'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="podcast-footer mt-4 pt-3 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            StormVerse Podcast Collection
          </p>
          <p className="text-xs text-gray-600 mt-1">
            © 2025 Daniel Guzman - All Rights Reserved
          </p>
        </div>
      </div>
    </CyberpunkPanel>
  );
}