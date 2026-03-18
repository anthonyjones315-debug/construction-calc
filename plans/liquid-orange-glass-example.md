# Liquid Orange Glass Design System - Practical Examples

This document provides concrete examples showing how the design system would be applied to the Construction Calculator UI components.

## Calculator Card Example

```jsx
<div className="glass-card animate-fade-up">
  <div className="flex items-center mb-4">
    <div className="mr-4 p-3 rounded-full bg-surface-elevated backdrop-glass flex-shrink-0">
      <Calculator className="w-6 h-6 text-orange-light" />
    </div>
    <div>
      <h3 className="text-heading text-xl">Wall Framing Calculator</h3>
      <p className="text-secondary text-sm">Stud count, board feet, cost</p>
    </div>
  </div>

  <div className="space-y-4 mb-6">
    <div className="glass-panel">
      <div className="text-input-label">Wall Length</div>
      <div className="flex">
        <input
          type="number"
          className="glass-input w-full"
          placeholder="Enter length"
        />
        <select className="glass-input ml-2 w-24">
          <option value="ft">ft</option>
          <option value="m">m</option>
        </select>
      </div>
    </div>

    <div className="glass-panel">
      <div className="text-input-label">Wall Height</div>
      <div className="flex">
        <input
          type="number"
          className="glass-input w-full"
          placeholder="Enter height"
        />
        <select className="glass-input ml-2 w-24">
          <option value="ft">ft</option>
          <option value="m">m</option>
        </select>
      </div>
    </div>

    <div className="glass-panel">
      <div className="text-input-label">Stud Spacing</div>
      <select className="glass-input w-full">
        <option value="16">16" on center</option>
        <option value="24">24" on center</option>
        <option value="12">12" on center</option>
        <option value="19.2">19.2" on center</option>
      </select>
    </div>
  </div>

  <div className="flex justify-end">
    <button className="glass-button mr-2">Reset</button>
    <button className="glass-button-primary rim-light-active">Calculate</button>
  </div>
</div>
```

## Results Panel Example

```jsx
<div className="glass-container-elevated p-6 animate-fade-up">
  <h2 className="text-heading text-2xl mb-4">Wall Framing Results</h2>

  <div className="glass-panel-deep mb-4 p-4">
    <div className="flex justify-between items-center">
      <span className="text-secondary">Total Studs Required</span>
      <span className="text-primary-bold text-xl">24</span>
    </div>
  </div>

  <div className="glass-panel-deep mb-4 p-4">
    <div className="flex justify-between items-center">
      <span className="text-secondary">Board Feet</span>
      <span className="text-primary-bold text-xl">96 ft²</span>
    </div>
  </div>

  <div className="glass-panel-deep mb-4 p-4">
    <div className="flex justify-between items-center">
      <span className="text-secondary">Estimated Cost</span>
      <span className="text-accent text-xl font-semibold">$216.48</span>
    </div>
  </div>

  <div className="flex justify-end mt-6">
    <button className="glass-button mr-2">Edit</button>
    <button className="glass-button mr-2">
      <span className="flex items-center">
        <FileDown className="w-4 h-4 mr-1" />
        Save PDF
      </span>
    </button>
    <button className="glass-button-primary">
      <span className="flex items-center">
        <ShoppingCart className="w-4 h-4 mr-1" />
        Materials
      </span>
    </button>
  </div>
</div>
```

## Modal Dialog Example

```jsx
<div className="glass-modal-overlay">
  <div className="glass-modal">
    <div className="glass-modal-header">
      <div className="flex items-center justify-between">
        <h2 className="text-heading text-xl">Save Estimate</h2>
        <button className="text-ink-dim hover:text-ink">
          <XCircle className="w-6 h-6" />
        </button>
      </div>
    </div>

    <div className="space-y-4 mb-6">
      <div>
        <div className="text-input-label">Estimate Name</div>
        <input
          type="text"
          className="glass-input w-full"
          placeholder="My Wall Framing Estimate"
        />
      </div>

      <div>
        <div className="text-input-label">Client Name</div>
        <input
          type="text"
          className="glass-input w-full"
          placeholder="Enter client name"
        />
      </div>

      <div>
        <div className="text-input-label">Job Site Address</div>
        <textarea
          className="glass-input w-full h-20"
          placeholder="Enter job site address"
        ></textarea>
      </div>
    </div>

    <div className="glass-modal-footer">
      <button className="glass-button mr-2">Cancel</button>
      <button className="glass-button-primary rim-light-active">
        <span className="flex items-center">
          <Save className="w-4 h-4 mr-1" />
          Save Estimate
        </span>
      </button>
    </div>
  </div>
</div>
```

