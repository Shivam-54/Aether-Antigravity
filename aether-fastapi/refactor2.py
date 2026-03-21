import os

with open('frontend/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# The original profileDrawer starts with:
start_marker = '<!-- Profile Slide-in Drawer -->'
end_marker = '<!-- /Profile slide-in drawer end -->' # Wait, it doesn't have an end marker. Let's find exactly where it ends.

# Let's find the backdrop first
backdrop_marker = '<!-- Profile Drawer Backdrop -->'
backdrop_idx = html.find(backdrop_marker)

# The drawer ends right before:
# <!-- Bootstrap JS --> or <script ...
script_marker = '<!-- Bootstrap JS'
if script_marker not in html:
    script_marker = '<!-- Bootstrap 5 JS Bundle'
if script_marker not in html:
    script_marker = '    <script src="js/'
script_idx = html.find(script_marker)

original_drawer_block = html[backdrop_idx:script_idx]

# Okay, let's create the Settings Drawer. It's essentially the original drawer, but:
# 1. Title is Settings instead of Account
# 2. No Identity Block
# 3. ID is settingsDrawer instead of profileDrawer
# 4. Backdrop ID is settingsDrawerBackdrop instead of profileDrawerBackdrop
# 5. onclick="closeSettingsDrawer()" instead of closeProfileDrawer()

settings_drawer = original_drawer_block.replace('profileDrawer', 'settingsDrawer')
settings_drawer = settings_drawer.replace('closeProfileDrawer', 'closeSettingsDrawer')
settings_drawer = settings_drawer.replace('Account</span>', 'Settings</span>')

# Remove Identity Block from Settings
identity_start = settings_drawer.find('<!-- Identity -->')
two_panel_start = settings_drawer.find('<!-- Settings Two-Panel -->')
settings_drawer = settings_drawer[:identity_start] + settings_drawer[two_panel_start:]

# Now create the Profile Drawer. It's the original drawer but:
# 1. Keep backdrop and main div
# 2. Keep Header
# 3. Keep Identity Block
# 4. Remove Settings Two-Panel entirely
profile_drawer = original_drawer_block[:backdrop_idx] # Just to be safe, nope

# Let's extract parts from original_drawer_block
prof_two_panel_start = original_drawer_block.find('<!-- Settings Two-Panel -->')
prof_header_identity = original_drawer_block[:prof_two_panel_start]

profile_drawer = prof_header_identity + "    </div>\n" # close the profileDrawer div

# The combined replacement is Profile Drawer followed by Settings Drawer
new_html = html[:backdrop_idx] + profile_drawer + "\n" + settings_drawer + "\n" + html[script_idx:]

with open('frontend/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
print("Updated dashboard.html successfully.")

# Now update dashboard.js
with open('frontend/js/dashboard.js', 'r', encoding='utf-8') as f:
    js = f.read()

nav_target = """function navigateToSection(sectionId, sectionName, btn) {"""
nav_replacement = """function navigateToSection(sectionId, sectionName, btn) {
    if (sectionId === 'settings') {
        openSettingsDrawer();
        return;
    }"""
if nav_target in js and nav_replacement not in js:
    js = js.replace(nav_target, nav_replacement)

# Add Settings JS functions
drawer_target = """function openProfileDrawer() {"""
drawer_replacement = """
function openSettingsDrawer() {
    const backdrop = document.getElementById('settingsDrawerBackdrop');
    const drawer = document.getElementById('settingsDrawer');
    
    // Ensure the default settings panel opens
    switchSettingsPanel('privacy');

    backdrop.style.pointerEvents = 'auto';
    backdrop.style.opacity = '1';
    drawer.style.transform = 'translateX(0)';
}
window.openSettingsDrawer = openSettingsDrawer;

function closeSettingsDrawer() {
    const backdrop = document.getElementById('settingsDrawerBackdrop');
    const drawer = document.getElementById('settingsDrawer');

    backdrop.style.opacity = '0';
    backdrop.style.pointerEvents = 'none';
    drawer.style.transform = 'translateX(100%)';
}
window.closeSettingsDrawer = closeSettingsDrawer;

function openProfileDrawer() {"""

if drawer_target in js and "function openSettingsDrawer()" not in js:
    js = js.replace(drawer_target, drawer_replacement)

with open('frontend/js/dashboard.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated dashboard.js successfully.")
