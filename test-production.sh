# #!/bin/bash

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
# fi

# if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
#     print_status "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set" 1
#     ENV_CHECK=1
# fi

# if [ $ENV_CHECK -eq 0 ]; then
#     print_status "Environment variables are configured" 0
# else
#     print_warning "Some environment variables are missing"
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
#     echo "Build failed. Check the output above for errors."
#     exit 1
# fi

# # Check if required files exist
# echo "Checking for required files..."

# FILES_TO_CHECK=(
#     "next.config.js"
#     "middleware.ts"
#     "app/not-found.tsx"
#     "app/global-error.tsx"
#     "src/lib/supabase.ts"
#     "src/types/index.ts"
# )

# for file in "${FILES_TO_CHECK[@]}"; do
#     if [ -f "$file" ]; then
#         print_status "$file exists" 0
#     else
#         print_status "$file is missing" 1
#     fi
# done

# # Check bundle size
# echo "Analyzing bundle size..."
# BUNDLE_SIZE=$(du -sh .next | cut -f1)
# print_status "Bundle size: $BUNDLE_SIZE" 0

# # Test if server starts
# echo "Testing production server startup..."
# timeout 10s npm start > /dev/null 2>&1 &
# SERVER_PID=$!
# sleep 3

# if kill -0 $SERVER_PID > /dev/null 2>&1; then
#     print_status "Production server starts successfully" 0
#     kill $SERVER_PID
# else
#     print_status "Production server failed to start" 1
# fi

# # Security check
# echo "Running security checks..."
# if grep -r "console.log" src/ --exclude-dir=node_modules > /dev/null; then
#     print_warning "Found console.log statements in source code"
# else
#     print_status "No console.log statements found" 0
# fi

# # Check for common vulnerabilities
# if grep -r "dangerouslySetInnerHTML" src/ > /dev/null; then
#     print_warning "Found dangerouslySetInnerHTML usage"
# else
#     print_status "No dangerous HTML injection found" 0
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
#     echo "4. Monitor for any issues"
# else
#     echo -e "${RED}⚠️  Please fix the issues above before deploying${NC}"
# fi

# echo ""
# echo "Good luck with your launch! 🎉"
#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
    echo "Loading environment variables from .env.local..."
    export $(cat .env.local | grep -v ^# | xargs)
fi

# Snippetly Production Testing Script
echo "🧪 Testing Snippetly for production readiness..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "Starting comprehensive tests..."

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ $NODE_VERSION -ge 18 ]; then
    print_status "Node.js version ($NODE_VERSION) is compatible" 0
else
    print_status "Node.js version ($NODE_VERSION) is too old. Need 18+" 1
    exit 1
fi

# Check if required environment variables are set
echo "Checking environment variables..."
ENV_CHECK=0

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    print_status "NEXT_PUBLIC_SUPABASE_URL is not set" 1
    ENV_CHECK=1
else
    print_status "NEXT_PUBLIC_SUPABASE_URL is configured" 0
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    print_status "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set" 1
    ENV_CHECK=1
else
    print_status "NEXT_PUBLIC_SUPABASE_ANON_KEY is configured" 0
fi

# Install dependencies
echo "Installing dependencies..."
npm ci > /dev/null 2>&1
print_status "Dependencies installed" $?

# Run type checking
echo "Running TypeScript type check..."
npm run type-check > /dev/null 2>&1
print_status "TypeScript types are valid" $?

# Run linting
echo "Running ESLint..."
npm run lint > /dev/null 2>&1
print_status "Code passes linting" $?

# Build the application
echo "Building for production..."
npm run build > /dev/null 2>&1
BUILD_STATUS=$?
print_status "Production build completed" $BUILD_STATUS

if [ $BUILD_STATUS -ne 0 ]; then
    echo ""
    echo "❌ Build failed. Running build with verbose output:"
    npm run build
    exit 1
fi

# Final report
echo ""
echo "🎯 Production Readiness Summary:"
echo "================================"

if [ $BUILD_STATUS -eq 0 ] && [ $ENV_CHECK -eq 0 ]; then
    echo -e "${GREEN}🚀 Your Snippetly app is READY for production!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy to Vercel: vercel --prod"
    echo "2. Update Supabase settings with production URL"
    echo "3. Test all functionality in production"
else
    echo -e "${RED}⚠️  Please fix the issues above before deploying${NC}"
fi

echo ""
echo "Good luck with your launch! 🎉"