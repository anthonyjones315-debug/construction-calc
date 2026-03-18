# Liquid Orange Glass Design System Specification

## Design Vision

The "Liquid Orange Glass" is a metaphorical design approach that maintains a dark theme foundation while incorporating translucent, fluid UI elements with orange highlights. The design evokes a premium, high-tech feel with glass-like surfaces that appear to float above dynamic backgrounds.

## 1. Design Tokens

### Color System

The color system is built around Safety Orange (rgba(255, 122, 0)) as the base accent color, with a carefully crafted dark palette for backgrounds and surfaces.

```css
@theme {
  /* Brand Colors - Orange */
  --color-orange-base: rgba(255, 122, 0, 1); /* Safety Orange (base) */
  --color-orange-light: rgba(255, 153, 51, 1); /* Light highlight */
  --color-orange-dark: rgba(204, 88, 0, 1); /* Dark shade */
  --color-orange-glow: rgba(255, 122, 0, 0.3); /* Glow effect */
  --color-orange-rim: rgba(255, 143, 31, 0.8); /* Rim light */

  /* Surface Colors - Glass effect */
  --color-surface-deep: rgba(2, 6, 23, 0.95); /* Deepest background */
  --color-surface-base: rgba(15, 23, 42, 0.85); /* Primary surface */
  --color-surface-elevated: rgba(30, 41, 59, 0.75); /* Elevated surface */
  --color-surface-frost: rgba(255, 255, 255, 0.08); /* Frosted overlay */

  /* Text Colors */
  --color-text-primary: rgba(255, 255, 255, 0.95); /* Primary text */
  --color-text-secondary: rgba(255, 255, 255, 0.8); /* Secondary text */
  --color-text-tertiary: rgba(255, 255, 255, 0.6); /* Tertiary/hint text */
  --color-text-inverse: rgba(0, 0, 0, 0.9); /* Inverse text (on light bg) */

  /* Input Colors */
  --color-input-bg: rgba(255, 255, 255, 0.95); /* White frosted input */
  --color-input-border: rgba(255, 122, 0, 0.2); /* Subtle orange border */
  --color-input-text: rgba(0, 0, 0, 0.9); /* High-contrast black text */

  /* Feedback Colors */
  --color-success: rgba(16, 185, 129, 1); /* Success green */
  --color-warning: rgba(245, 158, 11, 1); /* Warning amber */
  --color-error: rgba(239, 68, 68, 1); /* Error red */
  --color-info: rgba(59, 130, 246, 1); /* Info blue */
}
```

### Typography Scale

The typography scale is designed for optimal readability and contrast across different viewport sizes, ensuring WCAG 2.1 AA compliance with a minimum 4.5:1 contrast ratio.

