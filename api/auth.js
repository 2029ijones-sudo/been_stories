const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

function generatePersonalityVector() {
  return {
    curiosity: 0.8 + Math.random() * 0.2,
    nostalgia: 0.7 + Math.random() * 0.3,
    wisdom: 0.6 + Math.random() * 0.4,
    playfulness: 0.4 + Math.random() * 0.3,
    patience: 0.9 + Math.random() * 0.1,
    creativity: 0.7 + Math.random() * 0.3,
    currentEmotion: selectRandomEmotion(),
    knowledgeBias: {
      family: 0.7 + Math.random() * 0.3,
      technology: 0.8 + Math.random() * 0.2,
      war: 0.4 + Math.random() * 0.3,
      philosophy: 0.6 + Math.random() * 0.4,
      history: 0.7 + Math.random() * 0.2,
      science: 0.6 + Math.random() * 0.3
    }
  };
}

function selectRandomEmotion() {
  const emotions = [
    'curious', 'nostalgic', 'contemplative', 'amused', 
    'pensive', 'passionate', 'reflective', 'wistful',
    'enthusiastic', 'skeptical', 'approving', 'surprised'
  ];
  return emotions[Math.floor(Math.random() * emotions.length)];
}

async function handleAuth(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const userId = `user_${Buffer.from(email).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data: existingUser, error: checkError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError);
    }

    if (!existingUser || existingUser.length === 0) {
      const conversationId = `${userId}_chat_${Date.now()}`;
      
      const { error: createError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          conversation_id: conversationId,
          metadata: {
            personalityVector: generatePersonalityVector(),
            shortTermMemory: [],
            longTermMemory: [],
            conversationalDepth: 0,
            interactionCount: 0
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        console.error('Error creating user conversation:', createError);
      }
    }

    return res.status(200).json({
      success: true,
      userId: userId,
      sessionId: sessionId,
      email: email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    });
  }
}

module.exports = handleAuth;
