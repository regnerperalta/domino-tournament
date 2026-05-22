import type { RegisteredPlayersProps } from '../types/tournament';

export default function RegisteredPlayers({ players }: RegisteredPlayersProps) {
  return (
    <section className="w-full rounded-3xl border-4 border-colmado-wood bg-colmado-cream p-5 shadow-xl">
      <h2 className="mb-4 text-3xl font-black">Players</h2>
      <div className="space-y-3">
        {players.map((player, index) => (
          <div key={player} className="flex items-center justify-between rounded-xl border-2 border-colmado-tan bg-white px-4 py-3 shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-colmado-leather text-sm font-bold text-white">
                {index + 1}
              </div>
              <span className="text-lg font-semibold">{player}</span>
            </div>
            <div className="cursor-move rounded-lg bg-colmado-felt px-2 py-1 text-xs font-bold text-white">DRAG</div>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full rounded-2xl bg-colmado-chili py-4 text-xl font-black text-white shadow-lg transition hover:scale-[1.02]">
        RANDOMIZE SEATING
      </button>
    </section>
  );
}