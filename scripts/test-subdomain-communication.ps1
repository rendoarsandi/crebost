# Crebost - Subdomain Communication Test Script
# This script tests communication between all subdomains

param(
    [switch]$Verbose
)

# Define all subdomains
$subdomains = @{
    "landing" = "https://landing.crebost.com"
    "auth" = "https://auth.crebost.com"
    "dashboard" = "https://dashboard.crebost.com"
    "admin" = "https://admin.crebost.com"
    "api" = "https://api.crebost.com"
    "webhooks" = "https://webhooks.crebost.com"
}

# Colors for output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Test HTTP connectivity to a URL
function Test-HttpConnectivity {
    param(
        [string]$Url,
        [string]$ServiceName
    )
    
    try {
        Write-Status "Testing $ServiceName at $Url..."
        
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Success "$ServiceName is accessible (Status: $($response.StatusCode))"
            return $true
        } else {
            Write-Warning "$ServiceName returned status: $($response.StatusCode)"
            return $false
        }
    }
    catch {
        Write-Error "$ServiceName is not accessible: $($_.Exception.Message)"
        return $false
    }
}

# Test API endpoints
function Test-ApiEndpoints {
    param([string]$BaseUrl)
    
    $endpoints = @(
        "/api/health",
        "/api/auth/session",
        "/api/users",
        "/api/content"
    )
    
    $results = @()
    
    foreach ($endpoint in $endpoints) {
        $fullUrl = "$BaseUrl$endpoint"
        try {
            Write-Status "Testing API endpoint: $endpoint"
            $response = Invoke-WebRequest -Uri $fullUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
            
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 401) {
                Write-Success "API endpoint $endpoint is responding (Status: $($response.StatusCode))"
                $results += $true
            } else {
                Write-Warning "API endpoint $endpoint returned status: $($response.StatusCode)"
                $results += $false
            }
        }
        catch {
            Write-Error "API endpoint $endpoint failed: $($_.Exception.Message)"
            $results += $false
        }
    }
    
    return $results
}

# Test webhook endpoints
function Test-WebhookEndpoints {
    param([string]$BaseUrl)
    
    $endpoints = @(
        "/webhooks/health",
        "/webhooks/midtrans",
        "/webhooks/payment"
    )
    
    $results = @()
    
    foreach ($endpoint in $endpoints) {
        $fullUrl = "$BaseUrl$endpoint"
        try {
            Write-Status "Testing webhook endpoint: $endpoint"
            $response = Invoke-WebRequest -Uri $fullUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
            
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 405) {
                Write-Success "Webhook endpoint $endpoint is responding (Status: $($response.StatusCode))"
                $results += $true
            } else {
                Write-Warning "Webhook endpoint $endpoint returned status: $($response.StatusCode)"
                $results += $false
            }
        }
        catch {
            Write-Error "Webhook endpoint $endpoint failed: $($_.Exception.Message)"
            $results += $false
        }
    }
    
    return $results
}

# Test CORS configuration
function Test-CorsConfiguration {
    param(
        [string]$ApiUrl,
        [string]$Origin
    )
    
    try {
        Write-Status "Testing CORS from $Origin to $ApiUrl"
        
        $headers = @{
            "Origin" = $Origin
            "Access-Control-Request-Method" = "GET"
            "Access-Control-Request-Headers" = "Content-Type"
        }
        
        $response = Invoke-WebRequest -Uri "$ApiUrl/api/health" -Method OPTIONS -Headers $headers -TimeoutSec 5 -ErrorAction Stop
        
        $corsHeaders = $response.Headers
        
        if ($corsHeaders["Access-Control-Allow-Origin"]) {
            Write-Success "CORS is configured for $Origin"
            return $true
        } else {
            Write-Warning "CORS may not be properly configured for $Origin"
            return $false
        }
    }
    catch {
        Write-Error "CORS test failed for $Origin : $($_.Exception.Message)"
        return $false
    }
}

