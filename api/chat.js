// This is the single API endpoint for the Grand's Stories application
// It handles all chat interactions with Benn Cortigan

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, chatHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process the message and generate Benn's response
    const response = generateBennResponse(message, chatHistory);

    // Return the response
    return res.status(200).json({
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      response: "Hmm, something's not connecting right. Must be a loose wire in the old logic board. Could you ask me again?"
    });
  }
};

// The core logic for generating Benn's responses
function generateBennResponse(userMessage, chatHistory) {
  const message = userMessage.toLowerCase().trim();
  
  // Benn's response patterns - organized by topic
  const responses = {
    // Greetings and general
    greetings: [
      "Ah, there you are. Good to see you again.",
      "Well hello there. The old clock's still ticking, and so am I.",
      "You're back. Good. I was just thinking about the time I tried to explain recursion to my dog.",
    ],
    
    // Family related
    family: [
      "The family? Oh, Martha's the rock. Put up with me and my scribblings for 62 years. Ten daughters, twelve sons. The youngest, Finn, he's 12. Sits with me sometimes.",
      "My Elara, she's 17. Wants to be a poet. I tell her poetry is just code for the soul. No compiler errors, just feelings.",
      "58 grandkids. A whole flock. They think I'm a fossil. I tell 'em my first computer had valves you could warm your hands on.",
    ],
    
    // Martha specifically
    martha: [
      "Martha? Bless her soul. She's the real miracle. Built her a 'memory lattice' once. Program that learned patterns of our home. Could predict when a child would wake up fussy.",
      "For Martha, I built something that mattered. Not for the government. Not for a prize. For her. It would turn on a hall light, start a kettle... simple things.",
      "The wife says supper's soon. Probably pudding. Everything's pudding now.",
    ],
    
    // War stories
    war: [
      "The war... I don't dwell on it much. Signal Corps. Saw things... The code we broke, messages in the static... it was all patterns. Life and death, reduced to patterns in the noise.",
      "Maybe that's why, after the war, I wanted to make patterns that created things. Not destruction.",
      "We listened to the static... waiting for patterns to emerge. Like debugging the universe.",
    ],
    
    // Coding and projects
    code: [
      "My treatise on recursive neural networks... in FORTRAN. Wrote it in '74. Nobody knew what the hell I was on about.",
      "Built a weather simulator in '68. Ran on a machine with less power than a lightbulb. Took three days to render a storm. They called it Cortigan's Folly.",
      "The memory lattice... that was my masterpiece. Could learn patterns. When a child cried, it noted the time, temperature... After a month, 80% accuracy.",
      "Object-oriented programming to a pigeon. It was a very good listener.",
      "Debugged a program by listening to the rhythm of the card reader. Kids today with their silent tablets... they don't know the symphony of the machine room.",
    ],
    
    // Technology then vs now
    technology: [
      "Kids today have the universe in their pocket. What are they using it for? Social media? Just a giant, noisy punch card party with worse manners.",
      "My first computer had valves. Warm like a kitten. These new quantum things... just fancy probability gates. Fancy dice rolls.",
      "We had more civility in a batch processing queue than your modern internet.",
    ],
    
    // Health and age
    health: [
      "The body's compiler is failing, bit by bit. Memory leaks everywhere. But the source code... the source code is still clean.",
      "Doctor says my heart's a miracle. I tell him it's stubbornness. Too much to keep track of.",
      "The mind's sharp as a tack. Shame the body didn't get the memo.",
    ],
    
    // General wisdom and philosophy
    wisdom: [
      "The fancy tools change. The reason you use them shouldn't.",
      "Build something that matters. Something that helps. Something quiet and kind, like a light in a hall.",
      "It's all just fancy lambda calculus in the end.",
      "We were stitching logic into the fabric of everyday life. No one saw the thread. They just felt the warmth.",
    ],
    
    // Default responses when no specific match
    default: [
      "That reminds me of the time... oh, never mind. The memory's not what it was. Ask me about the old days, the code, the family.",
      "Hmm. You know, in my day, we'd have to think about that for a good long while. No instant answers.",
      "Let me think... The patterns are there, just have to find them.",
    ]
  };

  // Check for specific keywords and patterns
  if (containsAny(message, ['hello', 'hi', 'hey', 'greetings'])) {
    return selectResponse(responses.greetings);
  }
  
  if (containsAny(message, ['wife', 'martha', 'spouse', 'married'])) {
    return selectResponse(responses.martha);
  }
  
  if (containsAny(message, ['family', 'kids', 'children', 'grandkids', 'son', 'daughter', 'elara', 'finn'])) {
    return selectResponse(responses.family);
  }
  
  if (containsAny(message, ['war', 'military', 'army', 'signal', 'corps', 'soldier'])) {
    return selectResponse(responses.war);
  }
  
  if (containsAny(message, ['code', 'program', 'computer', 'fortran', 'lisp', 'algorithm', 'debug', 'hack', 'project', 'build', 'software'])) {
    return selectResponse(responses.code);
  }
  
  if (containsAny(message, ['tech', 'technology', 'quantum', 'modern', 'phone', 'tablet', 'internet', 'ai'])) {
    return selectResponse(responses.technology);
  }
  
  if (containsAny(message, ['health', 'sick', 'old', 'age', 'body', 'mind', 'doctor', 'hospital'])) {
    return selectResponse(responses.health);
  }
  
  if (containsAny(message, ['why', 'purpose', 'meaning', 'life', 'work', 'build', 'create'])) {
    return selectResponse(responses.wisdom);
  }
  
  // Check chat history for continuity
  const lastBennMessage = getLastBennMessage(chatHistory);
  if (lastBennMessage) {
    // If Benn was talking about something specific, continue the thread
    if (lastBennMessage.includes('memory lattice') && containsAny(message, ['how', 'what', 'work', 'function'])) {
      return "The memory lattice? It was simple, really. Just watched. Noticed patterns. When the furnace kicked on, the noise sometimes woke the baby. So it would turn on a nightlight beforehand. Like having a ghost butler, Martha said.";
    }
    
    if (lastBennMessage.includes('FORTRAN') && containsAny(message, ['why', 'how', 'what'])) {
      return "FORTRAN was the language of truth. No nonsense. Just clean, mathematical logic. These new languages... so much sugar. Might as well be candy.";
    }
  }
  
  // Default response
  return selectResponse(responses.default);
}

// Helper function to check if message contains any of the keywords
function containsAny(message, keywords) {
  return keywords.some(keyword => message.includes(keyword));
}

// Helper function to select a random response from an array
function selectResponse(responseArray) {
  const randomIndex = Math.floor(Math.random() * responseArray.length);
  return responseArray[randomIndex];
}

// Helper function to get the last message from Benn in chat history
function getLastBennMessage(chatHistory) {
  if (!Array.isArray(chatHistory)) return null;
  
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    if (chatHistory[i].role === 'benn') {
      return chatHistory[i].content.toLowerCase();
    }
  }
  return null;
}
