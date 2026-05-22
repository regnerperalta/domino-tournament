import { useState, useEffect } from 'react';
import type { ScoreEntryProps } from '../types/tournament';
import { SCORE_ENTRY_CONFIG } from '../config/tournamentConfig';

export default function ScoreEntry({ activePlayers, currentScores, onSaveScores }: ScoreEntryProps) {
  const [localScores, setLocalScores] = useState<Record<string, number>>({});

  // Look at currentScores to pull existing values instead of blanking out
  useEffect(() => {
    const initialScores = activePlayers.reduce((acc, player) => {
      // Pull the existing score if it exists, otherwise default to 0
      acc[player] = currentScores[player] ?? 0;
      return acc;
    }, {} as Record<string, number>);
    setLocalScores(initialScores);
  }, [activePlayers, currentScores]); // Added currentScores as a dependency

  const handleInputChange = (player: string, val: string) => {
    setLocalScores((prev) => ({
      ...prev,
      [player]: parseInt(val, 10) || 0,
    }));
  };

  const handleSaveClick = () => {
    onSaveScores(localScores);
  };

  return (
    <section className="rounded-3xl border-4 border-colmado-wood bg-colmado-cream p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black">{SCORE_ENTRY_CONFIG.TITLE}</h2>
          <p className="text-lg text-colmado-leather">{SCORE_ENTRY_CONFIG.SUBTITLE}</p>
        </div>
        <button 
          onClick={handleSaveClick}
          className="rounded-2xl bg-colmado-chili px-6 py-4 text-xl font-black text-white shadow-lg hover:scale-[1.02] transition-transform active:scale-95"
        >
          {SCORE_ENTRY_CONFIG.SAVE_BUTTON_LABEL}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {activePlayers.map((player) => (
          <div key={player} className="rounded-2xl border-2 border-colmado-tan bg-white p-4">
            <div className="mb-3 text-xl font-bold">{player}</div>
            <input
              type="number"
              placeholder={SCORE_ENTRY_CONFIG.INPUT_PLACEHOLDER}
              value={localScores[player] ?? ''}
              onChange={(e) => handleInputChange(player, e.target.value)}
              className="w-full rounded-xl border-2 border-colmado-tan p-3 text-xl font-bold outline-none focus:border-colmado-felt"
            />
          </div>
        ))}
      </div>
    </section>
  );
}