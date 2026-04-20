# MyToDoo Mobile - Build Script for Firebase Development Build
# This script helps you build the development APK with React Native Firebase

Write-Host "🔥 MyToDoo Firebase Development Build" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
Write-Host "📦 Checking EAS CLI..." -ForegroundColor Yellow
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue

if (-not $easInstalled) {
    Write-Host "❌ EAS CLI not found. Installing globally..." -ForegroundColor Red
    npm install -g eas-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install EAS CLI. Please install manually: npm install -g eas-cli" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ EAS CLI installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ EAS CLI is already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔑 Checking EAS login status..." -ForegroundColor Yellow
eas whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to EAS. Please login:" -ForegroundColor Red
    eas login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed. Please try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🏗️ Building Development APK..." -ForegroundColor Yellow
Write-Host "This will include React Native Firebase native modules" -ForegroundColor Gray
Write-Host "Build time: ~10-15 minutes" -ForegroundColor Gray
Write-Host ""

# Build development APK
eas build --platform android --profile development

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Download the APK from the link above" -ForegroundColor White
    Write-Host "2. Transfer to your Android device" -ForegroundColor White
    Write-Host "3. Enable 'Install from unknown sources' in Android settings" -ForegroundColor White
    Write-Host "4. Install the APK" -ForegroundColor White
    Write-Host "5. Open the app and check console logs for FCM initialization" -ForegroundColor White
    Write-Host ""
    Write-Host "🔔 Expected Console Output:" -ForegroundColor Cyan
    Write-Host "  📱 ========== PUSH NOTIFICATIONS STATUS ==========" -ForegroundColor Gray
    Write-Host "  ✅ Initialized: true" -ForegroundColor Gray
    Write-Host "  📝 Token Registered: true" -ForegroundColor Gray
    Write-Host "  🔔 Permission Granted: true" -ForegroundColor Gray
    Write-Host "  ❌ Error: None" -ForegroundColor Gray
    Write-Host "  ==================================================" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Not logged in to EAS (run: eas login)" -ForegroundColor White
    Write-Host "- Invalid project configuration" -ForegroundColor White
    Write-Host "- Network connectivity issues" -ForegroundColor White
    Write-Host ""
    exit 1
}
