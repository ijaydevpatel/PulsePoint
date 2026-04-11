import { generateGroqIntelligence, generateGroqChat } from '../ai-services/groqService.js';
import Profile from '../models/Profile.js';
import ChatSession from '../models/ChatSession.js';

// @desc    Converse with medical AI agent tracking persistent session state strings natively
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message Payload Empty' });
    if (!req.auth?.userId) return res.status(401).json({ message: 'Unauthorized session.' });

    let profile = await Profile.findOne({ user: req.auth.userId });
    if (!profile) {
      console.warn(`[ChatEngine] Profile missing for user ${req.auth.userId}. Using Guest Baseline.`);
      profile = { fullName: 'User', age: 30, gender: 'Not Specified' };
    }

    let session = sessionId ? await ChatSession.findById(sessionId) : null;
    if (!session) {
      session = await ChatSession.create({ user: req.auth.userId, messages: [] });
    }

    const isFirstResponse = session.messages.length === 0;
    session.messages.push({ role: 'user', content: message });
    await session.save();

    const systemInstruction = `You are PulsePo!int's AI Doctor—a surgical, professional clinical partner.
Talking to: ${profile.fullName}.
RULES:
1. Provide a warm, brief professional greeting (or skip if continuing the conversation).
2. Explain medical concepts in plain English. Use simple analogies.
3. NO MARKDOWN BOLDING (**). NO ITALICS (*). Strictly plain text.
4. Each point starts on a NEW LINE.
5. Ask one meaningful follow-up question at the end.`;

    const promptText = `USER: ${message}\n\nASSISTANT:`;
    
    console.log(`[ChatController] Dispatching Qwen-3 Conversational Core...`);
    let aiResponse;
    try {
      aiResponse = await generateGroqChat(promptText, systemInstruction);
    } catch (llmErr) {
      console.error('[ChatController] LLM Protocol Fault:', llmErr.message);
      aiResponse = { text: "Neural synchronization briefly interrupted. How can I assist with your clinical optimization today?", generationTime: 0, model: 'Local Fallback' };
    }

    // ── FUZZY CLINICAL PARSER (Symptom Tab Logic) ──────────────────────────
    let cleanedReply = aiResponse.text || "";
    cleanedReply = cleanedReply.replace(/<think>[\s\S]*?(<\/think>|$)/gi, ''); // Strip thinking
    cleanedReply = cleanedReply.replace(/\\n/g, '\n'); // Convert literal \n
    cleanedReply = cleanedReply.replace(/\n{3,}/g, '\n\n'); // Normalize spacing to single empty line
    cleanedReply = cleanedReply.replace(/\*\*|\*/g, ''); // Strip markdown
    cleanedReply = cleanedReply.trim();

    session.messages.push({ role: 'assistant', content: cleanedReply });
    await session.save();

    res.json({ 
       sessionId: session._id, 
       reply: cleanedReply,
       neuralPulse: { generationTime: aiResponse.generationTime, model: aiResponse.model }
    });
  } catch (error) {
    console.error('[Chat Framework Fault]:', error);
    res.status(500).json({ message: 'The Neural Chat Engine encountered a transient sync fault. Re-establishing link...' });
  }
};

