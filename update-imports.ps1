# PowerShell script to update all import statements to new structure

$patterns = @(
    @{ Old = "from '@/components/"; New = "from '@/src/shared/components/" },
    @{ Old = 'from "@/components/'; New = 'from "@/src/shared/components/' },
    @{ Old = "from '@/hooks/"; New = "from '@/src/shared/hooks/" },
    @{ Old = 'from "@/hooks/'; New = 'from "@/src/shared/hooks/' },
    @{ Old = "from '@/utils/"; New = "from '@/src/shared/utils/" },
    @{ Old = 'from "@/utils/'; New = 'from "@/src/shared/utils/' },
    @{ Old = "from '@/store/"; New = "from '@/src/store/" },
    @{ Old = 'from "@/store/'; New = 'from "@/src/store/' },
    @{ Old = "from '@/api/"; New = "from '@/src/api/" },
    @{ Old = 'from "@/api/'; New = 'from "@/src/api/' },
    @{ Old = "from '@/constants/"; New = "from '@/src/config/" },
    @{ Old = 'from "@/constants/'; New = 'from "@/src/config/' },
    @{ Old = "from '@/context/"; New = "from '@/src/shared/" },
    @{ Old = 'from "@/context/'; New = 'from "@/src/shared/' }
)

$fileCount = 0
$updateCount = 0

# Get all TypeScript, JavaScript, and JSX files
$files = Get-ChildItem -Path . -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -File | 
    Where-Object { 
        $_.FullName -notmatch "node_modules" -and 
        $_.FullName -notmatch "\\.expo" -and
        $_.FullName -notmatch "\\.git" -and
        $_.FullName -notmatch "update-imports.ps1"
    }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileUpdated = $false
    
    foreach ($pattern in $patterns) {
        if ($content -match [regex]::Escape($pattern.Old)) {
            $content = $content -replace [regex]::Escape($pattern.Old), $pattern.New
            $fileUpdated = $true
        }
    }
    
    if ($fileUpdated) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $updateCount++
        Write-Host "Updated: $($file.FullName -replace [regex]::Escape($PWD), '')" -ForegroundColor Green
    }
    
    $fileCount++
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "Files scanned: $fileCount" -ForegroundColor White
Write-Host "Files updated: $updateCount" -ForegroundColor Green
Write-Host "`nImport path updates complete!" -ForegroundColor Green
