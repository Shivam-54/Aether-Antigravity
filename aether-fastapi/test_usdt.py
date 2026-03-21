import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

import asyncio
from backend.routes.ml_lab import compare_models

async def main():
    try:
        print("Testing USDT compare_models...")
        result = await compare_models("USDT")
        print("Success!")
        print(result)
    except Exception as e:
        print("FAILED!")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
