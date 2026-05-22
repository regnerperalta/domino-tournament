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

import { 
  DEFAULT_LEADERBOARD, 
  MODAL_TITLES_CONFIG
} from './config/tournamentConfig';
import type { TableSeats, TieBreakerContext } from './types/tournament';

export default function App() {
  const [stage, setStage] = useState<'setup' | 'tournament'>('setup');
  const [players, setPlayers] = useState<string[]>([]);
  
  // Track structural tournament rounds progression boundaries (1 to 3)
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

  // Intercept Queue and State for handling manual admin tie-breakers
  const [tieBreakerQueue, setTieBreakerQueue] = useState<TieBreakerContext[]>([]);
  const [showTieModal, setShowTieModal] = useState(false);
  const [tieSelections, setTieSelections] = useState<Record<string, string>>({}); 

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

  // Create standard Leaderboard rankings array sorted by running totals
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
      updated[currentRound - 1] = {
        ...updated[currentRound - 1],
        ...newMatchScores
      };
      return updated;
    });

    setSubmittedTables(prev => ({ ...prev, [activeTableKey]: true }));
    setShowScores(false);
  };

  // Helper helper to isolate, cross-reference and sort players by local score
  const getSortedTableData = (seats: TableSeats, scoresLedger: Record<string, number>) => {
    const roster = [seats.north, seats.south, seats.east, seats.west];
    return roster.map(p => ({ name: p, score: scoresLedger[p] || 0 }))
                 .sort((a, b) => b.score - a.score);
  };

  // Evaluates table rankings and triggers either the tie-breaker intercept modal or direct progression
  const handleNextRoundProgression = () => {
    if (currentRound >= 3) {
      alert("Moving to Finals logic next! Ready for the parameters.");
      return;
    }

    const scoresLedger = roundHistory[currentRound - 1];
    const newQueue: TieBreakerContext[] = [];

    // --- ANALYZE TABLE A FOR TIES ---
    const sortedA = getSortedTableData(activeTables.tableA, scoresLedger);
    // Case 1: 3-way tie for 1st place
    if (sortedA[0].score === sortedA[1].score && sortedA[1].score === sortedA[2].score) {
      newQueue.push({
        tableKey: 'tableA',
        tableTitle: "Table A (Winner's Pool)",
        type: '1st_place_3way',
        tiedPlayers: [sortedA[0].name, sortedA[1].name, sortedA[2].name]
      });
    }
    // Case 2: Tie for 2nd place
    else if (sortedA[1].score === sortedA[2].score) {
      const tied = [sortedA[1].name, sortedA[2].name];
      if (sortedA[2].score === sortedA[3].score) tied.push(sortedA[3].name);
      newQueue.push({
        tableKey: 'tableA',
        tableTitle: "Table A (Winner's Pool)",
        type: '2nd_place_tie',
        tiedPlayers: tied
      });
    }

    // --- ANALYZE TABLE B FOR TIES ---
    const sortedB = getSortedTableData(activeTables.tableB, scoresLedger);
    // Case 1: 3-way tie for 1st place
    if (sortedB[0].score === sortedB[1].score && sortedB[1].score === sortedB[2].score) {
      newQueue.push({
        tableKey: 'tableB',
        tableTitle: "Table B (Loser's Pool)",
        type: '1st_place_3way',
        tiedPlayers: [sortedB[0].name, sortedB[1].name, sortedB[2].name]
      });
    }
    // Case 2: Tie for 2nd place
    else if (sortedB[1].score === sortedB[2].score) {
      const tied = [sortedB[1].name, sortedB[2].name];
      if (sortedB[2].score === sortedB[3].score) tied.push(sortedB[3].name);
      newQueue.push({
        tableKey: 'tableB',
        tableTitle: "Table B (Loser's Pool)",
        type: '2nd_place_tie',
        tiedPlayers: tied
      });
    }

    // Intercept if choices need to be declared by the administrator
    if (newQueue.length > 0) {
      setTieBreakerQueue(newQueue);
      setTieSelections({}); 
      setShowTieModal(true);
      return;
    }

    // If completely clear, advance automatically using standard points distribution arrays
    executeProgression();
  };

  // Constructs the multi-round combined progression seats grid matrix
  const executeProgression = () => {
    const scoresLedger = roundHistory[currentRound - 1];

    const finalizeRosterOrder = (seats: TableSeats, tableKey: 'tableA' | 'tableB') => {
      const sorted = getSortedTableData(seats, scoresLedger);
      const selectionStr = tieSelections[tableKey];
      
      // If a tie-breaker was processed for this table, reorganize the arrays by utilizing the admin keys
      if (selectionStr) {
        const winners: string[] = JSON.parse(selectionStr);
        const losers = [seats.north, seats.south, seats.east, seats.west].filter(p => !winners.includes(p));
        return [...winners, ...losers];
      }
      
      return sorted.map(p => p.name);
    };

    const orderedA = finalizeRosterOrder(activeTables.tableA, 'tableA');
    const orderedB = finalizeRosterOrder(activeTables.tableB, 'tableB');

    // Combined Progression Mapping: Top 2 from each go to Table A, bottom 2 from each drop to Table B
    const nextTableA: TableSeats = {
      north: orderedA[0], south: orderedA[1],
      east: orderedB[0], west: orderedB[1]
    };

    const nextTableB: TableSeats = {
      north: orderedA[2], south: orderedA[3],
      east: orderedB[2], west: orderedB[3]
    };

    setActiveTables({ tableA: nextTableA, tableB: nextTableB });
    setSubmittedTables({ tableA: false, tableB: false });
    setShowTieModal(false);
    setCurrentRound(prev => prev + 1);
  };

  const handleResolveTieBreakers = () => {
    if (tieBreakerQueue.some(item => !tieSelections[item.tableKey])) {
      alert("Please resolve the tie breaker settings for all highlighted tables.");
      return;
    }
    executeProgression();
  };

  // Enforcement check locking the progression engine down until everything matches validation
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
            // Feeds ONLY current active round scores down to domino table seats
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

        {/* --- ADMIN TIE-BREAKER INTERCEPT OVERLAY --- */}
        <Modal isOpen={showTieModal} onClose={() => setShowTieModal(false)} title="Admin Tie-Breaker Resolution">
          <div className="max-w-md mx-auto space-y-6 p-2">
            <p className="text-sm text-colmado-leather">
              Points are completely deadlocked! Indicate who wins the tie-breaker to establish proper table seed placement.
            </p>

            {tieBreakerQueue.map((tieCtx) => (
              <div key={tieCtx.tableKey} className="rounded-2xl border-2 border-colmado-wood bg-white p-4 space-y-3">
                <h3 className="font-black text-xl text-colmado-dark">{tieCtx.tableTitle}</h3>
                <p className="text-xs font-bold uppercase text-colmado-chili">
                  {tieCtx.type === '1st_place_3way' 
                    ? '3-Way Tie for 1st Place (Select the TWO players who ADVANCE)' 
                    : 'Tie for 2nd Place (Select the SINGLE player who ADVANCES)'}
                </p>
                
                <div className="space-y-2">
                  {tieCtx.type === '1st_place_3way' ? (
                    tieCtx.tiedPlayers.map(p => {
                      const currentSelections: string[] = tieSelections[tieCtx.tableKey] ? JSON.parse(tieSelections[tieCtx.tableKey]) : [];
                      const isChecked = currentSelections.includes(p);
                      return (
                        <label key={p} className="flex items-center gap-3 p-2 rounded-xl border bg-colmado-sand/10 cursor-pointer hover:bg-colmado-sand/30">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!isChecked && currentSelections.length >= 2}
                            onChange={() => {
                              let updated = [...currentSelections];
                              if (isChecked) updated = updated.filter(name => name !== p);
                              else if (updated.length < 2) updated.push(p);
                              setTieSelections(prev => ({ ...prev, [tieCtx.tableKey]: JSON.stringify(updated) }));
                            }}
                            className="h-5 w-5 rounded text-colmado-felt"
                          />
                          <span className="font-bold">{p}</span>
                        </label>
                      );
                    })
                  ) : (
                    tieCtx.tiedPlayers.map(p => {
                      const currentSelections = tieSelections[tieCtx.tableKey] ? JSON.parse(tieSelections[tieCtx.tableKey]) : [];
                      const isSelected = currentSelections.includes(p);
                      return (
                        <label key={p} className="flex items-center gap-3 p-2 rounded-xl border bg-colmado-sand/10 cursor-pointer hover:bg-colmado-sand/30">
                          <input
                            type="radio"
                            name={`tie-${tieCtx.tableKey}`}
                            checked={isSelected}
                            onChange={() => setTieSelections(prev => ({ ...prev, [tieCtx.tableKey]: JSON.stringify([p]) }))}
                            className="h-5 w-5 text-colmado-felt"
                          />
                          <span className="font-bold">{p}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={handleResolveTieBreakers}
              className="w-full rounded-xl bg-colmado-felt py-3 font-black text-white shadow-lg hover:bg-opacity-90 active:scale-95 transition-transform"
            >
              Confirm & Advance Round
            </button>
          </div>
        </Modal>
        
      </div>
    </div>
  );
}