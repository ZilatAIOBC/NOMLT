import React from 'react';
import { useNavigate } from 'react-router-dom';

const cards = [
  { title: 'Text To Video', src: 'https://images.pexels.com/photos/7991375/pexels-photo-7991375.jpeg?auto=compress&cs=tinysrgb&w=1200', href: '/dashboard/text-to-video' },
  { title: 'Image To Video', src: 'https://images.unsplash.com/photo-1516570161787-2fd917215a3d?q=80&w=1600&auto=format&fit=crop', href: '/dashboard/image-to-video' },
  { title: 'Image to Image', src: 'https://images.pexels.com/photos/3812743/pexels-photo-3812743.jpeg?auto=compress&cs=tinysrgb&w=1200', href: '/dashboard/image-to-image' },
  { title: 'Text to Image', src: 'https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg?auto=compress&cs=tinysrgb&w=1200', href: '/dashboard/text-to-image' },
];

const GenerationTools: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-10">
      <h3 className="text-white text-lg font-semibold mb-4">Video generation tools</h3>
      <div className="flex flex-wrap gap-5">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.href)}
            className="w-[260px] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-lg hover:bg-white/10 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <div className="relative aspect-[16/9]">
              <img src={card.src} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute left-3 bottom-2 text-white text-sm font-semibold">{card.title}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenerationTools;


