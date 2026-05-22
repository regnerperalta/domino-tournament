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

// Configurations and helper extraction imports
import { 
  DEFAULT_LEADERBOARD, 
  deriveTableSeating, 
  deriveProgressionLists,
  MODAL_TITLES_CONFIG 
} from './config/tournamentConfig';

export default function App() {
  const [stage, setStage] = useState<'setup' | 'tournament'>('setup');
  const [players, setPlayers] = useState<string[]>([]);
  
  // NEW: State tracking running points totals for all rostered players
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});

  // Modal Visibility States
  const [showPlayers, setShowPlayers] = useState(false);
  const [showBracket, setShowBracket] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Dynamic state context to track exactly who is being scored right now
  const [activeScorePlayers, setActiveScorePlayers] = useState<string[]>([]);

  // Derive initial config setups
  const { tableA, tableB } = deriveTableSeating(players);
  const { round1Players, winnersList, losersList, activeScorePlayers: defaultScorePlayers } = deriveProgressionLists(players);

  // Map dynamic running scores straight into Leaderboard structures
  const currentLeaderboard = players.length > 0 
    ? players.map((p) => ({ name: p, points: playerScores[p] || 0 })).sort((a, b) => b.points - a.points)
    : DEFAULT_LEADERBOARD;

  const handleStartTournament = (registeredPlayers: string[]) => {
    setPlayers(registeredPlayers);
    
    // Initialize everyone's tournament point balance scorecard cleanly at 0
    const initialScores = registeredPlayers.reduce((acc, player) => {
      acc[player] = 0;
      return acc;
    }, {} as Record<string, number>);
    
    setPlayerScores(initialScores);
    setStage('tournament');
  };

  const handleOpenTableScoreEntry = (tablePlayers: string[]) => {
    setActiveScorePlayers(tablePlayers);
    setShowScores(true);
  };

  const handleOpenMenuScoreEntry = () => {
    setActiveScorePlayers(defaultScorePlayers);
    setShowScores(true);
  };

  // NEW: Merges round entries into global scores state and closes the modal view
  const handleSaveScores = (newMatchScores: Record<string, number>) => {
    setPlayerScores((prevScores) => {
      const updated = { ...prevScores };
      Object.entries(newMatchScores).forEach(([player, score]) => {
        updated[player] = (updated[player] || 0) + score;
      });
      return updated;
    });
    
    setShowScores(false); // Cleanly drop overlay upon successful tracking save
  };

  if (stage === 'setup') {
    return <SetupScreen onStartTournament={handleStartTournament} />;
  }

  return (
    <div className="min-h-screen bg-colmado-sand p-6 text-colmado-dark">
      <div className="mx-auto max-w-7xl space-y-6">
        
        <GameHeader roundNumber={1} />

        <main className="w-full">
          <CurrentGames 
            tableA={tableA} 
            tableB={tableB} 
            scores={playerScores} // Added this state binding
            onEnterScores={handleOpenTableScoreEntry} 
          />
        </main>

        <ControlPanel 
          onOpenRoster={() => setShowPlayers(true)}
          onOpenBracket={() => setShowBracket(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenRules={() => setShowRules(true)}
          onOpenScoreEntry={handleOpenMenuScoreEntry}
        />

        {/* --- MODALS OVERLAYS --- */}
        
        <Modal isOpen={showPlayers} onClose={() => setShowPlayers(false)} title={MODAL_TITLES_CONFIG.PLAYERS}>
          <div className="grid grid-cols-1 max-w-md mx-auto">
            <RegisteredPlayers players={players} />
          </div>
        </Modal>

        <Modal isOpen={showBracket} onClose={() => setShowBracket(false)} title={MODAL_TITLES_CONFIG.BRACKET}>
          <BracketProgression 
            roundPlayers={round1Players} 
            winners={winnersList} 
            losers={losersList} 
          />
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
            currentScores={playerScores} // Pass the global state dictionary here
            onSaveScores={handleSaveScores} 
          />
        </Modal>

      </div>
    </div>
  );
}