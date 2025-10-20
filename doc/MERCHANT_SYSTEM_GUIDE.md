# 多商户系统实现指南

## 一、概述

多商户系统是商城的核心功能之一，支持商户入驻、店铺管理、商品管理、订单处理、财务结算等完整的商户运营功能。

### 1.1 功能特性

- **商户入驻**：支持商户在线申请入驻
- **店铺管理**：店铺信息、装修、设置
- **商品管理**：商品发布、编辑、上下架
- **订单管理**：订单查看、发货、售后处理
- **财务管理**：账户余额、提现、账单查询
- **数据统计**：销售数据、商品数据、流量数据

## 二、数据库设计

### 2.1 商户基本信息表 (merchant)

```sql
CREATE TABLE `merchant` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '商户ID',
  `merchant_no` varchar(32) NOT NULL COMMENT '商户编号',
  `merchant_name` varchar(100) NOT NULL COMMENT '商户名称',
  `merchant_type` tinyint(2) NOT NULL DEFAULT '1' COMMENT '商户类型：1-个人 2-企业',
  `contact_name` varchar(50) NOT NULL COMMENT '联系人姓名',
  `contact_phone` varchar(20) NOT NULL COMMENT '联系电话',
  `contact_email` varchar(100) DEFAULT NULL COMMENT '联系邮箱',
  `id_card_no` varchar(18) DEFAULT NULL COMMENT '身份证号',
  `id_card_front` varchar(255) DEFAULT NULL COMMENT '身份证正面',
  `id_card_back` varchar(255) DEFAULT NULL COMMENT '身份证反面',
  `business_license` varchar(255) DEFAULT NULL COMMENT '营业执照',
  `province` varchar(50) DEFAULT NULL COMMENT '省份',
  `city` varchar(50) DEFAULT NULL COMMENT '城市',
  `district` varchar(50) DEFAULT NULL COMMENT '区县',
  `address` varchar(255) DEFAULT NULL COMMENT '详细地址',
  `status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '状态：0-待审核 1-审核通过 2-审核拒绝 3-已禁用',
  `reject_reason` varchar(255) DEFAULT NULL COMMENT '拒绝原因',
  `user_id` bigint(20) NOT NULL COMMENT '关联用户ID',
  `commission_rate` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '平台抽佣比例(%)',
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '账户余额',
  `frozen_balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '冻结余额',
  `total_sales` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '累计销售额',
  `settle_cycle` tinyint(2) NOT NULL DEFAULT '7' COMMENT '结算周期(天)',
  `audit_time` datetime DEFAULT NULL COMMENT '审核时间',
  `audit_user_id` bigint(20) DEFAULT NULL COMMENT '审核人ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_merchant_no` (`merchant_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户信息表';
```

### 2.2 店铺信息表 (merchant_shop)

```sql
CREATE TABLE `merchant_shop` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '店铺ID',
  `merchant_id` bigint(20) NOT NULL COMMENT '商户ID',
  `shop_name` varchar(100) NOT NULL COMMENT '店铺名称',
  `shop_logo` varchar(255) DEFAULT NULL COMMENT '店铺Logo',
  `shop_banner` varchar(255) DEFAULT NULL COMMENT '店铺Banner',
  `shop_desc` varchar(500) DEFAULT NULL COMMENT '店铺描述',
  `shop_notice` varchar(500) DEFAULT NULL COMMENT '店铺公告',
  `business_hours` varchar(100) DEFAULT NULL COMMENT '营业时间',
  `service_phone` varchar(20) DEFAULT NULL COMMENT '客服电话',
  `province` varchar(50) DEFAULT NULL COMMENT '省份',
  `city` varchar(50) DEFAULT NULL COMMENT '城市',
  `district` varchar(50) DEFAULT NULL COMMENT '区县',
  `address` varchar(255) DEFAULT NULL COMMENT '详细地址',
  `longitude` decimal(10,6) DEFAULT NULL COMMENT '经度',
  `latitude` decimal(10,6) DEFAULT NULL COMMENT '纬度',
  `score_service` decimal(3,1) DEFAULT '5.0' COMMENT '服务评分',
  `score_goods` decimal(3,1) DEFAULT '5.0' COMMENT '商品评分',
  `score_logistics` decimal(3,1) DEFAULT '5.0' COMMENT '物流评分',
  `total_sales` int(11) NOT NULL DEFAULT '0' COMMENT '总销量',
  `total_goods` int(11) NOT NULL DEFAULT '0' COMMENT '商品数量',
  `view_count` int(11) NOT NULL DEFAULT '0' COMMENT '浏览量',
  `favorite_count` int(11) NOT NULL DEFAULT '0' COMMENT '收藏量',
  `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `status` tinyint(2) NOT NULL DEFAULT '1' COMMENT '状态：0-关闭 1-营业中',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店铺信息表';
```

### 2.3 商户财务账户表 (merchant_account)

```sql
CREATE TABLE `merchant_account` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '账户ID',
  `merchant_id` bigint(20) NOT NULL COMMENT '商户ID',
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '可用余额',
  `frozen_balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '冻结余额',
  `total_income` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '累计收入',
  `total_withdraw` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '累计提现',
  `total_commission` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '累计佣金',
  `pending_settle` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '待结算金额',
  `version` int(11) NOT NULL DEFAULT '0' COMMENT '乐观锁版本号',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_merchant_id` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户财务账户表';
```

### 2.4 商户资金流水表 (merchant_account_log)

```sql
CREATE TABLE `merchant_account_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '流水ID',
  `merchant_id` bigint(20) NOT NULL COMMENT '商户ID',
  `log_no` varchar(32) NOT NULL COMMENT '流水号',
  `change_type` tinyint(2) NOT NULL COMMENT '变动类型：1-订单收入 2-提现 3-佣金扣除 4-退款 5-平台充值',
  `amount` decimal(10,2) NOT NULL COMMENT '变动金额',
  `balance_before` decimal(10,2) NOT NULL COMMENT '变动前余额',
  `balance_after` decimal(10,2) NOT NULL COMMENT '变动后余额',
  `relate_no` varchar(32) DEFAULT NULL COMMENT '关联单号',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_log_no` (`log_no`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_change_type` (`change_type`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户资金流水表';
```

### 2.5 商户提现记录表 (merchant_withdraw)

```sql
CREATE TABLE `merchant_withdraw` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '提现ID',
  `merchant_id` bigint(20) NOT NULL COMMENT '商户ID',
  `withdraw_no` varchar(32) NOT NULL COMMENT '提现单号',
  `amount` decimal(10,2) NOT NULL COMMENT '提现金额',
  `fee` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '手续费',
  `real_amount` decimal(10,2) NOT NULL COMMENT '实际到账金额',
  `bank_name` varchar(100) NOT NULL COMMENT '银行名称',
  `bank_account` varchar(50) NOT NULL COMMENT '银行账号',
  `account_name` varchar(50) NOT NULL COMMENT '账户名称',
  `status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '状态：0-待审核 1-审核通过 2-审核拒绝 3-已打款 4-打款失败',
  `reject_reason` varchar(255) DEFAULT NULL COMMENT '拒绝原因',
  `audit_time` datetime DEFAULT NULL COMMENT '审核时间',
  `audit_user_id` bigint(20) DEFAULT NULL COMMENT '审核人ID',
  `pay_time` datetime DEFAULT NULL COMMENT '打款时间',
  `pay_voucher` varchar(255) DEFAULT NULL COMMENT '打款凭证',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_withdraw_no` (`withdraw_no`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户提现记录表';
```

### 2.6 商户结算记录表 (merchant_settlement)

```sql
CREATE TABLE `merchant_settlement` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '结算ID',
  `merchant_id` bigint(20) NOT NULL COMMENT '商户ID',
  `settlement_no` varchar(32) NOT NULL COMMENT '结算单号',
  `start_date` date NOT NULL COMMENT '结算开始日期',
  `end_date` date NOT NULL COMMENT '结算结束日期',
  `order_count` int(11) NOT NULL DEFAULT '0' COMMENT '订单数量',
  `order_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '订单总额',
  `commission_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '佣金金额',
  `refund_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '退款金额',
  `settlement_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '结算金额',
  `status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '状态：0-待结算 1-已结算',
  `settlement_time` datetime DEFAULT NULL COMMENT '结算时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settlement_no` (`settlement_no`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_date` (`start_date`,`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户结算记录表';
```

## 三、Entity 实体类

### 3.1 商户实体 (merchant.ts)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商户实体
 */
@Entity('merchant')
export class MerchantEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '商户编号', length: 32 })
  merchantNo: string;

  @Column({ comment: '商户名称', length: 100 })
  merchantName: string;

  @Column({ comment: '商户类型：1-个人 2-企业', type: 'tinyint', default: 1 })
  merchantType: number;

  @Column({ comment: '联系人姓名', length: 50 })
  contactName: string;

  @Column({ comment: '联系电话', length: 20 })
  contactPhone: string;

  @Column({ comment: '联系邮箱', length: 100, nullable: true })
  contactEmail: string;

  @Column({ comment: '身份证号', length: 18, nullable: true })
  idCardNo: string;

  @Column({ comment: '身份证正面', nullable: true })
  idCardFront: string;

  @Column({ comment: '身份证反面', nullable: true })
  idCardBack: string;

  @Column({ comment: '营业执照', nullable: true })
  businessLicense: string;

  @Column({ comment: '省份', length: 50, nullable: true })
  province: string;

  @Column({ comment: '城市', length: 50, nullable: true })
  city: string;

  @Column({ comment: '区县', length: 50, nullable: true })
  district: string;

  @Column({ comment: '详细地址', nullable: true })
  address: string;

  @Index()
  @Column({ comment: '状态：0-待审核 1-审核通过 2-审核拒绝 3-已禁用', type: 'tinyint', default: 0 })
  status: number;

  @Column({ comment: '拒绝原因', nullable: true })
  rejectReason: string;

  @Index()
  @Column({ comment: '关联用户ID', type: 'bigint' })
  userId: number;

  @Column({ comment: '平台抽佣比例(%)', type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ comment: '账户余额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ comment: '冻结余额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  frozenBalance: number;

  @Column({ comment: '累计销售额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSales: number;

  @Column({ comment: '结算周期(天)', type: 'tinyint', default: 7 })
  settleCycle: number;

  @Column({ comment: '审核时间', type: 'datetime', nullable: true })
  auditTime: Date;

  @Column({ comment: '审核人ID', type: 'bigint', nullable: true })
  auditUserId: number;
}
```

### 3.2 店铺实体 (merchant-shop.ts)

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 店铺实体
 */
@Entity('merchant_shop')
export class MerchantShopEntity extends BaseEntity {
  @Index()
  @Column({ comment: '商户ID', type: 'bigint' })
  merchantId: number;

  @Column({ comment: '店铺名称', length: 100 })
  shopName: string;

  @Column({ comment: '店铺Logo', nullable: true })
  shopLogo: string;

  @Column({ comment: '店铺Banner', nullable: true })
  shopBanner: string;

  @Column({ comment: '店铺描述', length: 500, nullable: true })
  shopDesc: string;

  @Column({ comment: '店铺公告', length: 500, nullable: true })
  shopNotice: string;

  @Column({ comment: '营业时间', length: 100, nullable: true })
  businessHours: string;

  @Column({ comment: '客服电话', length: 20, nullable: true })
  servicePhone: string;

  @Column({ comment: '省份', length: 50, nullable: true })
  province: string;

  @Column({ comment: '城市', length: 50, nullable: true })
  city: string;

  @Column({ comment: '区县', length: 50, nullable: true })
  district: string;

  @Column({ comment: '详细地址', nullable: true })
  address: string;

  @Column({ comment: '经度', type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ comment: '纬度', type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ comment: '服务评分', type: 'decimal', precision: 3, scale: 1, default: 5.0 })
  scoreService: number;

  @Column({ comment: '商品评分', type: 'decimal', precision: 3, scale: 1, default: 5.0 })
  scoreGoods: number;

  @Column({ comment: '物流评分', type: 'decimal', precision: 3, scale: 1, default: 5.0 })
  scoreLogistics: number;

  @Column({ comment: '总销量', default: 0 })
  totalSales: number;

  @Column({ comment: '商品数量', default: 0 })
  totalGoods: number;

  @Column({ comment: '浏览量', default: 0 })
  viewCount: number;

  @Column({ comment: '收藏量', default: 0 })
  favoriteCount: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Index()
  @Column({ comment: '状态：0-关闭 1-营业中', type: 'tinyint', default: 1 })
  status: number;
}
```

## 四、Service 服务层

### 4.1 商户服务 (merchant.ts)

```typescript
import { Provide, Inject, Config } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/service/base';
import { MerchantEntity } from '../entity/merchant';
import { MerchantAccountEntity } from '../entity/merchant-account';
import { MerchantAccountLogEntity } from '../entity/merchant-account-log';
import * as _ from 'lodash';

/**
 * 商户服务
 */
@Provide()
export class MerchantService extends BaseService {
  @InjectEntityModel(MerchantEntity)
  merchantEntity: Repository<MerchantEntity>;

  @InjectEntityModel(MerchantAccountEntity)
  merchantAccountEntity: Repository<MerchantAccountEntity>;

  @InjectEntityModel(MerchantAccountLogEntity)
  merchantAccountLogEntity: Repository<MerchantAccountLogEntity>;

  @Config('module.merchant')
  merchantConfig;

  /**
   * 申请入驻
   */
  async apply(params: any, userId: number) {
    // 检查用户是否已经申请过
    const exist = await this.merchantEntity.findOne({ where: { userId } });
    if (exist) {
      throw new Error('您已申请过商户入驻');
    }

    // 生成商户编号
    const merchantNo = await this.generateMerchantNo();

    // 创建商户
    const merchant = new MerchantEntity();
    merchant.merchantNo = merchantNo;
    merchant.merchantName = params.merchantName;
    merchant.merchantType = params.merchantType || 1;
    merchant.contactName = params.contactName;
    merchant.contactPhone = params.contactPhone;
    merchant.contactEmail = params.contactEmail;
    merchant.idCardNo = params.idCardNo;
    merchant.idCardFront = params.idCardFront;
    merchant.idCardBack = params.idCardBack;
    merchant.businessLicense = params.businessLicense;
    merchant.province = params.province;
    merchant.city = params.city;
    merchant.district = params.district;
    merchant.address = params.address;
    merchant.userId = userId;
    merchant.status = 0; // 待审核
    merchant.commissionRate = this.merchantConfig.defaultCommissionRate || 5;
    merchant.settleCycle = this.merchantConfig.defaultSettleCycle || 7;

    return await this.merchantEntity.save(merchant);
  }

  /**
   * 审核商户
   */
  async audit(id: number, status: number, rejectReason: string, adminUserId: number) {
    const merchant = await this.merchantEntity.findOne({ where: { id } });
    if (!merchant) {
      throw new Error('商户不存在');
    }

    if (merchant.status !== 0) {
      throw new Error('该商户已审核过');
    }

    merchant.status = status;
    merchant.rejectReason = rejectReason;
    merchant.auditTime = new Date();
    merchant.auditUserId = adminUserId;

    await this.merchantEntity.save(merchant);

    // 如果审核通过，创建商户账户
    if (status === 1) {
      const account = new MerchantAccountEntity();
      account.merchantId = merchant.id;
      await this.merchantAccountEntity.save(account);
    }

    return merchant;
  }

  /**
   * 商户账户变动
   */
  async accountChange(params: {
    merchantId: number;
    changeType: number;
    amount: number;
    relateNo?: string;
    remark?: string;
  }) {
    const { merchantId, changeType, amount, relateNo, remark } = params;

    return await this.merchantAccountEntity.manager.transaction(async manager => {
      // 查询账户（加锁）
      const account = await manager.findOne(MerchantAccountEntity, {
        where: { merchantId },
        lock: { mode: 'pessimistic_write' }
      });

      if (!account) {
        throw new Error('商户账户不存在');
      }

      const balanceBefore = account.balance;
      let balanceAfter = balanceBefore;

      // 根据变动类型处理账户余额
      switch (changeType) {
        case 1: // 订单收入
          balanceAfter = _.add(balanceBefore, amount);
          account.balance = balanceAfter;
          account.totalIncome = _.add(account.totalIncome, amount);
          break;
        case 2: // 提现
          if (balanceBefore < amount) {
            throw new Error('余额不足');
          }
          balanceAfter = _.subtract(balanceBefore, amount);
          account.balance = balanceAfter;
          account.totalWithdraw = _.add(account.totalWithdraw, amount);
          break;
        case 3: // 佣金扣除
          if (balanceBefore < amount) {
            throw new Error('余额不足');
          }
          balanceAfter = _.subtract(balanceBefore, amount);
          account.balance = balanceAfter;
          account.totalCommission = _.add(account.totalCommission, amount);
          break;
        case 4: // 退款
          if (balanceBefore < amount) {
            throw new Error('余额不足');
          }
          balanceAfter = _.subtract(balanceBefore, amount);
          account.balance = balanceAfter;
          break;
        case 5: // 平台充值
          balanceAfter = _.add(balanceBefore, amount);
          account.balance = balanceAfter;
          break;
        default:
          throw new Error('未知的变动类型');
      }

      // 更新账户
      await manager.save(MerchantAccountEntity, account);

      // 记录流水
      const log = new MerchantAccountLogEntity();
      log.merchantId = merchantId;
      log.logNo = await this.generateLogNo();
      log.changeType = changeType;
      log.amount = amount;
      log.balanceBefore = balanceBefore;
      log.balanceAfter = balanceAfter;
      log.relateNo = relateNo;
      log.remark = remark;
      await manager.save(MerchantAccountLogEntity, log);

      return { account, log };
    });
  }

  /**
   * 生成商户编号
   */
  private async generateMerchantNo(): Promise<string> {
    const prefix = 'M';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * 生成流水号
   */
  private async generateLogNo(): Promise<string> {
    const prefix = 'ML';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * 根据用户ID获取商户信息
   */
  async getByUserId(userId: number) {
    return await this.merchantEntity.findOne({ where: { userId } });
  }

  /**
   * 获取商户账户信息
   */
  async getAccount(merchantId: number) {
    return await this.merchantAccountEntity.findOne({ where: { merchantId } });
  }

  /**
   * 获取商户统计数据
   */
  async getStats(merchantId: number, startDate: Date, endDate: Date) {
    // TODO: 实现统计逻辑
    // 统计订单数、销售额、商品数等
    return {
      orderCount: 0,
      orderAmount: 0,
      goodsCount: 0,
      viewCount: 0
    };
  }
}
```

### 4.2 商户提现服务 (merchant-withdraw.ts)

```typescript
import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/service/base';
import { MerchantWithdrawEntity } from '../entity/merchant-withdraw';
import { MerchantService } from './merchant';

/**
 * 商户提现服务
 */
@Provide()
export class MerchantWithdrawService extends BaseService {
  @InjectEntityModel(MerchantWithdrawEntity)
  merchantWithdrawEntity: Repository<MerchantWithdrawEntity>;

  @Inject()
  merchantService: MerchantService;

  /**
   * 申请提现
   */
  async apply(params: any, merchantId: number) {
    const { amount, bankName, bankAccount, accountName } = params;

    // 查询商户账户
    const account = await this.merchantService.getAccount(merchantId);
    if (!account) {
      throw new Error('商户账户不存在');
    }

    // 检查余额
    if (account.balance < amount) {
      throw new Error('可用余额不足');
    }

    // 计算手续费
    const feeRate = 0.006; // 0.6%手续费
    const fee = Math.ceil(amount * feeRate * 100) / 100;
    const realAmount = amount - fee;

    // 生成提现单号
    const withdrawNo = await this.generateWithdrawNo();

    // 创建提现记录
    const withdraw = new MerchantWithdrawEntity();
    withdraw.merchantId = merchantId;
    withdraw.withdrawNo = withdrawNo;
    withdraw.amount = amount;
    withdraw.fee = fee;
    withdraw.realAmount = realAmount;
    withdraw.bankName = bankName;
    withdraw.bankAccount = bankAccount;
    withdraw.accountName = accountName;
    withdraw.status = 0; // 待审核

    const result = await this.merchantWithdrawEntity.save(withdraw);

    // 冻结余额
    await this.merchantService.accountChange({
      merchantId,
      changeType: 2,
      amount: amount,
      relateNo: withdrawNo,
      remark: '提现申请'
    });

    return result;
  }

  /**
   * 审核提现
   */
  async audit(id: number, status: number, rejectReason: string, adminUserId: number) {
    const withdraw = await this.merchantWithdrawEntity.findOne({ where: { id } });
    if (!withdraw) {
      throw new Error('提现记录不存在');
    }

    if (withdraw.status !== 0) {
      throw new Error('该提现申请已审核过');
    }

    withdraw.status = status;
    withdraw.rejectReason = rejectReason;
    withdraw.auditTime = new Date();
    withdraw.auditUserId = adminUserId;

    await this.merchantWithdrawEntity.save(withdraw);

    // 如果审核拒绝，解冻余额
    if (status === 2) {
      await this.merchantService.accountChange({
        merchantId: withdraw.merchantId,
        changeType: 5,
        amount: withdraw.amount,
        relateNo: withdraw.withdrawNo,
        remark: '提现审核拒绝，退回余额'
      });
    }

    return withdraw;
  }

  /**
   * 打款
   */
  async pay(id: number, payVoucher: string) {
    const withdraw = await this.merchantWithdrawEntity.findOne({ where: { id } });
    if (!withdraw) {
      throw new Error('提现记录不存在');
    }

    if (withdraw.status !== 1) {
      throw new Error('该提现申请未审核通过');
    }

    withdraw.status = 3; // 已打款
    withdraw.payTime = new Date();
    withdraw.payVoucher = payVoucher;

    return await this.merchantWithdrawEntity.save(withdraw);
  }

  /**
   * 生成提现单号
   */
  private async generateWithdrawNo(): Promise<string> {
    const prefix = 'MW';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}
```

## 五、Controller 控制器

### 5.1 商户控制器 (merchant.ts)

```typescript
import { Body, Controller, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseController } from '../../../base/controller/base';
import { MerchantService } from '../../service/merchant';

/**
 * 商户控制器
 */
@Controller('/app/merchant')
export class AppMerchantController extends BaseController {
  @Inject()
  merchantService: MerchantService;

  /**
   * 申请入驻
   */
  @Post('/apply')
  async apply(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const result = await this.merchantService.apply(body, userId);
    return this.ok(result);
  }

  /**
   * 获取我的商户信息
   */
  @Get('/my')
  async getMy() {
    const userId = this.ctx.user.userId;
    const merchant = await this.merchantService.getByUserId(userId);
    return this.ok(merchant);
  }

  /**
   * 获取账户信息
   */
  @Get('/account')
  async getAccount() {
    const userId = this.ctx.user.userId;
    const merchant = await this.merchantService.getByUserId(userId);
    if (!merchant) {
      return this.fail('您还不是商户');
    }
    const account = await this.merchantService.getAccount(merchant.id);
    return this.ok(account);
  }

  /**
   * 获取统计数据
   */
  @Get('/stats')
  async getStats(@Query() query: any) {
    const userId = this.ctx.user.userId;
    const merchant = await this.merchantService.getByUserId(userId);
    if (!merchant) {
      return this.fail('您还不是商户');
    }

    const { startDate, endDate } = query;
    const stats = await this.merchantService.getStats(
      merchant.id,
      new Date(startDate),
      new Date(endDate)
    );
    return this.ok(stats);
  }
}

/**
 * 商户管理控制器（后台）
 */
@Controller('/admin/merchant')
export class AdminMerchantController extends BaseController {
  @Inject()
  merchantService: MerchantService;

  /**
   * 分页查询
   */
  @Post('/page')
  async page(@Body() body: any) {
    const result = await this.merchantService.page(body);
    return this.ok(result);
  }

  /**
   * 审核商户
   */
  @Post('/audit')
  async audit(@Body() body: any) {
    const { id, status, rejectReason } = body;
    const adminUserId = this.ctx.admin.userId;
    const result = await this.merchantService.audit(id, status, rejectReason, adminUserId);
    return this.ok(result);
  }

  /**
   * 禁用/启用商户
   */
  @Post('/updateStatus')
  async updateStatus(@Body() body: any) {
    const { id, status } = body;
    await this.merchantService.update({ id, status });
    return this.ok();
  }
}
```

### 5.2 商户提现控制器 (merchant-withdraw.ts)

```typescript
import { Body, Controller, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseController } from '../../../base/controller/base';
import { MerchantWithdrawService } from '../../service/merchant-withdraw';
import { MerchantService } from '../../service/merchant';

/**
 * 商户提现控制器
 */
@Controller('/app/merchant/withdraw')
export class AppMerchantWithdrawController extends BaseController {
  @Inject()
  merchantWithdrawService: MerchantWithdrawService;

  @Inject()
  merchantService: MerchantService;

  /**
   * 申请提现
   */
  @Post('/apply')
  async apply(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const merchant = await this.merchantService.getByUserId(userId);
    if (!merchant) {
      return this.fail('您还不是商户');
    }
    const result = await this.merchantWithdrawService.apply(body, merchant.id);
    return this.ok(result);
  }

  /**
   * 我的提现记录
   */
  @Post('/myPage')
  async myPage(@Body() body: any) {
    const userId = this.ctx.user.userId;
    const merchant = await this.merchantService.getByUserId(userId);
    if (!merchant) {
      return this.fail('您还不是商户');
    }
    body.merchantId = merchant.id;
    const result = await this.merchantWithdrawService.page(body);
    return this.ok(result);
  }
}

/**
 * 商户提现管理控制器（后台）
 */
@Controller('/admin/merchant/withdraw')
export class AdminMerchantWithdrawController extends BaseController {
  @Inject()
  merchantWithdrawService: MerchantWithdrawService;

  /**
   * 分页查询
   */
  @Post('/page')
  async page(@Body() body: any) {
    const result = await this.merchantWithdrawService.page(body);
    return this.ok(result);
  }

  /**
   * 审核提现
   */
  @Post('/audit')
  async audit(@Body() body: any) {
    const { id, status, rejectReason } = body;
    const adminUserId = this.ctx.admin.userId;
    const result = await this.merchantWithdrawService.audit(id, status, rejectReason, adminUserId);
    return this.ok(result);
  }

  /**
   * 打款
   */
  @Post('/pay')
  async pay(@Body() body: any) {
    const { id, payVoucher } = body;
    const result = await this.merchantWithdrawService.pay(id, payVoucher);
    return this.ok(result);
  }
}
```

## 六、配置文件

### 6.1 模块配置 (config.ts)

```typescript
export default {
  // 模块配置
  module: {
    merchant: {
      // 默认佣金比例(%)
      defaultCommissionRate: 5,
      // 默认结算周期(天)
      defaultSettleCycle: 7,
      // 提现手续费率
      withdrawFeeRate: 0.006,
      // 最小提现金额
      minWithdrawAmount: 10,
      // 最大提现金额
      maxWithdrawAmount: 50000
    }
  }
};
```

## 七、前端对接

### 7.1 API 接口列表

#### 商户端接口

```
POST /app/merchant/apply              - 申请入驻
GET  /app/merchant/my                 - 获取我的商户信息
GET  /app/merchant/account            - 获取账户信息
GET  /app/merchant/stats              - 获取统计数据
POST /app/merchant/withdraw/apply     - 申请提现
POST /app/merchant/withdraw/myPage    - 我的提现记录
```

#### 管理端接口

```
POST /admin/merchant/page             - 分页查询商户
POST /admin/merchant/audit            - 审核商户
POST /admin/merchant/updateStatus     - 禁用/启用商户
POST /admin/merchant/withdraw/page    - 分页查询提现记录
POST /admin/merchant/withdraw/audit   - 审核提现
POST /admin/merchant/withdraw/pay     - 打款
```

### 7.2 请求示例

**申请入驻**

```json
POST /app/merchant/apply
{
  "merchantName": "测试店铺",
  "merchantType": 1,
  "contactName": "张三",
  "contactPhone": "13800138000",
  "contactEmail": "test@example.com",
  "idCardNo": "110101199001011234",
  "idCardFront": "http://example.com/id_front.jpg",
  "idCardBack": "http://example.com/id_back.jpg",
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "address": "某某街道"
}
```

**申请提现**

```json
POST /app/merchant/withdraw/apply
{
  "amount": 1000,
  "bankName": "中国工商银行",
  "bankAccount": "6222020200012345678",
  "accountName": "张三"
}
```

## 八、定时任务

### 8.1 自动结算任务 (settlement.ts)

```typescript
import { Inject, Provide, TaskLocal } from '@midwayjs/core';
import { MerchantSettlementService } from '../service/merchant-settlement';

@Provide()
export class MerchantSettlementTask {
  @Inject()
  merchantSettlementService: MerchantSettlementService;

  /**
   * 每天凌晨1点执行商户结算
   */
  @TaskLocal('0 0 1 * * *')
  async settlement() {
    console.log('[商户结算任务] 开始执行');
    try {
      await this.merchantSettlementService.autoSettlement();
      console.log('[商户结算任务] 执行成功');
    } catch (error) {
      console.error('[商户结算任务] 执行失败:', error);
    }
  }
}
```

## 九、注意事项

### 9.1 资金安全

1. 所有涉及金额变动的操作都要使用**数据库事务**
2. 账户余额更新时使用**悲观锁**（`pessimistic_write`）
3. 使用 `lodash` 的数学运算方法处理金额，避免浮点数精度问题
4. 所有资金变动都要记录流水

### 9.2 商户审核

1. 商户入驻需要人工审核
2. 提现申请需要人工审核
3. 审核时要检查资质材料的完整性和真实性

### 9.3 结算规则

1. 按照约定的结算周期自动结算
2. 扣除平台佣金后结算到商户账户
3. 退款订单不参与结算或从下期结算中扣除

### 9.4 性能优化

1. 商户数据和订单数据建立合适的索引
2. 统计数据可以使用缓存
3. 大数据量查询要分页处理

## 十、扩展功能

### 10.1 商户等级

可以根据商户的销售额、好评率等设置商户等级，不同等级享受不同的佣金比例和服务。

### 10.2 保证金

要求商户缴纳保证金，用于处理纠纷和赔付。

### 10.3 商户认证

支持实名认证、企业认证、品牌认证等多种认证方式。

### 10.4 数据报表

提供更详细的数据报表，如销售趋势、商品分析、用户画像等。
