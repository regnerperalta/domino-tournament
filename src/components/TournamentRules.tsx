import { TOURNAMENT_RULES_LIST } from '../config/tournamentConfig';

export default function TournamentRules() {
  return (
    <div className="rounded-3xl border-4 border-colmado-wood bg-colmado-felt p-6 text-white shadow-xl">
      <ul className="space-y-4 text-xl font-bold">
        {TOURNAMENT_RULES_LIST.map((rule, idx) => (
          <li key={idx}>• {rule}</li>
        ))}
      </ul>
    </div>
  );
}