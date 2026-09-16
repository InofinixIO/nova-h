#!/bin/bash
set -e

echo "🚀 Starting automated deployment pipeline..."
echo "1. Checking dependencies..."
npm install

echo "2. Running quality validation (lint & typecheck)..."
npm run lint

echo "3. Building production assets..."
npm run build

echo "✅ Production build compiled successfully into dist/"
echo "4. Ready for version control release or automated publishing."
