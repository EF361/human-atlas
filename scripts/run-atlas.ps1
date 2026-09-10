# Human Atlas Local Runner
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Human Atlas 3D Anatomy Explorer" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

# Refresh PATH from Registry to pick up Node.js
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js not found in PATH. Please install Node.js 22 LTS or restart your terminal." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Vite development server on http://localhost:3016 ..." -ForegroundColor Yellow
Start-Process "http://localhost:3016"
npm.cmd run dev
