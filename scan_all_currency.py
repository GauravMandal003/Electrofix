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
            # Find $ where it's used as currency symbol, e.g.
            # 1) $49, $150, $0, $15, etc.
            # 2) `$${...}` or `\$${...}` or `>${...}` preceded by $ or followed by $
            # 3) `$ ${...}` or `${...} $`
            # 4) "USD", "Dollar", "US Dollars"
            if re.search(r"(\$\d+|\$\s*\{|\}\s*\$|>\s*\$\s*<|>\s*\$[0-9]|\"\$\"|'\$'|`\$`|\bUSD\b|\bdollar|\bcent)", s, re.IGNORECASE):
                # ignore standard JS template variables like `${var}` unless there is a $ before it or after it or in text
                if "${" in s:
                    # if `$${` or `> $` or `$ {`
                    if re.search(r"(\$\s*\{|\}\s*\$|>\s*\$\s*|\$\s*\d+|\bUSD\b|\bdollar|\bcent)", s, re.IGNORECASE):
                        matches.append((i, s))
                else:
                    matches.append((i, s))
        if matches:
            print(f"\nFILE: {filepath} ({len(matches)} matches)")
            for line_no, text in matches:
                print(f"  {line_no}: {text}")
