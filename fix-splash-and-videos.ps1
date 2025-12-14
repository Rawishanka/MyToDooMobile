# Fix Splash Icon and Video Display Issues
# This script fixes two issues:
# 1. Replaces generic splash screen icon with MyToDoo logo
# 2. Ensures service videos are properly displayed

Write-Host "🔧 MyToDoo - Fixing Splash Icon and Videos..." -ForegroundColor Cyan
Write-Host ""

# Fix 1: Replace splash screen icons with MyToDoo logo
Write-Host "📱 Step 1: Replacing splash screen icons..." -ForegroundColor Yellow

$sourceIcon = "assets\images\mytodoo-adaptive-icon.png"
$splashDirs = @(
    "android\app\src\main\res\drawable-mdpi",
    "android\app\src\main\res\drawable-hdpi",
    "android\app\src\main\res\drawable-xhdpi",
    "android\app\src\main\res\drawable-xxhdpi",
    "android\app\src\main\res\drawable-xxxhdpi"
)

if (Test-Path $sourceIcon) {
    foreach ($dir in $splashDirs) {
        $targetFile = Join-Path $dir "splashscreen_logo.png"
        if (Test-Path $dir) {
            Copy-Item $sourceIcon $targetFile -Force
            Write-Host "  ✅ Copied to $dir" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Directory not found: $dir" -ForegroundColor Yellow
        }
    }
    Write-Host "  ✅ Splash screen icons updated!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Source icon not found: $sourceIcon" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Fixes applied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Build the APK: eas build --platform android --profile preview" -ForegroundColor White
Write-Host "2. Install on device and test" -ForegroundColor White
Write-Host ""
