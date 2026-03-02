import json

stocks_input = """RELIANCE,Reliance Industries Limited,Energy
TCS,Tata Consultancy Services Limited,Information Technology
HDFCBANK,HDFC Bank Limited,Financials
ICICIBANK,ICICI Bank Limited,Financials
BHARTIARTL,Bharti Airtel Limited,Communication Services
SBIN,State Bank of India,Financials
INFY,Infosys Limited,Information Technology
LICI,Life Insurance Corporation of India,Financials
ITC,ITC Limited,Consumer Staples
HINDUNILVR,Hindustan Unilever Limited,Consumer Staples
LT,Larsen & Toubro Limited,Industrials
BAJFINANCE,Bajaj Finance Limited,Financials
HCLTECH,HCL Technologies Limited,Information Technology
MARUTI,Maruti Suzuki India Limited,Consumer Discretionary
SUNPHARMA,Sun Pharmaceutical Industries Limited,Health Care
ADANIENT,Adani Enterprises Limited,Industrials
KOTAKBANK,Kotak Mahindra Bank Limited,Financials
TITAN,Titan Company Limited,Consumer Discretionary
ONGC,Oil & Natural Gas Corporation Limited,Energy
TATAMOTORS,Tata Motors Limited,Consumer Discretionary
NTPC,NTPC Limited,Utilities
AXISBANK,Axis Bank Limited,Financials
WIPRO,Wipro Limited,Information Technology
M&M,Mahindra & Mahindra Limited,Consumer Discretionary
ASIANPAINT,Asian Paints Limited,Materials
ULTRACEMCO,UltraTech Cement Limited,Materials
BAJAJFINSV,Bajaj Finserv Limited,Financials
POWERGRID,Power Grid Corporation of India Limited,Utilities
NESTLEIND,Nestle India Limited,Consumer Staples
TATASTEEL,Tata Steel Limited,Materials
JIOFIN,Jio Financial Services Limited,Financials
GRASIM,Grasim Industries Limited,Materials
JSWSTEEL,JSW Steel Limited,Materials
HINDALCO,Hindalco Industries Limited,Materials
TECHM,Tech Mahindra Limited,Information Technology
LTIM,LTIMindtree Limited,Information Technology
SBILIFE,SBI Life Insurance Company Limited,Financials
HDFCLIFE,HDFC Life Insurance Company Limited,Financials
DIVISLAB,Divi's Laboratories Limited,Health Care
DRREDDY,Dr. Reddy's Laboratories Limited,Health Care
BAJAJ-AUTO,Bajaj Auto Limited,Consumer Discretionary
CIPLA,Cipla Limited,Health Care
BRITANNIA,Britannia Industries Limited,Consumer Staples
INDUSINDBK,IndusInd Bank Limited,Financials
COALINDIA,Coal India Limited,Energy
APOLLOHOSP,Apollo Hospitals Enterprise Limited,Health Care
EICHERMOT,Eicher Motors Limited,Consumer Discretionary
HEROMOTOCO,Hero MotoCorp Limited,Consumer Discretionary
TATACONSUM,Tata Consumer Products Limited,Consumer Staples
BPCL,Bharat Petroleum Corporation Limited,Energy
UPL,UPL Limited,Materials
SHREECEM,Shree Cement Limited,Materials
CHOLAFIN,Cholamandalam Investment and Finance,Financials
HAL,Hindustan Aeronautics Limited,Industrials
SIEMENS,Siemens Limited,Industrials
ABB,ABB India Limited,Industrials
BEL,Bharat Electronics Limited,Industrials
PIDILITIND,Pidilite Industries Limited,Materials
TRENT,Trent Limited,Consumer Discretionary
GODREJCP,Godrej Consumer Products Limited,Consumer Staples
DABUR,Dabur India Limited,Consumer Staples
ICICIGI,ICICI Lombard General Insurance,Financials
ICICIPRULI,ICICI Prudential Life Insurance,Financials
M&MFIN,Mahindra & Mahindra Financial Services,Financials
MUTHOOTFIN,Muthoot Finance Limited,Financials
RECLTD,REC Limited,Financials
PFC,Power Finance Corporation Limited,Financials
IRFC,Indian Railway Finance Corporation,Financials
INDIGO,InterGlobe Aviation Limited,Industrials
ZOMATO,Zomato Limited,Consumer Discretionary
NYKAA,FSN E-Commerce Ventures (Nykaa),Consumer Discretionary
PAYTM,One97 Communications (Paytm),Financials
TATAELXSI,Tata Elxsi Limited,Information Technology
LTTS,L&T Technology Services Limited,Information Technology
PERSISTENT,Persistent Systems Limited,Information Technology
KPITTECH,KPIT Technologies Limited,Information Technology
PAGEIND,Page Industries Limited,Consumer Discretionary
DLF,DLF Limited,Real Estate
GODREJPROP,Godrej Properties Limited,Real Estate
MACROTECH,Macrotech Developers (Lodha),Real Estate
TATACOMM,Tata Communications Limited,Communication Services
MINDSPACE,Mindspace Business Parks REIT,Real Estate
DMART,Avenue Supermarts Limited,Consumer Staples
SRF,SRF Limited,Materials
TVSMOTOR,TVS Motor Company Limited,Consumer Discretionary
ASHOKLEY,Ashok Leyland Limited,Industrials
AMBUJACEM,Ambuja Cements Limited,Materials
VEDL,Vedanta Limited,Materials
NMDC,NMDC Limited,Materials
SAIL,Steel Authority of India Limited,Materials
GAIL,GAIL (India) Limited,Energy
PETRONET,Petronet LNG Limited,Energy
IGL,Indraprastha Gas Limited,Utilities
MGL,Mahanagar Gas Limited,Utilities
CGPOWER,CG Power and Industrial Solutions,Industrials
POLYCAB,Polycab India Limited,Industrials
HAVELLS,Havells India Limited,Industrials
CROMPTON,Crompton Greaves Consumer Electricals,Industrials
VOLTAS,Voltas Limited,Industrials
DIXON,Dixon Technologies (India) Limited,Consumer Discretionary
OBEROIRLTY,Oberoi Realty Limited,Real Estate
PRESTIGE,Prestige Estates Projects Limited,Real Estate
PHOENIXLTD,The Phoenix Mills Limited,Real Estate
ALKEM,Alkem Laboratories Limited,Health Care
AUBANK,AU Small Finance Bank Limited,Financials
BANDHANBNK,Bandhan Bank Limited,Financials
BANKBARODA,Bank of Baroda,Financials
PNB,Punjab National Bank,Financials
CANBK,Canara Bank,Financials
UNIONBANK,Union Bank of India,Financials
INDIANB,Indian Bank,Financials
IDFCFIRSTB,IDFC First Bank Limited,Financials
FEDERALBNK,The Federal Bank Limited,Financials
CUMMINSIND,Cummins India Limited,Industrials
ESCORTS,Escorts Kubota Limited,Industrials
NAUKRI,Info Edge (India) Limited,Communication Services
JUBLFOOD,Jubilant FoodWorks Limited,Consumer Discretionary
MCDOWELL-N,United Spirits Limited,Consumer Staples
UBL,United Breweries Limited,Consumer Staples
MARICO,Marico Limited,Consumer Staples
COLPAL,Colgate-Palmolive (India) Limited,Consumer Staples
BERGEPAINT,Berger Paints India Limited,Materials
KANSAINER,Kansai Nerolac Paints Limited,Materials
BOSCHLTD,Bosch Limited,Consumer Discretionary
MRF,MRF Limited,Consumer Discretionary
BALKRISIND,Balkrishna Industries Limited,Consumer Discretionary
APOLLOTYRE,Apollo Tyres Limited,Consumer Discretionary
MOTHERSON,Samvardhana Motherson International,Consumer Discretionary
SONACOMS,Sona BLW Precision Forgings,Consumer Discretionary
POONAWALLA,Poonawalla Fincorp Limited,Financials
L&TFH,L&T Finance Holdings Limited,Financials
SHRIRAMFIN,Shriram Finance Limited,Financials
LICHSGFIN,LIC Housing Finance Limited,Financials
PNBHOUSING,PNB Housing Finance Limited,Financials
MCX,Multi Commodity Exchange of India,Financials
IEX,Indian Energy Exchange Limited,Financials
BSE,BSE Limited,Financials
CDSL,Central Depository Services (India),Financials
CAMS,Computer Age Management Services,Financials
SYNGENE,Syngene International Limited,Health Care
LAURUSLABS,Laurus Labs Limited,Health Care
GLAND,Gland Pharma Limited,Health Care
MAXHEALTH,Max Healthcare Institute Limited,Health Care
KIMS,Krishna Institute of Medical Sciences,Health Care
FORTIS,Fortis Healthcare Limited,Health Care
DEVYANI,Devyani International Limited,Consumer Discretionary
TATACHEM,Tata Chemicals Limited,Materials
DEEPAKNTR,Deepak Nitrite Limited,Materials
AARTIIND,Aarti Industries Limited,Materials
ATGL,Adani Total Gas Limited,Utilities
AWL,Adani Wilmar Limited,Consumer Staples
NYKAA,FSN E-Commerce Ventures,Consumer Discretionary
DELHIVERY,Delhivery Limited,Industrials
PBFINTECH,PB Fintech Limited (Policybazaar),Financials
STARHEALTH,Star Health and Allied Insurance,Financials
GICRE,General Insurance Corporation of India,Financials
NIACL,The New India Assurance Company,Financials
HINDCOPPER,Hindustan Copper Limited,Materials
NATIONALUM,National Aluminium Company Limited,Materials
JINDALSTEL,Jindal Steel & Power Limited,Materials
ASTRAL,Astral Limited,Industrials
SUPREMEIND,Supreme Industries Limited,Industrials
TORNTPHARM,Torrent Pharmaceuticals Limited,Health Care
TORNTPOWER,Torrent Power Limited,Utilities
TATAINVEST,Tata Investment Corporation Limited,Financials
MRPL,Mangalore Refinery and Petrochemicals,Energy
KALYANKJIL,Kalyan Jewellers India Limited,Consumer Discretionary
METROBRAND,Metro Brands Limited,Consumer Discretionary
RVNL,Rail Vikas Nigam Limited,Industrials
IRCON,Ircon International Limited,Industrials
MAZDOCK,Mazagon Dock Shipbuilders Limited,Industrials
COCHINSHIP,Cochin Shipyard Limited,Industrials
GRSE,Garden Reach Shipbuilders & Engineers,Industrials
BDL,Bharat Dynamics Limited,Industrials
BEML,BEML Limited,Industrials
GSPL,Gujarat State Petronet Limited,Utilities
GUJGASLTD,Gujarat Gas Limited,Utilities
CONCOR,Container Corporation of India Limited,Industrials
NHPC,NHPC Limited,Utilities
SJVN,SJVN Limited,Utilities
NLCINDIA,NLC India Limited,Utilities
HUDCO,Housing & Urban Development Corporation,Financials
ITI,ITI Limited,Information Technology
FSL,Firstsource Solutions Limited,Information Technology
SONATSOFTW,Sonata Software Limited,Information Technology
BSOFT,Birlasoft Limited,Information Technology
CYIENT,Cyient Limited,Information Technology
INTELLECT,Intellect Design Arena Limited,Information Technology
ROUTE,Route Mobile Limited,Communication Services
RATEGAIN,RateGain Travel Technologies,Information Technology
TRIDENT,Trident Limited,Consumer Discretionary
WELSPUNLIV,Welspun Living Limited,Consumer Discretionary
KPRMILL,K.P.R. Mill Limited,Consumer Discretionary
VBL,Varun Beverages Limited,Consumer Staples
RADICO,Radico Khaitan Limited,Consumer Staples
ABFRL,Aditya Birla Fashion and Retail,Consumer Discretionary
RAYMOND,Raymond Limited,Consumer Discretionary
BATAINDIA,Bata India Limited,Consumer Discretionary
RELAXO,Relaxo Footwears Limited,Consumer Discretionary
SUNDARMFIN,Sundaram Finance Limited,Financials
"""

