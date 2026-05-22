import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameHeader from './components/GameHeader';
import ControlPanel from './components/ControlPanel';
import CurrentGames from './components/CurrentGames';
import RegisteredPlayers from './components/RegisteredPlayers';
import BracketProgression from './components/BracketProgression';
import Leaderboard from './components/Leaderboard';
import TournamentRules from './components/TournamentRules';
import ScoreEntry from './components/ScoreEntry';
import Modal from './components/Modal';
import type { TableSeats } from './types/tournament';
import { DEFAULT_LEADERBOARD, MODAL_TITLES_CONFIG} from './config/tournamentConfig';

export default function App() {
  const [stage, setStage] = useState<'setup' | 'tournament'>('setup');
  const [players, setPlayers] = useState<string[]>([]);
  
  // Track structural tournament rounds progression boundaries
  const [currentRound, setCurrentRound] = useState<number>(1);
  
  // History ledger array index-matched to rounds (0 = Round 1, 1 = Round 2, etc.)
  const [roundHistory, setRoundHistory] = useState<Record<string, number>[]>([{}, {}, {}]);
  
  // Tracks tables submitted in the current active round
  const [submittedTables, setSubmittedTables] = useState<Record<string, boolean>>({ tableA: false, tableB: false });

  // Dynamic Seating assignments tracking layout state
  const [activeTables, setActiveTables] = useState<{ tableA: TableSeats; tableB: TableSeats }>({
    tableA: { north: '', south: '', east: '', west: '' },
    tableB: { north: '', south: '', east: '', west: '' }
  });

  // Modal Visibility States
  const [showPlayers, setShowPlayers] = useState(false);
  const [showBracket, setShowBracket] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Focus context for targeted table input routing
  const [activeScorePlayers, setActiveScorePlayers] = useState<string[]>([]);
  const [activeTableKey, setActiveTableKey] = useState<string>('');

  // Calculate global running point sums across all historical data logged
  const getCumulativeScores = () => {
    const runningTotals: Record<string, number> = {};
    players.forEach(p => { runningTotals[p] = 0; });
    
    roundHistory.forEach(roundData => {
      Object.entries(roundData).forEach(([player, score]) => {
        if (player in runningTotals) runningTotals[player] += score;
      });
    });
    return runningTotals;
  };

  const currentScores = getCumulativeScores();

  // Create standard Leaderboard rankings array
  const currentLeaderboard = players.length > 0 
    ? players.map((p) => ({ name: p, points: currentScores[p] || 0 })).sort((a, b) => b.points - a.points)
    : DEFAULT_LEADERBOARD;

  const handleStartTournament = (registeredPlayers: string[]) => {
    setPlayers(registeredPlayers);
    
    // Seed initial round 1 seating arrangement based on raw setup order
    setActiveTables({
      tableA: { north: registeredPlayers[0], south: registeredPlayers[1], east: registeredPlayers[2], west: registeredPlayers[3] },
      tableB: { north: registeredPlayers[4], south: registeredPlayers[5], east: registeredPlayers[6], west: registeredPlayers[7] }
    });
    
    setStage('tournament');
  };

  const handleOpenTableScoreEntry = (tableKey: 'tableA' | 'tableB', tableSeats: TableSeats) => {
    setActiveTableKey(tableKey);
    setActiveScorePlayers([tableSeats.north, tableSeats.south, tableSeats.east, tableSeats.west]);
    setShowScores(true);
  };

  const handleSaveScores = (newMatchScores: Record<string, number>) => {
    setRoundHistory((prev) => {
      const updated = [...prev];
      // Target index matches currentRound offset array mapping perfectly
      updated[currentRound - 1] = {
        ...updated[currentRound - 1],
        ...newMatchScores
      };
      return updated;
    });

    // Toggle submission checkpoint confirmation flags
    setSubmittedTables(prev => ({ ...prev, [activeTableKey]: true }));
    setShowScores(false);
  };

  // Advances rounds and computes the Combined Progression seating matrix
  const handleNextRoundProgression = () => {
    if (currentRound >= 3) {
      alert("Moving to Finals logic next! Setup parameters coming up.");
      return;
    }

    const roundIndex = currentRound - 1;
    const scoresLedger = roundHistory[roundIndex];

    // Helper helper to isolate, cross-reference and sort players by local score
    const getSortedTableRoster = (seats: TableSeats) => {
      return [seats.north, seats.south, seats.east, seats.west]
        .sort((a, b) => (scoresLedger[b] || 0) - (scoresLedger[a] || 0));
    };

    const tableAWinnerPool = getSortedTableRoster(activeTables.tableA); // [1st_A, 2nd_A, 3rd_A, 4th_A]
    const tableBWinnerPool = getSortedTableRoster(activeTables.tableB); // [1st_B, 2nd_B, 3rd_B, 4th_B]

    // Construct round 2 or 3 layout mappings using cross-over assignment
    const nextTableA: TableSeats = {
      north: tableAWinnerPool[0], // 1st Place Table A
      south: tableAWinnerPool[1], // 2nd Place Table A
      east: tableBWinnerPool[0],  // 1st Place Table B
      west: tableBWinnerPool[1]   // 2nd Place Table B
    };

    const nextTableB: TableSeats = {
      north: tableAWinnerPool[2], // 3rd Place Table A
      south: tableAWinnerPool[3], // 4th Place Table A
      east: tableBWinnerPool[2],  // 3rd Place Table B
      west: tableBWinnerPool[3]   // 4th Place Table B
    };

    // Update global orchestration parameters
    setActiveTables({ tableA: nextTableA, tableB: nextTableB });
    setSubmittedTables({ tableA: false, tableB: false }); // Reset safety locks
    setCurrentRound(prev => prev + 1);
  };

  // Enforcement check variable configuration
  const areScoresMissing = !submittedTables.tableA || !submittedTables.tableB;

  if (stage === 'setup') {
    return <SetupScreen onStartTournament={handleStartTournament} />;
  }

  return (
    <div className="min-h-screen bg-colmado-sand p-6 text-colmado-dark">
      <div className="mx-auto max-w-7xl space-y-6">
        
        <GameHeader roundNumber={currentRound} />

        <main className="w-full">
          <CurrentGames 
            tableA={activeTables.tableA} 
            tableB={activeTables.tableB} 
            /* CHANGE THIS LINE: */
            scores={roundHistory[currentRound - 1] || {}} 
            onEnterScores={(playersList) => {
              const key = playersList.includes(activeTables.tableA.north) ? 'tableA' : 'tableB';
              handleOpenTableScoreEntry(key, activeTables[key]);
            }} 
          />
        </main>
        
        <ControlPanel 
          onOpenRoster={() => setShowPlayers(true)}
          onOpenBracket={() => setShowBracket(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenRules={() => setShowRules(true)}
          onOpenScoreEntry={() => handleOpenTableScoreEntry('tableA', activeTables.tableA)}
          onNextRound={handleNextRoundProgression}
          isNextRoundDisabled={areScoresMissing}
          currentRound={currentRound}
        />

        {/* --- MODALS OVERLAYS --- */}
        
        <Modal isOpen={showPlayers} onClose={() => setShowPlayers(false)} title={MODAL_TITLES_CONFIG.PLAYERS}>
          <div className="grid grid-cols-1 max-w-md mx-auto">
            <RegisteredPlayers players={players} />
          </div>
        </Modal>

        <Modal isOpen={showBracket} onClose={() => setShowBracket(false)} title={MODAL_TITLES_CONFIG.BRACKET}>
          <BracketProgression roundPlayers={players} winners={[]} losers={[]} />
        </Modal>

        <Modal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} title={MODAL_TITLES_CONFIG.LEADERBOARD}>
          <Leaderboard leaderboard={currentLeaderboard} />
        </Modal>

        <Modal isOpen={showRules} onClose={() => setShowRules(false)} title={MODAL_TITLES_CONFIG.RULES}>
          <div className="grid grid-cols-1 max-w-2xl mx-auto">
            <TournamentRules />
          </div>
        </Modal>

        <Modal isOpen={showScores} onClose={() => setShowScores(false)} title={MODAL_TITLES_CONFIG.SCORES}>
          <ScoreEntry 
            activePlayers={activeScorePlayers} 
            currentScores={roundHistory[currentRound - 1] || {}} 
            onSaveScores={handleSaveScores} 
          />
        </Modal>
        
      </div>
    </div>
  );
}