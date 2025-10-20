# 🚀 快速开始指南

本文档帮助您快速搭建和运行多商户商城项目。

## 📋 前置条件

在开始之前,请确保您的开发环境已安装以下软件:

| 软件 | 版本要求 | 下载地址 |
|-----|---------|---------|
| Node.js | 16.x 或更高 | https://nodejs.org/ |
| MySQL | 8.0 或更高 | https://www.mysql.com/ |
| Redis | 6.0 或更高 | https://redis.io/ |
| Git | 最新版本 | https://git-scm.com/ |

## 🎯 快速安装(5分钟上手)

### 步骤1: 克隆项目

```bash
# 克隆项目到本地
git clone <项目地址>
cd cool-admin-midway

# 安装依赖
npm install
```

### 步骤2: 配置数据库

1. 创建数据库:

```sql
CREATE DATABASE `cool_mall` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置数据库连接,编辑 `src/config/config.local.ts`:

```typescript
export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '127.0.0.1',
        port: 3306,
        username: 'root',
        password: 'your_password',
        database: 'cool_mall',
        synchronize: false,
        logging: true,
      },
    },
  },
};
```

### 步骤3: 配置Redis

编辑 `src/config/config.local.ts`:

```typescript
export default {
  redis: {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
    },
  },
};
```

### 步骤4: 启动项目

```bash
# 开发模式启动
npm run dev
```

访问 http://localhost:7001 查看效果!

## 📦 导入示例数据

### 方式1: 使用SQL脚本(推荐)

```bash
# 导入基础数据
mysql -u root -p cool_mall < sql/init_base.sql

# 导入示例数据
mysql -u root -p cool_mall < sql/init_demo.sql
```

### 方式2: 使用接口初始化

访问管理后台,点击"系统设置" -> "初始化数据"

## 🎨 目录结构说明

```
cool-admin-midway/
├── src/                          # 源代码目录
│   ├── modules/                  # 业务模块
│   │   ├── base/                 # 基础模块(用户、权限、菜单)
│   │   ├── merchant/             # 商户模块
│   │   ├── goods/                # 商品模块
│   │   ├── order/                # 订单模块
│   │   ├── points/               # 积分模块
│   │   ├── distribution/         # 分销模块
│   │   └── coupon/               # 优惠券模块
│   ├── config/                   # 配置文件
│   │   ├── config.default.ts    # 默认配置
│   │   ├── config.local.ts      # 本地开发配置
│   │   └── config.prod.ts       # 生产环境配置
│   ├── entities.ts               # 实体注册
│   └── configuration.ts          # 应用配置
├── sql/                          # SQL脚本
│   ├── init_base.sql            # 基础表结构
│   └── init_demo.sql            # 示例数据
├── public/                       # 静态资源
├── test/                         # 测试文件
├── docs/                         # 项目文档
│   ├── POINTS_SYSTEM_GUIDE.md   # 积分系统文档
│   ├── DISTRIBUTION_SYSTEM_GUIDE.md  # 分销系统文档
│   └── ...                       # 其他模块文档
├── package.json                  # 项目依赖
├── tsconfig.json                 # TypeScript配置
└── README.md                     # 项目说明
```

## 🔧 核心模块快速入门

### 1. 创建一个新模块

```bash
# 使用CLI创建模块
npm run cli create:module <模块名>
```

或手动创建:

```
src/modules/your-module/
├── config.ts              # 模块配置
├── controller/            # 控制器目录
│   ├── admin/            # 后台接口
│   └── app/              # 前台接口
├── entity/                # 实体类
├── service/               # 服务类
├── dto/                   # 数据传输对象
└── middleware/            # 中间件
```

### 2. 编写实体类(Entity)

```typescript
// src/modules/your-module/entity/example.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

@Entity('example')
export class ExampleEntity extends BaseEntity {
  @Column({ comment: '名称' })
  name: string;

  @Index()
  @Column({ comment: '状态', default: 1 })
  status: number;
}
```

### 3. 编写服务类(Service)

```typescript
// src/modules/your-module/service/example.ts
import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/service/base';
import { ExampleEntity } from '../entity/example';

@Provide()
export class ExampleService extends BaseService {
  @InjectEntityModel(ExampleEntity)
  exampleEntity: Repository<ExampleEntity>;

  /**
   * 自定义方法
   */
  async customMethod(params: any) {
    // 业务逻辑
    return await this.exampleEntity.find();
  }
}
```

### 4. 编写控制器(Controller)

```typescript
// src/modules/your-module/controller/admin/example.ts
import { Body, Controller, Get, Inject, Post } from '@midwayjs/core';
import { BaseController } from '../../../base/controller/base';
import { ExampleService } from '../../service/example';

@Controller('/admin/example')
export class AdminExampleController extends BaseController {
  @Inject()
  exampleService: ExampleService;

  /**
   * 分页查询
   */
  @Post('/page')
  async page(@Body() body: any) {
    const result = await this.exampleService.page(body);
    return this.ok(result);
  }

  /**
   * 新增
   */
  @Post('/add')
  async add(@Body() body: any) {
    await this.exampleService.add(body);
    return this.ok();
  }
}
```

## 🔐 权限配置

### 1. 添加权限标识

在控制器方法上添加权限装饰器:

```typescript
import { RequirePermission } from '../../base/decorator/permission';

