# Fix all import paths to use @/src/ prefix
# Run from project root

$files = Get-ChildItem -Recurse -Include "*.ts","*.tsx" | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch '\.expo' }

$replacements = @{
    # API imports
    "from '@/api/" = "from '@/src/api/"
    'from "@/api/' = 'from "@/src/api/'
    
    # Hooks imports
    "from '@/hooks/" = "from '@/src/shared/hooks/"
    'from "@/hooks/' = 'from "@/src/shared/hooks/'
    
    # Store imports
    "from '@/store/" = "from '@/src/store/"
    'from "@/store/' = 'from "@/src/store/'
    
    # Utils imports
    "from '@/utils/" = "from '@/src/shared/utils/"
    'from "@/utils/' = 'from "@/src/shared/utils/'
}

$totalFixed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName | Out-String
    $originalContent = $content
    
    foreach ($find in $replacements.Keys) {
        $replace = $replacements[$find]
        $content = $content -replace [regex]::Escape($find), $replace
    }
    
    if ($content -ne $originalContent) {
        $content | Set-Content $file.FullName -NoNewline
        $totalFixed++
        Write-Host "✅ Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Fixed $totalFixed files!" -ForegroundColor Cyan
