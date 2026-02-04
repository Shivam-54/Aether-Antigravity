
print("Testing imports individually...")
try:
    print("Importing realtime...")
    import realtime
    print("Realtime success.")
except Exception as e:
    print(f"Realtime failed: {e}")

try:
    print("Importing gotrue...")
    import gotrue
    print("Gotrue success.")
except Exception as e:
    print(f"Gotrue failed: {e}")

try:
    print("Importing postgrest...")
    import postgrest
    print("Postgrest success.")
except Exception as e:
    print(f"Postgrest failed: {e}")

try:
    print("Importing soup...")
    import supafunc
    print("Supafunc success.")
except Exception as e:
    print(f"Supafunc failed: {e}")

try:
    print("Importing storage3...")
    import storage3
    print("Storage3 success.")
except Exception as e:
    print(f"Storage3 failed: {e}")
