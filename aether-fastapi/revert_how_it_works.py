import sys

with open("frontend/dashboard.html", "r") as f:
    lines = f.readlines()

out_lines = []
skip = False
div_count = 0

for i, line in enumerate(lines):
    if "<!-- How It Works Card -->" in line:
        skip = True
        div_count = 0
        continue
    
    if skip:
        if "<div" in line:
            div_count += line.count("<div")
        if "</div" in line:
            div_count -= line.count("</div")
        
        if div_count <= 0 and "<div" not in line and "</div" in line: # strictly wait for div count to drop to zero
            # wait, if div_count reaches 0, we flip skip to False
            # but wait, if there are multiple closing/opening div on same line?
            pass
            
        if div_count == 0:
            skip = False
        continue
        
    out_lines.append(line)

with open("frontend/dashboard.html", "w") as f:
    f.writelines(out_lines)

print("Reverted HTML blocks successfully")
