"""
Patch script for:
1. Enhance _showSettingsToast in dashboard.js to support 'error'/'success' types
2. Fix Business health score to use computed metrics instead of hardcoded 92
3. Replace all alert() calls in valuations.js and shares-module.js with toast calls
"""

import re

# ────────────────────────────────────────────
# 1. Enhance _showSettingsToast in dashboard.js
# ────────────────────────────────────────────
OLD_TOAST = """function _showSettingsToast(msg) {
    let toast = document.getElementById('settingsToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'settingsToast';
        toast.style.cssText = `
            position: fixed; bottom: 80px; right: 24px;
            background: rgba(15,15,20,0.95); border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.85); font-size: 0.78rem;
            padding: 10px 16px; border-radius: 10px; z-index: 9999;
            backdrop-filter: blur(10px);
            transition: opacity 0.3s; opacity: 0;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}"""

NEW_TOAST = """function _showSettingsToast(msg, type) {
    let toast = document.getElementById('settingsToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'settingsToast';
        toast.style.cssText = [
            'position:fixed;bottom:80px;right:24px;',
            'font-size:0.78rem;padding:10px 16px;border-radius:10px;',
            'z-index:9999;backdrop-filter:blur(10px);',
            'transition:opacity 0.3s;opacity:0;pointer-events:none;',
            'display:flex;align-items:center;gap:8px;'
        ].join('');
        document.body.appendChild(toast);
    }
    const isErr = type === 'error';
    const isOk  = type === 'success';
    toast.style.background = isErr ? 'rgba(220,38,38,0.92)' :
                              isOk  ? 'rgba(16,185,129,0.92)' :
                                      'rgba(15,15,20,0.95)';
    toast.style.border      = isErr ? '1px solid rgba(255,100,100,0.4)' :
                              isOk  ? '1px solid rgba(52,211,153,0.4)' :
                                      '1px solid rgba(255,255,255,0.1)';
    toast.style.color = 'rgba(255,255,255,0.92)';
    const icon = isErr ? '✕ ' : isOk ? '✓ ' : '';
    toast.textContent = icon + msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
}

// Expose globally so external JS files (valuations.js, shares-module.js) can use it
window._showSettingsToast = _showSettingsToast;"""

# ────────────────────────────────────────────
# 2. Fix Business health score in dashboard.js
# ────────────────────────────────────────────
OLD_HEALTH = """    let healthStatus = 'Healthy';
    let healthScore = 92; // Mock score based on margin
    if (profitMargin < 10) { healthStatus = 'At Risk'; healthScore = 45; }
    else if (profitMargin < 20) { healthStatus = 'Stable'; healthScore = 75; }"""

NEW_HEALTH = """    // Compute health score from real business metrics
    let healthStatus, healthScore;
    if (profitMargin >= 30) {
        healthStatus = 'Excellent'; healthScore = Math.round(85 + Math.min(profitMargin - 30, 15));
    } else if (profitMargin >= 20) {
        healthStatus = 'Healthy'; healthScore = Math.round(70 + (profitMargin - 20) * 1.5);
    } else if (profitMargin >= 10) {
        healthStatus = 'Stable'; healthScore = Math.round(50 + (profitMargin - 10) * 2);
    } else if (profitMargin >= 0) {
        healthStatus = 'At Risk'; healthScore = Math.round(20 + profitMargin * 3);
    } else {
        healthStatus = 'Critical'; healthScore = Math.max(5, Math.round(20 + profitMargin));
    }"""

# ────────────────────────────────────────────
# Patch dashboard.js
# ────────────────────────────────────────────
with open('frontend/js/dashboard.js', 'r') as f:
    js = f.read()

if OLD_TOAST in js:
    js = js.replace(OLD_TOAST, NEW_TOAST)
    print("✓ Enhanced _showSettingsToast with error/success type support")
else:
    print("✗ Could not find _showSettingsToast to patch")

if OLD_HEALTH in js:
    js = js.replace(OLD_HEALTH, NEW_HEALTH)
    print("✓ Fixed Business health score to use computed metrics")
