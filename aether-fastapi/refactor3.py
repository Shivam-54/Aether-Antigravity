import os

# --- dashboard.html Update ---
with open('frontend/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

backdrop_marker = '<!-- Profile Drawer Backdrop -->'
backdrop_idx = html.find(backdrop_marker)

script_idx = html.find('</body>')

original_drawer_block = html[backdrop_idx:script_idx]

# Create Settings Drawer
settings_drawer = original_drawer_block.replace('profileDrawer', 'settingsDrawer')
settings_drawer = settings_drawer.replace('closeProfileDrawer', 'closeSettingsDrawer')
settings_drawer = settings_drawer.replace('Account</span>', 'Settings</span>')

# Remove Identity Block from settings_drawer
identity_start = settings_drawer.find('<!-- Identity -->')
two_panel_start = settings_drawer.find('<!-- Settings Two-Panel -->')
settings_drawer = settings_drawer[:identity_start] + settings_drawer[two_panel_start:]

# Create Profile Drawer
prof_two_panel_start = original_drawer_block.find('<!-- Settings Two-Panel -->')
prof_header_identity = original_drawer_block[:prof_two_panel_start]
profile_drawer = prof_header_identity + "    </div>\n"

# Combine and write
new_html = html[:backdrop_idx] + profile_drawer + "\n\n" + settings_drawer + "\n" + html[script_idx:]

with open('frontend/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Updated dashboard.html successfully.")

# --- dashboard.js Update ---
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

drawer_target = """function openProfileDrawer() {"""
drawer_replacement = """function openSettingsDrawer() {
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
