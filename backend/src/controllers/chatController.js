import { executeModelChain, callGroqStream } from '../model-router/orchestrator.js';
import Profile from '../models/Profile.js';
import ChatSession from '../models/ChatSession.js';

// @desc    Converse with medical AI agent tracking persistent session state strings natively
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message Payload Empty' });
    if (!req.user?._id) return res.status(401).json({ message: 'Unauthorized session.' });

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile Linkage Error.' });

    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
    }
    
    if (!session) {
      session = await ChatSession.create({ user: req.user._id, messages: [] });
    }

    // Determine if this is the first assistant response (Initial user msg = 1)
    const isFirstResponse = session.messages.length === 0;

    session.messages.push({ role: 'user', content: message });
    await session.save();

    const systemInstruction = `You are PulsePo!nt's Cognitive Diagnostic Partner—a helpful, friendly health guide for non-medical users. 
Talking to: ${profile.fullName}.
CRITICAL CONVERSATIONAL RULES:
${isFirstResponse ? '1. ALWAYS start your response with a unique, interesting, and relatable health fact or physiological insight.\n2. Follow the fact with a warm greeting.' : '1. Provide a warm, brief greeting and skip the initial health fact.'}
3. Explain medical concepts in plain English using simple analogies.
4. DO NOT use markdown bolding (no **). DO NOT use markdown italics (no *). All text must be plain.
5. For numbered lists: Start each item on a NEW LINE. Add a BLANK LINE between each numbered item (double-spacing).
6. Ask the user what else they want to know at the end of every response.`;

    const promptText = `USER: ${message}\n\nASSISTANT:`;
    const aiRawReply = await executeModelChain('AI_DOCTOR', promptText, systemInstruction);
    console.log(`[ChatController] Raw AI Response Length: ${aiRawReply?.length || 0}`);

    // Final Sanitization: Strip all markdown artifacts and ensure plain text
    // Aggressively trim to remove leading newlines
    const cleanedReply = aiRawReply
      .replace(/<think>[\s\S]*?<\/think>/g, '') // Remove reasoning blocks
      .replace(/```json[\s\S]*?```|```[\s\S]*?```/g, '') // Remove code blocks if model hallucinates them
      .replace(/\*\*|\*/g, '') // Remove bold/italic artifacts
      .trim();

    console.log(`[ChatController] Cleaned Reply Length: ${cleanedReply.length}`);

    session.messages.push({ role: 'assistant', content: cleanedReply });
    await session.save();

    res.json({ sessionId: session._id, reply: cleanedReply });
  } catch (error) {
    res.status(500).json({ message: 'Chat Engine Context Fault', error: error.message });
  }
};

export const streamMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message Payload Empty' });
    if (!req.user?._id) return res.status(401).json({ message: 'Unauthorized session.' });

    const profile = await Profile.findOne({ user: req.user._id });
    let session = sessionId ? await ChatSession.findById(sessionId) : null;
    
    if (!session) {
      session = await ChatSession.create({ user: req.user._id, messages: [] });
    }

    // Context-Aware: 1st message only
    const isFirstResponse = session.messages.length === 0;

    session.messages.push({ role: 'user', content: message });
    await session.save();

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemInstruction = `You are PulsePo!nt's Cognitive Diagnostic Partner—a helpful, friendly health guide for non-medical users. 
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

    await callGroqStream(promptText, systemInstruction, 'qwen/qwen3-32b', (chunk) => {
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
