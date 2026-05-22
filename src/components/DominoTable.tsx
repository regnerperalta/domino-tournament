// src/components/DominoTable.tsx
import type { DominoTableProps } from '../types/tournament';
import { TABLE_ACTIONS_CONFIG } from '../config/tournamentConfig';
import Seat from './Seat';

export default function DominoTable({ title, seats, scores, onEnterScores }: DominoTableProps) {
  return (
    <div className="rounded-3xl border-4 border-colmado-wood bg-colmado-cream p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-black">{title}</h2>
        <button 
          onClick={onEnterScores}
          className="rounded-xl bg-colmado-felt px-4 py-2 font-bold text-white text-sm hover:bg-colmado-felt-dark transition-transform active:scale-95"
        >
          {TABLE_ACTIONS_CONFIG.ENTER_SCORES_LABEL}
        </button>
      </div>

      {/* Kept your exact table dimensions while linking up the dynamic score mapping */}
      <div className="relative mx-auto h-[420px] w-[420px] rounded-[48px] border-[12px] border-colmado-leather bg-colmado-felt shadow-inner">
        <Seat position="top" player={seats.north} score={scores[seats.north] || 0} />
        <Seat position="bottom" player={seats.south} score={scores[seats.south] || 0} />
        <Seat position="left" player={seats.west} score={scores[seats.west] || 0} />
        <Seat position="right" player={seats.east} score={scores[seats.east] || 0} />

        <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-4 border-colmado-die-border bg-colmado-die-bg text-5xl shadow-lg select-none">
          🁣
        </div>
      </div>
    </div>
  );
}