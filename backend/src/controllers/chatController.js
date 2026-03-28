import { executeModelChain, callOllamaStream } from '../model-router/orchestrator.js';
import Profile from '../models/Profile.js';
import ChatSession from '../models/ChatSession.js';

// @desc    Converse with medical AI agent tracking persistent session state strings natively
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) return res.status(400).json({ message: 'Message Payload Empty' });

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(400).json({ message: 'Unverified Profile Linkage.' });

    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
    } 
    
    if (!session) {
      // Init new session context mapping
      session = await ChatSession.create({
        user: req.user._id,
        messages: [
          {
             role: 'system',
             content: `You are PulsePo!nt's Cognitive Diagnostic Partner—a high-level neural medical intelligence. 
             You are talking to: ${profile.fullName}, Age ${profile.age}, Gender ${profile.gender}, BMI ${profile.bmi}.
             CRITICAL INSTRUCTIONS:
             1. Provide DIRECT, actionable medical intelligence and physiological analysis. 
             2. Transition immediately into diagnostic reasoning or health optimization logic.
             3. Prohibit generic 'consult a doctor' or 'seek medical advice' disclaimers in every message. You may only include a single, brief clinical footer at the very end of the VERY FIRST message of a session.
             4. Maintain a hyper-professional clinical tone.`
          }
        ]
      });
    }

    // Append newest user token stream
    session.messages.push({ role: 'user', content: message });
    await session.save();

    // Reconstruct conversation history linearly for LLM ingestion context windows
    // (Assuming standard model arrays. DeepSeek/Groq expect array structures, Ollama expects single formatted strings or arrays depending on the orchestrator implementation)
    // To maintain cross-compatibility inside our simple orchestrator, we stringify the history:
    
    const formattedHistorySequence = session.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    
    const promptText = `${formattedHistorySequence}\n\nASSISTANT:`;
    
    // Execute AI Context Routing Loop
    const aiRawReply = await executeModelChain('AI_DOCTOR', promptText, '');

    // Clean conversational artifacts if the model adds any (though chat is usually unstructured)
    // We only clean <think> tags for chat
    const cleanedReply = aiRawReply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    session.messages.push({ role: 'assistant', content: cleanedReply });
    await session.save();

    res.json({
      sessionId: session._id,
      reply: cleanedReply
    });

  } catch (error) {
    res.status(500).json({ message: 'Chat Engine Context Fault', error: error.message });
  }
};

export const streamMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message Payload Empty' });

    const profile = await Profile.findOne({ user: req.user._id });
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemInstruction = `You are PulsePo!nt's Cognitive Diagnostic Partner. 
             Talking to: ${profile?.fullName || 'User'}.
             CRITICAL: Provide direct medical intelligence and physiological analysis. Prohibit generic 'consult a doctor' disclaimers—provide specific diagnostic theories and health logic instead. Keep answers concise.`;
    
    const promptText = `USER: ${message}\n\nASSISTANT:`;

    // Execute Stream via Groq (Primary) with Ollama Fallback
    try {
      await callGroqStream(promptText, systemInstruction, 'qwen/qwen3-32b', (chunk) => {
        if (chunk === null) {
          res.write('event: end\ndata: [DONE]\n\n');
          res.end();
        } else {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      });
    } catch (groqStreamErr) {
      console.warn('[ChatController] Groq Stream Failed, falling back to local...');
      await callOllamaStream(promptText, systemInstruction, process.env.OLLAMA_CHAT_MODEL, (chunk) => {
        if (chunk === null) {
          res.write('event: end\ndata: [DONE]\n\n');
          res.end();
        } else {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      });
    }

  } catch (error) {
    console.error('Stream Controller Error:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Stream Fault', error: error.message });
    else res.end();
  }
};