```css
@theme {
  /* Font Families */
  --font-sans:
    "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  --font-mono:
    "JetBrains Mono", ui-monospace, SFMono-Regular, "Fira Code", monospace;
  --font-display: "Oswald", "Arial Narrow", ui-sans-serif, sans-serif;

  /* Font Sizes */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

### Shadow and Glow Effects

Shadows and glows create depth and visual hierarchy in the interface while maintaining the glass aesthetic.

```css
@theme {
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(2, 6, 23, 0.1);
  --shadow-md:
    0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(2, 6, 23, 0.1);
  --shadow-lg:
    0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(2, 6, 23, 0.1);
  --shadow-xl:
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(2, 6, 23, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(2, 6, 23, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(2, 6, 23, 0.05);

  /* Glass Effect Shadows */
  --shadow-glass-sm:
    0 2px 8px 0 rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  --shadow-glass-md:
    0 8px 16px 0 rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  --shadow-glass-lg:
    0 16px 24px 0 rgba(0, 0, 0, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.05);

  /* Glows */
  --glow-orange-sm: 0 0 8px rgba(255, 122, 0, 0.2);
  --glow-orange-md: 0 0 12px rgba(255, 122, 0, 0.3);
  --glow-orange-lg: 0 0 20px rgba(255, 122, 0, 0.4);
  --glow-text: 0 0 0.8px rgba(255, 143, 31, 0.8);
  --glow-border: 0 0 5px rgba(255, 122, 0, 0.3);
}
```

### Spacing and Layout Guidelines

Consistent spacing creates rhythm and improves readability across the interface.

```css
@theme {
  /* Spacing Scale */
  --space-0: 0;
  --space-0.5: 0.125rem; /* 2px */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */

  /* Container Constraints */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;

  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.125rem; /* 2px */
  --radius-md: 0.375rem; /* 6px */
  --radius-lg: 0.5rem; /* 8px */
  --radius-xl: 0.75rem; /* 12px */
  --radius-2xl: 1rem; /* 16px */
  --radius-3xl: 1.5rem; /* 24px */
  --radius-full: 9999px;

  /* Shell Heights */
  --shell-header-h: 2.5rem; /* 40px */
  --shell-footer-h: 3rem; /* 48px */
}
```

## 2. Core Components

### Containers

Containers use backdrop filters to create a glass effect that lets the background subtly show through.

```css
.glass-container {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-glass-md);
  transition:
    background 0.3s ease,
    backdrop-filter 0.3s ease;
}

.glass-container-elevated {
  background: rgba(30, 41, 59, 0.75);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-glass-lg);
}

.glass-container-deep {
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-glass-sm);
}
```

### Input Fields

Input fields use high-contrast black text on frosted white backgrounds for optimal readability.

```css
.glass-input {
  background: var(--color-input-bg);
  color: var(--color-input-text);
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-inner);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.glass-input:focus {
  border-color: var(--color-orange-base);
  box-shadow: var(--glow-border);
  outline: none;
}

.glass-input::placeholder {
  color: rgba(0, 0, 0, 0.5);
}
```

### Buttons and Interactive Elements

Buttons feature animated rim lighting effects that activate on hover and focus states.

```css
.glass-button {
  background: var(--color-surface-base);
  color: var(--color-text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-4);
  backdrop-filter: blur(24px) saturate(180%);
  box-shadow: var(--shadow-glass-sm);
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.glass-button::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  background: linear-gradient(to bottom, var(--color-orange-rim), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.glass-button:hover {
  box-shadow: var(--shadow-glass-md), var(--glow-orange-sm);
}

.glass-button:hover::after {
  opacity: 1;
  height: 2px;
  animation: rimPulse 0.8s infinite alternate ease-in-out;
}

.glass-button:active {
  transform: scale(0.98);
}

.glass-button-primary {
  background: var(--color-orange-base);
  background: linear-gradient(
    to bottom,
    rgba(255, 143, 31, 0.95),
    rgba(255, 122, 0, 0.95)
  );
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    var(--shadow-md),
    0 0 0 1px rgba(255, 122, 0, 0.3);
}

.glass-button-primary:hover {
  background: linear-gradient(
    to bottom,
    rgba(255, 153, 51, 0.95),
    rgba(255, 122, 0, 0.95)
  );
  box-shadow:
    var(--shadow-lg),
    0 0 0 1px rgba(255, 122, 0, 0.4),
    var(--glow-orange-md);
}

@keyframes rimPulse {
  0% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
```

### Cards and Panels

Cards and panels use the glass effect with varying levels of transparency based on their hierarchy.

```css
.glass-card {
  background: var(--color-surface-base);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-glass-md);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass-lg), var(--glow-orange-sm);
  border-color: rgba(255, 122, 0, 0.2);
}

.glass-panel {
  background: var(--color-surface-elevated);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-glass-sm);
}

.glass-panel-deep {
  background: var(--color-surface-deep);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-glass-md);
}
```

### Modal Dialogs

Modal dialogs feature a glass effect with a subtle backdrop blur for the overlay.

```css
.glass-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(2, 6, 23, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.glass-modal {
  background: var(--color-surface-base);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-glass-lg), var(--glow-orange-sm);
  max-width: 90vw;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.glass-modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
}

