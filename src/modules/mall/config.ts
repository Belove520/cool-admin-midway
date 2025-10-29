import { MallUserEntity } from './entity/user';

export default () => {
  return {
    name: 'Mall Module',
    description: 'E-commerce mall module',
    entities: [MallUserEntity],
    jwt: {
      secret: 'your-secret-key-change-in-production',
      expiresIn: '7d',
    },
  };
};