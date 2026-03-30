# SCSS Conversion Guide

## Completed SCSS Partials

✅ `_variables.scss` - Colors, spacing, breakpoints, shadows
✅ `_animations.scss` - Pulse animation
✅ `_buttons.scss` - All button variants
✅ `_components.scss` - Shared UI components
✅ `_sign-up.scss` - Landing page styles
✅ `_play.scss` - Game page and bingo grid
✅ `_leaderboard.scss` - Leaderboard page
✅ `_admin.scss` - Admin dashboard
✅ `style.scss` - Main stylesheet (imports all)

## Files to Convert (Tailwind → SCSS)

### Priority 1: Page Files
- [ ] `app/page.tsx` (Landing/Sign-up)
- [ ] `app/play/page.tsx` (Game page)
- [ ] `app/leaderboard/page.tsx` (Leaderboard)
- [ ] `app/admin/page.tsx` (Admin dashboard)

### Priority 2: Components
- [ ] `components/BingoGrid.tsx`
- [ ] `components/BingoSquare.tsx`
- [ ] `components/NameInputModal.tsx`
- [ ] `components/ProgressTracker.tsx`

## Quick Reference: Tailwind → SCSS Class Mappings

### Layout & Containers
- `min-h-screen` → `.loading-screen`, `.play-page`, `.leaderboard-page`, etc.
- `max-w-*` → `.container`, `.container--narrow`, `.container--wide`
- `flex items-center justify-center` → Component-specific classes
- `p-4, py-8, px-4` → Built into component classes

### Buttons
- `bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:...` → `.btn.btn--primary`
- `bg-blue-600 text-white rounded-lg` → `.btn.btn--blue`
- `bg-red-600 text-white` → `.btn.btn--danger`
- `border-2 border-gray-300 text-gray-700` → `.btn.btn--secondary`
- `px-6 py-2` → `.btn` (default)
- `px-6 py-3` → `.btn.btn--lg`
- `w-full` → `.btn.btn--full`
- `disabled:...` → Built into `.btn:disabled`

### Cards & Sections
- `bg-white rounded-2xl shadow-xl p-6` → `.card`
- `bg-white rounded-xl shadow p-6` → `.stat-card`
- Winner cards → `.winner-card`, `.winner-card--purple`

### Typography
- `text-4xl md:text-5xl font-bold` → `.page-header__title`
- `text-gray-600` → Component-specific classes
- `text-lg, text-xl, text-2xl` → Component-specific

### Tables
- `overflow-x-auto` → `.table__container`
- `bg-gray-50` thead → `.table__head`
- Table structure → `.table`, `.table__head`, `.table__body`

### Progress & Status
- Progress bars → `.progress`, `.progress__bar`, `.progress__label`
- Badges → `.badge.badge--yellow`, `.badge--purple`, etc.

### Grids
- `grid md:grid-cols-2 gap-6` → `.grid.grid--2`
- `grid md:grid-cols-3` → `.grid.grid--3`

### Loading & Errors
- Loading spinner → `.loading-screen`, `.spinner`
- Error display → `.error`, `.error__card`, `.error__message`

## Next Steps

1. Convert `app/page.tsx` (Landing) - Use `.sign-up` classes
2. Convert `app/play/page.tsx` - Use `.play-page`, `.bingo-*` classes
3. Convert `app/leaderboard/page.tsx` - Use `.leaderboard-*` classes
4. Convert `app/admin/page.tsx` - Use `.admin-*` classes
5. Convert components - Use component-specific classes from `_play.scss` and `_components.scss`

## Example Conversion

### Before (Tailwind):
```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
    Click Me
  </button>
</div>
```

### After (SCSS):
```tsx
<div className="play-page">
  <button className="btn btn--blue">
    Click Me
  </button>
</div>
```

All hover states, transitions, and responsive behavior are built into the SCSS classes!
