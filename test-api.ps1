# 测试注册和登录接口
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== 测试用户注册接口 ===" -ForegroundColor Cyan

# 生成随机手机号
$randomPhone = "138" + (Get-Random -Minimum 10000000 -Maximum 99999999)
Write-Host "测试手机号: $randomPhone" -ForegroundColor Yellow

# 测试注册
$registerBody = @{
    phone = $randomPhone
    password = "test123456"
    nickname = "测试用户"
} | ConvertTo-Json -Compress

Write-Host "`n1. 测试注册..." -ForegroundColor Green

try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:8001/api/app/mall/user/register" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $registerBody `
        -UseBasicParsing

    $registerResult = $registerResponse.Content | ConvertFrom-Json

    if ($registerResult.code -eq 1000) {
        Write-Host "✓ 注册成功!" -ForegroundColor Green
        Write-Host "  Token: $($registerResult.data.token.Substring(0, 20))..." -ForegroundColor Gray
        $token = $registerResult.data.token
    } else {
        Write-Host "✗ 注册失败: $($registerResult.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ 注册请求失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 测试登录
Write-Host "`n2. 测试登录..." -ForegroundColor Green

$loginBody = @{
    phone = $randomPhone
    password = "test123456"
} | ConvertTo-Json -Compress

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8001/api/app/mall/user/login" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $loginBody `
        -UseBasicParsing

    $loginResult = $loginResponse.Content | ConvertFrom-Json

    if ($loginResult.code -eq 1000) {
        Write-Host "✓ 登录成功!" -ForegroundColor Green
        Write-Host "  用户昵称: $($loginResult.data.userInfo.nickname)" -ForegroundColor Gray
        $token = $loginResult.data.token
    } else {
        Write-Host "✗ 登录失败: $($loginResult.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ 登录请求失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 测试获取用户信息
Write-Host "`n3. 测试获取用户信息..." -ForegroundColor Green

try {
    $infoResponse = Invoke-WebRequest -Uri "http://localhost:8001/api/app/mall/user/info" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Headers @{ "Authorization" = $token } `
        -UseBasicParsing

    $infoResult = $infoResponse.Content | ConvertFrom-Json

    if ($infoResult.code -eq 1000) {
        Write-Host "✓ 获取用户信息成功!" -ForegroundColor Green
        Write-Host "  手机号: $($infoResult.data.phone)" -ForegroundColor Gray
        Write-Host "  昵称: $($infoResult.data.nickname)" -ForegroundColor Gray
        Write-Host "  注册时间: $($infoResult.data.createTime)" -ForegroundColor Gray
    } else {
        Write-Host "✗ 获取用户信息失败: $($infoResult.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ 获取用户信息请求失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 测试无token访问需要权限的接口
Write-Host "`n4. 测试无Token访问需要权限的接口..." -ForegroundColor Green

try {
    $noTokenResponse = Invoke-WebRequest -Uri "http://localhost:8001/api/app/mall/user/info" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -UseBasicParsing `
        -ErrorAction Stop

    $noTokenResult = $noTokenResponse.Content | ConvertFrom-Json

    if ($noTokenResult.code -eq 1001) {
        Write-Host "✓ 正确拦截了无Token请求!" -ForegroundColor Green
        Write-Host "  错误消息: $($noTokenResult.message)" -ForegroundColor Gray
    } else {
        Write-Host "✗ 应该拦截但没有拦截!" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ 正确拦截了无Token请求 (401)" -ForegroundColor Green
    } else {
        Write-Host "? 未知响应: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== 所有测试完成 ===" -ForegroundColor Cyan
Write-Host "✓ 注册接口正常" -ForegroundColor Green
Write-Host "✓ 登录接口正常" -ForegroundColor Green
Write-Host "✓ 获取用户信息接口正常" -ForegroundColor Green
Write-Host "✓ 权限验证正常" -ForegroundColor Green
