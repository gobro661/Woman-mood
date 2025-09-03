import React, { useState } from 'react';

// Main App component
const App = () => {
  const [inputDate, setInputDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28); // New state for custom cycle length
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [activeTab, setActiveTab] = useState('All Scenarios');
  const [isLoading, setIsLoading] = useState(false);

  const minMood = 40.0;
  const maxMood = 85.0;

  const getMoodAndCategory = (day, currentCycleLength) => {
    const halfCycle = currentCycleLength / 2;
    const stepValue = (maxMood - minMood) / (halfCycle - 1);

    let mood;
    if (day >= 1 && day <= halfCycle) {
      mood = minMood + (day - 1) * stepValue;
    } else { // Days halfCycle+1 to currentCycleLength
      mood = maxMood - (day - halfCycle) * stepValue;
    }

    let category = '';
    let categoryDetails = '';

    // Adjusting phases based on dynamic cycle length
    if (day >= 1 && day <= 5) {
      category = 'Menstrual';
      categoryDetails = 'Cramps, Low Energy, Emotional';
    } else if (day > 5 && day < (halfCycle - 2)) {
      category = 'Post-Menstrual';
      categoryDetails = 'Recovery, Gradual Uplift';
    } else if (day >= (halfCycle - 2) && day <= (halfCycle + 2)) {
      category = 'Ovulation Peak';
      categoryDetails = 'Happy, Energetic, Lusty';
    } else if (day > (halfCycle + 2) && day < (currentCycleLength - 3)) {
      category = 'Luteal Phase';
      categoryDetails = 'Stable, Content';
    } else if (day >= (currentCycleLength - 3) && day <= currentCycleLength) {
      category = 'Pre-Menstrual';
      categoryDetails = 'Irritable, Sad, Pre-Period Mood';
    }

    return { mood: mood.toFixed(2), category, categoryDetails };
  };

  const getFullCycle = (startDay, knownDate, currentCycleLength) => {
    const knownDateObj = new Date(knownDate);
    const cycle = [];

    for (let i = 1; i <= currentCycleLength; i++) {
      const day = ((startDay + i - 2) % currentCycleLength) + 1;
      const date = new Date(knownDateObj);
      date.setDate(date.getDate() + (i - 1));

      const { mood, category, categoryDetails } = getMoodAndCategory(day, currentCycleLength);
      
      cycle.push({
        day,
        date,
        mood,
        category,
        categoryDetails,
      });
    }

    return cycle;
  };

  const handleCalculate = () => {
    if (!inputDate || !cycleLength) return;

    setIsLoading(true);
    setTimeout(() => {
      const newScenarios = [];
      for (let i = 1; i <= cycleLength; i++) {
        const scenario = getFullCycle(i, inputDate, cycleLength);
        newScenarios.push({
          scenarioNumber: i,
          cycle: scenario
        });
      }
      setScenarios(newScenarios);
      setActiveScenario(null); // Reset active scenario
      setIsLoading(false);
    }, 500);
  };
  
  const getPhaseColor = (day, currentCycleLength) => {
    if (day >= 1 && day <= 5) return '#EF4444'; // Red (Menstrual)
    if (day >= (currentCycleLength / 2 - 2) && day <= (currentCycleLength / 2 + 2)) return '#22C55E'; // Green (Ovulation)
    if (day >= (currentCycleLength - 3) && day <= currentCycleLength) return '#FCD34D'; // Yellow (PMS)
    return '#3B82F6'; // Blue (Normal/Other)
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getAnalysis = () => {
    const analysis = {
      ovulationDates: {},
      menstrualDates: {},
      pmsDates: {},
      bestMoodDates: {},
    };

    scenarios.forEach(scenario => {
      scenario.cycle.forEach(day => {
        const dateKey = day.date.toISOString().split('T')[0];
        
        if (day.category === 'Ovulation Peak' || (day.day >= (cycleLength / 2 - 2) && day.day <= (cycleLength / 2 + 2) && parseFloat(day.mood) >= 75)) {
          analysis.ovulationDates[dateKey] = (analysis.ovulationDates[dateKey] || 0) + 1;
        }
        if (day.category === 'Menstrual' || (day.day >= 1 && day.day <= 5 && parseFloat(day.mood) <= 50)) {
          analysis.menstrualDates[dateKey] = (analysis.menstrualDates[dateKey] || 0) + 1;
        }
        if (day.category === 'Pre-Menstrual' || (day.day >= (cycleLength - 3) && day.day <= cycleLength && parseFloat(day.mood) <= 55)) {
          analysis.pmsDates[dateKey] = (analysis.pmsDates[dateKey] || 0) + 1;
        }
        if (parseFloat(day.mood) >= 80) {
          analysis.bestMoodDates[dateKey] = (analysis.bestMoodDates[dateKey] || 0) + 1;
        }
      });
    });

    const totalScenarios = scenarios.length;
    const formatResults = (data) => Object.keys(data).sort().map(date => ({
      date: new Date(date),
      count: data[date],
      percentage: ((data[date] / totalScenarios) * 100).toFixed(0)
    }));
    
    return {
      ovulation: formatResults(analysis.ovulationDates),
      menstrual: formatResults(analysis.menstrualDates),
      pms: formatResults(analysis.pmsDates),
      bestMood: formatResults(analysis.bestMoodDates),
    };
  };

  const getCalendarData = () => {
    const calendarData = {};
    scenarios.forEach(scenario => {
      scenario.cycle.forEach(day => {
        const dateKey = day.date.toISOString().split('T')[0];
        if (!calendarData[dateKey]) {
          calendarData[dateKey] = {
            moods: [],
            days: []
          };
        }
        calendarData[dateKey].moods.push(parseFloat(day.mood));
        calendarData[dateKey].days.push(day.day);
      });
    });
    return calendarData;
  };

  const getAverageMoodAndColor = (moods) => {
    if (moods.length === 0) return 'bg-gray-700';
    const sum = moods.reduce((a, b) => a + b, 0);
    const averageMood = sum / moods.length;

    if (averageMood > 75) return 'bg-green-600';
    if (averageMood > 55) return 'bg-blue-600';
    return 'bg-red-600';
  };

  const renderCurrentMonthCalendar = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const calendarDays = [];

    // Fill with previous month's days
    const startDayOfWeek = startOfMonth.getDay();
    const prevMonthEnd = new Date(startOfMonth);
    prevMonthEnd.setDate(startOfMonth.getDate() - 1);
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(prevMonthEnd);
      prevDay.setDate(prevMonthEnd.getDate() - i);
      calendarDays.push({ date: prevDay, currentMonth: false });
    }

    // Fill with current month's days
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      calendarDays.push({ date: new Date(date.getFullYear(), date.getMonth(), i), currentMonth: true });
    }
    
    // Fill with next month's days
    const totalDays = 42; // Ensure a full grid
    const remainingDays = totalDays - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({ date: new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate() + i), currentMonth: false });
    }
    
    const calendarData = getCalendarData();

    return (
      <div className="grid grid-cols-7 gap-2 text-center text-gray-400 font-bold mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
        {calendarDays.map((day, index) => {
          const dateKey = day.date.toISOString().split('T')[0];
          const dataForDay = calendarData[dateKey] || { moods: [], days: [] };
          const moodColor = getAverageMoodAndColor(dataForDay.moods);
          const isInputDate = inputDate && dateKey === new Date(inputDate).toISOString().split('T')[0];
          const isToday = day.date.toDateString() === today.toDateString();

          return (
            <div 
              key={index} 
              className={`relative p-2 rounded-lg transition-transform hover:scale-105 cursor-pointer 
                ${day.currentMonth ? 'bg-white bg-opacity-5' : 'bg-white bg-opacity-2'} 
                ${isInputDate ? 'border-2 border-purple-500 ring-2 ring-purple-500' : ''}
              `}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-semibold ${day.currentMonth ? 'text-gray-200' : 'text-gray-400'}`}>
                  {day.date.getDate()}
                </span>
                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                )}
              </div>
              {dataForDay.moods.length > 0 && (
                <div className={`w-full h-2 rounded-full mt-2 ${moodColor}`}></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderScenarioDetails = () => {
    if (!activeScenario) return null;
    const scenario = scenarios[activeScenario - 1];

    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-purple-400">Scenario {activeScenario}: {new Date(inputDate).toDateString()} is Day {activeScenario}</h3>
        <p className="text-gray-400 text-sm mb-4 italic">(Created by Lakshya Sharma)</p>
        <div className="bg-gray-800 p-6 rounded-xl backdrop-blur-sm bg-opacity-40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenario.cycle.map((day) => (
              <div 
                key={day.day}
                className="bg-gray-900 p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-200">Day {day.day}</span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ backgroundColor: getPhaseColor(day.day, cycleLength), color: '#fff' }}
                  >
                    {day.category}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{day.date.toDateString()}</p>
                <p className="text-gray-300 font-semibold mt-2">Mood: {day.mood}</p>
                <p className="text-gray-500 text-xs italic mt-1">{day.categoryDetails}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const analysisResults = getAnalysis();
  const calendarData = getCalendarData();

  const renderSmartAnalysis = () => (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-purple-400">Smart Analysis - Highest Percentage Scenarios</h3>
      <p className="text-gray-400 text-sm mb-4 italic">(Created by Lakshya Sharma)</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalysisCard
          title="Ovulation Peak"
          description="Happy, Energetic, Lusty"
          color="bg-green-500"
          dates={analysisResults.ovulation}
        />
        <AnalysisCard
          title="Menstrual/Cramps"
          description="Cramps, Low Energy, Emotional"
          color="bg-red-500"
          dates={analysisResults.menstrual}
        />
        <AnalysisCard
          title="PMS Period"
          description="Irritable, Sad, Pre-Period Mood"
          color="bg-yellow-500"
          dates={analysisResults.pms}
        />
        <AnalysisCard
          title="Best Mood Days"
          description="Peak Performance"
          color="bg-blue-500"
          dates={analysisResults.bestMood}
        />
      </div>
    </div>
  );

  const renderCalendarView = () => (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-purple-400">Calendar View</h3>
      <p className="text-gray-400 text-sm mb-4 italic">(Created by Lakshya Sharma)</p>
      
      <div className="flex justify-between items-center mb-4 text-gray-200">
        <button 
          className="text-2xl font-bold transition-transform hover:scale-110"
          onClick={() => setInputDate(prev => new Date(new Date(prev).setMonth(new Date(prev).getMonth() - 1)).toISOString().split('T')[0])}
        >
          &lt;
        </button>
        <span className="text-lg font-semibold">{new Date(inputDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button 
          className="text-2xl font-bold transition-transform hover:scale-110"
          onClick={() => setInputDate(prev => new Date(new Date(prev).setMonth(new Date(prev).getMonth() + 1)).toISOString().split('T')[0])}
        >
          &gt;
        </button>
      </div>

      {inputDate && renderCurrentMonthCalendar(new Date(inputDate))}

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <LegendItem color="bg-red-600" label="Low Mood" />
        <LegendItem color="bg-blue-600" label="Moderate Mood" />
        <LegendItem color="bg-green-600" label="High Mood" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-8 text-gray-200"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f172a)'
      }}
    >
      <div className="max-w-6xl mx-auto rounded-3xl shadow-2xl p-6 sm:p-10 backdrop-blur-sm bg-gray-900 bg-opacity-70">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-400 tracking-tight flex items-center justify-center gap-2">
            Women Mood Calculator
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart text-red-400"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            28-Day Arithmetic Progression Model - All Possible Cycle Scenarios
          </p>
          <p className="mt-1 text-sm text-gray-500 italic">Created by Lakshya Sharma</p>
        </header>

        <div className="flex flex-col items-center mb-8">
          <label htmlFor="input-date" className="text-sm font-medium text-gray-400 mb-2">
            Known Date (We'll calculate all possible cycle scenarios)
          </label>
          <input
            type="date"
            id="input-date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            className="w-full max-w-sm px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <div className="mt-4 w-full max-w-sm">
            <label htmlFor="cycle-length" className="text-sm font-medium text-gray-400 mb-2">
              Custom Cycle Length (Days)
            </label>
            <input
              type="number"
              id="cycle-length"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value ? Math.max(20, Math.min(45, Number(e.target.value))) : 28)}
              min="20"
              max="45"
              placeholder="Default: 28"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          <button
            onClick={handleCalculate}
            disabled={isLoading || !inputDate}
            className={`mt-4 w-full max-w-sm py-3 px-6 rounded-lg font-bold text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg
              ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`}
          >
            {isLoading ? 'Calculating...' : 'Calculate All Scenarios'}
          </button>
        </div>
        
        {scenarios.length > 0 && (
          <div className="mb-8">
            <div className="flex space-x-2 border-b-2 border-gray-700">
              <TabButton
                label="All Scenarios"
                isActive={activeTab === 'All Scenarios'}
                onClick={() => setActiveTab('All Scenarios')}
              />
              <TabButton
                label="Smart Analysis"
                isActive={activeTab === 'Smart Analysis'}
                onClick={() => setActiveTab('Smart Analysis')}
              />
              <TabButton
                label="Calendar View"
                isActive={activeTab === 'Calendar View'}
                onClick={() => setActiveTab('Calendar View')}
              />
            </div>
            
            {activeTab === 'All Scenarios' && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-purple-400">All {cycleLength} Scenarios</h3>
                <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-14 gap-2 mb-6">
                  {scenarios.map(scenario => (
                    <button
                      key={scenario.scenarioNumber}
                      onClick={() => setActiveScenario(scenario.scenarioNumber)}
                      className={`py-2 px-4 rounded-full font-semibold transition-all duration-200
                        ${activeScenario === scenario.scenarioNumber 
                          ? 'bg-purple-500 text-white shadow-lg transform scale-105' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                    >
                      Day {scenario.scenarioNumber}
                    </button>
                  ))}
                </div>
                {renderScenarioDetails()}
              </div>
            )}
            
            {activeTab === 'Smart Analysis' && renderSmartAnalysis()}
            
            {activeTab === 'Calendar View' && renderCalendarView()}

            <p className="mt-12 text-center text-gray-500 text-sm italic">
              Disclaimer: This tool is for entertainment/awareness only — not medical advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      py-2 px-4 rounded-t-lg font-bold transition-colors duration-200
      ${isActive
        ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400'
        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
      }
    `}
  >
    {label}
  </button>
);

const AnalysisCard = ({ title, description, color, dates }) => (
  <div className="bg-gray-800 p-6 rounded-xl backdrop-blur-sm bg-opacity-40 border border-gray-700 hover:border-blue-500 transition-colors duration-300">
    <div className="flex items-center gap-4 mb-3">
      <div className={`w-8 h-8 rounded-full ${color}`}></div>
      <div>
        <h4 className="text-lg font-bold text-gray-200">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
    {dates.length > 0 ? (
      <div className="space-y-2">
        {dates.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-gray-300 text-sm">
            <span>{item.date.toDateString()}</span>
            <span className="font-semibold text-gray-100">{item.percentage}%</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 italic text-sm">No significant dates found.</p>
    )}
  </div>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span className={`w-4 h-4 rounded-full ${color}`}></span>
    <span className="text-sm text-gray-400">{label}</span>
  </div>
);

export default App;
