# Test AI Profanity Detection
# Usage: .\test_ai.ps1

$baseUrl = "http://192.168.2.4:5000"
# $baseUrl = "http://127.0.0.1:5000"  # Use this for localhost

# Test texts
$cleanText = "Xin chào, tôi rất vui được ở đây!"
$offensiveText = "Thằng ngu này không biết gì cả"

Write-Host "🔍 Testing AI Profanity Detection Service" -ForegroundColor Green
Write-Host "Server: $baseUrl" -ForegroundColor Blue

# Test 1: Health Check
Write-Host "`n1. Health Check:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Status: $($health.status)" -ForegroundColor Green
    Write-Host "✅ Model: $($health.model_type)" -ForegroundColor Green
    Write-Host "✅ Mode: $($health.memory_mode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Clean Text
Write-Host "`n2. Testing Clean Text:" -ForegroundColor Yellow
Write-Host "Text: '$cleanText'" -ForegroundColor Cyan
try {
    $body = @{
        text = $cleanText
    } | ConvertTo-Json -Depth 3
    
    $result = Invoke-RestMethod -Uri "$baseUrl/detect" -Method POST -ContentType "application/json" -Body $body
    
    $status = if ($result.is_profane) { "🔴 PROFANE" } else { "🟢 CLEAN" }
    Write-Host "Result: $status" -ForegroundColor $(if ($result.is_profane) { "Red" } else { "Green" })
    Write-Host "Confidence: $($result.confidence)" -ForegroundColor Blue
    if ($result.toxic_spans -and $result.toxic_spans.Count -gt 0) {
        Write-Host "Toxic spans: $($result.toxic_spans)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Clean text test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Potentially Offensive Text
Write-Host "`n3. Testing Potentially Offensive Text:" -ForegroundColor Yellow
Write-Host "Text: '$offensiveText'" -ForegroundColor Cyan
try {
    $body = @{
        text = $offensiveText
    } | ConvertTo-Json -Depth 3
    
    $result = Invoke-RestMethod -Uri "$baseUrl/detect" -Method POST -ContentType "application/json" -Body $body
    
    $status = if ($result.is_profane) { "🔴 PROFANE" } else { "🟢 CLEAN" }
    Write-Host "Result: $status" -ForegroundColor $(if ($result.is_profane) { "Red" } else { "Green" })
    Write-Host "Confidence: $($result.confidence)" -ForegroundColor Blue
    if ($result.toxic_spans -and $result.toxic_spans.Count -gt 0) {
        Write-Host "Toxic spans: $($result.toxic_spans)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Offensive text test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ AI Testing Complete!" -ForegroundColor Green
