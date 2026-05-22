import type { ControlPanelProps } from '../types/tournament';

export default function ControlPanel({
  onOpenRoster,
  onOpenBracket,
  onOpenLeaderboard,
  onOpenRules,
  onNextRound,
  isNextRoundDisabled,
  currentRound
}: ControlPanelProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-md">
      <div className="flex flex-wrap gap-2">
        <button onClick={onOpenRoster} className="rounded-xl bg-colmado-tan/30 px-4 py-2 font-bold text-sm hover:bg-colmado-tan/50">
          Roster
        </button>
        <button onClick={onOpenBracket} className="rounded-xl bg-colmado-tan/30 px-4 py-2 font-bold text-sm hover:bg-colmado-tan/50">
          Bracket
        </button>
        <button onClick={onOpenLeaderboard} className="rounded-xl bg-colmado-tan/30 px-4 py-2 font-bold text-sm hover:bg-colmado-tan/50">
          Standings
        </button>
        <button onClick={onOpenRules} className="rounded-xl bg-colmado-tan/30 px-4 py-2 font-bold text-sm hover:bg-colmado-tan/50">
          Rules
        </button>
      </div>

      {/* Advance Round Action Mechanism */}
      <button
        disabled={isNextRoundDisabled}
        onClick={onNextRound}
        className={`rounded-xl px-5 py-2.5 font-black text-white shadow transition-all
          ${isNextRoundDisabled 
            ? 'bg-gray-300 cursor-not-allowed opacity-50' 
            : 'bg-colmado-chili hover:scale-[1.03] active:scale-95'}`}
      >
        Advance to Round {currentRound + 1} →
      </button>
    </div>
  );
}