#!/bin/bash
# Quick database setup script for PsicoEval

echo "🔍 Checking DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set!"
  echo ""
  echo "Please run:"
  echo "  export DATABASE_URL='your-supabase-connection-string'"
  echo ""
  echo "Get it from: Supabase Dashboard → Settings → Database → Connection string (URI)"
  exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

echo "📊 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🏗️  Creating database tables..."
npx prisma db push --accept-data-loss

echo ""
echo "🌱 Seeding test data..."
npx prisma db seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🧪 Test credentials:"
echo "  Email: test@psychoeval.com"
echo "  Password: Test1234!"
echo ""
echo "🔗 Try logging in at: https://psychoeval.vercel.app/login"
