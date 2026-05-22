import type { LeaderboardProps } from '../types/tournament';

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  return (
    <div className="rounded-3xl border-4 border-colmado-wood bg-colmado-cream p-6 shadow-xl">
      <div className="space-y-3 max-w-xl mx-auto">
        {leaderboard.map((player, index) => (
          <div key={player.name} className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow border-2 border-colmado-tan">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-colmado-gold text-xl font-black text-white shadow">
                {index + 1}
              </div>
              <div>
                <div className="text-xl font-bold">{player.name}</div>
                <div className="text-sm text-gray-500">Cumulative Points</div>
              </div>
            </div>
            <div className="text-3xl font-black text-colmado-felt">{player.points}</div>
          </div>
        ))}
      </div>
    </div>
  );
}