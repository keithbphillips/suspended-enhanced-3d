const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

class RobotAIEnhancement {
    constructor() {
        this.openai = null;
        this.robotPrompts = new Map();
        this.responseCache = new Map();
        this.gameContext = []; // Store recent game outputs for context
        this.maxContextLength = 10; // Keep last 10 interactions
        this.enabled = false;
        
        this.init();
    }
    
    init() {
        console.log('🤖 Initializing AI Enhancement...');
        console.log('ENABLE_AI_ENHANCEMENT:', process.env.ENABLE_AI_ENHANCEMENT);
        console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
        
        // Check if AI enhancement is enabled
        this.enabled = process.env.ENABLE_AI_ENHANCEMENT === 'true';
        
        if (!this.enabled) {
            console.log('❌ AI enhancement disabled');
            return;
        }
        
        if (!process.env.OPENAI_API_KEY) {
            console.warn('⚠️  OPENAI_API_KEY not found. AI enhancement disabled.');
            this.enabled = false;
            return;
        }
        
        // Initialize OpenAI
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        // Load robot prompts
        this.loadRobotPrompts();
        
        console.log('✅ AI enhancement initialized successfully');
    }
    
    loadRobotPrompts() {
        const promptsDir = path.join(__dirname, 'robot_prompts');
        
        if (!fs.existsSync(promptsDir)) {
            console.warn('Robot prompts directory not found');
            return;
        }
        
        const promptFiles = fs.readdirSync(promptsDir);
        
        for (const file of promptFiles) {
            if (file.endsWith('.txt')) {
                const robotName = file.replace('.txt', '').toUpperCase();
                const promptPath = path.join(promptsDir, file);
                const promptContent = fs.readFileSync(promptPath, 'utf8');
                this.robotPrompts.set(robotName, promptContent);
            }
        }
        
        console.log(`Loaded prompts for robots: ${Array.from(this.robotPrompts.keys()).join(', ')}`);
    }
    
    // Detect if output contains robot speech (basic heuristic)
    isRobotResponse(output, command) {
        if (!output || !command || typeof output !== 'string' || typeof command !== 'string') return null;
        
        // Look for robot names in the output
        const robotNames = Array.from(this.robotPrompts.keys());
        for (const robotName of robotNames) {
            if (output.includes(robotName + ':') || 
                output.includes(robotName + ' INTERRUPT:') ||
                output.toLowerCase().includes(robotName.toLowerCase())) {
                return robotName;
            }
        }
        
        // Check if command was directed at a robot (even if robot didn't respond normally)
        const commandLower = command.toLowerCase();
        for (const robotName of robotNames) {
            if (commandLower.startsWith(robotName.toLowerCase() + ',') ||
                commandLower.startsWith(robotName.toLowerCase() + ' ') ||
                commandLower.includes('tell ' + robotName.toLowerCase()) ||
                commandLower.includes('ask ' + robotName.toLowerCase())) {
                return robotName;
            }
        }
        
        return null;
    }
    
    // Generate cache key for response caching
    getCacheKey(robotName, command, gameOutput) {
        return `${robotName}:${command}:${gameOutput.substring(0, 100)}`;
    }
    
