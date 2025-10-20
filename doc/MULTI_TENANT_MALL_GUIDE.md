# 🛒 多商户商城系统开发指南

基于 Cool-Admin 开发多商户商城完整方案

---

## 🎯 项目概述

### 系统特点

- ✅ **多商户支持** - 商家独立管理店铺
- ✅ **数据隔离** - 商户数据自动隔离
- ✅ **权限分离** - 平台管理、商户管理、用户端
- ✅ **完整商城功能** - 商品、订单、支付、物流
- ✅ **营销工具** - 优惠券、秒杀、拼团
- ✅ **佣金结算** - 平台抽成、商户结算

### 架构设计

```
多商户商城系统
├── 平台管理端 (Super Admin)
│   ├── 商户管理
│   ├── 分类管理
│   ├── 订单监控
│   ├── 财务结算
│   └── 数据统计
│
├── 商户管理端 (Merchant Admin)
│   ├── 店铺管理
│   ├── 商品管理
│   ├── 订单管理
│   ├── 营销工具
│   └── 财务报表
│
└── 用户端 (Customer App)
    ├── 商品浏览
    ├── 购物车
    ├── 下单支付
    ├── 订单管理
    └── 个人中心
```

---

## 📦 数据库设计

### 核心表结构

#### 1. 商户表 (merchant)

```typescript
// src/modules/mall/entity/merchant.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商户表
 */
@Entity('mall_merchant')
export class MallMerchantEntity extends BaseEntity {
  @Column({ comment: '商户名称' })
  name: string;

  @Column({ comment: '商户编号', unique: true })
  merchantNo: string;

  @Column({ comment: '负责人姓名' })
  contactName: string;

  @Column({ comment: '联系电话' })
  contactPhone: string;

  @Column({ comment: '商户类型 1-企业 2-个体户', default: 1 })
  type: number;

  @Column({ comment: '营业执照号', nullable: true })
  businessLicense: string;

  @Column({ comment: '店铺名称' })
  shopName: string;

  @Column({ comment: '店铺logo', nullable: true })
  shopLogo: string;

  @Column({ comment: '店铺描述', type: 'text', nullable: true })
  shopDescription: string;

  @Column({ comment: '状态 0-待审核 1-正常 2-冻结 3-已拒绝', default: 0 })
  status: number;

  @Column({ comment: '保证金金额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  depositAmount: number;

  @Column({ comment: '佣金比例(%)', type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ comment: '审核备注', nullable: true })
  auditRemark: string;

  @Column({ comment: '过期时间', type: 'datetime', nullable: true })
  expireTime: Date;
}
```

#### 2. 商品表 (goods)

```typescript
// src/modules/mall/entity/goods.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商品表
 */
@Entity('mall_goods')
@Index(['merchantId', 'status'])
export class MallGoodsEntity extends BaseEntity {
  @Index()
  @Column({ comment: '商户ID' })
  merchantId: number;

  @Column({ comment: '商品名称' })
  name: string;

  @Column({ comment: '商品编号', unique: true })
  goodsNo: string;

  @Column({ comment: '分类ID' })
  categoryId: number;

  @Column({ comment: '品牌ID', nullable: true })
  brandId: number;

  @Column({ comment: '主图', type: 'simple-array' })
  images: string[];

  @Column({ comment: '商品详情', type: 'longtext' })
  detail: string;

  @Column({ comment: '原价', type: 'decimal', precision: 10, scale: 2 })
  originalPrice: number;

  @Column({ comment: '售价', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ comment: '库存', default: 0 })
  stock: number;

  @Column({ comment: '销量', default: 0 })
  sales: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '状态 0-下架 1-上架 2-待审核', default: 2 })
  status: number;

  @Column({ comment: '是否推荐', default: false })
  isRecommend: boolean;

  @Column({ comment: '是否热卖', default: false })
  isHot: boolean;

  @Column({ comment: '是否新品', default: false })
  isNew: boolean;

  @Column({ comment: '运费模板ID', nullable: true })
  freightTemplateId: number;
}
```

