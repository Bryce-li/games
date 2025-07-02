# 用户登录模块配置指南

## 🚀 快速开始

### 1. 数据库配置

首先执行数据库建表语句，将 `DATABASE_SCHEMA.sql` 中的SQL语句在你的Supabase数据库中执行：

```sql
-- 复制 DATABASE_SCHEMA.sql 中的所有SQL语句到 Supabase SQL编辑器中执行
```

### 2. Google OAuth配置

#### 2.1 在Google Cloud Console创建项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API

#### 2.2 创建OAuth 2.0凭据

1. 在Google Cloud Console中，转到 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth 2.0 Client ID"
3. 选择 "Web application"
4. 设置名称
5. 在 "Authorized redirect URIs" 中添加：
   - `http://localhost:3000/api/auth/google/callback` (开发环境)
   - `https://yourdomain.com/api/auth/google/callback` (生产环境)

### 3. 环境变量配置

在项目根目录创建 `.env.local` 文件（如果不存在），添加以下配置：

```env
# Supabase 数据库配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth 配置
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# JWT 密钥（生产环境请使用强密码）
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# 管理员邮箱（替换为你的Google账号邮箱）
ADMIN_EMAIL=your-email@gmail.com
```

### 4. 设置管理员账号

#### 方法1：在数据库中直接设置
登录后，在Supabase数据库中执行：

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@gmail.com';
```

#### 方法2：通过应用设置
首次登录后，系统会自动检查你的邮箱是否匹配环境变量中的 `ADMIN_EMAIL`，如果匹配则自动设置为管理员。

## 🔧 功能说明

### 用户功能
- ✅ Google账号登录
- ✅ 自动用户创建和信息更新
- ✅ 安全的会话管理（30天有效期）
- ✅ 用户头像和菜单
- ✅ 安全注销

### 管理员功能
- ✅ 管理员权限检查
- ✅ 管理员专用菜单项
- ✅ 游戏数据上传功能（已存在）
- ✅ 路由权限保护

### 安全特性
- ✅ JWT token会话管理
- ✅ HttpOnly cookies
- ✅ 路由权限中间件
- ✅ SQL注入防护
- ✅ XSS防护

## 🛠️ 技术架构

### 认证流程
1. 用户点击"Sign in with Google"按钮
2. 重定向到Google OAuth授权页面
3. 用户授权后回调到 `/api/auth/google/callback`
4. 系统获取用户信息，创建或更新用户记录
5. 生成JWT会话token，设置HttpOnly cookie
6. 重定向到首页，显示用户头像菜单

### 数据库表结构

#### users表
- `id`: 用户唯一标识
- `email`: 邮箱地址
- `name`: 用户姓名
- `avatar_url`: 头像URL
- `google_id`: Google用户ID
- `role`: 用户角色 (user/admin)
- `is_active`: 是否激活
- `last_login_at`: 最后登录时间
- `created_at`: 创建时间
- `updated_at`: 更新时间

#### user_sessions表
- `id`: 会话标识
- `user_id`: 关联用户ID
- `session_token`: JWT会话token
- `expires_at`: 过期时间
- `ip_address`: 登录IP
- `user_agent`: 用户代理
- `created_at`: 创建时间

## 🧪 测试步骤

1. **启动开发服务器**：`npm run dev`
2. **访问首页**：应该能看到右上角的"Sign in with Google"按钮
3. **点击登录**：跳转到Google授权页面
4. **完成授权**：返回首页，显示用户头像
5. **测试菜单**：点击头像查看用户菜单
6. **测试管理员功能**：如果是管理员，应该能看到"Data Upload"选项
7. **测试注销**：点击"Sign out"注销

## 🔍 故障排除

### 常见问题

1. **登录按钮点击无反应**
   - 检查Google OAuth配置是否正确
   - 检查环境变量是否配置

2. **登录后显示错误**
   - 检查数据库连接
   - 查看浏览器控制台错误信息

3. **管理员功能不显示**
   - 确认用户角色为'admin'
   - 检查邮箱是否匹配

4. **会话失效**
   - 检查JWT_SECRET配置
   - 查看数据库会话记录

### 调试建议

1. 查看浏览器开发者工具的Network标签
2. 检查Supabase数据库日志
3. 查看Next.js开发服务器控制台输出
4. 验证环境变量是否正确加载

## 📝 后续功能扩展

可以考虑添加的功能：
- 用户个人资料页面
- 游戏收藏功能
- 游戏评分和评论
- 用户活动日志
- 多角色权限管理
- 邮件通知功能 