import BracketColumn from './BracketColumn';
import type { BracketProgressionProps } from '../types/tournament';
import { BRACKET_COLUMNS_CONFIG } from '../config/tournamentConfig';

export default function BracketProgression(props: BracketProgressionProps) {
  return (
    <div className="rounded-3xl border-4 border-colmado-wood bg-colmado-cream p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Bracket Progression</h2>
          <p className="mt-1 text-lg text-colmado-leather">
            Winners advance automatically after score entry.
          </p>
        </div>
        <button className="rounded-2xl bg-colmado-felt px-6 py-3 text-lg font-black text-white shadow-lg hover:scale-[1.02]">
          PRINT BRACKET
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {BRACKET_COLUMNS_CONFIG.map((col) => (
          <BracketColumn
            key={col.title}
            title={col.title}
            players={props[col.dataKey]}
            highlight={col.highlight}
            danger={col.danger}
          />
        ))}
      </div>
    </div>
  );
}