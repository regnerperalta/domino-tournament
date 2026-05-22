import React, { useState } from 'react';
import type { SetupScreenProps } from '../types/tournament';

export default function SetupScreen({ onStartTournament }: SetupScreenProps) {
  const [inputs, setInputs] = useState<string[]>([
    "Manolo", "Chino", "Mama", "Norma", "Elizabeth", "Marcos", "Frank", "Regner"
  ]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.some(name => !name.trim())) {
      alert("Please fill out all 8 player names to start the tournament!");
      return;
    }
    onStartTournament(inputs.map(name => name.trim()));
  };

  return (
    <div className="min-h-screen bg-colmado-sand p-6 text-colmado-dark flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border-4 border-colmado-wood bg-colmado-cream p-8 shadow-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-wide text-colmado-leather">
            DOMINOES TOURNAMENT SETUP
          </h1>
          <p className="mt-2 text-lg text-colmado-wood">Register the 8 players competing today</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputs.map((name, index) => (
              <div key={index} className="flex flex-col gap-1">
                <label className="text-sm font-black uppercase text-colmado-leather">
                  Player {index + 1}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder="Enter name"
                  className="rounded-xl border-2 border-colmado-tan bg-white p-3 text-lg font-bold outline-none focus:border-colmado-felt"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full mt-4 rounded-2xl bg-colmado-felt py-4 text-2xl font-black text-white shadow-lg transition hover:scale-[1.01] hover:bg-colmado-felt-dark"
          >
            START ROUND 1
          </button>
        </form>
      </div>
    </div>
  );
}