@Controller('/admin/goods')
export class AdminGoodsController extends BaseController {

  @Post('/add')
  @RequirePermission('goods:add')
  async add() {
    // ...
  }

  @Post('/update')
  @RequirePermission('goods:update')
  async update() {
    // ...
  }
}
```

### 2. 配置菜单权限

在管理后台"系统设置" -> "菜单管理"中配置:

```json
{
  "name": "商品管理",
  "router": "/goods",
  "perms": ["goods:list", "goods:add", "goods:update", "goods:delete"]
}
```

## 📝 数据库迁移

### 自动同步(开发环境)

```typescript
// config.local.ts
export default {
  typeorm: {
    dataSource: {
      default: {
        synchronize: true,  // 自动同步表结构
      },
    },
  },
};
```

### 手动迁移(生产环境)

```bash
# 生成迁移文件
npm run migration:generate -- -n CreateUserTable

# 执行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

## 🧪 测试

### 单元测试

```bash
# 运行所有测试
npm run test

# 运行指定测试
npm run test -- --grep "ExampleService"

# 生成覆盖率报告
npm run test:cov
```

### 编写测试

```typescript
// test/service/example.test.ts
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/web';

describe('test/service/example.test.ts', () => {
  let app;

  beforeAll(async () => {
    app = await createApp<Framework>();
  });

  afterAll(async () => {
    await close(app);
  });

  it('should test example service', async () => {
    const exampleService = await app.getApplicationContext()
      .getAsync('exampleService');
    const result = await exampleService.customMethod({});
    expect(result).toBeDefined();
  });
});
```

## 🚀 部署上线

### 构建生产代码

```bash
# 构建
npm run build

# 启动生产服务
npm run start
```

### 使用PM2部署

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart all
```

### Docker部署

```bash
# 构建镜像
docker build -t cool-mall .

# 运行容器
docker run -d \
  --name cool-mall \
  -p 7001:7001 \
  -e NODE_ENV=production \
  cool-mall

# 使用docker-compose
docker-compose up -d
```

## 🔍 常见问题

### 1. 数据库连接失败

**问题**: `ER_NOT_SUPPORTED_AUTH_MODE`

**解决**:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;
```

### 2. Redis连接失败

**检查**:
- Redis服务是否启动
- 端口是否正确
- 密码是否正确

### 3. 端口被占用

**解决**:
```bash
# Windows
netstat -ano | findstr 7001
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i:7001
kill -9 <进程ID>
```

### 4. TypeScript编译错误

**解决**:
```bash
# 清理缓存
rm -rf dist node_modules package-lock.json
npm install
```

## 📚 进阶学习

### 推荐学习路径

1. **基础阶段** (1-2周)
   - 熟悉Midway.js框架
   - 学习TypeORM
   - 理解依赖注入

2. **进阶阶段** (2-4周)
   - 掌握装饰器使用
   - 学习中间件开发
   - 理解切面编程

3. **高级阶段** (1-2个月)
   - 微服务架构
   - 性能优化
   - 分布式事务

### 推荐资源

| 资源类型 | 链接 |
|---------|------|
| 官方文档 | https://midwayjs.org/ |
| 视频教程 | https://space.bilibili.com/xxx |
| 技术博客 | https://blog.xxx.com |
| GitHub示例 | https://github.com/xxx |

## 🛠️ 开发工具配置

### VS Code 推荐插件

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### ESLint配置

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

### Prettier配置

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true
}
```

## 🤝 参与贡献

我们欢迎任何形式的贡献!

### 提交代码

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交Pull Request

### 代码规范

- 遵循TypeScript编码规范
- 提交前运行ESLint检查
- 编写单元测试
- 更新相关文档

## 📞 获取帮助

如果遇到问题,可以通过以下方式获取帮助:

| 方式 | 说明 |
|-----|------|
| 📖 查看文档 | 详细阅读各模块实现指南 |
| 🐛 提交Issue | 在GitHub上提交问题 |
| 💬 技术交流群 | 加入微信/QQ技术交流群 |
| 📧 邮件咨询 | support@example.com |

## ⏭️ 下一步

现在您已经成功启动了项目,建议按以下顺序学习:

1. ✅ 阅读 [项目总览](README_PROJECT_OVERVIEW.md)
2. ✅ 查看 [开发规划](PROJECT_PLAN.md)
3. ✅ 学习 [积分系统实现](POINTS_SYSTEM_GUIDE.md)
4. ✅ 学习 [分销系统实现](DISTRIBUTION_SYSTEM_GUIDE.md)
5. ✅ 学习 [商户系统实现](MERCHANT_SYSTEM_GUIDE.md)
6. ✅ 学习 [商品系统实现](GOODS_SYSTEM_GUIDE.md)
7. ✅ 学习 [订单系统实现](ORDER_SYSTEM_GUIDE.md)
8. ✅ 学习 [优惠券系统实现](COUPON_SYSTEM_GUIDE.md)

## 🎉 开始开发

恭喜!您已经完成了项目的基础搭建。现在可以开始愉快地开发了!

```bash
# 开发模式(热更新)
npm run dev

# 打开浏览器访问
# 前台: http://localhost:7001
# 后台: http://localhost:7001/admin
# API文档: http://localhost:7001/swagger
```

祝您开发愉快! 🚀

---

**文档维护**: 开发团队
**最后更新**: 2024-01-XX