else:
    print("✗ Could not find health score block")

with open('frontend/js/dashboard.js', 'w') as f:
    f.write(js)

# ────────────────────────────────────────────
# 3. Replace alert() in valuations.js
# ────────────────────────────────────────────
ALERT_MAP_VALUATIONS = {
    "alert('Failed to delete document')":    "_showSettingsToast('Failed to delete document', 'error')",
    "alert('Error deleting document')":       "_showSettingsToast('Error deleting document', 'error')",
    "alert('Please fill all required fields')": "_showSettingsToast('Please fill all required fields', 'error')",
    "alert('Value must be greater than zero')": "_showSettingsToast('Value must be greater than zero', 'error')",
    "alert('Valuation added successfully!')":   "_showSettingsToast('Valuation added ✓', 'success')",
    "alert(error.message)":                     "_showSettingsToast(error.message, 'error')",
    "alert('Valuation deleted successfully!')":  "_showSettingsToast('Valuation deleted', 'success')",
    "alert('No property selected context found.')": "_showSettingsToast('No property selected', 'error')",
    "alert('Please select a file.')":            "_showSettingsToast('Please select a file', 'error')",
    "alert('Please select a document type.')":    "_showSettingsToast('Please select a document type', 'error')",
    "alert(`Upload failed: ${errorData.detail || 'Unknown error'}`)": "_showSettingsToast(`Upload failed: ${errorData.detail || 'Unknown error'}`, 'error')",
    "alert('An error occurred while uploading. Please try again.')": "_showSettingsToast('Upload error. Please try again.', 'error')",
}

with open('frontend/js/valuations.js', 'r') as f:
    val = f.read()

count = 0
for old, new in ALERT_MAP_VALUATIONS.items():
    if old in val:
        val = val.replace(old, new)
        count += 1

with open('frontend/js/valuations.js', 'w') as f:
    f.write(val)
print(f"✓ Replaced {count} alert() calls in valuations.js")

# ────────────────────────────────────────────
# 4. Replace alert() in shares-module.js
# ────────────────────────────────────────────
ALERT_MAP_SHARES = {
    "alert('Please search and select a stock first')": "_showSettingsToast('Please search and select a stock first', 'error')",
    "alert('Please select a sector first')":           "_showSettingsToast('Please select a sector first', 'error')",
    "alert('Error adding share: ' + (error.detail || 'Unknown error'))": "_showSettingsToast('Error adding share: ' + (error.detail || 'Unknown error'), 'error')",
    "alert('Error adding share')":     "_showSettingsToast('Error adding share', 'error')",
    "alert('Error selling share')":    "_showSettingsToast('Error selling share', 'error')",
    "alert('Error removing share')":   "_showSettingsToast('Error removing share', 'error')",
}

with open('frontend/js/shares-module.js', 'r') as f:
    shares = f.read()

count = 0
for old, new in ALERT_MAP_SHARES.items():
    if old in shares:
        shares = shares.replace(old, new)
        count += 1

with open('frontend/js/shares-module.js', 'w') as f:
    f.write(shares)
print(f"✓ Replaced {count} alert() calls in shares-module.js")

# ────────────────────────────────────────────
# 5. Replace alert() in share-transactions.js
# ────────────────────────────────────────────
ALERT_MAP_TRANS = {
    "alert('Please select a date')":  "_showSettingsToast('Please select a date', 'error')",
    "alert('Transaction not found')": "_showSettingsToast('Transaction not found', 'error')",
}

try:
    with open('frontend/js/share-transactions.js', 'r') as f:
        trans = f.read()
    count = 0
    for old, new in ALERT_MAP_TRANS.items():
        if old in trans:
            trans = trans.replace(old, new)
            count += 1
    with open('frontend/js/share-transactions.js', 'w') as f:
        f.write(trans)
    print(f"✓ Replaced {count} alert() calls in share-transactions.js")
except FileNotFoundError:
    print("  share-transactions.js not found, skipping.")

print("\nAll patches complete.")
