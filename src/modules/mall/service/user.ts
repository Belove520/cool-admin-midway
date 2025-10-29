import { Provide, Config } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MallUserEntity } from '../entity/user';
import * as md5 from 'md5';
import * as jwt from 'jsonwebtoken';

@Provide()
export class MallUserService extends BaseService {
  @InjectEntityModel(MallUserEntity)
  mallUserEntity: Repository<MallUserEntity>;

  @Config('module.mall')
  mallConfig;

  async login(phone: string, password: string, ip?: string) {
    const user = await this.mallUserEntity
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.phone = :phone', { phone })
      .getOne();

    if (!user) {
      throw new Error('User not found');
    }

    const encryptedPassword = md5(password);
    if (user.password !== encryptedPassword) {
      throw new Error('Wrong password');
    }

    if (user.status !== 1) {
      throw new Error('Account disabled');
    }

    await this.mallUserEntity.update(user.id, {
      lastLoginTime: new Date(),
      lastLoginIp: ip || '',
    });

    const token = this.generateToken(user);
    delete user.password;

    return {
      token,
      userInfo: user,
    };
  }

  async register(phone: string, password: string, nickname?: string) {
    const existUser = await this.mallUserEntity.findOne({
      where: { phone },
    });

    if (existUser) {
      throw new Error('Phone already registered');
    }

    const user = this.mallUserEntity.create({
      phone,
      password: md5(password),
      nickname: nickname || `User${phone.slice(-4)}`,
      status: 1,
    });

    const saved = (await this.mallUserEntity.save(user)) as MallUserEntity;
    const token = this.generateToken(saved);
    const { password: _, ...userInfo } = saved;

    return {
      token,
      userInfo,
    };
  }

  async getUserInfo(userId: number) {
    const user = await this.mallUserEntity.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUserInfo(userId: number, data: any) {
    await this.getUserInfo(userId);

    delete data.phone;
    delete data.password;
    delete data.id;

    await this.mallUserEntity.update(userId, data);
    return await this.getUserInfo(userId);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.mallUserEntity
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== md5(oldPassword)) {
      throw new Error('Wrong old password');
    }

    await this.mallUserEntity.update(userId, {
      password: md5(newPassword),
    });

    return { message: 'Password changed successfully' };
  }

  private generateToken(user: MallUserEntity): string {
    const jwtConfig = this.mallConfig?.jwt || {
      secret: 'mall-secret-key',
      expiresIn: '7d',
    };

    return jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn,
      }
    );
  }

  verifyToken(token: string): any {
    const jwtConfig = this.mallConfig?.jwt || {
      secret: 'mall-secret-key',
    };

    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
