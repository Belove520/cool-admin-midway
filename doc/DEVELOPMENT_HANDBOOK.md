# 📖 多商户商城项目开发指南

> 从零到一的完整开发手册，适合一年经验的 Node.js 开发者

---

## 📚 目录

1. [开发环境搭建](#1-开发环境搭建)
2. [项目结构说明](#2-项目结构说明)
3. [核心功能开发](#3-核心功能开发)
4. [常见问题解决](#4-常见问题解决)
5. [代码规范](#5-代码规范)
6. [测试指南](#6-测试指南)
7. [部署指南](#7-部署指南)

---

## 1. 开发环境搭建

### 1.1 必备软件安装

#### 安装 Node.js
```bash
# 下载 Node.js 16+ LTS 版本
https://nodejs.org/

# 验证安装
node -v  # 应显示 v16.x.x 或更高
npm -v   # 应显示 8.x.x 或更高
```

#### 安装 MySQL
```bash
# 下载 MySQL 8.0
https://dev.mysql.com/downloads/mysql/

# 启动 MySQL 服务
# Windows: 在服务中启动 MySQL80
# Mac: brew services start mysql

# 验证安装
mysql -u root -p
```

#### 安装 Redis
```bash
# Windows: 下载 Redis for Windows
https://github.com/microsoftarchive/redis/releases

# Mac:
brew install redis
brew services start redis

# 验证安装
redis-cli ping  # 应返回 PONG
```

#### 安装 Git
```bash
# 下载 Git
https://git-scm.com/downloads

# 配置用户信息
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

---

### 1.2 IDE 配置

#### 推荐 VS Code
```bash
# 必装插件
1. ESLint - 代码检查
2. Prettier - 代码格式化
3. TypeScript Vue Plugin (Volar)
4. GitLens - Git 增强
5. REST Client - 接口测试
```

#### VS Code 配置文件
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

### 1.3 项目初始化

```bash
# 1. 克隆项目
git clone https://github.com/cool-team-official/cool-admin-midway.git
cd cool-admin-midway

# 2. 安装依赖
npm install

# 3. 复制配置文件
cp src/config/config.local.example.ts src/config/config.local.ts

# 4. 修改数据库配置
# 编辑 src/config/config.local.ts

# 5. 创建数据库
mysql -u root -p
CREATE DATABASE mall_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 6. 启动项目
npm run dev

# 7. 访问
http://localhost:8001  # 后端 API
http://localhost:8001/swagger  # API 文档
```

---

## 2. 项目结构说明

### 2.1 目录结构

```
cool-admin-midway/
├── src/
│   ├── config/                 # 配置文件
│   │   ├── config.default.ts   # 默认配置
│   │   ├── config.local.ts     # 本地开发配置
│   │   └── config.prod.ts      # 生产环境配置
│   │
│   ├── modules/                # 业务模块
│   │   ├── base/               # 基础模块（用户、权限）
│   │   ├── mall/               # 商城模块（我们要创建的）
│   │   │   ├── config.ts       # 模块配置
│   │   │   ├── entity/         # 数据库实体
│   │   │   │   ├── merchant.ts
│   │   │   │   ├── goods.ts
│   │   │   │   └── order.ts
│   │   │   ├── service/        # 业务逻辑
│   │   │   │   ├── merchant.ts
│   │   │   │   ├── goods.ts
│   │   │   │   └── order.ts
│   │   │   ├── controller/     # 控制器
│   │   │   │   ├── admin/      # 管理端接口
│   │   │   │   └── app/        # 用户端接口
│   │   │   └── middleware/     # 中间件
│   │   │       └── merchant.ts
│   │   └── ...
│   │
│   ├── interface.ts            # TypeScript 接口定义
│   ├── configuration.ts        # 应用配置
│   └── ...
│
├── test/                       # 测试文件
├── public/                     # 静态资源
├── bootstrap.js                # 启动文件
├── package.json                # 项目依赖
└── tsconfig.json               # TypeScript 配置
```

---

### 2.2 模块创建流程

#### Step 1: 创建模块目录
```bash
mkdir -p src/modules/mall/{entity,service,controller/{admin,app},middleware}
touch src/modules/mall/config.ts
```

#### Step 2: 创建模块配置
```typescript
// src/modules/mall/config.ts
import { ModuleConfig } from '@cool-midway/core';

export default () => {
  return {
    name: '商城模块',
    description: '多商户商城管理系统',
    version: '1.0.0',
    order: 10, // 模块加载顺序
  } as ModuleConfig;
};
```

---

## 3. 核心功能开发

### 3.1 商户管理开发

#### Step 1: 创建商户实体
```typescript
// src/modules/mall/entity/merchant.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商户表
 */
@Entity('mall_merchant')
export class MallMerchantEntity extends BaseEntity {
  @Column({ comment: '商户名称', length: 100 })
  name: string;

  @Column({ comment: '商户编号', unique: true, length: 50 })
  @Index()
  merchantNo: string;

  @Column({ comment: '负责人姓名', length: 50 })
  contactName: string;

  @Column({ comment: '联系电话', length: 20 })
  contactPhone: string;

  @Column({ comment: '商户类型 1-企业 2-个体户', default: 1 })
  type: number;

  @Column({ comment: '营业执照号', nullable: true })
  businessLicense: string;

  @Column({ comment: '店铺名称', length: 100 })
  shopName: string;

  @Column({ comment: '店铺logo', nullable: true })
  shopLogo: string;

  @Column({ comment: '店铺描述', type: 'text', nullable: true })
  shopDescription: string;

  @Column({ comment: '状态 0-待审核 1-正常 2-冻结 3-已拒绝', default: 0 })
  @Index()
  status: number;

  @Column({ comment: '保证金金额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  depositAmount: number;

  @Column({ comment: '佣金比例(%)', type: 'decimal', precision: 5, scale: 2, default: 5 })
  commissionRate: number;

  @Column({ comment: '审核备注', nullable: true })
  auditRemark: string;

  @Column({ comment: '入驻时间', type: 'datetime', nullable: true })
  joinTime: Date;

  @Column({ comment: '扩展信息', type: 'json', nullable: true })
  extraData: any;
}
```

#### Step 2: 创建商户服务
```typescript
// src/modules/mall/service/merchant.ts
import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallMerchantEntity } from '../entity/merchant';

@Provide()
export class MallMerchantService extends BaseService {
  @InjectEntityModel(MallMerchantEntity)
  mallMerchantEntity: Repository<MallMerchantEntity>;

  /**
   * 商户注册
   */
  async register(data: Partial<MallMerchantEntity>) {
    // 1. 生成商户编号
    const merchantNo = 'M' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

    // 2. 创建商户
    const merchant = await this.mallMerchantEntity.save({
      ...data,
      merchantNo,
      status: 0, // 待审核
      joinTime: new Date(),
    });

    // 3. TODO: 发送审核通知给管理员

    return merchant;
  }

  /**
   * 商户审核
   */
  async audit(id: number, status: number, auditRemark?: string) {
    const merchant = await this.mallMerchantEntity.findOne({ where: { id } });

    if (!merchant) {
      throw new Error('商户不存在');
    }

    if (merchant.status !== 0) {
      throw new Error('该商户已审核，无需重复审核');
    }

    // 更新状态
    merchant.status = status; // 1-通过 3-拒绝
    merchant.auditRemark = auditRemark;
    await this.mallMerchantEntity.save(merchant);

    // TODO: 发送审核结果通知给商户

    return merchant;
  }

  /**
   * 商户列表（分页）
   */
  async page(query: any) {
    const qb = this.mallMerchantEntity.createQueryBuilder('merchant');

    // 商户名称搜索
    if (query.name) {
      qb.andWhere('merchant.name LIKE :name', { name: `%${query.name}%` });
    }

    // 状态筛选
    if (query.status !== undefined) {
      qb.andWhere('merchant.status = :status', { status: query.status });
    }

    // 排序
    qb.orderBy('merchant.createTime', 'DESC');

    return this.entityRenderPage(qb, query);
  }

  /**
   * 更新店铺信息
   */
  async updateShop(id: number, data: Partial<MallMerchantEntity>) {
    const merchant = await this.mallMerchantEntity.findOne({ where: { id } });

    if (!merchant) {
      throw new Error('商户不存在');
    }

    // 只允许更新店铺相关字段
    const allowFields = ['shopName', 'shopLogo', 'shopDescription'];
    const updateData = {};

    allowFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    Object.assign(merchant, updateData);
    return await this.mallMerchantEntity.save(merchant);
  }
}
```

#### Step 3: 创建商户控制器
```typescript
// src/modules/mall/controller/admin/merchant.ts
import { Body, Get, Inject, Post, Query, Provide } from '@midwayjs/core';
import { BaseController, CoolController, CoolUrlTag } from '@cool-midway/core';
import { MallMerchantService } from '../../service/merchant';
import { MallMerchantEntity } from '../../entity/merchant';

/**
 * 管理端-商户管理
 */
@CoolUrlTag()
@Provide()
@CoolController('/admin/mall/merchant')
export class AdminMallMerchantController extends BaseController {
  @Inject()
  mallMerchantService: MallMerchantService;

  /**
   * 商户列表
   */
  @Post('/page', { summary: '商户列表' })
  async page(@Body() query: any) {
    return this.ok(await this.mallMerchantService.page(query));
  }

  /**
   * 商户详情
   */
  @Get('/info', { summary: '商户详情' })
  async info(@Query('id') id: number) {
    return this.ok(await this.mallMerchantService.info(id));
  }

  /**
   * 商户审核
   */
  @Post('/audit', { summary: '商户审核' })
  async audit(
    @Body('id') id: number,
    @Body('status') status: number,
    @Body('auditRemark') auditRemark?: string
  ) {
    await this.mallMerchantService.audit(id, status, auditRemark);
    return this.ok();
  }

  /**
   * 冻结商户
   */
  @Post('/freeze', { summary: '冻结商户' })
  async freeze(@Body('id') id: number) {
    await this.mallMerchantService.audit(id, 2, '违规操作，已冻结');
    return this.ok();
  }
}
```

```typescript
// src/modules/mall/controller/app/merchant.ts
import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { BaseController, CoolController, CoolUrlTag } from '@cool-midway/core';
import { MallMerchantService } from '../../service/merchant';
import { MallMerchantEntity } from '../../entity/merchant';

/**
 * 用户端-商户注册
 */
@CoolUrlTag()
@Provide()
@CoolController('/app/mall/merchant')
export class AppMallMerchantController extends BaseController {
  @Inject()
  mallMerchantService: MallMerchantService;

  /**
   * 商户注册
   */
  @Post('/register', { summary: '商户注册' })
  async register(@Body() entity: MallMerchantEntity) {
    const merchant = await this.mallMerchantService.register(entity);
    return this.ok(merchant);
  }
}
```

#### Step 4: 启动项目测试
```bash
# 启动项目
npm run dev

# 访问 Swagger
http://localhost:8001/swagger

# 测试注册接口
POST /app/mall/merchant/register
{
  "name": "测试商户",
  "contactName": "张三",
  "contactPhone": "13800138000",
  "type": 1,
  "businessLicense": "123456789",
  "shopName": "测试店铺",
  "shopLogo": "https://xxx.jpg",
  "shopDescription": "这是一家测试店铺"
}

# 测试审核接口
POST /admin/mall/merchant/audit
{
  "id": 1,
  "status": 1,
  "auditRemark": "审核通过"
}
```

---

### 3.2 商品管理开发

#### 完整的商品 Service 示例
```typescript
// src/modules/mall/service/goods.ts
import { Provide, Inject } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallGoodsEntity } from '../entity/goods';
import { MallGoodsSkuEntity } from '../entity/goods-sku';

@Provide()
export class MallGoodsService extends BaseService {
  @InjectEntityModel(MallGoodsEntity)
  mallGoodsEntity: Repository<MallGoodsEntity>;

  @InjectEntityModel(MallGoodsSkuEntity)
  mallGoodsSkuEntity: Repository<MallGoodsSkuEntity>;

  /**
   * 创建商品（带SKU）
   */
  async createGoods(merchantId: number, goodsData: any, skuData: any[]) {
    // 1. 生成商品编号
    const goodsNo = 'G' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

    // 2. 创建商品
    const goods = await this.mallGoodsEntity.save({
      ...goodsData,
      merchantId,
      goodsNo,
      status: 2, // 待审核
    });

    // 3. 创建 SKU
    if (skuData && skuData.length > 0) {
      const skus = skuData.map(sku => ({
        ...sku,
        goodsId: goods.id,
        skuNo: 'S' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase(),
      }));

      await this.mallGoodsSkuEntity.save(skus);
    }

    return goods;
  }

  /**
   * 商户商品列表
   */
  async merchantGoodsPage(merchantId: number, query: any) {
    const qb = this.mallGoodsEntity
      .createQueryBuilder('goods')
      .where('goods.merchantId = :merchantId', { merchantId });

    // 商品名称搜索
    if (query.name) {
      qb.andWhere('goods.name LIKE :name', { name: `%${query.name}%` });
    }

    // 状态筛选
    if (query.status !== undefined) {
      qb.andWhere('goods.status = :status', { status: query.status });
    }

    qb.orderBy('goods.createTime', 'DESC');

    return this.entityRenderPage(qb, query);
  }

  /**
   * 上架/下架
   */
  async updateStatus(id: number, merchantId: number, status: number) {
    const goods = await this.mallGoodsEntity.findOne({
      where: { id, merchantId }
    });

    if (!goods) {
      throw new Error('商品不存在或无权操作');
    }

    goods.status = status;
    return await this.mallGoodsEntity.save(goods);
  }

  /**
   * 扣减库存
   */
  async reduceStock(skuId: number, quantity: number) {
    const sku = await this.mallGoodsSkuEntity.findOne({ where: { id: skuId } });

    if (!sku) {
      throw new Error('SKU不存在');
    }

    if (sku.stock < quantity) {
      throw new Error('库存不足');
    }

    sku.stock -= quantity;
    return await this.mallGoodsSkuEntity.save(sku);
  }

  /**
   * 回滚库存（取消订单时）
   */
  async rollbackStock(skuId: number, quantity: number) {
    const sku = await this.mallGoodsSkuEntity.findOne({ where: { id: skuId } });

    if (!sku) {
      throw new Error('SKU不存在');
    }

    sku.stock += quantity;
    return await this.mallGoodsSkuEntity.save(sku);
  }
}
```

---

### 3.3 订单管理开发

#### 创建订单的完整流程
```typescript
// src/modules/mall/service/order.ts
import { Provide, Inject } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallOrderEntity } from '../entity/order';
import { MallOrderItemEntity } from '../entity/order-item';
import { MallCartEntity } from '../entity/cart';
import { MallGoodsService } from './goods';

@Provide()
export class MallOrderService extends BaseService {
  @InjectEntityModel(MallOrderEntity)
  mallOrderEntity: Repository<MallOrderEntity>;

  @InjectEntityModel(MallOrderItemEntity)
  mallOrderItemEntity: Repository<MallOrderItemEntity>;

  @InjectEntityModel(MallCartEntity)
  mallCartEntity: Repository<MallCartEntity>;

  @Inject()
  mallGoodsService: MallGoodsService;

  /**
   * 创建订单
   */
  async createOrder(userId: number, cartIds: number[], addressData: any) {
    // 1. 查询购物车商品
    const cartItems = await this.mallCartEntity
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.goods', 'goods')
      .leftJoinAndSelect('cart.sku', 'sku')
      .where('cart.id IN (:...ids)', { ids: cartIds })
      .andWhere('cart.userId = :userId', { userId })
      .getMany();

    if (cartItems.length === 0) {
      throw new Error('购物车为空');
    }

    // 2. 按商户分组（一个商户一个订单）
    const merchantMap = new Map();

    cartItems.forEach(item => {
      const merchantId = item.goods.merchantId;

      if (!merchantMap.has(merchantId)) {
        merchantMap.set(merchantId, []);
      }

      merchantMap.get(merchantId).push(item);
    });

    const orders = [];

    // 3. 为每个商户创建订单
    for (const [merchantId, items] of merchantMap.entries()) {
      // 3.1 计算金额
      let goodsAmount = 0;
      items.forEach(item => {
        const price = item.sku ? item.sku.price : item.goods.price;
        goodsAmount += price * item.quantity;
      });

      // 3.2 生成订单号
      const orderNo = 'O' + Date.now() + merchantId + Math.random().toString(36).substr(2, 4).toUpperCase();

      // 3.3 创建订单
      const order = await this.mallOrderEntity.save({
        orderNo,
        merchantId,
        userId,
        goodsAmount,
        freight: 0, // TODO: 运费计算
        discountAmount: 0, // TODO: 优惠券
        payAmount: goodsAmount,
        status: 0, // 待支付
        receiverName: addressData.receiverName,
        receiverPhone: addressData.receiverPhone,
        receiverAddress: addressData.receiverAddress,
      });

      // 3.4 创建订单明细
      const orderItems = items.map(item => ({
        orderId: order.id,
        goodsId: item.goodsId,
        skuId: item.skuId,
        goodsName: item.goods.name,
        goodsImage: item.goods.mainImage,
        specName: item.sku?.specName,
        price: item.sku ? item.sku.price : item.goods.price,
        quantity: item.quantity,
        totalAmount: (item.sku ? item.sku.price : item.goods.price) * item.quantity,
      }));

      await this.mallOrderItemEntity.save(orderItems);

      // 3.5 扣减库存
      for (const item of items) {
        if (item.skuId) {
          await this.mallGoodsService.reduceStock(item.skuId, item.quantity);
        }
      }

      orders.push(order);
    }

    // 4. 清空购物车
    await this.mallCartEntity.delete(cartIds);

    return orders;
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderId: number, userId: number) {
    const order = await this.mallOrderEntity.findOne({
      where: { id: orderId, userId }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status !== 0) {
      throw new Error('只有待支付订单才能取消');
    }

    // 1. 更新订单状态
    order.status = 4; // 已取消
    await this.mallOrderEntity.save(order);

    // 2. 回滚库存
    const orderItems = await this.mallOrderItemEntity.find({
      where: { orderId }
    });

    for (const item of orderItems) {
      if (item.skuId) {
        await this.mallGoodsService.rollbackStock(item.skuId, item.quantity);
      }
    }

    return order;
  }

  /**
   * 支付成功回调
   */
  async paySuccess(orderNo: string, payTime: Date) {
    const order = await this.mallOrderEntity.findOne({
      where: { orderNo }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    order.status = 1; // 待发货
    order.payStatus = 1; // 已支付
    order.payTime = payTime;

    return await this.mallOrderEntity.save(order);
  }
}
```

---

## 4. 常见问题解决

### 4.1 数据库连接失败

**问题：** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决：**
```typescript
// 检查 MySQL 是否启动
# Windows:
services.msc -> 找到 MySQL80 -> 启动

# Mac:
brew services start mysql

// 检查配置文件
// src/config/config.local.ts
export default {
  typeorm: {
    dataSource: {
      default: {
        host: '127.0.0.1',  // ✅ 确认主机
        port: 3306,          // ✅ 确认端口
        username: 'root',    // ✅ 确认用户名
        password: '你的密码', // ✅ 确认密码
        database: 'mall_db', // ✅ 确认数据库名
      }
    }
  }
}
```

---

### 4.2 表不存在

**问题：** `Table 'mall_db.mall_merchant' doesn't exist`

**解决：**
```typescript
// 1. 确保 synchronize 为 true（开发环境）
// src/config/config.local.ts
typeorm: {
  dataSource: {
    default: {
      synchronize: true,  // ✅ 开启自动建表
    }
  }
}

// 2. 重启项目
npm run dev

// 3. 如果还不行，手动执行 SQL
CREATE TABLE mall_merchant (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  -- ... 其他字段
);
```

---

### 4.3 接口 404

**问题：** `404 Not Found`

**解决：**
```typescript
// 1. 检查路由是否正确
@CoolController('/admin/mall/merchant')  // ✅ 路由前缀

// 2. 检查方法装饰器
@Post('/page')  // ✅ 完整路径: /admin/mall/merchant/page

// 3. 检查是否有 @Provide()
@Provide()  // ✅ 必须添加
export class AdminMallMerchantController

// 4. 重启项目
npm run dev
```

---

### 4.4 跨域问题

**问题：** `Access-Control-Allow-Origin` 错误

**解决：**
```typescript
// src/config/config.default.ts
export default {
  koa: {
    port: 8001,
  },
  cors: {
    origin: '*',  // ✅ 允许所有域名（开发环境）
    // origin: 'http://localhost:3000',  // 生产环境指定域名
    credentials: true,
  },
}
```

---

## 5. 代码规范

### 5.1 命名规范

```typescript
// ✅ 文件命名：小写 + 连字符
merchant.ts
goods-sku.ts
order-item.ts

// ✅ 类命名：大驼峰
class MallMerchantEntity {}
class MallGoodsService {}

// ✅ 方法命名：小驼峰
async createOrder() {}
async getMerchantInfo() {}

// ✅ 变量命名：小驼峰
const merchantId = 1;
const orderList = [];

// ✅ 常量命名：大写 + 下划线
const MAX_UPLOAD_SIZE = 1024 * 1024 * 5; // 5MB
const ORDER_STATUS = {
  PENDING: 0,
  PAID: 1,
  SHIPPED: 2,
};
```

---

### 5.2 注释规范

```typescript
/**
 * 商户服务类
 * @description 负责商户的注册、审核、管理等功能
 */
@Provide()
export class MallMerchantService extends BaseService {

  /**
   * 商户注册
   * @param data 商户信息
   * @returns 商户实体
   */
  async register(data: Partial<MallMerchantEntity>) {
    // 1. 生成商户编号
    const merchantNo = 'M' + Date.now();

    // 2. 创建商户
    return await this.mallMerchantEntity.save({
      ...data,
      merchantNo,
    });
  }
}
```

---

### 5.3 错误处理

```typescript
// ✅ 使用明确的错误信息
throw new Error('商户不存在');
throw new Error('库存不足');
throw new Error('订单状态异常');

// ✅ 统一的错误响应格式
return this.fail('商户不存在');
return this.ok(data);

// ✅ Try-Catch 包裹重要操作
try {
  await this.createOrder();
} catch (error) {
  console.error('创建订单失败:', error);
  throw error;
}
```

---

## 6. 测试指南

### 6.1 使用 Swagger 测试

```bash
# 1. 启动项目
npm run dev

# 2. 访问 Swagger
http://localhost:8001/swagger

# 3. 测试流程
1) 注册商户 -> POST /app/mall/merchant/register
2) 审核商户 -> POST /admin/mall/merchant/audit
3) 创建商品 -> POST /merchant/mall/goods/add
4) 加入购物车 -> POST /app/mall/cart/add
5) 创建订单 -> POST /app/mall/order/create
6) 支付订单 -> POST /app/mall/order/pay
```

---

### 6.2 使用 Postman 测试

```json
// 创建 Postman Collection
{
  "name": "多商户商城API",
  "item": [
    {
      "name": "商户注册",
      "request": {
        "method": "POST",
        "url": "http://localhost:8001/app/mall/merchant/register",
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"测试商户\"}"
        }
      }
    }
  ]
}
```

---

### 6.3 单元测试

```typescript
// test/mall/merchant.test.ts
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';

describe('test/mall/merchant.test.ts', () => {
  let app;

  beforeAll(async () => {
    app = await createApp<Framework>();
  });

  afterAll(async () => {
    await close(app);
  });

  it('商户注册', async () => {
    const result = await createHttpRequest(app)
      .post('/app/mall/merchant/register')
      .send({
        name: '测试商户',
        contactName: '张三',
        contactPhone: '13800138000',
      });

    expect(result.status).toBe(200);
    expect(result.body.code).toBe(1000);
  });
});
```

---

## 7. 部署指南

### 7.1 生产环境配置

```typescript
// src/config/config.prod.ts
export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '生产数据库地址',
        port: 3306,
        username: '生产用户名',
        password: '生产密码',
        database: 'mall_db_prod',
        synchronize: false,  // ⚠️ 生产环境必须为 false
        logging: false,
      }
    }
  },

  redis: {
    client: {
      host: '生产Redis地址',
      port: 6379,
      password: 'Redis密码',
      db: 0,
    }
  },

  keys: '生产环境密钥',  // ⚠️ 必须修改
};
```

---

### 7.2 使用 PM2 部署

```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 构建项目
npm run build

# 3. 启动项目
pm2 start ecosystem.config.js

# 4. 查看状态
pm2 status

# 5. 查看日志
pm2 logs

# 6. 重启项目
pm2 restart mall-api

# 7. 停止项目
pm2 stop mall-api
```

**PM2 配置文件：**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mall-api',
    script: './bootstrap.js',
    instances: 2,  // 启动2个实例
    exec_mode: 'cluster',  // 集群模式
    env: {
      NODE_ENV: 'production',
      PORT: 8001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
```

---

### 7.3 Nginx 配置

```nginx
# /etc/nginx/sites-available/mall-api
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📚 附录

### A. 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm start            # 启动生产服务器

# 测试
npm test             # 运行测试
npm run test:cov     # 测试覆盖率

# 数据库
npm run migration:generate  # 生成迁移文件
npm run migration:run       # 执行迁移

# PM2
pm2 start            # 启动
pm2 stop             # 停止
pm2 restart          # 重启
pm2 logs             # 查看日志
pm2 monit            # 监控
```

---

### B. 推荐资源

- [Cool-Admin 官方文档](https://cool-js.com)
- [Midway.js 官方文档](https://midwayjs.org)
- [TypeORM 官方文档](https://typeorm.io)
- [微信支付开发文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)
- [支付宝开放平台](https://open.alipay.com/platform/home.htm)

---

### C. 问题反馈

- 微信群：扫码加入 Cool-Admin 官方微信群
- GitHub Issues: https://github.com/cool-team-official/cool-admin-midway/issues
- 邮件: support@cool-js.com

---

**开发愉快！遇到问题随时查阅本指南！💪**
