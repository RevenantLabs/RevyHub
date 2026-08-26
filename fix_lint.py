import os

def fix_lint():
    with open("features/account-data-entries/__tests__/schema.test.ts", "r") as f:
        content = f.read()
    content = content.replace("import { StrKey, Keypair } from \"@stellar/stellar-sdk\";", "import { Keypair } from \"@stellar/stellar-sdk\";")
    with open("features/account-data-entries/__tests__/schema.test.ts", "w") as f:
        f.write(content)

    with open("features/account-data-entries/e2e/account-data-entries.spec.ts", "r") as f:
        content = f.read()
    content = content.replace("import { test, expect } from \"@playwright/test\";", "import { test } from \"@playwright/test\";")
    with open("features/account-data-entries/e2e/account-data-entries.spec.ts", "w") as f:
        f.write(content)

    with open("features/account-data-entries/lib/accountDataEntries.ts", "r") as f:
        content = f.read()
    content = content.replace("} catch (e) {", "} catch {")
    with open("features/account-data-entries/lib/accountDataEntries.ts", "w") as f:
        f.write(content)

    with open("features/account-data-entries/lib/format.ts", "r") as f:
        content = f.read()
    # Find what's on line 17. 
    # Let's just fix the catch block first.
    content = content.replace("} catch (e) {", "} catch {")
    with open("features/account-data-entries/lib/format.ts", "w") as f:
        f.write(content)

fix_lint()
