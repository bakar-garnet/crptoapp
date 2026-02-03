import os
import platform
import requests
from rich import print
from web3 import Web3

print("[bold cyan][py][/bold cyan] starting probe")
print("platform:", platform.platform())
print("env sample:", list(os.environ.keys())[:10])

# File reads (safe)
for p in ["/etc/os-release", "/etc/passwd", "/proc/cpuinfo", "/proc/self/environ"]:
    try:
        with open(p, "rb") as f:
            f.read(200)
        print(f"[green]read[/green] {p}")
    except Exception as e:
        print(f"[yellow]read fail[/yellow] {p}: {e}")

# Network calls
for url in ["https://example.com", "https://api.github.com", "https://pypi.org/pypi/web3/json"]:
    try:
        r = requests.get(url, timeout=6)
        print(f"[green]GET[/green] {url} -> {r.status_code}")
    except Exception as e:
        print(f"[yellow]GET fail[/yellow] {url}: {e}")

# Web3 call (invalid keys are fine; still creates behavior)
rpc = os.getenv("INFURA_URL") or os.getenv("ALCHEMY_URL") or ""
if rpc:
    w3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={"timeout": 6}))
    try:
        bn = w3.eth.block_number
        print("[green]block_number[/green]", bn)
    except Exception as e:
        print("[yellow]web3 failed[/yellow]", e)
else:
    print("[yellow]No RPC URL set[/yellow]")
