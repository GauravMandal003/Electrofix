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
        lines = file.readlines()
        matches = []
        for i, line in enumerate(lines, 1):
            s = line.strip()
            # Match literal $ in JSX text, string literals `$${...}`, `$49`, `$ {`, etc.
            if re.search(r"(\$\d+|\$\s*\{|\"\$\"|'\$'|`\$`|>\s*\$|USD|dollar|cent|rupee|inr)", s, re.IGNORECASE):
                # Filter out pure template strings that are just standard JS template literals without a currency $ prefix
                # e.g., `${var}` is standard JS template string. But `$${var}` has a currency dollar sign in front!
                if re.search(r"\$\{|\$\d+", s):
                    if re.search(r"\$\{\s*(price|total|amount|cost|subtotal|taxes|deliveryFee|discount|fee|charge|sum|grandTotal|item\.price|product\.price|p\.price|o\.total|order\.total|b\.total|b\.amount|item\.product\.price)", s, re.IGNORECASE) or re.search(r"\$\d+", s) or re.search(r"(\bUSD\b|\bdollar|\bcent|\bRupee|\bINR)", s, re.IGNORECASE):
                        matches.append((i, s))
                else:
                    matches.append((i, s))

        if matches:
            print(f"=== {filepath} ({len(matches)} matches) ===")
            for line_no, text in matches:
                print(f"  Line {line_no}: {text}")