# Test DNS resolution
function Test-DnsResolution {
    param([string]$Domain)
    
    try {
        Write-Status "Testing DNS resolution for $Domain"
        $resolved = Resolve-DnsName -Name $Domain -ErrorAction Stop
        
        if ($resolved) {
            Write-Success "DNS resolution successful for $Domain"
            if ($Verbose) {
                Write-Host "Resolved to: $($resolved.IPAddress -join ', ')" -ForegroundColor Gray
            }
            return $true
        } else {
            Write-Error "DNS resolution failed for $Domain"
            return $false
        }
    }
    catch {
        Write-Error "DNS resolution error for $Domain : $($_.Exception.Message)"
        return $false
    }
}

# Main test function
function Start-CommunicationTest {
    Write-Status "🧪 Starting Crebost subdomain communication tests..."
    Write-Host ""
    
    $testResults = @{}
    
    # Test DNS resolution for all subdomains
    Write-Status "=== DNS Resolution Tests ==="
    foreach ($subdomain in $subdomains.Keys) {
        $domain = $subdomains[$subdomain] -replace "https://", ""
        $testResults["DNS_$subdomain"] = Test-DnsResolution -Domain $domain
    }
    Write-Host ""
    
    # Test basic connectivity
    Write-Status "=== Basic Connectivity Tests ==="
    foreach ($subdomain in $subdomains.Keys) {
        $testResults["HTTP_$subdomain"] = Test-HttpConnectivity -Url $subdomains[$subdomain] -ServiceName $subdomain
    }
    Write-Host ""
    
    # Test API endpoints
    Write-Status "=== API Endpoint Tests ==="
    $apiResults = Test-ApiEndpoints -BaseUrl $subdomains["api"]
    $testResults["API_endpoints"] = ($apiResults | Where-Object { $_ -eq $true }).Count -gt 0
    Write-Host ""
    
    # Test webhook endpoints
    Write-Status "=== Webhook Endpoint Tests ==="
    $webhookResults = Test-WebhookEndpoints -BaseUrl $subdomains["webhooks"]
    $testResults["Webhook_endpoints"] = ($webhookResults | Where-Object { $_ -eq $true }).Count -gt 0
    Write-Host ""
    
    # Test CORS configuration
    Write-Status "=== CORS Configuration Tests ==="
    $corsTests = @(
        @{ Origin = $subdomains["landing"]; Name = "landing" },
        @{ Origin = $subdomains["dashboard"]; Name = "dashboard" },
        @{ Origin = $subdomains["admin"]; Name = "admin" }
    )
    
    foreach ($corsTest in $corsTests) {
        $testResults["CORS_$($corsTest.Name)"] = Test-CorsConfiguration -ApiUrl $subdomains["api"] -Origin $corsTest.Origin
    }
    Write-Host ""
    
    # Generate test summary
    Write-Status "=== Test Summary ==="
    $totalTests = $testResults.Count
    $passedTests = ($testResults.Values | Where-Object { $_ -eq $true }).Count
    $failedTests = $totalTests - $passedTests
    
    Write-Host "Total Tests: $totalTests" -ForegroundColor White
    Write-Host "Passed: $passedTests" -ForegroundColor Green
    Write-Host "Failed: $failedTests" -ForegroundColor Red
    Write-Host ""
    
    if ($failedTests -eq 0) {
        Write-Success "🎉 All communication tests passed!"
        Write-Status "Your Crebost platform subdomains are properly configured and can communicate with each other."
    } else {
        Write-Warning "⚠️ Some tests failed. Please check the following:"
        
        foreach ($test in $testResults.Keys) {
            if (-not $testResults[$test]) {
                Write-Host "❌ $test" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Status "Common issues and solutions:"
        Write-Host "1. DNS not propagated yet - wait a few minutes and try again"
        Write-Host "2. Cloudflare Pages not deployed - check deployment status"
        Write-Host "3. Workers not deployed - verify worker deployment"
        Write-Host "4. Custom domains not configured - check domain settings"
        Write-Host "5. SSL certificates not ready - wait for SSL provisioning"
    }
    
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "1. If tests failed, wait a few minutes for DNS propagation"
    Write-Host "2. Check Cloudflare dashboard for deployment status"
    Write-Host "3. Verify custom domain configuration"
    Write-Host "4. Test actual functionality in browser"
    Write-Host "5. Monitor logs for any runtime errors"
    
    return $failedTests -eq 0
}

# Run the tests
$success = Start-CommunicationTest

if ($success) {
    exit 0
} else {
    exit 1
}
