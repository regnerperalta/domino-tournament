import type { GameHeaderProps } from '../types/tournament';
import { HEADER_CONFIG } from '../config/tournamentConfig';

export default function GameHeader({ roundNumber = 1 }: GameHeaderProps) {
  return (
    <header className="rounded-3xl border-4 border-colmado-wood bg-colmado-leather p-6 text-white shadow-2xl">
      {/* Changed layout from 'justify-between' to a centered column stack */}
      <div className="flex flex-col items-center text-center gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-wide">
            {HEADER_CONFIG.TITLE}
          </h1>
          <p className="mt-2 text-xl text-yellow-200">
            {HEADER_CONFIG.SUBTITLE}
          </p>
        </div>

        {/* This box now stacks cleanly directly underneath the subtitle */}
        <div className="rounded-2xl bg-colmado-felt px-6 py-3 shadow-inner">
          <div className="text-xs uppercase tracking-widest text-yellow-200">
            {HEADER_CONFIG.ROUND_LABEL}
          </div>
          <div className="text-3xl font-black mt-0.5">
            {HEADER_CONFIG.ROUND_PREFIX}
            {roundNumber}
          </div>
        </div>
      </div>
    </header>
  );
}