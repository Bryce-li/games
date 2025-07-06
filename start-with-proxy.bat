@echo off
echo 设置代理环境变量...
set HTTP_PROXY=http://127.0.0.1:7890
set HTTPS_PROXY=http://127.0.0.1:7890
set http_proxy=http://127.0.0.1:7890
set https_proxy=http://127.0.0.1:7890

echo 代理配置完成:
echo HTTP_PROXY=%HTTP_PROXY%
echo HTTPS_PROXY=%HTTPS_PROXY%

echo 启动开发服务器...
npm run dev 