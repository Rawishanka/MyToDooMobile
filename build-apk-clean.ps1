# Build APK with Clean Icon Generation
# This script ensures the adaptive icon from app.config.ts is used

Write-Host "🧹 Cleaning old Android icon files..." -ForegroundColor Cyan

# Remove old icon files to force regeneration
$mipmap_path = "android/app/src/main/res"
if (Test-Path $mipmap_path) {
    Get-ChildItem $mipmap_path -Recurse -Filter "ic_launcher*" -ErrorAction SilentlyContinue | Remove-Item -Force
    Write-Host "✅ Old icon files removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Generating new icons from app.config.ts..." -ForegroundColor Cyan

# Temporarily disable Firebase plugins to avoid google-services.json error
$configPath = "app.config.ts"
$configContent = Get-Content $configPath -Raw
$modifiedConfig = $configContent -replace "'@react-native-firebase/app',", "// '@react-native-firebase/app'," `
                                    -replace "'@react-native-firebase/messaging',", "// '@react-native-firebase/messaging',"

Set-Content $configPath $modifiedConfig

# Generate icons with prebuild
npx expo prebuild --platform android --no-install

# Restore Firebase plugins
$restoredConfig = $modifiedConfig -replace "// '@react-native-firebase/app',", "'@react-native-firebase/app'," `
                                   -replace "// '@react-native-firebase/messaging',", "'@react-native-firebase/messaging',"
Set-Content $configPath $restoredConfig

Write-Host "✅ Icons generated successfully" -ForegroundColor Green

Write-Host ""
Write-Host "🔨 Building APK with EAS..." -ForegroundColor Cyan
Write-Host "📱 Using newly generated adaptive icons" -ForegroundColor Yellow
Write-Host ""

# Build with EAS
eas build --platform android --profile preview --clear-cache

Write-Host ""
Write-Host "✅ Build complete! The new APK will use the adaptive icon" -ForegroundColor Green