## Navigation Example

```jsx
<nav className="glass-nav">
  <a href="/calculators/framing" className="glass-nav-item active">
    <span className="flex items-center">
      <HardHat className="w-4 h-4 mr-1" />
      Framing
    </span>
  </a>
  <a href="/calculators/concrete" className="glass-nav-item">
    <span className="flex items-center">
      <Layers className="w-4 h-4 mr-1" />
      Concrete
    </span>
  </a>
  <a href="/calculators/roofing" className="glass-nav-item">
    <span className="flex items-center">
      <Gauge className="w-4 h-4 mr-1" />
      Roofing
    </span>
  </a>
  <a href="/calculators/drywall" className="glass-nav-item">
    <span className="flex items-center">
      <SquareStack className="w-4 h-4 mr-1" />
      Drywall
    </span>
  </a>
</nav>
```

## Responsive Design Layouts

### Mobile Layout (iPhone 15)

```jsx
<div className="app-shell h-screen overflow-hidden">
  <header className="shell-header h-[--shell-header-h] backdrop-glass-heavy border-b border-white/5">
    <div className="container mx-auto flex items-center justify-between px-4 h-full">
      <div className="flex items-center">
        <HardHat className="w-5 h-5 text-orange-light mr-2" />
        <span className="text-heading">Pro Calc</span>
      </div>
      <button className="glass-button p-2">
        <Menu className="w-5 h-5" />
      </button>
    </div>
  </header>

  <main className="shell-content">
    <div className="view-container h-[var(--content-max-h)]">
      <div className="view active animated-gradient-bg">
        <div className="scroll-container p-4">
          {/* Calculator content would go here */}
          <div className="glass-container mb-4 p-4">{/* Input fields */}</div>

          <div className="glass-container-elevated p-4">{/* Results */}</div>
        </div>

        <div className="critical-ui-container backdrop-glass-heavy border-t border-white/5 p-4">
          <div className="flex justify-between">
            <button className="glass-button">Reset</button>
            <button className="glass-button-primary rim-light-active">
              Calculate
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer className="shell-footer h-[--shell-footer-h] backdrop-glass-heavy border-t border-white/5 safe-area-pb">
    <div className="container mx-auto flex items-center justify-around h-full">
      <a href="/calculators" className="text-orange-light">
        <Calculator className="w-5 h-5" />
      </a>
      <a href="/estimates" className="text-ink-dim">
        <FileSpreadsheet className="w-5 h-5" />
      </a>
      <a href="/materials" className="text-ink-dim">
        <ShoppingCart className="w-5 h-5" />
      </a>
      <a href="/profile" className="text-ink-dim">
        <CircleDollarSign className="w-5 h-5" />
      </a>
    </div>
  </footer>
</div>
```

### Desktop Layout

```jsx
<div className="app-shell h-screen overflow-hidden">
  <header className="shell-header h-[--shell-header-h] backdrop-glass-heavy border-b border-white/5">
    <div className="container mx-auto flex items-center justify-between px-6 h-full">
      <div className="flex items-center">
        <HardHat className="w-6 h-6 text-orange-light mr-2" />
        <span className="text-heading text-xl">
          Pro Construction Calculator
        </span>
      </div>
      <nav className="glass-nav">
        <a href="/calculators" className="glass-nav-item active">
          <Calculator className="w-4 h-4 mr-1" />
          <span>Calculators</span>
        </a>
        <a href="/estimates" className="glass-nav-item">
          <FileSpreadsheet className="w-4 h-4 mr-1" />
          <span>Estimates</span>
        </a>
        <a href="/materials" className="glass-nav-item">
          <ShoppingCart className="w-4 h-4 mr-1" />
          <span>Materials</span>
        </a>
        <a href="/profile" className="glass-nav-item">
          <CircleDollarSign className="w-4 h-4 mr-1" />
          <span>Business</span>
        </a>
      </nav>
    </div>
  </header>

  <main className="shell-content animated-gradient-bg">
    <div className="container mx-auto p-6 h-full flex">
      <div className="w-1/3 pr-6">
        <div className="glass-container p-6 h-full">
          {/* Calculator inputs */}
        </div>
      </div>
      <div className="w-2/3">
        <div className="glass-container-elevated p-6 h-full">
          {/* Results and visualization */}
        </div>
      </div>
    </div>
  </main>

  <footer className="shell-footer h-[--shell-footer-h] backdrop-glass-heavy border-t border-white/5">
    <div className="container mx-auto flex items-center justify-between px-6 h-full">
      <div className="text-ink-dim text-sm">
        © 2026 Pro Construction Calculator
      </div>
      <div>
        <button className="glass-button p-2">
          <span className="flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1" />
            <span>Contact Support</span>
          </span>
        </button>
      </div>
    </div>
  </footer>
</div>
```

