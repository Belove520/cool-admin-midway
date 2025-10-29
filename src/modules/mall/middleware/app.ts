import { ALL, Config, Middleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { IMiddleware, Init, Inject } from '@midwayjs/core';
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';
import { CoolCommException, CoolUrlTagData, TagTypes } from '@cool-midway/core';
import { Utils } from '../../../comm/utils';

/**
 * 商城用户中间件
 */
@Middleware()
export class MallUserMiddleware implements IMiddleware<Context, NextFunction> {
  @Config(ALL)
  coolConfig;

  @Inject()
  coolUrlTagData: CoolUrlTagData;

  @Config('module.mall.jwt')
  jwtConfig;

  ignoreUrls: string[] = [];

  @Config('koa.globalPrefix')
  prefix;

  @Inject()
  utils: Utils;

  @Init()
  async init() {
    this.ignoreUrls = this.coolUrlTagData.byKey(TagTypes.IGNORE_TOKEN, 'app');
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      let { url } = ctx;
      url = url.replace(this.prefix, '').split('?')[0];

      // 只处理商城相关的接口
      if (_.startsWith(url, '/app/mall/')) {
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

        if (!token) {
          ctx.status = 401;
          throw new CoolCommException('登录失效或无权限访问');
        }

        try {
          ctx.user = jwt.verify(token, this.jwtConfig.secret);

          if (ctx.user.isRefresh) {
            ctx.status = 401;
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
}
