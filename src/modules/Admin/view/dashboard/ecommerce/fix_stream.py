import re

filepath = "d:/DATN/AnhEmMotor/AnhEmMotor-Management/src/modules/Admin/view/dashboard/ecommerce/index.vue"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the specific fetchEventSource closing pattern
old_close = """  },
});
});"""

new_close = """  },
}).catch(() => {});
});"""

if old_close in content:
    content = content.replace(old_close, new_close)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: replaced closing pattern")
else:
    print("Pattern not found, trying variant...")
    # try with tabs
    for c in content:
        pass
    # Show what's around line 497
    lines = content.split('\n')
    for i, line in enumerate(lines[494:500], start=495):
        print(f"{i}: [{repr(line)}]")
