# 数据库兼容性说明

## PostgreSQL 数据类型映射

### 问题
PostgreSQL 不支持 MySQL 的 `tinyint` 和 `datetime` 类型。

### 解决方案

#### 整数类型
- MySQL `tinyint` → PostgreSQL `smallint` (2字节整数，范围: -32768 到 32767)
- MySQL `int` → PostgreSQL `integer` 或 `int`
- MySQL `bigint` → PostgreSQL `bigint`

#### 日期时间类型
- MySQL `datetime` → PostgreSQL `timestamp` 或 `timestamp without time zone`
- MySQL `timestamp` → PostgreSQL `timestamp with time zone`
- MySQL `date` → PostgreSQL `date` (保持不变)
- MySQL `time` → PostgreSQL `time` (保持不变)

#### 字符串类型
- MySQL `varchar` → PostgreSQL `character varying` 或 `varchar` (保持不变)
- MySQL `text` → PostgreSQL `text` (保持不变)

#### 其他类型
- MySQL `decimal` → PostgreSQL `numeric` 或 `decimal` (保持不变)
- MySQL `json` → PostgreSQL `json` 或 `jsonb` (推荐使用 `jsonb`)

## MallUserEntity 修改记录

### 修改前（MySQL）
```typescript
@Column({ comment: 'gender 0-unknown 1-male 2-female', default: 0, type: 'tinyint' })
gender: number;

@Column({ comment: 'status 0-disabled 1-enabled', default: 1, type: 'tinyint' })
status: number;

@Column({ comment: 'last login time', nullable: true, type: 'datetime' })
lastLoginTime: Date;
```

### 修改后（PostgreSQL）
```typescript
@Column({
  comment: 'gender 0-unknown 1-male 2-female',
  default: 0,
  type: 'smallint',
})
gender: number;

@Column({
  comment: 'status 0-disabled 1-enabled',
  default: 1,
  type: 'smallint',
})
status: number;

@Column({
  comment: 'last login time',
  nullable: true,
  type: 'timestamp',
})
lastLoginTime: Date;
```

## 通用建议

### 1. 使用 TypeORM 抽象类型
为了保持数据库兼容性，建议在可能的情况下不指定具体的数据库类型，让 TypeORM 自动选择：

```typescript
// 推荐 - TypeORM 会根据数据库类型自动选择
@Column({ default: 0 })
gender: number;

// 不推荐 - 硬编码数据库类型
@Column({ default: 0, type: 'tinyint' })
gender: number;
```

### 2. 对于必须指定类型的情况
使用条件类型或在配置中区分：

```typescript
// 方案1: 使用环境变量
const dbType = process.env.DB_TYPE || 'postgres';
const intType = dbType === 'mysql' ? 'tinyint' : 'smallint';

@Column({ default: 0, type: intType })
gender: number;

// 方案2: 让 TypeORM 自动处理
@Column({ default: 0 })
gender: number;
```

### 3. JSON 字段处理
PostgreSQL 中推荐使用 `jsonb` 而不是 `json`：

```typescript
// PostgreSQL 推荐
@Column({ type: 'jsonb', nullable: true })
metadata: any;

// 通用方式
@Column({ type: 'json', nullable: true })
metadata: any;
```

## 时区处理建议 ⭐ 重要

### timestamp vs timestamptz

#### `timestamp` (without time zone)
- ❌ **不推荐用于国际化应用**
- 存储: 原样存储，不包含时区信息
- 问题: 无法区分不同时区的同一时刻
- 例如: 北京 14:00 和纽约 14:00 会被认为是同一时间

#### `timestamptz` (with time zone) - **强烈推荐** ⭐
- ✅ **推荐用于所有时间字段**
- 存储: 自动转换为 UTC 时间存储
- 读取: 根据客户端时区自动转换
- 优势:
  - 正确处理不同时区
  - 自动处理夏令时
  - 支持国际化

### 实际示例

```typescript
// 用户登录时间使用 timestamptz
@Column({
  comment: 'last login time',
  nullable: true,
  type: 'timestamptz',  // ← 使用带时区的时间戳
})
lastLoginTime: Date;
```

**工作流程:**
1. 北京用户（UTC+8）在 2025-10-29 14:00 登录
2. 后端接收: `2025-10-29 14:00:00 +08:00`
3. PostgreSQL 存储: `2025-10-29 06:00:00 +00:00` (转为 UTC)
4. 前端读取时自动转回用户时区

### Node.js/JavaScript 中的处理

```typescript
// 设置用户登录时间
await this.mallUserEntity.update(userId, {
  lastLoginTime: new Date(), // JavaScript Date 对象包含时区信息
});

// 读取时间
const user = await this.mallUserEntity.findOne({ where: { id: userId } });
console.log(user.lastLoginTime); // 自动转换为服务器时区
```

### 前端显示

```typescript
// 前端可以使用 toLocaleString 显示本地时间
const loginTime = new Date(user.lastLoginTime);
const localTime = loginTime.toLocaleString('zh-CN', {
  timeZone: 'Asia/Shanghai'
});
```

## 测试建议

1. **本地开发**: 使用 PostgreSQL 进行开发
2. **数据库迁移**: 使用 TypeORM migrations 而不是 synchronize
3. **类型检查**: 在 CI/CD 中测试多种数据库类型

## 其他模块需要注意的地方

在创建其他实体时，请注意避免使用以下 MySQL 特有类型：
- ❌ `tinyint` → ✅ `smallint` 或不指定类型
- ❌ `datetime` → ✅ `timestamp`
- ❌ `mediumtext` → ✅ `text`
- ❌ `longtext` → ✅ `text`

## 当前项目状态

✅ `MallUserEntity` 已适配 PostgreSQL
- `gender`: `tinyint` → `smallint`
- `status`: `tinyint` → `smallint`
- `lastLoginTime`: `datetime` → `timestamp`

## 下一步

在创建其他实体（商品、订单、购物车等）时，请直接使用 PostgreSQL 兼容的类型。
