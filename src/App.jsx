import React, { useState, useEffect } from 'react';

// The main App component
const App = () => {
  const [startDate, setStartDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [moodData, setMoodData] = useState({});
  const [showModal, setShowModal] = useState(false);

  const moods = ['Happy', 'Irritable', 'Energetic', 'Low-Energy', 'Sad', 'Anxious', 'Calm'];
  const symptoms = ['Cramps', 'Headache', 'Bloating', 'Acne', 'Fatigue', 'Cravings', 'Clear Skin'];

  // Function to calculate the menstrual phase for a given day
  const getPhase = (day) => {
    if (day >= 1 && day <= 5) return { name: 'Menstrual', color: '#EF4444' };
    if (day >= 6 && day <= 13) return { name: 'Follicular', color: '#FCD34D' };
    if (day === 14) return { name: 'Ovulatory', color: '#22C55E' };
    if (day >= 15 && day <= 28) return { name: 'Luteal', color: '#3B82F6' };
    return { name: 'Rest', color: '#9CA3AF' };
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInCycle = Array.from({ length: cycleLength }, (_, i) => i + 1);

  const handleDayClick = (day) => {
    const selected = new Date(startDate);
    selected.setDate(selected.getDate() + day - 1);
    setSelectedDate(selected);
    const dateKey = selected.toISOString().split('T')[0];
    const dataForDay = moodData[dateKey] || { mood: '', symptoms: [] };
    setSelectedMood(dataForDay.mood);
    setSelectedSymptoms(dataForDay.symptoms);
    setShowModal(true);
  };

  const handleSaveMood = () => {
    if (!selectedDate) return;
    const dateKey = selectedDate.toISOString().split('T')[0];
    const newMoodData = { ...moodData };
    newMoodData[dateKey] = { mood: selectedMood, symptoms: selectedSymptoms };
    setMoodData(newMoodData);
    setShowModal(false);
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      }
      return [...prev, symptom];
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-10">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-600 tracking-tight">
            Women's Mood Tracker
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Track your mood and symptoms based on your menstrual cycle.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Last Period Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
          <div>
            <label htmlFor="cycle-length" className="block text-sm font-medium text-gray-700">
              Cycle Length (Days)
            </label>
            <input
              type="number"
              id="cycle-length"
              value={cycleLength}
              onChange={(e) => setCycleLength(Math.max(20, Math.min(45, Number(e.target.value))))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
        </div>

        {startDate && (
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4 p-4 rounded-xl shadow-inner bg-gray-50">
            {daysInCycle.map((day) => {
              const currentDate = new Date(startDate);
              currentDate.setDate(currentDate.getDate() + day - 1);
              const isToday = currentDate.toDateString() === today.toDateString();
              const dateKey = currentDate.toISOString().split('T')[0];
              const moodForDay = moodData[dateKey]?.mood;
              const phase = getPhase(day);
              
              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative p-2 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105
                    ${isToday ? 'border-2 border-pink-500 shadow-lg' : 'border border-gray-200'}
                    ${moodForDay ? 'bg-pink-100' : 'bg-white'}
                  `}
                >
                  <span className="block text-xl font-bold text-gray-800">{day}</span>
                  <div className="text-xs text-gray-500">
                    <p className="font-semibold" style={{ color: phase.color }}>
                      {phase.name}
                    </p>
                    <p>{moodForDay}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4 text-pink-600 text-center">
                Log Mood & Symptoms
              </h2>
              <p className="text-center text-gray-500 mb-6">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Mood</h3>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`
                        py-2 px-4 rounded-full border transition-colors
                        ${selectedMood === mood ? 'bg-pink-500 text-white border-pink-500' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-pink-100'}
                      `}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Symptoms</h3>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`
                        py-2 px-4 rounded-full border transition-colors
                        ${selectedSymptoms.includes(symptom) ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'}
                      `}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMood}
                  className="bg-pink-500 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
