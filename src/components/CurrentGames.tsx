// src/components/CurrentGames.tsx
import type { CurrentGamesProps } from '../types/tournament';
import { TABLES_CONFIG } from '../config/tournamentConfig';
import DominoTable from './DominoTable';

export default function CurrentGames({ tableA, tableB, scores, onEnterScores }: CurrentGamesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DominoTable 
        title={TABLES_CONFIG.TABLE_A_TITLE} 
        seats={tableA} 
        scores={scores}
        onEnterScores={() => onEnterScores([tableA.north, tableA.south, tableA.east, tableA.west])}
      />
      <DominoTable 
        title={TABLES_CONFIG.TABLE_B_TITLE} 
        seats={tableB} 
        scores={scores}
        onEnterScores={() => onEnterScores([tableB.north, tableB.south, tableB.east, tableB.west])}
      />
    </div>
  );
}