#### 3. 商品SKU表 (goods_sku)

```typescript
// src/modules/mall/entity/goods-sku.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商品SKU表
 */
@Entity('mall_goods_sku')
export class MallGoodsSkuEntity extends BaseEntity {
  @Index()
  @Column({ comment: '商品ID' })
  goodsId: number;

  @Column({ comment: 'SKU编号', unique: true })
  skuNo: string;

  @Column({ comment: '规格名称，如：红色-L' })
  specName: string;

  @Column({ comment: '规格值JSON', type: 'json' })
  specValue: Record<string, string>;

  @Column({ comment: '价格', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ comment: '库存', default: 0 })
  stock: number;

  @Column({ comment: '销量', default: 0 })
  sales: number;

  @Column({ comment: 'SKU图片', nullable: true })
  image: string;

  @Column({ comment: '状态 0-禁用 1-启用', default: 1 })
  status: number;
}
```

#### 4. 订单表 (order)

```typescript
// src/modules/mall/entity/order.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单表
 */
@Entity('mall_order')
@Index(['merchantId', 'status'])
@Index(['userId', 'createTime'])
export class MallOrderEntity extends BaseEntity {
  @Column({ comment: '订单号', unique: true })
  orderNo: string;

  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Index()
  @Column({ comment: '商户ID' })
  merchantId: number;

  @Column({ comment: '商品总金额', type: 'decimal', precision: 10, scale: 2 })
  goodsAmount: number;

  @Column({ comment: '运费', type: 'decimal', precision: 10, scale: 2, default: 0 })
  freightAmount: number;

  @Column({ comment: '优惠金额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ comment: '实付金额', type: 'decimal', precision: 10, scale: 2 })
  payAmount: number;

  @Column({ comment: '平台佣金', type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformCommission: number;

  @Column({ comment: '商户实收', type: 'decimal', precision: 10, scale: 2 })
  merchantAmount: number;

  @Column({ comment: '收货人' })
  receiverName: string;

  @Column({ comment: '收货电话' })
  receiverPhone: string;

  @Column({ comment: '收货地址' })
  receiverAddress: string;

  @Column({ comment: '订单状态 0-待支付 1-待发货 2-待收货 3-已完成 4-已取消 5-已退款', default: 0 })
  status: number;

  @Column({ comment: '支付方式 1-微信 2-支付宝 3-余额', nullable: true })
  payType: number;

  @Column({ comment: '支付时间', type: 'datetime', nullable: true })
  payTime: Date;

  @Column({ comment: '发货时间', type: 'datetime', nullable: true })
  shipTime: Date;

  @Column({ comment: '完成时间', type: 'datetime', nullable: true })
  finishTime: Date;

  @Column({ comment: '取消时间', type: 'datetime', nullable: true })
  cancelTime: Date;

  @Column({ comment: '物流公司', nullable: true })
  expressCompany: string;

  @Column({ comment: '物流单号', nullable: true })
  expressNo: string;

  @Column({ comment: '买家留言', type: 'text', nullable: true })
  buyerMessage: string;

  @Column({ comment: '卖家备注', type: 'text', nullable: true })
  sellerRemark: string;
}
```

#### 5. 订单明细表 (order_item)

```typescript
// src/modules/mall/entity/order-item.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单明细表
 */
@Entity('mall_order_item')
export class MallOrderItemEntity extends BaseEntity {
  @Index()
  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ comment: '商品ID' })
  goodsId: number;

  @Column({ comment: 'SKU ID', nullable: true })
  skuId: number;

  @Column({ comment: '商品名称' })
  goodsName: string;

  @Column({ comment: '商品图片' })
  goodsImage: string;

  @Column({ comment: '规格名称', nullable: true })
  specName: string;

  @Column({ comment: '商品单价', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ comment: '购买数量' })
  quantity: number;

  @Column({ comment: '小计金额', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;
}
```

