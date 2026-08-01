# SonarQube Setup

Sprint 2 deliverable per the STS. Two separate things to set up: **local**
(scan your own machine on demand) and **CI** (automatic scan on every PR —
optional, needs one secret).

## Local

**1. Run the server** (Community Build — the free self-hosted edition):

```bash
docker run -d --name sonarqube -p 9000:9000 -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true sonarqube:community
```

That env var skips a Linux-kernel check (`vm.max_map_count`) Elasticsearch
normally demands — fine for local/dev use, not something to do in
production. Wait ~1 minute, then open `http://localhost:9000`. Log in with
`admin`/`admin` — it immediately forces a password change.

**2. Generate a token**: avatar (top-right) → **My Account → Security →
Generate Token** → copy it immediately, it's shown once.

**3. Generate coverage, then scan:**

```bash
cd backend && npm run test:coverage && cd ..
cd frontend && npm run test:coverage && cd ..

docker run --rm \
  -e SONAR_HOST_URL="http://host.docker.internal:9000" \
  -e SONAR_TOKEN="<paste-your-token>" \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli
```

(`host.docker.internal` — not `localhost` — because the scanner is a
*separate* container from the SonarQube server; that hostname is what
Docker Desktop provides for one container to reach another via the host.)

**4. View results** at `http://localhost:9000` → your project → bugs,
code smells, vulnerabilities, and real coverage % (reading
`backend/coverage/lcov.info` and `frontend/coverage/lcov.info`, per
`sonar-project.properties` at the repo root).

## CI (optional — runs SonarQube automatically on every PR)

The `sonarqube` job in `.github/workflows/ci.yml` is written and ready,
just commented out until a token exists. Two ways to get one:

### Option A — SonarCloud (easiest; free for public repos)

1. [sonarcloud.io](https://sonarcloud.io) → sign in with GitHub → **+ →
   Analyze new project** → pick this repo
2. It'll walk you through creating an organization and project key —
   update `sonar.projectKey` in `sonar-project.properties` to match
   whatever it assigns if different from `notes-taking-app`
3. **My Account → Security → Generate Token**
4. On GitHub: repo → **Settings → Secrets and variables → Actions → New
   repository secret** → name it `SONAR_TOKEN`, paste the value
5. Uncomment the `sonarqube` job in `.github/workflows/ci.yml`
   (leave `SONAR_HOST_URL` unset — SonarCloud is the scanner's default)

### Option B — point CI at your own self-hosted server

Same steps, except also add a `SONAR_HOST_URL` repo secret pointing at
your server's public URL (a `localhost` server on your own machine can't
be reached by a GitHub-hosted CI runner — this only works if your server
is actually reachable from the internet).

## Why coverage % might look low right now

Run `npm run test:coverage` in `backend/` and you'll see the
`data-access/` layer (the actual SQL) sitting well under 100%. That's
expected, not a gap to panic about: our tests stub the repository
functions with `sinon` rather than hitting a real database, so the SQL
*inside* those functions never executes during `npm test` — we're testing
that services/controllers call the repository correctly, not that the SQL
itself is correct. Real coverage of the SQL would need integration tests
against an actual PostgreSQL instance (e.g. the Dockerized one), which is
a reasonable Sprint 3/4 addition if SonarQube's quality gate ends up
requiring a higher threshold than this unit-test suite alone can hit.
