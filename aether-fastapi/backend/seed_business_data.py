"""
FINAL accurate seeder — real expense figures from proprietor data.
Deletes all existing transactions for Looms + Embroidery, then re-seeds.
Also updates the Business record financials (valuation, revenue, profit).

Business IDs:
  Looms       : 265ca9a5-f452-4eac-9e4e-a0221480a320
  Embroidery  : 0c05a096-b4d3-4d6c-a147-50ca0ddb1441

━━━━━━ LOOMS (Jal Bhoomi Industrial Area) ━━━━━━━
Rent            ₹88,000   fixed
Electricity     ₹8,92,000  scales with production
Water (borwell) ₹15,000   fixed (after one-time setup)
Labour          ₹3,30,000  min 60% staff even at low scale
Maintenance     ₹1,30,000  scales with machine hours
Transport       ₹60,000    scales
Yarn / buffer   ₹25,000    scales
─────────────────────────────
Total           ~₹15.4 L/month at full scale
Revenue target  ₹30 L/month (steady state)
Profit          ~₹14.6 L/month

━━━━━━ EMBROIDERY (Katargam GIDC) ━━━━━━━
Rent            ₹60,000   fixed
Electricity     ₹1,00,000  scales
Water (cooling) ₹5,000    fixed
Labour          ₹1,60,000  min 60%
Maintenance     ₹65,000    scales
Transport       ₹22,000    scales
Design Software ₹20,000    fixed (monthly SaaS license)
Thread/Beads    ₹20,000    scales
─────────────────────────────
Total           ~₹4.52 L/month at full scale
Revenue target  ₹12 L/month (steady state)
Profit          ~₹7.5 L/month

No loans, no EMI, no insurance entries.
"""

import sys, uuid
from datetime import date
sys.path.insert(0, "/Users/shivampatel/aether-isle/aether-fastapi/backend")

from dateutil.relativedelta import relativedelta
from database import SessionLocal
from models.business import Business, BusinessTransaction

USER_ID      = uuid.UUID("c680e1b9-d9fc-4c29-8d72-898bf93eea79")
LOOMS_ID     = uuid.UUID("265ca9a5-f452-4eac-9e4e-a0221480a320")
EMBR_ID      = uuid.UUID("0c05a096-b4d3-4d6c-a147-50ca0ddb1441")
TODAY        = date(2026, 3, 5)


# ── SCALE HELPER ──────────────────────────────────────────────────────────────
def scale(n, full_month):
    """Returns 0..1 production utilisation for month n."""
    if   n <= 2:           return 0.22
    elif n <= 5:           return 0.45
    elif n <= 10:          return 0.68
    elif n <= full_month:  return 0.85
    else:                  return 1.00

