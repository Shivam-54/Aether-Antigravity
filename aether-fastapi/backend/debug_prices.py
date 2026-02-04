
import yfinance as yf
import json

def test_symbol(symbol):
    print(f"\nTesting symbol: {symbol}")
    print("-" * 50)
    
    try:
        ticker = yf.Ticker(symbol)
        
        # Test 1: fast_info
        print("\nChecking fast_info:")
        try:
            # properly access fast_info based on version
            if hasattr(ticker, 'fast_info'):
                print(f"fast_info exists. Keys: {list(ticker.fast_info.keys())}")
                print(f"last_price: {ticker.fast_info.get('last_price')}")
                print(f"lastPrice: {ticker.fast_info.get('lastPrice')}")
            else:
                print("fast_info attribute missing")
        except Exception as e:
            print(f"Error reading fast_info: {e}")

        # Test 2: info
        print("\nChecking info:")
        info = ticker.info
        # Print relevant keys only to avoid spam
        relevant = {k: v for k, v in info.items() if 'price' in k.lower() or 'close' in k.lower()}
        print(json.dumps(relevant, indent=2))
        
        # Test 3: history
        print("\nChecking history (1d):")
        hist = ticker.history(period="1d")
        print(hist)

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    test_symbol("SUZLON.NS")
    test_symbol("HAL.NS")