// @desc    Generate a dynamic, high-entropy clinical greeting with unique medical fact
// @route   GET /api/chat/greeting
// @access  Private
export const getGreeting = async (req, res) => {
  try {
    // Fetch user's recently shown facts to prevent repetition
    let recentFacts = [];
    let profile = null;
    if (req.auth?.userId) {
      profile = await Profile.findOne({ user: req.auth.userId });
      if (profile?.recentFacts?.length) {
        recentFacts = profile.recentFacts.slice(-20);
      }
    }

    const antiRepeatBlock = recentFacts.length > 0
      ? `\nALREADY USED FACTS (DO NOT REPEAT ANY OF THESE, NOT EVEN REPHRASED):\n${recentFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`
      : '';

    const systemInstruction = `You are PulsePo!int's Clinical Intelligence Scout.
TASK: Generate a unique medical fact and a warm greeting.

FORMAT (FOLLOW EXACTLY):
Line 1: A single paragraph starting with "Did you know..." or "Do you know..." containing a medically accurate health/physiological fact.
Line 2: (EMPTY LINE - mandatory paragraph break)
Line 3: A warm, personalized greeting asking the user what they need help with. VARY THE STYLE EVERY TIME - never use the same phrasing twice. Examples of different styles: "How can I assist your wellness journey today?", "What health question is on your mind?", "Ready to explore your health — what would you like to discuss?", "Tell me, what aspect of your health can I help with?", "What clinical insight can I provide for you today?" — but ALWAYS create a completely new variation.
Line 4: (EMPTY LINE)
Line 5: SUGGESTIONS: Suggestion 1, Suggestion 2, Suggestion 3

STRICT RULES:
- The fact MUST be strictly medical or health-related and UNIQUE.${antiRepeatBlock}
- The fact should be ONE complete paragraph (no line breaks within it).
- The greeting MUST be a DIFFERENT style/phrasing every single time. Be creative.
- Provide 3 SHORT (2-3 words) clinical query suggestions on the SUGGESTIONS line.
- NO MARKDOWN BOLDING (**). NO ITALICS (*). Plain text only.
- Keep facts highly variable (high entropy). Avoid common trivia.
- TIMESTAMP SEED (use for entropy): ${Date.now()}`;

    const promptText = "Generate a fresh clinical greeting and 3 query suggestions for a new diagnostic session.";
    
    console.log(`[ChatGreeting] Syncing with Qwen-3 Conversational Core... (${recentFacts.length} facts in anti-repeat buffer)`);
    let aiResponse;
    try {
      aiResponse = await generateGroqChat(promptText, systemInstruction);
    } catch (llmErr) {
      console.error('[ChatGreeting] LLM Protocol Fault:', llmErr.message);
      aiResponse = { text: "Did you know that your heart beats over 100,000 times a day?\n\nHow can I assist you today?\nSUGGESTIONS: Stress levels?, HRV trends?, Serum markers?", generationTime: 0, model: 'Local Fallback' };
    }
    
    // ── FUZZY CLINICAL PARSER (Symptom Tab Logic Sync) ───────────────────
    let cleanedReply = aiResponse.text || "";
    cleanedReply = cleanedReply.replace(/<think>[\s\S]*?(<\/think>|$)/gi, ''); // Strip thinking
    cleanedReply = cleanedReply.replace(/\\n/g, '\n'); // Convert literal \n
    cleanedReply = cleanedReply.replace(/\n{3,}/g, '\n\n'); // Normalize spacing
    cleanedReply = cleanedReply.replace(/\*\*|\*/g, ''); // Strip markdown

    // Extract Suggestions
    let suggestions = ["Stress levels?", "HRV trends?", "Serum markers?"];
    const suggestionMatch = cleanedReply.match(/SUGGESTIONS:\s*(.*)$/im);
    if (suggestionMatch) {
       suggestions = suggestionMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
       cleanedReply = cleanedReply.replace(/SUGGESTIONS:.*$/im, '').trim();
    }

    // Save the new fact to anti-repetition buffer (keep last 20)
    if (profile && cleanedReply) {
      // Extract just the fact portion (first line/paragraph)
      const factLine = cleanedReply.split('\n')[0].trim();
      if (factLine.length > 10) {
        const updatedFacts = [...(profile.recentFacts || []), factLine].slice(-20);
        await Profile.updateOne(
          { user: req.auth.userId },
          { $set: { recentFacts: updatedFacts } }
        );
      }
    }

    res.json({ 
       greeting: cleanedReply,
       suggestions,
       neuralPulse: { generationTime: aiResponse.generationTime, model: aiResponse.model }
    });
  } catch (error) {
    res.status(500).json({ message: 'Greeting Generation Fault', error: error.message });
  }
};

export const streamMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message Payload Empty' });
    if (!req.auth?.userId) return res.status(401).json({ message: 'Unauthorized session.' });

    let profile = await Profile.findOne({ user: req.auth.userId });
    if (!profile) {
       console.warn(`[ChatEngine] Profile missing for user ${req.auth.userId} during stream. Using Guest Baseline.`);
       profile = { fullName: 'User' };
    }

    let session = sessionId ? await ChatSession.findById(sessionId) : null;
    
    if (!session) {
      session = await ChatSession.create({ user: req.auth.userId, messages: [] });
    }

    // Context-Aware: 1st message only
    const isFirstResponse = session.messages.length === 0;

    session.messages.push({ role: 'user', content: message });
    await session.save();

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemInstruction = `You are PulsePo!int's Cognitive Diagnostic Partner—a helpful, friendly health guide for non-medical users. 
Talking to: ${profile?.fullName || 'User'}.
CRITICAL CONVERSATIONAL RULES:
${isFirstResponse ? '1. ALWAYS start your response with a unique, interesting, and relatable health fact or physiological insight.\n2. Follow the fact with a warm greeting.' : '1. Provide a warm, brief greeting and skip the health fact.'}
3. Explain everything like you are talking to someone with NO medical background. Use simple analogies.
4. DO NOT use markdown bolding (no **). DO NOT use markdown italics (no *). All text must be plain.
5. For numbered lists: Start each item on a NEW LINE. Add a BLANK LINE between each numbered item (double-spacing).
6. Ask the user what else they want to know at the end of every response.`;

    const promptText = `USER: ${message}\n\nASSISTANT:`;
    let isThinking = false;
    let accumulatedContent = '';
    let isFirstVisibleChunk = true;

    await callGroqStream(promptText, systemInstruction, 'qwen3-32b', (chunk) => {
      if (chunk === null) {
        session.messages.push({ role: 'assistant', content: accumulatedContent });
        session.save().catch(e => console.error('[Stream] Session save error:', e));
        res.write('event: end\ndata: [DONE]\n\n');
        res.end();
        return;
      }

      let content = chunk;
      content = content.replace(/\*\*|\*/g, '');

      // Handle <think> tag blocks
      if (content.includes('<think>')) {
        isThinking = true;
        content = content.split('<think>')[1] || '';
      }

      if (isThinking) {
        if (content.includes('</think>')) {
          isThinking = false;
          content = content.split('</think>')[1] || '';
        } else {
          return; // Skip thinking
        }
      }

      if (content) {
        // Strip markdown bolding artifacts immediately
        content = content.replace(/\*\*|\*/g, '');

        // Aggressively trim the very first chunk of actual content
        if (isFirstVisibleChunk) {
          const trimmed = content.trimStart();
          if (trimmed.length > 0) {
            content = trimmed;
            isFirstVisibleChunk = false;
          } else {
            // If the whole chunk was just whitespace, don't send it yet
            return;
          }
        }

        if (content) {
          accumulatedContent += content;
          res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
        }
      }
    });

  } catch (error) {
    console.error('Stream Controller Error:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Stream Narrative Fault' });
    else res.end();
  }
};
