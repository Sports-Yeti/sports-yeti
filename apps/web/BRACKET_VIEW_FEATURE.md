# Bracket View Feature

## Overview
Interactive tournament bracket visualization for elimination-style tournaments. Allows administrators to view game schedules in a traditional tournament bracket format with visual progression through rounds.

## Features

### Toggle Between Views
- **List View**: Traditional table format showing all games with detailed information
- **Bracket View**: Visual tournament bracket showing game progression
- Easy toggle button with icons for quick switching

### Bracket Display
- **Round Organization**: Games automatically organized by round
- **Visual Progression**: Clear lines showing advancement through bracket
- **Team Matchups**: Each match box displays both teams
- **Score Display**: Shows final scores for completed games
- **Winner Highlighting**: Winning teams highlighted with success color
- **Status Indicators**: Color-coded chips showing game status
  - Completed (green)
  - In Progress (blue)
  - Scheduled (gray)

### Round Naming
- **Automatic Round Labels**:
  - Finals (last round)
  - Semi-Finals (2nd to last)
  - Quarter-Finals (3rd to last)
  - Round 1, 2, 3... (earlier rounds)
- **Champion Display**: Special gold champion box for tournament winner

### Bracket Layout
- **Responsive Spacing**: Match boxes properly spaced based on round
- **Connector Lines**: Visual lines connecting matches to next round
- **Scrollable**: Horizontal scroll for large brackets
- **Professional Styling**: Clean, modern Material-UI design

## Supported Formats
- ✅ **Single Elimination**: Traditional knockout bracket
- ✅ **Double Elimination**: With losers bracket (planned)
- ❌ **Round Robin**: List view only (not bracket-compatible)
- ❌ **Swiss System**: List view only (not bracket-compatible)

## UI Components

### Match Box
```
┌─────────────────────┐
│ Team A         65   │ ← Winner (highlighted)
├─────────────────────┤
│ Team B         52   │
└─────────────────────┘
```

### Championship Box
```
┌─────────────────────┐
│        🏆           │
│     CHAMPION        │
│                     │
│   Winning Team      │
└─────────────────────┘
```

## Technical Implementation

### Component Structure
- `BracketView.tsx` - Main bracket visualization component
- Integrates with `GameSchedulingPage.tsx`
- Uses Material-UI components for styling

### Data Organization
- Games grouped by round number
- Matches organized into bracket structure
- Winner determination based on scores
- TBD placeholders for未scheduled matches

### Layout Algorithm
- Dynamic spacing based on round depth
- Match height: `120px * 2^roundIndex`
- Match margin: `60px * 2^roundIndex - 60px`
- Proper vertical alignment for bracket progression

## Usage

### Accessing Bracket View
1. Navigate to **Leagues** → Select a league
2. Click **"Manage Schedule"**
3. Configure season format as "Single Elimination" or "Double Elimination"
4. Generate or create games
5. Click the **Bracket toggle** button

### Creating Bracket-Ready Schedule
1. Set **Season Format** to "Single Elimination"
2. Click **"Auto-Generate Schedule"**
3. Review and confirm generation
4. Switch to **Bracket view** to see tournament structure

### Manual Bracket Setup
1. Create games manually with round numbers
2. Assign teams to appropriate seed positions
3. Set round numbers correctly (1, 2, 3, Finals)
4. Games will automatically organize into bracket

## Visual Features

### Color Coding
- **Green**: Completed games with winner
- **Blue**: Games in progress
- **Gray**: Scheduled/upcoming games
- **Gold**: Championship/winner box
- **Light Green**: Winning team background

### Interactive Elements
- Horizontal scroll for large brackets
- Status chips on each match
- Clear visual hierarchy
- Responsive spacing

## Future Enhancements

### Planned Features
1. **Click to View/Edit**: Click match to see/edit game details
2. **Double Elimination**: Full implementation with losers bracket
3. **Seeding Display**: Show seed numbers for each team
4. **Date/Time Overlay**: Show game schedule on bracket
5. **Live Updates**: Real-time bracket updates during games
6. **Print View**: Optimized layout for printing
7. **Full Screen Mode**: Dedicated bracket viewer
8. **Export Bracket**: Download as image/PDF

### Advanced Features
1. **Bracket Animation**: Animate winner progression
2. **Team Logos**: Display team logos in match boxes
3. **Score Entry**: Direct score input from bracket view
4. **Predictions**: Allow predictions overlay
5. **Historical View**: Compare multiple tournament brackets

## Integration Points

### With Game Management
- Click "Edit" in list view to modify games
- Changes reflect immediately in bracket view
- Auto-generate respects bracket structure

### With Game Reports
- Referee submissions update bracket scores
- Winner determined automatically from scores
- Status changes reflected in real-time

### With League Configuration
- Season format determines bracket availability
- Number of teams affects bracket size
- Round robin/Swiss formats show list view only

## Best Practices

### Tournament Setup
1. Always use powers of 2 for team count (4, 8, 16, 32)
2. Set season format before generating schedule
3. Assign round numbers sequentially
4. Review bracket before publishing to teams

### Game Management
1. Keep list view for detailed editing
2. Use bracket view for visual overview
3. Complete games in round order
4. Update scores promptly for live brackets

## Examples

### 8-Team Single Elimination
```
Round 1      Quarter-Finals    Semi-Finals      Finals      Champion
────────     ──────────────    ───────────      ──────      ────────
Seed 1 ─┐
        ├─ Winner 1 ─┐
Seed 8 ─┘            │
                     ├─ Winner 5 ─┐
Seed 4 ─┐            │            │
        ├─ Winner 2 ─┘            │
Seed 5 ─┘                         ├─ Winner 7 ─→ Champion
                                  │
Seed 3 ─┐                         │
        ├─ Winner 3 ─┐            │
Seed 6 ─┘            │            │
                     ├─ Winner 6 ─┘
Seed 2 ─┐            │
        ├─ Winner 4 ─┘
Seed 7 ─┘
```

## Troubleshooting

### Bracket Not Showing
- Check season format is "Single Elimination" or "Double Elimination"
- Ensure games have round numbers assigned
- Verify games exist in the system

### Incorrect Layout
- Check round numbers are sequential
- Ensure game data is properly loaded
- Refresh page if data updated

### Missing Teams
- Verify team assignments in game data
- Check team names are populated
- Ensure games are properly created

---

**Status**: ✅ Implemented and tested
**Build**: ✅ Successful
**Ready**: ✅ Production-ready
