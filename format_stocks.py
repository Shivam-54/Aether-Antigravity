import json

input_file = "/Users/shivampatel/aether-isle/aether-fastapi/backend/services/indian_stocks.py"

# Read the file to extract the existing json list
with open(input_file, "r") as f:
    text = f.read()

import re
match = re.search(r'INDIAN_STOCKS\s*=\s*(\[.*?\])\n\ndef', text, re.DOTALL)
if not match:
    print("Could not find the INDIAN_STOCKS array")
    exit(1)

stocks = json.loads(match.group(1))

# Group stocks by sector
by_sector = {}
for s in stocks:
    sec = s["sector"]
    if sec not in by_sector:
        by_sector[sec] = []
    by_sector[sec].append(s)

# Ensure alphabetical order of sectors
sorted_sectors = sorted(by_sector.keys())

new_list_content = "[\n"

for i, sector in enumerate(sorted_sectors):
    new_list_content += f"    # ==========================================\n"
    new_list_content += f"    # {sector.upper()} ({len(by_sector[sector])} Stocks)\n"
    new_list_content += f"    # ==========================================\n"
    
    sector_stocks = by_sector[sector]
    
    for j, stock in enumerate(sector_stocks):
        is_last_in_sector = (j == len(sector_stocks) - 1)
        is_last_overall = is_last_in_sector and (i == len(sorted_sectors) - 1)
        
        # Serialize the inner dict without indents, and manually format
        dict_str = json.dumps(stock)
        
        if is_last_overall:
            new_list_content += f"    {dict_str}\n"
        else:
            new_list_content += f"    {dict_str},\n"
            
    if i != len(sorted_sectors) - 1:
        new_list_content += "\n"

new_list_content += "]"


new_file_content = f"""import json

# Dictionary of popular NSE/BSE stocks across 29 sectors for accurate offline search
# Total: {len(stocks)} stocks
INDIAN_STOCKS = {new_list_content}

def search_indian_stocks(query: str, sector: str = None):
    \"\"\"Search local dictionary for indian stocks by name or symbol\"\"\"
    query_lower = query.lower()
    sector_lower = sector.lower() if sector else None
    
    results = []
    
    for stock in INDIAN_STOCKS:
        if sector_lower:
            stock_sect_lower = stock['sector'].lower()
            if sector_lower not in stock_sect_lower and stock_sect_lower not in sector_lower:
                continue
            
        if query_lower in stock['symbol'].lower() or query_lower in stock['name'].lower():
            results.append({{
                "symbol": stock['symbol'],
                "name": stock['name'],
                "exchange": "NSE",
                "type": "EQUITY"
            }})
            
    # Remove duplicates preserving order
    unique_results = []
    seen = set()
    for item in results:
        if item['symbol'] not in seen:
            unique_results.append(item)
            seen.add(item['symbol'])
            
    return unique_results[:30]  # Return top 30 matches
"""

with open(input_file, "w") as f:
    f.write(new_file_content)

print("Successfully formatted indian_stocks.py")
