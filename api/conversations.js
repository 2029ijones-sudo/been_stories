const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

async function handleConversations(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, action = 'list' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (action === 'list') {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('conversation_id, metadata, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({ error: 'Failed to fetch conversations' });
      }

      const conversationsWithCounts = await Promise.all(
        (conversations || []).map(async (conv) => {
          const { count: messageCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.conversation_id);

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, role, created_at')
            .eq('conversation_id', conv.conversation_id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            id: conv.conversation_id,
            title: conv.metadata?.title || `Conversation ${conv.conversation_id.split('_').pop()}`,
            preview: lastMessage?.[0]?.content?.substring(0, 50) + (lastMessage?.[0]?.content?.length > 50 ? '...' : '') || 'Start chatting...',
            message_count: messageCount || 0,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            metadata: conv.metadata
          };
        })
      );

      return res.status(200).json({
        success: true,
        userId: userId,
        conversations: conversationsWithCounts,
        count: conversationsWithCounts.length
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Conversations error:', error);
    return res.status(500).json({ 
      error: 'Failed to process conversations request',
      details: error.message 
    });
  }
}

module.exports = handleConversations;
