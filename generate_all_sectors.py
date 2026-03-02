import json

# Compile ~20-25 stocks for each of the 29 specific UI sectors.
sectors_map = {
    "Communication Services": [
        ("BHARTIARTL", "Bharti Airtel Limited"), ("IDEA", "Vodafone Idea Limited"), 
        ("TATACOMM", "Tata Communications Limited"), ("INDUSTOWER", "Indus Towers Limited"),
        ("ITI", "ITI Limited"), ("TEJASNET", "Tejas Networks Limited"),
        ("HFCL", "HFCL Limited"), ("TTML", "Tata Teleservices (Maharashtra) Limited"),
        ("ROUTE", "Route Mobile Limited"), ("VAKRANGEE", "Vakrangee Limited"),
        ("HATHWAY", "Hathway Cable & Datacom Limited"), ("DEN", "Den Networks Limited"),
        ("GTPL", "GTPL Hathway Limited"), ("ONMOBILE", "OnMobile Global Limited"),
        ("NELCO", "Nelco Limited"), ("MTNL", "Mahanagar Telephone Nigam Limited"),
        ("GTLINFRA", "GTL Infrastructure Limited"), ("TATACOFFEE", "Tata Coffee Limited"),
        ("NAUKRI", "Info Edge (India) Limited"), ("JUSTDIAL", "Just Dial Limited")
    ],
    "Consumer Discretionary": [
        ("TITAN", "Titan Company Limited"), ("TRENT", "Trent Limited"),
        ("ZOMATO", "Zomato Limited"), ("PAGEIND", "Page Industries Limited"),
        ("BATAINDIA", "Bata India Limited"), ("RELAXO", "Relaxo Footwears Limited"),
        ("METROBRAND", "Metro Brands Limited"), ("KALYANKJIL", "Kalyan Jewellers India Limited"),
        ("MANYAVAR", "Vedant Fashions Limited"), ("CAMPUS", "Campus Activewear Limited"),
        ("RAYMOND", "Raymond Limited"), ("ABFRL", "Aditya Birla Fashion and Retail Limited"),
        ("ARVIND", "Arvind Limited"), ("SHOPPERS", "Shoppers Stop Limited"),
        ("VGUARD", "V-Guard Industries Limited"), ("SYMPHONY", "Symphony Limited"),
        ("WHIRLPOOL", "Whirlpool of India Limited"), ("TTKPRESTIG", "TTK Prestige Limited"),
        ("BAJAJELEC", "Bajaj Electricals Limited"), ("CERA", "Cera Sanitaryware Limited")
    ],
    "Consumer Staples": [
        ("ITC", "ITC Limited"), ("HINDUNILVR", "Hindustan Unilever Limited"),
        ("NESTLEIND", "Nestle India Limited"), ("BRITANNIA", "Britannia Industries Limited"),
        ("TATACONSUM", "Tata Consumer Products Limited"), ("GODREJCP", "Godrej Consumer Products Limited"),
        ("DABUR", "Dabur India Limited"), ("MARICO", "Marico Limited"),
        ("COLPAL", "Colgate-Palmolive (India) Limited"), ("VBL", "Varun Beverages Limited"),
        ("DMART", "Avenue Supermarts Limited"), ("PGHH", "Procter & Gamble Hygiene and Health Care"),
        ("EMAMILTD", "Emami Limited"), ("RADICO", "Radico Khaitan Limited"),
        ("MCDOWELL-N", "United Spirits Limited"), ("UBL", "United Breweries Limited"),
        ("JYOTHYLAB", "Jyothy Labs Limited"), ("BIKAJI", "Bikaji Foods International Limited"),
        ("AWL", "Adani Wilmar Limited"), ("PATANJALI", "Patanjali Foods Limited"),
        ("HONASA", "Honasa Consumer (Mamaearth)")
    ],
    "Energy": [
        ("RELIANCE", "Reliance Industries Limited"), ("ONGC", "Oil & Natural Gas Corporation Limited"),
        ("COALINDIA", "Coal India Limited"), ("IOC", "Indian Oil Corporation Limited"),
        ("BPCL", "Bharat Petroleum Corporation Limited"), ("HPCL", "Hindustan Petroleum Corporation Limited"),
        ("GAIL", "GAIL (India) Limited"), ("PETRONET", "Petronet LNG Limited"),
        ("OIL", "Oil India Limited"), ("MRPL", "Mangalore Refinery and Petrochemicals"),
        ("CHENNPETRO", "Chennai Petroleum Corporation"), ("BORORENEW", "Borosil Renewables Limited"),
        ("SUZLON", "Suzlon Energy Limited"), ("INOXWIND", "Inox Wind Limited"),
        ("KPIGREEN", "KPI Green Energy Limited"), ("SWL", "Sterling and Wilson Renewable Energy"),
        ("WAAREE", "Waaree Renewable Technologies"), ("ORIANA", "Oriana Power Limited"),
        ("RPOWER", "Reliance Power Limited"), ("NIBE", "Nibe Limited")
    ],
    "Financials": [
        ("BAJFINANCE", "Bajaj Finance Limited"), ("BAJAJFINSV", "Bajaj Finserv Limited"),
        ("JIOFIN", "Jio Financial Services Limited"), ("CHOLAFIN", "Cholamandalam Investment and Finance"),
        ("SHRIRAMFIN", "Shriram Finance Limited"), ("MUTHOOTFIN", "Muthoot Finance Limited"),
        ("RECLTD", "REC Limited"), ("PFC", "Power Finance Corporation"),
        ("IRFC", "Indian Railway Finance Corporation"), ("SBIKARD", "SBI Cards and Payment Services"),
        ("HDFCAMC", "HDFC Asset Management Company"), ("NAM-INDIA", "Nippon Life India Asset Management"),
        ("MCX", "Multi Commodity Exchange of India"), ("CDSL", "Central Depository Services (India)"),
        ("BSE", "BSE Limited"), ("CAMS", "Computer Age Management Services"),
        ("PAYTM", "One97 Communications (Paytm)"), ("PBFINTECH", "PB Fintech (Policybazaar)"),
        ("MANAPPURAM", "Manappuram Finance Limited"), ("M&MFIN", "Mahindra & Mahindra Financial Services")
    ],
    "Healthcare": [
        ("MAXHEALTH", "Max Healthcare Institute"), ("FORTIS", "Fortis Healthcare Limited"),
        ("KIMS", "Krishna Institute of Medical Sciences"), ("APOLLOHOSP", "Apollo Hospitals Enterprise"),
        ("NARAYANA", "Narayana Hrudayalaya Limited"), ("GLOBALHEALTH", "Global Health Limited (Medanta)"),
        ("ASTERDM", "Aster DM Healthcare Limited"), ("HCG", "Healthcare Global Enterprises Limited"),
        ("SHALBY", "Shalby Limited"), ("KOVAI", "Kovai Medical Center and Hospital"),
        ("METROPOLIS", "Metropolis Healthcare Limited"), ("DRLALPATHLABS", "Dr. Lal PathLabs Limited"),
        ("THYROCARE", "Thyrocare Technologies Limited"), ("VIJAYA", "Vijaya Diagnostic Centre Limited"),
        ("SYNGENE", "Syngene International Limited"), ("LAURUSLABS", "Laurus Labs Limited"),
        ("DIVISLAB", "Divi's Laboratories Limited"), ("GLAND", "Gland Pharma Limited"),
        ("SUVENPHAR", "Suven Pharmaceuticals Limited"), ("NEULANDLAB", "Neuland Laboratories Limited")
    ],
    "Industrials": [
        ("LT", "Larsen & Toubro Limited"), ("SIEMENS", "Siemens Limited"),
        ("ABB", "ABB India Limited"), ("CGPOWER", "CG Power and Industrial Solutions"),
        ("HONAUT", "Honeywell Automation India Limited"), ("THERMAX", "Thermax Limited"),
        ("TRITURBINE", "Triveni Turbine Limited"), ("AIAENG", "AIA Engineering Limited"),
        ("CUMMINSIND", "Cummins India Limited"), ("ESCORTS", "Escorts Kubota Limited"),
        ("TIMKEN", "Timken India Limited"), ("SKFINDIA", "SKF India Limited"),
        ("SCHAEFFLER", "Schaeffler India Limited"), ("CARBORUNIV", "Carborundum Universal Limited"),
        ("GRINDWELL", "Grindwell Norton Limited"), ("ELECON", "Elecon Engineering Company Limited"),
        ("KEC", "KEC International Limited"), ("KALPATPOWR", "Kalpataru Projects International"),
        ("VOLTAS", "Voltas Limited"), ("BLUESTARCO", "Blue Star Limited")
    ],
    "Information Technology": [
        ("TECHM", "Tech Mahindra Limited"), ("LTIM", "LTIMindtree Limited"),
        ("PERSISTENT", "Persistent Systems Limited"), ("LTTS", "L&T Technology Services Limited"),
        ("COFORGE", "Coforge Limited"), ("MPHASIS", "Mphasis Limited"),
        ("CYIENT", "Cyient Limited"), ("SONATSOFTW", "Sonata Software Limited"),
        ("BSOFT", "Birlasoft Limited"), ("ZENSARTECH", "Zensar Technologies Limited"),
        ("INTELLECT", "Intellect Design Arena Limited"), ("HAPPSTMNDS", "Happiest Minds Technologies"),
        ("NEWGEN", "Newgen Software Technologies"), ("LATENTVIEW", "Latent View Analytics"),
        ("MAPMYINDIA", "CE Info Systems Limited"), ("OLECTRA", "Olectra Greentech Limited"),
        ("INFIBEAM", "Infibeam Avenues Limited"), ("NUCLEUS", "Nucleus Software Exports Limited"),
        ("RBLUE", "Redington Limited"), ("MASTEK", "Mastek Limited")
    ],
    "Materials": [
        ("ASIANPAINT", "Asian Paints Limited"), ("BERGEPAINT", "Berger Paints India Limited"),
        ("KANSAINER", "Kansai Nerolac Paints Limited"), ("PIDILITIND", "Pidilite Industries Limited"),
        ("SRF", "SRF Limited"), ("UPL", "UPL Limited"),
        ("PIIND", "PI Industries Limited"), ("DEEPAKNTR", "Deepak Nitrite Limited"),
        ("AARTIIND", "Aarti Industries Limited"), ("TATACHEM", "Tata Chemicals Limited"),
        ("GUJALKALI", "Gujarat Alkalies and Chemicals"), ("GNFC", "Gujarat Narmada Valley Fertilizers"),
        ("GSFC", "Gujarat State Fertilizers & Chemicals"), ("CHAMBLFERT", "Chambal Fertilisers and Chemicals"),
        ("COROMANDEL", "Coromandel International Limited"), ("NAVINFLUOR", "Navin Fluorine International"),
        ("ATUL", "Atul Limited"), ("ALKYLAMINE", "Alkyl Amines Chemicals Limited"),
        ("BALAMIN", "Balaji Amines Limited"), ("VINATIORGA", "Vinati Organics Limited")
    ],
    "Real Estate": [
        ("DLF", "DLF Limited"), ("GODREJPROP", "Godrej Properties Limited"),
        ("MACROTECH", "Macrotech Developers (Lodha)"), ("OBEROIRLTY", "Oberoi Realty Limited"),
        ("PRESTIGE", "Prestige Estates Projects Limited"), ("PHOENIXLTD", "The Phoenix Mills Limited"),
        ("BRIGADE", "Brigade Enterprises Limited"), ("SOBHA", "Sobha Limited"),
        ("PURVA", "Puravankara Limited"), ("MAHLIFE", "Mahindra Lifespace Developers"),
        ("SUNTECK", "Sunteck Realty Limited"), ("KOLTEPATIL", "Kolte-Patil Developers Limited"),
        ("IBREALEST", "Indiabulls Real Estate Limited"), ("OMAXE", "Omaxe Limited"),
        ("ANANTRAJ", "Anant Raj Limited"), ("ASHIANA", "Ashiana Housing Limited"),
        ("ARVINDSMART", "Arvind SmartSpaces Limited"), ("KEYSTONERE", "Keystone Realtors Limited"),
        ("SIGNATURE", "Signatureglobal (India) Limited"), ("SURAJEST", "Suraj Estate Developers Limited")
    ],
    "Utilities": [
        ("NTPC", "NTPC Limited"), ("POWERGRID", "Power Grid Corporation of India"),
        ("IGL", "Indraprastha Gas Limited"), ("MGL", "Mahanagar Gas Limited"),
        ("GUJGASLTD", "Gujarat Gas Limited"), ("ATGL", "Adani Total Gas Limited"),
        ("TATAPOWER", "Tata Power Company Limited"), ("ADANIPOWER", "Adani Power Limited"),
        ("TORNTPOWER", "Torrent Power Limited"), ("NHPC", "NHPC Limited"),
        ("SJVN", "SJVN Limited"), ("JSWENERGY", "JSW Energy Limited"),
        ("ADANIENSOL", "Adani Energy Solutions Limited"), ("CESC", "CESC Limited"),
        ("IEX", "Indian Energy Exchange Limited"), ("PTC", "PTC India Limited"),
        ("RELIANCEPOWER", "Reliance Power Limited"), ("GMRINFRA", "GMR Airports Infrastructure"),
        ("VKAMAYYA", "V.K.A.M.A.Y.Y.A. Limited"), ("NLCINDIA", "NLC India Limited")
    ],
    "Aerospace & Defense": [
        ("HAL", "Hindustan Aeronautics Limited"), ("BEL", "Bharat Electronics Limited"),
        ("BDL", "Bharat Dynamics Limited"), ("MAZDOCK", "Mazagon Dock Shipbuilders Limited"),
        ("COCHINSHIP", "Cochin Shipyard Limited"), ("GRSE", "Garden Reach Shipbuilders"),
        ("BEML", "BEML Limited"), ("BHEL", "Bharat Heavy Electricals Limited"),
        ("MIDHANI", "Mishra Dhatu Nigam Limited"), ("ASTRAMICRO", "Astra Microwave Products Limited"),
        ("DATA-P", "Data Patterns (India) Limited"), ("MTARTECH", "MTAR Technologies Limited"),
        ("ZENPECS", "Zen Technologies Limited"), ("PARAS", "Paras Defence and Space Technologies"),
        ("DCXINDIA", "DCX Systems Limited"), ("APOLLOMICRO", "Apollo Micro Systems Limited"),
        ("WALCHANNAG", "Walchandnagar Industries Limited"), ("PTCIL", "PTC Industries Limited"),
        ("SOLARINDS", "Solar Industries India Limited"), ("PREMIEREXP", "Premier Explosives Limited")
    ],
    "Automobiles & Components": [
        ("MARUTI", "Maruti Suzuki India Limited"), ("TATAMOTORS", "Tata Motors Limited"),
        ("M&M", "Mahindra & Mahindra Limited"), ("BAJAJ-AUTO", "Bajaj Auto Limited"),
        ("EICHERMOT", "Eicher Motors Limited"), ("HEROMOTOCO", "Hero MotoCorp Limited"),
        ("TVSMOTOR", "TVS Motor Company Limited"), ("ASHOKLEY", "Ashok Leyland Limited"),
        ("OLECTRA", "Olectra Greentech Limited"), ("FORCEMOT", "Force Motors Limited"),
        ("BOSCHLTD", "Bosch Limited"), ("MOTHERSON", "Samvardhana Motherson International"),
        ("SONACOMS", "Sona BLW Precision Forgings"), ("MRF", "MRF Limited"),
        ("APOLLOTYRE", "Apollo Tyres Limited"), ("BALKRISIND", "Balkrishna Industries Limited"),
        ("CEATLTD", "CEAT Limited"), ("AMARAJABAT", "Amara Raja Energy & Mobility"),
        ("EXIDEIND", "Exide Industries Limited"), ("ENDURANCE", "Endurance Technologies Limited")
    ],
    "Banks": [
        ("HDFCBANK", "HDFC Bank Limited"), ("ICICIBANK", "ICICI Bank Limited"),
        ("SBIN", "State Bank of India"), ("KOTAKBANK", "Kotak Mahindra Bank Limited"),
        ("AXISBANK", "Axis Bank Limited"), ("INDUSINDBK", "IndusInd Bank Limited"),
        ("IDFCFIRSTB", "IDFC First Bank Limited"), ("FEDERALBNK", "The Federal Bank Limited"),
        ("AUBANK", "AU Small Finance Bank Limited"), ("PNB", "Punjab National Bank"),
        ("BANKBARODA", "Bank of Baroda"), ("UNIONBANK", "Union Bank of India"),
        ("CANBK", "Canara Bank"), ("INDIANB", "Indian Bank"),
        ("BANKINDIA", "Bank of India"), ("CENTRALBK", "Central Bank of India"),
        ("UCOBANK", "UCO Bank"), ("IOB", "Indian Overseas Bank"),
        ("MAHABANK", "Bank of Maharashtra"), ("PSB", "Punjab & Sind Bank")
    ],
    "Biotechnology": [
        ("BIOCON", "Biocon Limited"), ("SYNGENE", "Syngene International Limited"),
        ("PANACEABIO", "Panacea Biotec Limited"), ("SHILPAMED", "Shilpa Medicare Limited"),
        ("SUVEN", "Suven Life Sciences Limited"), ("CONCORDBIO", "Concord Biotech Limited"),
        ("NOVARTIND", "Novartis India Limited"), ("PFOCUS", "Prime Focus Limited"),
        ("BDR", "BDR Pharmaceuticals"), ("HESTERBIO", "Hester Biosciences Limited"),
        ("ADVANCED", "Advanced Enzyme Technologies"), ("MANGALAM", "Mangalam Drugs and Organics"),
        ("NEULANDLAB", "Neuland Laboratories Limited"), ("KOPRAN", "Kopran Limited"),
        ("SMSPHARMA", "SMS Pharmaceuticals Limited"), ("NATHBIOGEN", "Nath Bio-Genes (India) Limited"),
        ("BAYERCROP", "Bayer CropScience Limited"), ("PIIND", "PI Industries Limited"),
        ("UPL", "UPL Limited"), ("RALLIS", "Rallis India Limited")
    ],
    "Capital Goods": [
        ("LT", "Larsen & Toubro Limited"), ("CGPOWER", "CG Power and Industrial Solutions"),
        ("BHEL", "Bharat Heavy Electricals Limited"), ("BEL", "Bharat Electronics Limited"),
        ("SIEMENS", "Siemens Limited"), ("ABB", "ABB India Limited"),
        ("THERMAX", "Thermax Limited"), ("TRITURBINE", "Triveni Turbine Limited"),
        ("AIAENG", "AIA Engineering Limited"), ("CUMMINSIND", "Cummins India Limited"),
        ("ELECON", "Elecon Engineering Company Limited"), ("KEC", "KEC International Limited"),
        ("KALPATPOWR", "Kalpataru Projects International"), ("VOLTAS", "Voltas Limited"),
        ("BLUESTARCO", "Blue Star Limited"), ("HAVELLS", "Havells India Limited"),
        ("POLYCAB", "Polycab India Limited"), ("CROMPTON", "Crompton Greaves Consumer Electricals"),
        ("FINCABLES", "Finolex Cables Limited"), ("KEI", "KEI Industries Limited")
    ],
    "Commercial Services": [
        ("QUESS", "Quess Corp Limited"), ("TEAMLEASE", "TeamLease Services Limited"),
        ("SIS", "SIS Limited"), ("UPDATER", "Updater Services Limited"),
        ("BLUEDART", "Blue Dart Express Limited"), ("DELHIVERY", "Delhivery Limited"),
        ("TCIEXP", "TCI Express Limited"), ("VRL", "VRL Logistics Limited"),
        ("MAHLOG", "Mahindra Logistics Limited"), ("GATI", "Allcargo Gati Limited"),
        ("SNOWMAN", "Snowman Logistics Limited"), ("NAVKARCORP", "Navkar Corporation Limited"),
        ("IRCTC", "Indian Railway Catering and Tourism"), ("THOMASCOOK", "Thomas Cook (India) Limited"),
        ("BLISSGVS", "Bliss GVS Pharma Limited"), ("ECLERX", "eClerx Services Limited"),
        ("FSL", "Firstsource Solutions Limited"), ("HGS", "Hinduja Global Solutions Limited"),
        ("BLS", "BLS International Services Limited"), ("CMSINFO", "CMS Info Systems Limited")
    ],
    "Consumer Durables": [
        ("DIXON", "Dixon Technologies (India) Limited"), ("VOLTAS", "Voltas Limited"),
        ("BLUESTARCO", "Blue Star Limited"), ("HAVELLS", "Havells India Limited"),
        ("CROMPTON", "Crompton Greaves Consumer Electricals"), ("SYMPHONY", "Symphony Limited"),
        ("WHIRLPOOL", "Whirlpool of India Limited"), ("TTKPRESTIG", "TTK Prestige Limited"),
        ("BAJAJELEC", "Bajaj Electricals Limited"), ("VGUARD", "V-Guard Industries Limited"),
        ("ORIENTELEC", "Orient Electric Limited"), ("EUREKAFORB", "Eureka Forbes Limited"),
        ("PGEL", "PG Electroplast Limited"), ("AMBER", "Amber Enterprises India Limited"),
        ("CERA", "Cera Sanitaryware Limited"), ("SOMANYCERA", "Somany Ceramics Limited"),
        ("KAJARIRCER", "Kajaria Ceramics Limited"), ("CENTURYPLY", "Century Plyboards (India) Limited"),
        ("GREENPLY", "Greenply Industries Limited"), ("GREENPANEL", "Greenpanel Industries Limited")
    ],
    "Food & Beverages": [
        ("NESTLEIND", "Nestle India Limited"), ("BRITANNIA", "Britannia Industries Limited"),
        ("TATACONSUM", "Tata Consumer Products Limited"), ("ITC", "ITC Limited"),
        ("VBL", "Varun Beverages Limited"), ("RADICO", "Radico Khaitan Limited"),
        ("MCDOWELL-N", "United Spirits Limited"), ("UBL", "United Breweries Limited"),
        ("AWL", "Adani Wilmar Limited"), ("PATANJALI", "Patanjali Foods Limited"),
        ("BIKAJI", "Bikaji Foods International Limited"), ("PRATAAP", "Prataap Snacks Limited"),
        ("DFMFOODS", "DFM Foods Limited"), ("AAKASH", "Aakash Exploration Services Limited"),
        ("LOTUSEYE", "Lotus Eye Hospital and Institute Limited"), ("HERITGFOOD", "Heritage Foods Limited"),
        ("DODLA", "Dodla Dairy Limited"), ("PARAGMILK", "Parag Milk Foods Limited"),
        ("HATSUN", "Hatsun Agro Product Limited"), ("KRBL", "KRBL Limited")
    ],
    "Insurance": [
        ("LICI", "Life Insurance Corporation of India"), ("HDFCLIFE", "HDFC Life Insurance"),
        ("SBILIFE", "SBI Life Insurance"), ("ICICIPRULI", "ICICI Prudential Life Insurance"),
        ("MAXFIN", "Max Financial Services Limited"), ("ICICIGI", "ICICI Lombard General Insurance"),
        ("STARHEALTH", "Star Health and Allied Insurance"), ("GICRE", "General Insurance Corporation of India"),
        ("NIACL", "The New India Assurance Company"), ("PBFINTECH", "PB Fintech (Policybazaar)"),
        ("GOIL", "General Insurance Corporation of India"), ("RELIGARE", "Religare Enterprises Limited"),
        ("CHOICEIN", "Choice International Limited"), ("5PAISA", "5paisa Capital Limited"),
        ("ANGELONE", "Angel One Limited"), ("MOTILALOFS", "Motilal Oswal Financial Services"),
        ("IIFL", "IIFL Finance Limited"), ("EDELWEISS", "Edelweiss Financial Services Limited"),
        ("JMFINANCIL", "JM Financial Limited"), ("GEOJITFSL", "Geojit Financial Services Limited")
    ],
    "Media & Entertainment": [
        ("ZEEL", "Zee Entertainment Enterprises"), ("SUNTV", "Sun TV Network Limited"),
        ("NETWORK18", "Network18 Media & Investments"), ("TV18BRDCST", "TV18 Broadcast Limited"),
        ("NDTV", "New Delhi Television Limited"), ("PVRINOX", "PVR INOX Limited"),
        ("SAREGAMA", "Saregama India Limited"), ("TIPSFILMS", "Tips Films Limited"),
        ("TIPSIND", "Tips Industries Limited"), ("DISHTV", "Dish TV India Limited"),
        ("HATHWAY", "Hathway Cable & Datacom Limited"), ("DEN", "Den Networks Limited"),
        ("NAVKARCORP", "Navkar Corporation Limited"), ("DBCORP", "D.B. Corp Limited"),
        ("JAGRAN", "Jagran Prakashan Limited"), ("HTMEDIA", "HT Media Limited"),
        ("ENIL", "Entertainment Network (India) Limited"), ("TVTODAY", "T.V. Today Network Limited"),
        ("UFO", "UFO Moviez India Limited"), ("ERIS", "Eris Lifesciences Limited")
    ],
    "Pharmaceuticals": [
        ("SUNPHARMA", "Sun Pharmaceutical Industries"), ("CIPLA", "Cipla Limited"),
        ("DRREDDY", "Dr. Reddy's Laboratories"), ("DIVISLAB", "Divi's Laboratories"),
        ("LUPIN", "Lupin Limited"), ("AUROPHARMA", "Aurobindo Pharma"),
        ("ZYDUSLIFE", "Zydus Lifesciences"), ("TORNTPHARM", "Torrent Pharmaceuticals"),
        ("GLENMARK", "Glenmark Pharmaceuticals"), ("ALKEM", "Alkem Laboratories"),
        ("LAURUSLABS", "Laurus Labs"), ("GLAND", "Gland Pharma"),
        ("NATCOPHARM", "Natco Pharma"), ("AJANTPHARM", "Ajanta Pharma"),
        ("ABBOTINDIA", "Abbott India"), ("SANOFI", "Sanofi India"),
        ("GSKCONS", "GlaxoSmithKline Pharmaceuticals"), ("JBCHEPHARM", "J.B. Chemicals & Pharmaceuticals"),
        ("GRANULES", "Granules India"), ("IPCALAB", "IPCA Laboratories")
    ],
    "Retail": [
        ("TRENT", "Trent Limited"), ("DMART", "Avenue Supermarts Limited"),
        ("ZOMATO", "Zomato Limited"), ("NYKAA", "FSN E-Commerce Ventures"),
        ("ABFRL", "Aditya Birla Fashion and Retail"), ("SHOPPERS", "Shoppers Stop Limited"),
        ("VMART", "V-Mart Retail Limited"), ("V2RETAIL", "V2 Retail Limited"),
        ("SPENCERS", "Spencer's Retail Limited"), ("BATAINDIA", "Bata India Limited"),
        ("METROBRAND", "Metro Brands Limited"), ("RELAXO", "Relaxo Footwears Limited"),
        ("KALYANKJIL", "Kalyan Jewellers India Limited"), ("TITAN", "Titan Company Limited"),
        ("MANYAVAR", "Vedant Fashions Limited"), ("CAMPUS", "Campus Activewear Limited"),
        ("ETHOSLTD", "Ethos Limited"), ("CARTARDEF", "Cartrade Tech Limited"),
        ("EBIX", "Ebixcash Limited"), ("INFOEDGE", "Info Edge (India) Limited")
    ],
    "Semiconductors": [
        ("CGPOWER", "CG Power and Industrial Solutions"), ("DIXON", "Dixon Technologies (India) Limited"),
        ("KAYNES", "Kaynes Technology India Limited"), ("SYRMA", "Syrma SGS Technology Limited"),
        ("AVALON", "Avalon Technologies Limited"), ("ASMTEC", "ASM Technologies Limited"),
        ("MOSCHIP", "Moschip Technologies Limited"), ("SPEL", "SPEL Semiconductor Limited"),
        ("RRP", "RRP Semiconductor Limited"), ("AARON", "Aaron Industries Limited"),
        ("BCC", "BCC Fuba India Limited"), ("CENTUM", "Centum Electronics Limited"),
        ("MICROLE", "Micronics Limited"), ("SAHAJ", "Sahaj Solar Limited"),
        ("SAKSOFT", "Saksoft Limited"), ("SASKEN", "Sasken Technologies Limited"),
        ("TATAELXSI", "Tata Elxsi Limited"), ("VINSYS", "Vinsys IT Services India Limited"),
        ("XPROINDIA", "Xpro India Limited"), ("ZENTEC", "Zen Technologies Limited")
    ],
    "Software & Services": [
        ("TCS", "Tata Consultancy Services Limited"), ("INFY", "Infosys Limited"),
        ("HCLTECH", "HCL Technologies Limited"), ("WIPRO", "Wipro Limited"),
        ("TECHM", "Tech Mahindra Limited"), ("LTIM", "LTIMindtree Limited"),
        ("PERSISTENT", "Persistent Systems Limited"), ("LTTS", "L&T Technology Services Limited"),
        ("COFORGE", "Coforge Limited"), ("MPHASIS", "Mphasis Limited"),
        ("TATAELXSI", "Tata Elxsi Limited"), ("KPITTECH", "KPIT Technologies Limited"),
        ("CYIENT", "Cyient Limited"), ("SONATSOFTW", "Sonata Software Limited"),
        ("BSOFT", "Birlasoft Limited"), ("ZENSARTECH", "Zensar Technologies Limited"),
        ("INTELLECT", "Intellect Design Arena Limited"), ("HAPPSTMNDS", "Happiest Minds Technologies"),
        ("NEWGEN", "Newgen Software Technologies"), ("LATENTVIEW", "Latent View Analytics")
    ],
    "Telecommunication Services": [
        ("BHARTIARTL", "Bharti Airtel Limited"), ("IDEA", "Vodafone Idea Limited"), 
        ("TATACOMM", "Tata Communications Limited"), ("INDUSTOWER", "Indus Towers Limited"),
        ("ITI", "ITI Limited"), ("TEJASNET", "Tejas Networks Limited"),
        ("HFCL", "HFCL Limited"), ("TTML", "Tata Teleservices (Maharashtra) Limited"),
        ("ROUTE", "Route Mobile Limited"), ("VAKRANGEE", "Vakrangee Limited"),
        ("HATHWAY", "Hathway Cable & Datacom Limited"), ("DEN", "Den Networks Limited"),
        ("GTPL", "GTPL Hathway Limited"), ("ONMOBILE", "OnMobile Global Limited"),
        ("NELCO", "Nelco Limited"), ("MTNL", "Mahanagar Telephone Nigam Limited"),
        ("GTLINFRA", "GTL Infrastructure Limited"), ("TATACOFFEE", "Tata Coffee Limited"),
        ("VXLINSTR", "VXL Instruments Limited"), ("MRO-TEK", "MRO-TEK Realty Limited")
    ],
    "Transportation": [
        ("INDIGO", "InterGlobe Aviation Limited"), ("CONCOR", "Container Corporation of India"),
        ("DELHIVERY", "Delhivery Limited"), ("BLUEDART", "Blue Dart Express Limited"),
        ("TCIEXP", "TCI Express Limited"), ("VRL", "VRL Logistics Limited"),
        ("MAHLOG", "Mahindra Logistics Limited"), ("GATI", "Allcargo Gati Limited"),
        ("SNOWMAN", "Snowman Logistics Limited"), ("NAVKARCORP", "Navkar Corporation Limited"),
        ("IRCTC", "Indian Railway Catering and Tourism"), ("THOMASCOOK", "Thomas Cook (India) Limited"),
        ("EASEMYTRIP", "Easy Trip Planners Limited"), ("SPIC", "SpiceJet Limited"),
        ("JETAIRWAYS", "Jet Airways (India) Limited"), ("M&M", "Mahindra & Mahindra Limited"),
        ("ASHOKLEY", "Ashok Leyland Limited"), ("TATAMOTORS", "Tata Motors Limited"),
        ("MARUTI", "Maruti Suzuki India Limited"), ("BAJAJ-AUTO", "Bajaj Auto Limited")
    ],
    "ETF/Index Fund": [
        ("NIFTYBEES", "Nippon India ETF Nifty 50 BeES"), ("BANKBEES", "Nippon India ETF Bank BeES"),
        ("ITBEES", "Nippon India ETF IT BeES"), ("LIQUIDBEES", "Nippon India ETF Liquid BeES"),
        ("GOLDBEES", "Nippon India ETF Gold BeES"), ("PHARMABEES", "Nippon India ETF Pharma BeES"),
        ("CPSEETF", "CPSE Exchange Traded Fund"), ("ICICINIFTY", "ICICI Prudential Nifty ETF"),
        ("SETFNIF50", "SBI-ETF Nifty 50"), ("HDFCNIFTY", "HDFC Nifty 50 ETF"),
        ("JUNIORBEES", "Nippon India ETF Junior BeES"), ("PSUBNKBEES", "Nippon India ETF PSU Bank BeES"),
        ("CONSUMBEES", "Nippon India ETF Consumption BeES"), ("INFRABEES", "Nippon India ETF Infrastructure BeES"),
        ("SILVERBEES", "Nippon India ETF Silver BeES"), ("AUTOBEES", "Nippon India ETF Auto BeES"),
        ("FMCGBEES", "Nippon India ETF FMCG BeES"), ("DIVOPPBEES", "Nippon India ETF Dividend Opportunities"),
        ("MOM50", "Motilal Oswal M50 ETF"), ("MID150BEES", "Nippon India ETF Nifty Midcap 150")
    ],
    "Other": [
        ("ADANIENT", "Adani Enterprises Limited"), ("IRCTC", "Indian Railway Catering and Tourism"),
        ("BSE", "BSE Limited"), ("MCX", "Multi Commodity Exchange of India"),
        ("CDSL", "Central Depository Services (India)"), ("CAMS", "Computer Age Management Services"),
        ("IEX", "Indian Energy Exchange Limited"), ("DELHIVERY", "Delhivery Limited"),
        ("ZOMATO", "Zomato Limited"), ("NYKAA", "FSN E-Commerce Ventures"),
        ("PAYTM", "One97 Communications (Paytm)"), ("HONASA", "Honasa Consumer (Mamaearth)"),
        ("AWL", "Adani Wilmar Limited"), ("JIOFIN", "Jio Financial Services Limited"),
        ("PBFINTECH", "PB Fintech (Policybazaar)"), ("STARHEALTH", "Star Health and Allied Insurance"),
        ("MAPMYINDIA", "CE Info Systems Limited"), ("EASEMYTRIP", "Easy Trip Planners Limited"),
        ("NAUKRI", "Info Edge (India) Limited"), ("TATAINVEST", "Tata Investment Corporation")
    ]
}

