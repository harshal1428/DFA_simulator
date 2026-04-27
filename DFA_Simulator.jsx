import React, { useState, useEffect, useRef, useCallback } from 'react';

const DFASimulator = () => {
  // DFA Definition State
  const [numStates, setNumStates] = useState(3);
  const [alphabet, setAlphabet] = useState('0,1');
  const [transitions, setTransitions] = useState({});
  const [startState, setStartState] = useState('q0');
  const [acceptStates, setAcceptStates] = useState(['q2']);
  
  // Animation State
  const [inputString, setInputString] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentState, setCurrentState] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [result, setResult] = useState(null);
  const [pathTrace, setPathTrace] = useState([]);
  const [activeTransition, setActiveTransition] = useState(null);
  
  // Canvas State
  const [statePositions, setStatePositions] = useState({});
  const svgRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  // Preloaded Examples
  const examples = {
    'Strings ending in 1': {
      numStates: 2,
      alphabet: '0,1',
      transitions: {
        'q0': { '0': 'q0', '1': 'q1' },
        'q1': { '0': 'q0', '1': 'q1' }
      },
      startState: 'q0',
      acceptStates: ['q1']
    },
    'Even number of 0s': {
      numStates: 2,
      alphabet: '0,1',
      transitions: {
        'q0': { '0': 'q1', '1': 'q0' },
        'q1': { '0': 'q0', '1': 'q1' }
      },
      startState: 'q0',
      acceptStates: ['q0']
    },
    'Divisible by 3 (binary)': {
      numStates: 3,
      alphabet: '0,1',
      transitions: {
        'q0': { '0': 'q0', '1': 'q1' },
        'q1': { '0': 'q2', '1': 'q0' },
        'q2': { '0': 'q1', '1': 'q2' }
      },
      startState: 'q0',
      acceptStates: ['q0']
    },
    'Contains substring 101': {
      numStates: 4,
      alphabet: '0,1',
      transitions: {
        'q0': { '0': 'q0', '1': 'q1' },
        'q1': { '0': 'q2', '1': 'q1' },
        'q2': { '0': 'q0', '1': 'q3' },
        'q3': { '0': 'q3', '1': 'q3' }
      },
      startState: 'q0',
      acceptStates: ['q3']
    }
  };

  // Initialize state positions when DFA is built
  const calculateStatePositions = useCallback(() => {
    const positions = {};
    const states = Array.from({ length: numStates }, (_, i) => `q${i}`);
    const centerX = 400;
    const centerY = 250;
    const radius = 150;
    
    states.forEach((state, index) => {
      const angle = (2 * Math.PI * index) / states.length - Math.PI / 2;
      positions[state] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    setStatePositions(positions);
  }, [numStates]);

  // Build DFA from inputs
  const buildDFA = () => {
    const symbols = alphabet.split(',').map(s => s.trim()).filter(s => s);
    const newTransitions = {};
    
    for (let i = 0; i < numStates; i++) {
      const state = `q${i}`;
      newTransitions[state] = {};
      symbols.forEach(symbol => {
        newTransitions[state][symbol] = `q0`;
      });
    }
    
    setTransitions(newTransitions);
    calculateStatePositions();
    setResult(null);
    setPathTrace([]);
    setCurrentState(null);
  };

  // Update transition table
  const updateTransition = (fromState, symbol, toState) => {
    setTransitions(prev => ({
      ...prev,
      [fromState]: {
        ...prev[fromState],
        [symbol]: toState
      }
    }));
  };

  // Load example
  const loadExample = (exampleName) => {
    const example = examples[exampleName];
    if (example) {
      setNumStates(example.numStates);
      setAlphabet(example.alphabet);
      setTransitions(example.transitions);
      setStartState(example.startState);
      setAcceptStates(example.acceptStates);
      setCurrentState(null);
      setResult(null);
      setPathTrace([]);
      setTimeout(() => calculateStatePositions(), 100);
    }
  };

  // Run DFA animation
  const runAnimation = () => {
    if (!inputString || isAnimating) return;
    
    setIsAnimating(true);
    setCurrentStep(0);
    setCurrentState(startState);
    setPathTrace([startState]);
    setResult(null);
    setIsPaused(false);
    
    animateDFA(startState, inputString, 0);
  };

  // Animate DFA step by step
  const animateDFA = (state, remainingString, step) => {
    if (step >= remainingString.length) {
      // Animation complete
      const isAccepted = acceptStates.includes(state);
      setResult({
        accepted: isAccepted,
        message: isAccepted ? 'String ACCEPTED' : 'String REJECTED - Ended in non-accept state',
        finalState: state
      });
      setIsAnimating(false);
      setCurrentState(null);
      return;
    }
    
    const symbol = remainingString[step];
    const nextState = transitions[state]?.[symbol];
    
    if (!nextState) {
      setResult({
        accepted: false,
        message: `String REJECTED - No transition from ${state} on '${symbol}'`,
        finalState: state
      });
      setIsAnimating(false);
      setCurrentState(null);
      return;
    }
    
    setCurrentState(state);
    setActiveTransition({ from: state, to: nextState, symbol });
    setCurrentStep(step + 1);
    
    const timeout = setTimeout(() => {
      setPathTrace(prev => [...prev, nextState]);
      setActiveTransition(null);
      animateDFA(nextState, remainingString, step + 1);
    }, animationSpeed);
    
    animationTimeoutRef.current = timeout;
  };

  // Step controls
  const nextStep = () => {
    if (currentStep < inputString.length && currentState) {
      const symbol = inputString[currentStep];
      const nextState = transitions[currentState]?.[symbol];
      
      if (!nextState) {
        setResult({
          accepted: false,
          message: `String REJECTED - No transition from ${currentState} on '${symbol}'`,
          finalState: currentState
        });
        setIsAnimating(false);
        setCurrentState(null);
        return;
      }
      
      setActiveTransition({ from: currentState, to: nextState, symbol });
      setTimeout(() => {
        setCurrentState(nextState);
        setPathTrace(prev => [...prev, nextState]);
        setCurrentStep(prev => prev + 1);
        setActiveTransition(null);
        
        if (currentStep + 1 >= inputString.length) {
          const isAccepted = acceptStates.includes(nextState);
          setResult({
            accepted: isAccepted,
            message: isAccepted ? 'String ACCEPTED' : 'String REJECTED - Ended in non-accept state',
            finalState: nextState
          });
          setIsAnimating(false);
          setCurrentState(null);
        }
      }, 300);
    }
  };

  const pauseAnimation = () => {
    setIsPaused(!isPaused);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  };

  const stopAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setIsAnimating(false);
    setIsPaused(false);
    setCurrentState(null);
    setActiveTransition(null);
    setCurrentStep(0);
  };

  const resetAnimation = () => {
    stopAnimation();
    setResult(null);
    setPathTrace([]);
    setInputString('');
  };

  // Generate random string
  const generateRandomString = () => {
    const symbols = alphabet.split(',').map(s => s.trim()).filter(s => s);
    const length = Math.floor(Math.random() * 8) + 3;
    let string = '';
    for (let i = 0; i < length; i++) {
      string += symbols[Math.floor(Math.random() * symbols.length)];
    }
    setInputString(string);
  };

  // Initialize on mount
  useEffect(() => {
    buildDFA();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // SVG rendering functions
  const renderState = (state) => {
    const pos = statePositions[state];
    if (!pos) return null;
    
    const isStart = state === startState;
    const isAccept = acceptStates.includes(state);
    const isActive = currentState === state;
    const isInPath = pathTrace.includes(state);
    
    return (
      <g key={state}>
        {isStart && (
          <path
            d={`M ${pos.x - 60} ${pos.y} L ${pos.x - 35} ${pos.y}`}
            stroke="#60a5fa"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        )}
        
        <circle
          cx={pos.x}
          cy={pos.y}
          r="30"
          fill={isActive ? '#3b82f6' : isInPath ? '#1f2937' : '#111827'}
          stroke={isAccept ? '#10b981' : isActive ? '#60a5fa' : '#4b5563'}
          strokeWidth={isAccept ? '3' : '2'}
          className={isActive ? 'animate-pulse' : ''}
        />
        
        {isAccept && (
          <circle
            cx={pos.x}
            cy={pos.y}
            r="25"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />
        )}
        
        <text
          x={pos.x}
          y={pos.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          {state}
        </text>
      </g>
    );
  };

  const renderTransition = (fromState, symbol) => {
    const toState = transitions[fromState]?.[symbol];
    if (!toState || !statePositions[fromState] || !statePositions[toState]) return null;
    
    const from = statePositions[fromState];
    const to = statePositions[toState];
    
    if (fromState === toState) {
      // Self-loop
      return (
        <g key={`${fromState}-${symbol}`}>
          <path
            d={`M ${from.x + 20} ${from.y} Q ${from.x + 50} ${from.y - 40} ${from.x} ${from.y - 20}`}
            stroke={activeTransition?.from === fromState && activeTransition?.symbol === symbol ? '#fbbf24' : '#9ca3af'}
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          <text
            x={from.x + 35}
            y={from.y - 25}
            fill="white"
            fontSize="12"
          >
            {symbol}
          </text>
        </g>
      );
    }
    
    // Calculate arrow position
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    const startX = from.x + unitX * 35;
    const startY = from.y + unitY * 35;
    const endX = to.x - unitX * 35;
    const endY = to.y - unitY * 35;
    
    // Check for multiple transitions between same states
    const symbols = Object.keys(transitions[fromState]).filter(s => transitions[fromState][s] === toState);
    const index = symbols.indexOf(symbol);
    const offset = (index - (symbols.length - 1) / 2) * 15;
    
    const perpX = -unitY * offset;
    const perpY = unitX * offset;
    
    return (
      <g key={`${fromState}-${symbol}`}>
        <path
          d={`M ${startX + perpX} ${startY + perpY} L ${endX + perpX} ${endY + perpY}`}
          stroke={activeTransition?.from === fromState && activeTransition?.symbol === symbol ? '#fbbf24' : '#9ca3af'}
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        <text
          x={(startX + endX) / 2 + perpX}
          y={(startY + endY) / 2 + perpY - 5}
          fill="white"
          fontSize="12"
        >
          {symbol}
        </text>
      </g>
    );
  };

  const symbols = alphabet.split(',').map(s => s.trim()).filter(s => s);
  const states = Array.from({ length: numStates }, (_, i) => `q${i}`);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">DFA Simulator & Animator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - DFA Builder */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-blue-300">DFA Builder</h2>
            
            {/* Examples */}
            <div>
              <label className="block text-sm font-medium mb-2">Load Example</label>
              <select
                onChange={(e) => e.target.value && loadExample(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an example...</option>
                {Object.keys(examples).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            
            {/* Number of States */}
            <div>
              <label className="block text-sm font-medium mb-2">Number of States</label>
              <input
                type="number"
                min="1"
                max="10"
                value={numStates}
                onChange={(e) => setNumStates(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Alphabet */}
            <div>
              <label className="block text-sm font-medium mb-2">Alphabet (comma-separated)</label>
              <input
                type="text"
                value={alphabet}
                onChange={(e) => setAlphabet(e.target.value)}
                placeholder="0,1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Start State */}
            <div>
              <label className="block text-sm font-medium mb-2">Start State</label>
              <select
                value={startState}
                onChange={(e) => setStartState(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            {/* Accept States */}
            <div>
              <label className="block text-sm font-medium mb-2">Accept States</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {states.map(state => (
                  <label key={state} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={acceptStates.includes(state)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAcceptStates([...acceptStates, state]);
                        } else {
                          setAcceptStates(acceptStates.filter(s => s !== state));
                        }
                      }}
                      className="mr-2"
                    />
                    {state}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Build Button */}
            <button
              onClick={buildDFA}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
            >
              Build DFA
            </button>
            
            {/* Transition Table */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-blue-300">Transition Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="p-2 text-left">State</th>
                      {symbols.map(symbol => (
                        <th key={symbol} className="p-2 text-center">{symbol}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {states.map(state => (
                      <tr key={state} className="border-b border-gray-700">
                        <td className="p-2 font-medium">{state}</td>
                        {symbols.map(symbol => (
                          <td key={symbol} className="p-2">
                            <select
                              value={transitions[state]?.[symbol] || ''}
                              onChange={(e) => updateTransition(state, symbol, e.target.value)}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {states.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Right/Center Panel - SVG Canvas */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-300 mb-4">DFA Visualization</h2>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <svg
                ref={svgRef}
                width="800"
                height="500"
                viewBox="0 0 800 500"
                className="w-full h-auto"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="#9ca3af"
                    />
                  </marker>
                </defs>
                
                {/* Render transitions */}
                {states.map(state => 
                  symbols.map(symbol => renderTransition(state, symbol))
                )}
                
                {/* Render states */}
                {states.map(state => renderState(state))}
              </svg>
            </div>
            
            {/* Animation Controls */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={inputString}
                  onChange={(e) => setInputString(e.target.value)}
                  placeholder="Enter input string..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAnimating}
                />
                <button
                  onClick={generateRandomString}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-sm transition-colors"
                  disabled={isAnimating}
                >
                  Random
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={runAnimation}
                  disabled={!inputString || isAnimating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Run
                </button>
                <button
                  onClick={pauseAnimation}
                  disabled={!isAnimating}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={stopAnimation}
                  disabled={!isAnimating}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Stop
                </button>
                <button
                  onClick={resetAnimation}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
                >
                  Reset
                </button>
                
                <div className="flex-1 flex items-center space-x-2">
                  <label className="text-sm">Speed:</label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={2100 - animationSpeed}
                    onChange={(e) => setAnimationSpeed(2100 - parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-16">
                    {animationSpeed < 500 ? 'Fast' : animationSpeed < 1200 ? 'Medium' : 'Slow'}
                  </span>
                </div>
              </div>
              
              {/* Current Step Display */}
              {isAnimating && (
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="font-medium">Step {currentStep}/{inputString.length}:</span>
                    {currentStep < inputString.length && (
                      <span className="ml-2">
                        Reading '<span className="text-yellow-400 font-bold">{inputString[currentStep]}</span>'
                        {currentState && transitions[currentState]?.[inputString[currentStep]] && (
                          <span className="ml-2">
                            moving {currentState} → {transitions[currentState][inputString[currentStep]]}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-sm">Input: </span>
                    {inputString.split('').map((char, index) => (
                      <span
                        key={index}
                        className={`inline-block px-2 py-1 mx-1 rounded ${
                          index === currentStep
                            ? 'bg-yellow-600 text-white'
                            : index < currentStep
                            ? 'bg-gray-600'
                            : 'bg-gray-700'
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Result Display */}
              {result && (
                <div className={`rounded-lg p-4 ${
                  result.accepted ? 'bg-green-900 border-2 border-green-600' : 'bg-red-900 border-2 border-red-600'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{result.accepted ? '✅' : '❌'}</span>
                    <span className="font-bold text-lg">{result.message}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Path: </span>
                    <span className="font-mono">
                      {pathTrace.map((state, index) => (
                        <span key={index}>
                          {state}
                          {index < pathTrace.length - 1 && inputString[index] && (
                            <span className="text-blue-400">→({inputString[index]})→</span>
                          )}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DFASimulator;
