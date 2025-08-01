const express = require('express');
const path = require('path');
const DFrotzInterface = require('./frotz-js/dist/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('web'));

// Game configurations
const gameConfigs = {
    suspended: {
        gameImage: path.join(__dirname, 'suspended.dat'),
        saveFile: path.join(__dirname, 'suspended/SAVE/suspended.sav')
    },
    zork1: {
        gameImage: path.join(__dirname, 'frotz-js/frotz/data/zork1/DATA/ZORK1.DAT'),
        saveFile: path.join(__dirname, 'frotz-js/frotz/data/zork1/SAVE/zork1.sav')
    },
    zork2: {
        gameImage: path.join(__dirname, 'frotz-js/frotz/data/zork2/DATA/ZORK2.DAT'),
        saveFile: path.join(__dirname, 'frotz-js/frotz/data/zork2/SAVE/zork2.sav')
    },
    zork3: {
        gameImage: path.join(__dirname, 'frotz-js/frotz/data/zork3/DATA/ZORK3.DAT'),
        saveFile: path.join(__dirname, 'frotz-js/frotz/data/zork3/SAVE/zork3.sav')
    }
};

// API endpoint to start a new game
app.post('/api/new-game', (req, res) => {
    const { game } = req.body;
    
    if (!gameConfigs[game]) {
        return res.status(400).json({ error: { error: 'Invalid game selection' } });
    }
    
    const config = gameConfigs[game];
    const frotzInterface = new DFrotzInterface({
        executable: path.join(__dirname, 'frotz-js/frotz/dfrotz'),
        gameImage: config.gameImage,
        saveFile: config.saveFile
    });
    
    // Delete existing save file to start fresh
    const fs = require('fs');
    try {
        if (fs.existsSync(config.saveFile)) {
            fs.unlinkSync(config.saveFile);
        }
    } catch (err) {
        console.warn('Could not delete save file:', err.message);
    }
    
    frotzInterface.iteration('look', (error, output) => {
        if (error && error.error) {
            console.error('Frotz error:', error);
            return res.status(500).json({ error });
        }
        
        res.json({ output });
    });
});

// API endpoint to send a command
app.post('/api/command', (req, res) => {
    const { game, command } = req.body;
    
    if (!gameConfigs[game]) {
        return res.status(400).json({ error: { error: 'Invalid game selection' } });
    }
    
    if (!command || command.trim() === '') {
        return res.status(400).json({ error: { error: 'Command cannot be empty' } });
    }
    
    const config = gameConfigs[game];
    const frotzInterface = new DFrotzInterface({
        executable: path.join(__dirname, 'frotz-js/frotz/dfrotz'),
        gameImage: config.gameImage,
        saveFile: config.saveFile
    });
    
    frotzInterface.iteration(command.trim(), (error, output) => {
        if (error && error.error) {
            console.error('Frotz error:', error);
            return res.status(500).json({ error });
        }
        
        res.json({ output });
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Z-Machine web server running at http://localhost:${PORT}`);
    console.log('Available games: Suspended, Zork I, II, III');
});