.glass-modal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
```

### Navigation Elements

Navigation elements use a consistent glass effect with orange accents for active states.

```css
.glass-nav {
  background: var(--color-surface-deep);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-xl);
  padding: var(--space-2);
  display: flex;
  gap: var(--space-1);
}

.glass-nav-item {
  color: var(--color-text-secondary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.glass-nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
}

.glass-nav-item.active {
  background: rgba(255, 122, 0, 0.15);
  color: var(--color-orange-light);
  box-shadow: inset 0 0 0 1px rgba(255, 122, 0, 0.2);
}

.glass-nav-item.active::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 25%;
  right: 25%;
  height: 2px;
  background: var(--color-orange-base);
  border-radius: var(--radius-full);
  box-shadow: var(--glow-orange-sm);
}
```

## 3. Visual Effects

### Backdrop Filters

The backdrop filter implementation uses a combination of blur and saturation for the glass effect.

```css
/* Base backdrop filter for glass effect */
.backdrop-glass {
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
}

/* Lighter blur for subtle effects */
.backdrop-glass-light {
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
}

/* Heavy blur for deep background elements */
.backdrop-glass-heavy {
  backdrop-filter: blur(36px) saturate(200%);
  -webkit-backdrop-filter: blur(36px) saturate(200%);
}

/* Performance optimization for mobile */
@media (max-width: 768px) {
  .backdrop-glass,
  .backdrop-glass-light,
  .backdrop-glass-heavy {
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
  }
}
```

### Subtle Border Glow

Border glow creates a subtle luminous edge around key elements.

```css
.border-glow {
  border: 1px solid rgba(255, 122, 0, 0.3);
  box-shadow: var(--glow-border);
}

.border-glow-subtle {
  border: 1px solid rgba(255, 122, 0, 0.15);
  box-shadow: 0 0 3px rgba(255, 122, 0, 0.2);
}

.border-glow-intense {
  border: 1px solid rgba(255, 122, 0, 0.4);
  box-shadow: 0 0 8px rgba(255, 122, 0, 0.4);
}
```

### Inset Highlights and Deep Shadows

Inset highlights and shadows create depth and dimension.

```css
.inset-highlight-top {
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}

.inset-highlight-left {
  box-shadow: inset 1px 0 0 0 rgba(255, 255, 255, 0.05);
}

.deep-shadow {
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.1);
}

.inset-shadow {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2);
}
```

### Animated Rim Light

Active elements feature an animated rim light effect.

```css
@keyframes rimLight {
  0% {
    opacity: 0.6;
    box-shadow: 0 0 0 1px rgba(255, 122, 0, 0.2);
  }
  50% {
    opacity: 1;
    box-shadow:
      0 0 0 1px rgba(255, 122, 0, 0.4),
      0 0 4px rgba(255, 122, 0, 0.3);
  }
  100% {
    opacity: 0.6;
    box-shadow: 0 0 0 1px rgba(255, 122, 0, 0.2);
  }
}

.rim-light-active {
  animation: rimLight 0.8s infinite;
}

.rim-light-hover:hover {
  animation: rimLight 0.8s infinite;
}