# Ensure all 29 UI Dropdown sectors exact strings map correctly to this list
# By keeping the UI keys exactly matching the sectors_map keys

stocks_json = []

for sector, stock_list in sectors_map.items():
    for symbol, name in stock_list:
        stocks_json.append({
            "symbol": f"{symbol}.NS",
            "name": name,
            "sector": sector
        })

output_file = "/Users/shivampatel/aether-isle/aether-fastapi/backend/services/indian_stocks.py"

content = f"""import json

# Dictionary of popular NSE/BSE stocks across 29 sectors for accurate offline search
INDIAN_STOCKS = {json.dumps(stocks_json, indent=4)}

def search_indian_stocks(query: str, sector: str = None):
    \"\"\"Search local dictionary for indian stocks by name or symbol\"\"\"
    query_lower = query.lower()
    sector_lower = sector.lower() if sector else None
    
    # We now have exact 1:1 mapping with the 29 UI sectors
    
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
            
    # Remove duplicates preserving order
    unique_results = []
    seen = set()
    for item in results:
        if item['symbol'] not in seen:
            unique_results.append(item)
            seen.add(item['symbol'])
            
    return unique_results[:15]  # Return top 15 matches
"""

with open(output_file, "w") as f:
    f.write(content)

print(f"Successfully generated indian_stocks.py with {len(stocks_json)} total stocks across {len(sectors_map)} sectors.")