def labour_scale(s):
    """Labour always keeps at least 60% of full headcount."""
    return max(0.60, s)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LOOMS — Jal Bhoomi (Feb 2022 – Mar 2026, 49 months)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def looms_transactions():
    rows, current, m = [], date(2022, 2, 1), 0

    while current <= TODAY.replace(day=1):
        m += 1
        s   = scale(m, full_month=22)
        rev = round(3_000_000 * s)   # max ₹30L

        # ── Income (2 streams) ────────────────────────────────────────────────
        rows += [
            dict(business_id=LOOMS_ID, user_id=USER_ID,
                 date=current.replace(day=10),
                 amount=round(rev * 0.54), type="Income",
                 category="Water Jet Fabric Sales",
                 notes="Tsudakoma ZW8100 — georgette & synthetic fabric, Surat wholesale market"),
            dict(business_id=LOOMS_ID, user_id=USER_ID,
                 date=current.replace(day=18),
                 amount=round(rev * 0.46), type="Income",
                 category="Air Jet Fabric Sales",
                 notes="Toyota JAT810 — polyester & crepe fabric, Mumbai & export markets"),
        ]

        # ── Fixed expenses ────────────────────────────────────────────────────
        rows += [
            dict(business_id=LOOMS_ID, user_id=USER_ID,
                 date=current.replace(day=1), amount=-88_000, type="Expense",
                 category="Factory Rent",
                 notes="Jal Bhoomi Industrial Area shed — monthly rent"),
            dict(business_id=LOOMS_ID, user_id=USER_ID,
                 date=current.replace(day=6), amount=-15_000, type="Expense",
                 category="Water (Borewell)",
                 notes="Monthly borewell water charges — operating cost post-setup"),
        ]

        # ── Variable expenses (scale with production) ─────────────────────────
        rows += [
            dict(business_id=LOOMS_ID, user_id=USER_ID,
                 date=current.replace(day=7),
                 amount=-round(892_000 * s), type="Expense",
                 category="Electricity",
                 notes="DGVCL industrial — air jet ₹6L + water jet ₹3L = ₹8.92L at full capacity"),
            dict(business_id=LOOMS_ID, user_id=USER_ID,
                 date=current.replace(day=4),
                 amount=-round(330_000 * labour_scale(s)), type="Expense",
                 category="Staff Salaries",
                 notes="10–12 loom operators ₹18k · 6 helpers ₹14k · supervisor ₹30k · electrician ₹25k"),
            dict(business_id=LOOMS_ID, user_id=USER_ID,
                 date=current.replace(day=12),
                 amount=-round(130_000 * s), type="Expense",
                 category="Machine Maintenance",
                 notes="Loom spare parts, oil, pump maintenance — Toyota JAT810 & Tsudakoma ZW8100"),
            dict(business_id=LOOMS_ID, user_id=USER_ID,
                 date=current.replace(day=18),
                 amount=-round(60_000 * s), type="Expense",
                 category="Transport",
                 notes="Yarn inward transport + fabric delivery to buyers (Surat / Mumbai)"),
            dict(business_id=LOOMS_ID, user_id=USER_ID,
                 date=current.replace(day=22),
                 amount=-round(25_000 * s), type="Expense",
                 category="Yarn & Raw Material",
                 notes="Monthly yarn buffer stock — polyester / georgette / crepe yarn"),
        ]

        # ── One-time setup costs (month 1) ────────────────────────────────────
        if m == 1:
            rows += [
                dict(business_id=LOOMS_ID, user_id=USER_ID,
                     date=current.replace(day=5), amount=-200_000, type="Expense",
                     category="Borewell Drilling",
                     notes="One-time borewell setup — drilling ₹1.5L + motor ₹50k"),
                dict(business_id=LOOMS_ID, user_id=USER_ID,
                     date=current.replace(day=8), amount=-400_000, type="Expense",
                     category="Water Recycling Setup",
                     notes="One-time GIDC water recycle system — tank, pipeline, filter unit"),
            ]

        # ── Occasional machine repair events ─────────────────────────────────
        if m in (6, 15, 27, 38, 46):
            rows.append(dict(business_id=LOOMS_ID, user_id=USER_ID,
                             date=current.replace(day=17), amount=-80_000, type="Expense",
                             category="Machine Breakdown Repair",
                             notes="Unplanned loom repair — weft sensor / dobby actuator / motor winding"))

        # ── Milestone income ──────────────────────────────────────────────────
        if m == 8:
            rows.append(dict(business_id=LOOMS_ID, user_id=USER_ID,
                             date=current.replace(day=14), amount=1_200_000, type="Income",
                             category="Bulk Order Advance",
                             notes="First large advance — 40,000m polyester fabric, Mumbai buyer"))
        if m == 20:
            rows.append(dict(business_id=LOOMS_ID, user_id=USER_ID,
                             date=current.replace(day=9), amount=2_000_000, type="Income",
                             category="Export Order Advance — UAE",
                             notes="Export advance — 50,000m georgette fabric, Ajman UAE buyer"))
        if m == 36:
            rows.append(dict(business_id=LOOMS_ID, user_id=USER_ID,
                             date=current.replace(day=5), amount=2_500_000, type="Income",
                             category="Premium Bulk Order",
                             notes="60,000m premium crepe & georgette — Surat exporter advance"))

        current += relativedelta(months=1)
    return rows


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EMBROIDERY — Katargam GIDC (Feb 2024 – Mar 2026, 25 months)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def embroidery_transactions():
    rows, current, m = [], date(2024, 2, 1), 0

    while current <= TODAY.replace(day=1):
        m += 1
        s   = scale(m, full_month=12)
        rev = round(1_200_000 * s)   # max ₹12L

        # ── Income (2 streams) ────────────────────────────────────────────────
        rows += [
            dict(business_id=EMBR_ID, user_id=USER_ID,
                 date=current.replace(day=12),
                 amount=round(rev * 0.58), type="Income",
                 category="LÄSSER Schiffli Embroidery Job-Work",
                 notes="LÄSSER Schiffli 21-yd — computerised embroidery contracts, Surat garment exporters"),
            dict(business_id=EMBR_ID, user_id=USER_ID,
                 date=current.replace(day=22),
                 amount=round(rev * 0.42), type="Income",
                 category="Barudan Bead & Sequin Processing",
                 notes="Barudan BEXS-Series — bead/sequin job-work, bridal wear & fashion export"),
        ]

        # ── Fixed expenses ────────────────────────────────────────────────────
        rows += [
            dict(business_id=EMBR_ID, user_id=USER_ID,
                 date=current.replace(day=1), amount=-60_000, type="Expense",
                 category="Factory Rent",
                 notes="Katargam GIDC industrial unit — monthly rent"),
            dict(business_id=EMBR_ID, user_id=USER_ID,
                 date=current.replace(day=6), amount=-5_000, type="Expense",
                 category="Water (Cooling)",
                 notes="Water for machine cooling — minimal usage, GIDC supply"),
            dict(business_id=EMBR_ID, user_id=USER_ID,
                 date=current.replace(day=20), amount=-20_000, type="Expense",
                 category="Design Software License",
                 notes="Embroidery design software — monthly license (Wilcom / Pulse)"),
        ]

        # ── Variable expenses (scale with production) ─────────────────────────
        rows += [
            dict(business_id=EMBR_ID, user_id=USER_ID,
                 date=current.replace(day=7),
                 amount=-round(100_000 * s), type="Expense",
                 category="Electricity",
                 notes="DGVCL industrial — 10 Barudan BEXS + 2 LÄSSER Schiffli machines"),
            dict(business_id=EMBR_ID, user_id=USER_ID,
                 date=current.replace(day=4),
                 amount=-round(160_000 * labour_scale(s)), type="Expense",
                 category="Staff Salaries",
                 notes="6 operators ₹18k · design operator ₹35k · 2 helpers ₹14k"),
            dict(business_id=EMBR_ID, user_id=USER_ID,
                 date=current.replace(day=14),
                 amount=-round(65_000 * s), type="Expense",
                 category="Machine Maintenance",
                 notes="1–2% machine value/month — Barudan BEXS electronics + LÄSSER mechanism"),
            dict(business_id=EMBR_ID, user_id=USER_ID,
                 date=current.replace(day=18),
                 amount=-round(22_000 * s), type="Expense",
                 category="Transport",
                 notes="Fabric movement — between factories and clients (Surat / Mumbai)"),
            dict(business_id=EMBR_ID, user_id=USER_ID,
                 date=current.replace(day=22),
                 amount=-round(20_000 * s), type="Expense",
                 category="Thread, Beads & Consumables",
                 notes="Embroidery thread, glass beads, sequins, needles — Katargam unit"),
        ]

        # ── Machine repair events ─────────────────────────────────────────────
        if m in (4, 12, 20):
            rows.append(dict(business_id=EMBR_ID, user_id=USER_ID,
                             date=current.replace(day=19), amount=-55_000, type="Expense",
                             category="Machine Breakdown Repair",
                             notes="Unplanned repair — needle bar / bead feeder / drive motor issue"))

        # ── Milestone income ──────────────────────────────────────────────────
        if m == 5:
            rows.append(dict(business_id=EMBR_ID, user_id=USER_ID,
                             date=current.replace(day=16), amount=600_000, type="Income",
                             category="Export Job-Work Advance",
                             notes="First export advance — bridal fabric embroidery, UAE fashion order"))
        if m == 14:
            rows.append(dict(business_id=EMBR_ID, user_id=USER_ID,
                             date=current.replace(day=8), amount=800_000, type="Income",
                             category="Premium Bulk Job-Work",
                             notes="Advance — premium Schiffli bridal lehenga collection, Mumbai buyer"))

        current += relativedelta(months=1)
    return rows


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def main():
    db = SessionLocal()
    try:
        # 1. Delete old transactions for both businesses
        print("[1] Deleting old transactions...")
        l_del = db.query(BusinessTransaction).filter(BusinessTransaction.business_id == LOOMS_ID).delete()
        e_del = db.query(BusinessTransaction).filter(BusinessTransaction.business_id == EMBR_ID).delete()
        print(f"    Looms: {l_del} deleted  |  Embroidery: {e_del} deleted")

        # 2. Update Business records with correct financials
        print("\n[2] Updating business financial records...")
        db.query(Business).filter(Business.id == LOOMS_ID).update({
            "valuation":       14_000_000.0,   # ₹14 Crore (8x annual profit)
            "annual_revenue":  36_000_000.0,   # ₹30L × 12
            "annual_profit":   17_520_000.0,   # ₹14.6L × 12
            "monthly_revenue":  3_000_000.0,   # ₹30 Lakhs
            "monthly_profit":   1_460_000.0,   # ₹14.6 Lakhs
            "cash_flow":        1_400_000.0,
        })
        db.query(Business).filter(Business.id == EMBR_ID).update({
            "valuation":       10_000_000.0,   # ₹10 Crore (~11x annual profit)
            "annual_revenue":  14_400_000.0,   # ₹12L × 12
            "annual_profit":    9_000_000.0,   # ₹7.5L × 12
            "monthly_revenue":  1_200_000.0,   # ₹12 Lakhs
            "monthly_profit":     750_000.0,   # ₹7.5 Lakhs
            "cash_flow":          720_000.0,
        })
        print("    ✅ Business records updated")

        # 3. Build & insert fresh transactions
        print("\n[3] Building Looms transactions (Feb 2022 – Mar 2026)...")
        lt = looms_transactions()
        for t in lt: db.add(BusinessTransaction(**t))
        l_inc = sum(t["amount"] for t in lt if t["amount"] > 0)
        l_exp = sum(t["amount"] for t in lt if t["amount"] < 0)
        print(f"    {len(lt)} txns | Income ₹{l_inc/100_000:.1f}L | Exp ₹{abs(l_exp)/100_000:.1f}L | Net ₹{(l_inc+l_exp)/100_000:.1f}L")

        print("\n[4] Building Embroidery transactions (Feb 2024 – Mar 2026)...")
        et = embroidery_transactions()
        for t in et: db.add(BusinessTransaction(**t))
        e_inc = sum(t["amount"] for t in et if t["amount"] > 0)
        e_exp = sum(t["amount"] for t in et if t["amount"] < 0)
        print(f"    {len(et)} txns | Income ₹{e_inc/100_000:.1f}L | Exp ₹{abs(e_exp)/100_000:.1f}L | Net ₹{(e_inc+e_exp)/100_000:.1f}L")

        # 4. Commit
        print("\n[5] Committing to Supabase...")
        db.commit()
        print("    ✅ All done!")

        print(f"""
╔══════════════════════════════════════════════════════════════════╗
║               ACCURATE RE-SEED COMPLETE                        ║
╠══════════════════════════════════════════════════════════════════╣
║  LOOMS (Jal Bhoomi)                                            ║
║    Revenue  ₹30L/month  │  Expenses  ~₹15.4L  │  Profit ~₹14.6L ║
║    Expense breakdown (full scale):                             ║
║      Electricity   ₹8,92,000   Rent        ₹88,000            ║
║      Labour        ₹3,30,000   Water       ₹15,000            ║
║      Maintenance   ₹1,30,000   Transport   ₹60,000            ║
║      Yarn buffer   ₹25,000                                    ║
╠══════════════════════════════════════════════════════════════════╣
║  EMBROIDERY (Katargam GIDC)                                    ║
║    Revenue  ₹12L/month  │  Expenses  ~₹4.52L  │  Profit ~₹7.5L  ║
║    Expense breakdown (full scale):                             ║
║      Electricity   ₹1,00,000   Rent        ₹60,000            ║
║      Labour        ₹1,60,000   Water        ₹5,000            ║
║      Maintenance   ₹65,000     Transport   ₹22,000            ║
║      Software      ₹20,000     Beads/Thread ₹20,000           ║
╚══════════════════════════════════════════════════════════════════╝
""")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}"); raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
