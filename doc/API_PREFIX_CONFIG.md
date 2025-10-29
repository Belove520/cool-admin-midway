# API 全局前缀配置说明

## 配置说明

为了统一 API 路径管理和与前端保持一致,已在后端配置全局 API 前缀 `/api`。

## 配置文件

**文件**: `src/config/config.default.ts`

```typescript
export default {
  koa: {
    port: availablePort(8001),
    globalPrefix: '/api', // 全局 API 前缀
  },
  // ... 其他配置
}
```

## 影响范围

添加全局前缀后,所有 API 路径都会自动添加 `/api` 前缀:

### 原路径 → 新路径

| 模块 | 原路径 | 新路径 |
|------|--------|--------|
| 用户注册 | `/app/mall/user/register` | `/api/app/mall/user/register` |
| 用户登录 | `/app/mall/user/login` | `/api/app/mall/user/login` |
| 获取用户信息 | `/app/mall/user/info` | `/api/app/mall/user/info` |
| 更新用户信息 | `/app/mall/user/update` | `/api/app/mall/user/update` |
| 修改密码 | `/app/mall/user/changePassword` | `/api/app/mall/user/changePassword` |
| 管理后台接口 | `/admin/**/*` | `/api/admin/**/*` |

## API 使用示例

### 1. 用户注册

```bash
POST http://localhost:8001/api/app/mall/user/register
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "123456",
  "nickname": "测试用户"
}
```

### 2. 用户登录

```bash
POST http://localhost:8001/api/app/mall/user/login
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "123456"
}
```

### 3. 获取用户信息(需要 Token)

```bash
POST http://localhost:8001/api/app/mall/user/info
Content-Type: application/json
Authorization: YOUR_TOKEN_HERE
```

## 前端配置

### 开发环境

前端使用 Vite 代理,配置在 `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8001',
      changeOrigin: true,
      // 不需要 rewrite,因为后端已经有 /api 前缀
    }
  }
}
```

环境变量 `.env.development`:

```bash
VITE_API_BASE_URL=/api
```

前端代码直接使用:

```javascript
// 自动拼接为: /api/app/mall/user/register
axios.post('/app/mall/user/register', data)
```

实际请求路径: `http://localhost:5173/api/app/mall/user/register`
代理后转发到: `http://localhost:8001/api/app/mall/user/register`

### 生产环境

环境变量 `.env.production`:

```bash
# 直接使用后端域名,包含 /api 前缀
VITE_API_BASE_URL=https://your-domain.com/api
```

## Swagger 文档

添加全局前缀后,Swagger 文档地址也会变化:

- **原地址**: `http://localhost:8001/swagger-ui/index.html`
- **新地址**: `http://localhost:8001/api/swagger-ui/index.html`

## 优势

1. **统一管理**: 所有 API 都在 `/api` 路径下,易于管理和识别
2. **反向代理友好**: 便于 Nginx 等反向代理配置
3. **前后端一致**: 前端配置更简洁,无需额外的路径重写
4. **安全隔离**: API 和静态资源路径分离,便于配置不同的安全策略

## 注意事项

### 1. 静态资源不受影响

静态文件路径不会添加 `/api` 前缀:

- ✅ `/upload/xxx.jpg` (上传文件)
- ✅ `/favicon.ico` (图标)
- ✅ `/public/**` (公共资源)

### 2. 中间件配置

用户中间件和商城中间件都已自动适配全局前缀:

```typescript
// 中间件会自动处理前缀
url = url.replace(this.prefix, '').split('?')[0];
// 例如: /api/app/mall/user/login → /app/mall/user/login
```

### 3. 跨域配置

CORS 配置不受全局前缀影响,已在 `config.default.ts` 中配置:

```typescript
cors: {
  origin: '*',
  allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  credentials: true,
}
```

## 测试验证

使用测试脚本验证:

```bash
cd cool-admin-midway
.\test-api.ps1
```

或手动测试:

```powershell
# 注册
$body = '{"phone":"13900000001","password":"123456","nickname":"测试"}';
Invoke-WebRequest -Uri "http://localhost:8001/api/app/mall/user/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing
```

## 相关文档

- [快速启动指南](../QUICK_START_GUIDE.md)
- [注册接口修复报告](./REGISTER_FIX_COMPLETE.md)
- [CORS解决方案](./CORS_SOLUTION.md)
- [中间件修复说明](./MIDDLEWARE_FIX.md)

---

**配置日期**: 2025-10-29
**版本**: v1.0.0
**状态**: ✅ 已生效
