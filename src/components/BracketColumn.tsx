import type { BracketColumnProps } from '../types/tournament';

export default function BracketColumn({ title, players, highlight, danger }: BracketColumnProps) {
  return (
    <div className={`rounded-2xl border-4 p-4 shadow-lg ${
      highlight ? "border-colmado-felt bg-green-50" : 
      danger ? "border-colmado-chili bg-red-50" : 
      "border-colmado-tan bg-white"
    }`}>
      <div className="mb-4 text-2xl font-black">{title}</div>
      <div className="space-y-3">
        {players.map((player) => (
          <div key={player} className="rounded-xl border-2 border-colmado-straw bg-colmado-accent px-4 py-3 text-lg font-bold shadow">
            {player}
          </div>
        ))}
      </div>
    </div>
  );
}