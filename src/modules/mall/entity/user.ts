import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

@Entity('mall_user')
export class MallUserEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: 'phone', length: 11 })
  phone: string;

  @Column({ comment: 'password', length: 255, select: false })
  password: string;

  @Column({ comment: 'nickname', nullable: true, length: 50 })
  nickname: string;

  @Column({ comment: 'avatar', nullable: true, length: 500 })
  avatar: string;

  @Column({
    comment: 'gender 0-unknown 1-male 2-female',
    default: 0,
    type: 'smallint',
  })
  gender: number;

  @Column({ comment: 'birthday', nullable: true, type: 'date' })
  birthday: Date;

  @Column({
    comment: 'status 0-disabled 1-enabled',
    default: 1,
    type: 'smallint',
  })
  status: number;

  @Column({
    comment: 'last login time',
    nullable: true,
    type: 'timestamptz',
  })
  lastLoginTime: Date;

  @Column({ comment: 'last login ip', nullable: true, length: 50 })
  lastLoginIp: string;
}