#### 6. 购物车表 (cart)

```typescript
// src/modules/mall/entity/cart.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 购物车表
 */
@Entity('mall_cart')
@Index(['userId', 'merchantId'])
export class MallCartEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '商户ID' })
  merchantId: number;

  @Column({ comment: '商品ID' })
  goodsId: number;

  @Column({ comment: 'SKU ID', nullable: true })
  skuId: number;

  @Column({ comment: '数量' })
  quantity: number;

  @Column({ comment: '是否选中', default: true })
  isChecked: boolean;
}
```

#### 7. 商户账户表 (merchant_account)

```typescript
// src/modules/mall/entity/merchant-account.ts
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商户账户表
 */
@Entity('mall_merchant_account')
export class MallMerchantAccountEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '商户ID' })
  merchantId: number;

  @Column({ comment: '账户余额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ comment: '冻结金额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  frozenAmount: number;

  @Column({ comment: '累计收入', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalIncome: number;

  @Column({ comment: '累计提现', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalWithdraw: number;
}
```

---

## 🔧 核心功能实现

### 1. 多租户数据隔离

Cool-Admin 内置多租户支持，自动实现数据隔离：

```typescript
// src/modules/mall/config.ts
import { ModuleConfig } from '@cool-midway/core';

export default () => {
  return {
    name: '多商户商城',
    description: '支持多商户的电商平台',
    // 启用多租户
    tenant: {
      enable: true,
      // 租户字段名
      column: 'merchantId',
      // 需要隔离的实体
      entities: [
        'MallGoodsEntity',
        'MallGoodsSkuEntity',
        'MallOrderEntity',
        'MallOrderItemEntity',
      ],
    },
  } as ModuleConfig;
};
```

### 2. 商户服务实现

