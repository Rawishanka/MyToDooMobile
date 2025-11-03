# PowerShell script to update all imports to new src/ structure

Write-Host "Updating imports in src/ folder..."

# Get all TypeScript/TSX files in src/
$files = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Recurse -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $updated = $false
    
    # Update @/api/ -> @/src/api/
    if ($content -match '@/api/') {
        $content = $content -replace '@/api/', '@/src/api/'
        $updated = $true
    }
    
    # Update @/store/ -> @/src/store/
    if ($content -match '@/store/') {
        $content = $content -replace '@/store/', '@/src/store/'
        $updated = $true
    }
    
    # Update @/components/ -> @/src/shared/components/
    if ($content -match '@/components/') {
        $content = $content -replace '@/components/', '@/src/shared/components/'
        $updated = $true
    }
    
    # Update @/hooks/ -> @/src/shared/hooks/
    if ($content -match '@/hooks/') {
        $content = $content -replace '@/hooks/', '@/src/shared/hooks/'
        $updated = $true
    }
    
    # Update @/utils/ -> @/src/shared/utils/
    if ($content -match '@/utils/') {
        $content = $content -replace '@/utils/', '@/src/shared/utils/'
        $updated = $true
    }
    
    # Update @/constants/Colors -> @/src/config/Colors
    if ($content -match '@/constants/Colors') {
        $content = $content -replace '@/constants/Colors', '@/src/config/Colors'
        $updated = $true
    }
    
    # Update @/context/AuthProvider -> @/src/shared/AuthProvider
    if ($content -match '@/context/AuthProvider') {
        $content = $content -replace '@/context/AuthProvider', '@/src/shared/AuthProvider'
        $updated = $true
    }
    
    if ($updated) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nUpdating imports in app/ folder..."

# Get all TypeScript/TSX files in app/
$appFiles = Get-ChildItem -Path "app" -Include "*.ts","*.tsx" -Recurse -File

foreach ($file in $appFiles) {
    # Skip .old.tsx files
    if ($file.Name -match "\.old\.tsx$") {
        continue
    }
    
    $content = Get-Content $file.FullName -Raw
    $updated = $false
    
    # Update @/api/ -> @/src/api/
    if ($content -match '@/api/') {
        $content = $content -replace '@/api/', '@/src/api/'
        $updated = $true
    }
    
    # Update @/store/ -> @/src/store/
    if ($content -match '@/store/') {
        $content = $content -replace '@/store/', '@/src/store/'
        $updated = $true
    }
    
    # Update @/components/ -> @/src/shared/components/
    if ($content -match '@/components/') {
        $content = $content -replace '@/components/', '@/src/shared/components/'
        $updated = $true
    }
    
    # Update @/hooks/ -> @/src/shared/hooks/
    if ($content -match '@/hooks/') {
        $content = $content -replace '@/hooks/', '@/src/shared/hooks/'
        $updated = $true
    }
    
    # Update @/utils/ -> @/src/shared/utils/
    if ($content -match '@/utils/') {
        $content = $content -replace '@/utils/', '@/src/shared/utils/'
        $updated = $true
    }
    
    # Update @/constants/Colors -> @/src/config/Colors
    if ($content -match '@/constants/Colors') {
        $content = $content -replace '@/constants/Colors', '@/src/config/Colors'
        $updated = $true
    }
    
    # Update @/context/AuthProvider -> @/src/shared/AuthProvider
    if ($content -match '@/context/AuthProvider') {
        $content = $content -replace '@/context/AuthProvider', '@/src/shared/AuthProvider'
        $updated = $true
    }
    
    if ($updated) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nImport update complete!"
