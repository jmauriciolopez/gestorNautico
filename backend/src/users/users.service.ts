import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Role } from './user.entity';
import { paginate, PaginationQuery } from '../common/pagination/pagination.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(query: PaginationQuery = {}) {
    return paginate(this.userRepository, query, {
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      usuario: createUserDto.usuario,
    });
    if (existingUser) {
      throw new ConflictException(
        `El usuario "${createUserDto.usuario}" ya existe`,
      );
    }

    if (createUserDto.clave) {
      const salt = await bcrypt.genSalt();
      createUserDto.clave = await bcrypt.hash(createUserDto.clave, salt);
    }

    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async createSuperAdmin(createUserDto: CreateUserDto) {
    const superAdminDto = { ...createUserDto, role: Role.SUPERADMIN };
    return this.create(superAdminDto);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.usuario && updateUserDto.usuario !== user.usuario) {
      const existingUser = await this.userRepository.findOneBy({
        usuario: updateUserDto.usuario,
      });
      if (existingUser) {
        throw new ConflictException(
          `El usuario "${updateUserDto.usuario}" ya existe`,
        );
      }
    }

    if (updateUserDto.clave) {
      const salt = await bcrypt.genSalt();
      updateUserDto.clave = await bcrypt.hash(updateUserDto.clave, salt);
    }

    this.userRepository.merge(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: 'Usuario eliminado correctamente' };
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }
  findOneByUsername(usuario: string): Promise<User | null> {
    return this.userRepository.findOneBy({ usuario });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: [{ usuario: identifier }, { email: identifier }],
    });
  }
}