```typescript
// src/modules/mall/service/merchant.ts
import { Provide, Inject } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallMerchantEntity } from '../entity/merchant';
import { MallMerchantAccountEntity } from '../entity/merchant-account';

@Provide()
export class MallMerchantService extends BaseService {
  @InjectEntityModel(MallMerchantEntity)
  merchantEntity: Repository<MallMerchantEntity>;

  @InjectEntityModel(MallMerchantAccountEntity)
  merchantAccountEntity: Repository<MallMerchantAccountEntity>;

  /**
   * 商户入驻申请
   */
  async apply(data: Partial<MallMerchantEntity>) {
    // 生成商户编号
    const merchantNo = 'M' + Date.now();

    const merchant = await this.merchantEntity.save({
      ...data,
      merchantNo,
      status: 0, // 待审核
    });

    // 创建商户账户
    await this.merchantAccountEntity.save({
      merchantId: merchant.id,
      balance: 0,
      frozenAmount: 0,
      totalIncome: 0,
      totalWithdraw: 0,
    });

    return merchant;
  }

  /**
   * 审核商户
   */
  async audit(id: number, status: number, remark?: string) {
    const merchant = await this.merchantEntity.findOne({ where: { id } });
    if (!merchant) {
      throw new Error('商户不存在');
    }

    merchant.status = status;
    merchant.auditRemark = remark;

    return await this.merchantEntity.save(merchant);
  }

  /**
   * 商户列表（分页）
   */
  async page(query: any) {
    const queryBuilder = this.merchantEntity
      .createQueryBuilder('merchant')
      .orderBy('merchant.createTime', 'DESC');

    // 筛选条件
    if (query.status !== undefined) {
      queryBuilder.andWhere('merchant.status = :status', { status: query.status });
    }

    if (query.keyword) {
      queryBuilder.andWhere(
        '(merchant.name LIKE :keyword OR merchant.shopName LIKE :keyword)',
        { keyword: `%${query.keyword}%` }
      );
    }

    return this.entityRenderPage(queryBuilder, query);
  }

  /**
   * 商户统计
   */
  async statistics(merchantId: number) {
    // 商品统计
    const goodsStats = await this.nativeQuery(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as onSale,
        SUM(stock) as totalStock,
        SUM(sales) as totalSales
      FROM mall_goods
      WHERE merchantId = ?
    `, [merchantId]);

    // 订单统计
    const orderStats = await this.nativeQuery(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pendingPay,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as pendingShip,
        SUM(CASE WHEN status >= 3 THEN payAmount ELSE 0 END) as totalAmount
      FROM mall_order
      WHERE merchantId = ?
    `, [merchantId]);

    return {
      goods: goodsStats[0],
      order: orderStats[0],
    };
  }
}
```

### 3. 商品服务实现

```typescript
// src/modules/mall/service/goods.ts
import { Provide, Inject } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallGoodsEntity } from '../entity/goods';
import { MallGoodsSkuEntity } from '../entity/goods-sku';
import { Context } from '@midwayjs/koa';

@Provide()
export class MallGoodsService extends BaseService {
  @InjectEntityModel(MallGoodsEntity)
  goodsEntity: Repository<MallGoodsEntity>;

  @InjectEntityModel(MallGoodsSkuEntity)
  skuEntity: Repository<MallGoodsSkuEntity>;

  @Inject()
  ctx: Context;

  /**
   * 添加商品
   */
  async addGoods(data: any) {
    const merchantId = this.ctx.merchant?.id; // 从上下文获取商户ID

    // 生成商品编号
    const goodsNo = 'G' + Date.now();

    // 保存商品基本信息
    const goods = await this.goodsEntity.save({
      ...data,
      merchantId,
      goodsNo,
      status: 2, // 待审核
    });

    // 保存SKU信息
    if (data.skus && data.skus.length > 0) {
      const skus = data.skus.map((sku: any, index: number) => ({
        ...sku,
        goodsId: goods.id,
        skuNo: `${goodsNo}-${index + 1}`,
      }));
      await this.skuEntity.save(skus);
    }

    return goods;
  }

  /**
   * 商品列表（商户端）
   */
  async merchantPage(query: any) {
    const merchantId = this.ctx.merchant?.id;

    const queryBuilder = this.goodsEntity
      .createQueryBuilder('goods')
      .where('goods.merchantId = :merchantId', { merchantId })
      .orderBy('goods.sort', 'DESC')
      .addOrderBy('goods.createTime', 'DESC');

    if (query.status !== undefined) {
      queryBuilder.andWhere('goods.status = :status', { status: query.status });
    }

    if (query.keyword) {
      queryBuilder.andWhere('goods.name LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    return this.entityRenderPage(queryBuilder, query);
  }

  /**
   * 商品列表（用户端）
   */
  async appPage(query: any) {
    const queryBuilder = this.goodsEntity
      .createQueryBuilder('goods')
      .leftJoinAndSelect('goods.merchant', 'merchant')
      .where('goods.status = 1') // 只显示上架商品
      .andWhere('merchant.status = 1') // 只显示正常商户
      .orderBy('goods.sort', 'DESC')
      .addOrderBy('goods.sales', 'DESC');

    // 分类筛选
    if (query.categoryId) {
      queryBuilder.andWhere('goods.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    // 关键词搜索
    if (query.keyword) {
      queryBuilder.andWhere('goods.name LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    // 价格区间
    if (query.minPrice) {
      queryBuilder.andWhere('goods.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice) {
      queryBuilder.andWhere('goods.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    return this.entityRenderPage(queryBuilder, query);
  }

  /**
   * 商品详情
   */
  async detail(id: number) {
    const goods = await this.goodsEntity
      .createQueryBuilder('goods')
      .leftJoinAndSelect('goods.merchant', 'merchant')
      .where('goods.id = :id', { id })
      .getOne();

    if (!goods) {
      throw new Error('商品不存在');
    }

    // 获取SKU信息
    const skus = await this.skuEntity.find({
      where: { goodsId: id, status: 1 },
    });

    return {
      ...goods,
      skus,
    };
  }

  /**
   * 更新库存
   */
  async updateStock(goodsId: number, skuId: number, quantity: number) {
    if (skuId) {
      // 更新SKU库存和销量
      await this.skuEntity.decrement({ id: skuId }, 'stock', quantity);
      await this.skuEntity.increment({ id: skuId }, 'sales', quantity);
    }

    // 更新商品库存和销量
    await this.goodsEntity.decrement({ id: goodsId }, 'stock', quantity);
    await this.goodsEntity.increment({ id: goodsId }, 'sales', quantity);
  }
}
```

### 4. 订单服务实现

```typescript
// src/modules/mall/service/order.ts
import { Provide, Inject } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MallOrderEntity } from '../entity/order';
import { MallOrderItemEntity } from '../entity/order-item';
import { MallCartEntity } from '../entity/cart';
import { MallGoodsService } from './goods';
import { Context } from '@midwayjs/koa';

@Provide()
export class MallOrderService extends BaseService {
  @InjectEntityModel(MallOrderEntity)
  orderEntity: Repository<MallOrderEntity>;

  @InjectEntityModel(MallOrderItemEntity)
  orderItemEntity: Repository<MallOrderItemEntity>;

  @InjectEntityModel(MallCartEntity)
  cartEntity: Repository<MallCartEntity>;

  @Inject()
  dataSource: DataSource;

  @Inject()
  goodsService: MallGoodsService;

  @Inject()
  ctx: Context;

  /**
   * 创建订单
   */
  async createOrder(data: {
    cartIds: number[];
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    buyerMessage?: string;
  }) {
    const userId = this.ctx.user?.id;

    // 使用事务
    return await this.dataSource.transaction(async manager => {
      // 获取购物车商品
      const cartItems = await manager.find(MallCartEntity, {
        where: { id: In(data.cartIds), userId },
        relations: ['goods', 'sku'],
      });

      if (cartItems.length === 0) {
        throw new Error('购物车为空');
      }

      // 按商户分组
      const merchantGroups = cartItems.reduce((groups, item) => {
        const merchantId = item.goods.merchantId;
        if (!groups[merchantId]) {
          groups[merchantId] = [];
        }
        groups[merchantId].push(item);
        return groups;
      }, {});

      const orders = [];

      // 为每个商户创建订单
      for (const [merchantId, items] of Object.entries(merchantGroups)) {
        // 计算订单金额
        let goodsAmount = 0;
        const orderItems = [];

        for (const item of items as any[]) {
          const price = item.sku ? item.sku.price : item.goods.price;
          const totalAmount = price * item.quantity;
          goodsAmount += totalAmount;

          orderItems.push({
            goodsId: item.goodsId,
            skuId: item.skuId,
            goodsName: item.goods.name,
            goodsImage: item.goods.images[0],
            specName: item.sku?.specName,
            price,
            quantity: item.quantity,
            totalAmount,
          });

          // 检查并扣减库存
          const stock = item.sku ? item.sku.stock : item.goods.stock;
          if (stock < item.quantity) {
            throw new Error(`商品${item.goods.name}库存不足`);
          }
        }

        // 计算平台佣金
        const merchant = await manager.findOne(MallMerchantEntity, {
          where: { id: merchantId },
        });
        const commissionRate = merchant.commissionRate / 100;
        const platformCommission = goodsAmount * commissionRate;
        const merchantAmount = goodsAmount - platformCommission;

        // 创建订单
        const orderNo = 'O' + Date.now() + Math.floor(Math.random() * 1000);
        const order = await manager.save(MallOrderEntity, {
          orderNo,
          userId,
          merchantId,
          goodsAmount,
          freightAmount: 0,
          discountAmount: 0,
          payAmount: goodsAmount,
          platformCommission,
          merchantAmount,
          ...data,
          status: 0, // 待支付
        });

        // 创建订单明细
        for (const item of orderItems) {
          await manager.save(MallOrderItemEntity, {
            ...item,
            orderId: order.id,
          });
        }

        orders.push(order);

        // 扣减库存
        for (const item of items as any[]) {
          await this.goodsService.updateStock(
            item.goodsId,
            item.skuId,
            item.quantity
          );
        }
      }

      // 清空购物车
      await manager.delete(MallCartEntity, { id: In(data.cartIds) });

      return orders;
    });
  }

  /**
   * 支付订单
   */
  async payOrder(orderNo: string, payType: number) {
    const order = await this.orderEntity.findOne({ where: { orderNo } });
    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status !== 0) {
      throw new Error('订单状态不正确');
    }

    // TODO: 调用支付接口

    // 更新订单状态
    order.status = 1; // 待发货
    order.payType = payType;
    order.payTime = new Date();

    return await this.orderEntity.save(order);
  }

  /**
   * 商户发货
   */
  async shipOrder(id: number, expressCompany: string, expressNo: string) {
    const merchantId = this.ctx.merchant?.id;

    const order = await this.orderEntity.findOne({
      where: { id, merchantId },
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status !== 1) {
      throw new Error('订单状态不正确');
    }

    order.status = 2; // 待收货
    order.expressCompany = expressCompany;
    order.expressNo = expressNo;
    order.shipTime = new Date();

    return await this.orderEntity.save(order);
  }

  /**
   * 确认收货
   */
  async confirmOrder(id: number) {
    const userId = this.ctx.user?.id;

    const order = await this.orderEntity.findOne({
      where: { id, userId },
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status !== 2) {
      throw new Error('订单状态不正确');
    }

    order.status = 3; // 已完成
    order.finishTime = new Date();

    // TODO: 结算给商户

    return await this.orderEntity.save(order);
  }

  /**
   * 订单列表（用户端）
   */
  async userPage(query: any) {
    const userId = this.ctx.user?.id;

    const queryBuilder = this.orderEntity
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.merchant', 'merchant')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createTime', 'DESC');

    if (query.status !== undefined) {
      queryBuilder.andWhere('order.status = :status', { status: query.status });
    }

    return this.entityRenderPage(queryBuilder, query);
  }

  /**
   * 订单列表（商户端）
   */
  async merchantPage(query: any) {
    const merchantId = this.ctx.merchant?.id;

    const queryBuilder = this.orderEntity
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.merchantId = :merchantId', { merchantId })
      .orderBy('order.createTime', 'DESC');

    if (query.status !== undefined) {
      queryBuilder.andWhere('order.status = :status', { status: query.status });
    }

    return this.entityRenderPage(queryBuilder, query);
  }
}
```

### 5. 购物车服务实现

```typescript
// src/modules/mall/service/cart.ts
import { Provide, Inject } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallCartEntity } from '../entity/cart';
import { Context } from '@midwayjs/koa';

@Provide()
export class MallCartService extends BaseService {
  @InjectEntityModel(MallCartEntity)
  cartEntity: Repository<MallCartEntity>;

  @Inject()
  ctx: Context;

  /**
   * 添加到购物车
   */
  async add(goodsId: number, skuId: number, quantity: number) {
    const userId = this.ctx.user?.id;

    // 查询是否已存在
    const existing = await this.cartEntity.findOne({
      where: { userId, goodsId, skuId },
    });

    if (existing) {
      // 增加数量
      existing.quantity += quantity;
      return await this.cartEntity.save(existing);
    } else {
      // 新增购物车项
      return await this.cartEntity.save({
        userId,
        goodsId,
        skuId,
        quantity,
        isChecked: true,
      });
    }
  }

  /**
   * 更新数量
   */
  async updateQuantity(id: number, quantity: number) {
    const userId = this.ctx.user?.id;

    const cart = await this.cartEntity.findOne({
      where: { id, userId },
    });

    if (!cart) {
      throw new Error('购物车项不存在');
    }

    cart.quantity = quantity;
    return await this.cartEntity.save(cart);
  }

  /**
   * 删除购物车项
   */
  async remove(ids: number[]) {
    const userId = this.ctx.user?.id;

    return await this.cartEntity.delete({
      id: In(ids),
      userId,
    });
  }

  /**
   * 购物车列表
   */
  async list() {
    const userId = this.ctx.user?.id;

    return await this.cartEntity.find({
      where: { userId },
      relations: ['goods', 'sku', 'merchant'],
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 切换选中状态
   */
  async toggleCheck(ids: number[], isChecked: boolean) {
    const userId = this.ctx.user?.id;

    await this.cartEntity.update(
      { id: In(ids), userId },
      { isChecked }
    );
  }
}
```

---

## 🎨 控制器实现

### 平台管理端控制器

```typescript
// src/modules/mall/controller/admin/merchant.ts
import { Body, Get, Inject, Post, Query, Provide } from '@midwayjs/core';
import { BaseController, CoolController, CoolUrlTag } from '@cool-midway/core';
import { MallMerchantService } from '../../service/merchant';

@CoolUrlTag()
@Provide()
@CoolController('/admin/mall/merchant')
export class AdminMallMerchantController extends BaseController {
  @Inject()
  merchantService: MallMerchantService;

  /**
   * 商户列表
   */
  @Post('/page', { summary: '商户列表' })
  async page(@Body() query: any) {
    return this.ok(await this.merchantService.page(query));
  }

  /**
   * 审核商户
   */
  @Post('/audit', { summary: '审核商户' })
  async audit(
    @Body('id') id: number,
    @Body('status') status: number,
    @Body('remark') remark: string
  ) {
    await this.merchantService.audit(id, status, remark);
    return this.ok();
  }

  /**
   * 商户统计
   */
  @Get('/statistics', { summary: '商户统计' })
  async statistics(@Query('merchantId') merchantId: number) {
    return this.ok(await this.merchantService.statistics(merchantId));
  }
}
```

### 商户管理端控制器

```typescript
// src/modules/mall/controller/merchant/goods.ts
import { Body, Get, Inject, Post, Query, Provide } from '@midwayjs/core';
import { BaseController, CoolController, CoolUrlTag } from '@cool-midway/core';
import { MallGoodsService } from '../../service/goods';

@CoolUrlTag()
@Provide()
@CoolController('/merchant/mall/goods')
export class MerchantMallGoodsController extends BaseController {
  @Inject()
  goodsService: MallGoodsService;

  /**
   * 商品列表
   */
  @Post('/page', { summary: '商品列表' })
  async page(@Body() query: any) {
    return this.ok(await this.goodsService.merchantPage(query));
  }

  /**
   * 添加商品
   */
  @Post('/add', { summary: '添加商品' })
  async add(@Body() data: any) {
    return this.ok(await this.goodsService.addGoods(data));
  }

  /**
   * 上下架
   */
  @Post('/updateStatus', { summary: '上下架商品' })
  async updateStatus(
    @Body('id') id: number,
    @Body('status') status: number
  ) {
    await this.goodsService.update({ id, status });
    return this.ok();
  }
}
```

### 用户端控制器

```typescript
// src/modules/mall/controller/app/goods.ts
import { Body, Get, Inject, Post, Query, Provide } from '@midwayjs/core';
import { BaseController, CoolController, CoolUrlTag } from '@cool-midway/core';
import { MallGoodsService } from '../../service/goods';

@CoolUrlTag()
@Provide()
@CoolController('/app/mall/goods')
export class AppMallGoodsController extends BaseController {
  @Inject()
  goodsService: MallGoodsService;

  /**
   * 商品列表
   */
  @Post('/page', { summary: '商品列表' })
  async page(@Body() query: any) {
    return this.ok(await this.goodsService.appPage(query));
  }

  /**
   * 商品详情
   */
  @Get('/detail', { summary: '商品详情' })
  async detail(@Query('id') id: number) {
    return this.ok(await this.goodsService.detail(id));
  }
}

// src/modules/mall/controller/app/cart.ts
@CoolUrlTag()
@Provide()
@CoolController('/app/mall/cart')
export class AppMallCartController extends BaseController {
  @Inject()
  cartService: MallCartService;

  /**
   * 购物车列表
   */
  @Get('/list', { summary: '购物车列表' })
  async list() {
    return this.ok(await this.cartService.list());
  }

  /**
   * 添加到购物车
   */
  @Post('/add', { summary: '添加到购物车' })
  async add(
    @Body('goodsId') goodsId: number,
    @Body('skuId') skuId: number,
    @Body('quantity') quantity: number
  ) {
    await this.cartService.add(goodsId, skuId, quantity);
    return this.ok();
  }
}

// src/modules/mall/controller/app/order.ts
@CoolUrlTag()
@Provide()
@CoolController('/app/mall/order')
export class AppMallOrderController extends BaseController {
  @Inject()
  orderService: MallOrderService;

  /**
   * 创建订单
   */
  @Post('/create', { summary: '创建订单' })
  async create(@Body() data: any) {
    return this.ok(await this.orderService.createOrder(data));
  }

  /**
   * 支付订单
   */
  @Post('/pay', { summary: '支付订单' })
  async pay(
    @Body('orderNo') orderNo: string,
    @Body('payType') payType: number
  ) {
    return this.ok(await this.orderService.payOrder(orderNo, payType));
  }

  /**
   * 确认收货
   */
  @Post('/confirm', { summary: '确认收货' })
  async confirm(@Body('id') id: number) {
    await this.orderService.confirmOrder(id);
    return this.ok();
  }

  /**
   * 订单列表
   */
  @Post('/page', { summary: '订单列表' })
  async page(@Body() query: any) {
    return this.ok(await this.orderService.userPage(query));
  }
}
```

---

## 📱 前端对接

### 1. API 接口文档

启动项目后访问：`http://localhost:8001/swagger`

所有接口自动生成文档，支持在线测试。

### 2. 前端项目

克隆官方前端项目并配置：

```bash
git clone https://github.com/cool-team-official/cool-admin-vue.git
cd cool-admin-vue
npm install
```

修改配置文件，指向后端API：

```typescript
// .env.development
VITE_APP_BASE_URL=http://localhost:8001
```

---

## 🚀 部署方案

### Docker 部署

```yaml
# docker-compose.yml
version: '3'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: mall
    volumes:
      - ./data/mysql:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  app:
    build: ..
    ports:
      - "8001:8001"
    depends_on:
      - mysql
      - redis
    environment:
      NODE_ENV: production
```

---

## 💡 扩展功能建议

### 1. 营销工具
- ✅ 优惠券系统
- ✅ 秒杀活动
- ✅ 拼团功能
- ✅ 积分系统
- ✅ 会员等级

### 2. 支付集成
- ✅ 微信支付
- ✅ 支付宝
- ✅ 余额支付
- ✅ 货到付款

### 3. 物流管理
- ✅ 物流跟踪
- ✅ 电子面单
- ✅ 运费模板

### 4. 数据统计
- ✅ 销售报表
- ✅ 商品分析
- ✅ 用户画像
- ✅ 经营看板

### 5. 智能推荐
- ✅ 商品推荐
- ✅ 搜索优化
- ✅ 个性化首页

---

## 📖 总结

使用 Cool-Admin 开发多商户商城系统的优势：

✅ **开发效率极高** - AI 编码 + 自动生成 CRUD
✅ **多租户开箱即用** - 自动数据隔离
✅ **权限管理完善** - 平台、商户、用户三端权限
✅ **易于扩展** - 模块化 + 插件化
✅ **部署灵活** - Docker / PM2 / 原生打包

**预计开发周期**：
- 基础版：2-3 周
- 完整版：1-2 个月
- 复杂版：2-3 个月

**技术支持**：
- 官方文档：https://cool-js.com
- 官方社区：微信群
- GitHub：提Issue

祝您开发顺利！🚀
