import json

bonds_map = {
    "Government": [
        {"ticker": "IN0020230010", "name": "7.06% GS 2028", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.06, "maturity_date": "2028-04-10"},
        {"ticker": "IN0020230085", "name": "7.18% GS 2033", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.18, "maturity_date": "2033-08-14"},
        {"ticker": "IN0020240050", "name": "7.04% GS 2029", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.04, "maturity_date": "2029-07-20"},
        {"ticker": "IN0020240019", "name": "7.10% GS 2034", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.10, "maturity_date": "2034-04-18"},
        {"ticker": "IN0020230036", "name": "7.17% GS 2030", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.17, "maturity_date": "2030-04-17"},
        {"ticker": "IN0020220086", "name": "7.26% GS 2032", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.26, "maturity_date": "2032-08-22"},
        {"ticker": "IN0020220037", "name": "7.38% GS 2027", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.38, "maturity_date": "2027-06-20"},
        {"ticker": "IN0020220128", "name": "7.41% GS 2036", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.41, "maturity_date": "2036-12-19"},
        {"ticker": "IN0020230051", "name": "7.30% GS 2053", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.30, "maturity_date": "2053-06-19"},
        {"ticker": "IN0020200153", "name": "5.85% GS 2030", "issuer": "Government of India", "face_value": 100, "coupon_rate": 5.85, "maturity_date": "2030-12-01"},
        {"ticker": "IN0020200278", "name": "6.10% GS 2031", "issuer": "Government of India", "face_value": 100, "coupon_rate": 6.10, "maturity_date": "2031-07-12"},
        {"ticker": "IN0020190016", "name": "7.26% GS 2029", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.26, "maturity_date": "2029-01-14"},
        {"ticker": "IN0020210095", "name": "6.10% GS 2031 (Re)", "issuer": "Government of India", "face_value": 100, "coupon_rate": 6.10, "maturity_date": "2031-07-12"},
        {"ticker": "IN0020150036", "name": "7.59% GS 2026", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.59, "maturity_date": "2026-01-11"},
        {"ticker": "IN0020210012", "name": "6.64% GS 2035", "issuer": "Government of India", "face_value": 100, "coupon_rate": 6.64, "maturity_date": "2035-06-16"},
        {"ticker": "IN0020150069", "name": "7.59% GS 2029", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.59, "maturity_date": "2029-03-20"},
        {"ticker": "IN0020010049", "name": "7.95% GS 2032", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.95, "maturity_date": "2032-08-28"},
        {"ticker": "IN0020070068", "name": "8.33% GS 2036", "issuer": "Government of India", "face_value": 100, "coupon_rate": 8.33, "maturity_date": "2036-07-09"},
        {"ticker": "IN0020040046", "name": "7.50% GS 2034", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.50, "maturity_date": "2034-08-10"},
        {"ticker": "IN0020160035", "name": "7.61% GS 2030", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.61, "maturity_date": "2030-05-09"},
        {"ticker": "IN0020230150", "name": "SGB 2023-24 Series IV", "issuer": "Reserve Bank of India", "face_value": 6263, "coupon_rate": 2.50, "maturity_date": "2032-02-21"},
        {"ticker": "IN0020230143", "name": "SGB 2023-24 Series III", "issuer": "Reserve Bank of India", "face_value": 6199, "coupon_rate": 2.50, "maturity_date": "2031-12-28"}
    ],
    "Corporate": [
        {"ticker": "INE511C08AG6", "name": "Poonawalla Fincorp 10.25%", "issuer": "Poonawalla Fincorp Limited", "face_value": 1000, "coupon_rate": 10.25, "maturity_date": "2027-03-01"},
        {"ticker": "INE090A08TR8", "name": "ICICI Bank Tier II 7.65%", "issuer": "ICICI Bank Limited", "face_value": 100000, "coupon_rate": 7.65, "maturity_date": "2035-12-10"},
        {"ticker": "INE511C08AD3", "name": "Poonawalla Fincorp 10.40%", "issuer": "Poonawalla Fincorp Limited", "face_value": 1000, "coupon_rate": 10.40, "maturity_date": "2027-01-01"},
        {"ticker": "INE511C08AK8", "name": "Poonawalla Fincorp 10.20%", "issuer": "Poonawalla Fincorp Limited", "face_value": 1000, "coupon_rate": 10.20, "maturity_date": "2025-06-01"},
        {"ticker": "INE034907100", "name": "Manappuram Asset Fin 10%", "issuer": "Manappuram Asset Finance", "face_value": 1000, "coupon_rate": 10.00, "maturity_date": "2026-03-19"},
        {"ticker": "INE884Q07731", "name": "Midland Microfin NCD", "issuer": "Midland Microfin Limited", "face_value": 1000, "coupon_rate": 10.50, "maturity_date": "2026-03-19"},
        {"ticker": "INE001A08361", "name": "HDFC Bank 7.85%", "issuer": "HDFC Bank Limited", "face_value": 100000, "coupon_rate": 7.85, "maturity_date": "2030-05-15"},
        {"ticker": "INE002A08609", "name": "Reliance Ind 7.95%", "issuer": "Reliance Industries Limited", "face_value": 100000, "coupon_rate": 7.95, "maturity_date": "2027-11-20"},
        {"ticker": "INE062A08181", "name": "SBI Perpetual 7.72%", "issuer": "State Bank of India", "face_value": 100000, "coupon_rate": 7.72, "maturity_date": "2099-12-31"},
        {"ticker": "INE154A08252", "name": "ITC Limited 7.45%", "issuer": "ITC Limited", "face_value": 100000, "coupon_rate": 7.45, "maturity_date": "2027-12-20"},
        {"ticker": "INE296A08269", "name": "Bajaj Finance 7.95%", "issuer": "Bajaj Finance Limited", "face_value": 100000, "coupon_rate": 7.95, "maturity_date": "2030-08-16"},
        {"ticker": "INE018A08535", "name": "L&T Ltd 7.70%", "issuer": "Larsen & Toubro", "face_value": 100000, "coupon_rate": 7.70, "maturity_date": "2028-04-28"},
        {"ticker": "INE238A08477", "name": "Axis Bank Tier II 7.88%", "issuer": "Axis Bank", "face_value": 100000, "coupon_rate": 7.88, "maturity_date": "2032-12-14"},
        {"ticker": "INE476A08084", "name": "Canara Bank Tier II 7.61%", "issuer": "Canara Bank", "face_value": 100000, "coupon_rate": 7.61, "maturity_date": "2033-02-28"},
        {"ticker": "INE141A08157", "name": "Tata Steel 8.25%", "issuer": "Tata Steel Limited", "face_value": 1000000, "coupon_rate": 8.25, "maturity_date": "2031-10-01"},
        {"ticker": "INE213A08643", "name": "ONGC 7.65%", "issuer": "ONGC Limited", "face_value": 1000000, "coupon_rate": 7.65, "maturity_date": "2029-12-12"},
        {"ticker": "INE721A08CN3", "name": "Shriram Finance 8.50%", "issuer": "Shriram Finance Limited", "face_value": 1000, "coupon_rate": 8.50, "maturity_date": "2026-06-30"},
        {"ticker": "INE028A08265", "name": "Bank of Baroda 7.75%", "issuer": "Bank of Baroda", "face_value": 100000, "coupon_rate": 7.75, "maturity_date": "2032-09-15"},
        {"ticker": "INE205A08139", "name": "Vedanta 7.60%", "issuer": "Vedanta Limited", "face_value": 1000000, "coupon_rate": 7.60, "maturity_date": "2028-11-20"},
        {"ticker": "INE044A08118", "name": "Sun Pharma 7.90%", "issuer": "Sun Pharmaceutical Industries", "face_value": 100000, "coupon_rate": 7.90, "maturity_date": "2027-05-18"}
    ],
    "Municipal": [
        {"ticker": "INE017U08016", "name": "Indore Municipal Corp 8.25%", "issuer": "Indore Municipal Corporation", "face_value": 10000, "coupon_rate": 8.25, "maturity_date": "2033-02-15"},
        {"ticker": "INE090G08013", "name": "Pune Municipal Corp 7.59%", "issuer": "Pune Municipal Corporation", "face_value": 100000, "coupon_rate": 7.59, "maturity_date": "2027-06-20"},
        {"ticker": "INE082E08018", "name": "GHMC 8.90% 2028", "issuer": "Greater Hyderabad MC", "face_value": 100000, "coupon_rate": 8.90, "maturity_date": "2028-02-14"},
        {"ticker": "INE0P5D08012", "name": "Lucknow Municipal 8.50%", "issuer": "Lucknow Municipal Corp", "face_value": 100000, "coupon_rate": 8.50, "maturity_date": "2030-11-13"},
        {"ticker": "INE0RBA08016", "name": "Vadodara Municipal 7.15%", "issuer": "Vadodara Municipal Corp", "face_value": 100000, "coupon_rate": 7.15, "maturity_date": "2027-03-24"},
        {"ticker": "INE234S08012", "name": "Ahmedabad Municipal 8.20%", "issuer": "Ahmedabad Municipal Corp", "face_value": 100000, "coupon_rate": 8.20, "maturity_date": "2027-04-12"},
        {"ticker": "INE734W08011", "name": "Surat Municipal 8.68%", "issuer": "Surat Municipal Corp", "face_value": 100000, "coupon_rate": 8.68, "maturity_date": "2029-03-01"},
        {"ticker": "INE921J08015", "name": "NDMC 8.35%", "issuer": "New Delhi Municipal Council", "face_value": 100000, "coupon_rate": 8.35, "maturity_date": "2029-08-08"},
        {"ticker": "INE123F08014", "name": "Bhopal Municipal 8.15%", "issuer": "Bhopal Municipal Corp", "face_value": 100000, "coupon_rate": 8.15, "maturity_date": "2028-11-20"},
        {"ticker": "INE345D08019", "name": "Kanpur Municipal 8.60%", "issuer": "Kanpur Municipal Corp", "face_value": 100000, "coupon_rate": 8.60, "maturity_date": "2026-07-25"},
        {"ticker": "INE456R08010", "name": "Rajkot Municipal 8.05%", "issuer": "Rajkot Municipal Corp", "face_value": 100000, "coupon_rate": 8.05, "maturity_date": "2029-09-10"},
        {"ticker": "INE567J08011", "name": "Jaipur Municipal 8.30%", "issuer": "Jaipur Municipal Corp", "face_value": 100000, "coupon_rate": 8.30, "maturity_date": "2027-12-15"},
        {"ticker": "INE678P08012", "name": "Patna Municipal 8.75%", "issuer": "Patna Municipal Corp", "face_value": 100000, "coupon_rate": 8.75, "maturity_date": "2030-05-20"},
        {"ticker": "INE789V08013", "name": "Varanasi Municipal 8.55%", "issuer": "Varanasi Municipal Corp", "face_value": 100000, "coupon_rate": 8.55, "maturity_date": "2028-08-10"},
        {"ticker": "INE890K08014", "name": "Kochi Municipal 8.40%", "issuer": "Kochi Municipal Corp", "face_value": 100000, "coupon_rate": 8.40, "maturity_date": "2029-10-15"},
        {"ticker": "INE901N08015", "name": "Nashik Municipal 8.30%", "issuer": "Nashik Municipal Corp", "face_value": 100000, "coupon_rate": 8.30, "maturity_date": "2031-03-31"},
        {"ticker": "INE012C08016", "name": "Chennai Municipal 8.10%", "issuer": "Chennai Municipal Corp", "face_value": 100000, "coupon_rate": 8.10, "maturity_date": "2027-11-30"},
        {"ticker": "INE123B08017", "name": "Bengaluru Municipal 8.50%", "issuer": "Bruhat Bengaluru Mahanagara Palike", "face_value": 100000, "coupon_rate": 8.50, "maturity_date": "2029-04-18"},
        {"ticker": "INE234T08018", "name": "Trivandrum Municipal 8.65%", "issuer": "Trivandrum Municipal Corp", "face_value": 100000, "coupon_rate": 8.65, "maturity_date": "2030-12-12"},
        {"ticker": "INE345G08019", "name": "Gwalior Municipal 8.45%", "issuer": "Gwalior Municipal Corp", "face_value": 100000, "coupon_rate": 8.45, "maturity_date": "2028-05-05"}
    ],
    "Agency": [
        {"ticker": "INE261F08DW2", "name": "NABARD 7.50% 2026", "issuer": "National Bank for Agriculture and Rural Development", "face_value": 100000, "coupon_rate": 7.50, "maturity_date": "2026-03-19"},
        {"ticker": "INE134E08KY9", "name": "Power Finance Corp 7.54%", "issuer": "Power Finance Corporation", "face_value": 100000, "coupon_rate": 7.54, "maturity_date": "2032-11-15"},
        {"ticker": "INE020B08DF2", "name": "REC Ltd 7.64%", "issuer": "REC Limited", "face_value": 100000, "coupon_rate": 7.64, "maturity_date": "2032-09-28"},
        {"ticker": "INE733E08147", "name": "NTPC Ltd 8.49%", "issuer": "NTPC Limited", "face_value": 10000, "coupon_rate": 8.49, "maturity_date": "2025-03-25"},
        {"ticker": "INE053F08271", "name": "IRFC Select 7.49%", "issuer": "Indian Railway Finance Corp", "face_value": 100000, "coupon_rate": 7.49, "maturity_date": "2032-05-28"},
        {"ticker": "INE043D08182", "name": "NHAI Tax Free 8.30%", "issuer": "National Highways Authority of India", "face_value": 1000, "coupon_rate": 8.30, "maturity_date": "2027-03-09"},
        {"ticker": "INE031A08356", "name": "HUDCO 7.51%", "issuer": "Housing and Urban Development", "face_value": 100000, "coupon_rate": 7.51, "maturity_date": "2029-02-16"},
        {"ticker": "INE556F08220", "name": "SIDBI 7.39%", "issuer": "Small Industries Dev Bank", "face_value": 100000, "coupon_rate": 7.39, "maturity_date": "2028-09-22"},
        {"ticker": "INE906B08151", "name": "NHAI 7.80%", "issuer": "National Highways Authority of India", "face_value": 100000, "coupon_rate": 7.80, "maturity_date": "2030-01-10"},
        {"ticker": "INE261F08DP6", "name": "NABARD 7.62%", "issuer": "National Bank for Agriculture and Rural Development", "face_value": 100000, "coupon_rate": 7.62, "maturity_date": "2029-08-01"},
        {"ticker": "INE053F08255", "name": "IRFC 7.53%", "issuer": "Indian Railway Finance Corp", "face_value": 100000, "coupon_rate": 7.53, "maturity_date": "2030-12-21"},
        {"ticker": "INE020B08DG0", "name": "REC Ltd 7.77%", "issuer": "REC Limited", "face_value": 100000, "coupon_rate": 7.77, "maturity_date": "2035-03-15"},
        {"ticker": "INE031A08364", "name": "HUDCO Tax Free 8.20%", "issuer": "Housing and Urban Development", "face_value": 1000, "coupon_rate": 8.20, "maturity_date": "2027-03-05"},
        {"ticker": "INE134E08KZ6", "name": "PFC 7.75%", "issuer": "Power Finance Corporation", "face_value": 100000, "coupon_rate": 7.75, "maturity_date": "2035-06-11"},
        {"ticker": "INE848E08071", "name": "NHPC 7.60%", "issuer": "NHPC Limited", "face_value": 100000, "coupon_rate": 7.60, "maturity_date": "2032-02-28"},
        {"ticker": "INE514E08CA3", "name": "Exim Bank 7.55%", "issuer": "Export Import Bank of India", "face_value": 100000, "coupon_rate": 7.55, "maturity_date": "2031-10-15"},
        {"ticker": "INE242A08473", "name": "Indian Oil 7.70%", "issuer": "Indian Oil Corporation", "face_value": 100000, "coupon_rate": 7.70, "maturity_date": "2030-11-20"},
        {"ticker": "INE043D08190", "name": "NHAI 7.95%", "issuer": "National Highways Authority of India", "face_value": 100000, "coupon_rate": 7.95, "maturity_date": "2035-12-10"},
        {"ticker": "INE556F08238", "name": "SIDBI 7.45%", "issuer": "Small Industries Dev Bank", "face_value": 100000, "coupon_rate": 7.45, "maturity_date": "2029-05-18"},
        {"ticker": "INE733E08154", "name": "NTPC Ltd 7.50%", "issuer": "NTPC Limited", "face_value": 100000, "coupon_rate": 7.50, "maturity_date": "2030-07-22"}
    ],
    "Zero-Coupon": [
        {"ticker": "IN002024X912", "name": "91 Day T-Bill (ZCB)", "issuer": "Government of India", "face_value": 100, "coupon_rate": 0.00, "maturity_date": "2024-06-13"},
        {"ticker": "IN002024X183", "name": "182 Day T-Bill (ZCB)", "issuer": "Government of India", "face_value": 100, "coupon_rate": 0.00, "maturity_date": "2024-09-12"},
        {"ticker": "IN002024X365", "name": "364 Day T-Bill (ZCB)", "issuer": "Government of India", "face_value": 100, "coupon_rate": 0.00, "maturity_date": "2025-03-13"},
        {"ticker": "INE020B09204", "name": "REC Deep Discount ZCB", "issuer": "REC Limited", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2030-12-01"},
        {"ticker": "INE261F09063", "name": "NABARD ZCB 2027", "issuer": "National Bank for Agriculture and Rural Development", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2027-05-20"},
        {"ticker": "INE043D09016", "name": "NHAI ZCB 2028", "issuer": "National Highways Authority of India", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2028-08-14"},
        {"ticker": "INE134E09121", "name": "PFC ZCB 2029", "issuer": "Power Finance Corporation", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2029-11-30"},
        {"ticker": "INE053F09188", "name": "IRFC ZCB 2026", "issuer": "Indian Railway Finance Corp", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2026-04-15"},
        {"ticker": "INE001A09237", "name": "HDFC Bank ZCB", "issuer": "HDFC Bank Limited", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2025-09-22"},
        {"ticker": "INE476A09058", "name": "Canara Bank ZCB", "issuer": "Canara Bank", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2026-10-10"},
        {"ticker": "IN002024Y912", "name": "91 Day T-Bill Sep", "issuer": "Government of India", "face_value": 100, "coupon_rate": 0.00, "maturity_date": "2024-09-13"},
        {"ticker": "IN002024Y183", "name": "182 Day T-Bill Dec", "issuer": "Government of India", "face_value": 100, "coupon_rate": 0.00, "maturity_date": "2024-12-12"},
        {"ticker": "IN002025Y365", "name": "364 Day T-Bill Jun", "issuer": "Government of India", "face_value": 100, "coupon_rate": 0.00, "maturity_date": "2025-06-13"},
        {"ticker": "INE062A09321", "name": "SBI ZCB 2028", "issuer": "State Bank of India", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2028-02-18"},
        {"ticker": "INE238A09121", "name": "Axis Bank ZCB", "issuer": "Axis Bank", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2027-07-25"},
        {"ticker": "INE090A09345", "name": "ICICI Bank ZCB", "issuer": "ICICI Bank Limited", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2026-11-11"},
        {"ticker": "INE154A09112", "name": "ITC Deep Discount", "issuer": "ITC Limited", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2032-05-05"},
        {"ticker": "INE002A09887", "name": "Reliance ZCB 2030", "issuer": "Reliance Industries Limited", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2030-08-30"},
        {"ticker": "INE296A09341", "name": "Bajaj Fin ZCB", "issuer": "Bajaj Finance Limited", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2026-03-24"},
        {"ticker": "INE018A09123", "name": "L&T Deep Discount", "issuer": "Larsen & Toubro", "face_value": 100000, "coupon_rate": 0.00, "maturity_date": "2035-01-20"}
    ],
    "Inflation-Linked": [
        {"ticker": "IN0020130079", "name": "1.44% IIGS 2023", "issuer": "Government of India", "face_value": 100, "coupon_rate": 1.44, "maturity_date": "2023-06-05"},
        {"ticker": "IN0020130188", "name": "IINSS 2024 (CPI)", "issuer": "Government of India", "face_value": 100, "coupon_rate": 1.50, "maturity_date": "2024-12-31"},
        {"ticker": "IN0020180016", "name": "IINSS 2028 (CPI-Linked)", "issuer": "Government of India", "face_value": 100, "coupon_rate": 1.50, "maturity_date": "2028-10-15"},
        {"ticker": "IN0020220193", "name": "Capital Indexed Bond 2032", "issuer": "Government of India", "face_value": 100, "coupon_rate": 1.75, "maturity_date": "2032-05-18"},
        {"ticker": "US912828H458", "name": "US TIPS 0.625% 2026", "issuer": "US Treasury", "face_value": 1000, "coupon_rate": 0.625, "maturity_date": "2026-01-15"},
        {"ticker": "US912828M396", "name": "US TIPS 0.125% 2031", "issuer": "US Treasury", "face_value": 1000, "coupon_rate": 0.125, "maturity_date": "2031-07-15"},
        {"ticker": "US912828W902", "name": "US TIPS 1.500% 2053", "issuer": "US Treasury", "face_value": 1000, "coupon_rate": 1.50, "maturity_date": "2053-02-15"},
        {"ticker": "GB00B00NY175", "name": "UK ILG 1.25% 2027", "issuer": "UK Debt Management Office", "face_value": 100, "coupon_rate": 1.25, "maturity_date": "2027-11-22"},
        {"ticker": "IN0020150244", "name": "CIB 2025", "issuer": "Government of India", "face_value": 100, "coupon_rate": 1.62, "maturity_date": "2025-08-20"},
        {"ticker": "US912828X885", "name": "US TIPS 1.125% 2033", "issuer": "US Treasury", "face_value": 1000, "coupon_rate": 1.125, "maturity_date": "2033-01-15"},
        {"ticker": "JP0018593845", "name": "JGB IL 0.10% 2030", "issuer": "Government of Japan", "face_value": 100000, "coupon_rate": 0.10, "maturity_date": "2030-03-10"},
        {"ticker": "IN0020190115", "name": "IINSS 2029", "issuer": "Government of India", "face_value": 100, "coupon_rate": 1.80, "maturity_date": "2029-06-15"},
        {"ticker": "US912828V491", "name": "US TIPS 0.500% 2028", "issuer": "US Treasury", "face_value": 1000, "coupon_rate": 0.50, "maturity_date": "2028-04-15"},
        {"ticker": "GB00BZ13DV40", "name": "UK ILG 0.125% 2036", "issuer": "UK Debt Management Office", "face_value": 100, "coupon_rate": 0.125, "maturity_date": "2036-11-22"},
        {"ticker": "IN0020210418", "name": "CIB 2035", "issuer": "Government of India", "face_value": 100, "coupon_rate": 1.95, "maturity_date": "2035-11-28"},
        {"ticker": "FR0013327495", "name": "OATi 0.10% 2036 (France)", "issuer": "French Republic", "face_value": 100, "coupon_rate": 0.10, "maturity_date": "2036-07-25"},
        {"ticker": "US91282CDP41", "name": "US TIPS 2.000% 2050", "issuer": "US Treasury", "face_value": 1000, "coupon_rate": 2.00, "maturity_date": "2050-02-15"},
        {"ticker": "IN0020140228", "name": "IINSS 2026", "issuer": "Government of India", "face_value": 100, "coupon_rate": 1.65, "maturity_date": "2026-03-11"},
        {"ticker": "GB00B85SFQ54", "name": "UK ILG 0.125% 2044", "issuer": "UK Debt Management Office", "face_value": 100, "coupon_rate": 0.125, "maturity_date": "2044-03-22"},
        {"ticker": "US912828A643", "name": "US TIPS 0.875% 2029", "issuer": "US Treasury", "face_value": 1000, "coupon_rate": 0.875, "maturity_date": "2029-01-15"}
    ],
    "Convertible": [
        {"ticker": "INE141A08355", "name": "Tata Steel FCCB 5.0%", "issuer": "Tata Steel Limited", "face_value": 100000, "coupon_rate": 5.00, "maturity_date": "2027-11-15"},
        {"ticker": "INE002A08912", "name": "Reliance FCCB 4.5%", "issuer": "Reliance Industries Limited", "face_value": 100000, "coupon_rate": 4.50, "maturity_date": "2028-05-20"},
        {"ticker": "INE040H08149", "name": "HDFC Ltd NCD (Cv)", "issuer": "HDFC Limited", "face_value": 100000, "coupon_rate": 6.85, "maturity_date": "2026-08-14"},
        {"ticker": "INE062A08233", "name": "SBI Perpetual Conv.", "issuer": "State Bank of India", "face_value": 1000000, "coupon_rate": 7.50, "maturity_date": "2099-12-31"},
        {"ticker": "INE154A08311", "name": "ITC Conv. Bond 5.5%", "issuer": "ITC Limited", "face_value": 100000, "coupon_rate": 5.50, "maturity_date": "2029-10-18"},
        {"ticker": "INE238A08151", "name": "Axis Bank Conv. Tier I", "issuer": "Axis Bank", "face_value": 100000, "coupon_rate": 8.00, "maturity_date": "2099-12-31"},
        {"ticker": "INE885A08122", "name": "JSW Steel FCCB", "issuer": "JSW Steel Limited", "face_value": 100000, "coupon_rate": 4.80, "maturity_date": "2026-12-10"},
        {"ticker": "INE009A08442", "name": "Infosys Conv. 5.1%", "issuer": "Infosys Limited", "face_value": 100000, "coupon_rate": 5.10, "maturity_date": "2028-02-28"},
        {"ticker": "INE081A08343", "name": "Tata Motors FCCB", "issuer": "Tata Motors Limited", "face_value": 100000, "coupon_rate": 4.95, "maturity_date": "2027-09-15"},
        {"ticker": "INE211A08111", "name": "Wipro Conv. 5.25%", "issuer": "Wipro Limited", "face_value": 100000, "coupon_rate": 5.25, "maturity_date": "2030-11-11"},
        {"ticker": "INE745G08056", "name": "Airtel FCCB 5.0%", "issuer": "Bharti Airtel", "face_value": 100000, "coupon_rate": 5.00, "maturity_date": "2028-06-25"},
        {"ticker": "INE245A08182", "name": "Tata Power Conv.", "issuer": "Tata Power", "face_value": 100000, "coupon_rate": 6.50, "maturity_date": "2029-03-30"},
        {"ticker": "INE256A08221", "name": "Mahindra FCCB 4.75%", "issuer": "Mahindra & Mahindra", "face_value": 100000, "coupon_rate": 4.75, "maturity_date": "2027-01-15"},
        {"ticker": "INE018A08561", "name": "L&T FCCB 4.60%", "issuer": "Larsen & Toubro", "face_value": 100000, "coupon_rate": 4.60, "maturity_date": "2026-07-20"},
        {"ticker": "INE012A08245", "name": "Asian Paints Conv.", "issuer": "Asian Paints", "face_value": 100000, "coupon_rate": 5.80, "maturity_date": "2029-08-08"},
        {"ticker": "INE323A08123", "name": "HCL Tech Conv.", "issuer": "HCL Technologies", "face_value": 100000, "coupon_rate": 5.35, "maturity_date": "2030-05-12"},
        {"ticker": "INE044A08223", "name": "Sun Pharma FCCB", "issuer": "Sun Pharma", "face_value": 100000, "coupon_rate": 4.85, "maturity_date": "2028-12-10"},
        {"ticker": "INE068D08111", "name": "Kotak Bank Tier I Cv", "issuer": "Kotak Mahindra Bank", "face_value": 1000000, "coupon_rate": 7.80, "maturity_date": "2099-12-31"},
        {"ticker": "INE123A08354", "name": "Dr Reddy Conv.", "issuer": "Dr Reddy's Labs", "face_value": 100000, "coupon_rate": 5.45, "maturity_date": "2029-11-22"},
        {"ticker": "INE456A08172", "name": "Maruti Suzuki FCCB", "issuer": "Maruti Suzuki", "face_value": 100000, "coupon_rate": 4.90, "maturity_date": "2027-04-18"}
    ],
    "Green": [
        {"ticker": "IN0020220169", "name": "Sovereign Green 7.38%", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.38, "maturity_date": "2033-02-09"},
        {"ticker": "IN0020220151", "name": "Sovereign Green 7.10%", "issuer": "Government of India", "face_value": 100, "coupon_rate": 7.10, "maturity_date": "2028-02-09"},
        {"ticker": "XS2599292523", "name": "REC Green Bond 5.06%", "issuer": "REC Limited", "face_value": 100000, "coupon_rate": 5.06, "maturity_date": "2028-04-11"},
        {"ticker": "INE017U08016", "name": "Indore Municipal Green", "issuer": "Indore Municipal", "face_value": 10000, "coupon_rate": 8.25, "maturity_date": "2033-02-15"},
        {"ticker": "INE848E07727", "name": "NHPC Green Bond 7.50%", "issuer": "NHPC Limited", "face_value": 1000000, "coupon_rate": 7.50, "maturity_date": "2035-10-31"},
        {"ticker": "INE202E08111", "name": "IREDA Green Bond 7.75%", "issuer": "IREDA Limited", "face_value": 1000000, "coupon_rate": 7.75, "maturity_date": "2033-01-15"},
        {"ticker": "INE134E08LP8", "name": "PFC Green Bond 7.45%", "issuer": "Power Finance Corporation", "face_value": 1000000, "coupon_rate": 7.45, "maturity_date": "2028-11-20"},
        {"ticker": "INE364U08053", "name": "Adani Green 8.10%", "issuer": "Adani Green Energy", "face_value": 100000, "coupon_rate": 8.10, "maturity_date": "2034-02-15"},
        {"ticker": "INE885A08151", "name": "JSW Hydro Green 7.85%", "issuer": "JSW Hydro Energy", "face_value": 100000, "coupon_rate": 7.85, "maturity_date": "2027-10-10"},
        {"ticker": "INE857Q08253", "name": "Tata Cleantech 7.90%", "issuer": "Tata Cleantech Capital", "face_value": 100000, "coupon_rate": 7.90, "maturity_date": "2029-05-12"},
        {"ticker": "INE062A08356", "name": "SBI Green Bond 7.60%", "issuer": "State Bank of India", "face_value": 1000000, "coupon_rate": 7.60, "maturity_date": "2032-01-20"},
        {"ticker": "INE001A08X23", "name": "HDFC Green Bond 7.80%", "issuer": "HDFC Bank Limited", "face_value": 100000, "coupon_rate": 7.80, "maturity_date": "2026-12-15"},
        {"ticker": "INE332V08012", "name": "Greenko Energy 8.25%", "issuer": "Greenko Group", "face_value": 100000, "coupon_rate": 8.25, "maturity_date": "2030-07-22"},
        {"ticker": "INE944Y08013", "name": "ReNew Power Green 8.00%", "issuer": "ReNew Energy Global", "face_value": 100000, "coupon_rate": 8.00, "maturity_date": "2028-04-14"},
        {"ticker": "INE219W08016", "name": "IndiaGrid Green 7.95%", "issuer": "India Grid Trust", "face_value": 100000, "coupon_rate": 7.95, "maturity_date": "2029-10-30"},
        {"ticker": "INE456T08019", "name": "Adani Solar 8.15%", "issuer": "Adani Solar", "face_value": 100000, "coupon_rate": 8.15, "maturity_date": "2027-09-18"},
        {"ticker": "INE018A08XZ2", "name": "L&T Green Bond 7.70%", "issuer": "Larsen & Toubro", "face_value": 100000, "coupon_rate": 7.70, "maturity_date": "2031-03-25"},
        {"ticker": "INE678U08010", "name": "Hero Future Green 8.30%", "issuer": "Hero Future Energies", "face_value": 100000, "coupon_rate": 8.30, "maturity_date": "2026-08-10"},
        {"ticker": "INE245A08151", "name": "Tata Power Green 7.95%", "issuer": "Tata Power", "face_value": 100000, "coupon_rate": 7.95, "maturity_date": "2029-01-20"},
        {"ticker": "INE123Z08015", "name": "ACME Solar Green 8.40%", "issuer": "ACME Solar Holdings", "face_value": 100000, "coupon_rate": 8.40, "maturity_date": "2028-11-11"},
        {"ticker": "INE987F08018", "name": "Azure Power Green 8.20%", "issuer": "Azure Power", "face_value": 100000, "coupon_rate": 8.20, "maturity_date": "2027-05-15"}
    ],
    "Floating Rate": [
        {"ticker": "IN0020210194", "name": "GOI FRB 2033", "issuer": "Government of India", "face_value": 100, "coupon_rate": 8.56, "maturity_date": "2033-09-22"},
        {"ticker": "IN0020210210", "name": "GOI FRB 2028", "issuer": "Government of India", "face_value": 100, "coupon_rate": 8.20, "maturity_date": "2028-10-04"},
        {"ticker": "IN0020220136", "name": "GOI FRB 2034", "issuer": "Government of India", "face_value": 100, "coupon_rate": 8.51, "maturity_date": "2034-10-30"},
        {"ticker": "IN0020200252", "name": "GOI FRB 2031", "issuer": "Government of India", "face_value": 100, "coupon_rate": 8.35, "maturity_date": "2031-12-07"},
        {"ticker": "IN0020200112", "name": "GOI FRB 2024", "issuer": "Government of India", "face_value": 100, "coupon_rate": 8.16, "maturity_date": "2024-11-07"},
        {"ticker": "INE001A08X01", "name": "HDFC Bank FRB 2027", "issuer": "HDFC Bank Limited", "face_value": 100000, "coupon_rate": 8.35, "maturity_date": "2027-08-20"},
        {"ticker": "INE062A08264", "name": "SBI Flexi Cap FRB", "issuer": "State Bank of India", "face_value": 1000000, "coupon_rate": 8.40, "maturity_date": "2029-05-15"},
        {"ticker": "INE090A08TR9", "name": "ICICI Bank FRB 2028", "issuer": "ICICI Bank Limited", "face_value": 100000, "coupon_rate": 8.45, "maturity_date": "2028-11-10"},
        {"ticker": "INE160A08152", "name": "PNB Floating Rate 2030", "issuer": "Punjab National Bank", "face_value": 100000, "coupon_rate": 8.50, "maturity_date": "2030-03-25"},
        {"ticker": "INE028A08182", "name": "Bank of Baroda FRB", "issuer": "Bank of Baroda", "face_value": 100000, "coupon_rate": 8.35, "maturity_date": "2029-07-18"},
        {"ticker": "INE134E08MN7", "name": "PFC Floating Rate", "issuer": "Power Finance Corporation", "face_value": 1000000, "coupon_rate": 8.60, "maturity_date": "2031-09-30"},
        {"ticker": "INE020B08ZY6", "name": "REC Ltd FRB 2032", "issuer": "REC Limited", "face_value": 100000, "coupon_rate": 8.55, "maturity_date": "2032-02-15"},
        {"ticker": "INE261F08DX0", "name": "NABARD Float 2028", "issuer": "NABARD", "face_value": 100000, "coupon_rate": 8.25, "maturity_date": "2028-06-20"},
        {"ticker": "INE906B08151", "name": "NHAI Flexi Rate", "issuer": "NHAI", "face_value": 100000, "coupon_rate": 8.40, "maturity_date": "2029-10-10"},
        {"ticker": "INE556F08253", "name": "SIDBI Flexi Bond", "issuer": "SIDBI", "face_value": 100000, "coupon_rate": 8.30, "maturity_date": "2027-04-18"},
        {"ticker": "INE115A08183", "name": "LIC Housing FRB", "issuer": "LIC Housing Finance", "face_value": 100000, "coupon_rate": 8.65, "maturity_date": "2030-11-25"},
        {"ticker": "INE498L08127", "name": "L&T Finance Float", "issuer": "L&T Finance", "face_value": 100000, "coupon_rate": 8.70, "maturity_date": "2026-08-30"},
        {"ticker": "INE296A08XX3", "name": "Bajaj Finance FRB", "issuer": "Bajaj Finance Limited", "face_value": 100000, "coupon_rate": 8.80, "maturity_date": "2028-12-15"},
        {"ticker": "INE774D08181", "name": "M&M Finance Flexi", "issuer": "Mahindra & Mahindra Fin", "face_value": 100000, "coupon_rate": 8.75, "maturity_date": "2027-05-20"},
        {"ticker": "INE121A08PO3", "name": "Chola Float Rate", "issuer": "Cholamandalam Invest", "face_value": 100000, "coupon_rate": 8.85, "maturity_date": "2029-01-31"},
        {"ticker": "INE081A08XY2", "name": "Tata Motors FRB", "issuer": "Tata Motors Limited", "face_value": 100000, "coupon_rate": 8.90, "maturity_date": "2028-09-15"}
    ]
}

bonds_json = []

for bond_type, bond_list in bonds_map.items():
    for b in bond_list:
        bonds_json.append({
            "ticker": b['ticker'],
            "name": b['name'],
            "issuer": b['issuer'],
            "face_value": b['face_value'],
            "coupon_rate": b['coupon_rate'],
            "maturity_date": b['maturity_date'],
            "type": bond_type
        })

output_file = "/Users/shivampatel/aether-isle/aether-fastapi/backend/services/indian_bonds.py"

content = f"""import json

# Dictionary of popular bonds curated for Aether Isle
INDIAN_BONDS = {json.dumps(bonds_json, indent=4)}

def search_indian_bonds(query: str, bond_type: str = None):
    \"\"\"Search local dictionary for indian bonds by ticker, name, or issuer\"\"\"
    query_lower = query.lower()
    bond_type_lower = bond_type.lower() if bond_type else None
    
    results = []
    
    for bond in INDIAN_BONDS:
        if bond_type_lower:
            if bond_type_lower not in bond['type'].lower():
                continue
                
        if (query_lower in bond['ticker'].lower() or 
            query_lower in bond['name'].lower() or 
            query_lower in bond['issuer'].lower()):
            
            results.append(bond)
            
    return results[:40]  # Return up to 40 matches
"""

with open(output_file, "w") as f:
    f.write(content)

print(f"Successfully generated indian_bonds.py with {len(bonds_json)} total bonds across {len(bonds_map)} types.")
