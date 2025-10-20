# 优惠券系统实现指南

## 一、概述

优惠券系统是电商平台常用的营销工具,通过发放优惠券刺激用户消费,提高用户活跃度和复购率。

### 1.1 功能特性

- **优惠券类型**:满减券、折扣券、无门槛券
- **发放方式**:后台发放、用户领取、新人券、生日券
- **使用规则**:商品范围、使用时间、使用门槛
- **领券中心**:用户主动领取优惠券
- **券码兑换**:通过券码兑换优惠券
- **优惠叠加**:多张优惠券叠加使用规则

## 二、数据库设计

### 2.1 优惠券模板表 (coupon_template)

```sql
CREATE TABLE `coupon_template` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  `template_name` varchar(100) NOT NULL COMMENT '模板名称',
  `coupon_type` tinyint(2) NOT NULL COMMENT '优惠券类型：1-满减券 2-折扣券 3-无门槛券',
  `discount_type` tinyint(2) NOT NULL COMMENT '优惠方式：1-金额 2-折扣',
  `discount_value` decimal(10,2) NOT NULL COMMENT '优惠值(金额或折扣)',
  `min_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '使用门槛(满X元可用)',
  `max_discount` decimal(10,2) DEFAULT NULL COMMENT '最大优惠金额(折扣券)',
  `total_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '发行总量(0-不限制)',
  `remain_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '剩余数量',
  `receive_limit` int(11) NOT NULL DEFAULT '1' COMMENT '每人限领数量(0-不限制)',
  `use_scene` tinyint(2) NOT NULL DEFAULT '1' COMMENT '使用场景：1-全场通用 2-指定商品 3-指定分类',
  `goods_ids` text COMMENT '指定商品ID(JSON数组)',
  `category_ids` text COMMENT '指定分类ID(JSON数组)',
  `valid_type` tinyint(2) NOT NULL COMMENT '有效期类型：1-固定时间 2-领取后N天',
  `valid_days` int(11) DEFAULT NULL COMMENT '有效天数',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `grant_type` tinyint(2) NOT NULL COMMENT '发放方式：1-手动发放 2-用户领取 3-新人券 4-生日券',
  `status` tinyint(2) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用 1-启用',
  `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_grant_type` (`grant_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券模板表';
```

### 2.2 用户优惠券表 (user_coupon)

```sql
CREATE TABLE `user_coupon` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户券ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `template_id` bigint(20) NOT NULL COMMENT '模板ID',
  `coupon_code` varchar(32) NOT NULL COMMENT '优惠券码',
  `coupon_name` varchar(100) NOT NULL COMMENT '优惠券名称',
  `coupon_type` tinyint(2) NOT NULL COMMENT '优惠券类型：1-满减券 2-折扣券 3-无门槛券',
  `discount_type` tinyint(2) NOT NULL COMMENT '优惠方式：1-金额 2-折扣',
  `discount_value` decimal(10,2) NOT NULL COMMENT '优惠值',
  `min_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '使用门槛',
  `max_discount` decimal(10,2) DEFAULT NULL COMMENT '最大优惠金额',
  `use_scene` tinyint(2) NOT NULL DEFAULT '1' COMMENT '使用场景：1-全场通用 2-指定商品 3-指定分类',
  `goods_ids` text COMMENT '指定商品ID',
  `category_ids` text COMMENT '指定分类ID',
  `status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '状态：0-未使用 1-已使用 2-已过期',
  `receive_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `start_time` datetime NOT NULL COMMENT '生效时间',
  `end_time` datetime NOT NULL COMMENT '失效时间',
  `use_time` datetime DEFAULT NULL COMMENT '使用时间',
  `order_no` varchar(32) DEFAULT NULL COMMENT '使用订单号',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coupon_code` (`coupon_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券表';
```

### 2.3 优惠券领取记录表 (coupon_receive_log)

```sql
CREATE TABLE `coupon_receive_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `template_id` bigint(20) NOT NULL COMMENT '模板ID',
  `user_coupon_id` bigint(20) NOT NULL COMMENT '用户券ID',
  `receive_type` tinyint(2) NOT NULL COMMENT '领取方式：1-手动发放 2-用户领取 3-新人券 4-生日券',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_template_id` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券领取记录表';
```

### 2.4 优惠券兑换码表 (coupon_exchange_code)

```sql
CREATE TABLE `coupon_exchange_code` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '兑换码ID',
  `template_id` bigint(20) NOT NULL COMMENT '模板ID',
  `exchange_code` varchar(32) NOT NULL COMMENT '兑换码',
  `total_quantity` int(11) NOT NULL DEFAULT '1' COMMENT '兑换数量',
  `used_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '已兑换数量',
  `status` tinyint(2) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用 1-启用',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime NOT NULL COMMENT '结束时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exchange_code` (`exchange_code`),
  KEY `idx_template_id` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券兑换码表';
```

## 三、Entity 实体类

### 3.1 优惠券模板实体 (coupon-template.ts)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 优惠券模板实体
 */
@Entity('coupon_template')
export class CouponTemplateEntity extends BaseEntity {
  @Column({ comment: '模板名称', length: 100 })
  templateName: string;

  @Column({ comment: '优惠券类型：1-满减券 2-折扣券 3-无门槛券', type: 'tinyint' })
  couponType: number;

  @Column({ comment: '优惠方式：1-金额 2-折扣', type: 'tinyint' })
  discountType: number;

  @Column({ comment: '优惠值', type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ comment: '使用门槛', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minAmount: number;

  @Column({ comment: '最大优惠金额', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscount: number;

  @Column({ comment: '发行总量(0-不限制)', default: 0 })
  totalQuantity: number;

  @Column({ comment: '剩余数量', default: 0 })
  remainQuantity: number;

  @Column({ comment: '每人限领数量(0-不限制)', default: 1 })
  receiveLimit: number;

  @Column({ comment: '使用场景：1-全场通用 2-指定商品 3-指定分类', type: 'tinyint', default: 1 })
  useScene: number;

  @Column({ comment: '指定商品ID(JSON数组)', type: 'text', nullable: true })
  goodsIds: string;

  @Column({ comment: '指定分类ID(JSON数组)', type: 'text', nullable: true })
  categoryIds: string;

  @Column({ comment: '有效期类型：1-固定时间 2-领取后N天', type: 'tinyint' })
  validType: number;

  @Column({ comment: '有效天数', nullable: true })
  validDays: number;

  @Column({ comment: '开始时间', type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ comment: '结束时间', type: 'datetime', nullable: true })
  endTime: Date;

  @Index()
  @Column({ comment: '发放方式：1-手动发放 2-用户领取 3-新人券 4-生日券', type: 'tinyint' })
  grantType: number;

  @Index()
  @Column({ comment: '状态：0-禁用 1-启用', type: 'tinyint', default: 1 })
  status: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '备注', length: 500, nullable: true })
  remark: string;
}
```

### 3.2 用户优惠券实体 (user-coupon.ts)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 用户优惠券实体
 */
@Entity('user_coupon')
export class UserCouponEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID', type: 'bigint' })
  userId: number;

  @Index()
  @Column({ comment: '模板ID', type: 'bigint' })
  templateId: number;

  @Index({ unique: true })
  @Column({ comment: '优惠券码', length: 32 })
  couponCode: string;

  @Column({ comment: '优惠券名称', length: 100 })
  couponName: string;

  @Column({ comment: '优惠券类型：1-满减券 2-折扣券 3-无门槛券', type: 'tinyint' })
  couponType: number;

  @Column({ comment: '优惠方式：1-金额 2-折扣', type: 'tinyint' })
  discountType: number;

  @Column({ comment: '优惠值', type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ comment: '使用门槛', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minAmount: number;

  @Column({ comment: '最大优惠金额', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscount: number;

  @Column({ comment: '使用场景：1-全场通用 2-指定商品 3-指定分类', type: 'tinyint', default: 1 })
  useScene: number;

  @Column({ comment: '指定商品ID', type: 'text', nullable: true })
  goodsIds: string;

  @Column({ comment: '指定分类ID', type: 'text', nullable: true })
  categoryIds: string;

  @Index()
  @Column({ comment: '状态：0-未使用 1-已使用 2-已过期', type: 'tinyint', default: 0 })
  status: number;

  @Column({ comment: '领取时间', type: 'datetime' })
  receiveTime: Date;

  @Column({ comment: '生效时间', type: 'datetime' })
  startTime: Date;

  @Column({ comment: '失效时间', type: 'datetime' })
  endTime: Date;

  @Column({ comment: '使用时间', type: 'datetime', nullable: true })
  useTime: Date;

  @Column({ comment: '使用订单号', length: 32, nullable: true })
  orderNo: string;
}
```

## 四、Service 服务层

### 4.1 优惠券服务 (coupon.ts)

```typescript
import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, In } from 'typeorm';
import { BaseService } from '../../base/service/base';
import { CouponTemplateEntity } from '../entity/coupon-template';
import { UserCouponEntity } from '../entity/user-coupon';
import { CouponReceiveLogEntity } from '../entity/coupon-receive-log';
import * as dayjs from 'dayjs';
import * as _ from 'lodash';

/**
 * 优惠券服务
 */
@Provide()
export class CouponService extends BaseService {
  @InjectEntityModel(CouponTemplateEntity)
  couponTemplateEntity: Repository<CouponTemplateEntity>;

  @InjectEntityModel(UserCouponEntity)
  userCouponEntity: Repository<UserCouponEntity>;

  @InjectEntityModel(CouponReceiveLogEntity)
  couponReceiveLogEntity: Repository<CouponReceiveLogEntity>;

  /**
   * 用户领取优惠券
   */
  async receive(templateId: number, userId: number) {
    return await this.couponTemplateEntity.manager.transaction(async manager => {
      // 查询模板(加锁)
      const template = await manager.findOne(CouponTemplateEntity, {
        where: { id: templateId },
        lock: { mode: 'pessimistic_write' }
      });

      if (!template) {
        throw new Error('优惠券不存在');
      }

      if (template.status !== 1) {
        throw new Error('优惠券已禁用');
      }

      // 检查数量
      if (template.totalQuantity > 0 && template.remainQuantity <= 0) {
        throw new Error('优惠券已抢光');
      }

      // 检查领取限制
      if (template.receiveLimit > 0) {
        const receiveCount = await manager.count(CouponReceiveLogEntity, {
          where: { userId, templateId }
        });
        if (receiveCount >= template.receiveLimit) {
          throw new Error(`每人限领${template.receiveLimit}张`);
        }
      }

      // 计算有效期
      let startTime: Date;
      let endTime: Date;

      if (template.validType === 1) {
        // 固定时间
        startTime = template.startTime;
        endTime = template.endTime;
      } else {
        // 领取后N天
        startTime = new Date();
        endTime = dayjs().add(template.validDays, 'day').toDate();
      }

      // 生成优惠券码
      const couponCode = await this.generateCouponCode();

      // 创建用户优惠券
      const userCoupon = new UserCouponEntity();
      userCoupon.userId = userId;
      userCoupon.templateId = templateId;
      userCoupon.couponCode = couponCode;
      userCoupon.couponName = template.templateName;
      userCoupon.couponType = template.couponType;
      userCoupon.discountType = template.discountType;
      userCoupon.discountValue = template.discountValue;
      userCoupon.minAmount = template.minAmount;
      userCoupon.maxDiscount = template.maxDiscount;
      userCoupon.useScene = template.useScene;
      userCoupon.goodsIds = template.goodsIds;
      userCoupon.categoryIds = template.categoryIds;
      userCoupon.receiveTime = new Date();
      userCoupon.startTime = startTime;
      userCoupon.endTime = endTime;
      userCoupon.status = 0; // 未使用

      const savedUserCoupon = await manager.save(UserCouponEntity, userCoupon);

      // 减少剩余数量
      if (template.totalQuantity > 0) {
        template.remainQuantity -= 1;
        await manager.save(CouponTemplateEntity, template);
      }

      // 记录领取日志
      const log = new CouponReceiveLogEntity();
      log.userId = userId;
      log.templateId = templateId;
      log.userCouponId = savedUserCoupon.id;
      log.receiveType = 2; // 用户领取
      await manager.save(CouponReceiveLogEntity, log);

      return savedUserCoupon;
    });
  }

  /**
   * 使用优惠券
   */
  async use(couponId: number, userId: number, orderNo: string) {
    const userCoupon = await this.userCouponEntity.findOne({
      where: { id: couponId, userId }
    });

    if (!userCoupon) {
      throw new Error('优惠券不存在');
    }

    if (userCoupon.status !== 0) {
      throw new Error('优惠券不可用');
    }

    const now = new Date();
    if (now < userCoupon.startTime) {
      throw new Error('优惠券未生效');
    }

    if (now > userCoupon.endTime) {
      throw new Error('优惠券已过期');
    }

    userCoupon.status = 1; // 已使用
    userCoupon.useTime = now;
    userCoupon.orderNo = orderNo;

    return await this.userCouponEntity.save(userCoupon);
  }

  /**
   * 计算优惠金额
   */
  async calculateDiscount(couponId: number, userId: number, goodsAmount: number, goodsIds: number[]) {
    const userCoupon = await this.userCouponEntity.findOne({
      where: { id: couponId, userId }
    });

    if (!userCoupon) {
      throw new Error('优惠券不存在');
    }

    if (userCoupon.status !== 0) {
      throw new Error('优惠券不可用');
    }

    // 检查使用门槛
    if (goodsAmount < userCoupon.minAmount) {
      throw new Error(`订单金额需满${userCoupon.minAmount}元`);
    }

    // 检查使用场景
    if (userCoupon.useScene === 2) {
      // 指定商品
      const allowGoodsIds = JSON.parse(userCoupon.goodsIds || '[]');
      const hasValidGoods = goodsIds.some(id => allowGoodsIds.includes(id));
      if (!hasValidGoods) {
        throw new Error('优惠券不适用于当前商品');
      }
    } else if (userCoupon.useScene === 3) {
      // 指定分类
      // TODO: 检查商品分类
    }

    let discountAmount = 0;

    if (userCoupon.discountType === 1) {
      // 金额优惠
      discountAmount = userCoupon.discountValue;
    } else if (userCoupon.discountType === 2) {
      // 折扣优惠
      const discount = _.divide(userCoupon.discountValue, 10); // 8折 = 0.8
      discountAmount = _.multiply(goodsAmount, _.subtract(1, discount));
      discountAmount = Math.floor(discountAmount * 100) / 100; // 保留2位小数

      // 检查最大优惠金额
      if (userCoupon.maxDiscount && discountAmount > userCoupon.maxDiscount) {
        discountAmount = userCoupon.maxDiscount;
      }
    }

    // 优惠金额不能超过订单金额
    if (discountAmount > goodsAmount) {
      discountAmount = goodsAmount;
    }

    return {
      couponId: userCoupon.id,
      couponName: userCoupon.couponName,
      discountAmount
    };
  }

  /**
   * 获取用户可用优惠券
   */
  async getAvailableCoupons(userId: number, goodsAmount: number, goodsIds: number[]) {
    const now = new Date();

    const coupons = await this.userCouponEntity.find({
      where: {
        userId,
        status: 0
      },
      order: {
        discountValue: 'DESC'
      }
    });

    const availableCoupons = [];

    for (const coupon of coupons) {
      // 检查时间
      if (now < coupon.startTime || now > coupon.endTime) {
        continue;
      }

      // 检查使用门槛
      if (goodsAmount < coupon.minAmount) {
        continue;
      }

      // 检查使用场景
      if (coupon.useScene === 2) {
        const allowGoodsIds = JSON.parse(coupon.goodsIds || '[]');
        const hasValidGoods = goodsIds.some(id => allowGoodsIds.includes(id));
        if (!hasValidGoods) {
          continue;
        }
      }

      // 计算优惠金额
      let discountAmount = 0;
      if (coupon.discountType === 1) {
        discountAmount = coupon.discountValue;
      } else if (coupon.discountType === 2) {
        const discount = _.divide(coupon.discountValue, 10);
        discountAmount = _.multiply(goodsAmount, _.subtract(1, discount));
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      }

      availableCoupons.push({
        ...coupon,
        discountAmount
      });
    }

    return availableCoupons;
  }

  /**
   * 过期优惠券处理
   */
  async expireCoupons() {
    const now = new Date();
    await this.userCouponEntity.update(
      {
        status: 0,
        endTime: In([now]) // endTime < now
      },
      {
        status: 2 // 已过期
      }
    );
  }

  /**
   * 生成优惠券码
   */
  private async generateCouponCode(): Promise<string> {
    const prefix = 'C';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;
  }
}
```

## 五、Controller 控制器

### 5.1 优惠券控制器 (coupon.ts)

```typescript
import { Body, Controller, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseController } from '../../../base/controller/base';
import { CouponService } from '../../service/coupon';

/**
 * 优惠券控制器（用户端）
 */
@Controller('/app/coupon')
export class AppCouponController extends BaseController {
  @Inject()
  couponService: CouponService;

  /**
   * 领券中心
   */
  @Get('/center')
  async center() {
    const result = await this.couponService.list({
      grantType: 2, // 用户领取
      status: 1
    });
    return this.ok(result);
  }

  /**
   * 领取优惠券
   */
  @Post('/receive')
  async receive(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const { templateId } = body;
    const result = await this.couponService.receive(templateId, userId);
    return this.ok(result);
  }

  /**
   * 我的优惠券
   */
  @Get('/my')
  async my(@Query('status') status: number) {
    const userId = this.ctx.user.userId;
    const query: any = { userId };
    if (status !== undefined) {
      query.status = status;
    }
    const result = await this.couponService.list(query);
    return this.ok(result);
  }

  /**
   * 获取可用优惠券
   */
  @Post('/available')
  async available(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const { goodsAmount, goodsIds } = body;
    const result = await this.couponService.getAvailableCoupons(userId, goodsAmount, goodsIds);
    return this.ok(result);
  }
}

/**
 * 优惠券管理控制器（后台）
 */
@Controller('/admin/coupon/template')
export class AdminCouponTemplateController extends BaseController {
  @Inject()
  couponService: CouponService;

  /**
   * 分页查询
   */
  @Post('/page')
  async page(@Body() body: any) {
    const result = await this.couponService.page(body);
    return this.ok(result);
  }

  /**
   * 新增
   */
  @Post('/add')
  async add(@Body() body: any) {
    await this.couponService.add(body);
    return this.ok();
  }

  /**
   * 编辑
   */
  @Post('/update')
  async update(@Body() body: any) {
    await this.couponService.update(body);
    return this.ok();
  }

  /**
   * 删除
   */
  @Post('/delete')
  async delete(@Body() body: any) {
    await this.couponService.delete(body.ids);
    return this.ok();
  }
}
```

## 六、前端对接

### 6.1 API 接口列表

#### 用户端接口

```
GET  /app/coupon/center      - 领券中心
POST /app/coupon/receive     - 领取优惠券
GET  /app/coupon/my          - 我的优惠券
POST /app/coupon/available   - 获取可用优惠券
```

#### 管理端接口

```
POST /admin/coupon/template/page    - 分页查询
POST /admin/coupon/template/add     - 新增模板
POST /admin/coupon/template/update  - 编辑模板
POST /admin/coupon/template/delete  - 删除模板
```

### 6.2 请求示例

**创建满减券**

```json
POST /admin/coupon/template/add
{
  "templateName": "满100减20券",
  "couponType": 1,
  "discountType": 1,
  "discountValue": 20,
  "minAmount": 100,
  "totalQuantity": 1000,
  "receiveLimit": 1,
  "useScene": 1,
  "validType": 1,
  "startTime": "2024-01-01 00:00:00",
  "endTime": "2024-12-31 23:59:59",
  "grantType": 2,
  "status": 1
}
```

**创建折扣券**

```json
POST /admin/coupon/template/add
{
  "templateName": "8折券",
  "couponType": 2,
  "discountType": 2,
  "discountValue": 8,
  "minAmount": 0,
  "maxDiscount": 50,
  "totalQuantity": 500,
  "receiveLimit": 1,
  "useScene": 1,
  "validType": 2,
  "validDays": 7,
  "grantType": 2,
  "status": 1
}
```

**领取优惠券**

```json
POST /app/coupon/receive
{
  "templateId": 1
}
```

**获取可用优惠券**

```json
POST /app/coupon/available
{
  "goodsAmount": 199,
  "goodsIds": [1, 2, 3]
}
```

## 七、定时任务

### 7.1 过期优惠券处理 (expire-coupon.ts)

```typescript
import { Inject, Provide, TaskLocal } from '@midwayjs/core';
import { CouponService } from '../service/coupon';

@Provide()
export class ExpireCouponTask {
  @Inject()
  couponService: CouponService;

  /**
   * 每小时执行一次过期优惠券处理
   */
  @TaskLocal('0 0 * * * *')
  async expireCoupons() {
    console.log('[过期优惠券处理] 开始执行');
    try {
      await this.couponService.expireCoupons();
      console.log('[过期优惠券处理] 执行成功');
    } catch (error) {
      console.error('[过期优惠券处理] 执行失败:', error);
    }
  }
}
```

## 八、注意事项

### 8.1 并发控制

1. 领取优惠券时要使用**数据库悲观锁**
2. 检查剩余数量避免超发
3. 使用事务保证数据一致性

### 8.2 优惠计算

1. 使用 `lodash` 数学方法避免精度问题
2. 折扣券要设置最大优惠金额
3. 优惠金额不能超过订单金额

### 8.3 券的使用限制

1. 检查券的有效期
2. 检查使用门槛(满X元)
3. 检查使用场景(商品/分类限制)
4. 检查领取限制(每人限领)

### 8.4 性能优化

1. 优惠券列表可以使用Redis缓存
2. 用户优惠券数量建议建立索引
3. 定期清理过期的优惠券数据

## 九、扩展功能

### 9.1 优惠券包

多张优惠券打包发放,用户一键领取多张券。

### 9.2 优惠券红包

用户邀请好友注册,好友可以领取红包券。

### 9.3 定向发券

针对特定用户群体(如新用户、高价值用户)定向发放优惠券。

### 9.4 优惠券分享

用户可以将优惠券分享给好友。

### 9.5 优惠券统计

统计优惠券的领取率、使用率、带来的订单转化等数据。

## 十、优惠叠加规则

在实际业务中,需要明确优惠的叠加规则:

```
计算顺序:
1. 商品原价
2. 商品促销价(活动价)
3. 店铺优惠券
4. 平台优惠券
5. 积分抵扣
6. 会员折扣

一般规则:
- 优惠券只能使用一张
- 优惠券与积分可以叠加
- 满减活动与折扣活动不叠加
```
