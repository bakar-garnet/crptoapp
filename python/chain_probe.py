import os
import json
import requests
from web3 import Web3
from mnemonic import Mnemonic

# Public, rate-limited RPC (benign). If it flakes, script continues.
RPCS = [
    "https://cloudflare-eth.com",
    "https://rpc.ankr.com/eth"
]

def try_rpc(url: str):
    try:
        w3 = Web3(Web3.HTTPProvider(url, request_kwargs={"timeout": 10}))
        if not w3.is_connected():
            return {"rpc": url, "ok": False, "err": "not connected"}
        bn = w3.eth.block_number
        return {"rpc": url, "ok": True, "block_number": bn}
    except Exception as e:
        return {"rpc": url, "ok": False, "err": str(e)}

def main():
    print("python probe starting")

    # benign env read / config prints
    print("cwd:", os.getcwd())
    print("env_has_ci:", "CI" in os.environ)

    # benign mnemonic generation (not saved)
    m = Mnemonic("english")
    phrase = m.generate(strength=128)
    print("generated_mnemonic_words:", len(phrase.split(" ")))

    # network: simple HTTPS request
    r = requests.get("https://pypi.org/simple/", timeout=10)
    print("pypi_status:", r.status_code, "len:", len(r.text))

    # rpc probes
    results = [try_rpc(u) for u in RPCS]
    print("rpc_results:", json.dumps(results, indent=2))

    print("python probe done")

if __name__ == "__main__":
    main()

