# PulsePo!int: Automated Setup & Launch Script
# This script installs all dependencies, ensures MongoDB is running, and starts both backend and frontend.

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "   PulsePo!int: Neural Health Intelligence System   " -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

# 1. Environment Hardening: Force Pure Session
Write-Host "[0/4] Purging existing Node processes (Hard Restart)..." -ForegroundColor Magenta
try {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "      Environment cleared for clean launch." -ForegroundColor Green
} catch {
    Write-Host "      No active Node processes detected." -ForegroundColor Gray
}

# 2. Environment Check
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js not found. Please install Node.js (v18+) to continue." -ForegroundColor Red
    exit
}

# 3. MongoDB Check/Start
Write-Host "[1/5] Checking MongoDB Status..." -ForegroundColor Yellow
$mongoService = Get-Service | Where-Object {$_.Name -like "*MongoDB*"}
if ($mongoService) {
    if ($mongoService.Status -ne 'Running') {
        Write-Host "      Starting MongoDB service..." -ForegroundColor Gray
        try {
            Start-Service $mongoService.Name -ErrorAction Stop
            Write-Host "      MongoDB service started successfully." -ForegroundColor Green
        } catch {
            Write-Host "      [WARNING] Could not start MongoDB service automatically. Ensure it is running on port 27017." -ForegroundColor Yellow
        }
    } else {
        Write-Host "      MongoDB service is already active." -ForegroundColor Green
    }
} else {
    Write-Host "      [INFO] MongoDB service not found. Proceeding assuming database is active on 127.0.0.1:27017." -ForegroundColor Cyan
}

# 4. Backend Setup & Start
Write-Host "[2/5] Initializing Backend..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
if (Test-Path $backendPath) {
    Push-Location $backendPath
    Write-Host "      Installing dependencies..." -ForegroundColor Gray
    npm install --no-audit --no-fund
    Pop-Location
    
    Write-Host "      Launching Backend Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; node server.js" -WindowStyle Normal
} else {
    Write-Host "      [ERROR] Backend directory not found!" -ForegroundColor Red
}

# 5. Frontend Setup & Start
Write-Host "[3/5] Initializing Frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (Test-Path $frontendPath) {
    Push-Location $frontendPath
    Write-Host "      Installing dependencies..." -ForegroundColor Gray
    npm install --no-audit --no-fund
    Pop-Location
    
    Write-Host "      Launching Frontend (Turbopack)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal
} else {
    Write-Host "      [ERROR] Frontend directory not found!" -ForegroundColor Red
}

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "[4/5] DEPLOYMENT COMPLETE" -ForegroundColor Cyan
Write-Host "      Backend: http://localhost:3001" -ForegroundColor Gray
Write-Host "      Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "[5/5] PulsePo!int is now running locally in separate windows." -ForegroundColor Green
