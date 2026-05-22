// src/components/CurrentGames.tsx
import type { CurrentGamesProps } from '../types/tournament';
import { TABLES_CONFIG } from '../config/tournamentConfig';
import DominoTable from './DominoTable';

export default function CurrentGames({ tableA, tableB, scores, onEnterScores }: CurrentGamesProps) {
  // Check if Table B has an active player seated to determine if it's a multi-table round
  const isTableBActive = !!tableB.north;

  return (
    <div className={`grid gap-6 ${isTableBActive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-xl mx-auto'}`}>
      {/* Table A (Always visible) */}
      <DominoTable 
        title={isTableBActive ? TABLES_CONFIG.TABLE_A_TITLE : "Round 3: Last Chance Table"} 
        seats={tableA} 
        scores={scores}
        onEnterScores={() => onEnterScores([tableA.north, tableA.south, tableA.east, tableA.west])}
      />

      {/* Table B (Only rendered if there are active players assigned to it) */}
      {isTableBActive && (
        <DominoTable 
          title={TABLES_CONFIG.TABLE_B_TITLE} 
          seats={tableB} 
          scores={scores}
          onEnterScores={() => onEnterScores([tableB.north, tableB.south, tableB.east, tableB.west])}
        />
      )}
    </div>
  );
}