## Initial State to Results State Transition

```jsx
// Initial State with Cross-Dissolve Transition
function CalculatorView() {
  const [calculationComplete, setCalculationComplete] = useState(false);

  return (
    <div className="view-container">
      {/* Input View (fades out when calculation is complete) */}
      <div className={`view ${!calculationComplete ? "active" : ""}`}>
        <div className="glass-container p-6">
          {/* Input fields */}
          <button
            className="glass-button-primary mt-4"
            onClick={() => setCalculationComplete(true)}
          >
            Calculate
          </button>
        </div>
      </div>

      {/* Results View (fades in when calculation is complete) */}
      <div className={`view ${calculationComplete ? "active" : ""}`}>
        <div className="glass-container-elevated p-6">
          {/* Results content */}
          <button
            className="glass-button mt-4"
            onClick={() => setCalculationComplete(false)}
          >
            Edit Inputs
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Animated Rim Light Effect (CSS Implementation)

```css
@keyframes rimLight {
  0% {
    box-shadow: 0 0 0 1px rgba(255, 122, 0, 0.2);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(255, 122, 0, 0.4),
      0 0 4px rgba(255, 122, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 0 1px rgba(255, 122, 0, 0.2);
  }
}

.glass-button-primary.active {
  animation: rimLight 0.8s infinite alternate;
  position: relative;
  overflow: hidden;
}

/* Add rim light glow from top edge */
.glass-button-primary.active::after {
  content: "";
  position: absolute;
  top: 0;
  left: 25%;
  width: 50%;
  height: 2px;
  background: rgba(255, 122, 0, 0.8);
  box-shadow: 0 0 8px 1px rgba(255, 122, 0, 0.4);
  animation: rimLight 0.8s infinite alternate;
}
```

## Contrast Ratio Verification Example

```javascript
// Utility function to calculate contrast ratio
function getContrastRatio(color1, color2) {
  // Calculate relative luminance of a color in sRGB space
  const getLuminance = (color) => {
    // Parse color to RGB
    let r, g, b;

    if (color.startsWith("rgb")) {
      const match = color.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
      );
      if (match) {
        [, r, g, b] = match.map(Number);
      }
    } else if (color.startsWith("#")) {
      const hex = color.substring(1);
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    // Normalize RGB values
    r /= 255;
    g /= 255;
    b /= 255;

    // Convert to sRGB
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  // Calculate contrast ratio
  const ratio =
    (Math.max(luminance1, luminance2) + 0.05) /
    (Math.min(luminance1, luminance2) + 0.05);

  return ratio;
}

// Example usage for the design system's text colors
const designSystemContrasts = {
  "Primary on Surface Deep": getContrastRatio(
    "#f8fafc",
    "rgba(2, 6, 23, 0.95)",
  ),
  "Secondary on Surface Base": getContrastRatio(
    "rgba(255, 255, 255, 0.8)",
    "rgba(15, 23, 42, 0.85)",
  ),
  "Orange Light on Surface Deep": getContrastRatio(
    "rgba(255, 153, 51, 1)",
    "rgba(2, 6, 23, 0.95)",
  ),
  "Input Text on Input BG": getContrastRatio(
    "rgba(0, 0, 0, 0.9)",
    "rgba(255, 255, 255, 0.95)",
  ),
};

console.table(designSystemContrasts);
```

## Fallback for Browsers Without Backdrop Filter

```jsx
// Feature detection utility
function supportsBackdropFilter() {
  return (
    'backdropFilter' in document.documentElement.style ||
    '-webkit-backdrop-filter' in document.documentElement.style
  );
}

// React component with fallback
function GlassContainer({ children, className = '' }) {
  const hasBackdropSupport = supportsBackdropFilter();

  return (
    <div className={`
      ${hasBackdropSupport ? 'backdrop-glass' : 'no-backdrop-fallback'}
      glass-container
      ${className}
    `}>
      {children}
    </div>
  );
}

// CSS for fallback
/*
.no-backdrop-fallback {
  background: rgba(15, 23, 42, 0.9); /* Darker background when no blur */
  border: 1px solid rgba(255, 255, 255, 0.12); /* Slightly more visible border */
}
*/
```

These examples demonstrate how the Liquid Orange Glass design system would be implemented in actual UI components, providing a roadmap for developers to follow during implementation.
