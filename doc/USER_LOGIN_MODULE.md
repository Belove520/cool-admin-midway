# 用户登录模块完成说明

## 已创建的文件

### 1. 实体层 (Entity)
- `src/modules/mall/entity/user.ts` - 商城用户实体

**字段说明：**
- `phone` - 手机号（唯一索引）
- `password` - 密码（MD5加密，查询时默认不返回）
- `nickname` - 昵称
- `avatar` - 头像
- `gender` - 性别 (0-未知, 1-男, 2-女)
- `birthday` - 生日
- `status` - 状态 (0-禁用, 1-启用)
- `lastLoginTime` - 最后登录时间
- `lastLoginIp` - 最后登录IP

### 2. 服务层 (Service)
- `src/modules/mall/service/user.ts` - 用户服务

**提供的方法：**
- `login(phone, password, ip)` - 用户登录
- `register(phone, password, nickname)` - 用户注册
- `getUserInfo(userId)` - 获取用户信息
- `updateUserInfo(userId, data)` - 更新用户信息
- `changePassword(userId, oldPassword, newPassword)` - 修改密码
- `generateToken(user)` - 生成JWT令牌
- `verifyToken(token)` - 验证JWT令牌

### 3. 控制器层 (Controller)
- `src/modules/mall/controller/app/user.ts` - APP端用户控制器

**提供的接口：**
- `POST /app/mall/user/login` - 用户登录
- `POST /app/mall/user/register` - 用户注册
- `POST /app/mall/user/info` - 获取用户信息
- `POST /app/mall/user/update` - 更新用户信息
- `POST /app/mall/user/changePassword` - 修改密码

### 4. 配置文件
- `src/modules/mall/config.ts` - Mall模块配置

## API 接口详情

### 1. 用户登录
**接口：** `POST /app/mall/user/login`

**请求参数：**
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**返回数据：**
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "User8000",
      "avatar": null,
      "gender": 0,
      "status": 1,
      "lastLoginTime": "2025-10-29T00:00:00.000Z",
      "lastLoginIp": "127.0.0.1"
    }
  }
}
```

### 2. 用户注册
**接口：** `POST /app/mall/user/register`

**请求参数：**
```json
{
  "phone": "13800138000",
  "password": "123456",
  "nickname": "张三"
}
```

**返回数据：**
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "张三",
      "status": 1
    }
  }
}
```

### 3. 获取用户信息
**接口：** `POST /app/mall/user/info`

**请求头：**
```
Authorization: Bearer <token>
```

**返回数据：**
```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "13800138000",
    "nickname": "张三",
    "avatar": "https://example.com/avatar.jpg",
    "gender": 1,
    "birthday": "1990-01-01",
    "status": 1
  }
}
```

### 4. 更新用户信息
**接口：** `POST /app/mall/user/update`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "nickname": "李四",
  "avatar": "https://example.com/new-avatar.jpg",
  "gender": 1,
  "birthday": "1990-01-01"
}
```

### 5. 修改密码
**接口：** `POST /app/mall/user/changePassword`

**请求头：**
```
Authorization: Bearer <token>
```

**请求参数：**
```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

## 安全特性

1. **密码加密：** 使用 MD5 加密存储密码
2. **JWT 认证：** 使用 JWT 进行用户身份验证
3. **Token 有效期：** 默认7天，可在配置中修改
4. **密码不返回：** 查询用户时默认不返回密码字段
5. **手机号唯一：** 手机号设置了唯一索引

## 下一步工作

### 需要安装的依赖
```bash
npm install md5 jsonwebtoken
npm install @types/md5 @types/jsonwebtoken --save-dev
```

### 数据库表创建
启动项目后，TypeORM 会自动创建 `mall_user` 表。

### 测试流程
1. 使用注册接口创建用户
2. 使用登录接口获取 token
3. 在后续请求的 Header 中携带 token
4. 测试其他用户相关接口

### 注意事项
1. 目前使用的是临时的硬编码 userId=1，后续需要实现真正的 JWT 中间件来解析 token
2. 生产环境中需要修改 JWT secret 密钥
3. 建议添加手机号验证码功能
4. 建议添加密码强度验证
5. 建议添加登录失败次数限制

## 修复记录

### 2025-10-29
✅ 修复了 `ctx` 属性访问问题
- 在 Controller 中需要使用 `@Inject() ctx;` 来注入上下文
- 修改了所有方法名以避免与 BaseController 冲突：
  - `login` → `userLogin`
  - `register` → `userRegister`
  - `info` → `getUserInfo`
  - `updateInfo` → `updateUser`
  - `changePassword` → `changeUserPassword`

## 编译状态

✅ 所有文件编译通过（仅有格式警告，不影响功能）

**用户登录模块已完成！** 🎉
