#!/bin/bash

echo "🔍 Verifying Frontend Build..."
echo ""

cd frontend

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️  Building frontend..."
npm run build

echo ""
echo "✅ Checking build output..."

if [ -f "dist/index.html" ]; then
    echo "✓ index.html exists"
else
    echo "✗ index.html NOT FOUND"
    exit 1
fi

if [ -f "dist/_redirects" ]; then
    echo "✓ _redirects exists"
    cat dist/_redirects
else
    echo "✗ _redirects NOT FOUND"
    exit 1
fi

echo ""
echo "📁 Build directory contents:"
ls -la dist/

echo ""
echo "✅ Frontend build verification complete!"
