-- Comprehensive Bond Master Data: 116 Bonds Across All 15 Types
-- Generated for Aether Isle Dashboard
-- Date: 2026-01-10

-- ============================================
-- GOVERNMENT BONDS (10 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('Government of India', 'government', 'Government of India 6.79% 2027', 'GOI-2027-II', 6.79, 'fixed', 100, '2027-05-10', 'INR', 'India', 'AAA'),
('Government of India', 'government', 'Government of India 7.17% 2028', 'GOI-2028-I', 7.17, 'fixed', 100, '2028-01-08', 'INR', 'India', 'AAA'),
('Government of India', 'government', 'Government of India 7.38% 2029', 'GOI-2029-I', 7.38, 'fixed', 100, '2029-04-16', 'INR', 'India', 'AAA'),
('Government of India', 'government', 'Government of India 7.32% 2030', 'GOI-2030-III', 7.32, 'fixed', 100, '2030-10-01', 'INR', 'India', 'AAA'),
('Government of India', 'government', 'Government of India 6.92% 2032', 'GOI-2032-I', 6.92, 'fixed', 100, '2032-12-11', 'INR', 'India', 'AAA'),
('Government of India', 'government', 'Government of India 7.41% 2036', 'GOI-2036-I', 7.41, 'fixed', 100, '2036-02-02', 'INR', 'India', 'AAA'),
('Government of India', 'government', 'Government of India 7.61% 2040', 'GOI-2040-I', 7.61, 'fixed', 100, '2040-07-09', 'INR', 'India', 'AAA'),
('Government of India', 'government', 'Government of India 7.68% 2045', 'GOI-2045-I', 7.68, 'fixed', 100, '2045-12-15', 'INR', 'India', 'AAA'),
('Government of India', 'government', 'Government of India 7.54% 2050', 'GOI-2050-I', 7.54, 'fixed', 100, '2050-06-12', 'INR', 'India', 'AAA'),
('Government of India', 'government', 'Government of India 7.35% 2053', 'GOI-2053-I', 7.35, 'fixed', 100, '2053-04-08', 'INR', 'India', 'AAA');

-- ============================================
-- TREASURY BONDS (8 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('US Treasury', 'treasury', 'US Treasury Note 4.50% 2028', 'UST-2028', 4.50, 'fixed', 1000, '2028-11-15', 'USD', 'USA', 'AAA'),
('US Treasury', 'treasury', 'US Treasury Bond 4.75% 2034', 'UST-2034', 4.75, 'fixed', 1000, '2034-05-15', 'USD', 'USA', 'AAA'),
('UK Treasury', 'treasury', 'UK Gilt 3.75% 2030', 'GILT-2030', 3.75, 'fixed', 1000, '2030-09-07', 'GBP', 'UK', 'AAA'),
('UK Treasury', 'treasury', 'UK Gilt 4.25% 2040', 'GILT-2040', 4.25, 'fixed', 1000, '2040-12-07', 'GBP', 'UK', 'AAA'),
('German Finance Agency', 'treasury', 'German Bund 2.50% 2032', 'BUND-2032', 2.50, 'fixed', 1000, '2032-08-15', 'EUR', 'Germany', 'AAA'),
('Japanese Ministry of Finance', 'treasury', 'Japan Government Bond 0.75% 2031', 'JGB-2031', 0.75, 'fixed', 10000, '2031-12-20', 'JPY', 'Japan', 'AAA'),
('Canadian Dept of Finance', 'treasury', 'Canada Government Bond 3.25% 2033', 'CGB-2033', 3.25, 'fixed', 1000, '2033-06-01', 'CAD', 'Canada', 'AAA'),
('Australian Office of Financial Management', 'treasury', 'Australian Government Bond 4.00% 2037', 'AGB-2037', 4.00, 'fixed', 1000, '2037-04-21', 'AUD', 'Australia', 'AAA');

-- ============================================
-- MUNICIPAL BONDS (10 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('Bangalore Municipal Corporation', 'municipal', 'Bangalore Municipal Bond 7.38% 2032', 'BMC-2032', 7.38, 'fixed', 1000, '2032-03-15', 'INR', 'India', 'AA+'),
('Hyderabad Metropolitan Development Authority', 'municipal', 'Hyderabad Municipal Bond 7.45% 2033', 'HMDA-2033', 7.45, 'fixed', 1000, '2033-06-20', 'INR', 'India', 'AA+'),
('Chennai Metropolitan Water Supply', 'municipal', 'Chennai Water Bond 7.20% 2030', 'CMWSS-2030', 7.20, 'fixed', 1000, '2030-09-10', 'INR', 'India', 'AA'),
('Kolkata Municipal Corporation', 'municipal', 'Kolkata Municipal Bond 7.50% 2031', 'KMC-2031', 7.50, 'fixed', 1000, '2031-12-01', 'INR', 'India', 'AA'),
('Ahmedabad Municipal Corporation', 'municipal', 'Ahmedabad Municipal Bond 7.15% 2029', 'AMC-2029', 7.15, 'fixed', 1000, '2029-08-15', 'INR', 'India', 'AA+'),
('Surat Municipal Corporation', 'municipal', 'Surat Municipal Bond 7.35% 2030', 'SMC-2030', 7.35, 'fixed', 1000, '2030-04-25', 'INR', 'India', 'AA'),
('Jaipur Development Authority', 'municipal', 'Jaipur Municipal Bond 7.40% 2032', 'JDA-2032', 7.40, 'fixed', 1000, '2032-11-05', 'INR', 'India', 'AA'),
('Lucknow Municipal Corporation', 'municipal', 'Lucknow Municipal Bond 7.55% 2031', 'LMC-2031', 7.55, 'fixed', 1000, '2031-02-14', 'INR', 'India', 'AA-'),
('Indore Municipal Corporation', 'municipal', 'Indore Municipal Bond 7.25% 2030', 'IMC-2030', 7.25, 'fixed', 1000, '2030-07-20', 'INR', 'India', 'AA'),
('Nashik Municipal Corporation', 'municipal', 'Nashik Municipal Bond 7.48% 2033', 'NMC-2033', 7.48, 'fixed', 1000, '2033-01-30', 'INR', 'India', 'AA-');

-- ============================================
-- CORPORATE BONDS (12 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('NTPC Ltd', 'corporate', 'NTPC Senior Bond 8.15% 2030', 'NTPC-2030-I', 8.15, 'fixed', 1000, '2030-03-12', 'INR', 'India', 'AAA'),
('NHPC Ltd', 'corporate', 'NHPC Senior Bond 7.95% 2029', 'NHPC-2029', 7.95, 'fixed', 1000, '2029-09-25', 'INR', 'India', 'AAA'),
('Coal India Ltd', 'corporate', 'Coal India Bond 8.25% 2031', 'CIL-2031', 8.25, 'fixed', 1000, '2031-05-18', 'INR', 'India', 'AAA'),
('Indian Oil Corporation', 'corporate', 'IOC Senior Bond 8.40% 2032', 'IOC-2032', 8.40, 'fixed', 1000, '2032-11-22', 'INR', 'India', 'AAA'),
('Bharat Petroleum Corporation', 'corporate', 'BPCL Senior Bond 8.35% 2030', 'BPCL-2030', 8.35, 'fixed', 1000, '2030-08-14', 'INR', 'India', 'AAA'),
('Bajaj Finance Ltd', 'corporate', 'Bajaj Finance Senior Bond 9.25% 2029', 'BAJFIN-2029', 9.25, 'fixed', 1000, '2029-03-20', 'INR', 'India', 'AA+'),
('Mahindra Finance', 'corporate', 'Mahindra Finance Bond 9.45% 2028', 'MMFS-2028', 9.45, 'fixed', 1000, '2028-12-10', 'INR', 'India', 'AA+'),
('Kotak Mahindra Bank', 'corporate', 'Kotak Bank Tier II Bond 8.75% 2031', 'KOTAK-T2-2031', 8.75, 'fixed', 1000, '2031-06-30', 'INR', 'India', 'AA+'),
('Axis Bank', 'corporate', 'Axis Bank Tier II Bond 8.65% 2030', 'AXIS-T2-2030', 8.65, 'fixed', 1000, '2030-09-15', 'INR', 'India', 'AA+'),
('ITC Ltd', 'corporate', 'ITC Senior Bond 8.10% 2033', 'ITC-2033', 8.10, 'fixed', 1000, '2033-02-28', 'INR', 'India', 'AAA'),
('Larsen & Toubro', 'corporate', 'L&T Senior Bond 8.50% 2032', 'LT-2032', 8.50, 'fixed', 1000, '2032-07-19', 'INR', 'India', 'AAA'),
('Adani Ports', 'corporate', 'Adani Ports Bond 9.75% 2029', 'ADSEZ-2029', 9.75, 'fixed', 1000, '2029-11-08', 'INR', 'India', 'AA');

-- ============================================
-- AGENCY BONDS (10 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('National Highways Authority of India', 'agency', 'NHAI Tax-Free Bond 6.50% 2035', 'NHAI-TF-2035', 6.50, 'fixed', 1000, '2035-03-31', 'INR', 'India', 'AAA'),
('Indian Railway Finance Corporation', 'agency', 'IRFC Tax-Free Bond 6.65% 2036', 'IRFC-TF-2036', 6.65, 'fixed', 1000, '2036-02-28', 'INR', 'India', 'AAA'),
('Indian Renewable Energy Development Agency', 'agency', 'IREDA Tax-Free Bond 6.75% 2037', 'IREDA-TF-2037', 6.75, 'fixed', 1000, '2037-12-31', 'INR', 'India', 'AAA'),
('Housing and Urban Development Corporation', 'agency', 'HUDCO Tax-Free Bond 6.55% 2034', 'HUDCO-TF-2034', 6.55, 'fixed', 1000, '2034-06-30', 'INR', 'India', 'AAA'),
('LIC Housing Finance', 'agency', 'LICHFL Bond 8.95% 2030', 'LICHFL-2030', 8.95, 'fixed', 1000, '2030-04-15', 'INR', 'India', 'AAA'),
('Rural Electrification Corporation', 'agency', 'REC Tax-Free Bond 6.70% 2035', 'REC-TF-2035', 6.70, 'fixed', 1000, '2035-09-30', 'INR', 'India', 'AAA'),
('Small Industries Development Bank of India', 'agency', 'SIDBI Bond 7.85% 2029', 'SIDBI-2029', 7.85, 'fixed', 1000, '2029-10-20', 'INR', 'India', 'AAA'),
('National Bank for Agriculture and Rural Development', 'agency', 'NABARD Rural Bond 7.50% 2031', 'NABARD-R-2031', 7.50, 'fixed', 1000, '2031-03-25', 'INR', 'India', 'AAA'),
('Export-Import Bank of India', 'agency', 'EXIM Bank Bond 7.95% 2032', 'EXIM-2032', 7.95, 'fixed', 1000, '2032-08-10', 'INR', 'India', 'AAA'),
('National Housing Bank', 'agency', 'NHB Housing Bond 7.75% 2030', 'NHB-H-2030', 7.75, 'fixed', 1000, '2030-11-30', 'INR', 'India', 'AAA');

-- ============================================
-- SOVEREIGN GOLD BONDS (10 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('Reserve Bank of India', 'sgb', 'Sovereign Gold Bond 2018-19 Series I', 'SGB-2018-I', 2.50, 'fixed', 3500, '2026-07-09', 'INR', 'India', 'AAA'),
('Reserve Bank of India', 'sgb', 'Sovereign Gold Bond 2019-20 Series II', 'SGB-2019-II', 2.50, 'fixed', 3800, '2027-10-14', 'INR', 'India', 'AAA'),
('Reserve Bank of India', 'sgb', 'Sovereign Gold Bond 2020-21 Series III', 'SGB-2020-III', 2.50, 'fixed', 4900, '2028-11-20', 'INR', 'India', 'AAA'),
('Reserve Bank of India', 'sgb', 'Sovereign Gold Bond 2021-22 Series IV', 'SGB-2021-IV', 2.50, 'fixed', 4700, '2029-02-05', 'INR', 'India', 'AAA'),
('Reserve Bank of India', 'sgb', 'Sovereign Gold Bond 2021-22 Series V', 'SGB-2021-V', 2.50, 'fixed', 4800, '2029-03-12', 'INR', 'India', 'AAA'),
('Reserve Bank of India', 'sgb', 'Sovereign Gold Bond 2022-23 Series VI', 'SGB-2022-VI', 2.50, 'fixed', 5200, '2030-04-18', 'INR', 'India', 'AAA'),
('Reserve Bank of India', 'sgb', 'Sovereign Gold Bond 2022-23 Series VII', 'SGB-2022-VII', 2.50, 'fixed', 5100, '2030-06-24', 'INR', 'India', 'AAA'),
('Reserve Bank of India', 'sgb', 'Sovereign Gold Bond 2023-24 Series VIII', 'SGB-2023-VIII', 2.50, 'fixed', 6000, '2031-08-30', 'INR', 'India', 'AAA'),
('Reserve Bank of India', 'sgb', 'Sovereign Gold Bond 2023-24 Series IX', 'SGB-2023-IX', 2.50, 'fixed', 6200, '2031-10-15', 'INR', 'India', 'AAA'),
('Reserve Bank of India', 'sgb', 'Sovereign Gold Bond 2023-24 Series X', 'SGB-2023-X', 2.50, 'fixed', 6100, '2031-12-20', 'INR', 'India', 'AAA');

-- ============================================
-- SOVEREIGN BONDS (8 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('Republic of Brazil', 'sovereign', 'Brazil Sovereign Bond 8.50% 2030', 'BRZ-2030', 8.50, 'fixed', 1000, '2030-01-05', 'USD', 'Brazil', 'BB-'),
('Republic of South Africa', 'sovereign', 'South Africa Sovereign Bond 7.75% 2032', 'ZAR-2032', 7.75, 'fixed', 1000, '2032-03-31', 'USD', 'South Africa', 'BB-'),
('Republic of Indonesia', 'sovereign', 'Indonesia Sovereign Bond 6.25% 2031', 'IDN-2031', 6.25, 'fixed', 1000, '2031-05-08', 'USD', 'Indonesia', 'BBB'),
('Republic of Turkey', 'sovereign', 'Turkey Sovereign Bond 9.00% 2029', 'TUR-2029', 9.00, 'fixed', 1000, '2029-09-14', 'USD', 'Turkey', 'B+'),
('Republic of Mexico', 'sovereign', 'Mexico Sovereign Bond 6.75% 2034', 'MEX-2034', 6.75, 'fixed', 1000, '2034-02-27', 'USD', 'Mexico', 'BBB'),
('Republic of Philippines', 'sovereign', 'Philippines Sovereign Bond 5.50% 2033', 'PHL-2033', 5.50, 'fixed', 1000, '2033-08-22', 'USD', 'Philippines', 'BBB'),
('Kingdom of Thailand', 'sovereign', 'Thailand Sovereign Bond 4.85% 2035', 'THA-2035', 4.85, 'fixed', 1000, '2035-11-10', 'USD', 'Thailand', 'BBB+'),
('Republic of Poland', 'sovereign', 'Poland Sovereign Bond 5.25% 2036', 'POL-2036', 5.25, 'fixed', 1000, '2036-04-15', 'USD', 'Poland', 'A-');

-- ============================================
-- CONVERTIBLE BONDS (8 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('Zomato Ltd', 'convertible', 'Zomato Convertible Bond 5.00% 2028', 'ZOMATO-CV-2028', 5.00, 'fixed', 10000, '2028-12-31', 'INR', 'India', 'BB+'),
('Paytm', 'convertible', 'Paytm Convertible Debenture 4.75% 2029', 'PAYTM-CV-2029', 4.75, 'fixed', 10000, '2029-06-30', 'INR', 'India', 'BB'),
('Nykaa E-Retail', 'convertible', 'Nykaa Convertible Bond 5.25% 2030', 'NYKAA-CV-2030', 5.25, 'fixed', 10000, '2030-03-31', 'INR', 'India', 'BBB-'),
('Swiggy Ltd', 'convertible', 'Swiggy Convertible Bond 5.50% 2028', 'SWIGGY-CV-2028', 5.50, 'fixed', 10000, '2028-09-15', 'INR', 'India', 'BB+'),
('Ola Electric', 'convertible', 'Ola Electric Convertible Bond 6.00% 2029', 'OLA-CV-2029', 6.00, 'fixed', 10000, '2029-11-20', 'INR', 'India', 'BB'),
('BYJU''S', 'convertible', 'BYJU''S Convertible Debenture 6.50% 2027', 'BYJUS-CV-2027', 6.50, 'fixed', 10000, '2027-04-10', 'INR', 'India', 'B+'),
('PolicyBazaar', 'convertible', 'PolicyBazaar Convertible Bond 5.75% 2030', 'PBAZAAR-CV-2030', 5.75, 'fixed', 10000, '2030-08-25', 'INR', 'India', 'BBB-'),
('Flipkart', 'convertible', 'Flipkart Convertible Bond 4.50% 2031', 'FLIPKART-CV-2031', 4.50, 'fixed', 10000, '2031-12-31', 'INR', 'India', 'BBB');

-- ============================================
-- ZERO-COUPON BONDS (8 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('Government of India', 'zero-coupon', 'GOI Zero Coupon Bond 2035', 'GOI-ZC-2035', 0.00, 'zero', 100, '2035-06-30', 'INR', 'India', 'AAA'),
('Government of India', 'zero-coupon', 'GOI Zero Coupon STRIPS 2040', 'GOI-ZC-2040', 0.00, 'zero', 100, '2040-12-31', 'INR', 'India', 'AAA'),
('HDFC Bank', 'zero-coupon', 'HDFC Zero Coupon Bond 2032', 'HDFC-ZC-2032', 0.00, 'zero', 1000, '2032-03-15', 'INR', 'India', 'AAA'),
('State Bank of India', 'zero-coupon', 'SBI Zero Coupon Bond 2033', 'SBI-ZC-2033', 0.00, 'zero', 1000, '2033-09-30', 'INR', 'India', 'AAA'),
('ICICI Bank', 'zero-coupon', 'ICICI Zero Coupon STRIPS 2034', 'ICICI-ZC-2034', 0.00, 'zero', 1000, '2034-06-15', 'INR', 'India', 'AAA'),
('Reliance Industries Ltd', 'zero-coupon', 'RIL Zero Coupon Bond 2031', 'RIL-ZC-2031', 0.00, 'zero', 1000, '2031-12-20', 'INR', 'India', 'AA+'),
('Tata Steel', 'zero-coupon', 'Tata Steel Zero Coupon 2030', 'TATA-ZC-2030', 0.00, 'zero', 1000, '2030-08-10', 'INR', 'India', 'AA'),
('Adani Enterprises', 'zero-coupon', 'Adani Zero Coupon Bond 2029', 'ADANI-ZC-2029', 0.00, 'zero', 1000, '2029-05-25', 'INR', 'India', 'AA-');

-- ============================================
-- FLOATING RATE BONDS (8 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('HDFC Bank', 'floating-rate', 'HDFC Floating Rate Note MIBOR+50bps 2029', 'HDFC-FRN-2029', 7.25, 'floating', 1000, '2029-03-31', 'INR', 'India', 'AAA'),
('State Bank of India', 'floating-rate', 'SBI Floating Rate Bond MIBOR+65bps 2030', 'SBI-FRN-2030', 7.40, 'floating', 1000, '2030-06-30', 'INR', 'India', 'AAA'),
('ICICI Bank', 'floating-rate', 'ICICI FRN MIBOR+55bps 2031', 'ICICI-FRN-2031', 7.30, 'floating', 1000, '2031-09-30', 'INR', 'India', 'AAA'),
('Axis Bank', 'floating-rate', 'Axis Floating Rate Note MIBOR+70bps 2029', 'AXIS-FRN-2029', 7.45, 'floating', 1000, '2029-12-31', 'INR', 'India', 'AA+'),
('Kotak Mahindra Bank', 'floating-rate', 'Kotak FRN MIBOR+60bps 2030', 'KOTAK-FRN-2030', 7.35, 'floating', 1000, '2030-03-31', 'INR', 'India', 'AA+'),
('NABARD', 'floating-rate', 'NABARD Floating Rate Bond MIBOR+45bps 2032', 'NABARD-FRN-2032', 7.20, 'floating', 1000, '2032-06-30', 'INR', 'India', 'AAA'),
('Power Finance Corporation', 'floating-rate', 'PFC FRN MIBOR+50bps 2031', 'PFC-FRN-2031', 7.25, 'floating', 1000, '2031-12-31', 'INR', 'India', 'AAA'),
('REC Ltd', 'floating-rate', 'REC Floating Rate Bond MIBOR+55bps 2033', 'REC-FRN-2033', 7.30, 'floating', 1000, '2033-03-31', 'INR', 'India', 'AAA');

-- ============================================
-- INFLATION-LINKED BONDS (6 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('Government of India', 'inflation-linked', 'GOI Inflation Indexed Bond 1.44% 2028', 'GOI-IL-2028', 1.44, 'fixed', 100, '2028-12-05', 'INR', 'India', 'AAA'),
('Government of India', 'inflation-linked', 'GOI Inflation Indexed Bond 1.50% 2031', 'GOI-IL-2031', 1.50, 'fixed', 100, '2031-04-15', 'INR', 'India', 'AAA'),
('Government of India', 'inflation-linked', 'GOI CPI Linked Bond 1.47% 2033', 'GOI-CPI-2033', 1.47, 'fixed', 100, '2033-12-04', 'INR', 'India', 'AAA'),
('US Treasury', 'inflation-linked', 'US TIPS 2.375% 2032', 'TIPS-2032', 2.375, 'fixed', 1000, '2032-01-15', 'USD', 'USA', 'AAA'),
('UK Treasury', 'inflation-linked', 'UK Index-Linked Gilt 0.125% 2036', 'ILGILT-2036', 0.125, 'fixed', 1000, '2036-11-22', 'GBP', 'UK', 'AAA'),
('Government of India', 'inflation-linked', 'GOI Inflation Indexed Bond 1.52% 2036', 'GOI-IL-2036', 1.52, 'fixed', 100, '2036-06-10', 'INR', 'India', 'AAA');

-- ============================================
-- HIGH-YIELD BONDS (8 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('Vodafone Idea Ltd', 'high-yield', 'Vodafone Idea High Yield Bond 13.50% 2028', 'VI-HY-2028', 13.50, 'fixed', 1000, '2028-08-15', 'INR', 'India', 'BB-'),
('Zee Entertainment', 'high-yield', 'Zee High Yield Bond 12.75% 2029', 'ZEE-HY-2029', 12.75, 'fixed', 1000, '2029-03-25', 'INR', 'India', 'BB'),
('Suzlon Energy', 'high-yield', 'Suzlon High Yield Bond 11.50% 2027', 'SUZLON-HY-2027', 11.50, 'fixed', 1000, '2027-12-10', 'INR', 'India', 'B+'),
('Future Retail', 'high-yield', 'Future Retail High Yield Bond 12.00% 2028', 'FUTURE-HY-2028', 12.00, 'fixed', 1000, '2028-06-30', 'INR', 'India', 'B'),
('Reliance Capital', 'high-yield', 'Reliance Capital High Yield 11.25% 2027', 'RCAP-HY-2027', 11.25, 'fixed', 1000, '2027-09-15', 'INR', 'India', 'BB-'),
('Vedanta Resources', 'high-yield', 'Vedanta High Yield Bond 10.75% 2029', 'VEDANTA-HY-2029', 10.75, 'fixed', 1000, '2029-11-20', 'INR', 'India', 'BB'),
('SpiceJet Ltd', 'high-yield', 'SpiceJet High Yield Bond 12.25% 2028', 'SPICEJET-HY-2028', 12.25, 'fixed', 1000, '2028-04-05', 'INR', 'India', 'B+'),
('Jet Airways', 'high-yield', 'Jet Airways High Yield Bond 13.00% 2027', 'JET-HY-2027', 13.00, 'fixed', 1000, '2027-07-20', 'INR', 'India', 'B');

-- ============================================
-- GREEN BONDS (8 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('ReNew Power', 'green', 'ReNew Green Energy Bond 7.50% 2030', 'RENEW-G-2030', 7.50, 'fixed', 1000, '2030-05-15', 'INR', 'India', 'AA-'),
('NTPC Ltd', 'green', 'NTPC Green Energy Bond 7.25% 2032', 'NTPC-G-2032', 7.25, 'fixed', 1000, '2032-09-10', 'INR', 'India', 'AAA'),
('Adani Green Energy', 'green', 'Adani Green Bond 8.25% 2031', 'AGEL-G-2031', 8.25, 'fixed', 1000, '2031-03-20', 'INR', 'India', 'AA'),
('Greenko Group', 'green', 'Greenko Renewable Bond 8.50% 2030', 'GREENKO-G-2030', 8.50, 'fixed', 1000, '2030-12-15', 'INR', 'India', 'AA-'),
('Tata Power Solar', 'green', 'Tata Solar Green Bond 7.75% 2033', 'TATA-SOL-G-2033', 7.75, 'fixed', 1000, '2033-06-30', 'INR', 'India', 'AA+'),
('Azure Power', 'green', 'Azure Power Green Bond 8.00% 2029', 'AZURE-G-2029', 8.00, 'fixed', 1000, '2029-08-25', 'INR', 'India', 'AA-'),
('Hero Future Energies', 'green', 'Hero Green Energy Bond 7.90% 2031', 'HERO-G-2031', 7.90, 'fixed', 1000, '2031-11-10', 'INR', 'India', 'AA'),
('JSW Energy Green', 'green', 'JSW Green Bond 7.65% 2032', 'JSW-G-2032', 7.65, 'fixed', 1000, '2032-02-28', 'INR', 'India', 'AA');

-- ============================================
-- PERPETUAL BONDS (6 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('HDFC Bank', 'perpetual', 'HDFC Bank AT1 Perpetual Bond 9.50%', 'HDFC-AT1-PERP', 9.50, 'fixed', 1000, NULL, 'INR', 'India', 'AA'),
('ICICI Bank', 'perpetual', 'ICICI Bank AT1 Perpetual Bond 9.75%', 'ICICI-AT1-PERP', 9.75, 'fixed', 1000, NULL, 'INR', 'India', 'AA'),
('State Bank of India', 'perpetual', 'SBI AT1 Perpetual Bond 9.25%', 'SBI-AT1-PERP', 9.25, 'fixed', 1000, NULL, 'INR', 'India', 'AA+'),
('Axis Bank', 'perpetual', 'Axis Bank AT1 Perpetual Bond 9.85%', 'AXIS-AT1-PERP', 9.85, 'fixed', 1000, NULL, 'INR', 'India', 'AA'),
('Kotak Mahindra Bank', 'perpetual', 'Kotak AT1 Perpetual Bond 9.60%', 'KOTAK-AT1-PERP', 9.60, 'fixed', 1000, NULL, 'INR', 'India', 'AA'),
('Yes Bank', 'perpetual', 'Yes Bank AT1 Perpetual Bond 10.25%', 'YES-AT1-PERP', 10.25, 'fixed', 1000, NULL, 'INR', 'India', 'AA-');

-- ============================================
-- OTHER BONDS (4 bonds)
-- ============================================
INSERT INTO bond_master (issuer_name, issuer_type, bond_name, bond_series, coupon_rate, coupon_type, face_value, maturity_date, currency, country, rating) VALUES
('LIC of India', 'other', 'LIC Hybrid Perpetual Bond 8.75%', 'LIC-HYB-PERP', 8.75, 'fixed', 1000, NULL, 'INR', 'India', 'AAA'),
('Government of India', 'other', 'GOI SDR Linked Bond 5.00% 2035', 'GOI-SDR-2035', 5.00, 'fixed', 1000, '2035-12-31', 'INR', 'India', 'AAA'),
('NABARD', 'other', 'NABARD Climate Bond 7.40% 2034', 'NABARD-CB-2034', 7.40, 'fixed', 1000, '2034-09-15', 'INR', 'India', 'AAA'),
('IFCI Ltd', 'other', 'IFCI Cumulative Bond 9.00% 2030', 'IFCI-CUM-2030', 9.00, 'fixed', 1000, '2030-07-25', 'INR', 'India', 'AA-');

-- ============================================
-- TOTAL: 116 BONDS ACROSS ALL 15 TYPES
-- ============================================
-- Government: 10 | Treasury: 8 | Municipal: 10 | Corporate: 12 | Agency: 10
-- SGB: 10 | Sovereign: 8 | Convertible: 8 | Zero-Coupon: 8 | Floating-Rate: 8
-- Inflation-Linked: 6 | High-Yield: 8 | Green: 8 | Perpetual: 6 | Other: 4
