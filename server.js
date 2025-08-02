// Try to load .env from secure location first, fallback to local
const fs = require('fs');
const path = require('path');

const secureEnvPath = '/etc/zmachine/.env';
const localEnvPath = path.join(__dirname, '.env');

if (fs.existsSync(secureEnvPath)) {
    require('dotenv').config({ path: secureEnvPath });
    console.log('Loaded environment from secure location');
} else if (fs.existsSync(localEnvPath)) {
    require('dotenv').config({ path: localEnvPath });
    console.log('Loaded environment from local file');
} else {
    console.log('No .env file found, using system environment variables');
}

const express = require('express');
const DFrotzInterface = require('./frotz-js/dist/index');
const crypto = require('crypto');

// Try to load AI enhancement, but don't fail if it's missing
let aiEnhancement = null;
try {
    const RobotAIEnhancement = require('./ai-enhancement');
    aiEnhancement = new RobotAIEnhancement();
    console.log('AI enhancement loaded successfully');
} catch (error) {
    console.log('AI enhancement not available:', error.message);
    console.log('Running in basic mode without AI features');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('web'));

// Generate session ID
function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

// Create session-specific save file path
function getSessionSaveFile(game, sessionId) {
    const baseConfigs = {
        suspended: path.join(__dirname, 'suspended/SAVE'),
        zork1: path.join(__dirname, 'frotz-js/frotz/data/zork1/SAVE'),
        zork2: path.join(__dirname, 'frotz-js/frotz/data/zork2/SAVE'),
        zork3: path.join(__dirname, 'frotz-js/frotz/data/zork3/SAVE')
    };
    
    const saveDir = baseConfigs[game];
    if (!saveDir) return null;
    
    // Ensure save directory exists
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
    }
    
    return path.join(saveDir, `${game}-session-${sessionId}.sav`);
}

// Game configurations
const gameConfigs = {
    suspended: {
        gameImage: path.join(__dirname, 'suspended.dat')
    },
    zork1: {
        gameImage: path.join(__dirname, 'frotz-js/frotz/data/zork1/DATA/ZORK1.DAT')
    },
    zork2: {
        gameImage: path.join(__dirname, 'frotz-js/frotz/data/zork2/DATA/ZORK2.DAT')
    },
    zork3: {
        gameImage: path.join(__dirname, 'frotz-js/frotz/data/zork3/DATA/ZORK3.DAT')
    }
};

// Session cleanup - remove old session files periodically
function cleanupOldSessions() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const now = Date.now();
    
    Object.keys(gameConfigs).forEach(game => {
        const baseConfigs = {
            suspended: path.join(__dirname, 'suspended/SAVE'),
            zork1: path.join(__dirname, 'frotz-js/frotz/data/zork1/SAVE'),
            zork2: path.join(__dirname, 'frotz-js/frotz/data/zork2/SAVE'),
            zork3: path.join(__dirname, 'frotz-js/frotz/data/zork3/SAVE')
        };
        
        const saveDir = baseConfigs[game];
        if (!fs.existsSync(saveDir)) return;
        
        try {
            const files = fs.readdirSync(saveDir);
            files.forEach(file => {
                if (file.includes('-session-') && file.endsWith('.sav')) {
                    const filePath = path.join(saveDir, file);
                    const stats = fs.statSync(filePath);
                    const ageMs = now - stats.mtime.getTime();
                    
                    if (ageMs > maxAge) {
                        console.log(`Cleaning up old session file: ${file}`);
                        fs.unlinkSync(filePath);
                    }
                }
            });
        } catch (err) {
            console.warn(`Error cleaning up sessions for ${game}:`, err.message);
        }
    });
}

// Run cleanup every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000);

// API endpoint to start a new game
app.post('/api/new-game', (req, res) => {
    const { game } = req.body;
    
    if (!gameConfigs[game]) {
        return res.status(400).json({ error: { error: 'Invalid game selection' } });
    }
    
    // Generate a new session ID
    const sessionId = generateSessionId();
    const config = gameConfigs[game];
    const sessionSaveFile = getSessionSaveFile(game, sessionId);
    
    if (!sessionSaveFile) {
        return res.status(500).json({ error: { error: 'Failed to create session save file path' } });
    }
    
    const frotzInterface = new DFrotzInterface({
        executable: path.join(__dirname, 'frotz-js/frotz/dfrotz'),
        gameImage: config.gameImage,
        saveFile: sessionSaveFile
    });
    
    // Delete existing save file to start fresh (shouldn't exist for new session, but just in case)
    try {
        if (fs.existsSync(sessionSaveFile)) {
            fs.unlinkSync(sessionSaveFile);
        }
    } catch (err) {
        console.warn('Could not delete session save file:', err.message);
    }
    
    frotzInterface.iteration('look', async (error, output) => {
        if (error && error.error) {
            console.error('Frotz error:', error);
            return res.status(500).json({ error });
        }
        
        try {
            if (aiEnhancement) {
                // Skip AI enhancement for initial game startup to preserve intro
                const enhancedOutput = await aiEnhancement.processGameOutput('look', output, true);
                res.json({ 
                    sessionId,
                    output: enhancedOutput 
                });
            } else {
                res.json({ 
                    sessionId,
                    output 
                });
            }
        } catch (aiError) {
            console.error('AI enhancement error:', aiError);
            res.json({ 
                sessionId,
                output 
            }); // Fall back to original output
        }
    });
});

// API endpoint to send a command
app.post('/api/command', (req, res) => {
    const { game, command, sessionId } = req.body;
    
    if (!gameConfigs[game]) {
        return res.status(400).json({ error: { error: 'Invalid game selection' } });
    }
    
    if (!command || command.trim() === '') {
        return res.status(400).json({ error: { error: 'Command cannot be empty' } });
    }
    
    if (!sessionId) {
        return res.status(400).json({ error: { error: 'Session ID is required' } });
    }
    
    const config = gameConfigs[game];
    const sessionSaveFile = getSessionSaveFile(game, sessionId);
    
    if (!sessionSaveFile) {
        return res.status(500).json({ error: { error: 'Failed to create session save file path' } });
    }
    
    const frotzInterface = new DFrotzInterface({
        executable: path.join(__dirname, 'frotz-js/frotz/dfrotz'),
        gameImage: config.gameImage,
        saveFile: sessionSaveFile
    });
    
    frotzInterface.iteration(command.trim(), async (error, output) => {
        if (error && error.error) {
            console.error('Frotz error:', error);
            return res.status(500).json({ error });
        }
        
        try {
            if (aiEnhancement) {
                const enhancedOutput = await aiEnhancement.processGameOutput(command.trim(), output);
                res.json({ output: enhancedOutput });
            } else {
                res.json({ output });
            }
        } catch (aiError) {
            console.error('AI enhancement error:', aiError);
            res.json({ output }); // Fall back to original output
        }
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Z-Machine web server running at http://localhost:${PORT}`);
    console.log('Available games: Suspended, Zork I, II, III');
    if (aiEnhancement) {
        console.log('AI enhancement: ENABLED');
    } else {
        console.log('AI enhancement: DISABLED');
    }
});