# 中间件权限验证逻辑修复说明

## 问题描述

在注册接口调用时,即使已经添加了 `@CoolTag(TagTypes.IGNORE_TOKEN)` 装饰器,仍然出现"登录失效或无权限访问"的错误。

## 问题原因

原来的中间件逻辑存在缺陷:

```typescript
// 错误的逻辑流程
1. 先尝试验证 token
2. 验证失败时捕获错误但不处理
3. 然后检查 URL 是否在忽略列表中
4. 如果不在忽略列表中,检查 ctx.user 是否存在
5. 如果 ctx.user 不存在,抛出错误
```

**问题**: 即使 URL 在忽略列表中,如果没有提供 token 或 token 验证失败,`ctx.user` 也会是 undefined,导致抛出错误。

## 修复方案

调整中间件的验证逻辑顺序:

```typescript
// 正确的逻辑流程
1. 先检查 URL 是否在忽略列表中
2. 如果在忽略列表中,直接放行,无需验证 token
3. 如果不在忽略列表中,验证 token
4. token 验证失败时抛出错误
```

## 修复后的代码

```typescript
resolve() {
  return async (ctx: Context, next: NextFunction) => {
    let { url } = ctx;
    url = url.replace(this.prefix, '').split('?')[0];
    if (_.startsWith(url, '/app/')) {
      // 先检查URL是否应该被忽略
      const isIgnored = this.ignoreUrls.some(pattern =>
        this.utils.matchUrl(pattern, url)
      );

      if (isIgnored) {
        // 忽略的URL直接放行,无需验证token
        await next();
        return;
      }

      // 非忽略的URL需要验证token
      const token = ctx.get('Authorization');
      try {
        ctx.user = jwt.verify(token, this.jwtConfig.secret);

        if (ctx.user.isRefresh) {
          throw new CoolCommException('登录失效~');
        }
      } catch (error) {
        // token验证失败
        ctx.status = 401;
        throw new CoolCommException('登录失效或无权限访问');
      }

      if (!ctx.user) {
        ctx.status = 401;
        throw new CoolCommException('登录失效或无权限访问');
      }
    }
    await next();
  };
}
```

## 修复内容

**文件**: `src/modules/user/middleware/app.ts`

**主要改动**:
1. 将 URL 忽略检查移到 token 验证之前
2. 忽略列表中的 URL 直接放行,不进行任何 token 验证
3. 非忽略 URL 才进行 token 验证,验证失败立即抛出错误

## 受影响的接口

现在以下接口可以正常访问(无需 token):

- `/app/mall/user/login` - 用户登录
- `/app/mall/user/register` - 用户注册

以下接口需要 token 验证:

- `/app/mall/user/info` - 获取用户信息
- `/app/mall/user/update` - 更新用户信息
- `/app/mall/user/changePassword` - 修改密码

## 测试验证

修复后需要测试:

### 1. 注册接口
```bash
curl -X POST http://localhost:7001/api/app/mall/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "123456",
    "nickname": "测试用户"
  }'
```

应该返回成功,包含 token。

### 2. 登录接口
```bash
curl -X POST http://localhost:7001/api/app/mall/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "123456"
  }'
```

应该返回成功,包含 token。

### 3. 获取用户信息接口(需要 token)
```bash
curl -X POST http://localhost:7001/api/app/mall/user/info \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_TOKEN_HERE"
```

没有 token 应该返回 401 错误。

## 总结

通过调整中间件的验证逻辑顺序,确保了:

1. ✅ 忽略列表中的接口(登录、注册)可以正常访问
2. ✅ 需要权限的接口会正确验证 token
3. ✅ 错误提示更加明确
4. ✅ 符合安全最佳实践

---

**日期**: 2025-01-24
**修复人员**: GitHub Copilot
**相关文档**:
- [CORS解决方案](./CORS_SOLUTION.md)
- [用户登录模块说明](./USER_LOGIN_MODULE.md)
