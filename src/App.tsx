import { useState, useEffect } from 'react';
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
  
  // Track tournament rounds progression (1 to 3 = Standard Rounds, 4 = Finals Game 1, 5 = Finals Game 2, 6 = Finals Game 3, 7 = Tournament Over)
  const [currentRound, setCurrentRound] = useState<number>(1);
  
  // History ledger array index-matched to rounds (0=R1, 1=R2, 2=R3, 3=FinalsG1, 4=FinalsG2, 5=FinalsG3)
  const [roundHistory, setRoundHistory] = useState<Record<string, number>[]>([{}, {}, {}, {}, {}, {}]);
  
  // Separate ledger for tracking calculated Final Points (5-3-1-0) earned across the 3 final games
  const [finalPointsLedger, setFinalPointsLedger] = useState<Record<string, number>>({});

  // Tracks tables submitted in the current active round
  const [submittedTables, setSubmittedTables] = useState<Record<string, boolean>>({ tableA: false, tableB: false });

  // Seating assignments layout tracking matrix
  const [activeTables, setActiveTables] = useState<{ tableA: TableSeats; tableB: TableSeats }>({
    tableA: { north: '', south: '', east: '', west: '' },
    tableB: { north: '', south: '', east: '', west: '' }
  });

  // Track players who advanced early or survived Round 3 into the Finals
  const [finalsBypassPlayers, setFinalsBypassPlayers] = useState<string[]>([]);
  const [finalists, setFinalists] = useState<string[]>([]);

  // Intercept variables for handling standard round or ultimate championship ties
  const [tieBreakerQueue, setTieBreakerQueue] = useState<TieBreakerContext[]>([]);
  const [showTieModal, setShowTieModal] = useState(false);
  const [tieSelections, setTieSelections] = useState<Record<string, string>>({}); 
  
  const [showFinalSeriesTieModal, setShowFinalSeriesTieModal] = useState(false);
  const [championshipTieWinner, setChampionshipTieWinner] = useState<string>('');

  // Modal Visibility States
  const [showPlayers, setShowPlayers] = useState(false);
  const [showBracket, setShowBracket] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showChampionshipReveal, setShowChampionshipReveal] = useState(false);

  // Animation States for the Grand Reveal Board
  const [animatedStandings, setAnimatedStandings] = useState<{ name: string; score: string; rank: number }[]>([]);
  const [revealIndex, setRevealIndex] = useState<number>(-1);

  // Focus context for targeted table input routing
  const [activeScorePlayers, setActiveScorePlayers] = useState<string[]>([]);
  const [activeTableKey, setActiveTableKey] = useState<string>('');

  // Calculate standard historical running sums (Rounds 1-3)
  const getCumulativeScores = () => {
    const runningTotals: Record<string, number> = {};
    players.forEach(p => { runningTotals[p] = 0; });
    
    // Sum only up to Round 3
    roundHistory.slice(0, 3).forEach(roundData => {
      Object.entries(roundData).forEach(([player, score]) => {
        if (player in runningTotals) runningTotals[player] += score;
      });
    });
    return runningTotals;
  };

  const currentScores = getCumulativeScores();

  // Create base leaderboard for intermediate rounds
  const currentLeaderboard = players.length > 0 
    ? players.map((p) => ({ name: p, points: currentScores[p] || 0 })).sort((a, b) => b.points - a.points)
    : DEFAULT_LEADERBOARD;

  const handleStartTournament = (registeredPlayers: string[]) => {
    setPlayers(registeredPlayers);
    setActiveTables({
      tableA: { north: registeredPlayers[0], south: registeredPlayers[1], east: registeredPlayers[2], west: registeredPlayers[3] },
      tableB: { north: registeredPlayers[4], south: registeredPlayers[5], east: registeredPlayers[6], west: registeredPlayers[7] }
    });
    setStage('tournament');
  };

  const handleOpenTableScoreEntry = (tableKey: 'tableA' | 'tableB', tableSeats: TableSeats) => {
    setActiveTableKey(tableKey);
    setActiveScorePlayers([tableSeats.north, tableSeats.south, tableSeats.east, tableSeats.west].filter(Boolean));
    setShowScores(true);
  };

  // Saves input scores and handles calculation of final points on the fly if inside the Finals
  const handleSaveScores = (newMatchScores: Record<string, number>) => {
    setRoundHistory((prev) => {
      const updated = [...prev];
      updated[currentRound - 1] = { ...updated[currentRound - 1], ...newMatchScores };
      return updated;
    });

    // If we are currently playing in the Finals, compute the 5-3-1-0 championship points immediately
    if (currentRound >= 4 && currentRound <= 6) {
      const sortedGameResults = Object.entries(newMatchScores)
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score);

      const allocation = [5, 3, 1, 0];
      const gamePointsAwarded: Record<string, number> = {};

      sortedGameResults.forEach((playerObj, index) => {
        if (index > 0 && playerObj.score === sortedGameResults[index - 1].score) {
          gamePointsAwarded[playerObj.name] = gamePointsAwarded[sortedGameResults[index - 1].name];
        } else {
          gamePointsAwarded[playerObj.name] = allocation[index] || 0;
        }
      });

      setFinalPointsLedger((prev) => {
        const updatedTotals = { ...prev };
        Object.entries(gamePointsAwarded).forEach(([name, pts]) => {
          updatedTotals[name] = (updatedTotals[name] || 0) + pts;
        });
        return updatedTotals;
      });
    }

    setSubmittedTables(prev => ({ ...prev, [activeTableKey]: true }));
    setShowScores(false);
  };

  const getSortedTableData = (seats: TableSeats, scoresLedger: Record<string, number>) => {
    const roster = [seats.north, seats.south, seats.east, seats.west].filter(Boolean);
    return roster.map(p => ({ name: p, score: scoresLedger[p] || 0 }))
                 .sort((a, b) => b.score - a.score);
  };

  // Evaluates table rankings and handles routing loops
  const handleNextRoundProgression = () => {
    const scoresLedger = roundHistory[currentRound - 1];

    // --- TERMINATION PATHWAY: FINALS COMPLETED ---
    if (currentRound === 6) {
      triggerChampionshipEvaluation();
      return;
    }

    // --- FINALS TRANSITIONAL STEPS (Game 1 -> Game 2 -> Game 3) ---
    if (currentRound >= 4) {
      setSubmittedTables({ tableA: false, tableB: true });
      setCurrentRound(prev => prev + 1);
      return;
    }

    const newQueue: TieBreakerContext[] = [];

    // --- ANALYZE TABLE A FOR TIES ---
    const sortedA = getSortedTableData(activeTables.tableA, scoresLedger);
    if (sortedA.length >= 3 && sortedA[0].score === sortedA[1].score && sortedA[1].score === sortedA[2].score) {
      newQueue.push({
        tableKey: 'tableA',
        tableTitle: currentRound === 1 ? "Table A (Winner's Pool)" : "Table A (Winners Bracket)",
        type: '1st_place_3way',
        tiedPlayers: [sortedA[0].name, sortedA[1].name, sortedA[2].name]
      });
    }
    else if (sortedA.length >= 3 && sortedA[1].score === sortedA[2].score) {
      const tied = [sortedA[1].name, sortedA[2].name];
      if (sortedA[3] && sortedA[2].score === sortedA[3].score) tied.push(sortedA[3].name);
      newQueue.push({
        tableKey: 'tableA',
        tableTitle: currentRound === 1 ? "Table A (Winner's Pool)" : "Table A (Winners Bracket)",
        type: '2nd_place_tie',
        tiedPlayers: tied
      });
    }

    // --- ANALYZE TABLE B FOR TIES (R1 -> R2 ONLY) ---
    if (activeTables.tableB.north !== '') {
      const sortedB = getSortedTableData(activeTables.tableB, scoresLedger);
      if (sortedB.length >= 3 && sortedB[0].score === sortedB[1].score && sortedB[1].score === sortedB[2].score) {
        newQueue.push({
          tableKey: 'tableB',
          tableTitle: currentRound === 1 ? "Table B (Loser's Pool)" : "Table B (Losers Bracket)",
          type: '1st_place_3way',
          tiedPlayers: [sortedB[0].name, sortedB[1].name, sortedB[2].name]
        });
      }
      else if (sortedB.length >= 3 && sortedB[1].score === sortedB[2].score) {
        const tied = [sortedB[1].name, sortedB[2].name];
        if (sortedB[3] && sortedB[2].score === sortedB[3].score) tied.push(sortedB[3].name);
        newQueue.push({
          tableKey: 'tableB',
          tableTitle: currentRound === 1 ? "Table B (Loser's Pool)" : "Table B (Losers Bracket)",
          type: '2nd_place_tie',
          tiedPlayers: tied
        });
      }
    }

    if (newQueue.length > 0) {
      setTieBreakerQueue(newQueue);
      setTieSelections({}); 
      setShowTieModal(true);
      return;
    }

    executeProgression();
  };

  const executeProgression = () => {
    const scoresLedger = roundHistory[currentRound - 1];

    const finalizeRosterOrder = (seats: TableSeats, tableKey: 'tableA' | 'tableB') => {
      const sorted = getSortedTableData(seats, scoresLedger);
      const selectionStr = tieSelections[tableKey];
      
      if (selectionStr) {
        const winners: string[] = JSON.parse(selectionStr);
        const losers = [seats.north, seats.south, seats.east, seats.west].filter(p => p && !winners.includes(p));
        return [...winners, ...losers];
      }
      
      return sorted.map(p => p.name);
    };

    const orderedA = finalizeRosterOrder(activeTables.tableA, 'tableA');
    
    if (currentRound === 1) {
      const orderedB = finalizeRosterOrder(activeTables.tableB, 'tableB');
      setActiveTables({
        tableA: { north: orderedA[0], south: orderedA[1], east: orderedB[0], west: orderedB[1] },
        tableB: { north: orderedA[2], south: orderedA[3], east: orderedB[2], west: orderedB[3] }
      });
      setSubmittedTables({ tableA: false, tableB: false });
    } else if (currentRound === 2) {
      const orderedB = finalizeRosterOrder(activeTables.tableB, 'tableB');
      setFinalsBypassPlayers([orderedA[0], orderedA[1]]);
      
      setActiveTables({
        tableA: { north: orderedA[2], south: orderedA[3], east: orderedB[0], west: orderedB[1] },
        tableB: { north: '', south: '', east: '', west: '' }
      });
      setSubmittedTables({ tableA: false, tableB: true }); 
    } else if (currentRound === 3) {
      // --- TRANSITION INTO THE FINALS (ROUND 4) ---
      // Combine the 2 bypass players with the top 2 from the Round 3 Last Chance table
      const finalFour = [...finalsBypassPlayers, orderedA[0], orderedA[1]];
      setFinalists(finalFour);

      // Initialize the Final Points Ledger tracking records for the final four
      const initialLedger: Record<string, number> = {};
      finalFour.forEach(p => { initialLedger[p] = 0; });
      setFinalPointsLedger(initialLedger);

      // Seed single Finals Table
      setActiveTables({
        tableA: { north: finalFour[0], south: finalFour[1], east: finalFour[2], west: finalFour[3] },
        tableB: { north: '', south: '', east: '', west: '' }
      });
      setSubmittedTables({ tableA: false, tableB: true });
    }

    setShowTieModal(false);
    setCurrentRound(prev => prev + 1);
  };

  // Evaluates the absolute point distribution totals at the end of Finals Game 3
  const triggerChampionshipEvaluation = () => {
    const finalRankings = finalists
      .map(name => ({ name, score: finalPointsLedger[name] || 0 }))
      .sort((a, b) => b.score - a.score);

    // Detect if there is a tied deadlock for 1st place in overall final points
    if (finalRankings[0].score === finalRankings[1].score) {
      setChampionshipTieWinner('');
      setShowFinalSeriesTieModal(true);
      return;
    }

    compileAndLaunchGrandReveal(finalRankings[0].name);
  };

  const compileAndLaunchGrandReveal = (confirmedWinnerName: string) => {
    setShowFinalSeriesTieModal(false);

    // 1. Compile Finalists sorted cleanly, prioritizing the confirmed winner
    const sortedFinalists = finalists
      .map(name => ({ name, score: finalPointsLedger[name] || 0 }))
      .sort((a, b) => {
        if (a.name === confirmedWinnerName) return -1;
        if (b.name === confirmedWinnerName) return 1;
        return b.score - a.score;
      })
      .map((item, idx) => ({ name: item.name, score: `${item.score} Final Pts`, rank: idx + 1 }));

    // 2. Compile Eliminated players based on Round 1-3 scores
    const eliminatedRankings = players
      .filter(p => !finalists.includes(p))
      .map(name => ({ name, score: currentScores[name] || 0 }))
      .sort((a, b) => b.score - a.score)
      .map((item, idx) => ({ name: item.name, score: `${item.score} Cumulative Pts`, rank: idx + 5 }));

    // Combined stack arranged from 8th place down to 1st place
    const fullStackFromBottomToTop = [...eliminatedRankings, ...sortedFinalists].reverse();

    setAnimatedStandings(fullStackFromBottomToTop);
    setRevealIndex(0);
    setShowChampionshipReveal(true);
    setCurrentRound(7); // Flag tournament as complete
  };

  // Automated Sequential Reveal Loop
  useEffect(() => {
    if (showChampionshipReveal && revealIndex >= 0 && revealIndex < animatedStandings.length - 1) {
      const timer = setTimeout(() => {
        setRevealIndex(prev => prev + 1);
      }, 1400); // 1.4-second delay between positions
      return () => clearTimeout(timer);
    }
  }, [showChampionshipReveal, revealIndex, animatedStandings]);

  const handleResolveTieBreakers = () => {
    if (tieBreakerQueue.some(item => !tieSelections[item.tableKey])) {
      alert("Please resolve the tie breaker settings for all highlighted tables.");
      return;
    }
    executeProgression();
  };

  const areScoresMissing = !submittedTables.tableA || !submittedTables.tableB;

  if (stage === 'setup') {
    return <SetupScreen onStartTournament={handleStartTournament} />;
  }

  // Helper template strings mapping headers elegantly
  const getHeaderLabel = () => {
    if (currentRound <= 3) return `Round ${currentRound}`;
    if (currentRound <= 6) return `Finals - Game ${currentRound - 3}`;
    return "Tournament Complete";
  };

  const getButtonLabel = () => {
    if (currentRound === 3) return "Advance to Finals ★";
    if (currentRound >= 4 && currentRound < 6) return `Advance to Game ${currentRound - 2}`;
    if (currentRound === 6) return "Complete Tournament & Reveal Winner!";
    return "Tournament Completed";
  };

  return (
    <div className="min-h-screen bg-colmado-sand p-6 text-colmado-dark">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Dynamic Game Header Custom Configuration Wrapper */}
        <div className="text-center space-y-1">
          <div className="inline-block bg-colmado-chili text-white font-black text-xs uppercase px-3 py-1 rounded-full tracking-widest shadow-sm">
            {currentRound >= 4 ? "Championship Bracket" : "Qualifying Bracket"}
          </div>
          <GameHeader roundNumber={getHeaderLabel() as any} />
        </div>

        <main className="w-full">
          {currentRound >= 3 ? (
            // --- SINGLE TABLE RENDERING (Round 3 & Finals Games 1-3) ---
            <div className="max-w-2xl mx-auto">
              <CurrentGames 
                tableA={activeTables.tableA} 
                tableB={activeTables.tableB} 
                scores={roundHistory[currentRound - 1] || {}} 
                onEnterScores={() => handleOpenTableScoreEntry('tableA', activeTables.tableA)} 
              />
            </div>
          ) : (
            // --- MULTI TABLE RENDERING (Rounds 1 & 2) ---
            <CurrentGames 
              tableA={activeTables.tableA} 
              tableB={activeTables.tableB} 
              scores={roundHistory[currentRound - 1] || {}} 
              onEnterScores={(playersList) => {
                const key = playersList.includes(activeTables.tableA.north) ? 'tableA' : 'tableB';
                handleOpenTableScoreEntry(key, activeTables[key]);
              }} 
            />
          )}
        </main>

        <ControlPanel 
          onOpenRoster={() => setShowPlayers(true)}
          onOpenBracket={() => setShowBracket(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenRules={() => setShowRules(true)}
          onOpenScoreEntry={() => handleOpenTableScoreEntry('tableA', activeTables.tableA)}
          onNextRound={handleNextRoundProgression}
          isNextRoundDisabled={areScoresMissing || currentRound > 6}
          currentRound={(currentRound >= 3 ? getButtonLabel() : currentRound) as any}
        />

        {/* --- CUSTOM ACTION: OPEN FINALS SCORES DASHBOARD POPUP --- */}
        {currentRound >= 4 && (
          <div className="text-center">
            <button 
              onClick={() => setShowLeaderboard(true)} 
              className="bg-colmado-felt text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:bg-opacity-90"
            >
              📊 View Live Championship Standings
            </button>
          </div>
        )}

        {/* --- STANDARD MODAL OVERLAYS --- */}
        
        <Modal isOpen={showPlayers} onClose={() => setShowPlayers(false)} title={MODAL_TITLES_CONFIG.PLAYERS}>
          <div className="grid grid-cols-1 max-w-md mx-auto">
            <RegisteredPlayers players={players} />
          </div>
        </Modal>

        <Modal isOpen={showBracket} onClose={() => setShowBracket(false)} title={MODAL_TITLES_CONFIG.BRACKET}>
          <BracketProgression roundPlayers={players} winners={[]} losers={[]} />
        </Modal>

        <Modal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} title={currentRound >= 4 ? "Live Final Points Dashboard" : MODAL_TITLES_CONFIG.LEADERBOARD}>
          <div className="space-y-4">
            {currentRound >= 4 ? (
              <div className="divide-y rounded-2xl border-2 border-colmado-wood bg-white p-4">
                <h3 className="font-black text-lg pb-2 text-colmado-chili">Championship Final Points (5-3-1-0)</h3>
                {finalists.map(name => ({ name, pts: finalPointsLedger[name] || 0 })).sort((a,b)=>b.pts - a.pts).map((item, idx) => (
                  <div key={item.name} className="flex justify-between py-2.5 font-bold">
                    <span>{idx + 1}. {item.name}</span>
                    <span className="text-colmado-felt">{item.pts} Pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {finalsBypassPlayers.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-sm font-medium text-green-800">
                    🚀 <strong>Bypassed to Finals:</strong> {finalsBypassPlayers.join(' & ')}
                  </div>
                )}
                <Leaderboard leaderboard={currentLeaderboard} />
              </>
            )}
          </div>
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

        {/* --- QUALIFYING BRACKET TIE-BREAKER INTERCEPT MODAL --- */}
        <Modal isOpen={showTieModal} onClose={() => setShowTieModal(false)} title="Admin Tie-Breaker Resolution">
          <div className="max-w-md mx-auto space-y-6 p-2">
            <p className="text-sm text-colmado-leather">
              Points are completely deadlocked! Indicate who wins the tie-breaker to establish proper table seed placement.
            </p>
            {tieBreakerQueue.map((tieCtx) => (
              <div key={tieCtx.tableKey} className="rounded-2xl border-2 border-colmado-wood bg-white p-4 space-y-3">
                <h3 className="font-black text-xl">{tieCtx.tableTitle}</h3>
                <p className="text-xs font-bold uppercase text-colmado-chili">
                  {tieCtx.type === '1st_place_3way' ? 'Select the TWO players who ADVANCE' : 'Select the SINGLE player who ADVANCES'}
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
            <button onClick={handleResolveTieBreakers} className="w-full rounded-xl bg-colmado-felt py-3 font-black text-white shadow-lg">
              Confirm & Advance
            </button>
          </div>
        </Modal>

        {/* --- SERIES FINALS CHAMPIONSHIP OVERALL TIE-BREAKER MODAL --- */}
        <Modal isOpen={showFinalSeriesTieModal} onClose={() => {}} title="🏆 Championship Tie-Breaker Decision">
          <div className="max-w-md mx-auto space-y-4 p-2 text-center">
            <p className="text-sm font-bold text-colmado-leather">
              The 3-game Final Series has concluded with a direct tie for 1st Place! Choose the definitive tournament winner:
            </p>
            <div className="space-y-2 text-left">
              {finalists.map(name => ({ name, score: finalPointsLedger[name] || 0 }))
                .sort((a,b)=>b.score-a.score)
                .filter((item, _, arr) => item.score === arr[0].score)
                .map(item => (
                  <label key={item.name} className="flex items-center gap-3 p-3 rounded-xl border-2 border-colmado-wood bg-white cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="champ-tie" 
                      checked={championshipTieWinner === item.name} 
                      onChange={() => setChampionshipTieWinner(item.name)}
                      className="h-5 w-5 text-colmado-chili"
                    />
                    <span className="font-black text-lg">{item.name} ({item.score} Final Pts)</span>
                  </label>
              ))}
            </div>
            <button 
              disabled={!championshipTieWinner}
              onClick={() => compileAndLaunchGrandReveal(championshipTieWinner)}
              className="w-full mt-4 rounded-xl bg-colmado-chili py-3 font-black text-white shadow-lg disabled:opacity-40"
            >
              Crown Champion & Launch Ceremony!
            </button>
          </div>
        </Modal>

        {/* --- THE GRAND REVEAL BOARD (8th down to 1st) --- */}
        <Modal isOpen={showChampionshipReveal} onClose={() => setShowChampionshipReveal(false)} title="✨ Final Tournament Leaderboard Reveal ✨">
          <div className="max-w-xl mx-auto space-y-4 py-4 min-h-[450px] flex flex-col justify-end">
            {animatedStandings.map((player, idx) => {
              // Only render if the step loop timer has reached this index position
              const isVisible = revealIndex >= idx;
              if (!isVisible) return null;

              const isGrandChampion = player.rank === 1;

              return (
                <div 
                  key={player.name}
                  className={`flex items-center justify-between rounded-xl p-4 transition-all duration-700 transform translate-y-0 opacity-100 border-2
                    ${isGrandChampion 
                      ? 'bg-yellow-100 border-yellow-500 scale-105 shadow-xl animate-bounce text-yellow-950 font-black' 
                      : player.rank <= 4 
                        ? 'bg-white border-colmado-felt font-bold text-colmado-dark'
                        : 'bg-gray-50 border-gray-200 text-gray-500 text-sm'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs uppercase px-2 py-0.5 rounded font-black ${isGrandChampion ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-700'}`}>
                      {isGrandChampion ? "🏆 CAMPEÓN" : `${player.rank}° Place`}
                    </span>
                    <span className={isGrandChampion ? 'text-2xl' : 'text-base'}>{player.name}</span>
                  </div>
                  <span className={isGrandChampion ? 'text-xl text-yellow-700' : 'text-sm font-mono'}>
                    {player.score}
                  </span>
                </div>
              );
            })}
          </div>
        </Modal>
        
      </div>
    </div>
  );
}