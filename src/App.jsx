import React, { useState } from 'react';
import { MapPin, Clock, Lightbulb, Utensils, X, Share2, Download, Map, List, Calendar, ChevronRight, ChevronLeft, Loader, RefreshCw, Building2, ShoppingBag, Landmark, Trees, Moon, Camera, Sparkles, AlertCircle } from 'lucide-react';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('timeline');
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  const [formData, setFormData] = useState({
    city: '',
    date: '',
    startTime: '09:00',
    endTime: '20:00',
    interests: [],
    pace: 'moderate',
    budget: 'mid',
    walking: 'normal'
  });

  const [itinerary, setItinerary] = useState([]);

  const getApiKey = () => {
    return import.meta.env.VITE_GEMINI_API_KEY || apiKey;
  };

  const interests = [
    { id: 'museums', label: 'Museums & Art', icon: Building2 },
    { id: 'food', label: 'Local Food', icon: Utensils },
    { id: 'architecture', label: 'Architecture', icon: Landmark },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'history', label: 'History', icon: Landmark },
    { id: 'nature', label: 'Nature', icon: Trees },
    { id: 'nightlife', label: 'Nightlife', icon: Moon },
    { id: 'photography', label: 'Photography', icon: Camera }
  ];

  const generateWithGemini = async () => {
    setIsGenerating(true);
    setError(null);

    const prompt = `Create a day itinerary for ${formData.city} from ${formData.startTime} to ${formData.endTime}.
Interests: ${formData.interests.join(', ')}
Pace: ${formData.pace}

Return ONLY valid JSON array (no markdown):
[
  {"time": "09:00 AM", "duration": "2 hrs", "type": "museum", "name": "Place Name", "tip": "Quick tip", "description": "Brief description"},
  {"time": "11:00 AM", "type": "transit", "method": "Walk", "duration": "15 min", "distance": "1 km"}
]

Include 4-6 activities. Types: museum, food, landmark, nature, shopping`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${getApiKey()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate itinerary. Check your API key.');
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No response from Gemini');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      let cleanedText = generatedText.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsedItinerary = JSON.parse(jsonMatch[0]);
      setItinerary(parsedItinerary);
      setCurrentStep(4);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const removeActivity = async (index) => {
    const removedActivity = itinerary[index];
    setIsReplacing(true);

    const prompt = `Suggest ONE ${formData.city} ${removedActivity.type} alternative to "${removedActivity.name}" for ${removedActivity.time}.
Return ONLY JSON:
{"time": "${removedActivity.time}", "duration": "${removedActivity.duration}", "type": "${removedActivity.type}", "name": "Place", "tip": "Tip", "description": "Description"}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${getApiKey()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 512
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const generatedText = data.candidates[0].content.parts[0].text;
          let jsonText = generatedText.match(/\{[\s\S]*\}/)?.[0] || generatedText;
          const replacement = JSON.parse(jsonText);
          const newItinerary = [...itinerary];
          newItinerary[index] = replacement;
          setItinerary(newItinerary);
        } else {
          throw new Error('No replacement generated');
        }
      } else {
        throw new Error('Failed to generate replacement');
      }
    } catch (err) {
      console.error('Error:', err);
      const newItinerary = itinerary.filter((_, i) => i !== index);
      setItinerary(newItinerary);
    } finally {
      setIsReplacing(false);
    }
  };

  const regenerateItinerary = () => {
    setCurrentStep(3);
    setItinerary([]);
  };

  const getActivityIcon = (type) => {
    const icons = {
      museum: Building2,
      food: Utensils,
      landmark: Landmark,
      nature: Trees,
      shopping: ShoppingBag,
      nightlife: Moon
    };
    return icons[type] || MapPin;
  };

  const getActivityColor = (type) => {
    const colors = {
      museum: 'from-purple-500 to-purple-600',
      food: 'from-orange-500 to-orange-600',
      landmark: 'from-blue-500 to-blue-600',
      nature: 'from-green-500 to-green-600',
      shopping: 'from-pink-500 to-pink-600',
      nightlife: 'from-indigo-500 to-indigo-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const toggleInterest = (id) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const generateItinerary = () => {
    const key = getApiKey();
    if (!key) {
      setShowApiKeyInput(true);
      return;
    }
    generateWithGemini();
  };

  const getMapUrl = (activityName, city) => {
    const query = encodeURIComponent(`${activityName}, ${city}`);
    return `https://www.google.com/maps?q=${query}&output=embed`;
  };

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-5xl w-full mx-auto text-center space-y-10">
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl">
              <MapPin className="w-16 h-16 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
              Plan Your Perfect Day
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Stop spending hours researching. Get a personalized itinerary in under 2 minutes.
            </p>
          </div>
          
          <div className="pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="group inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105 hover:-translate-y-1"
            >
              Get Started
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="pt-12 flex flex-wrap items-center justify-center gap-8 md:gap-12 text-base text-gray-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <span className="font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="font-medium">2 Min Setup</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <span className="font-medium">Any City</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep >= 1 && currentStep <= 3) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <span className="text-sm font-medium text-gray-400">
                Step {currentStep} of 3
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-700">
            
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Where are you going?</h2>
                  <p className="text-gray-400">Choose your destination city</p>
                </div>
                
                <input
                  type="text"
                  placeholder="Type a city name..."
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-6 py-4 text-lg bg-gray-700 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-white placeholder-gray-400"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Paris', 'Tokyo', 'New York', 'Barcelona', 'Rome', 'London', 'Amsterdam', 'Bangkok'].map(city => (
                    <button
                      key={city}
                      onClick={() => setFormData({ ...formData, city })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.city === city
                          ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-300'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.city}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">When are you visiting?</h2>
                  <p className="text-gray-400">Set your date and timeframe</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                      <select
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none text-white"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return <option key={hour} value={`${hour}:00`}>{hour}:00</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                      <select
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none text-white"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return <option key={hour} value={`${hour}:00`}>{hour}:00</option>;
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!formData.date}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Customize your day</h2>
                  <p className="text-gray-400">What interests you? (Pick 2-4)</p>
                </div>

                {showApiKeyInput && (
                  <div className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-200 mb-2">
                          Enter your Gemini API Key to generate personalized itineraries
                        </p>
                        <a 
                          href="https://aistudio.google.com/app/apikey" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline"
                        >
                          Get a free API key from Google AI Studio →
                        </a>
                      </div>
                    </div>
                    <input
                      type="password"
                      placeholder="Paste your Gemini API key here..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border-2 border-blue-600 rounded-lg focus:border-blue-500 focus:outline-none text-sm text-white placeholder-gray-400"
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-xl p-4 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {interests.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => toggleInterest(id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        formData.interests.includes(id)
                          ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-300'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Pace</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['relaxed', 'moderate', 'packed'].map(pace => (
                        <button
                          key={pace}
                          onClick={() => setFormData({ ...formData, pace })}
                          className={`px-4 py-2 rounded-lg border-2 capitalize transition-all ${
                            formData.pace === pace
                              ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-300'
                              : 'border-gray-600 hover:border-gray-500 text-gray-300'
                          }`}
                        >
                          {pace}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Budget</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['budget', 'mid', 'luxury'].map(budget => (
                        <button
                          key={budget}
                          onClick={() => setFormData({ ...formData, budget })}
                          className={`px-4 py-2 rounded-lg border-2 capitalize transition-all ${
                            formData.budget === budget
                              ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-300'
                              : 'border-gray-600 hover:border-gray-500 text-gray-300'
                          }`}
                        >
                          {budget === 'mid' ? 'Mid-range' : budget}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Walking</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['limited', 'normal', 'athletic'].map(walking => (
                        <button
                          key={walking}
                          onClick={() => setFormData({ ...formData, walking })}
                          className={`px-4 py-2 rounded-lg border-2 capitalize transition-all ${
                            formData.walking === walking
                              ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-300'
                              : 'border-gray-600 hover:border-gray-500 text-gray-300'
                          }`}
                        >
                          {walking}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateItinerary}
                  disabled={formData.interests.length < 2 || isGenerating}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Generating Your Perfect Day...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate My Day
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20 md:pb-8">
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">New Plan</span>
            </button>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Your Perfect Day in {formData.city}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formData.date || 'Oct 15, 2025'}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formData.startTime} - {formData.endTime}
              </div>
              <div className="flex items-center gap-1 text-orange-400">
                ☀️ 72°F, Sunny
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'timeline' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {itinerary.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Generate your itinerary to see it here</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700 hidden md:block" />

              <div className="space-y-3">
                {itinerary.map((item, index) => {
                  if (item.type === 'transit') {
                    return (
                      <div key={index} className="flex items-center gap-4 py-2 md:pl-20">
                        <div className="hidden md:block absolute left-6 w-5 h-5 bg-gray-900 border-2 border-gray-600 rounded-full" />
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="text-xs bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                            🚶 {item.duration} • {item.distance}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const Icon = getActivityIcon(item.type);
                  const colorGradient = getActivityColor(item.type);

                  return (
                    <div key={index} className="relative group">
                      <div className="hidden md:flex absolute left-0 items-center">
                        <div className={`w-12 h-12 bg-gradient-to-br ${colorGradient} rounded-full flex items-center justify-center text-white shadow-lg relative z-10`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>

                      <div 
                        className={`md:ml-20 bg-gradient-to-br ${colorGradient} p-[2px] rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer`}
                        onClick={() => setSelectedActivity(item)}
                      >
                        <div className="bg-gray-800 rounded-xl p-5 h-full">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-400">{item.time}</span>
                                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{item.duration}</span>
                              </div>
                              <h3 className="text-xl font-bold text-white">{item.name}</h3>
                              <p className="text-gray-400">{item.description}</p>
                              {item.tip && (
                                <div className="flex items-start gap-2 bg-amber-900 bg-opacity-30 border border-amber-800 rounded-lg p-3 mt-2">
                                  <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-amber-200">{item.tip}</span>
                                </div>
                              )}
                            </div>
                            <button 
                              className="p-2 hover:bg-red-900 hover:bg-opacity-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeActivity(index);
                              }}
                              disabled={isReplacing}
                            >
                              {isReplacing ? (
                                <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                              ) : (
                                <X className="w-5 h-5 text-red-400 hover:text-red-300" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 divide-y divide-gray-700">
            {itinerary.filter(item => item.type !== 'transit').map((item, index) => {
              const Icon = getActivityIcon(item.type);
              const colorGradient = getActivityColor(item.type);
              return (
                <div key={index} className="p-5 hover:bg-gray-750 transition-colors flex items-center gap-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${colorGradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-xs text-gray-500">• {item.time}</span>
                    </div>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg md:hidden">
        <div className="px-4 py-3 flex gap-2">
          <button 
            onClick={regenerateItinerary}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
          <button className="px-4 py-3 border-2 border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
            <Share2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {selectedActivity && selectedActivity.type !== 'transit' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={() => setSelectedActivity(null)}
        >
          <div 
            className="bg-gray-800 w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">{selectedActivity.name}</h2>
              <button 
                onClick={() => setSelectedActivity(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-white">{selectedActivity.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-medium text-white">{selectedActivity.duration}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">About</h3>
                <p className="text-gray-400">{selectedActivity.description}</p>
              </div>

              {selectedActivity.tip && (
                <div className="bg-amber-900 bg-opacity-30 border border-amber-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-amber-200 mb-1">Insider Tip</h3>
                      <p className="text-sm text-amber-100">{selectedActivity.tip}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowMapModal(true)}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  View on Map
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const activityIndex = itinerary.findIndex(a => a === selectedActivity);
                    setSelectedActivity(null);
                    removeActivity(activityIndex);
                  }}
                  className="px-6 py-3 border-2 border-red-800 text-red-400 rounded-xl font-semibold hover:bg-red-900 hover:bg-opacity-30 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMapModal && selectedActivity && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowMapModal(false)}
        >
          <div 
            className="bg-gray-800 w-full max-w-4xl rounded-2xl overflow-hidden border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{selectedActivity.name}</h3>
              <button 
                onClick={() => setShowMapModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="relative w-full h-[60vh] md:h-[70vh]">
              <iframe
                src={getMapUrl(selectedActivity.name, formData.city)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;