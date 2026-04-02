import re

with open('frontend/js/shares-module.js', 'r') as f:
    content = f.read()

# Fix the button inline styling to have outline: none and box-shadow: none
new_content = content.replace(
    'style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); border: 1px solid transparent; cursor:pointer; transition: all 0.2s;"',
    'style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); border: 1px solid transparent; cursor:pointer; transition: all 0.2s; outline: none !important; box-shadow: none !important;"'
)

# Also fix the JS that applies the active state to apply outline/box-shadow safely
new_content = new_content.replace(
    "btn.style.border = '1px solid rgba(255,255,255,0.25)';",
    "btn.style.border = '1px solid rgba(255,255,255,0.25)';\n            btn.style.outline = 'none';\n            btn.style.boxShadow = 'none';"
)
new_content = new_content.replace(
    "btn.style.border = '1px solid transparent';",
    "btn.style.border = '1px solid transparent';\n            btn.style.outline = 'none';\n            btn.style.boxShadow = 'none';"
)

with open('frontend/js/shares-module.js', 'w') as f:
    f.write(new_content)
print("Buttons fixed")
