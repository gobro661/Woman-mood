import React, { useState, useEffect } from 'react';

// Inline SVG for icons to mimic lucide-react
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

// Mood Calculator Component
const App = () => {
  const [inputDate, setInputDate] = useState('');
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('scenarios');
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedDate, setCalculatedDate] = useState(null);

  // Helper functions for date and mood calculations
  const MOOD_MIN = 40.0;
  const MOOD_MAX = 85.0;
  const STEP = (MOOD_MAX - MOOD_MIN) / 13;

  const getMoodCategory = (day) => {
    if (day >= 1 && day <= 5) return 'Menstrual';
    if (day >= 6 && day <= 10) return 'Post-Menstrual';
    if (day >= 11 && day <= 17) return 'Ovulation Peak';
    if (day >= 18 && day <= 23) return 'Luteal Phase';
    if (day >= 24 && day <= 28) return 'Pre-Menstrual';
    return 'Normal';
  };

  const getMoodDescription = (category) => {
    switch (category) {
      case 'Menstrual': return 'Cramps, Low Energy, Emotional';
      case 'Post-Menstrual': return 'Recovery, Gradual Uplift';
      case 'Ovulation Peak': return 'Happy, Energetic, Lusty';
      case 'Luteal Phase': return 'Stable, Content';
      case 'Pre-Menstrual': return 'Irritable, Sad, Pre-Period Mood';
      default: return '';
    }
  };

  const getMoodScore = (day) => {
    let mood;
    if (day >= 1 && day <= 14) {
      mood = MOOD_MIN + (day - 1) * STEP;
    } else {
      mood = MOOD_MAX - (day - 15) * STEP;
    }
    return mood.toFixed(2);
  };

  const calculateScenarios = () => {
    const date = new Date(inputDate);
    if (isNaN(date)) {
      alert('Please enter a valid date.');
      return;
    }
    setIsLoading(true);
    setCalculatedDate(date);
    const allScenarios = [];
    for (let i = 0; i < 28; i++) {
      const scenario = [];
      const dayOffset = i;
      const startDay = date.getDate() - dayOffset;
      const startDate = new Date(date.getFullYear(), date.getMonth(), startDay);

      for (let j = 0; j < 28; j++) {
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + j);
        const cycleDay = j + 1;
        const moodScore = getMoodScore(cycleDay);
        scenario.push({
          date: currentDate,
          cycleDay: cycleDay,
          mood: parseFloat(moodScore),
          category: getMoodCategory(cycleDay),
        });
      }
      allScenarios.push({
        inputDay: i + 1,
        cycle: scenario,
      });
    }
    setScenarios(allScenarios);
    setIsLoading(false);
  };

  const getAnalysisData = () => {
    if (scenarios.length === 0) return null;

    const analysis = {
      ovulationPeak: {},
      menstrualCramps: {},
      pmsPeriod: {},
      bestMoodDays: {},
    };

    scenarios.forEach(scenario => {
      scenario.cycle.forEach(day => {
        const dateKey = day.date.toLocaleDateString();
        const moodScore = day.mood;

        // Ovulation Peak
        if (day.cycleDay >= 11 && day.cycleDay <= 17 && moodScore >= 75) {
          analysis.ovulationPeak[dateKey] = (analysis.ovulationPeak[dateKey] || 0) + 1;
        }

        // Menstrual/Cramps
        if (day.cycleDay >= 1 && day.cycleDay <= 5 && moodScore <= 50) {
          analysis.menstrualCramps[dateKey] = (analysis.menstrualCramps[dateKey] || 0) + 1;
        }

        // PMS Period
        if (day.cycleDay >= 25 && day.cycleDay <= 28 && moodScore <= 55) {
          analysis.pmsPeriod[dateKey] = (analysis.pmsPeriod[dateKey] || 0) + 1;
        }

        // Best Mood Days
        if (moodScore >= 80) {
          analysis.bestMoodDays[dateKey] = (analysis.bestMoodDays[dateKey] || 0) + 1;
        }
      });
    });

    const totalScenarios = 28;
    const formatResults = (data) => {
      return Object.entries(data)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5)
        .map(([dateKey, count]) => ({
          date: new Date(dateKey),
          count,
          percentage: (count / totalScenarios) * 100,
        }));
    };

    return {
      ovulationPeak: formatResults(analysis.ovulationPeak),
      menstrualCramps: formatResults(analysis.menstrualCramps),
      pmsPeriod: formatResults(analysis.pmsPeriod),
      bestMoodDays: formatResults(analysis.bestMoodDays),
    };
  };

  const getCalendarData = (date) => {
    const calendarData = [];
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    let day = new Date(firstDay);
    day.setDate(day.getDate() - startOfWeek);

    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(day);
      let dayNumber = null;
      let moodCategory = null;
      let moodScore = null;
      let isInputDate = false;
      let isCurrentMonth = false;

      // Check if this day falls within the selected scenario
      const scenario = scenarios[selectedScenarioIndex];
      if (scenario) {
        const dayInCycle = scenario.cycle.find(d => d.date.toLocaleDateString() === currentDay.toLocaleDateString());
        if (dayInCycle) {
          dayNumber = dayInCycle.cycleDay;
          moodCategory = dayInCycle.category;
          moodScore = dayInCycle.mood.toFixed(2);
        }
      }

      // Check if it's the input date
      if (calculatedDate && currentDay.toLocaleDateString() === calculatedDate.toLocaleDateString()) {
        isInputDate = true;
      }

      // Check if it's in the current month
      if (currentDay.getMonth() === date.getMonth()) {
        isCurrentMonth = true;
      }

      calendarData.push({
        date: currentDay,
        dayNumber,
        moodCategory,
        moodScore,
        isInputDate,
        isCurrentMonth,
      });

      day.setDate(day.getDate() + 1);
    }

    return calendarData;
  };

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  const handleNextMonth = () => {
    setCurrentCalendarMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const analysisData = getAnalysisData();
  const calendarData = getCalendarData(currentCalendarMonth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a] text-gray-100 font-sans p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Women Mood Calculator <HeartIcon className="ml-4 text-purple-400" />
          </h1>
          <p className="text-lg text-gray-400 mb-1">
            28-Day Arithmetic Progression Model - All Possible Cycle Scenarios
          </p>
          <p className="text-sm text-gray-500 italic">Created by Lakshya Sharma</p>
        </header>

        {/* Card Container */}
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-10 border border-slate-700/50">
          {/* Input Section */}
          <div className="mb-8 p-6 rounded-2xl bg-slate-800/50">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Input Your Date</h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <label className="block text-sm text-gray-400 mb-1" htmlFor="date-input">
                  Known Date (We'll calculate all 28 possible cycle scenarios)
                </label>
                <input
                  id="date-input"
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <button
                onClick={calculateScenarios}
                className={`relative group overflow-hidden px-6 py-3 mt-4 sm:mt-0 rounded-full font-bold transition-all duration-300 text-white
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100 origin-left"></span>
                <span className="relative z-10">{isLoading ? 'Calculating...' : 'Calculate All Scenarios'}</span>
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          {scenarios.length > 0 && (
            <div className="flex justify-center mb-8 p-2 rounded-full bg-slate-800/50 shadow-inner">
              <button
                className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all duration-300 ${activeTab === 'scenarios' ? 'bg-blue-600 shadow-md' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('scenarios')}
              >
                All Scenarios
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all duration-300 ${activeTab === 'analysis' ? 'bg-blue-600 shadow-md' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('analysis')}
              >
                Smart Analysis
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all duration-300 ${activeTab === 'calendar' ? 'bg-blue-600 shadow-md' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('calendar')}
              >
                Calendar View
              </button>
            </div>
          )}

          {/* Tab Content */}
          {scenarios.length > 0 && (
            <div className="relative">
              {/* All Scenarios Tab */}
              {activeTab === 'scenarios' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-8">
                    {scenarios.map((scenario, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedScenarioIndex(index)}
                        className={`p-3 rounded-full text-sm font-bold transition-all duration-300
                                  ${index === selectedScenarioIndex ? 'bg-purple-600 shadow-lg scale-110' : 'bg-slate-700/50 hover:bg-slate-600'}`}
                      >
                        Day {index + 1}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <h3 className="text-xl font-bold mb-4 text-purple-400">
                      Scenario {selectedScenarioIndex + 1}: Input Date is Day {scenarios[selectedScenarioIndex].inputDay}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm table-fixed">
                        <thead>
                          <tr className="border-b border-slate-600 text-gray-400">
                            <th className="w-1/4 py-2">Cycle Day</th>
                            <th className="w-1/4 py-2">Date</th>
                            <th className="w-1/4 py-2">Mood Score</th>
                            <th className="w-1/4 py-2">Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scenarios[selectedScenarioIndex].cycle.map((day, index) => (
                            <tr key={index} className="border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/50 transition duration-200">
                              <td className="py-2">{day.cycleDay}</td>
                              <td className="py-2">{day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                              <td className="py-2">{day.mood.toFixed(2)}</td>
                              <td className="py-2">{getMoodDescription(day.category)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6">
                      <h4 className="font-bold mb-2">Arithmetic Progression Calculation:</h4>
                      <p className="text-gray-400 text-sm">
                        Days 1-14: mood = 40 + (day-1) × 3.4615
                        <br />
                        Days 15-28: mood = 85 - (day-15) × 3.4615
                        <br />
                        <span className="text-xs italic text-gray-500 mt-2 block">
                          This mood prediction is for Scenario {selectedScenarioIndex + 1}. (Created by Lakshya Sharma)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Analysis Tab */}
              {activeTab === 'analysis' && analysisData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Ovulation Peak */}
                  <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-green-400">Ovulation Peak</h3>
                    <p className="text-sm text-gray-400">Days 11-17, Mood 75+</p>
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="text-green-400" />
                      <span className="font-semibold">Best Mood Days (80+):</span>
                    </div>
                    {analysisData.bestMoodDays.length > 0 ? (
                      analysisData.bestMoodDays.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-green-900/40 p-3 rounded-xl border border-green-700/50">
                          <span className="text-sm font-medium">{item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/30 text-green-200">{item.percentage.toFixed(1)}%</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm italic text-gray-500">No dates found with high probability.</p>
                    )}
                  </div>
                  {/* Menstrual/Cramps */}
                  <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-red-400">Menstrual/Cramps</h3>
                    <p className="text-sm text-gray-400">Days 1-5, Mood &le; 50</p>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-droplet text-red-400">
                        <path d="M12 21.366c-1.4-2.8-4.5-5.9-4.5-8.8A7.5 7.5 0 0 1 12 5.093a7.5 7.5 0 0 1 4.5 7.473c0 2.9-3.1 6-4.5 8.8z" />
                        <path d="M12 21.366c-1.4-2.8-4.5-5.9-4.5-8.8A7.5 7.5 0 0 1 12 5.093a7.5 7.5 0 0 1 4.5 7.473c0 2.9-3.1 6-4.5 8.8z" strokeWidth="1" stroke="red" fill="none" />
                      </svg>
                      <span className="font-semibold">Menstrual Period:</span>
                    </div>
                    {analysisData.menstrualCramps.length > 0 ? (
                      analysisData.menstrualCramps.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-red-900/40 p-3 rounded-xl border border-red-700/50">
                          <span className="text-sm font-medium">{item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/30 text-red-200">{item.percentage.toFixed(1)}%</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm italic text-gray-500">No dates found with high probability.</p>
                    )}
                  </div>
                  {/* PMS Period */}
                  <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-yellow-400">PMS Period</h3>
                    <p className="text-sm text-gray-400">Days 25-28, Mood &le; 55</p>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon text-yellow-400">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
                      </svg>
                      <span className="font-semibold">Pre-Period Mood:</span>
                    </div>
                    {analysisData.pmsPeriod.length > 0 ? (
                      analysisData.pmsPeriod.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-yellow-900/40 p-3 rounded-xl border border-yellow-700/50">
                          <span className="text-sm font-medium">{item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/30 text-yellow-200">{item.percentage.toFixed(1)}%</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm italic text-gray-500">No dates found with high probability.</p>
                    )}
                  </div>
                  {/* Overall Analysis */}
                  <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-blue-400">Overall Analysis</h3>
                    <p className="text-sm text-gray-400">Summary of all 28 scenarios.</p>
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="text-blue-400" />
                      <span className="font-semibold">Best Mood Days (80+):</span>
                    </div>
                    {analysisData.bestMoodDays.length > 0 ? (
                      analysisData.bestMoodDays.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-blue-900/40 p-3 rounded-xl border border-blue-700/50">
                          <span className="text-sm font-medium">{item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-200">{item.percentage.toFixed(1)}%</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm italic text-gray-500">No dates found with high probability.</p>
                    )}
                  </div>
                  <div className="lg:col-span-4 text-center text-sm italic text-gray-500 mt-4">
                    This analysis is based on a 28-day model across all possible scenarios. (Created by Lakshya Sharma)
                  </div>
                </div>
              )}

              {/* Calendar View Tab */}
              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-700 transition duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left text-gray-400">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <h3 className="text-xl font-bold">{formatMonthYear(currentCalendarMonth)}</h3>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-700 transition duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right text-gray-400">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 text-center font-bold text-gray-400 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="py-2">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarData.map((day, index) => {
                      let dayClass = 'flex flex-col items-center justify-center h-20 rounded-xl transition duration-200';
                      let dayNumberClass = 'font-bold text-lg';
                      let moodIndicatorClass = 'text-xs italic mt-1';
                      let moodColorClass = '';

                      if (day.isCurrentMonth) {
                        dayClass += ' bg-slate-800/50 hover:bg-slate-700/50';
                      } else {
                        dayClass += ' text-gray-600';
                      }
                      if (day.isInputDate) {
                        dayClass += ' ring-2 ring-purple-500 scale-105';
                      }

                      switch (day.moodCategory) {
                        case 'Menstrual': moodColorClass = 'bg-red-600/50 text-red-200'; break;
                        case 'Ovulation Peak': moodColorClass = 'bg-green-600/50 text-green-200'; break;
                        case 'Pre-Menstrual': moodColorClass = 'bg-yellow-600/50 text-yellow-200'; break;
                        case 'Post-Menstrual':
                        case 'Luteal Phase':
                          moodColorClass = 'bg-blue-600/50 text-blue-200'; break;
                        default: moodColorClass = '';
                      }

                      return (
                        <div key={index} className={`${dayClass} ${day.moodCategory && 'bg-opacity-70'}`}>
                          <span className={dayNumberClass}>{day.date.getDate()}</span>
                          {day.dayNumber && (
                            <span className="text-xs font-semibold px-2 rounded-full mt-1" style={{ backgroundColor: moodColorClass.includes('red') ? 'rgba(239, 68, 68, 0.4)' : moodColorClass.includes('green') ? 'rgba(34, 197, 94, 0.4)' : moodColorClass.includes('yellow') ? 'rgba(250, 204, 21, 0.4)' : 'rgba(59, 130, 246, 0.4)' }}>
                              D{day.dayNumber}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center mt-6">
                    <div className="p-4 rounded-xl bg-slate-800/50">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-semibold text-gray-300">
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-red-600"></span> Menstrual
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-green-600"></span> Ovulation
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-yellow-600"></span> PMS
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-600"></span> Normal
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm italic text-gray-500 mt-4">
                    Calendar predictions for Scenario {selectedScenarioIndex + 1}. (Created by Lakshya Sharma)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="text-center text-gray-500 text-sm italic mt-8">
            <hr className="border-t border-slate-700/50 mb-4" />
            This tool is for entertainment/awareness only — not medical advice.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
