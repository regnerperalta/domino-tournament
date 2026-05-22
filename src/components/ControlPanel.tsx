import type { ControlPanelProps } from '../types/tournament';

export default function ControlPanel({
  onOpenRoster,
  onOpenBracket,
  onOpenLeaderboard,
  onOpenRules,
  onOpenScoreEntry,
}: ControlPanelProps) {
  return (
    <nav className="rounded-2xl border-4 border-colmado-wood bg-colmado-cream p-4 shadow-md flex flex-wrap gap-3 items-center justify-between">
      <div className="text-xl font-black text-colmado-leather tracking-wide uppercase">
        🕹️ Tournament Menu:
      </div>
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={onOpenRoster}
          className="rounded-xl bg-colmado-leather hover:bg-colmado-wood px-4 py-2 font-bold text-white shadow transition-transform active:scale-95 text-sm"
        >
          👥 Roster
        </button>
        <button 
          onClick={onOpenBracket}
          className="rounded-xl bg-colmado-leather hover:bg-colmado-wood px-4 py-2 font-bold text-white shadow transition-transform active:scale-95 text-sm"
        >
          📊 Brackets
        </button>
        <button 
          onClick={onOpenLeaderboard}
          className="rounded-xl bg-colmado-gold hover:bg-amber-600 px-4 py-2 font-bold text-white shadow transition-transform active:scale-95 text-sm"
        >
          🏆 Leaderboard
        </button>
        <button 
          onClick={onOpenRules}
          className="rounded-xl bg-colmado-felt hover:bg-opacity-90 px-4 py-2 font-bold text-white shadow transition-transform active:scale-95 text-sm"
        >
          📜 Rules
        </button>
        <button 
          onClick={onOpenScoreEntry}
          className="rounded-xl bg-colmado-chili hover:bg-red-700 px-4 py-2 font-bold text-white shadow transition-transform active:scale-95 text-sm"
        >
          📝 Score Entry
        </button>
      </div>
    </nav>
  );
}