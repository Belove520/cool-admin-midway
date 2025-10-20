# 商品管理系统实现指南

## 一、概述

商品管理系统是商城的核心功能,支持商品分类、商品发布、规格管理、库存管理、价格管理等完整的商品生命周期管理。

### 1.1 功能特性

- **商品分类**:支持多级分类、分类属性配置
- **商品发布**:商品基本信息、规格、价格、库存
- **SKU管理**:多规格商品的SKU管理
- **库存管理**:库存预占、库存扣减、库存盘点
- **价格管理**:价格设置、促销价格
- **商品审核**:商品发布审核机制

## 二、数据库设计

### 2.1 商品分类表 (goods_category)

```sql
CREATE TABLE `goods_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `parent_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '父级分类ID',
  `category_name` varchar(50) NOT NULL COMMENT '分类名称',
  `category_icon` varchar(255) DEFAULT NULL COMMENT '分类图标',
  `category_image` varchar(255) DEFAULT NULL COMMENT '分类图片',
  `level` tinyint(2) NOT NULL DEFAULT '1' COMMENT '分类层级：1-一级 2-二级 3-三级',
  `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `is_show` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否显示：0-否 1-是',
  `is_recommend` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否推荐：0-否 1-是',
  `commission_rate` decimal(5,2) DEFAULT NULL COMMENT '佣金比例(%)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';
