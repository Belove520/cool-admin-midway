# 订单系统实现指南

## 一、概述

订单系统是电商平台的核心业务系统,负责处理用户下单、支付、发货、收货、售后等完整的交易流程。

### 1.1 功能特性

- **订单创建**:购物车下单、立即购买
- **订单支付**:支持微信、支付宝等多种支付方式
- **订单履约**:商家发货、物流跟踪、用户确认收货
- **订单售后**:退款、退货退款、换货
- **订单评价**:用户对订单商品进行评价
- **订单统计**:订单数据统计分析

### 1.2 订单状态流转

```
待付款 -> 待发货 -> 待收货 -> 待评价 -> 已完成
   |        |
   v        v
 已取消   售后中
```

## 二、数据库设计

### 2.1 订单主表 (order)

```sql
CREATE TABLE `order` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单号',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `merchant_id` bigint(20) NOT NULL COMMENT '商户ID',
  `goods_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '商品总额',
  `freight_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '运费',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '优惠金额',
  `pay_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '实付金额',
  `pay_points` int(11) NOT NULL DEFAULT '0' COMMENT '使用积分',
  `coupon_id` bigint(20) DEFAULT NULL COMMENT '优惠券ID',
  `coupon_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '优惠券金额',
  `status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '订单状态：0-待付款 1-待发货 2-待收货 3-待评价 4-已完成 5-已取消 6-售后中',
  `pay_status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '支付状态：0-未支付 1-已支付 2-已退款',
  `pay_type` tinyint(2) DEFAULT NULL COMMENT '支付方式：1-微信 2-支付宝 3-余额',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `pay_trade_no` varchar(64) DEFAULT NULL COMMENT '支付流水号',
  `deliver_type` tinyint(2) NOT NULL DEFAULT '1' COMMENT '配送方式：1-快递 2-自提',
  `deliver_time` datetime DEFAULT NULL COMMENT '发货时间',
  `receive_time` datetime DEFAULT NULL COMMENT '收货时间',
  `finish_time` datetime DEFAULT NULL COMMENT '完成时间',
  `cancel_time` datetime DEFAULT NULL COMMENT '取消时间',
  `cancel_reason` varchar(255) DEFAULT NULL COMMENT '取消原因',
  `remark` varchar(500) DEFAULT NULL COMMENT '订单备注',
  `buyer_message` varchar(500) DEFAULT NULL COMMENT '买家留言',
  `is_comment` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否评价：0-否 1-是',
  `is_delete` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除：0-否 1-是',
  `delete_time` datetime DEFAULT NULL COMMENT '删除时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_pay_status` (`pay_status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';
```

### 2.2 订单商品表 (order_goods)

```sql
CREATE TABLE `order_goods` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `order_id` bigint(20) NOT NULL COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单号',
  `goods_id` bigint(20) NOT NULL COMMENT '商品ID',
  `sku_id` bigint(20) DEFAULT NULL COMMENT 'SKU ID',
  `goods_name` varchar(200) NOT NULL COMMENT '商品名称',
  `goods_image` varchar(255) DEFAULT NULL COMMENT '商品图片',
  `goods_spec` varchar(500) DEFAULT NULL COMMENT '商品规格',
  `goods_price` decimal(10,2) NOT NULL COMMENT '商品单价',
  `goods_quantity` int(11) NOT NULL COMMENT '购买数量',
  `goods_amount` decimal(10,2) NOT NULL COMMENT '商品总价',
  `is_comment` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否评价：0-否 1-是',
  `refund_status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '退款状态：0-无退款 1-退款中 2-已退款',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品表';
```

### 2.3 订单收货地址表 (order_address)

```sql
CREATE TABLE `order_address` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `order_id` bigint(20) NOT NULL COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单号',
  `consignee` varchar(50) NOT NULL COMMENT '收货人',
  `phone` varchar(20) NOT NULL COMMENT '联系电话',
  `province` varchar(50) NOT NULL COMMENT '省份',
  `city` varchar(50) NOT NULL COMMENT '城市',
  `district` varchar(50) NOT NULL COMMENT '区县',
  `address` varchar(255) NOT NULL COMMENT '详细地址',
  `postal_code` varchar(10) DEFAULT NULL COMMENT '邮政编码',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_id` (`order_id`),
  KEY `idx_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单收货地址表';
```

### 2.4 订单物流表 (order_logistics)

```sql
CREATE TABLE `order_logistics` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '物流ID',
  `order_id` bigint(20) NOT NULL COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单号',
  `logistics_company` varchar(50) NOT NULL COMMENT '物流公司',
  `logistics_no` varchar(50) NOT NULL COMMENT '物流单号',
  `logistics_status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '物流状态：0-未发货 1-运输中 2-派送中 3-已签收 4-拒签',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_id` (`order_id`),
  KEY `idx_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单物流表';
```

### 2.5 订单退款表 (order_refund)

```sql
CREATE TABLE `order_refund` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '退款ID',
  `refund_no` varchar(32) NOT NULL COMMENT '退款单号',
  `order_id` bigint(20) NOT NULL COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单号',
  `order_goods_id` bigint(20) DEFAULT NULL COMMENT '订单商品ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `merchant_id` bigint(20) NOT NULL COMMENT '商户ID',
  `refund_type` tinyint(2) NOT NULL COMMENT '退款类型：1-仅退款 2-退货退款',
  `refund_reason` varchar(255) NOT NULL COMMENT '退款原因',
  `refund_amount` decimal(10,2) NOT NULL COMMENT '退款金额',
  `refund_quantity` int(11) NOT NULL DEFAULT '1' COMMENT '退款数量',
  `refund_images` text COMMENT '凭证图片(JSON数组)',
  `refund_desc` varchar(500) DEFAULT NULL COMMENT '退款说明',
  `status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '状态：0-待审核 1-审核通过 2-审核拒绝 3-退款中 4-已退款 5-已取消',
  `reject_reason` varchar(255) DEFAULT NULL COMMENT '拒绝原因',
  `logistics_company` varchar(50) DEFAULT NULL COMMENT '退货物流公司',
  `logistics_no` varchar(50) DEFAULT NULL COMMENT '退货物流单号',
  `audit_time` datetime DEFAULT NULL COMMENT '审核时间',
  `refund_time` datetime DEFAULT NULL COMMENT '退款完成时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_refund_no` (`refund_no`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单退款表';
```

### 2.6 订单评价表 (order_comment)

```sql
CREATE TABLE `order_comment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  `order_id` bigint(20) NOT NULL COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单号',
  `order_goods_id` bigint(20) NOT NULL COMMENT '订单商品ID',
  `goods_id` bigint(20) NOT NULL COMMENT '商品ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `merchant_id` bigint(20) NOT NULL COMMENT '商户ID',
  `score` tinyint(2) NOT NULL COMMENT '评分：1-5分',
  `content` varchar(500) DEFAULT NULL COMMENT '评价内容',
  `images` text COMMENT '评价图片(JSON数组)',
  `is_anonymous` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否匿名：0-否 1-是',
  `reply_content` varchar(500) DEFAULT NULL COMMENT '商家回复',
  `reply_time` datetime DEFAULT NULL COMMENT '回复时间',
  `is_show` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否显示：0-否 1-是',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评价时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_goods_id` (`goods_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_merchant_id` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单评价表';
```

## 三、Entity 实体类

### 3.1 订单实体 (order.ts)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单实体
 */
@Entity('order')
export class OrderEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '订单号', length: 32 })
  orderNo: string;

  @Index()
  @Column({ comment: '用户ID', type: 'bigint' })
  userId: number;

  @Index()
  @Column({ comment: '商户ID', type: 'bigint' })
  merchantId: number;

  @Column({ comment: '商品总额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  goodsAmount: number;

  @Column({ comment: '运费', type: 'decimal', precision: 10, scale: 2, default: 0 })
  freightAmount: number;

  @Column({ comment: '优惠金额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ comment: '实付金额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  payAmount: number;

  @Column({ comment: '使用积分', default: 0 })
  payPoints: number;

  @Column({ comment: '优惠券ID', type: 'bigint', nullable: true })
  couponId: number;

  @Column({ comment: '优惠券金额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  couponAmount: number;

  @Index()
  @Column({ comment: '订单状态：0-待付款 1-待发货 2-待收货 3-待评价 4-已完成 5-已取消 6-售后中', type: 'tinyint', default: 0 })
  status: number;

  @Index()
  @Column({ comment: '支付状态：0-未支付 1-已支付 2-已退款', type: 'tinyint', default: 0 })
  payStatus: number;

  @Column({ comment: '支付方式：1-微信 2-支付宝 3-余额', type: 'tinyint', nullable: true })
  payType: number;

  @Column({ comment: '支付时间', type: 'datetime', nullable: true })
  payTime: Date;

  @Column({ comment: '支付流水号', length: 64, nullable: true })
  payTradeNo: string;

  @Column({ comment: '配送方式：1-快递 2-自提', type: 'tinyint', default: 1 })
  deliverType: number;

  @Column({ comment: '发货时间', type: 'datetime', nullable: true })
  deliverTime: Date;

  @Column({ comment: '收货时间', type: 'datetime', nullable: true })
  receiveTime: Date;

  @Column({ comment: '完成时间', type: 'datetime', nullable: true })
  finishTime: Date;

  @Column({ comment: '取消时间', type: 'datetime', nullable: true })
  cancelTime: Date;

  @Column({ comment: '取消原因', nullable: true })
  cancelReason: string;

  @Column({ comment: '订单备注', length: 500, nullable: true })
  remark: string;

  @Column({ comment: '买家留言', length: 500, nullable: true })
  buyerMessage: string;

  @Column({ comment: '是否评价：0-否 1-是', type: 'tinyint', default: 0 })
  isComment: number;

  @Column({ comment: '是否删除：0-否 1-是', type: 'tinyint', default: 0 })
  isDelete: number;

  @Column({ comment: '删除时间', type: 'datetime', nullable: true })
  deleteTime: Date;
}
```

### 3.2 订单商品实体 (order-goods.ts)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单商品实体
 */
@Entity('order_goods')
export class OrderGoodsEntity extends BaseEntity {
  @Index()
  @Column({ comment: '订单ID', type: 'bigint' })
  orderId: number;

  @Index()
  @Column({ comment: '订单号', length: 32 })
  orderNo: string;

  @Index()
  @Column({ comment: '商品ID', type: 'bigint' })
  goodsId: number;

  @Column({ comment: 'SKU ID', type: 'bigint', nullable: true })
  skuId: number;

  @Column({ comment: '商品名称', length: 200 })
  goodsName: string;

  @Column({ comment: '商品图片', nullable: true })
  goodsImage: string;

  @Column({ comment: '商品规格', length: 500, nullable: true })
  goodsSpec: string;

  @Column({ comment: '商品单价', type: 'decimal', precision: 10, scale: 2 })
  goodsPrice: number;

  @Column({ comment: '购买数量' })
  goodsQuantity: number;

  @Column({ comment: '商品总价', type: 'decimal', precision: 10, scale: 2 })
  goodsAmount: number;

  @Column({ comment: '是否评价：0-否 1-是', type: 'tinyint', default: 0 })
  isComment: number;

  @Column({ comment: '退款状态：0-无退款 1-退款中 2-已退款', type: 'tinyint', default: 0 })
  refundStatus: number;
}
```

## 四、Service 服务层

### 4.1 订单服务 (order.ts)

```typescript
import { Provide, Inject, Config } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/service/base';
import { OrderEntity } from '../entity/order';
import { OrderGoodsEntity } from '../entity/order-goods';
import { OrderAddressEntity } from '../entity/order-address';
import { GoodsService } from '../../goods/service/goods';
import { UserAddressService } from '../../user/service/user-address';
import * as _ from 'lodash';

/**
 * 订单服务
 */
@Provide()
export class OrderService extends BaseService {
  @InjectEntityModel(OrderEntity)
  orderEntity: Repository<OrderEntity>;

  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  @InjectEntityModel(OrderAddressEntity)
  orderAddressEntity: Repository<OrderAddressEntity>;

  @Inject()
  goodsService: GoodsService;

  @Inject()
  userAddressService: UserAddressService;

  @Config('module.order')
  orderConfig;

  /**
   * 创建订单
   */
  async create(params: any, userId: number) {
    const { addressId, goods, couponId, payPoints, buyerMessage } = params;

    return await this.orderEntity.manager.transaction(async manager => {
      // 查询收货地址
      const address = await this.userAddressService.info(addressId);
      if (!address) {
        throw new Error('收货地址不存在');
      }

      // 计算订单金额
      let goodsAmount = 0;
      const orderGoods = [];

      for (const item of goods) {
        const { goodsId, skuId, quantity } = item;

        // 查询商品信息
        const goodsInfo = await this.goodsService.info(goodsId);
        if (!goodsInfo) {
          throw new Error('商品不存在');
        }

        if (goodsInfo.status !== 1) {
          throw new Error(`商品【${goodsInfo.goodsName}】已下架`);
        }

        let price = goodsInfo.price;
        let stock = goodsInfo.stock;
        let spec = '';

        // 如果是多规格商品,查询SKU信息
        if (skuId) {
          const skuInfo = await manager.findOne('GoodsSkuEntity', { where: { id: skuId } });
          if (!skuInfo) {
            throw new Error('商品规格不存在');
          }
          price = skuInfo.price;
          stock = skuInfo.stock;
          spec = JSON.parse(skuInfo.specValues);
        }

        // 检查库存
        if (stock < quantity) {
          throw new Error(`商品【${goodsInfo.goodsName}】库存不足`);
        }

        const amount = _.multiply(price, quantity);
        goodsAmount = _.add(goodsAmount, amount);

        orderGoods.push({
          goodsId,
          skuId,
          goodsName: goodsInfo.goodsName,
          goodsImage: goodsInfo.goodsImage,
          goodsSpec: spec,
          goodsPrice: price,
          goodsQuantity: quantity,
          goodsAmount: amount
        });
      }

      // 计算运费
      const freightAmount = 0; // TODO: 根据运费模板计算

      // 计算优惠金额
      let discountAmount = 0;
      let couponAmount = 0;

      // TODO: 处理优惠券
      if (couponId) {
        // 验证优惠券并计算优惠金额
      }

      // TODO: 处理积分抵扣
      if (payPoints) {
        // 计算积分抵扣金额
      }

      // 计算实付金额
      let payAmount = goodsAmount;
      payAmount = _.add(payAmount, freightAmount);
      payAmount = _.subtract(payAmount, discountAmount);
      payAmount = _.subtract(payAmount, couponAmount);

      if (payAmount < 0) {
        payAmount = 0;
      }

      // 生成订单号
      const orderNo = await this.generateOrderNo();

      // 创建订单
      const order = new OrderEntity();
      order.orderNo = orderNo;
      order.userId = userId;
      order.merchantId = orderGoods[0].merchantId || 1; // TODO: 处理多商户
      order.goodsAmount = goodsAmount;
      order.freightAmount = freightAmount;
      order.discountAmount = discountAmount;
      order.payAmount = payAmount;
      order.payPoints = payPoints || 0;
      order.couponId = couponId;
      order.couponAmount = couponAmount;
      order.buyerMessage = buyerMessage;
      order.status = 0; // 待付款
      order.payStatus = 0; // 未支付

      const savedOrder = await manager.save(OrderEntity, order);

      // 创建订单商品
      for (const item of orderGoods) {
        const orderGood = new OrderGoodsEntity();
        orderGood.orderId = savedOrder.id;
        orderGood.orderNo = orderNo;
        orderGood.goodsId = item.goodsId;
        orderGood.skuId = item.skuId;
        orderGood.goodsName = item.goodsName;
        orderGood.goodsImage = item.goodsImage;
        orderGood.goodsSpec = item.goodsSpec;
        orderGood.goodsPrice = item.goodsPrice;
        orderGood.goodsQuantity = item.goodsQuantity;
        orderGood.goodsAmount = item.goodsAmount;
        await manager.save(OrderGoodsEntity, orderGood);

        // 预占库存
        await this.goodsService.deductStock(
          item.goodsId,
          item.skuId,
          item.goodsQuantity,
          orderNo
        );
      }

      // 保存收货地址
      const orderAddress = new OrderAddressEntity();
      orderAddress.orderId = savedOrder.id;
      orderAddress.orderNo = orderNo;
      orderAddress.consignee = address.consignee;
      orderAddress.phone = address.phone;
      orderAddress.province = address.province;
      orderAddress.city = address.city;
      orderAddress.district = address.district;
      orderAddress.address = address.address;
      orderAddress.postalCode = address.postalCode;
      await manager.save(OrderAddressEntity, orderAddress);

      return savedOrder;
    });
  }

  /**
   * 支付订单
   */
  async pay(orderNo: string, payType: number, payTradeNo: string) {
    const order = await this.orderEntity.findOne({ where: { orderNo } });
    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status !== 0) {
      throw new Error('订单状态不正确');
    }

    if (order.payStatus !== 0) {
      throw new Error('订单已支付');
    }

    order.status = 1; // 待发货
    order.payStatus = 1; // 已支付
    order.payType = payType;
    order.payTime = new Date();
    order.payTradeNo = payTradeNo;

    return await this.orderEntity.save(order);
  }

  /**
   * 取消订单
   */
  async cancel(orderNo: string, userId: number, cancelReason: string) {
    const order = await this.orderEntity.findOne({ where: { orderNo, userId } });
    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status !== 0) {
      throw new Error('该订单不能取消');
    }

    return await this.orderEntity.manager.transaction(async manager => {
      order.status = 5; // 已取消
      order.cancelTime = new Date();
      order.cancelReason = cancelReason;
      await manager.save(OrderEntity, order);

      // 释放库存
      const orderGoods = await manager.find(OrderGoodsEntity, { where: { orderId: order.id } });
      for (const item of orderGoods) {
        await this.goodsService.addStock(
          item.goodsId,
          item.skuId,
          item.goodsQuantity,
          orderNo
        );
      }

      return order;
    });
  }

  /**
   * 确认收货
   */
  async receive(orderNo: string, userId: number) {
    const order = await this.orderEntity.findOne({ where: { orderNo, userId } });
    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status !== 2) {
      throw new Error('订单状态不正确');
    }

    order.status = 3; // 待评价
    order.receiveTime = new Date();

    return await this.orderEntity.save(order);
  }

  /**
   * 生成订单号
   */
  private async generateOrderNo(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`;
  }
}
```

## 五、Controller 控制器

### 5.1 订单控制器 (order.ts)

```typescript
import { Body, Controller, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseController } from '../../../base/controller/base';
import { OrderService } from '../../service/order';

/**
 * 订单控制器（用户端）
 */
@Controller('/app/order')
export class AppOrderController extends BaseController {
  @Inject()
  orderService: OrderService;

  /**
   * 创建订单
   */
  @Post('/create')
  async create(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const result = await this.orderService.create(body, userId);
    return this.ok(result);
  }

  /**
   * 我的订单列表
   */
  @Post('/myPage')
  async myPage(@Body() body: any) {
    const userId = this.ctx.user.userId;
    body.userId = userId;
    body.isDelete = 0;
    const result = await this.orderService.page(body);
    return this.ok(result);
  }

  /**
   * 订单详情
   */
  @Get('/info')
  async info(@Query('orderNo') orderNo: string) {
    const userId = this.ctx.user.userId;
    const order = await this.orderService.info({ orderNo, userId });
    return this.ok(order);
  }

  /**
   * 取消订单
   */
  @Post('/cancel')
  async cancel(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const { orderNo, cancelReason } = body;
    await this.orderService.cancel(orderNo, userId, cancelReason);
    return this.ok();
  }

  /**
   * 确认收货
   */
  @Post('/receive')
  async receive(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const { orderNo } = body;
    await this.orderService.receive(orderNo, userId);
    return this.ok();
  }

  /**
   * 删除订单
   */
  @Post('/delete')
  async delete(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const { orderNo } = body;
    await this.orderService.update({ orderNo, userId }, { isDelete: 1, deleteTime: new Date() });
    return this.ok();
  }
}

/**
 * 订单管理控制器（商户端）
 */
@Controller('/merchant/order')
export class MerchantOrderController extends BaseController {
  @Inject()
  orderService: OrderService;

  /**
   * 订单列表
   */
  @Post('/page')
  async page(@Body() body: any) {
    const merchantId = this.ctx.merchant.merchantId;
    body.merchantId = merchantId;
    const result = await this.orderService.page(body);
    return this.ok(result);
  }

  /**
   * 发货
   */
  @Post('/deliver')
  async deliver(@Body() body: any) {
    const merchantId = this.ctx.merchant.merchantId;
    const { orderNo, logisticsCompany, logisticsNo } = body;
    await this.orderService.deliver(orderNo, merchantId, logisticsCompany, logisticsNo);
    return this.ok();
  }
}
```

## 六、注意事项

### 6.1 库存管理

1. 创建订单时预占库存
2. 支付成功不再扣库存(已预占)
3. 取消订单或超时未支付要释放库存
4. 退款退货要恢复库存

### 6.2 金额计算

1. 使用 `lodash` 的数学方法避免浮点数精度问题
2. 金额计算顺序:商品总额 + 运费 - 优惠金额 - 优惠券 - 积分抵扣
3. 实付金额不能为负数

### 6.3 订单状态

1. 订单状态变更要严格校验
2. 记录关键时间节点
3. 状态变更后要触发相应的业务逻辑

### 6.4 分布式事务

对于跨服务的操作(如扣积分、扣优惠券等),要考虑分布式事务的一致性问题,可以使用:
- 本地消息表
- TCC模式
- SAGA模式

## 七、扩展功能

1. **订单超时自动取消**:定时任务检查未支付订单
2. **自动确认收货**:发货N天后自动确认收货
3. **订单推送**:订单状态变更推送给用户和商户
4. **电子面单**:对接菜鸟等电子面单系统
5. **订单导出**:支持订单数据导出Excel
