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
import {
  paginate,
  PaginationQuery,
} from '../common/pagination/pagination.helper';
import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class UsersService extends BaseTenantService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  findAll(tenant: TenantContext, query: PaginationQuery = {}) {
    return paginate(this.userRepository, query, {
      where: this.buildTenantWhere(tenant),
      order: { id: 'ASC' },
    });
  }

  async findOne(tenant: TenantContext, id: number) {
    const user = await this.userRepository.findOne({
      where: this.buildTenantWhere(tenant, { id }),
    });
    if (!user)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  async create(tenant: TenantContext, createUserDto: CreateUserDto) {
    // El nombre de usuario debe ser único en TODO el sistema
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

    const newUser = this.userRepository.create({
      ...createUserDto,
      guarderiaId: tenant.guarderiaId as number,
    });
    return await this.userRepository.save(newUser);
  }

  async createSuperAdmin(createUserDto: CreateUserDto) {
    const superAdminDto = { ...createUserDto, role: Role.SUPERADMIN };
    // Los SuperAdmins no tienen guarderiaId (null)
    const existingUser = await this.userRepository.findOneBy({
      usuario: createUserDto.usuario,
    });
    if (existingUser) {
      throw new ConflictException(
        `El usuario "${createUserDto.usuario}" ya existe`,
      );
    }

    if (superAdminDto.clave) {
      const salt = await bcrypt.genSalt();
      superAdminDto.clave = await bcrypt.hash(superAdminDto.clave, salt);
    }

    const newUser = this.userRepository.create({
      ...superAdminDto,
      guarderiaId: null,
    });
    return await this.userRepository.save(newUser);
  }

  async update(tenant: TenantContext, id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(tenant, id);

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

  async remove(tenant: TenantContext, id: number) {
    const user = await this.findOne(tenant, id);
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