```

### 2.2 商品表 (goods)

```sql
CREATE TABLE `goods` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `goods_no` varchar(32) NOT NULL COMMENT '商品编号',
  `merchant_id` bigint(20) NOT NULL COMMENT '商户ID',
  `category_id` bigint(20) NOT NULL COMMENT '分类ID',
  `goods_name` varchar(200) NOT NULL COMMENT '商品名称',
  `goods_brief` varchar(500) DEFAULT NULL COMMENT '商品简介',
  `goods_desc` text COMMENT '商品详情',
  `goods_image` varchar(255) DEFAULT NULL COMMENT '商品主图',
  `goods_images` text COMMENT '商品轮播图(JSON数组)',
  `goods_video` varchar(255) DEFAULT NULL COMMENT '商品视频',
  `original_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '原价',
  `price` decimal(10,2) NOT NULL COMMENT '售价',
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT '成本价',
  `stock` int(11) NOT NULL DEFAULT '0' COMMENT '库存',
  `warn_stock` int(11) NOT NULL DEFAULT '0' COMMENT '预警库存',
  `sales` int(11) NOT NULL DEFAULT '0' COMMENT '销量',
  `virtual_sales` int(11) NOT NULL DEFAULT '0' COMMENT '虚拟销量',
  `unit` varchar(10) DEFAULT '件' COMMENT '单位',
  `weight` decimal(10,2) DEFAULT NULL COMMENT '重量(kg)',
  `volume` decimal(10,2) DEFAULT NULL COMMENT '体积(m³)',
  `freight_template_id` bigint(20) DEFAULT NULL COMMENT '运费模板ID',
  `is_free_shipping` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否包邮：0-否 1-是',
  `has_spec` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否有规格：0-否 1-是',
  `spec_type` tinyint(2) DEFAULT NULL COMMENT '规格类型：1-单规格 2-多规格',
  `status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '状态：0-待审核 1-审核通过 2-审核拒绝 3-已下架',
  `reject_reason` varchar(255) DEFAULT NULL COMMENT '拒绝原因',
  `is_hot` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否热门：0-否 1-是',
  `is_new` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否新品：0-否 1-是',
  `is_recommend` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否推荐：0-否 1-是',
  `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `view_count` int(11) NOT NULL DEFAULT '0' COMMENT '浏览量',
  `favorite_count` int(11) NOT NULL DEFAULT '0' COMMENT '收藏量',
  `share_count` int(11) NOT NULL DEFAULT '0' COMMENT '分享量',
  `audit_time` datetime DEFAULT NULL COMMENT '审核时间',
  `audit_user_id` bigint(20) DEFAULT NULL COMMENT '审核人ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_goods_no` (`goods_no`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

### 2.3 商品SKU表 (goods_sku)

```sql
CREATE TABLE `goods_sku` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'SKU ID',
  `goods_id` bigint(20) NOT NULL COMMENT '商品ID',
  `sku_no` varchar(32) NOT NULL COMMENT 'SKU编号',
  `sku_name` varchar(200) DEFAULT NULL COMMENT 'SKU名称',
  `sku_image` varchar(255) DEFAULT NULL COMMENT 'SKU图片',
  `spec_values` varchar(500) DEFAULT NULL COMMENT '规格值(JSON)',
  `original_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '原价',
  `price` decimal(10,2) NOT NULL COMMENT '售价',
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT '成本价',
  `stock` int(11) NOT NULL DEFAULT '0' COMMENT '库存',
  `warn_stock` int(11) NOT NULL DEFAULT '0' COMMENT '预警库存',
  `sales` int(11) NOT NULL DEFAULT '0' COMMENT '销量',
  `weight` decimal(10,2) DEFAULT NULL COMMENT '重量(kg)',
  `volume` decimal(10,2) DEFAULT NULL COMMENT '体积(m³)',
  `barcode` varchar(50) DEFAULT NULL COMMENT '条形码',
  `status` tinyint(2) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用 1-启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sku_no` (`sku_no`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SKU表';
```

### 2.4 商品规格表 (goods_spec)

```sql
CREATE TABLE `goods_spec` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '规格ID',
  `spec_name` varchar(50) NOT NULL COMMENT '规格名称',
  `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格表';
```

### 2.5 商品规格值表 (goods_spec_value)

```sql
CREATE TABLE `goods_spec_value` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '规格值ID',
  `spec_id` bigint(20) NOT NULL COMMENT '规格ID',
  `spec_value` varchar(50) NOT NULL COMMENT '规格值',
  `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_spec_id` (`spec_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格值表';
```

### 2.6 库存变动记录表 (goods_stock_log)

```sql
CREATE TABLE `goods_stock_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `goods_id` bigint(20) NOT NULL COMMENT '商品ID',
  `sku_id` bigint(20) DEFAULT NULL COMMENT 'SKU ID',
  `log_no` varchar(32) NOT NULL COMMENT '流水号',
  `change_type` tinyint(2) NOT NULL COMMENT '变动类型：1-入库 2-出库 3-预占 4-释放 5-盘点',
  `change_quantity` int(11) NOT NULL COMMENT '变动数量',
  `stock_before` int(11) NOT NULL COMMENT '变动前库存',
  `stock_after` int(11) NOT NULL COMMENT '变动后库存',
  `relate_no` varchar(32) DEFAULT NULL COMMENT '关联单号',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_log_no` (`log_no`),
  KEY `idx_goods_id` (`goods_id`),
  KEY `idx_sku_id` (`sku_id`),
  KEY `idx_change_type` (`change_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存变动记录表';
```

### 2.7 商品收藏表 (goods_favorite)

```sql
CREATE TABLE `goods_favorite` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `goods_id` bigint(20) NOT NULL COMMENT '商品ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_goods` (`user_id`,`goods_id`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品收藏表';
```

## 三、Entity 实体类

### 3.1 商品实体 (goods.ts)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商品实体
 */
@Entity('goods')
export class GoodsEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '商品编号', length: 32 })
  goodsNo: string;

  @Index()
  @Column({ comment: '商户ID', type: 'bigint' })
  merchantId: number;

  @Index()
  @Column({ comment: '分类ID', type: 'bigint' })
  categoryId: number;

  @Column({ comment: '商品名称', length: 200 })
  goodsName: string;

  @Column({ comment: '商品简介', length: 500, nullable: true })
  goodsBrief: string;

  @Column({ comment: '商品详情', type: 'text', nullable: true })
  goodsDesc: string;

  @Column({ comment: '商品主图', nullable: true })
  goodsImage: string;

  @Column({ comment: '商品轮播图(JSON数组)', type: 'text', nullable: true })
  goodsImages: string;

  @Column({ comment: '商品视频', nullable: true })
  goodsVideo: string;

  @Column({ comment: '原价', type: 'decimal', precision: 10, scale: 2, default: 0 })
  originalPrice: number;

  @Column({ comment: '售价', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ comment: '成本价', type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column({ comment: '库存', default: 0 })
  stock: number;

  @Column({ comment: '预警库存', default: 0 })
  warnStock: number;

  @Column({ comment: '销量', default: 0 })
  sales: number;

  @Column({ comment: '虚拟销量', default: 0 })
  virtualSales: number;

  @Column({ comment: '单位', length: 10, default: '件' })
  unit: string;

  @Column({ comment: '重量(kg)', type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ comment: '体积(m³)', type: 'decimal', precision: 10, scale: 2, nullable: true })
  volume: number;

  @Column({ comment: '运费模板ID', type: 'bigint', nullable: true })
  freightTemplateId: number;

  @Column({ comment: '是否包邮：0-否 1-是', type: 'tinyint', default: 0 })
  isFreeShipping: number;

  @Column({ comment: '是否有规格：0-否 1-是', type: 'tinyint', default: 0 })
  hasSpec: number;

  @Column({ comment: '规格类型：1-单规格 2-多规格', type: 'tinyint', nullable: true })
  specType: number;

  @Index()
  @Column({ comment: '状态：0-待审核 1-审核通过 2-审核拒绝 3-已下架', type: 'tinyint', default: 0 })
  status: number;

  @Column({ comment: '拒绝原因', nullable: true })
  rejectReason: string;

  @Column({ comment: '是否热门：0-否 1-是', type: 'tinyint', default: 0 })
  isHot: number;

  @Column({ comment: '是否新品：0-否 1-是', type: 'tinyint', default: 0 })
  isNew: number;

  @Column({ comment: '是否推荐：0-否 1-是', type: 'tinyint', default: 0 })
  isRecommend: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '浏览量', default: 0 })
  viewCount: number;

  @Column({ comment: '收藏量', default: 0 })
  favoriteCount: number;

  @Column({ comment: '分享量', default: 0 })
  shareCount: number;

  @Column({ comment: '审核时间', type: 'datetime', nullable: true })
  auditTime: Date;

  @Column({ comment: '审核人ID', type: 'bigint', nullable: true })
  auditUserId: number;
}
```

### 3.2 商品SKU实体 (goods-sku.ts)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商品SKU实体
 */
@Entity('goods_sku')
export class GoodsSkuEntity extends BaseEntity {
  @Index()
  @Column({ comment: '商品ID', type: 'bigint' })
  goodsId: number;

  @Index({ unique: true })
  @Column({ comment: 'SKU编号', length: 32 })
  skuNo: string;

  @Column({ comment: 'SKU名称', length: 200, nullable: true })
  skuName: string;

  @Column({ comment: 'SKU图片', nullable: true })
  skuImage: string;

  @Column({ comment: '规格值(JSON)', length: 500, nullable: true })
  specValues: string;

  @Column({ comment: '原价', type: 'decimal', precision: 10, scale: 2, default: 0 })
  originalPrice: number;

  @Column({ comment: '售价', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ comment: '成本价', type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column({ comment: '库存', default: 0 })
  stock: number;

  @Column({ comment: '预警库存', default: 0 })
  warnStock: number;

  @Column({ comment: '销量', default: 0 })
  sales: number;

  @Column({ comment: '重量(kg)', type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ comment: '体积(m³)', type: 'decimal', precision: 10, scale: 2, nullable: true })
  volume: number;

  @Column({ comment: '条形码', length: 50, nullable: true })
  barcode: string;

  @Column({ comment: '状态：0-禁用 1-启用', type: 'tinyint', default: 1 })
  status: number;
}
```

## 四、Service 服务层

### 4.1 商品服务 (goods.ts)

```typescript
import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/service/base';
import { GoodsEntity } from '../entity/goods';
import { GoodsSkuEntity } from '../entity/goods-sku';
import { GoodsStockLogEntity } from '../entity/goods-stock-log';

/**
 * 商品服务
 */
@Provide()
export class GoodsService extends BaseService {
  @InjectEntityModel(GoodsEntity)
  goodsEntity: Repository<GoodsEntity>;

  @InjectEntityModel(GoodsSkuEntity)
  goodsSkuEntity: Repository<GoodsSkuEntity>;

  @InjectEntityModel(GoodsStockLogEntity)
  goodsStockLogEntity: Repository<GoodsStockLogEntity>;

  /**
   * 发布商品
   */
  async publish(params: any, merchantId: number) {
    return await this.goodsEntity.manager.transaction(async manager => {
      // 生成商品编号
      const goodsNo = await this.generateGoodsNo();

      // 创建商品
      const goods = new GoodsEntity();
      goods.goodsNo = goodsNo;
      goods.merchantId = merchantId;
      goods.categoryId = params.categoryId;
      goods.goodsName = params.goodsName;
      goods.goodsBrief = params.goodsBrief;
      goods.goodsDesc = params.goodsDesc;
      goods.goodsImage = params.goodsImage;
      goods.goodsImages = JSON.stringify(params.goodsImages || []);
      goods.goodsVideo = params.goodsVideo;
      goods.unit = params.unit || '件';
      goods.freightTemplateId = params.freightTemplateId;
      goods.isFreeShipping = params.isFreeShipping || 0;
      goods.hasSpec = params.hasSpec || 0;
      goods.specType = params.specType || 1;
      goods.status = 0; // 待审核

      // 如果是单规格
      if (!params.hasSpec || params.specType === 1) {
        goods.originalPrice = params.originalPrice || 0;
        goods.price = params.price;
        goods.costPrice = params.costPrice;
        goods.stock = params.stock || 0;
        goods.warnStock = params.warnStock || 0;
        goods.weight = params.weight;
        goods.volume = params.volume;
      } else {
        // 多规格取最低价和总库存
        const skus = params.skus || [];
        const prices = skus.map(sku => sku.price);
        const stocks = skus.map(sku => sku.stock);
        goods.price = Math.min(...prices);
        goods.stock = stocks.reduce((a, b) => a + b, 0);
      }

      const savedGoods = await manager.save(GoodsEntity, goods);

      // 如果是多规格,创建SKU
      if (params.hasSpec && params.specType === 2 && params.skus) {
        for (const skuData of params.skus) {
          const sku = new GoodsSkuEntity();
          sku.goodsId = savedGoods.id;
          sku.skuNo = await this.generateSkuNo();
          sku.skuName = skuData.skuName;
          sku.skuImage = skuData.skuImage;
          sku.specValues = JSON.stringify(skuData.specValues || {});
          sku.originalPrice = skuData.originalPrice || 0;
          sku.price = skuData.price;
          sku.costPrice = skuData.costPrice;
          sku.stock = skuData.stock || 0;
          sku.warnStock = skuData.warnStock || 0;
          sku.weight = skuData.weight;
          sku.volume = skuData.volume;
          sku.barcode = skuData.barcode;
          await manager.save(GoodsSkuEntity, sku);
        }
      }

      return savedGoods;
    });
  }

  /**
   * 审核商品
   */
  async audit(id: number, status: number, rejectReason: string, adminUserId: number) {
    const goods = await this.goodsEntity.findOne({ where: { id } });
    if (!goods) {
      throw new Error('商品不存在');
    }

    if (goods.status !== 0) {
      throw new Error('该商品已审核过');
    }

    goods.status = status;
    goods.rejectReason = rejectReason;
    goods.auditTime = new Date();
    goods.auditUserId = adminUserId;

    return await this.goodsEntity.save(goods);
  }

  /**
   * 上下架商品
   */
  async updateStatus(id: number, status: number, merchantId?: number) {
    const where: any = { id };
    if (merchantId) {
      where.merchantId = merchantId;
    }

    const goods = await this.goodsEntity.findOne({ where });
    if (!goods) {
      throw new Error('商品不存在');
    }

    goods.status = status;
    return await this.goodsEntity.save(goods);
  }

  /**
   * 扣减库存
   */
  async deductStock(goodsId: number, skuId: number, quantity: number, relateNo: string) {
    return await this.goodsEntity.manager.transaction(async manager => {
      if (skuId) {
        // 扣减SKU库存
        const sku = await manager.findOne(GoodsSkuEntity, {
          where: { id: skuId },
          lock: { mode: 'pessimistic_write' }
        });

        if (!sku) {
          throw new Error('SKU不存在');
        }

        if (sku.stock < quantity) {
          throw new Error('库存不足');
        }

        const stockBefore = sku.stock;
        sku.stock -= quantity;
        await manager.save(GoodsSkuEntity, sku);

        // 记录流水
        const log = new GoodsStockLogEntity();
        log.goodsId = goodsId;
        log.skuId = skuId;
        log.logNo = await this.generateLogNo();
        log.changeType = 2; // 出库
        log.changeQuantity = quantity;
        log.stockBefore = stockBefore;
        log.stockAfter = sku.stock;
        log.relateNo = relateNo;
        await manager.save(GoodsStockLogEntity, log);
      } else {
        // 扣减商品库存
        const goods = await manager.findOne(GoodsEntity, {
          where: { id: goodsId },
          lock: { mode: 'pessimistic_write' }
        });

        if (!goods) {
          throw new Error('商品不存在');
        }

        if (goods.stock < quantity) {
          throw new Error('库存不足');
        }

        const stockBefore = goods.stock;
        goods.stock -= quantity;
        await manager.save(GoodsEntity, goods);

        // 记录流水
        const log = new GoodsStockLogEntity();
        log.goodsId = goodsId;
        log.logNo = await this.generateLogNo();
        log.changeType = 2; // 出库
        log.changeQuantity = quantity;
        log.stockBefore = stockBefore;
        log.stockAfter = goods.stock;
        log.relateNo = relateNo;
        await manager.save(GoodsStockLogEntity, log);
      }
    });
  }

  /**
   * 增加库存
   */
  async addStock(goodsId: number, skuId: number, quantity: number, relateNo: string) {
    return await this.goodsEntity.manager.transaction(async manager => {
      if (skuId) {
        // 增加SKU库存
        const sku = await manager.findOne(GoodsSkuEntity, {
          where: { id: skuId },
          lock: { mode: 'pessimistic_write' }
        });

        if (!sku) {
          throw new Error('SKU不存在');
        }

        const stockBefore = sku.stock;
        sku.stock += quantity;
        await manager.save(GoodsSkuEntity, sku);

        // 记录流水
        const log = new GoodsStockLogEntity();
        log.goodsId = goodsId;
        log.skuId = skuId;
        log.logNo = await this.generateLogNo();
        log.changeType = 1; // 入库
        log.changeQuantity = quantity;
        log.stockBefore = stockBefore;
        log.stockAfter = sku.stock;
        log.relateNo = relateNo;
        await manager.save(GoodsStockLogEntity, log);
      } else {
        // 增加商品库存
        const goods = await manager.findOne(GoodsEntity, {
          where: { id: goodsId },
          lock: { mode: 'pessimistic_write' }
        });

        if (!goods) {
          throw new Error('商品不存在');
        }

        const stockBefore = goods.stock;
        goods.stock += quantity;
        await manager.save(GoodsEntity, goods);

        // 记录流水
        const log = new GoodsStockLogEntity();
        log.goodsId = goodsId;
        log.logNo = await this.generateLogNo();
        log.changeType = 1; // 入库
        log.changeQuantity = quantity;
        log.stockBefore = stockBefore;
        log.stockAfter = goods.stock;
        log.relateNo = relateNo;
        await manager.save(GoodsStockLogEntity, log);
      }
    });
  }

  /**
   * 增加浏览量
   */
  async increaseViewCount(id: number) {
    await this.goodsEntity.increment({ id }, 'viewCount', 1);
  }

  /**
   * 生成商品编号
   */
  private async generateGoodsNo(): Promise<string> {
    const prefix = 'G';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * 生成SKU编号
   */
  private async generateSkuNo(): Promise<string> {
    const prefix = 'S';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * 生成流水号
   */
  private async generateLogNo(): Promise<string> {
    const prefix = 'SL';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}
```

## 五、Controller 控制器

### 5.1 商品控制器 (goods.ts)

```typescript
import { Body, Controller, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseController } from '../../../base/controller/base';
import { GoodsService } from '../../service/goods';
import { MerchantService } from '../../../merchant/service/merchant';

/**
 * 商品控制器（商户端）
 */
@Controller('/merchant/goods')
export class MerchantGoodsController extends BaseController {
  @Inject()
  goodsService: GoodsService;

  @Inject()
  merchantService: MerchantService;

  /**
   * 发布商品
   */
  @Post('/publish')
  async publish(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const merchant = await this.merchantService.getByUserId(userId);
    if (!merchant) {
      return this.fail('您还不是商户');
    }
    if (merchant.status !== 1) {
      return this.fail('商户未通过审核');
    }
    const result = await this.goodsService.publish(body, merchant.id);
    return this.ok(result);
  }

  /**
   * 编辑商品
   */
  @Post('/update')
  async update(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const merchant = await this.merchantService.getByUserId(userId);
    if (!merchant) {
      return this.fail('您还不是商户');
    }
    // TODO: 检查商品是否属于该商户
    await this.goodsService.update(body);
    return this.ok();
  }

  /**
   * 上下架商品
   */
  @Post('/updateStatus')
  async updateStatus(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const merchant = await this.merchantService.getByUserId(userId);
    if (!merchant) {
      return this.fail('您还不是商户');
    }
    const { id, status } = body;
    await this.goodsService.updateStatus(id, status, merchant.id);
    return this.ok();
  }

  /**
   * 我的商品列表
   */
  @Post('/myPage')
  async myPage(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const merchant = await this.merchantService.getByUserId(userId);
    if (!merchant) {
      return this.fail('您还不是商户');
    }
    body.merchantId = merchant.id;
    const result = await this.goodsService.page(body);
    return this.ok(result);
  }
}

/**
 * 商品控制器（用户端）
 */
@Controller('/app/goods')
export class AppGoodsController extends BaseController {
  @Inject()
  goodsService: GoodsService;

  /**
   * 商品列表
   */
  @Post('/page')
  async page(@Body() body: any) {
    body.status = 1; // 只查询审核通过的商品
    const result = await this.goodsService.page(body);
    return this.ok(result);
  }

  /**
   * 商品详情
   */
  @Get('/info')
  async info(@Query('id') id: number) {
    const goods = await this.goodsService.info(id);
    // 增加浏览量
    await this.goodsService.increaseViewCount(id);
    return this.ok(goods);
  }

  /**
   * 热门商品
   */
  @Get('/hot')
  async hot() {
    const result = await this.goodsService.list({ isHot: 1, status: 1 });
    return this.ok(result);
  }

  /**
   * 新品推荐
   */
  @Get('/new')
  async new() {
    const result = await this.goodsService.list({ isNew: 1, status: 1 });
    return this.ok(result);
  }
}

/**
 * 商品管理控制器（后台）
 */
@Controller('/admin/goods')
export class AdminGoodsController extends BaseController {
  @Inject()
  goodsService: GoodsService;

  /**
   * 分页查询
   */
  @Post('/page')
  async page(@Body() body: any) {
    const result = await this.goodsService.page(body);
    return this.ok(result);
  }

  /**
   * 审核商品
   */
  @Post('/audit')
  async audit(@Body() body: any) {
    const { id, status, rejectReason } = body;
    const adminUserId = this.ctx.admin.userId;
    const result = await this.goodsService.audit(id, status, rejectReason, adminUserId);
    return this.ok(result);
  }

  /**
   * 设置热门
   */
  @Post('/setHot')
  async setHot(@Body() body: any) {
    const { id, isHot } = body;
    await this.goodsService.update({ id, isHot });
    return this.ok();
  }

  /**
   * 设置新品
   */
  @Post('/setNew')
  async setNew(@Body() body: any) {
    const { id, isNew } = body;
    await this.goodsService.update({ id, isNew });
    return this.ok();
  }

  /**
   * 设置推荐
   */
  @Post('/setRecommend')
  async setRecommend(@Body() body: any) {
    const { id, isRecommend } = body;
    await this.goodsService.update({ id, isRecommend });
    return this.ok();
  }
}
```

## 六、前端对接

### 6.1 API 接口列表

#### 商户端接口

```
POST /merchant/goods/publish       - 发布商品
POST /merchant/goods/update        - 编辑商品
POST /merchant/goods/updateStatus  - 上下架商品
POST /merchant/goods/myPage        - 我的商品列表
```

#### 用户端接口

```
POST /app/goods/page               - 商品列表
GET  /app/goods/info               - 商品详情
GET  /app/goods/hot                - 热门商品
GET  /app/goods/new                - 新品推荐
```

#### 管理端接口

```
POST /admin/goods/page             - 分页查询
POST /admin/goods/audit            - 审核商品
POST /admin/goods/setHot           - 设置热门
POST /admin/goods/setNew           - 设置新品
POST /admin/goods/setRecommend     - 设置推荐
```

### 6.2 请求示例

**发布单规格商品**

```json
POST /merchant/goods/publish
{
  "categoryId": 1,
  "goodsName": "测试商品",
  "goodsBrief": "这是一个测试商品",
  "goodsDesc": "<p>商品详情</p>",
  "goodsImage": "http://example.com/goods.jpg",
  "goodsImages": ["http://example.com/1.jpg", "http://example.com/2.jpg"],
  "hasSpec": 0,
  "specType": 1,
  "originalPrice": 199,
  "price": 99,
  "costPrice": 50,
  "stock": 100,
  "warnStock": 10,
  "unit": "件",
  "weight": 1.5,
  "isFreeShipping": 1
}
```

**发布多规格商品**

```json
POST /merchant/goods/publish
{
  "categoryId": 1,
  "goodsName": "测试商品",
  "goodsBrief": "这是一个测试商品",
  "goodsDesc": "<p>商品详情</p>",
  "goodsImage": "http://example.com/goods.jpg",
  "goodsImages": ["http://example.com/1.jpg", "http://example.com/2.jpg"],
  "hasSpec": 1,
  "specType": 2,
  "isFreeShipping": 1,
  "skus": [
    {
      "skuName": "红色 大码",
      "skuImage": "http://example.com/red.jpg",
      "specValues": {"颜色": "红色", "尺码": "大码"},
      "price": 99,
      "stock": 50
    },
    {
      "skuName": "蓝色 大码",
      "skuImage": "http://example.com/blue.jpg",
      "specValues": {"颜色": "蓝色", "尺码": "大码"},
      "price": 99,
      "stock": 50
    }
  ]
}
```

## 七、注意事项

### 7.1 库存管理

1. 库存扣减必须使用**数据库事务**和**悲观锁**
2. 订单创建时先预占库存，支付成功后再扣减
3. 订单取消或退款时要释放库存
4. 定期检查预警库存，及时提醒补货

### 7.2 商品审核

1. 商品发布后需要审核才能上架
2. 审核时检查商品信息的完整性和合规性
3. 审核拒绝需要给出明确的原因

### 7.3 性能优化

1. 商品列表查询要添加合适的索引
2. 商品详情可以使用Redis缓存
3. 商品图片要使用CDN加速
4. 分页查询避免深分页

### 7.4 数据一致性

1. 商品和SKU数据要保持一致
2. 商品价格和库存要与SKU同步
3. 库存变动要记录完整的流水

## 八、扩展功能

### 8.1 商品标签

支持给商品打标签,如"爆款"、"包邮"、"限时特价"等。

### 8.2 商品评价

用户购买后可以对商品进行评价,影响商品的评分和排名。

### 8.3 商品搜索

支持商品名称、关键词、分类等多维度搜索,可使用ElasticSearch实现。

### 8.4 商品推荐

基于用户浏览、购买历史推荐相关商品。

### 8.5 预售/秒杀

支持商品预售、秒杀等特殊销售模式。
