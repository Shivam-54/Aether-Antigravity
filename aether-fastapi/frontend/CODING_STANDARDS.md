# Aether Project - Coding Standards

> [!IMPORTANT]
> **These standards are MANDATORY and NON-NEGOTIABLE for all code in this project.**

---

## JavaScript Event Handler Safety Rules

### 🔒 Rule 1: ALWAYS Quote Dynamic Identifiers

**ALL dynamic identifiers (UUIDs, IDs, strings) MUST be quoted in event handlers.**

#### ✅ CORRECT Examples:
```javascript
// Template literals in JavaScript
onclick="sellProperty('${property.id}')"
onclick="deleteDocument('${doc.id}')"
onclick="removeCrypto('${holding.id}')"
onchange="updatePropertyField('${property.id}', 'type', this.value)"
```

#### ❌ INCORRECT Examples:
```javascript
// NEVER do this - will cause JavaScript syntax errors
onclick="sellProperty(${property.id})"  // ❌ WRONG
onclick="deleteDocument(${doc.id})"     // ❌ WRONG  
onchange="updatePropertyField(${property.id}, 'type', this.value)" // ❌ WRONG
```

### 🔒 Rule 2: Never Inject Raw Variables

**NEVER inject unquoted variables directly into HTML event handlers.**

- **UUIDs** (with hyphens) MUST be quoted - otherwise JavaScript interprets hyphens as subtraction
- **All IDs** (string or numeric) MUST be quoted for consistency
- **String values** MUST be quoted
- **Numeric values** can be unquoted but quoting is safer

### 🔒 Rule 3: Apply to ALL Event Handlers

This rule applies to:
- `onclick`
- `onchange`
- `oninput`
- `onsubmit`
- `onmouseover`
- `onmouseout`
- `onfocus`
- `onblur`
- ALL other inline event handlers

---

## UI Interaction Contract

### 🔒 Rule 4: Decorative Layers NEVER Block Interaction

**Decorative visual elements MUST NEVER prevent user interaction with functional elements.**

#### Decorative Elements (Must use `pointer-events: none`):
- Glass overlays and blur effects
- `::before` and `::after` pseudo-elements (for visual effects only)
- Gradient/glow layers
- Noise/grain textures
- Border decorations
- Shadow layers
- Background animations

#### Interactive Elements (Must use `pointer-events: auto`):
- Buttons
- Links
- Input fields (text, number, select, textarea)
- Action icons
- Close buttons
- Submit buttons
- All clickable UI elements

### 🔒 Rule 5: CSS Pointer Events Enforcement

```css
/* DECORATIVE elements - MUST be non-interactive */
.decorative-layer,
.glass-decoration,
.backdrop-decoration {
    pointer-events: none !important;
}

/* ALL pseudo-elements used for decoration - MUST be non-interactive */
*::before,
*::after {
    pointer-events: none !important;
}

/* INTERACTIVE elements - MUST always be clickable */
button,
a,
input,
select,
textarea,
.btn,
.glass-button {
    pointer-events: auto !important;
}
```

### 🔒 Rule 6: Z-Index Hierarchy

**Maintain clear stacking order to prevent invisible overlaps:**

1. **Base content**: `z-index: 0`
2. **Decorative overlays**: `z-index: 0` (with `pointer-events: none`)
3. **Interactive elements**: `z-index: 1` or higher
4. **Modal backdrops**: `z-index: 1000`
5. **Modal content**: `z-index: 1001`

---

## Helper Utilities

### Safe Event Handler Generation

Use these helper functions when dynamically generating event handlers:

```javascript
/**
 * Safely generate onclick handler with quoted parameters
 * @param {string} fnName - Function name
 * @param  {...any} args - Arguments (will auto-quote strings/UUIDs)
 * @returns {string} Safe onclick attribute value
 */
function safeOnClick(fnName, ...args) {
    const quotedArgs = args.map(arg => 
        typeof arg === 'string' || /^[a-f0-9-]{36}$/i.test(String(arg))
            ? `'${arg}'`
            : arg
    );
    return `${fnName}(${quotedArgs.join(', ')})`;
}

/**
 * Safely generate onchange handler with quoted parameters
 */
function safeOnChange(fnName, ...args) {
    return safeOnClick(fnName, ...args);
}
```

#### Usage:
```javascript
// Instead of:
`<button onclick="sellProperty(${property.id})">` // ❌ WRONG

// Use helper:
`<button onclick="${safeOnClick('sellProperty', property.id)}">` // ✅ CORRECT

// Or manually quote:
`<button onclick="sellProperty('${property.id}')">` // ✅ ALSO CORRECT
```

---

## Code Review Checklist

Before submitting any code with event handlers:

- [ ] All dynamic identifiers in event handlers are properly quoted
- [ ] No unquoted `${variable}` in onclick/onchange/oninput
- [ ] All decorative pseudo-elements have `pointer-events: none`
- [ ] All buttons and inputs have `pointer-events: auto` (or inherit from parent)
- [ ] No invisible overlays blocking functional elements
- [ ] Z-index values follow the documented hierarchy
- [ ] Browser console shows zero JavaScript errors
- [ ] All buttons tested and confirmed clickable

---

## Validation Process

### Manual Testing
1. Open browser developer console
2. Click all buttons and interactive elements
3. Verify zero JavaScript errors
4. Confirm all onclick/onchange handlers execute successfully

### Automated Testing (Future)
- ESLint rule to detect unquoted identifiers in template literals
- CSS linter to enforce pointer-events rules
- Browser automation tests for interaction contract

---

## Historical Context

**Why These Rules Exist:**

1. **Unquoted UUIDs**: Early in development, unquoted UUIDs like `22cb6e9e-3d16-4809-aa01-6c924af68c15` in onclick handlers caused silent JavaScript `ReferenceError` failures because JavaScript interpreted hyphens as subtraction operators.

2. **Decorative Layer Blocking**: Glass morphism effects and blur layers were capturing click events, making buttons appear non-functional even though the HTML was correct.

3. **8 Critical Bugs Found**: Comprehensive audit discovered 8 instances of unquoted identifiers across `dashboard.js` and `shares-module.js` that could cause silent failures.

These standards prevent recurrence of these critical bugs.

---

## Enforcement

> [!CAUTION]
> **Violations of these standards may result in:**
> - Silent JavaScript execution failures
> - Non-functional buttons and inputs
> - Poor user experience
> - Difficult-to-debug issues

**All code must comply with these standards before deployment.**

---

*Last Updated: 2026-01-21*  
*Version: 1.0*
