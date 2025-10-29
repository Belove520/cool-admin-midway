import { Provide, Inject, Post, Body } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { MallUserService } from '../../service/user';

@Provide()
@CoolController('/app/mall/user', {
  tagName: 'APP User Module',
})
export class AppMallUserController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  mallUserService: MallUserService;

  @Post('/login', { summary: 'User Login' })
  async userLogin(@Body() body: { phone: string; password: string }) {
    const { phone, password } = body;
    const ip = this.ctx.ip;
    const result = await this.mallUserService.login(phone, password, ip);
    return this.ok(result);
  }

  @Post('/register', { summary: 'User Register' })
  async userRegister(
    @Body() body: { phone: string; password: string; nickname?: string }
  ) {
    const { phone, password, nickname } = body;
    const result = await this.mallUserService.register(
      phone,
      password,
      nickname
    );
    return this.ok(result);
  }

  @Post('/info', { summary: 'Get User Info' })
  async getUserInfo() {
    const userId = (this.ctx as any).user?.userId || 1;
    const result = await this.mallUserService.getUserInfo(userId);
    return this.ok(result);
  }

  @Post('/update', { summary: 'Update User Info' })
  async updateUser(@Body() body: any) {
    const userId = (this.ctx as any).user?.userId || 1;
    const result = await this.mallUserService.updateUserInfo(userId, body);
    return this.ok(result);
  }

  @Post('/changePassword', { summary: 'Change Password' })
  async changeUserPassword(
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    const userId = (this.ctx as any).user?.userId || 1;
    const { oldPassword, newPassword } = body;
    const result = await this.mallUserService.changePassword(
      userId,
      oldPassword,
      newPassword
    );
    return this.ok(result);
  }
}
