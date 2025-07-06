# 🌐 代理设置指南

## 🔍 问题分析

你遇到的Google OAuth登录失败是因为：
1. **网络环境**: 你的网络环境使用了代理服务器 (127.0.0.1:7890)
2. **浏览器vs服务器**: 浏览器能通过代理访问Google，但Node.js服务器端不能
3. **环境变量**: Node.js需要通过环境变量来配置代理

## 🚀 解决方案

### 方案1: 使用PowerShell脚本启动 (推荐)

1. **停止当前开发服务器** (按 Ctrl+C)
2. **运行PowerShell脚本**:
   ```powershell
   .\start-with-proxy.ps1
   ```

### 方案2: 使用npm脚本启动

1. **停止当前开发服务器** (按 Ctrl+C)
2. **运行代理版本**:
   ```bash
   npm run dev:proxy
   ```

### 方案3: 手动设置环境变量

1. **停止当前开发服务器** (按 Ctrl+C)
2. **设置环境变量**:
   ```powershell
   $env:HTTP_PROXY = "http://127.0.0.1:7890"
   $env:HTTPS_PROXY = "http://127.0.0.1:7890"
   ```
3. **启动服务器**:
   ```bash
   npm run dev
   ```

### 方案4: 创建.env.local文件

在项目根目录创建 `.env.local` 文件，添加：
```env
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

然后重启开发服务器。

## 🧪 测试步骤

1. **启动服务器** (使用上述任一方案)
2. **访问测试页面**:
   - http://localhost:3000/proxy-test - 代理连接测试
   - http://localhost:3000/network-test - 网络诊断
   - http://localhost:3000/config-check - 配置检查

3. **测试Google登录**:
   - 返回首页 http://localhost:3000
   - 点击 "Sign in with Google"
   - 查看是否能成功登录

## 🔧 故障排除

### 如果仍然失败：

1. **检查代理是否运行**:
   - 确认你的代理软件 (Clash/V2Ray等) 正在运行
   - 确认代理端口是7890

2. **检查代理配置**:
   ```powershell
   echo $env:HTTP_PROXY
   echo $env:HTTPS_PROXY
   ```

3. **尝试不同端口**:
   如果7890不工作，尝试其他常见端口：
   - 1080 (SOCKS5)
   - 8080 (HTTP)
   - 3128 (Squid)

4. **检查防火墙**:
   - 确保防火墙允许Node.js访问网络
   - 确保代理软件允许本地连接

## 📋 常见代理端口

| 端口 | 协议 | 软件 |
|------|------|------|
| 7890 | HTTP/HTTPS | Clash, V2Ray |
| 1080 | SOCKS5 | 通用SOCKS代理 |
| 8080 | HTTP | 通用HTTP代理 |
| 3128 | HTTP | Squid代理 |

## 🎯 验证成功

当代理配置成功时，你应该看到：
- ✅ 开发服务器启动时显示代理环境变量
- ✅ OAuth回调日志显示"环境变量检查"
- ✅ Google登录不再超时
- ✅ 用户能成功登录并看到头像菜单

## 📞 需要帮助？

如果按照以上步骤仍然无法解决：
1. 访问 `/network-test` 页面运行诊断
2. 查看开发服务器控制台的详细错误信息
3. 确认你的代理软件设置和端口配置 