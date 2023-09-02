import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.entity';
import { UserVo } from './vo/user.vo';

@Injectable()
export class UserService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  create(createUserDto: CreateUserDto) {
    console.log('createUserDto', createUserDto);
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log('updateUserDto', updateUserDto);
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async login(loginUser: LoginUserDto) {
    const user = await this.entityManager.findOneBy(User, {
      username: loginUser.username,
    });
    // 用户不存在
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    // 用户名或者密码错误
    if (user.password !== loginUser.password) {
      throw new BadRequestException('用户名或者密码错误');
    }

    const userVo = new UserVo();
    userVo.id = user.id;
    userVo.username = user.username;

    return user;
  }
}
