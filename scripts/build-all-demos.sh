#!/bin/bash
set -e

echo "Building library..."
pnpm build

echo "Creating pages directory structure..."
mkdir -p _pages
cp demos/index.html _pages/

echo "Discovering demos..."
DEMOS=$(find demos -name "package.json" -not -path "*/node_modules/*" | xargs dirname | xargs -n1 basename)

for demo in $DEMOS; do
  echo ""
  echo "================================"
  echo "Building demo: $demo"
  echo "================================"

  echo "Installing dependencies for $demo..."
  cd demos/$demo
  pnpm install --frozen-lockfile

  echo "Building $demo..."
  pnpm build

  echo "Copying $demo to _pages..."
  cd ../..
  mkdir -p _pages/$demo
  cp -r demos/$demo/dist/* _pages/$demo/
done

echo ""
echo "Building VitePress documentation..."
pnpm docs:build

echo "Copying documentation to _pages..."
cp -r docs/.vitepress/dist/* _pages/

echo ""
echo "================================"
echo "Build complete!"
echo "================================"
echo "Built demos:"
for demo in $DEMOS; do
  echo "  - $demo"
done
