# Light/Dark Mode Implementation Guide

## Overview
A complete light/dark theme system has been implemented using React Context, CSS Variables, and localStorage persistence.

## Files Created/Modified

### 1. **ThemeContext.jsx** (New Context)
- Location: `src/contexts/ThemeContext.jsx`
- Manages theme state (light/dark)
- Persists theme preference to localStorage
- Respects system dark mode preference as fallback
- Default theme: dark (cinema app theme)

### 2. **ThemeToggle.jsx** (New Component)
- Location: `src/components/ThemeToggle.jsx`
- Day/Night icon button (☀️ for light mode, 🌙 for dark mode)
- Circular button with hover effects
- Added to Header for easy access
- Features:
  - Smooth icon transitions
  - Pulse animation on toggle
  - Accessible (aria-label, keyboard support)
  - Responsive sizing

### 3. **_theme-toggle.scss** (New Styles)
- Location: `src/styles/_theme-toggle.scss`
- Button styling with:
  - Circular design (50px × 50px)
  - Hover effects with color transitions
  - Scale animations on click
  - Icon rotation animation
  - Mobile responsive (45px on smaller screens)

### 4. **_theme-variables.css** (New CSS Variables)
- Location: `src/styles/_theme-variables.css`
- Defines CSS custom properties for both themes
- Variables include:
  - Backgrounds: primary, secondary, tertiary, card, hover
  - Text: primary, secondary, tertiary, muted, disabled
  - Borders: normal, light
  - Overlays and effects
  - Primary color (yellow/gold)
  - Status colors (success, error, warning, info)

### 5. **App.jsx** (Modified)
- Wrapped with `<ThemeProvider>`
- Imported `_theme-variables.css`
- Maintains Router and other providers

### 6. **Header.jsx** (Modified)
- Added `ThemeToggle` component import
- Placed toggle button in header-buttons section
- Positioned before notifications and user menu

## Theme System Details

### Dark Mode (Default)
- Background: `hsl(0, 0%, 7%)` (very dark)
- Text: `hsl(0, 0%, 95%)` (very light)
- Primary: `hsl(51, 100%, 70%)` (gold/yellow)
- Optimized for cinema app aesthetic

### Light Mode
- Background: `hsl(0, 0%, 98%)` (off-white)
- Text: `hsl(0, 0%, 10%)` (almost black)
- Primary: `hsl(51, 100%, 50%)` (bright gold)
- High contrast for readability

## Usage in Components

To use theme-aware colors in your components:

```jsx
// In a component
import { useContext } from "react";
import ThemeContext from "../contexts/ThemeContext";

function MyComponent() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <div style={{ color: "var(--color-text-primary)" }}>
      Current theme: {theme}
    </div>
  );
}
```

## CSS Variables Available

### Backgrounds
- `--color-bg-primary`
- `--color-bg-secondary`
- `--color-bg-tertiary`
- `--color-bg-card`
- `--color-hover-bg`

### Text
- `--color-text-primary`
- `--color-text-secondary`
- `--color-text-tertiary`
- `--color-text-muted`
- `--color-text-disabled`

### Borders & Overlays
- `--color-border`
- `--color-border-light`
- `--color-overlay`
- `--color-overlay-light`

### Status Colors
- `--color-primary`
- `--color-primary-dark`
- `--color-primary-light`
- `--color-success`
- `--color-error`
- `--color-warning`
- `--color-info`

## How It Works

1. **Initial Load**: Theme preference is loaded from localStorage or system settings
2. **Toggle**: Clicking the sun/moon button triggers `toggleTheme()`
3. **Update**: `data-theme` attribute is set on `<html>` element
4. **Persistence**: Theme choice is saved to localStorage
5. **CSS Cascade**: All CSS variables update based on the `data-theme` attribute

## Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Variables supported in all modern browsers
- localStorage for persistence (IE11+ with polyfill)

## Future Enhancements

1. **Auto-switching**: Set theme to match system preference at specific times
2. **Animated Transitions**: Add transition effects when switching themes
3. **Theme Customization**: Allow users to customize individual colors
4. **Additional Themes**: Add more theme options (e.g., high contrast, cinema purple)
5. **Schedule-based**: Automatically switch to dark mode at sunset

## Testing the Feature

1. Click the sun/moon icon in the top-right header
2. Watch all colors smoothly transition
3. Refresh the page - your theme preference persists
4. Open DevTools to see `data-theme="dark"` or `data-theme="light"` on the html element
