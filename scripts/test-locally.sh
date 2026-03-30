#!/bin/bash
# Local testing script - Run before deploying

set -e

echo "🧪 PsicoEvalúa - Pre-Deploy Testing"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found"
  echo "   Copy .env.local.example to .env.local and configure it"
  exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
  echo "❌ DATABASE_URL not configured in .env.local"
  exit 1
fi

echo "✅ Environment configured"
echo ""

# Build check
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Build successful"
echo ""

# Type check
echo "🔍 Type checking..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
  echo "❌ Type check failed"
  exit 1
fi

echo "✅ Type check passed"
echo ""

echo "🎉 All checks passed!"
echo ""
echo "Next steps:"
echo "1. Test locally: npm run dev"
echo "2. Test critical paths:"
echo "   - Login as professional"
echo "   - Create patient"
echo "   - Send assessment"
echo "   - Complete assessment"
echo "   - View results"
echo "3. If everything works, deploy: git push origin master"
