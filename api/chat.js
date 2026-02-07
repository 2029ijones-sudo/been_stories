// This is the single API endpoint for the Grand's Stories application
// Advanced deterministic conversational engine with stateful context management

module.exports = async (req, res) => {
  // Enhanced CORS with security headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

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
    const { message, chatHistory = [], userId, chatId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Enhanced input validation
    if (message.length > 1000) {
      return res.status(400).json({ 
        error: 'Message too long',
        response: "That's quite a mouthful. In my day, we kept messages short and to the point. Like a good punch card."
      });
    }

    // Initialize conversation state manager
    const stateManager = new ConversationStateManager(userId, chatId);
    
    // Generate Benn's response with advanced context analysis
    const response = await generateAdvancedBennResponse(
      message, 
      chatHistory,
      stateManager
    );

    // Return the response with metadata
    return res.status(200).json({
      response: response.text,
      metadata: {
        topic: response.topic,
        sentiment: response.sentiment,
        continuityScore: response.continuityScore,
        responseType: response.type,
        timestamp: new Date().toISOString(),
        memoryReferences: response.memoryReferences
      }
    });

  } catch (error) {
    console.error('Advanced API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      response: "Hmm, the old relays are clicking but not connecting. Must be a loose wire in the logic board. Could you rephrase that? My memory's not what it was.",
      metadata: {
        topic: 'error',
        sentiment: 'neutral',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// ==================== ADVANCED CONVERSATION ENGINE ====================

class ConversationStateManager {
  constructor(userId, chatId) {
    this.userId = userId;
    this.chatId = chatId;
    this.conversationState = {
      currentTopic: null,
      topicHistory: [],
      emotionalState: 'neutral',
      interestLevel: 0,
      memoryStack: [],
      lastInteractionTime: Date.now(),
      userPreferences: {},
      conversationDepth: 0
    };
  }

  updateState(newTopic, sentiment, complexity) {
    this.conversationState.currentTopic = newTopic;
    this.conversationState.topicHistory.push({
      topic: newTopic,
      timestamp: Date.now(),
      duration: 0
    });
    
    if (this.conversationState.topicHistory.length > 10) {
      this.conversationState.topicHistory.shift();
    }
    
    this.conversationState.emotionalState = this.calculateEmotionalState(sentiment);
    this.conversationState.interestLevel = Math.min(100, this.conversationState.interestLevel + complexity * 10);
    this.conversationState.conversationDepth++;
    
    // Decay interest over time
    const timeSinceLast = Date.now() - this.conversationState.lastInteractionTime;
    this.conversationState.interestLevel -= Math.floor(timeSinceLast / 60000); // 1% per minute
    
    this.conversationState.lastInteractionTime = Date.now();
  }

  calculateEmotionalState(sentiment) {
    const states = ['curious', 'nostalgic', 'contemplative', 'amused', 'pensive', 'passionate'];
    const weights = {
      positive: ['amused', 'passionate'],
      neutral: ['contemplative', 'curious'],
      negative: ['pensive', 'nostalgic']
    };
    
    return weights[sentiment] 
      ? weights[sentiment][Math.floor(Math.random() * weights[sentiment].length)]
      : states[Math.floor(Math.random() * states.length)];
  }

  getTopicContinuity(currentTopic) {
    if (!this.conversationState.currentTopic) return 0;
    
    const lastTopic = this.conversationState.topicHistory[this.conversationState.topicHistory.length - 2];
    if (!lastTopic) return 0;
    
    // Calculate semantic similarity between topics
    const topics = [lastTopic.topic, currentTopic].map(t => t.toLowerCase().split(' '));
    const intersection = topics[0].filter(word => topics[1].includes(word)).length;
    const union = new Set([...topics[0], ...topics[1]]).size;
    
    return union > 0 ? intersection / union : 0;
  }
}

class SemanticAnalyzer {
  static analyzeMessage(message) {
    const cleaned = message.toLowerCase().trim();
    
    return {
      tokens: cleaned.split(/\W+/).filter(t => t.length > 2),
      containsQuestion: /^(what|who|where|when|why|how|can|could|would|will|do|does|did|is|are|was|were|tell me|explain)/i.test(message),
      sentiment: this.analyzeSentiment(cleaned),
      urgency: this.analyzeUrgency(cleaned),
      complexity: this.analyzeComplexity(cleaned),
      topics: this.extractTopics(cleaned)
    };
  }

  static analyzeSentiment(text) {
    const positive = ['love', 'great', 'amazing', 'wonderful', 'happy', 'good', 'brilliant', 'clever', 'impressive'];
    const negative = ['hate', 'terrible', 'awful', 'sad', 'bad', 'stupid', 'boring', 'depressing', 'scary'];
    
    const words = text.split(/\W+/);
    let score = 0;
    
    words.forEach(word => {
      if (positive.includes(word)) score += 1;
      if (negative.includes(word)) score -= 1;
    });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  static analyzeUrgency(text) {
    const urgent = ['urgent', 'emergency', 'help', 'now', 'immediately', 'quick', 'fast', 'asap'];
    const words = text.split(/\W+/);
    
    for (const word of words) {
      if (urgent.includes(word)) return 'high';
    }
    
    if (text.includes('?')) return 'medium';
    return 'low';
  }

  static analyzeComplexity(text) {
    const words = text.split(/\W+/);
    const avgLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const uniqueWords = new Set(words).size;
    
    let complexity = (avgLength / 10) + (uniqueWords / words.length);
    return Math.min(1, Math.max(0, complexity));
  }

  static extractTopics(text) {
    const topicKeywords = {
      family: ['wife', 'martha', 'child', 'son', 'daughter', 'grandkid', 'family', 'married', 'kid'],
      war: ['war', 'army', 'military', 'signal', 'corps', 'soldier', 'battle', 'enemy'],
      technology: ['code', 'program', 'computer', 'tech', 'algorithm', 'software', 'hardware', 'quantum', 'ai'],
      projects: ['project', 'build', 'create', 'design', 'lattice', 'simulator', 'fortran', 'lisp'],
      health: ['health', 'sick', 'old', 'age', 'body', 'mind', 'doctor', 'hospital', 'pain'],
      philosophy: ['why', 'purpose', 'meaning', 'life', 'work', 'exist', 'believe', 'think'],
      memories: ['remember', 'memory', 'past', 'story', 'time', 'when', 'then', 'old days']
    };
    
    const topics = [];
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        topics.push(topic);
      }
    }
    
    return topics.length > 0 ? topics : ['general'];
  }
}

class ResponseGenerator {
  constructor() {
    this.knowledgeBase = this.initializeKnowledgeBase();
    this.responseTemplates = this.initializeResponseTemplates();
    this.memoryFragments = this.initializeMemoryFragments();
  }

  initializeKnowledgeBase() {
    return {
      family: {
        core: [
          {id: 'f1', content: "Martha and I have been married 62 years. She's the rock that kept this ship steady through all my 'scribblings'."},
          {id: 'f2', content: "Ten daughters. Ten! The oldest is 56, youngest is 17. Elara wants to be a poet. I tell her poetry is just uncompiled emotion."},
          {id: 'f3', content: "Twelve sons. From Thomas who's a grandfather himself down to little Finn, who's 12 and thinks my punch cards are ancient history."},
          {id: 'f4', content: "58 grandkids. A whole classroom. They bring me these sleek tablets and I show them how we used to debug by listening to card readers."}
        ],
        details: [
          {id: 'fd1', trigger: ['elara'], content: "Elara's 17. Writes poetry that could make a compiler weep if it had a heart. She doesn't understand lambda calculus, but she understands the human condition."},
          {id: 'fd2', trigger: ['finn'], content: "Finn sits with me. Shows me apps on his tablet. I show him my memory lattice schematics. We meet in the middle, somewhere between silicon and soul."},
          {id: 'fd3', trigger: ['clara'], content: "Clara, she's 28. Computational linguist. The only one who understands my old Lisp code. We argue about Python's whitespace. I say it's tyranny."}
        ]
      },
      
      war: {
        core: [
          {id: 'w1', content: "Signal Corps. 1944. We listened to the static, waiting for patterns in the noise. Life and death in Morse code."},
          {id: 'w2', content: "The messages we intercepted... broken Enigma patterns... it was all just cryptography. But behind each cipher was a human story."},
          {id: 'w3', content: "After the war, I couldn't touch a radio for years. The static haunted me. Then I realized: the static was just data waiting to be understood."}
        ],
        memories: [
          {id: 'wm1', trigger: ['pattern', 'noise'], content: "There was this one night... endless static. Then a pattern emerged. Three short, three long, three short. SOS. We never found out who sent it."},
          {id: 'wm2', trigger: ['enigma', 'code'], content: "The Enigma machine... beautiful mechanical complexity creating chaos. We countered with our own complexity. Order versus chaos, reduced to rotating wheels."}
        ]
      },
      
      technology: {
        inventions: [
          {id: 't1', name: "Memory Lattice", year: 1972, content: "A predictive system for home automation. Learned patterns of family life. Could anticipate needs before they arose. Martha called it her 'ghost butler'."},
          {id: 't2', name: "Cortigan's Folly", year: 1968, content: "Weather simulation on a machine with 4KB of memory. Took 72 hours to model a thunderstorm. They laughed. Now they call it climate modeling."},
          {id: 't3', name: "Recursive Neural Networks", year: 1974, content: "Paper published in 'Journal of Computational Theory'. Written in FORTRAN. Peers called it 'science fiction'. Today it's the basis of deep learning."}
        ],
        philosophies: [
          {id: 'tp1', content: "We weren't building software. We were stitching logic into the fabric of everyday life. Invisible threads of cause and effect."},
          {id: 'tp2', content: "The tools change. FORTRAN to Lisp to Python to whatever comes next. But the logic remains. It's all just fancy lambda calculus."},
          {id: 'tp3', content: "Kids today have quantum computing in the cloud. We had vacuum tubes you could warm your hands on. Different tools, same human curiosity."}
        ]
      },
      
      personal: {
        health: [
          {id: 'h1', content: "The body's compiler has memory leaks. Garbage collection isn't what it used to be. But the source code still compiles."},
          {id: 'h2', content: "Doctor says my heart's held together by stubbornness and Scotch tape. I tell him it's optimized for longevity, not performance."}
        ],
        wisdom: [
          {id: 'wis1', content: "Build something that matters. Not for fame or money. For the quiet satisfaction of solving a human problem."},
          {id: 'wis2', content: "Technology should be like a light in the hall when you're scared in the dark. Present, helpful, unobtrusive."},
          {id: 'wis3', content: "The difference between a tool and a toy is intention. Both can be complex. Only one serves a purpose beyond itself."}
        ]
      }
    };
  }

  initializeResponseTemplates() {
    return {
      question: [
        "Now that's a question worth its weight in punch cards. {answer}",
        "Hmm. Let me dust off the old memory banks. {answer}",
        "You know, I've been thinking about that very thing. {answer}",
        "{answer} Or at least, that's how I remember it. The memory's not what it was."
      ],
      statement: [
        "That reminds me... {response}",
        "You're speaking my language. {response}",
        "Ah, yes. {response}",
        "Let me tell you something about that. {response}"
      ],
      continuation: [
        "Speaking of which... {followup}",
        "Which reminds me... {followup}",
        "That connects to something I was thinking about earlier. {followup}",
        "You know, that relates to... {followup}"
      ],
      reflection: [
        "Interesting perspective. {reflection}",
        "I've pondered that myself. {reflection}",
        "That's a pattern I've noticed too. {reflection}",
        "You're touching on something fundamental there. {reflection}"
      ]
    };
  }

  initializeMemoryFragments() {
    return [
      "The sound of the tape drives... like a mechanical symphony.",
      "Martha's laugh when the memory lattice turned on the hall light before the baby cried.",
      "Teaching Elara binary with chocolate chips. 1 meant she could eat it.",
      "The smell of ozone from the old mainframe.",
      "Debugging by candlelight during the '68 blackout.",
      "Finn's face when he realized my 'ancient' code still ran.",
      "The weight of a full box of punch cards.",
      "The click-clack of the teletype at 3 AM.",
      "Martha bringing me coffee, always knowing when I was stuck on a problem.",
      "The satisfaction of seeing my weather simulation predict actual rain."
    ];
  }

  generateResponse(analysis, state, chatHistory) {
    const {
      containsQuestion,
      sentiment,
      urgency,
      complexity,
      topics
    } = analysis;

    // Determine primary topic
    const primaryTopic = topics[0] || 'general';
    
    // Select response type based on analysis
    let responseType = 'statement';
    if (containsQuestion) responseType = 'question';
    if (state.getTopicContinuity(primaryTopic) > 0.3) responseType = 'continuation';
    if (sentiment !== 'neutral' && complexity > 0.5) responseType = 'reflection';

    // Retrieve relevant knowledge
    const knowledge = this.retrieveKnowledge(primaryTopic, analysis.tokens, chatHistory);
    
    // Select template
    const templates = this.responseTemplates[responseType];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Generate response
    let response = template.replace(/{(\w+)}/, (match, p1) => {
      switch(p1) {
        case 'answer':
        case 'response':
        case 'followup':
        case 'reflection':
          return knowledge.content;
        default:
          return knowledge.content;
      }
    });

    // Add memory fragment for depth (30% chance)
    if (Math.random() < 0.3 && this.memoryFragments.length > 0) {
      const memory = this.memoryFragments[Math.floor(Math.random() * this.memoryFragments.length)];
      response += ` ${memory}`;
    }

    // Add Benn-isms based on sentiment
    response = this.addBennisms(response, sentiment, urgency);

    // Update state
    state.updateState(primaryTopic, sentiment, complexity);

    return {
      text: response,
      topic: primaryTopic,
      sentiment: sentiment,
      continuityScore: state.getTopicContinuity(primaryTopic),
      type: responseType,
      memoryReferences: [knowledge.id]
    };
  }

  retrieveKnowledge(topic, tokens, chatHistory) {
    const kb = this.knowledgeBase[topic] || this.knowledgeBase.personal;
    
    // Check for specific triggers in details/memories
    if (kb.details || kb.memories) {
      const details = kb.details || kb.memories || [];
      for (const detail of details) {
        if (detail.trigger && detail.trigger.some(trigger => tokens.includes(trigger))) {
          return detail;
        }
      }
    }

    // Check chat history for topic continuity
    const lastTopics = this.extractTopicsFromHistory(chatHistory);
    for (const item of kb.core || kb.inventions || kb.health || kb.wisdom) {
      if (lastTopics.some(lastTopic => item.content.toLowerCase().includes(lastTopic))) {
        return item;
      }
    }

    // Return random knowledge from category
    const categories = ['core', 'inventions', 'health', 'wisdom'].filter(cat => kb[cat]);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const items = kb[randomCategory];
    
    return items[Math.floor(Math.random() * items.length)];
  }

  extractTopicsFromHistory(chatHistory) {
    if (!Array.isArray(chatHistory)) return [];
    
    const topics = new Set();
    chatHistory.slice(-5).forEach(msg => {
      if (msg.role === 'benn') {
        const words = msg.content.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        words.forEach(word => topics.add(word));
      }
    });
    
    return Array.from(topics);
  }

  addBennisms(response, sentiment, urgency) {
    const bennisms = {
      general: [
        " The old relays are still clicking.",
        " Not bad for a mind with more patches than my first OS.",
        " If memory serves. And it often doesn't these days.",
        " Pardon the old man's rambling."
      ],
      technical: [
        " That's how we did it before silicon was shiny.",
        " All just ones and zeros in the end.",
        " The logic holds, even if the hardware fails.",
        " Different architecture, same fundamental truth."
      ],
      nostalgic: [
        " The memories get fuzzy around the edges, like an old photograph.",
        " Time has a way of compressing the important bits.",
        " I remember it like it was yesterday. Or maybe last week.",
        " The past has a way of echoing in the present."
      ]
    };

    // Add a bennism (50% chance)
    if (Math.random() < 0.5) {
      let category = 'general';
      if (response.includes('code') || response.includes('program') || response.includes('computer')) {
        category = 'technical';
      } else if (response.includes('remember') || response.includes('memory') || response.includes('past')) {
        category = 'nostalgic';
      }
      
      const available = bennisms[category];
      if (available && available.length > 0) {
        response += available[Math.floor(Math.random() * available.length)];
      }
    }

    return response;
  }
}

// ==================== MAIN RESPONSE GENERATION FUNCTION ====================

async function generateAdvancedBennResponse(userMessage, chatHistory, stateManager) {
  // Initialize analyzer and generator
  const analyzer = SemanticAnalyzer;
  const generator = new ResponseGenerator();
  
  // Perform deep analysis
  const analysis = analyzer.analyzeMessage(userMessage);
  
  // Generate response
  const response = generator.generateResponse(analysis, stateManager, chatHistory);
  
  // Add contextual adaptation based on conversation depth
  const depth = stateManager.conversationState.conversationDepth;
  if (depth > 5) {
    // After 5 exchanges, Benn gets more personal
    response.text = personalizeResponse(response.text, depth);
  }
  
  // Add emotional coloring based on state
  response.text = addEmotionalColoring(
    response.text, 
    stateManager.conversationState.emotionalState
  );
  
  return response;
}

function personalizeResponse(response, depth) {
  const personalTouches = [
    " You know, I don't tell this to everyone...",
    " Between you and me...",
    " I haven't thought about this in years...",
    " This might sound strange, but..."
  ];
  
  if (depth > 10 && Math.random() < 0.4) {
    const touch = personalTouches[Math.floor(Math.random() * personalTouches.length)];
    return touch + " " + response;
  }
  
  return response;
}

function addEmotionalColoring(response, emotionalState) {
  const coloring = {
    curious: ["Fascinating.", "I wonder...", "That's curious."],
    nostalgic: ["Those were the days.", "Time marches on.", "How things change."],
    contemplative: ["Something to ponder.", "Food for thought.", "Worth considering."],
    amused: ["*chuckles*", "That's a good one.", "Heh."],
    pensive: ["Hmm.", "Let me think on that.", "Deep waters."],
    passionate: ["By God!", "Listen here...", "This is important!"]
  };
  
  if (coloring[emotionalState] && Math.random() < 0.3) {
    const color = coloring[emotionalState][Math.floor(Math.random() * coloring[emotionalState].length)];
    return response + " " + color;
  }
  
  return response;
}

// ==================== HELPER FUNCTIONS ====================

// Enhanced version for backward compatibility
function containsAny(message, keywords) {
  const words = message.toLowerCase().split(/\W+/);
  return keywords.some(keyword => 
    words.some(word => 
      word.includes(keyword.toLowerCase()) || 
      keyword.toLowerCase().includes(word)
    )
  );
}

function selectResponse(responseArray) {
  // Weighted selection based on response length and complexity
  const weights = responseArray.map((resp, index) => {
    const lengthWeight = Math.min(resp.length / 100, 0.5);
    const complexityWeight = (resp.split(/\W+/).length > 10) ? 0.3 : 0.1;
    return 0.5 + lengthWeight + complexityWeight;
  });
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) {
      return responseArray[i];
    }
    random -= weights[i];
  }
  
  return responseArray[responseArray.length - 1];
}

function getLastBennMessage(chatHistory) {
  if (!Array.isArray(chatHistory)) return null;
  
  // Look for last 3 Benn messages for better context
  const bennMessages = [];
  for (let i = chatHistory.length - 1; i >= 0 && bennMessages.length < 3; i--) {
    if (chatHistory[i].role === 'benn') {
      bennMessages.push(chatHistory[i].content.toLowerCase());
    }
  }
  
  return bennMessages.length > 0 ? bennMessages : null;
}
