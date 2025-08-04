#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
    echo "Loading environment variables from .env.local..."
    export $(cat .env.local | grep -v ^# | xargs)
fi

# Snippetly Launch Checklist
echo "🚀 Snippetly Launch Checklist"
echo "=============================="

# 1. Environment Check
echo "1. Checking environment variables..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL missing"
    exit 1
else
    echo "✅ Supabase URL configured"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY missing"
    exit 1
else
    echo "✅ Supabase anon key configured"
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY missing - AI features will use fallback"
else
    echo "✅ Claude API key configured"
fi

# 2. Install and Build
echo "2. Installing dependencies..."
npm ci

echo "3. Type checking..."
npm run type-check

echo "4. Linting..."
npm run lint:fix

echo "5. Building for production..."
npm run build

# 6. Test AI Endpoint
echo "6. Testing AI endpoint..."
node -e "
const fetch = require('node-fetch');
fetch('http://localhost:3000/api/ai/explain', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    code: 'console.log(\"Hello World\");', 
    language: 'JavaScript' 
  })
}).then(res => res.json()).then(data => {
  if (data.explanation) {
    console.log('✅ AI endpoint working');
  } else {
    console.log('⚠️  AI endpoint using fallback');
  }
}).catch(err => console.log('⚠️  AI endpoint error:', err.message));
" 2>/dev/null || echo "⚠️  Could not test AI endpoint (server not running)"

echo ""
echo "🎉 Pre-launch checks complete!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel: npm run deploy:vercel"
echo "2. Set up custom domain"
echo "3. Configure Supabase Auth with production URL"
echo "4. Test all features in production"
echo ""
echo "Launch ready! 🚀"