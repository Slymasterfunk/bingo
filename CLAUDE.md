# Networking Bingo - Interactive Icebreaker Game

## Project Overview

Build an interactive networking bingo web app for an Alamo Tech Collective × Geeks && {...} collaboration event. Players scan a QR code, play bingo on their mobile devices by meeting people who match networking prompts, and compete for prizes via a live leaderboard.

**Expected Attendees:** ~40 people  
**Target Audience:** Software developers and creatives  
**Deployment:** Vercel  
**Event Type:** Networking icebreaker

---

## Technical Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API or Zustand
- **Database:** Vercel KV (Redis) for leaderboard
- **Deployment:** Vercel
- **QR Code:** qrcode.react or next-qrcode

---

## Core Features

### 1. Landing Page
- Event co-branding (ATC × Geeks && {...})
- Brief instructions on how to play
- Player name input
- "Start Playing" button → generates unique player ID
- Mobile-first responsive design

### 2. Bingo Card (5×5 Grid)
- 25 squares total
- **Card randomization:** Each player gets prompts in a different random order (no two cards are the same)
- Center square (position 12) is ALWAYS a FREE SPACE (pre-marked), regardless of randomization
- Each square displays a networking prompt
- Tap square → modal opens to enter the name of person found
- Visual states:
  - Unmarked (default)
  - Marked (filled with person's name)
  - Winning pattern highlighted
- Progress tracker: "X/24 squares completed"
- localStorage persistence (survive page refreshes)

### 3. Win Detection
**Two Prize Categories:**
1. **First Row/Column/Diagonal** - First person to complete any line
2. **Blackout** - First person to complete entire card (all 24 squares + free space)

**Winning Patterns (12 total):**
- 5 horizontal rows
- 5 vertical columns
- 2 diagonals

**Client-side:** Detect wins and show celebration
**Server-side:** Validate and claim prizes (first-come-first-served)

### 4. Leaderboard
- Real-time standings showing all active players
- Display:
  - Player name
  - Number of squares completed
  - Whether they have a row
  - Whether they achieved blackout
- Winners frozen with timestamp
- Auto-refresh every 5-10 seconds
- Accessible at `/leaderboard`

### 5. Admin Panel (Optional)
- Route: `/admin`
- Password-protected (environment variable)
- Features:
  - View all active players
  - See real-time leaderboard
  - Reset game for new event
  - Download results as CSV
  - Monitor submissions

---

## Bingo Prompts (25 Total)

**Important:** The prompts below are the master list. Each player's card will have these prompts in a **randomized order**, except the FREE SPACE which is always at the center (index 12).

```typescript
const BINGO_PROMPTS = [
  "Find someone who has contributed to open source",
  "Find someone who uses Vim (or Emacs)",
  "Find someone who's spoken at a conference",
  "Find someone who works remotely full-time",
  "Find someone who's built something with AI/ML",
  
  "Find someone who's designed a logo or brand",
  "Find someone who knows 3+ programming languages",
  "Find someone who's attended 3+ ATC events",
  "Find someone who's participated in a hackathon",
  "Find someone who's from outside Texas",
  
  "Find someone who's created digital art or illustrations",
  "Find someone who's worked in game development",
  "FREE SPACE", // This will always be placed at index 12
  "Find someone who's led a team or mentored others",
  "Find someone who's launched their own product/startup",
  
  "Find someone who does photography or videography",
  "Find someone who's changed careers into tech",
  "Find someone who's written technical documentation",
  "Find someone who uses Linux as their daily driver",
  "Find someone who's debugged code at 3 AM",
  
  "Find someone who's worked with VR/AR",
  "Find someone who's created music or sound design",
  "Find someone who's competed in a CTF competition",
  "Find someone who's presented at ATC before",
  "Find someone who's built a mobile app"
];

// Card Randomization Algorithm
function generateRandomCard(): string[] {
  // Get all prompts except FREE SPACE
  const nonFreePrompts = BINGO_PROMPTS.filter(p => p !== "FREE SPACE");
  
  // Fisher-Yates shuffle
  const shuffled = [...nonFreePrompts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Insert FREE SPACE at center position (index 12)
  const card = [...shuffled.slice(0, 12), "FREE SPACE", ...shuffled.slice(12)];
  
  return card;
}
```

### Why Randomization Matters
- **Prevents collaboration/copying:** Players can't just copy their neighbor's answers
- **Increases networking:** Players must talk to different people to find different prompts
- **Fair competition:** Everyone has an equal chance at winning, no "lucky card" advantage
- **Replayability:** Same event, different experience for each player

---

## Project Structure

```
networking-bingo/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── play/page.tsx                 # Main bingo game
│   ├── leaderboard/page.tsx          # Live leaderboard
│   ├── admin/page.tsx                # Admin dashboard
│   ├── layout.tsx                    # Root layout
│   └── api/
│       ├── submit-row/route.ts       # Claim row prize
│       ├── submit-blackout/route.ts  # Claim blackout prize
│       ├── leaderboard/route.ts      # Get current standings
│       └── update-progress/route.ts  # Update player progress
├── components/
│   ├── BingoGrid.tsx                 # Main grid component
│   ├── BingoSquare.tsx               # Individual square
│   ├── NameInputModal.tsx            # Modal for entering names
│   ├── Leaderboard.tsx               # Leaderboard display
│   ├── WinnerCelebration.tsx         # Confetti/celebration
│   ├── ProgressTracker.tsx           # Shows X/24 completed
│   └── Header.tsx                    # Co-branded header
├── lib/
│   ├── bingoPrompts.ts               # Array of 25 prompts
│   ├── winDetection.ts               # Win pattern checking
│   ├── redis.ts                      # Vercel KV client
│   ├── types.ts                      # TypeScript interfaces
│   └── utils.ts                      # Helper functions
├── hooks/
│   ├── useLocalStorage.ts            # Persist game state
│   └── useLeaderboard.ts             # Fetch leaderboard data
├── public/
│   ├── logo-atc.svg                  # ATC logo
│   ├── logo-geeks.svg                # Geeks && {...} logo
│   └── qr-code.svg                   # Generated QR code
├── .env.local                        # Environment variables
└── tailwind.config.ts                # Tailwind configuration
```

---

## Data Models

### Client-Side (localStorage)

```typescript
interface GameState {
  playerId: string;           // UUID v4
  playerName: string;
  cardPrompts: string[];      // Randomized array of 25 prompts (FREE SPACE always at index 12)
  cardState: SquareState[];   // Array of 25
  hasClaimedRow: boolean;
  hasClaimedBlackout: boolean;
  createdAt: number;          // Timestamp
}

interface SquareState {
  index: number;              // 0-24
  prompt: string;             // From cardPrompts[index]
  marked: boolean;
  personName: string | null;
}

// When creating a new game:
const newGame: GameState = {
  playerId: generateUUID(),
  playerName: userInput,
  cardPrompts: generateRandomCard(), // Each player gets unique order
  cardState: generateInitialCardState(),
  hasClaimedRow: false,
  hasClaimedBlackout: false,
  createdAt: Date.now()
};
```

### Server-Side (Vercel KV)

```typescript
interface Winners {
  firstRow: Winner | null;
  blackout: Winner | null;
}

interface Winner {
  playerId: string;
  playerName: string;
  timestamp: number;
}

interface PlayerProgress {
  playerId: string;
  playerName: string;
  completedSquares: number;   // 0-24
  hasRow: boolean;
  hasBlackout: boolean;
  lastUpdate: number;
}

// Redis Keys:
// - "winners" → Winners object
// - "players:{playerId}" → PlayerProgress
// - "leaderboard" → sorted set by completedSquares
```

---

## Win Detection Algorithm

```typescript
// Winning patterns (0-indexed positions)
const WINNING_PATTERNS = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
];

function checkForWin(cardState: SquareState[]): {
  hasRow: boolean;
  hasBlackout: boolean;
  winningPattern: number[] | null;
} {
  // Check each pattern
  for (const pattern of WINNING_PATTERNS) {
    const allMarked = pattern.every(index => cardState[index].marked);
    if (allMarked) {
      return { 
        hasRow: true, 
        hasBlackout: false,
        winningPattern: pattern 
      };
    }
  }
  
  // Check blackout (all 25 marked)
  const allMarked = cardState.every(square => square.marked);
  if (allMarked) {
    return { 
      hasRow: true, 
      hasBlackout: true,
      winningPattern: null 
    };
  }
  
  return { hasRow: false, hasBlackout: false, winningPattern: null };
}
```

---

## API Routes

### POST `/api/submit-row`
**Purpose:** Claim the "first row" prize

**Request:**
```json
{
  "playerId": "uuid",
  "playerName": "John Doe",
  "cardState": [...],
  "winningPattern": [0, 1, 2, 3, 4]
}
```

**Response:**
```json
{
  "success": true,
  "isWinner": true,
  "message": "Congratulations! You're the first to get a row!"
}
```

**Logic:**
1. Validate winning pattern on server
2. Check if prize already claimed (Redis atomic check)
3. If unclaimed, set winner and return success
4. If already claimed, return isWinner: false

### POST `/api/submit-blackout`
**Purpose:** Claim the "blackout" prize

**Request/Response:** Similar to submit-row

### GET `/api/leaderboard`
**Purpose:** Get current standings

**Response:**
```json
{
  "winners": {
    "firstRow": { "playerName": "Alice", "timestamp": 1234567890 },
    "blackout": null
  },
  "players": [
    {
      "playerId": "uuid",
      "playerName": "Bob",
      "completedSquares": 18,
      "hasRow": true,
      "hasBlackout": false
    }
  ]
}
```

### POST `/api/update-progress`
**Purpose:** Update player progress for leaderboard

**Request:**
```json
{
  "playerId": "uuid",
  "playerName": "Carol",
  "completedSquares": 12,
  "hasRow": false,
  "hasBlackout": false
}
```

---

## UI/UX Requirements

### Mobile-First Design
- Optimized for phone screens (320px - 428px)
- Large tap targets (min 44×44px)
- Readable font sizes (16px minimum)
- Easy one-handed operation

### Color Scheme
- Primary: ATC brand colors + Geeks && {...} brand colors
- Unmarked square: light gray
- Marked square: green/blue gradient
- Winning pattern: gold highlight
- Free space: distinct color (e.g., purple)

### Animations
- Smooth square marking transition
- Confetti on row completion
- Bigger celebration on blackout
- Leaderboard update fade-in

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- High contrast mode compatible
- Screen reader friendly

---

## Development Phases

### Phase 1: MVP (Core Functionality)
**Goal:** Get basic game working locally

- [ ] Initialize Next.js project with TypeScript + Tailwind
- [ ] Create card randomization utility (`generateRandomCard()`)
- [ ] Create bingo grid component (5×5)
- [ ] Implement square tap → modal → name input
- [ ] Mark square as completed
- [ ] Free space (index 12) auto-marked on all randomized cards
- [ ] localStorage persistence (including randomized card order)
- [ ] Win detection (client-side)
- [ ] Basic styling
- [ ] Test that cards are actually randomized (no two the same)

**Deliverable:** Playable bingo game (no leaderboard yet)

### Phase 2: Leaderboard System
**Goal:** Add competitive element

- [ ] Set up Vercel KV (Redis)
- [ ] Create API routes (submit-row, submit-blackout, leaderboard)
- [ ] Implement prize claiming logic (first-come-first-served)
- [ ] Build leaderboard page with auto-refresh
- [ ] Add progress updates to leaderboard
- [ ] Winner validation (prevent duplicate claims)

**Deliverable:** Full multiplayer experience with prizes

### Phase 3: Polish & Branding
**Goal:** Production-ready

- [ ] Landing page with instructions
- [ ] Co-branded header (ATC × Geeks && {...})
- [ ] Celebration animations (confetti, etc.)
- [ ] Mobile responsive refinements
- [ ] Generate QR code for event
- [ ] Error handling & loading states
- [ ] Admin panel (optional)

**Deliverable:** Deployment-ready app

### Phase 4: Testing & Launch
**Goal:** Ensure stability

- [ ] Test with 5-10 beta users
- [ ] Load testing (~50 concurrent users)
- [ ] Fix bugs and edge cases
- [ ] Deploy to Vercel
- [ ] Generate final QR code
- [ ] Print QR code materials

**Deliverable:** Live app ready for event

---

## Environment Variables

```bash
# .env.local

# Vercel KV (Redis)
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token

# Admin password
ADMIN_PASSWORD=your_secure_password

# App URL (for QR code generation)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Key Implementation Details

### Card Randomization

**When it happens:**
- Card is randomized once when player first starts the game
- The randomized order is saved to localStorage
- If player refreshes, they see the SAME randomized card (not re-randomized)

**How it works:**
```typescript
// lib/utils.ts
export function generateRandomCard(): string[] {
  const FREE_SPACE = "FREE SPACE";
  const CENTER_INDEX = 12;
  
  // All prompts except FREE SPACE
  const allPrompts = BINGO_PROMPTS.filter(p => p !== FREE_SPACE);
  
  // Fisher-Yates shuffle for true randomization
  const shuffled = [...allPrompts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Insert FREE SPACE at center (index 12)
  const card = [
    ...shuffled.slice(0, CENTER_INDEX),
    FREE_SPACE,
    ...shuffled.slice(CENTER_INDEX)
  ];
  
  return card; // Array of 25 prompts in random order
}

// Usage in game initialization
const cardPrompts = generateRandomCard();
const cardState = cardPrompts.map((prompt, index) => ({
  index,
  prompt,
  marked: prompt === "FREE SPACE", // Auto-mark free space
  personName: prompt === "FREE SPACE" ? "Free!" : null
}));
```

**Testing randomization:**
```typescript
// Verify cards are actually different
const card1 = generateRandomCard();
const card2 = generateRandomCard();
const card3 = generateRandomCard();

// These should NOT be equal (except center square)
console.log(card1.join(',') === card2.join(',')); // Should be false
console.log(card1[12] === card2[12]); // Should be true (both "FREE SPACE")
```

**Edge cases:**
1. **What if two players get identical cards by chance?**
   - With 24! (factorial) possible arrangements, probability is astronomically low
   - With 40 players, chance of any two matching ≈ 0.00000000000000000001%
   - No need to prevent this, but could add card hash to localStorage for debugging

2. **Player starts game, closes browser, comes back**
   - localStorage preserves their exact card order
   - No re-randomization on return

3. **Player wants to "reset" their card**
   - Admin can add a "Get New Card" button that clears localStorage
   - Useful if testing or if player leaves early and someone else takes their device

### Preventing Cheating
1. **Server-side validation:** Always re-check winning patterns on the server
2. **One claim per player:** Track `hasClaimedRow` and `hasClaimedBlackout` in localStorage and Redis
3. **Atomic operations:** Use Redis transactions for first-to-claim logic
4. **Rate limiting:** Prevent spam submissions (max 1 submission per 5 seconds)

### Offline Resilience
1. **localStorage primary:** Game state survives page refreshes
2. **Queue submissions:** If offline, queue leaderboard updates
3. **Retry logic:** Automatically retry failed API calls
4. **User feedback:** Show "Submitting..." / "Failed to submit" states

### Race Conditions
1. **Atomic Redis operations:** Use `SETNX` or Lua scripts
2. **Timestamp tiebreaker:** If two players submit at exact same millisecond
3. **Optimistic UI:** Show "Checking if you're first..." message

### Performance
1. **Debounce leaderboard updates:** Don't spam API on every square mark
2. **Polling interval:** 10 seconds for leaderboard refresh (not real-time WebSockets)
3. **Lazy load admin panel:** Code-split admin routes
4. **Optimize images:** Use WebP format for logos

---

## Pre-Event Checklist

**2 Weeks Before:**
- [ ] Complete development
- [ ] Deploy to Vercel production
- [ ] Test on multiple devices (iOS Safari, Android Chrome)
- [ ] Generate QR code with production URL
- [ ] Share test link with event organizers

**1 Week Before:**
- [ ] Print QR code signs/flyers
- [ ] Create instructional slide for event presentation
- [ ] Prepare physical prizes
- [ ] Load test with simulated traffic
- [ ] Set up monitoring/alerts

**Day Before:**
- [ ] Reset leaderboard (admin panel)
- [ ] Verify QR code works
- [ ] Test all features one final time
- [ ] Screenshot QR code on phone (backup)

**Day Of:**
- [ ] Arrive early, test on-site WiFi
- [ ] Display QR code prominently
- [ ] Monitor admin dashboard during event
- [ ] Be ready to troubleshoot

---

## Post-Event Actions

**Immediate:**
- [ ] Announce winners publicly
- [ ] Award prizes
- [ ] Thank participants

**Within 1 Week:**
- [ ] Download results from admin panel
- [ ] Blog post/recap about the event
- [ ] Gather feedback (what worked, what didn't)
- [ ] Archive this event's data

**Future Reusability:**
- [ ] Document lessons learned
- [ ] Update prompts if needed for different audience
- [ ] Template-ize branding for easy swapping
- [ ] Create "reset for new event" workflow

---

## Common Edge Cases to Handle

1. **Player refreshes page mid-game**
   - Solution: localStorage restores full state, including their unique randomized card

2. **Two players accidentally get the same randomized card**
   - Likelihood: Astronomically low (1 in 24! ≈ 10^23)
   - Solution: Not worth preventing, but log card hash for debugging if needed

3. **Two players click "I got a row!" simultaneously**
   - Solution: Server-side atomic check, only first succeeds

4. **Player goes offline after marking squares**
   - Solution: Game continues locally, syncs when back online

5. **Player tries to claim row without actually having one**
   - Solution: Server re-validates pattern, rejects if invalid

6. **Admin accidentally resets during active event**
   - Solution: Confirmation dialog + ability to restore from backup

7. **QR code stops working (domain change, etc.)**
   - Solution: Have backup short URL, display full URL as fallback

8. **50 people try to load page at once**
   - Solution: Vercel handles this well, but test beforehand

9. **Player wants a different card / "reset" their game**
   - Solution: Add "Get New Card" button in settings that clears localStorage and re-randomizes

---

## Success Metrics

**Engagement:**
- % of attendees who scanned QR code
- Average squares completed per player
- Time to first row winner
- Time to blackout winner

**Technical:**
- Page load time < 2 seconds
- API response time < 500ms
- Zero critical errors during event
- Uptime 100% during event hours

**Social:**
- Number of new connections made
- Post-event survey feedback
- Social media mentions/shares

---

## Resources & References

**Brand Guidelines:**
- Alamo Tech Collective: https://alamotechcollective.com/about/
- Zelifcam: https://www.zelifcam.net/about-us

**Technical Docs:**
- Next.js App Router: https://nextjs.org/docs/app
- Vercel KV: https://vercel.com/docs/storage/vercel-kv
- Tailwind CSS: https://tailwindcss.com/docs
- qrcode.react: https://www.npmjs.com/package/qrcode.react

**Inspiration:**
- Bingo game mechanics: Standard 5×5 bingo rules
- Networking icebreakers: Conference/meetup best practices

---

## Contact & Support

**Event Organizers:**
- Alamo Tech Collective
- Geeks && {...}

**Developer:** [Your contact info]

**Issues During Event:**
- Monitor: `/admin` dashboard
- Backup plan: Paper bingo cards (printed from this prompt list)

---

## Final Notes

This is a **reusable system**. After the event:
1. Keep the codebase
2. Update branding/prompts for next event
3. Reset leaderboard via admin panel
4. Generate new QR code
5. Deploy and go!

The prompts can be customized for different audiences (students, designers, security professionals, etc.) by swapping the `BINGO_PROMPTS` array.

**Philosophy:** Keep it simple, make it fun, focus on connections over competition (though a little competition helps!).

---

## Quick Start Commands

```bash
# Create new Next.js project
npx create-next-app@latest networking-bingo --typescript --tailwind --app

# Install dependencies
npm install @vercel/kv zustand qrcode.react react-confetti

# Run development server
npm run dev

# Deploy to Vercel
vercel --prod
```

---

**Good luck, and may the best networker win! 🎉**

*Built with ❤️ by Alamo Tech Collective × Geeks && {...}*
