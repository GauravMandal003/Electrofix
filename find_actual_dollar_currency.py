import os, re

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

def contains_currency(s):
    # Check for $ followed by number or space + number, or $ inside string literals e.g. "$", "$ ", "+$49"
    # Check for `$${` in template strings
    # Check for `>$` or `> $`
    # Check for "USD", "Dollar", "Cents"
    if re.search(r"\$\d+", s): return True
    if re.search(r"\$\s*\{", s) and ("price" in s.lower() or "total" in s.lower() or "cost" in s.lower() or "amount" in s.lower() or "fee" in s.lower() or "subtotal" in s.lower() or "tax" in s.lower() or "discount" in s.lower() or "delivery" in s.lower() or "rev" in s.lower() or "charge" in s.lower() or "p.price" in s.lower() or "item" in s.lower() or "l.expected" in s.lower() or "b.total" in s.lower() or "order" in s.lower()):
        return True
    if re.search(r"[\"'\`]\s*\$\s*[\"'\`]", s): return True
    if re.search(r">\s*\$\s*", s): return True
    if re.search(r"\b(USD|Dollar|Dollars|Cent|Cents|Rupee|Rupees|INR)\b", s, re.IGNORECASE): return True
    return False

for filepath in sorted(files_to_check):
    with open(filepath, "r", encoding="utf-8") as file:
        lines = file.readlines()
        matches = []
        for i, line in enumerate(lines, 1):
            s = line.strip()
            if contains_currency(s):
                matches.append((i, s))
        if matches:
            print(f"\nFILE: {filepath} ({len(matches)} matches)")
            for line_no, text in matches:
                print(f"  {line_no}: {text}")
