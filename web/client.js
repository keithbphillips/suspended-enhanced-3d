class ZMachineClient {
    constructor() {
        this.gameOutput = document.getElementById('gameOutput');
        this.commandInput = document.getElementById('commandInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.robotSelect = document.getElementById('robotSelect');
        this.status = document.getElementById('status');
        
        this.currentGame = 'suspended'; // Always Suspended
        this.sessionId = null; // Session ID for save file isolation
        this.isGameRunning = false;
        this.currentRobot = 'iris';
        this.robotLocations = {
            iris: 'weather-banks',
            waldo: 'repair3', 
            sensa: 'cpu-room',
            auda: 'entry-area',
            poet: 'cpu-room',
            whiz: 'periph-3'
        };
        
        // Command history for shell-like behavior
        this.commandHistory = [];
        this.historyIndex = -1;
        
        this.initializeEventListeners();
        
        // Auto-start the game after a brief delay
        setTimeout(() => {
            this.startNewGame();
        }, 1000);
    }

    initializeEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.sendBtn.addEventListener('click', () => this.sendCommand());
        
        this.commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendCommand();
            }
        });

        // Add keydown listener for arrow key navigation
        this.commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            }
        });

        // Robot selector is handled by the 3D system, but we track current robot
        if (this.robotSelect) {
            this.robotSelect.addEventListener('change', (e) => {
                this.currentRobot = e.target.value;
                this.updateRobotContext();
            });
        }
    }

    async startNewGame() {
        this.setStatus('Starting Suspended...', 'loading');
        
        try {
            const response = await fetch('./api/new-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ game: 'suspended' })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.error || 'Unknown error occurred');
            }
            
            // Store the session ID for this game session
            this.sessionId = data.sessionId;
            console.log('New game session started with ID:', this.sessionId);
            
            // Game is already set to 'suspended'
            this.isGameRunning = true;
            
            this.gameOutput.textContent = '';
            this.appendToOutput(data.output.pretty.join('\n'));
            
            this.commandInput.disabled = false;
            this.sendBtn.disabled = false;
            this.commandInput.focus();
            
            this.setStatus('Suspended is running! Enter commands below.');
            this.updateRobotContext(); // Set initial robot context
            this.syncRobotLocationsTo3D(); // Ensure 3D system has correct starting locations
            
        } catch (error) {
            console.error('Error starting game:', error);
            this.setStatus(`Error starting game: ${error.message}`, 'error');
        }
    }

    async sendCommand() {
        if (!this.isGameRunning || !this.sessionId) {
            console.error('Game not running or no session ID available');
            return;
        }
        
        const command = this.commandInput.value.trim();
        if (!command) {
            return;
        }

        // Add command to history (avoid duplicates of the last command)
        if (this.commandHistory.length === 0 || this.commandHistory[this.commandHistory.length - 1] !== command) {
            this.commandHistory.push(command);
            
            // Limit history to last 50 commands
            if (this.commandHistory.length > 50) {
                this.commandHistory.shift();
            }
        }
        
        // Reset history index after sending a command
        this.historyIndex = -1;

        // Check if command addresses a specific robot and switch view
        this.checkAndSwitchRobotView(command);
        
        this.appendToOutput(`\n> ${command}\n`);
        this.commandInput.value = '';
        this.commandInput.disabled = true;
        this.sendBtn.disabled = true;
        this.setStatus('Processing command...', 'loading');
        
        try {
            const response = await fetch('./api/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    game: this.currentGame,
                    command: command,
                    sessionId: this.sessionId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.error || 'Unknown error occurred');
            }
            
            this.appendToOutput(data.output.pretty.join('\n') + '\n');
            
            // Always check for robot movement since we're always playing Suspended
            this.parseGameStateForRobotMovement(data.output.pretty.join('\n'));
            
            this.commandInput.disabled = false;
            this.sendBtn.disabled = false;
            this.commandInput.focus();
            this.setStatus('Ready for next command');
            
        } catch (error) {
            console.error('Error sending command:', error);
            this.setStatus(`Error: ${error.message}`, 'error');
            
            this.commandInput.disabled = false;
            this.sendBtn.disabled = false;
            this.commandInput.focus();
        }
    }

    appendToOutput(text) {
        this.gameOutput.textContent += text;
        this.gameOutput.scrollTop = this.gameOutput.scrollHeight;
    }

    setStatus(message, type = '') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
    }

    updateRobotContext() {
        // Update placeholder text to reflect current robot
        const robotNames = {
            iris: 'IRIS',
            waldo: 'WALDO', 
            sensa: 'SENSA',
            auda: 'AUDA',
            poet: 'POET',
            whiz: 'WHIZ'
        };
        
        if (this.commandInput) {
            this.commandInput.placeholder = `Command ${robotNames[this.currentRobot]} (e.g., "${this.currentRobot}, look around")`;
        }
    }

    parseGameStateForRobotMovement(output) {
        // Parse the game output for robot movement and location information
        console.log('🔍 Parsing game output for robot locations:');
        console.log('---START OUTPUT---');
        console.log(output);
        console.log('---END OUTPUT---');
        
        const lines = output.split('\n');
        let robotMoved = false;
        
        // Room name to room ID mapping (based on Suspended source analysis)
        const roomNameToId = {
            'Central Chamber': 'cpu-room',
            'Weather Monitors': 'weather-banks', 
            'Transit Monitors': 'rtd-banks',
            'Hydroponics Monitors': 'servo-systems',
            'Main Supply Room': 'supplies-north',
            'Middle Supply Room': 'supplies-mid',
            'Sub Supply Room': 'supplies-south',
            'Angling Corridor': 'corridor-1',
            'Bending Corridor': 'corridor-2',
            'Bending Passage': 'corridor-2', // Alternative name
            'Southeast Junction': 'corridor-3',
            'SouthEast Passage': 'corridor-3', // Alternative name for Southeast Junction
            'Southeast Passage': 'corridor-3', // Alternative capitalization
            'Short Corridor': 'corridor-4',
            'Hallway Junction': 'hallway-junction',
            'North Passage': 'corridor-north',
            'South Passage': 'corridor-south',
            'East Passage': 'corridor-east',
            'West Passage': 'corridor-west',
            'NorthEast Passage': 'corridor-ne',
            'NorthWest Passage': 'corridor-nw',
            'SouthWest Passage': 'corridor-sw',
            'Outer Library Area': 'outside-clc',
            'Weather Control Area': 'weather',
            'Transit Control Area': 'rtd',
            'Hydroponics Control Area': 'hydro',
            'Decontamination Chamber': 'decon-chamber',
            'Sterilization Chamber': 'sterile-area',
            'Small Supply Room': 'tool-area',
            'Activities Area': 'rec-area',
            'Sleep Chamber': 'sleep-chamber',
            'Southeast Passage': 'robot-passage',
            'Bending Passage': 'robot-z',
            'Cavernous Room': 'acidmist',
            'East End': 'midmist',
            'Alpha FC': 'fc1',
            'Beta FC': 'fc2', 
            'Gamma FC': 'fc3',
            'Skywalk Alpha': 'sky1',
            'Skywalk Beta': 'sky2',
            'Skywalk Gamma': 'sky3',
            'Rising Passage': 'ne-passage1',
            'Top Passage': 'ne-passage2',
            'Hallway': 'hallway',
            'Access Hallway': 'access-hallway',
            'Hallway Corner': 'hallway-corner',
            'Hallway Branch': 'hallway-branch',
            'Hallway End': 'hallway-end',
            'Sloping Corridor': 'human-entry',
            'Library Entrance': 'lower-core',
            'Library Core': 'inner-core',
            'Biological Laboratory': 'bio-lab',
            'Cryogenic Area': 'cryounits',
            'Index Peripheral': 'periph-1',
            'Technical Peripheral': 'periph-2', 
            'Advisory Peripheral': 'periph-3',
            'Historical Peripheral': 'periph-4',
            'Central Core': 'clc-core',
            'Alpha Repair': 'repair1',
            'Beta Repair': 'repair2',
            'Gamma Repair': 'repair3',
            'the Alpha Repair': 'repair1',
            'the Beta Repair': 'repair2', 
            'the Gamma Repair': 'repair3',
            'Entry Area': 'entry-area',
            'Small Supply Room': 'tool-area',
            'Activities Area': 'rec-area',
            'Sleep Chamber': 'sleep-chamber',
            'Decontamination Chamber': 'decon-chamber',
            'Sterilization Chamber': 'sterile-area',
            'Weather Control Area': 'weather',
            'Hydroponics Control Area': 'hydro',
            'Transit Control Area': 'rtd',
            'Skywalk Alpha': 'sky1',
            'Skywalk Beta': 'sky2',
            'Skywalk Gamma': 'sky3',
            'Alpha FC': 'fc1',
            'Beta FC': 'fc2',
            'Gamma FC': 'fc3',
            'Cavernous Room': 'acidmist',
            'East End': 'midmist',
            'Biological Laboratory': 'bio-lab',
            'Cryogenic Area': 'cryounits'
        };

        // First, try to find robot location messages in the entire output (handles multi-line messages)
        // Only match actual robot names (not "Score", "FC", etc.)
        const robotLocationPattern = /(IRIS|WALDO|SENSA|AUDA|POET|WHIZ):\s*[^]*?In (?:the |a )([^.\n]+)/gi;
        let match;
        
        while ((match = robotLocationPattern.exec(output)) !== null) {
            const [fullMatch, robotName, roomDescription] = match;
            const robot = robotName.toLowerCase();
            
            console.log(`🔍 Found potential location message: "${fullMatch.trim()}"`);
            
            // Check for room names in the description
            for (const [roomName, roomId] of Object.entries(roomNameToId)) {
                if (roomDescription.includes(roomName)) {
                    console.log(`🤖 LOCATION UPDATE: ${robot.toUpperCase()} is in ${roomName} (${roomId})`);
                    console.log(`   Full match: "${fullMatch.trim()}"`);
                    this.updateRobotLocation(robot, roomId);
                    robotMoved = true;
                    break;
                }
            }
            
            // If no room was found, log it for debugging
            if (!robotMoved) {
                console.warn(`⚠️  LOCATION NOT MAPPED: ${robot.toUpperCase()} - "${roomDescription}"`);
                console.warn(`   Full match: "${fullMatch.trim()}"`);
                console.warn(`   Consider adding this room to the roomNameToId mapping`);
            }
        }
        
        // NEW: Check for "Internal mapping indicates arrival at [Room]" messages
        const arrivalMappingPattern = /(IRIS|WALDO|SENSA|AUDA|POET|WHIZ):\s*Internal mapping indicates arrival at (?:the |a )?([^.\n]+)/gi;
        let arrivalMatch;
        
        while ((arrivalMatch = arrivalMappingPattern.exec(output)) !== null) {
            const [fullMatch, robotName, roomDescription] = arrivalMatch;
            const robot = robotName.toLowerCase();
            
            console.log(`🗺️ Found "Internal mapping" arrival message: "${fullMatch.trim()}"`);
            
            // Check for room names in the description
            for (const [roomName, roomId] of Object.entries(roomNameToId)) {
                if (roomDescription.includes(roomName)) {
                    console.log(`🤖 INTERNAL MAPPING UPDATE: ${robot.toUpperCase()} arrived at ${roomName} (${roomId})`);
                    console.log(`   Full match: "${fullMatch.trim()}"`);
                    this.updateRobotLocation(robot, roomId);
                    robotMoved = true;
                    break;
                }
            }
            
            // If no room was found, log it for debugging
            if (!robotMoved) {
                console.warn(`⚠️  INTERNAL MAPPING LOCATION NOT MAPPED: ${robot.toUpperCase()} - "${roomDescription}"`);
                console.warn(`   Full match: "${fullMatch.trim()}"`);
                console.warn(`   Consider adding this room to the roomNameToId mapping`);
            }
        }
        
        // NEW: Check for "Internal map reference -- [Room]" messages
        const mapReferencePattern = /(IRIS|WALDO|SENSA|AUDA|POET|WHIZ):\s*Internal map reference -- (?:the |a )?([^.\n]+)/gi;
        let referenceMatch;
        
        while ((referenceMatch = mapReferencePattern.exec(output)) !== null) {
            const [fullMatch, robotName, roomDescription] = referenceMatch;
            const robot = robotName.toLowerCase();
            
            console.log(`🗺️ Found "Internal map reference" message: "${fullMatch.trim()}"`);
            
            // Check for room names in the description
            for (const [roomName, roomId] of Object.entries(roomNameToId)) {
                if (roomDescription.includes(roomName)) {
                    console.log(`🤖 INTERNAL MAP REFERENCE UPDATE: ${robot.toUpperCase()} at ${roomName} (${roomId})`);
                    console.log(`   Full match: "${fullMatch.trim()}"`);
                    this.updateRobotLocation(robot, roomId);
                    robotMoved = true;
                    break;
                }
            }
            
            // If no room was found, log it for debugging
            if (!robotMoved) {
                console.warn(`⚠️  INTERNAL MAP REFERENCE LOCATION NOT MAPPED: ${robot.toUpperCase()} - "${roomDescription}"`);
                console.warn(`   Full match: "${fullMatch.trim()}"`);
                console.warn(`   Consider adding this room to the roomNameToId mapping`);
            }
        }
        
        // NEW: Check for standalone "Internal map reference -- [Room]" messages (without robot prefix)
        const standaloneMapReferencePattern = /^Internal map reference -- (?:the |a )?([^.\n]+)/gmi;
        let standaloneReferenceMatch;
        
        while ((standaloneReferenceMatch = standaloneMapReferencePattern.exec(output)) !== null) {
            const [fullMatch, roomDescription] = standaloneReferenceMatch;
            
            console.log(`🗺️ Found standalone "Internal map reference" message: "${fullMatch.trim()}" - assuming for current robot ${this.currentRobot.toUpperCase()}`);
            
            // Check for room names in the description
            for (const [roomName, roomId] of Object.entries(roomNameToId)) {
                if (roomDescription.includes(roomName)) {
                    console.log(`🤖 STANDALONE MAP REFERENCE UPDATE: ${this.currentRobot.toUpperCase()} at ${roomName} (${roomId})`);
                    console.log(`   Full match: "${fullMatch.trim()}"`);
                    this.updateRobotLocation(this.currentRobot, roomId);
                    robotMoved = true;
                    break;
                }
            }
            
            // If no room was found, log it for debugging
            if (!robotMoved) {
                console.warn(`⚠️  STANDALONE MAP REFERENCE LOCATION NOT MAPPED: ${this.currentRobot.toUpperCase()} - "${roomDescription}"`);
                console.warn(`   Full match: "${fullMatch.trim()}"`);
                console.warn(`   Consider adding this room to the roomNameToId mapping`);
            }
        }
        
        // NEW: Also check for "Entering the [Room]" messages (for current robot)
        const enteringPattern = /Entering (?:the |a )([^.\n]+)/gi;
        let enteringMatch;
        
        while ((enteringMatch = enteringPattern.exec(output)) !== null) {
            const [fullMatch, roomDescription] = enteringMatch;
            
            console.log(`🚪 Found entering message: "${fullMatch.trim()}" - assuming for current robot ${this.currentRobot.toUpperCase()}`);
            
            // Check for room names in the description
            for (const [roomName, roomId] of Object.entries(roomNameToId)) {
                if (roomDescription.includes(roomName)) {
                    console.log(`🤖 ENTERING UPDATE: ${this.currentRobot.toUpperCase()} is entering ${roomName} (${roomId})`);
                    console.log(`   Full match: "${fullMatch.trim()}"`);
                    this.updateRobotLocation(this.currentRobot, roomId);
                    robotMoved = true;
                    break;
                }
            }
            
            // If no room was found, log it for debugging
            if (!robotMoved) {
                console.warn(`⚠️  ENTERING LOCATION NOT MAPPED: ${this.currentRobot.toUpperCase()} - "${roomDescription}"`);
                console.warn(`   Full match: "${fullMatch.trim()}"`);
                console.warn(`   Consider adding this room to the roomNameToId mapping`);
            }
        }
        
        // NEW: Also check for simple "In the [Room]" messages (for current robot)
        const inThePattern = /^In (?:the |a )([^.\n]+)/gmi;
        let inMatch;
        
        while ((inMatch = inThePattern.exec(output)) !== null) {
            const [fullMatch, roomDescription] = inMatch;
            
            console.log(`🏠 Found "In the" message: "${fullMatch.trim()}" - assuming for current robot ${this.currentRobot.toUpperCase()}`);
            
            // Check for room names in the description
            for (const [roomName, roomId] of Object.entries(roomNameToId)) {
                if (roomDescription.includes(roomName)) {
                    console.log(`🤖 "IN THE" UPDATE: ${this.currentRobot.toUpperCase()} is in ${roomName} (${roomId})`);
                    console.log(`   Full match: "${fullMatch.trim()}"`);
                    this.updateRobotLocation(this.currentRobot, roomId);
                    robotMoved = true;
                    break;
                }
            }
            
            // If no room was found, log it for debugging
            if (!robotMoved) {
                console.warn(`⚠️  "IN THE" LOCATION NOT MAPPED: ${this.currentRobot.toUpperCase()} - "${roomDescription}"`);
                console.warn(`   Full match: "${fullMatch.trim()}"`);
                console.warn(`   Consider adding this room to the roomNameToId mapping`);
            }
        }
        
        // NEW: Also check for "Moving through [Room]" messages (for current robot)
        const movingThroughPattern = /Moving through (?:the |a )?([^.\n]+)/gi;
        let movingMatch;
        
        while ((movingMatch = movingThroughPattern.exec(output)) !== null) {
            const [fullMatch, roomDescription] = movingMatch;
            
            console.log(`🚶 Found "Moving through" message: "${fullMatch.trim()}" - assuming for current robot ${this.currentRobot.toUpperCase()}`);
            
            // Check for room names in the description
            for (const [roomName, roomId] of Object.entries(roomNameToId)) {
                if (roomDescription.includes(roomName)) {
                    console.log(`🤖 "MOVING THROUGH" UPDATE: ${this.currentRobot.toUpperCase()} is moving through ${roomName} (${roomId})`);
                    console.log(`   Full match: "${fullMatch.trim()}"`);
                    this.updateRobotLocation(this.currentRobot, roomId);
                    robotMoved = true;
                    break;
                }
            }
            
            // If no room was found, log it for debugging
            if (!robotMoved) {
                console.warn(`⚠️  "MOVING THROUGH" LOCATION NOT MAPPED: ${this.currentRobot.toUpperCase()} - "${roomDescription}"`);
                console.warn(`   Full match: "${fullMatch.trim()}"`);
                console.warn(`   Consider adding this room to the roomNameToId mapping`);
            }
        }
        
        // NEW: Also check for other movement patterns
        const otherMovementPatterns = [
            { pattern: /Passing through (?:the |a )?([^.\n]+)/gi, type: "PASSING THROUGH", emoji: "🚶‍♂️" },
            { pattern: /Arriving at (?:the |a )?([^.\n]+)/gi, type: "ARRIVING AT", emoji: "📍" },
            { pattern: /Reaching (?:the |a )?([^.\n]+)/gi, type: "REACHING", emoji: "🎯" },
            { pattern: /Now in (?:the |a )?([^.\n]+)/gi, type: "NOW IN", emoji: "📍" }
        ];
        
        for (const movementType of otherMovementPatterns) {
            let otherMatch;
            while ((otherMatch = movementType.pattern.exec(output)) !== null) {
                const [fullMatch, roomDescription] = otherMatch;
                
                console.log(`${movementType.emoji} Found "${movementType.type}" message: "${fullMatch.trim()}" - assuming for current robot ${this.currentRobot.toUpperCase()}`);
                
                // Check for room names in the description
                for (const [roomName, roomId] of Object.entries(roomNameToId)) {
                    if (roomDescription.includes(roomName)) {
                        console.log(`🤖 "${movementType.type}" UPDATE: ${this.currentRobot.toUpperCase()} is in ${roomName} (${roomId})`);
                        console.log(`   Full match: "${fullMatch.trim()}"`);
                        this.updateRobotLocation(this.currentRobot, roomId);
                        robotMoved = true;
                        break;
                    }
                }
                
                // If no room was found, log it for debugging
                if (!robotMoved) {
                    console.warn(`⚠️  "${movementType.type}" LOCATION NOT MAPPED: ${this.currentRobot.toUpperCase()} - "${roomDescription}"`);
                    console.warn(`   Full match: "${fullMatch.trim()}"`);
                    console.warn(`   Consider adding this room to the roomNameToId mapping`);
                }
            }
        }
        
        // Fallback: also check individual lines (for simpler single-line messages)
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip empty lines
            if (!trimmedLine) continue;
            
            // Check for explicit robot location messages from the game
            const robotMovePattern = /^(IRIS|WALDO|SENSA|AUDA|POET|WHIZ):\s*(.+)$/i;
            const robotMatch = trimmedLine.match(robotMovePattern);
            
            if (robotMatch) {
                const [, robotName, message] = robotMatch;
                const robot = robotName.toLowerCase();
                
                // Only process definitive location messages that start with "In the" or "In a"
                const messageText = message.trim();
                if (messageText.startsWith('In the ') || messageText.startsWith('In a ')) {
                    // Check for room names in the message
                    for (const [roomName, roomId] of Object.entries(roomNameToId)) {
                        if (messageText.includes(roomName)) {
                            console.log(`🤖 SINGLE-LINE LOCATION UPDATE: ${robot.toUpperCase()} is in ${roomName} (${roomId})`);
                            console.log(`   Full message: "${messageText}"`);
                            this.updateRobotLocation(robot, roomId);
                            robotMoved = true;
                            break;
                        }
                    }
                    
                    // If no room was found, log it for debugging
                    if (!robotMoved) {
                        console.warn(`⚠️  SINGLE-LINE LOCATION NOT MAPPED: ${robot.toUpperCase()} - "${messageText}"`);
                        console.warn(`   Consider adding this room to the roomNameToId mapping`);
                    }
                }
            }
            
            // REMOVED: The fallback parsing that was causing incorrect location updates
            // This was overriding the correct robot-specific location messages
            
            // Check for movement direction messages
            const movementPatterns = [
                /I can't go in that direction/,
                /I have reached/,
                /I am at/,
                /I've entered/,
                /Sonar detects/,
                /I'm in a/,
                /I am in a/
            ];
            
            for (const pattern of movementPatterns) {
                if (pattern.test(trimmedLine)) {
                    // This suggests the current robot has moved or is describing their location
                    console.log(`Movement-related message detected for ${this.currentRobot}: ${trimmedLine}`);
                    // We could try to parse the specific location from these messages
                    robotMoved = true;
                    break;
                }
            }
        }

        // If we detected movement, log it
        if (robotMoved) {
            console.log(`🎯 Robot location update detected, current positions:`, this.robotLocations);
        } else {
            // Log all robot messages we're seeing to help debug
            const robotMsgPattern = /^(\w+):\s*(.+)$/;
            for (const line of lines) {
                const trimmed = line.trim();
                if (robotMsgPattern.test(trimmed)) {
                    console.log(`👁️  Saw robot message: "${trimmed}"`);
                }
            }
        }
    }

    updateRobotLocation(robot, newLocation) {
        if (this.robotLocations[robot] !== newLocation) {
            console.log(`🚀 Moving ${robot.toUpperCase()} from ${this.robotLocations[robot]} to ${newLocation}`);
            this.robotLocations[robot] = newLocation;
            
            // Always update the 3D system's robot locations
            if (window.suspended3D) {
                window.suspended3D.robotLocations[robot] = newLocation;
                console.log(`✅ Updated 3D system: ${robot} now in ${newLocation}`);
                
                // Update minimap to show new robot positions
                if (window.suspended3D.updateMinimap) {
                    window.suspended3D.updateMinimap();
                }
                
                // If this is the currently viewed robot, refresh the scene to show new location
                if (robot === this.currentRobot) {
                    console.log(`🔄 Refreshing 3D view for current robot ${robot}`);
                    window.suspended3D.switchRobot(robot);
                } else {
                    console.log(`ℹ️  Updated ${robot} location, but currently viewing ${this.currentRobot}`);
                }
            } else {
                console.warn(`⚠️  3D system not available for location update`);
            }
        } else {
            console.log(`📍 ${robot.toUpperCase()} already in ${newLocation} - no update needed`);
        }
    }

    checkAndSwitchRobotView(command) {
        // Convert command to lowercase for easier matching
        const lowerCommand = command.toLowerCase();
        
        // Robot name patterns - check for robot names at start of command
        const robotPatterns = {
            iris: /^iris[,\s]/i,
            waldo: /^waldo[,\s]/i,
            sensa: /^sensa[,\s]/i,
            auda: /^auda[,\s]/i,
            poet: /^poet[,\s]/i,
            whiz: /^whiz[,\s]/i
        };

        // Check each robot pattern
        for (const [robotName, pattern] of Object.entries(robotPatterns)) {
            if (pattern.test(command)) {
                // For movement commands, delay the switch slightly to let location update first
                if (command.toLowerCase().includes(' go ') || command.toLowerCase().includes(' move ') || 
                    command.toLowerCase().includes(' to ')) {
                    console.log(`⏰ Delaying view switch for movement command: ${command}`);
                    setTimeout(() => {
                        this.switchToRobot(robotName);
                    }, 1000); // 1 second delay for movement commands
                } else {
                    this.switchToRobot(robotName);
                }
                return robotName;
            }
        }

        // Also check for "tell robot" or "ask robot" patterns
        const tellPatterns = {
            iris: /(?:tell|ask)\s+iris/i,
            waldo: /(?:tell|ask)\s+waldo/i,
            sensa: /(?:tell|ask)\s+sensa/i,
            auda: /(?:tell|ask)\s+auda/i,
            poet: /(?:tell|ask)\s+poet/i,
            whiz: /(?:tell|ask)\s+whiz/i
        };

        for (const [robotName, pattern] of Object.entries(tellPatterns)) {
            if (pattern.test(command)) {
                this.switchToRobot(robotName);
                return robotName;
            }
        }

        return null;
    }

    switchToRobot(robotName) {
        if (this.currentRobot !== robotName) {
            console.log(`Switching view to ${robotName.toUpperCase()}`);
            
            this.currentRobot = robotName;
            
            // Update the robot selector UI
            if (this.robotSelect) {
                this.robotSelect.value = robotName;
            }
            
            // Update the 3D visualization
            if (window.suspended3D) {
                window.suspended3D.switchRobot(robotName);
            }
            
            // Update context
            this.updateRobotContext();
            
            // Show brief status message
            this.showRobotSwitchFeedback(robotName);
        }
    }

    showRobotSwitchFeedback(robotName) {
        const robotNames = {
            iris: 'IRIS (Visual)',
            waldo: 'WALDO (Builder)', 
            sensa: 'SENSA (Sensory)',
            auda: 'AUDA (Audio)',
            poet: 'POET (Diagnostic)',
            whiz: 'WHIZ (Interface)'
        };

        // Temporarily show switch message
        const originalStatus = this.status.textContent;
        const originalClass = this.status.className;
        
        this.setStatus(`Switched view to ${robotNames[robotName]}`, 'loading');
        
        // Restore original status after 2 seconds
        setTimeout(() => {
            this.status.textContent = originalStatus;
            this.status.className = originalClass;
        }, 2000);
    }

    syncRobotLocationsTo3D() {
        // Ensure the 3D system has the same robot locations as the client
        if (window.suspended3D) {
            console.log('Syncing robot locations to 3D system:', this.robotLocations);
            for (const [robot, location] of Object.entries(this.robotLocations)) {
                window.suspended3D.robotLocations[robot] = location;
            }
            console.log('3D system robot locations updated:', window.suspended3D.robotLocations);
        }
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) {
            return;
        }

        if (direction === 'up') {
            // Move back in history (older commands)
            if (this.historyIndex === -1) {
                // First time pressing up - go to most recent command
                this.historyIndex = this.commandHistory.length - 1;
            } else if (this.historyIndex > 0) {
                this.historyIndex--;
            }
        } else if (direction === 'down') {
            // Move forward in history (newer commands)
            if (this.historyIndex !== -1) {
                this.historyIndex++;
                if (this.historyIndex >= this.commandHistory.length) {
                    // Past the end - clear input
                    this.historyIndex = -1;
                    this.commandInput.value = '';
                    return;
                }
            }
        }

        // Update input field with command from history
        if (this.historyIndex !== -1) {
            this.commandInput.value = this.commandHistory[this.historyIndex];
            
            // Move cursor to end of input
            setTimeout(() => {
                this.commandInput.setSelectionRange(this.commandInput.value.length, this.commandInput.value.length);
            }, 0);
        }
    }

    // Debug method to check robot locations (can be called from browser console)
    debugRobotLocations() {
        console.log('=== ROBOT LOCATION DEBUG ===');
        console.log('Client robot locations:', this.robotLocations);
        if (window.suspended3D) {
            console.log('3D system robot locations:', window.suspended3D.robotLocations);
            console.log('Current 3D robot view:', window.suspended3D.currentRobot);
            console.log('Current 3D room:', window.suspended3D.currentRoom?.name);
        }
        console.log('Current client robot:', this.currentRobot);
        console.log('============================');
    }

    // Debug method to check command history (can be called from browser console)
    debugCommandHistory() {
        console.log('=== COMMAND HISTORY DEBUG ===');
        console.log('History length:', this.commandHistory.length);
        console.log('Current history index:', this.historyIndex);
        console.log('Command history:', this.commandHistory);
        if (this.historyIndex !== -1) {
            console.log('Current history command:', this.commandHistory[this.historyIndex]);
        }
        console.log('==============================');
    }
}

// Make debug methods globally accessible
window.debugRobots = function() {
    if (window.zmachineClient) {
        window.zmachineClient.debugRobotLocations();
    } else {
        console.log('ZMachine client not available');
    }
};

window.debugHistory = function() {
    if (window.zmachineClient) {
        window.zmachineClient.debugCommandHistory();
    } else {
        console.log('ZMachine client not available');
    }
};

// Initialize the client when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.zmachineClient = new ZMachineClient();
});