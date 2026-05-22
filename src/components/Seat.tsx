// src/components/Seat.tsx
import type { SeatProps } from '../types/tournament';

export default function Seat({ position, player, score }: SeatProps) {
  const positionClasses = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2',
    right: 'right-4 top-1/2 -translate-y-1/2',
  };

  return (
    <div className={`absolute ${positionClasses[position]} bg-white/95 px-4 py-2 rounded-xl border-2 border-colmado-tan text-center shadow-md min-w-[100px]`}>
      <div className="text-xs font-black uppercase tracking-widest text-colmado-leather opacity-60">
        {position}
      </div>
      <div className="text-lg font-bold text-colmado-dark leading-tight">{player}</div>
      
      {/* Dynamic Score Display Badge */}
      <div className="mt-1 text-sm font-black text-colmado-felt bg-colmado-sand/40 px-2 py-0.5 rounded-md inline-block">
        {score} pts
      </div>
    </div>
  );
}