stocks = []
for line in stocks_input.strip().split("\n"):
    parts = line.split(",", 2)
    if len(parts) == 3:
        symbol, name, sector = parts
        stocks.append({
            "symbol": f"{symbol}.NS",
            "name": name,
            "sector": sector
        })

output_file = "/Users/shivampatel/aether-isle/aether-fastapi/backend/services/indian_stocks.py"
with open(output_file, "r") as f:
    content = f.read()

# Replace INDIAN_STOCKS with new list
stocks_str = json.dumps(stocks, indent=4)

new_content = f"""# Dictionary of popular NSE/BSE stocks for better search by name
INDIAN_STOCKS = {stocks_str}

def search_indian_stocks(query: str, sector: str = None):
    \"\"\"Search local dictionary for indian stocks by name or symbol\"\"\"
    query_lower = query.lower()
    sector_lower = sector.lower() if sector else None
    
    results = []
    
    for stock in INDIAN_STOCKS:
        # Check if sector matches (if provided)
        if sector_lower and sector_lower not in stock['sector'].lower():
            continue
            
        # Match by symbol or name
        if query_lower in stock['symbol'].lower() or query_lower in stock['name'].lower():
            results.append({{
                "symbol": stock['symbol'],
                "name": stock['name'],
                "exchange": "NSE",
                "type": "EQUITY"
            }})
            
    return results[:10]  # Return top 10 matches
"""

with open(output_file, "w") as f:
    f.write(new_content)

print(f"Added {len(stocks)} stocks to indian_stocks.py")