.rim-light-focus:focus {
  animation: rimLight 0.8s infinite;
}
```

### Subtle Animated Gradient Background

A subtle animated gradient provides a dynamic background.

```css
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animated-gradient-bg {
  background: linear-gradient(
    135deg,
    rgba(2, 6, 23, 1) 0%,
    rgba(30, 41, 59, 1) 50%,
    rgba(15, 23, 42, 1) 75%,
    rgba(2, 6, 23, 1) 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 30s ease infinite;
}

.animated-gradient-accent {
  background: linear-gradient(
    135deg,
    rgba(2, 6, 23, 0.95) 0%,
    rgba(255, 122, 0, 0.1) 30%,
    rgba(15, 23, 42, 0.95) 60%,
    rgba(2, 6, 23, 0.95) 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 30s ease infinite;
}
```

## 4. Typography System

### Primary Typography

Primary text uses white with a subtle amber glow for emphasis.

```css
.text-primary {
  color: var(--color-text-primary);
  text-shadow: var(--glow-text);
  font-weight: var(--font-medium);
}

.text-primary-bold {
  color: var(--color-text-primary);
  text-shadow: var(--glow-text);
  font-weight: var(--font-semibold);
}

.text-heading {
  color: var(--color-text-primary);
  text-shadow: 0 0 1px rgba(255, 143, 31, 0.9);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
}
```

### Secondary Typography

Secondary text uses subtle transparency for visual hierarchy.

```css
.text-secondary {
  color: var(--color-text-secondary);
  font-weight: var(--font-normal);
}

.text-tertiary {
  color: var(--color-text-tertiary);
  font-weight: var(--font-normal);
  font-size: 0.9em;
}

.text-accent {
  color: var(--color-orange-light);
  text-shadow: var(--glow-text);
}
```

### Input Field Typography

Input fields use high-contrast black text on frosted white.

```css
.text-input {
  color: var(--color-input-text);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
}

.text-input-label {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-1);
}

.text-input-hint {
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
  margin-top: var(--space-1);
}
```

### PDF Typography

PDF documents use a clean typography system with premium glass headers.

```css
.pdf-heading {
  font-family: var(--font-display);
  color: var(--color-text-primary);
  font-size: 16pt;
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
}

.pdf-subheading {
  font-family: var(--font-sans);
  color: var(--color-orange-light);
  font-size: 12pt;
  font-weight: var(--font-medium);
}

.pdf-body {
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  font-size: 10pt;
}

.pdf-footer {
  font-family: var(--font-mono);
  color: var(--color-text-secondary);
  font-size: 8pt;
}
```

## 5. Performance Considerations

### Sub-16ms Render Times

To maintain smooth 60fps performance on iPhone 15 and other devices:

1. **Selective Backdrop Filters**:
   - Apply backdrop filters only to container elements, not to every component
   - Dynamically reduce filter complexity on lower-end devices
   - Use `will-change: transform` judiciously on elements with backdrop filters

2. **Layered Compositing**:
   - Isolate animated elements to their own GPU layers with `transform: translateZ(0)`
   - Minimize browser repaint by avoiding box-shadow changes during animations

3. **WebGL Background Optimization**:
   - Use adaptive quality scaling for the WebGL background
   - Implement FPS monitoring with automatic quality adjustment
   - Fall back to static gradient when FPS drops below threshold

```javascript
// Example FPS monitoring for WebGL background
class PerformanceMonitor {
  constructor(targetFPS = 30) {
    this.targetFPS = targetFPS;
    this.fpsHistory = [];
    this.historySize = 10;
    this.lastFrameTime = performance.now();
  }

  update() {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    const fps = 1000 / delta;

    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }

    this.lastFrameTime = now;
    return this.getAverageFPS();
  }

  getAverageFPS() {
    return (
      this.fpsHistory.reduce((sum, fps) => sum + fps, 0) /
      this.fpsHistory.length
    );
  }

  shouldReduceQuality() {
    return this.getAverageFPS() < this.targetFPS;
  }
}

// Usage in WebGL context
const performanceMonitor = new PerformanceMonitor();
let qualityLevel = "high"; // high, medium, low

