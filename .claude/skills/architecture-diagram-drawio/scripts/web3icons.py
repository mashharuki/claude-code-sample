"""
web3icons.py - draw.io image-shape styles for branded Web3 icons.

Source: https://github.com/0xa3k5/web3icons (MIT License, Copyright (c) 2024
0xa3k5). A curated subset of the "branded" SVG set is vendored under
../assets/web3icons/<category>/<name>.svg and embedded here as base64 data
URIs so generated .drawio files stay self-contained (no network dependency
at diagram-open time, no risk of breaking if the upstream repo changes).

See assets/web3icons/ATTRIBUTION.md for the full license text and the list
of vendored files. To add more icons beyond the curated set, pull the SVG
from https://github.com/0xa3k5/web3icons/tree/main/raw-svgs/<category>/branded
into the matching assets/web3icons/<category>/ folder and it becomes usable
here immediately (no code change needed).

Usage restraint (see references/blockchain-ai-icon-guide.md): network/token/
wallet icons are used denotatively ("this is Ethereum", "this is USDC") and
are safe to use in generic pattern templates. Exchange/protocol logos (e.g.
Uniswap, Binance) name a *specific real company* - don't bake those into the
generic pattern templates (dex-amm, cex-architecture etc.), since that would
misleadingly imply the diagram documents that company's actual system. Use
them only when the user explicitly asks for a diagram about that specific
protocol.
"""

from __future__ import annotations

import os
import urllib.parse

_ASSET_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "web3icons")
_cache: dict[tuple[str, str], str] = {}


def _data_uri(category: str, name: str) -> str:
    # mxGraph style strings are flat semicolon-delimited "key=value;" lists,
    # so a literal ";" inside a value (e.g. the ";base64," marker of a normal
    # data: URI) gets misparsed as a style delimiter and the image silently
    # fails to render. Percent-encoding the whole SVG body (no base64 marker,
    # no raw ";") sidesteps that entirely - confirmed working by rendering a
    # sample icon in draw.io before this approach was applied to all templates.
    key = (category, name)
    if key not in _cache:
        path = os.path.join(_ASSET_DIR, category, f"{name}.svg")
        with open(path, "r", encoding="utf-8") as f:
            svg = f.read()
        encoded = urllib.parse.quote(svg, safe="")
        _cache[key] = f"data:image/svg+xml,{encoded}"
    return _cache[key]


def _icon_style(category: str, name: str) -> str:
    uri = _data_uri(category, name)
    return (
        "shape=image;html=1;verticalAlign=top;verticalLabelPosition=bottom;"
        f"labelBackgroundColor=default;imageAspect=0;aspect=fixed;fontSize=11;image={uri};"
    )


def network(name: str) -> str:
    """Chain/network logo, e.g. network('ethereum'), network('base')."""
    return _icon_style("networks", name)


def token(ticker: str) -> str:
    """Token logo by ticker, e.g. token('USDC'), token('ETH')."""
    return _icon_style("tokens", ticker)


def wallet(name: str) -> str:
    """Wallet app logo, e.g. wallet('metamask'), wallet('phantom')."""
    return _icon_style("wallets", name)


def exchange(name: str) -> str:
    """Exchange/DEX protocol logo, e.g. exchange('uniswap'). See the usage
    restraint note above before using these in a *generic* pattern template."""
    return _icon_style("exchanges", name)


AVAILABLE = {
    "networks": [
        "ethereum", "bitcoin", "base", "polygon", "arbitrum-one", "optimism",
        "avalanche", "solana", "binance-smart-chain", "cosmos", "polkadot", "sui",
    ],
    "tokens": [
        "ETH", "BTC", "USDC", "USDT", "DAI", "WBTC", "MATIC", "SOL", "BNB",
        "ARB", "OP", "AVAX", "LINK", "UNI", "AAVE",
    ],
    "wallets": [
        "metamask", "coinbase", "wallet-connect", "ledger", "trezor",
        "rainbow", "phantom", "trust",
    ],
    "exchanges": [
        "uniswap", "sushiswap", "binance", "coinbase", "okx", "kraken",
        "bybit", "1inch", "balancer", "bancor",
    ],
}
