# #!/bin/bash

# # Load environment variables from .env.local if it exists
# if [ -f .env.local ]; then
#     echo "Loading environment variables from .env.local..."
#     export $(cat .env.local | grep -v ^# | xargs)
# fi

# # Snippetly Production Testing Script
# echo "🧪 Testing Snippetly for production readiness..."

# # Colors for output
# GREEN='\033[0;32m'
# RED='\033[0;31m'
# YELLOW='\033[1;33m'
# NC='\033[0m' # No Color

# # Function to print colored output
# print_status() {
#     if [ $2 -eq 0 ]; then
#         echo -e "${GREEN}✅ $1${NC}"
#     else
#         echo -e "${RED}❌ $1${NC}"
#     fi
# }

# print_warning() {
#     echo -e "${YELLOW}⚠️  $1${NC}"
# }

# echo "Starting comprehensive tests..."

# # Check Node.js version
# echo "Checking Node.js version..."
# NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
# if [ $NODE_VERSION -ge 18 ]; then
#     print_status "Node.js version ($NODE_VERSION) is compatible" 0
# else
#     print_status "Node.js version ($NODE_VERSION) is too old. Need 18+" 1
#     exit 1
# fi

# # Check if required environment variables are set
# echo "Checking environment variables..."
# ENV_CHECK=0

# if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
#     print_status "NEXT_PUBLIC_SUPABASE_URL is not set" 1
#     ENV_CHECK=1
# else
#     print_status "NEXT_PUBLIC_SUPABASE_URL is configured" 0
# fi

# if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
#     print_status "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set" 1
#     ENV_CHECK=1
# else
#     print_status "NEXT_PUBLIC_SUPABASE_ANON_KEY is configured" 0
# fi

# # Install dependencies
# echo "Installing dependencies..."
# npm ci > /dev/null 2>&1
# print_status "Dependencies installed" $?

# # Run type checking
# echo "Running TypeScript type check..."
# npm run type-check > /dev/null 2>&1
# print_status "TypeScript types are valid" $?

# # Run linting
# echo "Running ESLint..."
# npm run lint > /dev/null 2>&1
# print_status "Code passes linting" $?

# # Build the application
# echo "Building for production..."
# npm run build > /dev/null 2>&1
# BUILD_STATUS=$?
# print_status "Production build completed" $BUILD_STATUS

# if [ $BUILD_STATUS -ne 0 ]; then
#     echo ""
#     echo "❌ Build failed. Running build with verbose output:"
#     npm run build
#     exit 1
# fi

# # Final report
# echo ""
# echo "🎯 Production Readiness Summary:"
# echo "================================"

# if [ $BUILD_STATUS -eq 0 ] && [ $ENV_CHECK -eq 0 ]; then
#     echo -e "${GREEN}🚀 Your Snippetly app is READY for production!${NC}"
#     echo ""
#     echo "Next steps:"
#     echo "1. Deploy to Vercel: vercel --prod"
#     echo "2. Update Supabase settings with production URL"
#     echo "3. Test all functionality in production"
# else
#     echo -e "${RED}⚠️  Please fix the issues above before deploying${NC}"
# fi

# echo ""
# echo "Good luck with your launch! 🎉"
#!/bin/bash

# Quick Production Deploy Script for Snippetly
echo "🚀 Preparing Snippetly for production..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we have required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ Missing Supabase environment variables${NC}"
    echo "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables check passed${NC}"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Type check
echo "🔍 Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Type check failed${NC}"
    exit 1
fi

# Build
echo "🏗️  Building for production..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod --yes

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Don't forget to:"
echo "1. Update Supabase auth settings with your production URL"
echo "2. Configure Resend SMTP in Supabase"
echo "3. Test authentication flows in production"