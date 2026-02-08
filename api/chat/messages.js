const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

async function handleMessages(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, chatId, action = 'load', limit = 50 } = req.body;

    if (!userId || !chatId) {
      return res.status(400).json({ error: 'User ID and Chat ID are required' });
    }

    if (action === 'load') {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', chatId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }

      return res.status(200).json({
        success: true,
        userId: userId,
        chatId: chatId,
        messages: messages || [],
        count: messages?.length || 0
      });
    }

    if (action === 'delete') {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', chatId);

      if (deleteError) {
        console.error('Error deleting messages:', deleteError);
        return res.status(500).json({ error: 'Failed to delete messages' });
      }

      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('conversation_id', chatId)
        .eq('user_id', userId);

      if (conversationError) {
        console.error('Error deleting conversation:', conversationError);
        return res.status(500).json({ error: 'Failed to delete conversation' });
      }

      return res.status(200).json({
        success: true,
        userId: userId,
        chatId: chatId,
        message: 'Conversation and messages deleted successfully'
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Messages error:', error);
    return res.status(500).json({ 
      error: 'Failed to process messages request',
      details: error.message 
    });
  }
}

module.exports = handleMessages;
