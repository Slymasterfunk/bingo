#!/bin/bash
# Script to fix Next.js memory issues

echo "🛑 Stopping Next.js dev server..."
pkill -f "next dev" || true
pkill -f "next-server" || true

echo "🧹 Cleaning .next directory..."
rm -rf .next

echo "🧹 Removing orphaned CSS file..."
rm -f app/style.css

echo "✅ Cleanup complete! Now run: npm run dev"