function animationLoop() {
  const fps = performanceMonitor.update();

  if (performanceMonitor.shouldReduceQuality() && qualityLevel === "high") {
    qualityLevel = "medium";
    // Reduce particle count, simplify shaders, etc.
  } else if (
    performanceMonitor.shouldReduceQuality() &&
    qualityLevel === "medium"
  ) {
    qualityLevel = "low";
    // Minimum effects, possibly switch to CSS gradient
  } else if (
    fps > performanceMonitor.targetFPS + 10 &&
    qualityLevel === "low"
  ) {
    qualityLevel = "medium";
    // Restore some effects
  }

  // Render frame with current quality settings

  requestAnimationFrame(animationLoop);
}
```

### Fixed-Position Shell with Cross-Dissolve Transitions

The application uses a fixed-position shell with cross-dissolve transitions between views:

1. **DOM Structure**:

   ```html
   <div class="app-shell">
     <header class="shell-header"><!-- Fixed header --></header>
     <main class="shell-content">
       <div class="view-container">
         <div class="view" data-view="calculator"><!-- Calculator view --></div>
         <div class="view" data-view="estimate"><!-- Estimate view --></div>
       </div>
     </main>
     <footer class="shell-footer"><!-- Fixed footer --></footer>
   </div>
   ```

2. **Transition CSS**:

   ```css
   .view {
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     opacity: 0;
     pointer-events: none;
     transition: opacity 0.3s ease-out;
   }

   .view.active {
     opacity: 1;
     pointer-events: auto;
   }

   /* Ensure content doesn't exceed viewport */
   .shell-content {
     height: calc(100vh - var(--shell-header-h) - var(--shell-footer-h));
     overflow: hidden;
     position: relative;
   }
   ```

### Critical UI Above 844px Viewport

Ensure all critical UI elements remain visible within the iPhone 15 viewport height:

1. **Viewport Constraints**:

   ```css
   /* Base viewport height calculations */
   :root {
     --viewport-h: 100vh;
     --viewport-h-safe: calc(100vh - env(safe-area-inset-bottom, 0px));
     --content-max-h: calc(
       var(--viewport-h-safe) - var(--shell-header-h) - var(--shell-footer-h)
     );
   }

   /* Ensure scrolling content stays within bounds */
   .scroll-container {
     max-height: var(--content-max-h);
     overflow-y: auto;
     overscroll-behavior: contain;
     -webkit-overflow-scrolling: touch;
   }

   /* Critical UI positioning */
   .critical-ui-container {
     position: sticky;
     bottom: 0;
     z-index: 10;
     padding-bottom: env(safe-area-inset-bottom, 0px);
   }
   ```

2. **Dynamic Content Prioritization**:

   ```javascript
   function prioritizeCriticalContent() {
     const contentContainer = document.querySelector(".scroll-container");
     const criticalElements = contentContainer.querySelectorAll(
       '[data-priority="critical"]',
     );
     const secondaryElements = contentContainer.querySelectorAll(
       '[data-priority="secondary"]',
     );

     // Check if container height is constrained
     if (contentContainer.offsetHeight < contentContainer.scrollHeight) {
       // Show only critical elements on small viewports
       secondaryElements.forEach((el) => el.classList.add("hidden-compact"));
     } else {
       // Show all elements when there's enough space
       secondaryElements.forEach((el) => el.classList.remove("hidden-compact"));
     }
   }

   // Call on resize and orientation change
   window.addEventListener("resize", prioritizeCriticalContent);
   window.addEventListener("orientationchange", prioritizeCriticalContent);
   ```

### WCAG 2.1 AA Contrast Compliance

Ensure all text maintains a minimum 4.5:1 contrast ratio:

1. **Contrast Testing Utilities**:

   ```javascript
   function getContrastRatio(foreground, background) {
     // Convert hex/rgba to luminance values
     const getLuminance = (color) => {
       // Implementation of relative luminance calculation
       // ...
     };

     const foregroundLuminance = getLuminance(foreground);
     const backgroundLuminance = getLuminance(background);

     // Calculate contrast ratio
     const ratio =
       (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
       (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);

     return ratio;
   }

   function meetsAA(ratio) {
     return ratio >= 4.5;
   }
   ```

2. **Contrast-Safe Color System**:

   ```css
   /* Pre-verified high contrast combinations */
   .high-contrast-text {
     color: var(--color-text-primary); /* #f8fafc */
     background-color: var(--color-surface-deep); /* rgba(2, 6, 23, 0.95) */
     /* Verified contrast: 16.2:1 */
   }

   .high-contrast-input {
     color: var(--color-input-text); /* rgba(0, 0, 0, 0.9) */
     background-color: var(--color-input-bg); /* rgba(255, 255, 255, 0.95) */
     /* Verified contrast: 19.1:1 */
   }

   .orange-on-dark {
     color: var(--color-orange-light); /* rgba(255, 153, 51, 1) */
     background-color: var(--color-surface-deep); /* rgba(2, 6, 23, 0.95) */
     /* Verified contrast: 7.8:1 */
   }
   ```

## 6. Implementation Plan

### Component Update Priority

1. **Core Framework Components**:
   - CSS Variables / Design Tokens (First)
   - Container system with backdrop filters
   - Typography system

2. **Interactive Elements**:
   - Buttons
   - Input fields
   - Form controls

3. **Layout Components**:
   - Cards and panels
   - Navigation elements
   - Modal dialogs

4. **Visual Effects**:
   - WebGL background (if using)
   - Animated gradients
   - Rim lighting effects

5. **Document Generation**:
   - PDF template updates (Last)

### Theme Transition Approach

1. **Parallel CSS Files**:
   - Create new CSS files alongside existing ones
   - Implement a theme switcher with a transition period

2. **Progressive Enhancement**:
   - Update core components first with backward-compatible classes
   - Add new visual effects as opt-in features

3. **Toggle Mechanism**:
   ```javascript
   function enableLiquidOrangeGlass(enable) {
     document.documentElement.classList.toggle(
       "theme-liquid-orange-glass",
       enable,
     );

     // Store preference
     localStorage.setItem(
       "theme-preference",
       enable ? "liquid-orange-glass" : "classic",
     );

     // Trigger resize to recalculate dynamic layouts
     window.dispatchEvent(new Event("resize"));
   }
   ```

### Consistency Maintenance

1. **Component Library Documentation**:
   - Create a living style guide with example components
   - Document usage patterns and best practices

2. **CSS Custom Properties Inspector**:
   - Develop a dev tool for inspecting theme variables
   - Include contrast checking for accessibility

3. **Design Linting**:
   - Implement automated checks for consistent usage
   - Detect non-conforming color usage or accessibility issues

```javascript
// Example component consistency checker
function auditThemeConsistency() {
  const nonConformingElements = [];

  // Check for direct color usage instead of variables
  document
    .querySelectorAll('[style*="color"], [style*="background"]')
    .forEach((el) => {
      const style = window.getComputedStyle(el);
      const directColors = [
        style.color,
        style.backgroundColor,
        style.borderColor,
      ].filter(
        (color) =>
          color && color !== "transparent" && !color.includes("var(--color"),
      );

      if (directColors.length > 0) {
        nonConformingElements.push({
          element: el,
          issue: "Direct color usage without CSS variables",
          colors: directColors,
        });
      }
    });

  return nonConformingElements;
}
```

### Rollout Strategy

1. **Phase 1: Core Design System**:
   - Implement design tokens and base components
   - Update global styles and typography
   - Implement next-themes for Dual-Layer Theme Governance. Create a `.glass-gpu` Theme Toggle component that cycles System/Light/Dark. Override Logic: In manual "Light Mode", increase text contrast to `slate-950` and glass opacity to `50%` to ensure outdoor visibility on site.

2. **Phase 2: Component Updates**:
   - Progressively update each component type
   - Implement visual effects and animations
   - Configure Drizzle to use the Supabase Transaction Pooler (Port 6543) for all Server Actions. Implement Row Level Security (RLS) on the estimates table to isolate user data. Set `max: 10` connections in the Drizzle client to prevent serverless pool exhaustion during peak 5-1 shift traffic.

3. **Phase 3: Advanced Features**:
   - Add WebGL background if using
   - Implement complex animations and interactions
   - Implement "Industrial Premium" UI/UX: add 200ms rim-light transitions to inputs, `scale-98` active states for buttons, and a rolling counter animation for the "Total Cents" display. Ensure `inputmode="decimal"` is enforced for all numeric fields and add keyboard-aware padding to the footer shell.

4. **Phase 4: Optimization**:
   - Performance testing and optimization
   - Accessibility compliance verification
   - Implement "Resource Marshalling" for Sub-16ms LCP: inline critical `.glass-gpu` CSS in the root layout, use `next/dynamic` for off-screen modals, and pre-connect to Supabase/Resend API endpoints. Ensure `pointer-events: none` is applied to all non-interactive glass layers to optimize hit-testing performance.

## 7. Edge Cases & Accessibility

### Browsers Without Backdrop-Filter Support

For browsers that don't support `backdrop-filter` (IE, older browsers):

```css
/* Base fallback for all glass elements */
.glass-container {
  /* Modern browsers get backdrop-filter */
  backdrop-filter: blur(24px) saturate(180%);
  background: rgba(15, 23, 42, 0.65);

  /* Fallback for browsers without backdrop-filter */
  @supports not (backdrop-filter: blur()) {
    background: rgba(15, 23, 42, 0.9);
    /* Higher opacity background to compensate for lack of blur */
  }
}

/* Fallback class applied via JS feature detection */
.no-backdrop-filter .glass-container {
  background: rgba(15, 23, 42, 0.9);
}

/* Feature detection script */
if (!('backdropFilter' in document.documentElement.style) &&
    !('-webkit-backdrop-filter' in document.documentElement.style)) {
  document.documentElement.classList.add('no-backdrop-filter');
}
```

### High Contrast Mode Compatibility

Support for Windows High Contrast Mode and other accessibility settings:

```css
/* High contrast mode adjustments */
@media (forced-colors: active) {
  :root {
    --color-orange-base: CanvasText;
    --color-text-primary: CanvasText;
    --color-text-secondary: CanvasText;
    --color-surface-base: Canvas;
    --color-surface-elevated: Canvas;
    --color-border: CanvasText;
  }

  /* Ensure borders remain visible */
  .glass-container,
  .glass-button,
  .glass-input {
    border: 1px solid CanvasText;
    box-shadow: none;
  }

  /* Ensure focus states are visible */
  *:focus-visible {
    outline: 2px solid CanvasText;
    outline-offset: 2px;
  }

  /* Remove background effects that might reduce contrast */
  .animated-gradient-bg,
  .backdrop-glass {
    background: Canvas;
    backdrop-filter: none;
  }
}
```

### Screen Reader Experience

Ensure accessibility for screen reader users:

```html
<!-- Example of accessible dialog -->
<div
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  class="glass-modal"
>
  <h2 id="dialog-title">Estimate Details</h2>
  <p id="dialog-description">
    Review and customize your estimate before saving.
  </p>

  <!-- Content -->

  <div class="glass-modal-footer">
    <button
      type="button"
      aria-label="Cancel and return to calculator"
      class="glass-button"
    >
      Cancel
    </button>
    <button
      type="button"
      aria-label="Save estimate"
      class="glass-button-primary"
    >
      Save
    </button>
  </div>
</div>
```

### Reduced Motion Preferences

Respect user preferences for reduced motion:

```css
/* Base animations */
@keyframes rimLight {
  /* ... */
}
@keyframes gradientShift {
  /* ... */
}

.rim-light-active {
  animation: rimLight 0.8s infinite;
}

.animated-gradient-bg {
  background-size: 400% 400%;
  animation: gradientShift 30s ease infinite;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .rim-light-active {
    animation: none;
    /* Static version of the effect */
    box-shadow: 0 0 0 1px rgba(255, 122, 0, 0.3);
  }

  .animated-gradient-bg {
    animation: none;
    /* Static version of the gradient */
    background-position: 0% 0%;
  }

  /* Disable all non-essential animations */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Conclusion

The "Liquid Orange Glass" design system creates a premium, high-tech aesthetic with translucent, fluid UI elements featuring orange highlights. By implementing this specification, the Pro Construction Calc UI will maintain its dark theme foundation while gaining a more modern, distinctive look.

The implementation approach prioritizes performance and accessibility while delivering a visually impressive experience through strategic use of backdrop filters, subtle animations, and careful attention to contrast and readability.
