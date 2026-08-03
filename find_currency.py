import os
import re

files_to_check = []
for root, dirs, files in os.walk("src"):
    for f in files:
        if f.endswith((".jsx", ".js")):
            files_to_check.append(os.path.join(root, f))
for root, dirs, files in os.walk("server"):
    for f in files:
        if f.endswith((".jsx", ".js")):
            files_to_check.append(os.path.join(root, f))
if os.path.exists("server.js"):
    files_to_check.append("server.js")

for filepath in files_to_check:
    with open(filepath, "r", encoding="utf-8") as file:
        lines = file.readlines()
        matches = []
        for i, line in enumerate(lines, 1):
            s = line.strip()
            # Look for price signs like $49, $ 49, ${price}, $ {total}, $ {item.price}, $ {cost}, '$', "$", `$`
            # Or words like USD, Dollar, Rupee, INR
            if re.search(r"(\$\s*\d+|\$\s*\{|\}\s*\$|>\s*\$\s*<|>\s*\$\s*\{|\"\$\"|'\$'|`\$`|\bUSD\b|\bdollar|\bcent|\bRupee|\bINR)", s, re.IGNORECASE):
                matches.append((i, s))
            # Also catch things like "₹", or "USD"
        if matches:
            print(f"\n=== {filepath} ({len(matches)} matches) ===")
            for line_no, text in matches:
                print(f"  Line {line_no}: {text}")
