# 测试注册接口

Write-Host "测试注册接口..." -ForegroundColor Green

# 生成随机手机号
$randomPhone = "138" + (Get-Random -Minimum 10000000 -Maximum 99999999)

# 测试数据
$registerData = @{
    phone = $randomPhone
    password = "test123456"
    nickname = "测试用户_$(Get-Date -Format 'HHmmss')"
} | ConvertTo-Json

Write-Host "注册数据: $registerData" -ForegroundColor Cyan

try {
    # 发送注册请求
    $response = Invoke-RestMethod -Uri "http://localhost:8001/api/app/mall/user/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerData

    Write-Host "注册成功!" -ForegroundColor Green
    Write-Host "响应数据:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10

    # 保存 token 用于后续测试
    if ($response.data.token) {
        Write-Host "`nToken: $($response.data.token)" -ForegroundColor Magenta

        # 测试获取用户信息
        Write-Host "`n测试获取用户信息..." -ForegroundColor Green
        $infoResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/app/mall/user/info" `
            -Method Post `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = $response.data.token }

        Write-Host "用户信息获取成功!" -ForegroundColor Green
        $infoResponse | ConvertTo-Json -Depth 10
    }
}
catch {
    Write-Host "注册失败!" -ForegroundColor Red
    Write-Host "错误信息: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "详细错误: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
