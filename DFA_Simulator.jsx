const DFASimulator = () => {
  // DFA Definition State
  const [numStates, setNumStates] = React.useState(3);
  const [alphabet, setAlphabet] = React.useState('0,1');
  const [transitions, setTransitions] = React.useState({});
  const [startState, setStartState] = React.useState('q0');
  const [acceptStates, setAcceptStates] = React.useState(['q2']);
  
  // Animation State
  const [inputString, setInputString] = React.useState('');
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [simulationResult, setSimulationResult] = React.useState(null);
  const [animationSpeed, setAnimationSpeed] = React.useState(1000);
  const [showResult, setShowResult] = React.useState(false);
  const [confetti, setConfetti] = React.useState([]);
  
  // Refs
  const animationTimeoutRef = React.useRef(null);
  const svgRef = React.useRef(null);

  // Preloaded DFA Examples with VERIFIED correct logic
  const examples = React.useMemo(() => ({
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
    'Binary numbers divisible by 3': {
      numStates: 3,
      alphabet: '0,1',
      transitions: {
        'q0': { '0': 'q0', '1': 'q1' },  // remainder 0
        'q1': { '0': 'q2', '1': 'q0' },  // remainder 1
        'q2': { '0': 'q1', '1': 'q2' }   // remainder 2
      },
      startState: 'q0',
      acceptStates: ['q0']
    },
    'Strings containing substring 01': {
      numStates: 3,
      alphabet: '0,1',
      transitions: {
        'q0': { '0': 'q1', '1': 'q0' },  // start, haven't seen 0
        'q1': { '0': 'q1', '1': 'q2' },  // seen 0, looking for 1
        'q2': { '0': 'q2', '1': 'q2' }   // seen 01, accepting sink
      },
      startState: 'q0',
      acceptStates: ['q2']
    }
  }), []);

  // DFA Simulation Engine - EXACT implementation as specified
  const simulateDFA = React.useCallback((dfa, inputString) => {
    let currentState = dfa.startState;
    const path = [{ state: currentState, symbol: null, step: 0 }];

    for (let i = 0; i < inputString.length; i++) {
      const symbol = inputString[i];

      // Validate symbol is in alphabet
      if (!dfa.alphabet.includes(symbol)) {
        return {
          accepted: false,
          path,
          error: `Symbol '${symbol}' not in alphabet`,
          rejectedAt: i
        };
      }

      // Check transition exists
      const nextState = dfa.transitions[currentState]?.[symbol];
      if (nextState === undefined) {
        return {
          accepted: false,
          path,
          error: `No transition from ${currentState} on '${symbol}'`,
          rejectedAt: i
        };
      }

      currentState = nextState;
      path.push({ state: currentState, symbol, step: i + 1 });
    }

    const accepted = dfa.acceptStates.includes(currentState);
    return {
      accepted,
      path,
      error: accepted ? null : `Ended in non-accept state '${currentState}'`,
      finalState: currentState
    };
  }, []);

  // Validate DFA before building
  const validateDFA = React.useCallback(() => {
    const symbols = alphabet.split(',').map(s => s.trim()).filter(s => s);
    const states = Array.from({ length: numStates }, (_, i) => `q${i}`);
    
    // Validate start state
    if (!states.includes(startState)) {
      return { valid: false, error: `Start state '${startState}' is not in defined states` };
    }
    
    // Validate accept states
    for (const acceptState of acceptStates) {
      if (!states.includes(acceptState)) {
        return { valid: false, error: `Accept state '${acceptState}' is not in defined states` };
      }
    }
    
    // Validate transitions are complete
    for (const state of states) {
      for (const symbol of symbols) {
        if (!transitions[state]?.[symbol]) {
          return { 
            valid: false, 
            error: `Missing transition from ${state} on '${symbol}'` 
          };
        }
      }
    }
    
    return { valid: true };
  }, [alphabet, numStates, startState, acceptStates, transitions]);

  // Build DFA from inputs
  const buildDFA = React.useCallback(() => {
    const validation = validateDFA();
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    const symbols = alphabet.split(',').map(s => s.trim()).filter(s => s);
    const newTransitions = {};
    
    for (let i = 0; i < numStates; i++) {
      const state = `q${i}`;
      newTransitions[state] = {};
      symbols.forEach(symbol => {
        newTransitions[state][symbol] = transitions[state]?.[symbol] || `q0`;
      });
    }
    
    setTransitions(newTransitions);
    setSimulationResult(null);
    setShowResult(false);
    setCurrentStep(0);
  }, [validateDFA, alphabet, numStates, transitions]);

  // Load example
  const loadExample = React.useCallback((exampleName) => {
    const example = examples[exampleName];
    if (example) {
      setNumStates(example.numStates);
      setAlphabet(example.alphabet);
      setTransitions(example.transitions);
      setStartState(example.startState);
      setAcceptStates(example.acceptStates);
      setSimulationResult(null);
      setShowResult(false);
      setCurrentStep(0);
      setInputString('');
    }
  }, [examples]);

  // Run simulation
  const runSimulation = React.useCallback(() => {
    if (!inputString.trim()) {
      alert('Please enter an input string');
      return;
    }
    
    const dfa = {
      states: Array.from({ length: numStates }, (_, i) => `q${i}`),
      alphabet: alphabet.split(',').map(s => s.trim()).filter(s => s),
      transitions,
      startState,
      acceptStates
    };
    
    const result = simulateDFA(dfa, inputString);
    setSimulationResult(result);
    setCurrentStep(0);
    setIsAnimating(true);
    setIsPaused(false);
    setShowResult(false);
    
    // Auto-step through animation
    animateSteps(result.path, result.rejectedAt);
  }, [inputString, numStates, alphabet, transitions, startState, acceptStates, simulateDFA]);

  // Animate steps
  const animateSteps = React.useCallback((path, stopAt = null) => {
    let stepIndex = 0;
    
    const step = () => {
      if (stopAt !== null && stepIndex >= stopAt) {
        setIsAnimating(false);
        setShowResult(true);
        if (simulationResult?.accepted) {
          triggerConfetti();
        }
        return;
      }
      
      if (stepIndex >= path.length) {
        setIsAnimating(false);
        setShowResult(true);
        if (simulationResult?.accepted) {
          triggerConfetti();
        }
        return;
      }
      
      setCurrentStep(stepIndex);
      stepIndex++;
      
      animationTimeoutRef.current = setTimeout(step, animationSpeed);
    };
    
    step();
  }, [animationSpeed, simulationResult]);

  // Trigger confetti animation
  const triggerConfetti = React.useCallback(() => {
    const colors = ['#00f5ff', '#00ff88', '#ff3366', '#ffd700', '#ff00ff'];
    const newConfetti = [];
    
    for (let i = 0; i < 20; i++) {
      newConfetti.push({
        id: i,
        left: Math.random() * 100,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: `${Math.random() * 0.5}s`
      });
    }
    
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 2000);
  }, []);

  // Animation controls
  const pauseAnimation = React.useCallback(() => {
    setIsPaused(!isPaused);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, [isPaused]);

  const stopAnimation = React.useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setIsAnimating(false);
    setIsPaused(false);
    setCurrentStep(0);
    setShowResult(false);
  }, []);

  const resetAnimation = React.useCallback(() => {
    stopAnimation();
    setSimulationResult(null);
    setInputString('');
    setConfetti([]);
  }, [stopAnimation]);

  // Calculate state positions
  const statePositions = React.useMemo(() => {
    const positions = {};
    const states = Array.from({ length: numStates }, (_, i) => `q${i}`);
    const centerX = 400;
    const centerY = 250;
    const radius = 120;
    
    states.forEach((state, index) => {
      const angle = (2 * Math.PI * index) / states.length - Math.PI / 2;
      positions[state] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    return positions;
  }, [numStates]);

  // Get current state for animation
  const getCurrentState = React.useCallback(() => {
    if (!simulationResult || currentStep >= simulationResult.path.length) {
      return null;
    }
    return simulationResult.path[currentStep]?.state;
  }, [simulationResult, currentStep]);

  const currentStateName = getCurrentState();

  // SVG rendering functions
  const renderState = (state) => {
    const pos = statePositions[state];
    if (!pos) return null;
    
    const isStart = state === startState;
    const isAccept = acceptStates.includes(state);
    const isActive = state === currentStateName;
    const isInPath = simulationResult?.path?.some(p => p.state === state);
    const isRejected = showResult && !simulationResult?.accepted && state === simulationResult?.finalState;
    
    return React.createElement('g', { key: state },
      // Start arrow
      isStart && React.createElement('path', {
        d: `M ${pos.x - 60} ${pos.y} L ${pos.x - 35} ${pos.y}`,
        stroke: '#00f5ff',
        strokeWidth: '2',
        fill: 'none',
        markerEnd: 'url(#arrowhead)'
      }),
      
      // State circle
      React.createElement('circle', {
        cx: pos.x,
        cy: pos.y,
        r: '30',
        fill: isActive ? '#1e1e2e' : '#0a0a0f',
        stroke: isRejected ? '#ff3366' : isAccept ? '#00ff88' : isActive ? '#00f5ff' : '#444',
        strokeWidth: isAccept ? '4' : '2',
        style: {
          filter: isActive ? 'drop-shadow(0 0 20px #00f5ff) drop-shadow(0 0 40px #00f5ff88)' : 
                  isRejected ? 'drop-shadow(0 0 20px #ff3366)' : 
                  isAccept ? 'drop-shadow(0 0 15px #00ff88)' : 'none'
        }
      }),
      
      // Accept state double ring
      isAccept && React.createElement('circle', {
        cx: pos.x,
        cy: pos.y,
        r: '25',
        fill: 'none',
        stroke: '#00ff88',
        strokeWidth: '2'
      }),
      
      // State label
      React.createElement('text', {
        x: pos.x,
        y: pos.y + 5,
        textAnchor: 'middle',
        fill: 'white',
        fontSize: '14',
        fontWeight: 'bold',
        fontFamily: 'JetBrains Mono, monospace'
      }, state)
    );
  };

  const renderTransition = (fromState, symbol) => {
    const toState = transitions[fromState]?.[symbol];
    if (!toState || !statePositions[fromState] || !statePositions[toState]) return null;
    
    const from = statePositions[fromState];
    const to = statePositions[toState];
    const isActive = simulationResult?.path?.[currentStep]?.symbol === symbol && 
                    simulationResult?.path?.[currentStep - 1]?.state === fromState;
    
    if (fromState === toState) {
      // Self-loop
      return React.createElement('g', { key: `${fromState}-${symbol}` },
        React.createElement('path', {
          d: `M ${from.x + 20} ${from.y} Q ${from.x + 50} ${from.y - 40} ${from.x} ${from.y - 20}`,
          stroke: isActive ? '#ffd700' : '#666',
          strokeWidth: isActive ? '3' : '2',
          fill: 'none',
          markerEnd: 'url(#arrowhead)',
          style: {
            strokeDasharray: isActive ? '5, 5' : 'none',
            animation: isActive ? 'flowDash 0.5s linear infinite' : 'none'
          }
        }),
        React.createElement('text', {
          x: from.x + 35,
          y: from.y - 25,
          fill: 'white',
          fontSize: '12',
          fontFamily: 'JetBrains Mono, monospace'
        }, symbol)
      );
    }
    
    // Regular transition
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    const startX = from.x + unitX * 35;
    const startY = from.y + unitY * 35;
    const endX = to.x - unitX * 35;
    const endY = to.y - unitY * 35;
    
    return React.createElement('g', { key: `${fromState}-${symbol}` },
      React.createElement('path', {
        d: `M ${startX} ${startY} L ${endX} ${endY}`,
        stroke: isActive ? '#ffd700' : '#666',
        strokeWidth: isActive ? '3' : '2',
        fill: 'none',
        markerEnd: 'url(#arrowhead)',
        style: {
          strokeDasharray: isActive ? '5, 5' : 'none',
          animation: isActive ? 'flowDash 0.5s linear infinite' : 'none'
        }
      }),
      React.createElement('text', {
        x: (startX + endX) / 2,
        y: (startY + endY) / 2 - 5,
        fill: 'white',
        fontSize: '12',
        fontFamily: 'JetBrains Mono, monospace'
      }, symbol)
    );
  };

  const symbols = alphabet.split(',').map(s => s.trim()).filter(s => s);
  const states = Array.from({ length: numStates }, (_, i) => `q${i}`);

  return React.createElement('div', {
    style: { minHeight: '100vh', background: '#0a0a0f', color: 'white', fontFamily: 'JetBrains Mono, monospace' }
  },
    // CSS Styles
    React.createElement('style', null, `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
      
      @keyframes neonGlow {
        0%, 100% { 
          box-shadow: 0 0 20px #00f5ff, 0 0 40px #00f5ff88, 0 0 60px #00f5ff44;
          transform: scale(1.15);
        }
        50% { 
          box-shadow: 0 0 30px #00f5ff, 0 0 60px #00f5ffaa, 0 0 80px #00f5ff66;
          transform: scale(1.2);
        }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @keyframes flowDash {
        to { stroke-dashoffset: -20; }
      }
      
      @keyframes bounceIn {
        0% { transform: scale(0) rotate(0deg); opacity: 0; }
        50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        100% { transform: scale(1) rotate(360deg); opacity: 1; }
      }
      
      @keyframes confetti {
        0% { 
          transform: translateY(0) rotate(0deg); 
          opacity: 1; 
        }
        100% { 
          transform: translateY(-100vh) rotate(720deg); 
          opacity: 0; 
        }
      }
      
      .state-default {
        animation: pulse 3s ease-in-out infinite;
      }
      
      .state-active {
        animation: neonGlow 1s ease-in-out infinite;
      }
      
      .state-reject {
        animation: shake 0.5s ease-in-out;
      }
      
      .arrow-active {
        filter: drop-shadow(0 0 10px #ffd700);
      }
      
      .char-current {
        animation: bounceIn 0.3s ease-out;
        border: 2px solid #00f5ff;
        box-shadow: 0 0 15px #00f5ff;
      }
      
      .char-rejected {
        animation: shake 0.5s ease-in-out;
        background: rgba(255, 51, 102, 0.2);
        border-color: #ff3366;
      }
      
      .flash-green {
        animation: flashGreen 0.4s ease-in-out;
      }
      
      .flash-red {
        animation: flashRed 0.4s ease-in-out;
      }
      
      .confetti-piece {
        position: fixed;
        width: 10px;
        height: 10px;
        animation: confetti 2s ease-out forwards;
        pointer-events: none;
        z-index: 9999;
      }
      
      body {
        background: #0a0a0f;
        background-image: 
          radial-gradient(circle at 20% 50%, rgba(0, 245, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, rgba(255, 51, 102, 0.05) 0%, transparent 50%);
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
      }
    `),
    
    // Flash overlay for results
    showResult && React.createElement('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: simulationResult?.accepted ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 51, 102, 0.3)',
        pointerEvents: 'none',
        zIndex: 50,
        animation: simulationResult?.accepted ? 'flashGreen 0.4s ease-in-out' : 'flashRed 0.4s ease-in-out'
      }
    }),
    
    // Confetti
    confetti.map(piece => 
      React.createElement('div', {
        key: piece.id,
        className: 'confetti-piece',
        style: {
          position: 'fixed',
          left: `${piece.left}%`,
          backgroundColor: piece.backgroundColor,
          width: '10px',
          height: '10px',
          animation: `confetti 2s ease-out forwards`,
          animationDelay: piece.animationDelay,
          pointerEvents: 'none',
          zIndex: 9999
        }
      })
    ),
    
    // Main Container
    React.createElement('div', { style: { minHeight: '100vh', padding: '16px' } },
      // Header
      React.createElement('header', { style: { borderBottom: '1px solid #333', paddingBottom: '16px', marginBottom: '24px' } },
        React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          React.createElement('h1', { 
            style: { 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#00f5ff',
              textShadow: '0 0 20px #00f5ff',
              margin: 0
            }
          }, 'DFA Simulator'),
          
          // Example selector
          React.createElement('select', {
            onChange: (e) => e.target.value && loadExample(e.target.value),
            style: {
              padding: '8px 16px',
              background: '#0a0a0f',
              border: '1px solid #00f5ff',
              borderRadius: '8px',
              color: '#00f5ff',
              fontSize: '14px'
            }
          },
            React.createElement('option', { value: '' }, 'Load Example...'),
            Object.keys(examples).map(name => 
              React.createElement('option', { key: name, value: name }, name)
            )
          )
        )
      ),
      
      // Main Content Grid
      React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '30% 45% 25%', gap: '24px' } },
        // Left Panel - Builder (30%)
        React.createElement('div', { style: { spaceY: '16px' } },
          React.createElement('div', { 
            style: { 
              background: '#0a0a0f', 
              border: '1px solid #333', 
              borderRadius: '12px', 
              padding: '24px'
            }
          },
            React.createElement('h2', { style: { fontSize: '20px', fontWeight: '600', color: '#00f5ff', marginBottom: '16px' } }, 'DFA Builder'),
            
            // Number of States
            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#ccc', marginBottom: '8px' } }, 'Number of States'),
              React.createElement('input', {
                type: 'number',
                min: '1',
                max: '10',
                value: numStates,
                onChange: (e) => setNumStates(parseInt(e.target.value) || 1),
                style: {
                  width: '100%',
                  padding: '8px 12px',
                  background: '#1e1e2e',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }
              })
            ),
            
            // Alphabet
            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#ccc', marginBottom: '8px' } }, 'Alphabet (comma-separated)'),
              React.createElement('input', {
                type: 'text',
                value: alphabet,
                onChange: (e) => setAlphabet(e.target.value),
                placeholder: '0,1',
                style: {
                  width: '100%',
                  padding: '8px 12px',
                  background: '#1e1e2e',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }
              })
            ),
            
            // Start State
            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#ccc', marginBottom: '8px' } }, 'Start State'),
              React.createElement('select', {
                value: startState,
                onChange: (e) => setStartState(e.target.value),
                style: {
                  width: '100%',
                  padding: '8px 12px',
                  background: '#1e1e2e',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px'
                }
              },
                states.map(state => 
                  React.createElement('option', { key: state, value: state }, state)
                )
              )
            ),
            
            // Accept States
            React.createElement('div', { style: { marginBottom: '16px' } },
              React.createElement('label', { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#ccc', marginBottom: '8px' } }, 'Accept States'),
              React.createElement('div', { style: { spaceY: '8px', maxHeight: '128px', overflowY: 'auto' } },
                states.map(state => 
                  React.createElement('label', { key: state, style: { display: 'flex', alignItems: 'center', color: '#ccc', fontSize: '14px' } },
                    React.createElement('input', {
                      type: 'checkbox',
                      checked: acceptStates.includes(state),
                      onChange: (e) => {
                        if (e.target.checked) {
                          setAcceptStates([...acceptStates, state]);
                        } else {
                          setAcceptStates(acceptStates.filter(s => s !== state));
                        }
                      },
                      style: { marginRight: '8px' }
                    }),
                    state
                  )
                )
              )
            ),
            
            // Build Button
            React.createElement('button', {
              onClick: buildDFA,
              style: {
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #00f5ff, #0099cc)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#0a0a0f',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 245, 255, 0.3)'
              }
            }, 'BUILD DFA')
          )
        ),
        
        // Center Panel - SVG Canvas (45%)
        React.createElement('div', null,
          React.createElement('div', { 
            style: { 
              background: '#0a0a0f', 
              border: '1px solid #333', 
              borderRadius: '12px', 
              padding: '24px'
            }
          },
            React.createElement('h2', { style: { fontSize: '20px', fontWeight: '600', color: '#00f5ff', marginBottom: '16px' } }, 'DFA Visualization'),
            
            React.createElement('div', { style: { background: '#000', borderRadius: '8px', padding: '16px' } },
              React.createElement('svg', {
                ref: svgRef,
                width: '100%',
                height: '500',
                viewBox: '0 0 800 500'
              },
                // SVG Definitions
                React.createElement('defs', null,
                  React.createElement('marker', {
                    id: 'arrowhead',
                    markerWidth: '10',
                    markerHeight: '10',
                    refX: '9',
                    refY: '3',
                    orient: 'auto'
                  },
                    React.createElement('polygon', {
                      points: '0 0, 10 3, 0 6',
                      fill: '#666'
                    })
                  )
                ),
                
                // Render transitions
                states.map(state => 
                  symbols.map(symbol => renderTransition(state, symbol))
                ),
                
                // Render states
                states.map(state => renderState(state))
              )
            )
          )
        ),
        
        // Right Panel - Step Info (25%)
        React.createElement('div', { style: { spaceY: '16px' } },
          React.createElement('div', { 
            style: { 
              background: '#0a0a0f', 
              border: '1px solid #333', 
              borderRadius: '12px', 
              padding: '24px'
            }
          },
            React.createElement('h2', { style: { fontSize: '20px', fontWeight: '600', color: '#00f5ff', marginBottom: '16px' } }, 'Step Info'),
            
            // Current step info
            simulationResult && React.createElement('div', { style: { spaceY: '12px' } },
              React.createElement('div', { style: { fontSize: '18px' } },
                React.createElement('span', { style: { color: '#999' } }, 'Step '),
                React.createElement('span', { style: { color: '#00f5ff', fontWeight: 'bold' } }, `${currentStep}`),
                React.createElement('span', { style: { color: '#999' } }, ` of ${simulationResult.path.length - 1}`),
              ),
              
              currentStep > 0 && simulationResult.path[currentStep] && React.createElement('div', { style: { fontSize: '14px', spaceY: '4px' } },
                React.createElement('div', null,
                  React.createElement('span', { style: { color: '#999' } }, 'Reading symbol: '),
                  React.createElement('span', { style: { color: '#ffd700', fontWeight: 'bold' } }, `'${simulationResult.path[currentStep].symbol}'`)
                ),
                React.createElement('div', null,
                  React.createElement('span', { style: { color: '#999' } }, 'Transition: '),
                  React.createElement('span', { style: { color: '#00f5ff' } }, 
                    `${simulationResult.path[currentStep - 1]?.state} ──${simulationResult.path[currentStep].symbol}──▶ ${simulationResult.path[currentStep].state}`
                  )
                ),
                React.createElement('div', null,
                  React.createElement('span', { style: { color: '#999' } }, 'Current state: '),
                  React.createElement('span', { style: { color: '#00f5ff', fontWeight: 'bold' } }, currentStateName)
                )
              )
            ),
            
            // Path trace
            React.createElement('div', { style: { marginTop: '16px' } },
              React.createElement('h3', { style: { fontSize: '14px', fontWeight: '500', color: '#ccc', marginBottom: '8px' } }, 'Path Trace:'),
              React.createElement('div', { 
                style: { 
                  fontSize: '12px', 
                  fontFamily: 'monospace', 
                  background: '#1e1e2e', 
                  borderRadius: '6px', 
                  padding: '12px', 
                  maxHeight: '160px', 
                  overflowY: 'auto'
                }
              },
                simulationResult?.path?.map((step, index) => 
                  React.createElement('div', { 
                    key: index, 
                    style: { 
                      color: index === currentStep ? '#00f5ff' : '#999',
                      fontWeight: index === currentStep ? 'bold' : 'normal'
                    }
                  },
                    `${index}: ${step.state}${step.symbol ? ` (${step.symbol})` : ''}`
                  )
                )
              )
            )
          ),
          
          // Result display
          showResult && simulationResult && React.createElement('div', {
            style: {
              marginTop: '24px',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid',
              background: simulationResult.accepted ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 51, 102, 0.1)',
              borderColor: simulationResult.accepted ? '#00ff88' : '#ff3366',
              animation: 'bounceIn 0.5s ease-out'
            }
          },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', spaceX: '12px' } },
              React.createElement('span', { style: { fontSize: '32px' } }, 
                simulationResult.accepted ? '✅' : '❌'
              ),
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('div', { 
                  style: { 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: simulationResult.accepted ? '#00ff88' : '#ff3366',
                    textShadow: simulationResult.accepted ? '0 0 10px #00ff88' : '0 0 10px #ff3366'
                  }
                }, 
                  simulationResult.accepted ? 'ACCEPTED' : 'REJECTED'
                ),
                simulationResult.error && React.createElement('div', { 
                  style: { fontSize: '14px', marginTop: '8px', color: '#ccc' }
                }, simulationResult.error)
              )
            )
          )
        ),
        
        // Animation controls
        React.createElement('div', { 
          style: { 
            background: '#0a0a0f', 
            border: '1px solid #333', 
            borderRadius: '12px', 
            padding: '24px'
          }
        },
          React.createElement('h3', { style: { fontSize: '14px', fontWeight: '500', color: '#00f5ff', marginBottom: '12px' } }, 'Controls'),
          
          // Input string
          React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('input', {
              type: 'text',
              value: inputString,
              onChange: (e) => setInputString(e.target.value),
              placeholder: 'Enter input string...',
              disabled: isAnimating,
              style: {
                width: '100%',
                padding: '8px 12px',
                background: '#1e1e2e',
                border: '1px solid #444',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px'
              }
            })
          ),
          
          // Character display
          inputString && React.createElement('div', { style: { marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '4px' } },
            inputString.split('').map((char, index) => {
              const isCurrent = index === currentStep - 1;
              const isPast = index < currentStep - 1;
              const isRejected = !simulationResult?.accepted && index === simulationResult?.rejectedAt;
              
              return React.createElement('span', {
                key: index,
                style: {
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  textAlign: 'center',
                  color: isCurrent ? '#00f5ff' : 
                         isPast ? '#00ff88' : 
                         isRejected ? '#ff3366' : '#999',
                  background: isCurrent ? '#1e1e2e' : 
                             isPast ? 'rgba(0, 255, 136, 0.1)' : 
                             isRejected ? 'rgba(255, 51, 102, 0.1)' : '#0a0a0f',
                  border: `${isCurrent ? '#00f5ff' : 
                              isPast ? '#00ff88' : 
                              isRejected ? '#ff3366' : '#444'} 1px solid`
                }
              }, char);
            })
          ),
          
          // Control buttons
          React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px' } },
            React.createElement('button', {
              onClick: runSimulation,
              disabled: !inputString.trim() || isAnimating,
              style: {
                flex: 1,
                padding: '8px',
                background: isAnimating ? '#444' : 'linear-gradient(135deg, #00ff88, #00cc66)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white'
              }
            }, isAnimating && !isPaused ? 'PAUSE' : 'RUN'),
            
            React.createElement('button', {
              onClick: pauseAnimation,
              disabled: !isAnimating,
              style: {
                flex: 1,
                padding: '8px',
                background: '#f59e0b',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white'
              }
            }, 'STEP'),
            
            React.createElement('button', {
              onClick: stopAnimation,
              disabled: !isAnimating,
              style: {
                flex: 1,
                padding: '8px',
                background: '#dc2626',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white'
              }
            }, 'STOP'),
            
            React.createElement('button', {
              onClick: resetAnimation,
              style: {
                flex: 1,
                padding: '8px',
                background: '#6b7280',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white'
              }
            }, 'RESET')
          ),
          
          // Speed control
          React.createElement('div', null,
            React.createElement('label', { style: { fontSize: '14px', color: '#ccc', marginBottom: '8px' } }, 'Animation Speed'),
            React.createElement('input', {
              type: 'range',
              min: '200',
              max: '2000',
              step: '200',
              value: animationSpeed,
              onChange: (e) => setAnimationSpeed(parseInt(e.target.value)),
              style: { width: '100%' }
            }),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' } },
              React.createElement('span', null, 'Fast'),
              React.createElement('span', null, `${animationSpeed}ms`),
              React.createElement('span', null, 'Slow')
            )
          ),
          
          // Progress bar
          simulationResult && React.createElement('div', { style: { marginTop: '16px' } },
            React.createElement('div', { style: { fontSize: '12px', color: '#999', marginBottom: '4px' } }, 'Progress'),
            React.createElement('div', { 
              style: { 
                width: '100%', 
                background: '#1e1e2e', 
                borderRadius: '9999px', 
                height: '8px'
              }
            },
              React.createElement('div', {
                style: { 
                  width: `${(currentStep / (simulationResult.path.length - 1)) * 100}%`,
                  background: 'linear-gradient(90deg, #00f5ff, #0099cc)',
                  height: '8px',
                  borderRadius: '9999px',
                  transition: 'all 0.3s'
                }
              })
            )
          )
        )
      )
    )
  );
};
