import json
import re

extra_stocks = {
    "Communication Services": [
        ("TATACOMM", "Tata Communications"),("TEJASNET", "Tejas Networks"),("HFCL", "HFCL"),
        ("NAUKRI", "Info Edge"),("JUSTDIAL", "Just Dial"),("MTNL", "MTNL"),
        ("GTLINFRA", "GTL Infrastructure"),("INDOSTAR", "IndoStar Capital"),
        ("SMLISUZU", "SML Isuzu"),("MASTEK", "Mastek"),("ONMOBILE", "OnMobile"),
        ("QUICKHEAL", "Quick Heal Tech"),("TATAELXSI", "Tata Elxsi"),("CYIENT", "Cyient"),
        ("INTELLECT", "Intellect Design"),("BSOFT", "Birlasoft"),("ZENSARTECH", "Zensar Tech"),
        ("ROUTE", "Route Mobile"),("VAKRANGEE", "Vakrangee"),("HATHWAY", "Hathway Cable"),
        ("DEN", "DEN Networks"),("GTPL", "GTPL Hathway"),("NELCO", "Nelco"),
        ("TV18BRDCST", "TV18 Broadcast"),("NETWORK18", "Network18"),("SUNTV", "Sun TV"),
        ("ZEEL", "Zee Ent"),("NDTV", "NDTV"),("PVRINOX", "PVR INOX"),("SAREGAMA", "Saregama")
    ],
    "Consumer Discretionary": [
        ("KALYANKJIL", "Kalyan Jewellers"),("BATAINDIA", "Bata India"),("RELAXO", "Relaxo Footwears"),
        ("METROBRAND", "Metro Brands"),("CAMPUS", "Campus Activewear"),("MANYAVAR", "Vedant Fashions"),
        ("RAYMOND", "Raymond"),("ABFRL", "Aditya Birla Fashion"),("ARVIND", "Arvind"),
        ("SHOPPERS", "Shoppers Stop"),("VGUARD", "V-Guard Industries"),("SYMPHONY", "Symphony"),
        ("WHIRLPOOL", "Whirlpool of India"),("TTKPRESTIG", "TTK Prestige"),("BAJAJELEC", "Bajaj Electricals"),
        ("CERA", "Cera Sanitaryware"),("SOMANYCERA", "Somany Ceramics"),("KAJARIRCER", "Kajaria Ceramics"),
        ("CENTURYPLY", "Century Plyboards"),("GREENPLY", "Greenply"),("GREENPANEL", "Greenpanel"),
        ("DIXON", "Dixon Tech"),("AMBER", "Amber Ent"),("PGEL", "PG Electroplast"),
        ("BLUESTARCO", "Blue Star"),("VOLTAS", "Voltas"),("HAVELLS", "Havells"),
        ("CROMPTON", "Crompton Greaves"),("ORIENTELEC", "Orient Electric"),("JCHAC", "Johnson Controls-Hitachi")
    ],
    "Consumer Staples": [
        ("VBL", "Varun Beverages"),("DMART", "Avenue Supermarts"),("RADICO", "Radico Khaitan"),
        ("MCDOWELL-N", "United Spirits"),("UBL", "United Breweries"),("AWL", "Adani Wilmar"),
        ("PATANJALI", "Patanjali Foods"),("BIKAJI", "Bikaji Foods"),("PRATAAP", "Prataap Snacks"),
        ("DFMFOODS", "DFM Foods"),("JYOTHYLAB", "Jyothy Labs"),("EMAMILTD", "Emami"),
        ("PGHH", "Procter & Gamble"),("GILLETTE", "Gillette India"),("HONASA", "Honasa Consumer"),
        ("BAJAJCON", "Bajaj Consumer"),("ZENTEC", "Zen Tech"),("VIDHIING", "Vidhi Specialty"),
        ("TASTYBITE", "Tasty Bite Eatables"),("KRBL", "KRBL"),("LTFOODS", "LT Foods"),
        ("GOKEX", "Gokaldas Exports"),("TCNSBRANDS", "TCNS Clothing"),("VIPIND", "VIP Industries"),
        ("SAFARI", "Safari Industries"),("CUB", "City Union Bank"),("KARURVYSYA", "Karur Vysya Bank"),
        ("DCBBANK", "DCB Bank"),("CSBBANK", "CSB Bank"),("DHANBANK", "Dhanlaxmi Bank")
    ],
    "Energy": [
        ("SUZLON", "Suzlon Energy"),("INOXWIND", "Inox Wind"),("KPIGREEN", "KPI Green Energy"),
        ("SWL", "Sterling and Wilson"),("WAAREE", "Waaree Renewable"),("ORIANA", "Oriana Power"),
        ("RPOWER", "Reliance Power"),("NIBE", "Nibe"),("BORORENEW", "Borosil Renewables"),
        ("OIL", "Oil India"),("MRPL", "MRPL"),("CHENNPETRO", "Chennai Petro"),
        ("GUJGASLTD", "Gujarat Gas"),("MGL", "Mahanagar Gas"),("IGL", "Indraprastha Gas"),
        ("ATGL", "Adani Total Gas"),("PETRONET", "Petronet LNG"),("GAIL", "GAIL"),
        ("JSWENERGY", "JSW Energy"),("TATAPOWER", "Tata Power"),("ADANIPOWER", "Adani Power"),
        ("TORNTPOWER", "Torrent Power"),("NHPC", "NHPC"),("SJVN", "SJVN"),
        ("NLCINDIA", "NLC India"),("CESC", "CESC"),("RELIANCEPOWER", "Reliance Power"),
        ("RTNPOWER", "RattanIndia Power"),("JPPOWER", "Jaiprakash Power"),("SWSOLAR", "Sterling & Wilson")
    ],
    "Financials": [
        ("SBIKARD", "SBI Cards"),("HDFCAMC", "HDFC AMC"),("NAM-INDIA", "Nippon Life AMC"),
        ("MCX", "MCX"),("CDSL", "CDSL"),("BSE", "BSE"),
        ("CAMS", "CAMS"),("PAYTM", "Paytm"),("PBFINTECH", "Policybazaar"),
        ("MANAPPURAM", "Manappuram Finance"),("M&MFIN", "M&M Finance"),("CHOLAFIN", "Cholamandalam Inv"),
        ("SHRIRAMFIN", "Shriram Finance"),("MUTHOOTFIN", "Muthoot Finance"),("RECLTD", "REC"),
        ("PFC", "Power Finance Corp"),("IRFC", "IRFC"),("HUDCO", "HUDCO"),
        ("IREDA", "IREDA"),("POONAWALLA", "Poonawalla Fincorp"),("L&TFH", "L&T Finance"),
        ("ABCAPITAL", "Aditya Birla Capital"),("PEL", "Piramal Ent"),("MOTILALOFS", "Motilal Oswal"),
        ("ANGELONE", "Angel One"),("IIFL", "IIFL Finance"),("EDELWEISS", "Edelweiss"),
        ("JMFINANCIL", "JM Financial"),("GEOJITFSL", "Geojit Financial"),("5PAISA", "5paisa Capital")
    ],
    "Healthcare": [
        ("SYNGENE", "Syngene Int"),("LAURUSLABS", "Laurus Labs"),("GLAND", "Gland Pharma"),
        ("SUVENPHAR", "Suven Pharma"),("NEULANDLAB", "Neuland Labs"),("NATCOPHARM", "Natco Pharma"),
        ("AJANTPHARM", "Ajanta Pharma"),("ABBOTINDIA", "Abbott India"),("SANOFI", "Sanofi India"),
        ("GSKCONS", "GlaxoSmithKline"),("JBCHEPHARM", "J.B. Chemicals"),("GRANULES", "Granules India"),
        ("IPCALAB", "IPCA Labs"),("ERIS", "Eris Lifesciences"),("ALKYLAMINE", "Alkyl Amines"),
        ("BALAMIN", "Balaji Amines"),("VINATIORGA", "Vinati Organics"),("AARTIIND", "Aarti Industries"),
        ("DEEPAKNTR", "Deepak Nitrite"),("PIIND", "PI Industries"),("UPL", "UPL"),
        ("SRF", "SRF"),("NAVINFLUOR", "Navin Fluorine"),("ATUL", "Atul"),
        ("GUJALKALI", "Gujarat Alkalies"),("GNFC", "GNFC"),("GSFC", "GSFC"),
        ("CHAMBLFERT", "Chambal Fertilisers"),("COROMANDEL", "Coromandel Int"),("FACT", "FACT")
    ],
    "Industrials": [
        ("CUMMINSIND", "Cummins India"),("ESCORTS", "Escorts Kubota"),("TIMKEN", "Timken India"),
        ("SKFINDIA", "SKF India"),("SCHAEFFLER", "Schaeffler India"),("CARBORUNIV", "Carborundum Universal"),
        ("GRINDWELL", "Grindwell Norton"),("ELECON", "Elecon Enging"),("KEC", "KEC International"),
        ("KALPATPOWR", "Kalpataru Projects"),("VOLTAS", "Voltas"),("BLUESTARCO", "Blue Star"),
        ("HAVELLS", "Havells India"),("POLYCAB", "Polycab India"),("CROMPTON", "Crompton Greaves"),
        ("FINCABLES", "Finolex Cables"),("KEI", "KEI Industries"),("APARINDS", "Apar Industries"),
        ("AIAENG", "AIA Engineering"),("THERMAX", "Thermax"),("TRITURBINE", "Triveni Turbine"),
        ("HONAUT", "Honeywell Auto"),("CGPOWER", "CG Power"),("ABB", "ABB India"),
        ("SIEMENS", "Siemens"),("BHEL", "BHEL"),("BEL", "Bharat Electronics"),
        ("HAL", "Hindustan Aeronautics"),("BDL", "Bharat Dynamics"),("MAZDOCK", "Mazagon Dock")
    ],
    "Information Technology": [
        ("COFORGE", "Coforge"),("MPHASIS", "Mphasis"),("CYIENT", "Cyient"),
        ("SONATSOFTW", "Sonata Software"),("BSOFT", "Birlasoft"),("ZENSARTECH", "Zensar Tech"),
        ("INTELLECT", "Intellect Design"),("HAPPSTMNDS", "Happiest Minds"),("NEWGEN", "Newgen Software"),
        ("LATENTVIEW", "Latent View"),("MAPMYINDIA", "CE Info Systems"),("OLECTRA", "Olectra Greentech"),
        ("INFIBEAM", "Infibeam Avenues"),("NUCLEUS", "Nucleus Software"),("RBLUE", "Redington"),
        ("MASTEK", "Mastek"),("KPITTECH", "KPIT Tech"),("TATAELXSI", "Tata Elxsi"),
        ("LTTS", "L&T Tech"),("PERSISTENT", "Persistent Systems"),("LTIM", "LTIMindtree"),
        ("TECHM", "Tech Mahindra"),("WIPRO", "Wipro"),("HCLTECH", "HCL Tech"),
        ("INFY", "Infosys"),("TCS", "TCS"),("FSL", "Firstsource"),
        ("RATEGAIN", "RateGain"),("ECLERX", "eClerx Services"),("HGS", "Hinduja Global")
    ],
    "Materials": [
        ("UPL", "UPL"),("PIIND", "PI Industries"),("DEEPAKNTR", "Deepak Nitrite"),
        ("AARTIIND", "Aarti Industries"),("TATACHEM", "Tata Chemicals"),("GUJALKALI", "Gujarat Alkalies"),
        ("GNFC", "GNFC"),("GSFC", "GSFC"),("CHAMBLFERT", "Chambal Fertilisers"),
        ("COROMANDEL", "Coromandel Int"),("NAVINFLUOR", "Navin Fluorine"),("ATUL", "Atul"),
        ("ALKYLAMINE", "Alkyl Amines"),("BALAMIN", "Balaji Amines"),("VINATIORGA", "Vinati Organics"),
        ("PIDILITIND", "Pidilite Industries"),("KANSAINER", "Kansai Nerolac"),("BERGEPAINT", "Berger Paints"),
        ("ASIANPAINT", "Asian Paints"),("AMBUJACEM", "Ambuja Cements"),("SHREECEM", "Shree Cement"),
        ("ACC", "ACC"),("DALBHARAT", "Dalmia Bharat"),("RAMCOCEM", "Ramco Cements"),
        ("JKCEMENT", "JK Cement"),("STARCEMENT", "Star Cement"),("HEIDELBERG", "HeidelbergCement"),
        ("ORIENTCEM", "Orient Cement"),("SANGHIIND", "Sanghi Industries"),("PRSMJOHNSN", "Prism Johnson")
    ],
    "Real Estate": [
        ("SUNTECK", "Sunteck Realty"),("KOLTEPATIL", "Kolte-Patil"),("IBREALEST", "Indiabulls Real Estate"),
        ("OMAXE", "Omaxe"),("ANANTRAJ", "Anant Raj"),("ASHIANA", "Ashiana Housing"),
        ("ARVINDSMART", "Arvind SmartSpaces"),("KEYSTONERE", "Keystone Realtors"),("SIGNATURE", "Signatureglobal"),
        ("SURAJEST", "Suraj Estate"),("LODHA", "Macrotech Developers"),("OBEROIRLTY", "Oberoi Realty"),
        ("PRESTIGE", "Prestige Estates"),("PHOENIXLTD", "The Phoenix Mills"),("BRIGADE", "Brigade Enterprises"),
        ("SOBHA", "Sobha"),("PURVA", "Puravankara"),("MAHLIFE", "Mahindra Lifespace"),
        ("DLF", "DLF"),("GODREJPROP", "Godrej Properties"),("MINDSPACE", "Mindspace REIT"),
        ("EMBASSY", "Embassy REIT"),("BROOKFIELD", "Brookfield REIT"),("NEXUS", "Nexus Select REIT"),
        ("BOMDYEING", "Bombay Dyeing"),("CENTURYTEX", "Century Textiles"),("SWANENERGY", "Swan Energy"),
        ("PENIND", "Pennar Industries"),("NBCC", "NBCC"),("ENGINERSIN", "Engineers India")
    ],
    "Utilities": [
        ("ADANIENSOL", "Adani Energy Solutions"),("CESC", "CESC"),("IEX", "IEX"),
        ("PTC", "PTC India"),("RELIANCEPOWER", "Reliance Power"),("GMRINFRA", "GMR Infra"),
        ("VKAMAYYA", "VKAMAYYA"),("NLCINDIA", "NLC India"),("SJVN", "SJVN"),
        ("NHPC", "NHPC"),("TORNTPOWER", "Torrent Power"),("ADANIPOWER", "Adani Power"),
        ("TATAPOWER", "Tata Power"),("ATGL", "Adani Total Gas"),("GUJGASLTD", "Gujarat Gas"),
        ("MGL", "Mahanagar Gas"),("IGL", "Indraprastha Gas"),("POWERGRID", "Power Grid Corp"),
        ("NTPC", "NTPC"),("JSWENERGY", "JSW Energy"),("RTNPOWER", "RattanIndia Power"),
        ("JPPOWER", "Jaiprakash Power"),("SWSOLAR", "Sterling & Wilson"),("ORIANA", "Oriana Power"),
        ("WAAREE", "Waaree Renewable"),("SWL", "Sterling and Wilson"),("KPIGREEN", "KPI Green Energy"),
        ("INOXWIND", "Inox Wind"),("SUZLON", "Suzlon Energy"),("BORORENEW", "Borosil Renewables")
    ],
    "Aerospace & Defense": [
        ("DATA-P", "Data Patterns"),("MTARTECH", "MTAR Tech"),("ZENPECS", "Zen Tech"),
        ("PARAS", "Paras Defence"),("DCXINDIA", "DCX Systems"),("APOLLOMICRO", "Apollo Micro Systems"),
        ("WALCHANNAG", "Walchandnagar Ind"),("PTCIL", "PTC Industries"),("SOLARINDS", "Solar Industries"),
        ("PREMIEREXP", "Premier Explosives"),("ASTRAMICRO", "Astra Microwave"),("MIDHANI", "Mishra Dhatu Nigam"),
        ("BHEL", "BHEL"),("BEML", "BEML"),("GRSE", "Garden Reach"),
        ("COCHINSHIP", "Cochin Shipyard"),("MAZDOCK", "Mazagon Dock"),("BDL", "Bharat Dynamics"),
        ("BEL", "Bharat Electronics"),("HAL", "Hindustan Aeronautics"),("LENT", "L&T"),
        ("ROSSARI", "Rossari Biotech"),("CLEAN", "Clean Science"),("TATVA", "Tatva Chintan"),
        ("AMI", "Ami Organics"),("NEOGEN", "Neogen Chemicals"),("SUDARSCHEM", "Sudarshan Chemical"),
        ("MEGH", "Meghmani Finechem"),("BODALCHEM", "Bodal Chemicals"),("KIRIINDUS", "Kiri Industries")
    ],
    "Automobiles & Components": [
        ("OLECTRA", "Olectra Greentech"),("FORCEMOT", "Force Motors"),("BOSCHLTD", "Bosch"),
        ("MOTHERSON", "Samvardhana Motherson"),("SONACOMS", "Sona BLW"),("MRF", "MRF"),
        ("APOLLOTYRE", "Apollo Tyres"),("BALKRISIND", "Balkrishna Ind"),("CEATLTD", "CEAT"),
        ("AMARAJABAT", "Amara Raja"),("EXIDEIND", "Exide Industries"),("ENDURANCE", "Endurance Tech"),
        ("ASHOKLEY", "Ashok Leyland"),("TVSMOTOR", "TVS Motor"),("HEROMOTOCO", "Hero MotoCorp"),
        ("EICHERMOT", "Eicher Motors"),("BAJAJ-AUTO", "Bajaj Auto"),("M&M", "Mahindra & Mahindra"),
        ("TATAMOTORS", "Tata Motors"),("MARUTI", "Maruti Suzuki"),("FIEMIND", "Fiem Industries"),
        ("LUMAXIND", "Lumax Industries"),("MINDAIND", "Uno Minda"),("SUPRAJIT", "Suprajit Engg"),
        ("GABRIEL", "Gabriel India"),("JAMNAAUTO", "Jamna Auto"),("AUTOMAX", "Automax"),
        ("RICOAUTO", "Rico Auto"),("MUNJALSHOW", "Munjal Showa"),("SHARDAMOTR", "Sharda Motor")
    ],
    "Banks": [
        ("BANKINDIA", "Bank of India"),("CENTRALBK", "Central Bank of India"),("UCOBANK", "UCO Bank"),
        ("IOB", "Indian Overseas Bank"),("MAHABANK", "Bank of Maharashtra"),("PSB", "Punjab & Sind Bank"),
        ("CANBK", "Canara Bank"),("UNIONBANK", "Union Bank of India"),("BANKBARODA", "Bank of Baroda"),
        ("PNB", "Punjab National Bank"),("AUBANK", "AU Small Finance"),("FEDERALBNK", "Federal Bank"),
        ("IDFCFIRSTB", "IDFC First Bank"),("INDUSINDBK", "IndusInd Bank"),("AXISBANK", "Axis Bank"),
        ("KOTAKBANK", "Kotak Mahindra Bank"),("SBIN", "State Bank of India"),("ICICIBANK", "ICICI Bank"),
        ("HDFCBANK", "HDFC Bank"),("YESBANK", "Yes Bank"),("IDBI", "IDBI Bank"),
        ("RBLBANK", "RBL Bank"),("BANDHANBNK", "Bandhan Bank"),("CSBBANK", "CSB Bank"),
        ("DCBBANK", "DCB Bank"),("KARURVYSYA", "Karur Vysya Bank"),("CUB", "City Union Bank"),
        ("SOUTHBANK", "South Indian Bank"),("J&KBANK", "J&K Bank"),("EQUITASBNK", "Equitas Small Finance")
    ],
    "Biotechnology": [
        ("NOVARTIND", "Novartis India"),("PFOCUS", "Prime Focus"),("BDR", "BDR Pharma"),
        ("HESTERBIO", "Hester Biosciences"),("ADVANCED", "Advanced Enzyme"),("MANGALAM", "Mangalam Drugs"),
        ("NEULANDLAB", "Neuland Labs"),("KOPRAN", "Kopran"),("SMSPHARMA", "SMS Pharma"),
        ("NATHBIOGEN", "Nath Bio-Genes"),("BAYERCROP", "Bayer CropScience"),("PIIND", "PI Industries"),
        ("UPL", "UPL"),("RALLIS", "Rallis India"),("CONCORDBIO", "Concord Biotech"),
        ("SUVEN", "Suven Life Sciences"),("SHILPAMED", "Shilpa Medicare"),("PANACEABIO", "Panacea Biotec"),
        ("SYNGENE", "Syngene Int"),("BIOCON", "Biocon"),("ASTEC", "Astec Lifesciences"),
        ("INSECTICID", "Insecticides India"),("DHANUKA", "Dhanuka Agritech"),("BHARATRAS", "Bharat Rasayan"),
        ("EXCELINDUS", "Excel Industries"),("MEGH", "Meghmani Organics"),("SHARDACROP", "Sharda Cropchem"),
        ("NACEN", "NACL Industries"),("PUNJABCHEM", "Punjab Chemicals"),("KILPEST", "Kilpest India")
    ],
    "Capital Goods": [
        ("ELECON", "Elecon Enging"),("KEC", "KEC International"),("KALPATPOWR", "Kalpataru Projects"),
        ("VOLTAS", "Voltas"),("BLUESTARCO", "Blue Star"),("HAVELLS", "Havells India"),
        ("POLYCAB", "Polycab India"),("CROMPTON", "Crompton Greaves"),("FINCABLES", "Finolex Cables"),
        ("KEI", "KEI Industries"),("CUMMINSIND", "Cummins India"),("AIAENG", "AIA Engineering"),
        ("TRITURBINE", "Triveni Turbine"),("THERMAX", "Thermax"),("ABB", "ABB India"),
        ("SIEMENS", "Siemens"),("BEL", "Bharat Electronics"),("BHEL", "BHEL"),
        ("CGPOWER", "CG Power"),("LT", "Larsen & Toubro"),("APARINDS", "Apar Industries"),
        ("VGUARD", "V-Guard Industries"),("SYMPHONY", "Symphony"),("WHIRLPOOL", "Whirlpool of India"),
        ("TTKPRESTIG", "TTK Prestige"),("BAJAJELEC", "Bajaj Electricals"),("HONAUT", "Honeywell Auto"),
        ("SCHAEFFLER", "Schaeffler India"),("SKFINDIA", "SKF India"),("TIMKEN", "Timken India")
    ],
    "Commercial Services": [
        ("BLISSGVS", "Bliss GVS Pharma"),("ECLERX", "eClerx Services"),("FSL", "Firstsource"),
        ("HGS", "Hinduja Global"),("BLS", "BLS International"),("CMSINFO", "CMS Info Systems"),
        ("THOMASCOOK", "Thomas Cook"),("IRCTC", "IRCTC"),("NAVKARCORP", "Navkar Corp"),
        ("SNOWMAN", "Snowman Logistics"),("GATI", "Allcargo Gati"),("MAHLOG", "Mahindra Logistics"),
        ("VRL", "VRL Logistics"),("TCIEXP", "TCI Express"),("DELHIVERY", "Delhivery"),
        ("BLUEDART", "Blue Dart Express"),("UPDATER", "Updater Services"),("SIS", "SIS"),
        ("TEAMLEASE", "TeamLease Services"),("QUESS", "Quess Corp"),("EASEMYTRIP", "Easy Trip Planners"),
        ("YATRA", "Yatra Online"),("SPICEJET", "SpiceJet"),("INDIGO", "InterGlobe Aviation"),
        ("CONCOR", "Container Corp"),("ALLCARGO", "Allcargo Logistics"),("VTI", "VRL Logistics"),
        ("TCIL", "Transport Corp"),("RITES", "RITES"),("NBCC", "NBCC")
    ],
    "Consumer Durables": [
        ("ORIENTELEC", "Orient Electric"),("EUREKAFORB", "Eureka Forbes"),("PGEL", "PG Electroplast"),
        ("AMBER", "Amber Ent"),("CERA", "Cera Sanitaryware"),("SOMANYCERA", "Somany Ceramics"),
        ("KAJARIRCER", "Kajaria Ceramics"),("CENTURYPLY", "Century Plyboards"),("GREENPLY", "Greenply"),
        ("GREENPANEL", "Greenpanel"),("BAJAJELEC", "Bajaj Electricals"),("TTKPRESTIG", "TTK Prestige"),
        ("WHIRLPOOL", "Whirlpool of India"),("SYMPHONY", "Symphony"),("CROMPTON", "Crompton Greaves"),
        ("HAVELLS", "Havells India"),("BLUESTARCO", "Blue Star"),("VOLTAS", "Voltas"),
        ("DIXON", "Dixon Tech"),("VGUARD", "V-Guard Industries"),("JCHAC", "Johnson Controls-Hitachi"),
        ("IFBIND", "IFB Industries"),("SFL", "Sheela Foam"),("VIPIND", "VIP Industries"),
        ("SAFARI", "Safari Industries"),("BATAINDIA", "Bata India"),("RELAXO", "Relaxo Footwears"),
        ("METROBRAND", "Metro Brands"),("CAMPUS", "Campus Activewear"),("MANYAVAR", "Vedant Fashions")
    ],
    "Food & Beverages": [
        ("DFMFOODS", "DFM Foods"),("AAKASH", "Aakash Exploration"),("LOTUSEYE", "Lotus Eye"),
        ("HERITGFOOD", "Heritage Foods"),("DODLA", "Dodla Dairy"),("PARAGMILK", "Parag Milk"),
        ("HATSUN", "Hatsun Agro"),("KRBL", "KRBL"),("PRATAAP", "Prataap Snacks"),
        ("BIKAJI", "Bikaji Foods"),("PATANJALI", "Patanjali Foods"),("AWL", "Adani Wilmar"),
        ("UBL", "United Breweries"),("MCDOWELL-N", "United Spirits"),("RADICO", "Radico Khaitan"),
        ("VBL", "Varun Beverages"),("ITC", "ITC"),("TATACONSUM", "Tata Consumer Products"),
        ("BRITANNIA", "Britannia Industries"),("NESTLEIND", "Nestle India"),("LTFOODS", "LT Foods"),
        ("KOVATEX", "Kovai Medical"),("TASTYBITE", "Tasty Bite Eatables"),("VSTIND", "VST Industries"),
        ("GODFREYPHP", "Godfrey Phillips"),("ZOMATO", "Zomato"),("DEVYANI", "Devyani Int"),
        ("JUBLFOOD", "Jubilant FoodWorks"),("WESTLIFE", "Westlife Foodworld"),("SAPPHIRE", "Sapphire Foods")
    ],
    "Insurance": [
        ("GOIL", "GIC"),("RELIGARE", "Religare Ent"),("CHOICEIN", "Choice Int"),
        ("5PAISA", "5paisa Capital"),("ANGELONE", "Angel One"),("MOTILALOFS", "Motilal Oswal"),
        ("IIFL", "IIFL Finance"),("EDELWEISS", "Edelweiss"),("JMFINANCIL", "JM Financial"),
        ("GEOJITFSL", "Geojit Financial"),("PBFINTECH", "Policybazaar"),("NIACL", "New India Assurance"),
        ("GICRE", "GIC Re"),("STARHEALTH", "Star Health"),("ICICIGI", "ICICI Lombard"),
        ("MAXFIN", "Max Financial Services"),("ICICIPRULI", "ICICI Prudential"),("SBILIFE", "SBI Life"),
        ("HDFCLIFE", "HDFC Life"),("LICI", "LIC"),("SBIKARD", "SBI Cards"),
        ("HDFCAMC", "HDFC AMC"),("NAM-INDIA", "Nippon Life AMC"),("UTIAMC", "UTI AMC"),
        ("ABSLAMC", "Aditya Birla Sun Life AMC"),("CAMS", "CAMS"),("CDSL", "CDSL"),
        ("BSE", "BSE"),("MCX", "MCX"),("PAYTM", "Paytm")
    ],
    "Media & Entertainment": [
        ("HATHWAY", "Hathway Cable"),("DEN", "DEN Networks"),("NAVKARCORP", "Navkar Corp"),
        ("DBCORP", "DB Corp"),("JAGRAN", "Jagran Prakashan"),("HTMEDIA", "HT Media"),
        ("ENIL", "Entertainment Network"),("TVTODAY", "TV Today Network"),("UFO", "UFO Moviez"),
        ("ERIS", "Eris Lifesciences"),("DISHTV", "Dish TV"),("TIPSIND", "Tips Industries"),
        ("TIPSFILMS", "Tips Films"),("SAREGAMA", "Saregama India"),("PVRINOX", "PVR INOX"),
        ("NDTV", "NDTV"),("TV18BRDCST", "TV18 Broadcast"),("NETWORK18", "Network18"),
        ("SUNTV", "Sun TV"),("ZEEL", "Zee Ent"),("INOXLEISUR", "INOX Leisure"),
        ("BALAJITELE", "Balaji Telefilms"),("CINEVISTA", "Cinevista"),("MUKTAARTS", "Mukta Arts"),
        ("PNCINFRA", "PNC Infratech"),("JETAIRWAYS", "Jet Airways"),("SPICEJET", "SpiceJet"),
        ("INDIGO", "InterGlobe Aviation"),("IRCTC", "IRCTC"),("NAUKRI", "Info Edge")
    ],
    "Pharmaceuticals": [
        ("GSKCONS", "GlaxoSmithKline"),("JBCHEPHARM", "J.B. Chemicals"),("GRANULES", "Granules India"),
        ("IPCALAB", "IPCA Labs"),("ERIS", "Eris Lifesciences"),("SANOFI", "Sanofi India"),
        ("ABBOTINDIA", "Abbott India"),("AJANTPHARM", "Ajanta Pharma"),("NATCOPHARM", "Natco Pharma"),
        ("GLAND", "Gland Pharma"),("LAURUSLABS", "Laurus Labs"),("ALKEM", "Alkem Labs"),
        ("GLENMARK", "Glenmark Pharma"),("TORNTPHARM", "Torrent Pharma"),("ZYDUSLIFE", "Zydus Lifesciences"),
        ("AUROPHARMA", "Aurobindo Pharma"),("LUPIN", "Lupin"),("DIVISLAB", "Divi's Labs"),
        ("DRREDDY", "Dr. Reddy's"),("CIPLA", "Cipla"),("SUNPHARMA", "Sun Pharma"),
        ("SYNGENE", "Syngene Int"),("BIOCON", "Biocon"),("SUVENPHAR", "Suven Pharma"),
        ("NEULANDLAB", "Neuland Labs"),("CAPLIPOINT", "Caplin Point"),("MARKSANS", "Marksans Pharma"),
        ("AARTIIND", "Aarti Drugs"),("MOREPENLAB", "Morepen Labs"),("UNICHEMLAB", "Unichem Labs")
    ],
    "Retail": [
        ("ETHOSLTD", "Ethos"),("CARTARDEF", "Cartrade Tech"),("EBIX", "Ebixcash"),
        ("INFOEDGE", "Info Edge"),("CAMPUS", "Campus Activewear"),("MANYAVAR", "Vedant Fashions"),
        ("TITAN", "Titan"),("KALYANKJIL", "Kalyan Jewellers"),("RELAXO", "Relaxo Footwears"),
        ("METROBRAND", "Metro Brands"),("BATAINDIA", "Bata India"),("SPENCERS", "Spencer's Retail"),
        ("V2RETAIL", "V2 Retail"),("VMART", "V-Mart Retail"),("SHOPPERS", "Shoppers Stop"),
        ("ABFRL", "Aditya Birla Fashion"),("NYKAA", "Nykaa"),("ZOMATO", "Zomato"),
        ("DMART", "Avenue Supermarts"),("TRENT", "Trent"),("PAYTM", "Paytm"),
        ("PBFINTECH", "Policybazaar"),("CARTRADE", "CarTrade Tech"),("EASEMYTRIP", "Easy Trip Planners"),
        ("YATRA", "Yatra Online"),("JUSTDIAL", "Just Dial"),("INDIAMART", "IndiaMART"),
        ("MINDTREE", "Mindtree"),("INFIBEAM", "Infibeam Avenues"),("FSSAI", "FSSAI")
    ],
    "Semiconductors": [
        ("BCC", "BCC Fuba"),("CENTUM", "Centum Electronics"),("MICROLE", "Micronics"),
        ("SAHAJ", "Sahaj Solar"),("SAKSOFT", "Saksoft"),("SASKEN", "Sasken Tech"),
        ("TATAELXSI", "Tata Elxsi"),("VINSYS", "Vinsys IT Services"),("XPROINDIA", "Xpro India"),
        ("ZENTEC", "Zen Tech"),("AARON", "Aaron Industries"),("RRP", "RRP Semiconductor"),
        ("SPEL", "SPEL Semiconductor"),("MOSCHIP", "Moschip Tech"),("ASMTEC", "ASM Tech"),
        ("AVALON", "Avalon Tech"),("SYRMA", "Syrma SGS Tech"),("KAYNES", "Kaynes Tech"),
        ("DIXON", "Dixon Tech"),("CGPOWER", "CG Power"),("AMBER", "Amber Ent"),
        ("PGEL", "PG Electroplast"),("MTEP", "MTEP"),("IDEA", "Vodafone Idea"),
        ("BHARTIARTL", "Bharti Airtel"),("TATACOMM", "Tata Communications"),("INDUSTOWER", "Indus Towers"),
        ("ITI", "ITI"),("TEJASNET", "Tejas Networks"),("HFCL", "HFCL")
    ],
    "Software & Services": [
        ("MAPMYINDIA", "CE Info Systems"),("OLECTRA", "Olectra Greentech"),("INFIBEAM", "Infibeam Avenues"),
        ("NUCLEUS", "Nucleus Software"),("RBLUE", "Redington"),("MASTEK", "Mastek"),
        ("LATENTVIEW", "Latent View"),("NEWGEN", "Newgen Software"),("HAPPSTMNDS", "Happiest Minds"),
        ("INTELLECT", "Intellect Design"),("ZENSARTECH", "Zensar Tech"),("BSOFT", "Birlasoft"),
        ("SONATSOFTW", "Sonata Software"),("CYIENT", "Cyient"),("KPITTECH", "KPIT Tech"),
        ("TATAELXSI", "Tata Elxsi"),("MPHASIS", "Mphasis"),("COFORGE", "Coforge"),
        ("LTTS", "L&T Tech"),("PERSISTENT", "Persistent Systems"),("LTIM", "LTIMindtree"),
        ("TECHM", "Tech Mahindra"),("WIPRO", "Wipro"),("HCLTECH", "HCL Tech"),
        ("INFY", "Infosys"),("TCS", "TCS"),("ECLERX", "eClerx Services"),
        ("FSL", "Firstsource"),("HGS", "Hinduja Global"),("ROUTE", "Route Mobile")
    ],
    "Telecommunication Services": [
        ("VXLINSTR", "VXL Instruments"),("MRO-TEK", "MRO-TEK Realty"),("TATACOFFEE", "Tata Coffee"),
        ("GTLINFRA", "GTL Infrastructure"),("MTNL", "MTNL"),("NELCO", "Nelco"),
        ("ONMOBILE", "OnMobile Global"),("GTPL", "GTPL Hathway"),("DEN", "DEN Networks"),
        ("HATHWAY", "Hathway Cable"),("VAKRANGEE", "Vakrangee"),("ROUTE", "Route Mobile"),
        ("TTML", "Tata Teleservices"),("HFCL", "HFCL"),("TEJASNET", "Tejas Networks"),
        ("ITI", "ITI"),("INDUSTOWER", "Indus Towers"),("TATACOMM", "Tata Communications"),
        ("IDEA", "Vodafone Idea"),("BHARTIARTL", "Bharti Airtel"),("OPTOCIRC", "Opto Circuits"),
        ("VINDHYATEL", "Vindhya Telelinks"),("STERLITE", "Sterlite Tech"),("AKSHOPTFBR", "Aksh Optifibre"),
        ("MICROLE", "Micronics"),("ADCINDIA", "ADC India"),("PARAMOUNT", "Paramount Comms"),
        ("CORALFINAC", "Coral India"),("SMARTLINK", "Smartlink Holdings"),("DSSL", "Dynacons Sys")
    ],
    "Transportation": [
        ("JETAIRWAYS", "Jet Airways"),("M&M", "Mahindra & Mahindra"),("ASHOKLEY", "Ashok Leyland"),
        ("TATAMOTORS", "Tata Motors"),("MARUTI", "Maruti Suzuki"),("BAJAJ-AUTO", "Bajaj Auto"),
        ("SPIC", "SpiceJet"),("EASEMYTRIP", "Easy Trip Planners"),("THOMASCOOK", "Thomas Cook"),
        ("IRCTC", "IRCTC"),("NAVKARCORP", "Navkar Corp"),("SNOWMAN", "Snowman Logistics"),
        ("GATI", "Allcargo Gati"),("MAHLOG", "Mahindra Logistics"),("VRL", "VRL Logistics"),
        ("TCIEXP", "TCI Express"),("BLUEDART", "Blue Dart Express"),("DELHIVERY", "Delhivery"),
        ("CONCOR", "Container Corp"),("INDIGO", "InterGlobe Aviation"),("VTI", "VRL Logistics"),
        ("TCIL", "Transport Corp"),("LALPATHLAB", "Dr Lal PathLabs"),("METROPOLIS", "Metropolis"),
        ("THYROCARE", "Thyrocare"),("VIJAYA", "Vijaya Diagnostic"),("KIMS", "KIMS Hospitals"),
        ("FORTIS", "Fortis Healthcare"),("APOLLOHOSP", "Apollo Hospitals"),("MAXHEALTH", "Max Health")
    ],
    "ETF/Index Fund": [
        ("MOM50", "Motilal Oswal M50 ETF"),("MID150BEES", "Nippon India Midcap 150"),("DIVOPPBEES", "Nippon India Div Opp"),
        ("FMCGBEES", "Nippon India FMCG"),("AUTOBEES", "Nippon India Auto"),("SILVERBEES", "Nippon India Silver"),
        ("INFRABEES", "Nippon India Infra"),("CONSUMBEES", "Nippon India Consumption"),("PSUBNKBEES", "Nippon India PSU Bank"),
        ("JUNIORBEES", "Nippon India Junior"),("HDFCNIFTY", "HDFC Nifty 50"),("SETFNIF50", "SBI-ETF Nifty 50"),
        ("ICICINIFTY", "ICICI Pru Nifty 50"),("CPSEETF", "CPSE ETF"),("PHARMABEES", "Nippon India Pharma"),
        ("GOLDBEES", "Nippon India Gold"),("LIQUIDBEES", "Nippon India Liquid"),("ITBEES", "Nippon India IT"),
        ("BANKBEES", "Nippon India Bank"),("NIFTYBEES", "Nippon India Nifty 50"),("HDFCSENSEX", "HDFC Sensex ETF"),
        ("SBISENSEX", "SBI Sensex ETF"),("ICICISENSX", "ICICI Pru Sensex"),("KOTAKNIFTY", "Kotak Nifty 50 ETF"),
        ("KOTAKBKETF", "Kotak Bank ETF"),("UTINIFTY", "UTI Nifty 50 ETF"),("UTISENSEX", "UTI Sensex ETF"),
        ("MOM30", "Motilal Oswal M30 ETF"),("HDFCMFGETF", "HDFC Mfg ETF"),("ICICIMID150", "ICICI Midcap 150 ETF")
    ],
    "Other": [
        ("MAPMYINDIA", "CE Info Systems"),("EASEMYTRIP", "Easy Trip Planners"),("NAUKRI", "Info Edge"),
        ("TATAINVEST", "Tata Investment Corp"),("STARHEALTH", "Star Health"),("PBFINTECH", "Policybazaar"),
        ("JIOFIN", "Jio Financial"),("AWL", "Adani Wilmar"),("HONASA", "Honasa Consumer"),
        ("PAYTM", "Paytm"),("NYKAA", "Nykaa"),("ZOMATO", "Zomato"),
        ("DELHIVERY", "Delhivery"),("IEX", "IEX"),("CAMS", "CAMS"),
        ("CDSL", "CDSL"),("MCX", "MCX"),("BSE", "BSE"),
        ("IRCTC", "IRCTC"),("ADANIENT", "Adani Ent"),("RAILTEL", "RailTel Corp"),
        ("IRFC", "IRFC"),("RVNL", "RVNL"),("IRCON", "IRCON Int"),
        ("RITES", "RITES"),("OLECTRA", "Olectra Greentech"),("BORORENEW", "Borosil Rewenables"),
        ("SUZLON", "Suzlon Energy"),("INOXWIND", "Inox Wind"),("KPIGREEN", "KPI Green")
    ]
}

input_file = "/Users/shivampatel/aether-isle/aether-fastapi/backend/services/indian_stocks.py"
with open(input_file, "r") as f:
    text = f.read()

# Safely extract existing json
match = re.search(r'INDIAN_STOCKS\s*=\s*(\[.*?\])\n\ndef', text, re.DOTALL)
existing_stocks = json.loads(match.group(1))

# Append new
for sector, stock_list in extra_stocks.items():
    for symbol, name in stock_list:
        existing_stocks.append({
            "symbol": f"{symbol}.NS",
            "name": name,
            "sector": sector
        })

# Save it back
new_content = f"""import json

# Dictionary of popular NSE/BSE stocks across 29 sectors for accurate offline search
INDIAN_STOCKS = {json.dumps(existing_stocks, indent=4)}

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
    f.write(new_content)

print(f"Successfully appended stocks. Total: {len(existing_stocks)}")
