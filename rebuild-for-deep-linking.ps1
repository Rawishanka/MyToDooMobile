# Rebuild the app after deep linking configuration changes
Write-Host "🔨 Rebuilding MyToDoo Mobile App for Deep Linking..." -ForegroundColor Cyan
Write-Host ""

# Stop any running metro bundler
Write-Host "📦 Stopping Metro Bundler..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Clear cache
Write-Host "🧹 Clearing cache..." -ForegroundColor Yellow
npm start -- --clear

# Prebuild (regenerates native code)
Write-Host "⚙️  Prebuilding native projects..." -ForegroundColor Yellow
npx expo prebuild --clean

Write-Host ""
Write-Host "✅ Rebuild complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run one of these commands:" -ForegroundColor Cyan
Write-Host "  For Android: npx expo run:android" -ForegroundColor White
Write-Host "  For iOS: npx expo run:ios" -ForegroundColor White
Write-Host ""
Write-Host "After the app launches, test the deep link:" -ForegroundColor Cyan
Write-Host "  adb shell am start -W -a android.intent.action.VIEW -d 'mytodoomobile://reset-password?token=test123&email=test@example.com' com.nowanya.mytodoomobile" -ForegroundColor White
