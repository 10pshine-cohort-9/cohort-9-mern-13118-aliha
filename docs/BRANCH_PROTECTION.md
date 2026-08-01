# Branch Protection Rules

Phase 1 exit criterion: "Repo initialized with branching strategy live."
GitHub branch protection is a repo-settings action, not code, so it can't
ship inside this scaffold — apply it once the repo exists on GitHub,
either through the UI steps below or the `gh` script.

## Rules to apply

### `main`
- Require a pull request before merging (no direct pushes)
- Require at least **1** approving review
- Require status checks to pass before merging: `Backend (Mocha/Chai)`,
  `Frontend (Jest)` (from `.github/workflows/ci.yml`)
- Require branches to be up to date before merging
- Do not allow force pushes; do not allow deletions
- Restrict who can push directly (nobody — PR-only)

### `develop`
- Same as `main`, minus the push restriction if the whole team merges
  feature/bugfix branches into it directly via PR
- Require status checks to pass before merging (same CI jobs)
- Do not allow force pushes; do not allow deletions

### `feature/*` and `bugfix/*`
- No protection needed — these are short-lived, deleted after merge

## Apply via GitHub UI

1. Repo → **Settings → Branches → Add branch ruleset** (or *Add rule* on
   classic branch protection)
2. Branch name pattern: `main`
3. Check: *Require a pull request before merging* → *Require approvals: 1*
4. Check: *Require status checks to pass before merging* → select
   `Backend (Mocha/Chai)` and `Frontend (Jest)`
5. Check: *Require branches to be up to date before merging*
6. Check: *Do not allow bypassing the above settings*
7. Uncheck *Allow force pushes*; uncheck *Allow deletions*
8. Repeat steps 2–7 for `develop`

## Apply via GitHub CLI (`gh`)

Run once, after the repo exists on GitHub and the initial CI run has
executed at least once (GitHub only lists a check as selectable in the
UI/API after it has run once):

```bash
REPO="your-org/notes-app"   # replace with the real owner/repo

for BRANCH in main develop; do
  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    "repos/${REPO}/branches/${BRANCH}/protection" \
    -f required_status_checks.strict=true \
    -f 'required_status_checks.contexts[]=Backend (Mocha/Chai)' \
    -f 'required_status_checks.contexts[]=Frontend (Jest)' \
    -f enforce_admins=true \
    -f required_pull_request_reviews.required_approving_review_count=1 \
    -F restrictions=null \
    -f allow_force_pushes=false \
    -f allow_deletions=false
done
```

## Verifying it's live

```bash
gh api "repos/${REPO}/branches/main/protection" | jq '.required_status_checks, .required_pull_request_reviews'
```
