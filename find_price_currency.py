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

for filepath in sorted(files_to_check):
    with open(filepath, "r", encoding="utf-8") as file:
        content = file.read()
        lines = content.split("\n")
        matches = []
        for i, line in enumerate(lines, 1):
            s = line.strip()
            # Match currency usages like $49, $150, $ {price}, ${item.price}, $ {total}, $ {grandTotal}, $ {cost}, '$', "$", `$`
            # or USD, Dollar, US Dollars, etc.
            # Notice in template literals: `$${...}` has `$` before `${`
            if re.search(r"(\$\d+|\$\s*\{|\"\$\"|'\$'|`\$`|>\s*\$\s*<|>\s*\$[0-9]|USD|dollar|US Dollar|Rupee|INR)", s, re.IGNORECASE):
                matches.append((i, s))
            elif "`$" in s or "\"$" in s or "'$" in s or "$`" in s:
                matches.append((i, s))
            elif re.search(r"\$\s*\{.*?(price|total|amount|cost|subtotal|taxes|deliveryFee|discount|fee|charge|sum|grandTotal|item|product|val|num|min|max|raw)", s, re.IGNORECASE):
                # Check if it has a literal $ before the expression
                if re.search(r"\$\s*\$\{", s) or re.search(r"\"\$\"|'\$'|`\$`|>\s*\$", s):
                    matches.append((i, s))

        if matches:
            print(f"=== {filepath} ({len(matches)} matches) ===")
            for line_no, text in matches:
                print(f"  Line {line_no}: {text}")
