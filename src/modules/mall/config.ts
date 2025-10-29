import { MallUserEntity } from './entity/user';

export default () => {
  return {
    name: 'Mall Module',
    description: 'E-commerce mall module',
    entities: [MallUserEntity],
    jwt: {
      secret: 'da1c3a68-b13d-4859-842c-dd3562eb0a24x', // 使用与用户模块相同的secret
      expiresIn: '7d',
    },
  };
};
