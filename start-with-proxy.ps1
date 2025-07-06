Write-Host "设置代理环境变量..." -ForegroundColor Green
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
$env:http_proxy = "http://127.0.0.1:7890"
$env:https_proxy = "http://127.0.0.1:7890"

Write-Host "代理配置完成:" -ForegroundColor Yellow
Write-Host "HTTP_PROXY: $env:HTTP_PROXY" -ForegroundColor Cyan
Write-Host "HTTPS_PROXY: $env:HTTPS_PROXY" -ForegroundColor Cyan

Write-Host "启动开发服务器..." -ForegroundColor Green
npm run dev 