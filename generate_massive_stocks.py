import json

# Compile a large list of stocks organized loosely by sector to ensure ~20-30 per major sector
stocks_data = [
    # --- INFORMATION TECHNOLOGY ---
    ("TCS", "Tata Consultancy Services Limited", "Information Technology"),
    ("INFY", "Infosys Limited", "Information Technology"),
    ("HCLTECH", "HCL Technologies Limited", "Information Technology"),
    ("WIPRO", "Wipro Limited", "Information Technology"),
    ("TECHM", "Tech Mahindra Limited", "Information Technology"),
    ("LTIM", "LTIMindtree Limited", "Information Technology"),
    ("PERSISTENT", "Persistent Systems Limited", "Information Technology"),
    ("LTTS", "L&T Technology Services Limited", "Information Technology"),
    ("TATAELXSI", "Tata Elxsi Limited", "Information Technology"),
    ("KPITTECH", "KPIT Technologies Limited", "Information Technology"),
    ("COFORGE", "Coforge Limited", "Information Technology"),
    ("MPHASIS", "Mphasis Limited", "Information Technology"),
    ("CYIENT", "Cyient Limited", "Information Technology"),
    ("SONATSOFTW", "Sonata Software Limited", "Information Technology"),
    ("BSOFT", "Birlasoft Limited", "Information Technology"),
    ("ZENSARTECH", "Zensar Technologies Limited", "Information Technology"),
    ("INTELLECT", "Intellect Design Arena Limited", "Information Technology"),
    ("ROUTE", "Route Mobile Limited", "Information Technology"),
    ("FSL", "Firstsource Solutions Limited", "Information Technology"),
    ("RATEGAIN", "RateGain Travel Technologies", "Information Technology"),
    ("HAPPSTMNDS", "Happiest Minds Technologies", "Information Technology"),
    ("NEWGEN", "Newgen Software Technologies", "Information Technology"),
    ("LATENTVIEW", "Latent View Analytics", "Information Technology"),

    # --- FINANCIALS (Banks, NBFCs, Insurance) ---
    ("HDFCBANK", "HDFC Bank Limited", "Financials"),
    ("ICICIBANK", "ICICI Bank Limited", "Financials"),
    ("SBIN", "State Bank of India", "Financials"),
    ("KOTAKBANK", "Kotak Mahindra Bank Limited", "Financials"),
    ("AXISBANK", "Axis Bank Limited", "Financials"),
    ("BAJFINANCE", "Bajaj Finance Limited", "Financials"),
    ("BAJAJFINSV", "Bajaj Finserv Limited", "Financials"),
    ("JIOFIN", "Jio Financial Services Limited", "Financials"),
    ("LICI", "Life Insurance Corporation of India", "Financials"),
    ("CHOLAFIN", "Cholamandalam Investment and Finance", "Financials"),
    ("SHRIRAMFIN", "Shriram Finance Limited", "Financials"),
    ("MUTHOOTFIN", "Muthoot Finance Limited", "Financials"),
    ("RECLTD", "REC Limited", "Financials"),
    ("PFC", "Power Finance Corporation", "Financials"),
    ("IRFC", "Indian Railway Finance Corporation", "Financials"),
    ("SBIKARD", "SBI Cards and Payment Services", "Financials"),
    ("HDFCAMC", "HDFC Asset Management Company", "Financials"),
    ("NAM-INDIA", "Nippon Life India Asset Management", "Financials"),
    ("MCX", "Multi Commodity Exchange of India", "Financials"),
    ("CDSL", "Central Depository Services (India)", "Financials"),
    ("BSE", "BSE Limited", "Financials"),
    ("CAMS", "Computer Age Management Services", "Financials"),
    ("HDFCLIFE", "HDFC Life Insurance", "Financials"),
    ("SBILIFE", "SBI Life Insurance", "Financials"),
    ("ICICIPRULI", "ICICI Prudential Life Insurance", "Financials"),
    ("ICICIGI", "ICICI Lombard General Insurance", "Financials"),
    ("STARHEALTH", "Star Health and Allied Insurance", "Financials"),
    ("PNB", "Punjab National Bank", "Financials"),
    ("BANKBARODA", "Bank of Baroda", "Financials"),
    ("UNIONBANK", "Union Bank of India", "Financials"),
    ("CANBK", "Canara Bank", "Financials"),
    ("INDUSINDBK", "IndusInd Bank", "Financials"),
    ("IDFCFIRSTB", "IDFC First Bank", "Financials"),
    ("FEDERALBNK", "The Federal Bank", "Financials"),
    ("AUBANK", "AU Small Finance Bank", "Financials"),

    # --- HEALTHCARE & PHARMA ---
    ("SUNPHARMA", "Sun Pharmaceutical Industries", "Healthcare"),
    ("CIPLA", "Cipla Limited", "Healthcare"),
    ("DRREDDY", "Dr. Reddy's Laboratories", "Healthcare"),
    ("DIVISLAB", "Divi's Laboratories", "Healthcare"),
    ("APOLLOHOSP", "Apollo Hospitals Enterprise", "Healthcare"),
    ("LUPIN", "Lupin Limited", "Healthcare"),
    ("AUROPHARMA", "Aurobindo Pharma", "Healthcare"),
    ("ZYDUSLIFE", "Zydus Lifesciences", "Healthcare"),
    ("BIOCON", "Biocon Limited", "Healthcare"),
    ("TORNTPHARM", "Torrent Pharmaceuticals", "Healthcare"),
    ("MAXHEALTH", "Max Healthcare Institute", "Healthcare"),
    ("GLENMARK", "Glenmark Pharmaceuticals", "Healthcare"),
    ("SYNGENE", "Syngene International", "Healthcare"),
    ("LAURUSLABS", "Laurus Labs", "Healthcare"),
    ("GLAND", "Gland Pharma", "Healthcare"),
    ("ALKEM", "Alkem Laboratories", "Healthcare"),
    ("NATCOPHARM", "Natco Pharma", "Healthcare"),
    ("AJANTPHARM", "Ajanta Pharma", "Healthcare"),
    ("ABBOTINDIA", "Abbott India", "Healthcare"),
    ("SANOFI", "Sanofi India", "Healthcare"),
    ("GSKCONS", "GlaxoSmithKline Pharmaceuticals", "Healthcare"),
    ("FORTIS", "Fortis Healthcare", "Healthcare"),
    ("KIMS", "Krishna Institute of Medical Sciences", "Healthcare"),
    ("METROPOLIS", "Metropolis Healthcare", "Healthcare"),
    ("DRLALPATHLABS", "Dr. Lal PathLabs", "Healthcare"),
    ("JBCHEPHARM", "J.B. Chemicals & Pharmaceuticals", "Healthcare"),
    ("GRANULES", "Granules India", "Healthcare"),

    # --- CONSUMER DISCRETIONARY (Auto, Retail, Durables) ---
    ("MARUTI", "Maruti Suzuki India", "Consumer Discretionary"),
    ("TATAMOTORS", "Tata Motors", "Consumer Discretionary"),
    ("M&M", "Mahindra & Mahindra", "Consumer Discretionary"),
    ("TITAN", "Titan Company", "Consumer Discretionary"),
    ("TRENT", "Trent Limited", "Consumer Discretionary"),
    ("ZOMATO", "Zomato Limited", "Consumer Discretionary"),
    ("BAJAJ-AUTO", "Bajaj Auto", "Consumer Discretionary"),
    ("EICHERMOT", "Eicher Motors", "Consumer Discretionary"),
    ("HEROMOTOCO", "Hero MotoCorp", "Consumer Discretionary"),
    ("TVSMOTOR", "TVS Motor Company", "Consumer Discretionary"),
    ("ASHOKLEY", "Ashok Leyland", "Consumer Discretionary"),
    ("PAGEIND", "Page Industries", "Consumer Discretionary"),
    ("NYKAA", "FSN E-Commerce Ventures", "Consumer Discretionary"),
    ("DIXON", "Dixon Technologies", "Consumer Discretionary"),
    ("BOSCHLTD", "Bosch Limited", "Consumer Discretionary"),
    ("MRF", "MRF Limited", "Consumer Discretionary"),
    ("APOLLOTYRE", "Apollo Tyres", "Consumer Discretionary"),
    ("BALKRISIND", "Balkrishna Industries", "Consumer Discretionary"),
    ("MOTHERSON", "Samvardhana Motherson International", "Consumer Discretionary"),
    ("SONACOMS", "Sona BLW Precision Forgings", "Consumer Discretionary"),
    ("JUBLFOOD", "Jubilant FoodWorks", "Consumer Discretionary"),
    ("DEVYANI", "Devyani International", "Consumer Discretionary"),
    ("WESTLIFE", "Westlife Foodworld", "Consumer Discretionary"),
    ("BATAINDIA", "Bata India", "Consumer Discretionary"),
    ("RELAXO", "Relaxo Footwears", "Consumer Discretionary"),
    ("METROBRAND", "Metro Brands", "Consumer Discretionary"),
    ("KALYANKJIL", "Kalyan Jewellers India", "Consumer Discretionary"),
    ("MANYAVAR", "Vedant Fashions", "Consumer Discretionary"),
    ("RAYMOND", "Raymond Limited", "Consumer Discretionary"),

    # --- CONSUMER STAPLES (FMCG) ---
    ("ITC", "ITC Limited", "Consumer Staples"),
    ("HINDUNILVR", "Hindustan Unilever", "Consumer Staples"),
    ("NESTLEIND", "Nestle India", "Consumer Staples"),
    ("BRITANNIA", "Britannia Industries", "Consumer Staples"),
    ("TATACONSUM", "Tata Consumer Products", "Consumer Staples"),
    ("GODREJCP", "Godrej Consumer Products", "Consumer Staples"),
    ("DABUR", "Dabur India", "Consumer Staples"),
    ("MARICO", "Marico Limited", "Consumer Staples"),
    ("COLPAL", "Colgate-Palmolive (India)", "Consumer Staples"),
    ("DMART", "Avenue Supermarts", "Consumer Staples"),
    ("VBL", "Varun Beverages", "Consumer Staples"),
    ("MCDOWELL-N", "United Spirits", "Consumer Staples"),
    ("UBL", "United Breweries", "Consumer Staples"),
    ("RADICO", "Radico Khaitan", "Consumer Staples"),
    ("AWL", "Adani Wilmar", "Consumer Staples"),
    ("PATANJALI", "Patanjali Foods", "Consumer Staples"),
    ("EMAMILTD", "Emami Limited", "Consumer Staples"),
    ("PGHH", "Procter & Gamble Hygiene and Health Care", "Consumer Staples"),
    ("GILLETTE", "Gillette India", "Consumer Staples"),
    ("HONASA", "Honasa Consumer (Mamaearth)", "Consumer Staples"),
    ("BIKAJI", "Bikaji Foods International", "Consumer Staples"),
    ("JYOTHYLAB", "Jyothy Labs", "Consumer Staples"),

    # --- INDUSTRIALS & CAPITAL GOODS ---
    ("LT", "Larsen & Toubro", "Industrials"),
    ("HAL", "Hindustan Aeronautics", "Industrials"),
    ("BEL", "Bharat Electronics", "Industrials"),
    ("SIEMENS", "Siemens Limited", "Industrials"),
    ("ABB", "ABB India", "Industrials"),
    ("BHEL", "Bharat Heavy Electricals", "Industrials"),
    ("CGPOWER", "CG Power and Industrial Solutions", "Industrials"),
    ("POLYCAB", "Polycab India", "Industrials"),
    ("HAVELLS", "Havells India", "Industrials"),
    ("CROMPTON", "Crompton Greaves Consumer Electricals", "Industrials"),
    ("VOLTAS", "Voltas Limited", "Industrials"),
    ("BLUESTARCO", "Blue Star", "Industrials"),
    ("CUMMINSIND", "Cummins India", "Industrials"),
    ("ESCORTS", "Escorts Kubota", "Industrials"),
    ("AIAENG", "AIA Engineering", "Industrials"),
    ("THERMAX", "Thermax Limited", "Industrials"),
    ("KEI", "KEI Industries", "Industrials"),
    ("APARINDS", "Apar Industries", "Industrials"),
    ("KEC", "KEC International", "Industrials"),
    ("KALPATPOWR", "Kalpataru Projects International", "Industrials"),
    ("COCHINSHIP", "Cochin Shipyard", "Industrials"),
    ("MAZDOCK", "Mazagon Dock Shipbuilders", "Industrials"),
    ("GRSE", "Garden Reach Shipbuilders & Engineers", "Industrials"),
    ("BDL", "Bharat Dynamics", "Industrials"),
    ("BEML", "BEML Limited", "Industrials"),
    ("RVNL", "Rail Vikas Nigam", "Industrials"),
    ("IRCON", "Ircon International", "Industrials"),
    ("RITES", "RITES Limited", "Industrials"),

    # --- ENERGY & UTILITIES ---
    ("RELIANCE", "Reliance Industries", "Energy"),
    ("ONGC", "Oil & Natural Gas Corporation", "Energy"),
    ("NTPC", "NTPC Limited", "Utilities"),
    ("POWERGRID", "Power Grid Corporation of India", "Utilities"),
    ("COALINDIA", "Coal India", "Energy"),
    ("IOC", "Indian Oil Corporation", "Energy"),
    ("BPCL", "Bharat Petroleum Corporation", "Energy"),
    ("HPCL", "Hindustan Petroleum Corporation", "Energy"),
    ("GAIL", "GAIL (India)", "Energy"),
    ("PETRONET", "Petronet LNG", "Energy"),
    ("IGL", "Indraprastha Gas", "Utilities"),
    ("MGL", "Mahanagar Gas", "Utilities"),
    ("GUJGASLTD", "Gujarat Gas", "Utilities"),
    ("ATGL", "Adani Total Gas", "Utilities"),
    ("MRPL", "Mangalore Refinery and Petrochemicals", "Energy"),
    ("CHENNPETRO", "Chennai Petroleum Corporation", "Energy"),
    ("TATAPOWER", "Tata Power Company", "Utilities"),
    ("ADANIPOWER", "Adani Power", "Utilities"),
    ("TORNTPOWER", "Torrent Power", "Utilities"),
    ("NHPC", "NHPC Limited", "Utilities"),
    ("SJVN", "SJVN Limited", "Utilities"),
    ("JSWENERGY", "JSW Energy", "Utilities"),
    ("ADANIENSOL", "Adani Energy Solutions", "Utilities"),
    ("CGPL", "Coastal Gujarat Power", "Utilities"),

    # --- MATERIALS (Metals, Cement, Chemicals) ---
    ("TATASTEEL", "Tata Steel", "Materials"),
    ("ASIANPAINT", "Asian Paints", "Materials"),
    ("ULTRACEMCO", "UltraTech Cement", "Materials"),
    ("GRASIM", "Grasim Industries", "Materials"),
    ("JSWSTEEL", "JSW Steel", "Materials"),
    ("HINDALCO", "Hindalco Industries", "Materials"),
    ("TATACHEM", "Tata Chemicals", "Materials"),
    ("AMBUJACEM", "Ambuja Cements", "Materials"),
    ("SHREECEM", "Shree Cement", "Materials"),
    ("VEDL", "Vedanta Limited", "Materials"),
    ("NMDC", "NMDC Limited", "Materials"),
    ("SAIL", "Steel Authority of India", "Materials"),
    ("JINDALSTEL", "Jindal Steel & Power", "Materials"),
    ("HINDCOPPER", "Hindustan Copper", "Materials"),
    ("NATIONALUM", "National Aluminium Company", "Materials"),
    ("PIDILITIND", "Pidilite Industries", "Materials"),
    ("BERGEPAINT", "Berger Paints India", "Materials"),
    ("KANSAINER", "Kansai Nerolac Paints", "Materials"),
    ("SRF", "SRF Limited", "Materials"),
    ("UPL", "UPL Limited", "Materials"),
    ("PIIND", "PI Industries", "Materials"),
    ("DEEPAKNTR", "Deepak Nitrite", "Materials"),
    ("AARTIIND", "Aarti Industries", "Materials"),
    ("TATACHEM", "Tata Chemicals", "Materials"),
    ("GUJALKALI", "Gujarat Alkalies and Chemicals", "Materials"),
    ("GNFC", "Gujarat Narmada Valley Fertilizers", "Materials"),

    # --- REAL ESTATE ---
    ("DLF", "DLF Limited", "Real Estate"),
    ("GODREJPROP", "Godrej Properties", "Real Estate"),
    ("MACROTECH", "Macrotech Developers (Lodha)", "Real Estate"),
    ("OBEROIRLTY", "Oberoi Realty", "Real Estate"),
    ("PRESTIGE", "Prestige Estates Projects", "Real Estate"),
    ("PHOENIXLTD", "The Phoenix Mills", "Real Estate"),
    ("BRIGADE", "Brigade Enterprises", "Real Estate"),
    ("SOBHA", "Sobha Limited", "Real Estate"),
    ("PURVA", "Puravankara Limited", "Real Estate"),
    ("MAHLIFE", "Mahindra Lifespace Developers", "Real Estate"),
    ("SUNTECK", "Sunteck Realty", "Real Estate"),
    ("MINDSPACE", "Mindspace Business Parks REIT", "Real Estate"),
    ("EMBASSY", "Embassy Office Parks REIT", "Real Estate"),
    ("BROOKFIELD", "Brookfield India Real Estate Trust", "Real Estate"),

    # --- COMMUNICATION SERVICES & MISCELLANEOUS ---
    ("BHARTIARTL", "Bharti Airtel", "Communication Services"),
    ("TATACOMM", "Tata Communications", "Communication Services"),
    ("INDUSTOWER", "Indus Towers", "Communication Services"),
    ("IDEA", "Vodafone Idea", "Communication Services"),
    ("NAUKRI", "Info Edge (India)", "Communication Services"),
    ("PVRINOX", "PVR INOX", "Communication Services"),
    ("SUNTV", "Sun TV Network", "Communication Services"),
    ("ZEEL", "Zee Entertainment Enterprises", "Communication Services"),
    ("NETWORK18", "Network18 Media & Investments", "Communication Services"),
    ("TV18BRDCST", "TV18 Broadcast", "Communication Services"),
    ("ADANIENT", "Adani Enterprises", "Other"),
    ("IRCTC", "Indian Railway Catering and Tourism", "Consumer Discretionary"),
    ("CONCOR", "Container Corporation of India", "Industrials"),
    ("DELHIVERY", "Delhivery Limited", "Industrials"),
    ("BLUEDART", "Blue Dart Express", "Industrials"),
    ("TATAINVEST", "Tata Investment Corporation", "Financials")
]

