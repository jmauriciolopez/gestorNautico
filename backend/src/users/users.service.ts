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

  async findAll(tenant: TenantContext, query: PaginationQuery = {}) {
    const result = await paginate(this.userRepository, query, {
      where: this.buildTenantWhere(tenant),
      relations: ['guarderia'],
      order: { id: 'ASC' },
    });
    console.log(`[UsersService] Found ${result.data.length} users. First user guarderia:`, result.data[0]?.guarderia);
    return result;
  }

  async findOne(tenant: TenantContext, id: number) {
    const user = await this.userRepository.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['guarderia'],
    });
    if (!user)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  async create(tenant: TenantContext, createUserDto: CreateUserDto) {
    if (createUserDto.email) {
      const existingEmail = await this.userRepository.findOneBy({ email: createUserDto.email });
      if (existingEmail) {
        throw new ConflictException(`El email "${createUserDto.email}" ya está registrado`);
      }
    }

    // El nombre de usuario debe ser único dentro de la misma guardería
    const existingUser = await this.userRepository.findOne({
      where: {
        usuario: createUserDto.usuario,
        guarderiaId: tenant.role === Role.SUPERADMIN && createUserDto.guarderiaId
          ? createUserDto.guarderiaId
          : tenant.guarderiaId,
      },
    });
    if (existingUser) {
      throw new ConflictException(
        `El usuario "${createUserDto.usuario}" ya existe en esta marina`,
      );
    }

    if (createUserDto.clave) {
      const salt = await bcrypt.genSalt();
      createUserDto.clave = await bcrypt.hash(createUserDto.clave, salt);
    }

    // Determinar la guardería: si es SuperAdmin puede especificarla, si no, se usa la de su contexto
    const guarderiaId =
      tenant.role === Role.SUPERADMIN && createUserDto.guarderiaId
        ? createUserDto.guarderiaId
        : tenant.guarderiaId;

    const newUser = this.userRepository.create({
      ...createUserDto,
      guarderiaId: guarderiaId,
    });
    return await this.userRepository.save(newUser);
  }

  async createSuperAdmin(createUserDto: CreateUserDto) {
    const superAdminDto = { ...createUserDto, role: Role.SUPERADMIN };
    // Los SuperAdmins no tienen guarderiaId (null)
    const existingUser = await this.userRepository.findOne({
      where: {
        usuario: createUserDto.usuario,
        guarderiaId: null,
      },
    });
    if (existingUser) {
      throw new ConflictException(
        `El SuperAdmin "${createUserDto.usuario}" ya existe`,
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

  async signupAdmin(guarderiaId: number, createUserDto: CreateUserDto) {
    if (createUserDto.email) {
      const existingEmail = await this.userRepository.findOneBy({ email: createUserDto.email });
      if (existingEmail) {
        throw new ConflictException(`El email "${createUserDto.email}" ya está registrado`);
      }
    }

    const existingUser = await this.userRepository.findOne({
      where: {
        usuario: createUserDto.usuario,
        guarderiaId: guarderiaId,
      },
    });
    if (existingUser) {
      throw new ConflictException(
        `El usuario "${createUserDto.usuario}" ya existe en esta marina`,
      );
    }

    if (createUserDto.clave) {
      const salt = await bcrypt.genSalt();
      createUserDto.clave = await bcrypt.hash(createUserDto.clave, salt);
    }

    const newUser = this.userRepository.create({
      ...createUserDto,
      role: Role.ADMIN,
      guarderiaId: guarderiaId,
      activo: true,
    });
    return await this.userRepository.save(newUser);
  }

  async update(
    tenant: TenantContext,
    id: number,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.findOne(tenant, id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOneBy({ email: updateUserDto.email });
      if (existingEmail) {
        throw new ConflictException(`El email "${updateUserDto.email}" ya está registrado`);
      }
    }

    if (updateUserDto.usuario && updateUserDto.usuario !== user.usuario) {
      const existingUser = await this.userRepository.findOne({
        where: {
          usuario: updateUserDto.usuario,
          guarderiaId: user.guarderiaId,
        },
      });
      if (existingUser) {
        throw new ConflictException(
          `El usuario "${updateUserDto.usuario}" ya existe en esta marina`,
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

  findOneByUsername(usuario: string, guarderiaId?: number): Promise<User | null> {
    return this.userRepository.findOneBy({ usuario, guarderiaId: guarderiaId ?? null });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['guarderia'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByIdentifier(identifier: string, guarderiaId?: number): Promise<User | null> {
    // 1. Siempre buscar por email primero (es global y único)
    if (identifier.includes('@')) {
      const userByEmail = await this.userRepository.findOne({
        where: { email: identifier },
        relations: ['guarderia'],
      });
      if (userByEmail) return userByEmail;
    }

    // 2. Si no es email o no se encontró, buscar por usuario (+ guarderiaId si se provee)
    const where: any = { usuario: identifier };
    
    if (guarderiaId !== undefined) {
      where.guarderiaId = guarderiaId;
    } else {
      // Si no hay guarderiaId, solo puede ser un SUPERADMIN (global)
      // O un usuario que intente loguearse sin contexto (esto fallará si hay duplicados)
      where.guarderiaId = null;
    }

    return await this.userRepository.findOne({
      where,
      relations: ['guarderia'],
    });
  }
}