    async enhanceRobotResponse(robotName, command, originalOutput) {
        if (!this.enabled || !this.openai || !this.robotPrompts.has(robotName)) {
            return originalOutput;
        }
        
        const cacheKey = this.getCacheKey(robotName, command, originalOutput);
        
        // Check cache first
        if (this.responseCache.has(cacheKey)) {
            return this.responseCache.get(cacheKey);
        }
        
        try {
            const robotPrompt = this.robotPrompts.get(robotName);
            const maxTokens = parseInt(process.env.MAX_AI_TOKENS) || 150;
            const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
            
            const completion = await this.openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: robotPrompt
                    },
                    {
                        role: 'user',
                        content: `The player issued command: "${command}"\nThe game responded: "${originalOutput}"\n\nEnhance this response as ${robotName}, staying true to the character while making it more engaging and personality-rich. Keep the core game information intact.`
                    }
                ],
                max_tokens: maxTokens,
                temperature: 0.7
            });
            
            const enhancedResponse = completion.choices[0]?.message?.content;
            
            if (enhancedResponse) {
                // Cache the response
                this.responseCache.set(cacheKey, enhancedResponse);
                
                // Limit cache size to prevent memory issues
                if (this.responseCache.size > 100) {
                    const firstKey = this.responseCache.keys().next().value;
                    this.responseCache.delete(firstKey);
                }
                
                return enhancedResponse;
            }
            
        } catch (error) {
            console.error('OpenAI API error:', error.message);
            // Fall back to original output on error
        }
        
        return originalOutput;
    }
    
    // Check if this is a direct robot conversation that the game parser might not handle
    isDirectRobotCommand(command) {
        if (!command || typeof command !== 'string') return null;
        
        const commandLower = command.toLowerCase().trim();
        const robotNames = Array.from(this.robotPrompts.keys());
        
        for (const robotName of robotNames) {
            const robotLower = robotName.toLowerCase();
            
            // Direct address: "Waldo, how do you feel?"
            if (commandLower.startsWith(robotLower + ',')) {
                return { robotName, directCommand: commandLower.substring(robotLower.length + 1).trim() };
            }
            
            // "Ask Waldo about feelings"
            if (commandLower.startsWith('ask ' + robotLower)) {
                return { robotName, directCommand: commandLower.substring(4 + robotLower.length).trim() };
            }
            
            // "Tell Waldo to do something"
            if (commandLower.startsWith('tell ' + robotLower)) {
                return { robotName, directCommand: commandLower.substring(5 + robotLower.length).trim() };
            }
        }
        
        return null;
    }

    // Add game interaction to context
    addToGameContext(command, output) {
        const contextEntry = {
            command: command,
            output: typeof output === 'string' ? output : 
                   (output && output.pretty) ? output.pretty.join('\n') : String(output || ''),
            timestamp: Date.now()
        };
        
        this.gameContext.push(contextEntry);
        
        // Keep only recent interactions
        if (this.gameContext.length > this.maxContextLength) {
            this.gameContext.shift();
        }
    }
    
    // Build context string for AI
    buildGameContextString() {
        if (this.gameContext.length === 0) {
            return "This is the start of a new game session.";
        }
        
        let contextStr = "Recent game session context:\n\n";
        
        this.gameContext.forEach((entry, index) => {
            contextStr += `[${index + 1}] Player: ${entry.command}\n`;
            contextStr += `Game: ${entry.output}\n\n`;
        });
        
        return contextStr.trim();
    }

    // Generate a robot response for direct conversation
    async generateDirectRobotResponse(robotName, command) {
        if (!this.enabled || !this.openai || !this.robotPrompts.has(robotName)) {
            return null;
        }

        try {
            const robotPrompt = this.robotPrompts.get(robotName);
            const gameContext = this.buildGameContextString();
            const maxTokens = parseInt(process.env.MAX_AI_TOKENS) || 150;
            const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
            
            const completion = await this.openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: `${robotPrompt}\n\nIMPORTANT: You are currently in an active game session. Use the game context below to understand the current situation and respond appropriately as ${robotName}.`
                    },
                    {
                        role: 'user',
                        content: `${gameContext}\n\n---\n\nThe player is now speaking directly to you: "${command}"\n\nRespond as ${robotName} in character, taking into account the current game situation shown in the context above. This is a conversation, not a game command.`
                    }
                ],
                max_tokens: maxTokens,
                temperature: 0.8
            });
            
            return completion.choices[0]?.message?.content;
            
        } catch (error) {
            console.error('OpenAI API error for direct response:', error.message);
            return null;
        }
    }

    // Format AI response to match game output structure
    formatAIResponse(aiResponse, originalOutput) {
        // If we have an AI response, format it like the game output
        if (aiResponse && typeof aiResponse === 'string') {
            const lines = aiResponse.split('\n').filter(line => line.trim() !== '');
            return {
                pretty: lines,
                full: aiResponse
            };
        }
        
        // Return original output if no AI response
        return originalOutput;
    }

    async processGameOutput(command, output, skipAI = false) {
        console.log(`🔍 Processing command: "${command}" with output:`, typeof output, output);
        
        // Always add to context (unless it's the initial skip)
        if (!skipAI && command && output) {
            this.addToGameContext(command, output);
        }
        
        if (!this.enabled || skipAI) {
            console.log('❌ AI enhancement not enabled or skipped, returning original output');
            return output;
        }
        
        // Extract string from output structure
        let outputStr = '';
        if (output && output.pretty && Array.isArray(output.pretty)) {
            outputStr = output.pretty.join('\n');
        } else if (typeof output === 'string') {
            outputStr = output;
        } else {
            outputStr = String(output || '');
        }
        
        // Check if the game failed to understand a robot command
        const directRobotCommand = this.isDirectRobotCommand(command);
        console.log('🤖 Direct robot command detected:', directRobotCommand);
        
        // Only use AI when the game parser fails to understand
        if (directRobotCommand && (
            outputStr.includes("I don't know the word") ||
            outputStr.includes("I don't understand") ||
            outputStr.includes("Huh?") ||
            outputStr.includes("You can't see any such thing") ||
            outputStr.includes("I don't see") ||
            outputStr.includes("That's not a verb I recognize")
        )) {
            console.log(`🎯 Game parser failed for robot command, generating AI response for ${directRobotCommand.robotName}`);
            const aiResponse = await this.generateDirectRobotResponse(directRobotCommand.robotName, directRobotCommand.directCommand);
            if (aiResponse) {
                console.log(`✅ Generated AI response: "${aiResponse}"`);
                // Update context with AI response instead of the error
                this.gameContext[this.gameContext.length - 1].output = aiResponse;
                return this.formatAIResponse(aiResponse, output);
            }
        }
        
        // If the game successfully handled the command, don't modify its output
        console.log('✅ Game handled command successfully, preserving original output');
        
        console.log('➡️  No enhancement needed, returning original output');
        return output;
    }
}

module.exports = RobotAIEnhancement;