stocks_json = []
for symbol, name, sector in stocks_data:
    stocks_json.append({
        "symbol": f"{symbol}.NS",
        "name": name,
        "sector": sector
    })

output_file = "/Users/shivampatel/aether-isle/aether-fastapi/backend/services/indian_stocks.py"

content = f"""import json

# Dictionary of popular NSE/BSE stocks for better search by name
INDIAN_STOCKS = {json.dumps(stocks_json, indent=4)}

def search_indian_stocks(query: str, sector: str = None):
    \"\"\"Search local dictionary for indian stocks by name or symbol\"\"\"
    query_lower = query.lower()
    sector_lower = sector.lower() if sector else None
    
    # Clean UI dropdown naming differences to match the actual DB sectors
    if sector_lower:
        if "pharma" in sector_lower.lower():
            sector_lower = "health"
        if "it" in sector_lower.lower() or "software" in sector_lower.lower():
            sector_lower = "information technology"
        if "fmcg" in sector_lower.lower() or "staple" in sector_lower.lower():
            sector_lower = "consumer staples"
        if "auto" in sector_lower.lower() or "retail" in sector_lower.lower() or "durables" in sector_lower.lower():
            sector_lower = "consumer discretionary"
        if "capital goods" in sector_lower.lower():
            sector_lower = "industrials"
        if "bank" in sector_lower.lower() or "nb" in sector_lower.lower() or "insur" in sector_lower.lower() or "finance" in sector_lower.lower():
             sector_lower = "financials"
    
    results = []
    
    for stock in INDIAN_STOCKS:
        # Check if sector matches loosely (if provided)
        if sector_lower:
            stock_sect_lower = stock['sector'].lower()
            if sector_lower not in stock_sect_lower and stock_sect_lower not in sector_lower:
                continue
            
        # Match by symbol or name
        if query_lower in stock['symbol'].lower() or query_lower in stock['name'].lower():
            results.append({{
                "symbol": stock['symbol'],
                "name": stock['name'],
                "exchange": "NSE",
                "type": "EQUITY"
            }})
            
    return results[:15]  # Return top 15 matches
"""

with open(output_file, "w") as f:
    f.write(content)

print(f"Successfully generated indian_stocks.py with {len(stocks_json)} stocks")
