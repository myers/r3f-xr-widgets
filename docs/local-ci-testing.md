# Local CI Testing with Act

Test GitHub Actions workflows locally before pushing to GitHub using [nektos/act](https://github.com/nektos/act).

## Browser Configuration for Docker

The project uses Playwright for browser testing in CI. The `vitest.config.ts` includes special browser launch options required for running Chrome in Docker containers:

```typescript
launchOptions: {
  args: [
    '--disable-dev-shm-usage',  // Use /tmp instead of /dev/shm (critical for Docker)
    '--no-sandbox',              // Disable sandboxing (needed in containers)
    '--disable-setuid-sandbox',  // Disable setuid sandbox
    '--use-gl=swiftshader',      // Use software WebGL rendering
    '--disable-web-security',    // Disable web security (may help with WebGL)
  ]
}
```

These flags are essential for WebGL and XR emulation to work properly in headless Docker environments.

## Installation

**macOS:**

```bash
brew install act
```

**Linux:**

```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**Other platforms:**
See [act installation docs](https://github.com/nektos/act#installation)

## Quick Start

Run the CI workflow locally:

```bash
act
```

This executes the default workflow (`.github/workflows/ci.yml`) using the configuration in `.actrc`.

## Configuration

The `.actrc` file configures act with optimized settings:

- **Docker image**: `catthehacker/ubuntu:act-latest` - full-featured Ubuntu with build tools
- **Docker socket**: Mounted for Docker-in-Docker support (needed for Playwright)
- **Gitignore**: Disabled to ensure all files are copied to container

## Common Commands

```bash
# Run all workflows
act

# Run specific job
act -j test

# Run on specific event
act pull_request

# List available workflows
act -l

# Dry run (show what would execute)
act -n

# Verbose output
act -v
```

## How It Works

Act runs GitHub Actions in Docker containers locally:

1. Reads workflow files from `.github/workflows/`
2. Pulls the Docker image specified in `.actrc`
3. Runs each job in a container
4. Executes steps sequentially (checkout, setup, install, test, build)

**Key differences from GitHub Actions:**

- Uses local Docker instead of GitHub's runners
- Playwright browser installation happens in container
- Cache behavior may differ (act has experimental cache support)

## Troubleshooting

**Docker not found:**

- Ensure Docker Desktop is running
- Check `docker ps` works

**Out of memory errors:**

- Docker Desktop may need more resources in Settings > Resources
- Close other applications

**Playwright installation fails:**

- The Ubuntu image includes system dependencies via `--with-deps` flag
- If issues persist, check Docker has enough disk space

**Tests timeout or hang:**

- Ensure `CI=true` triggers headless mode in `vitest.config.ts`
- Check container has sufficient resources

**Permission errors:**

- Act runs as root in container by default
- Files created may need ownership adjustment: `sudo chown -R $(whoami) .`

## CI Environment Variables

The workflow sets `CI=true` which triggers:

- Headless browser mode in Vitest (via `vitest.config.ts`)
- Frozen lockfile in pnpm install
- Production-like behavior in some tools

## Performance Tips

- First run downloads Docker image (~2GB) and Playwright browsers
- Subsequent runs are faster due to layer caching
- Playwright browsers are cached in `~/.cache/ms-playwright` inside container
- Use `act -j test` to run only the test job and skip others
