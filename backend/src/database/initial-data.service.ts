import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InitialDataService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InitialDataService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.syncAll();
    } catch (error) {
      this.logger.error(`Error durante la sincronización inicial de datos: ${error.message}`);
    }
  }

  async syncAll() {
    this.logger.log(
      '🌱 Sincronizando datos maestros iniciales (Master Data)...',
    );
    await this.ensureInitialUsers();
    this.logger.log('✅ Master Data Sync: Completed');
  }

  private async ensureInitialUsers() {
    // -------------------------------------------------------------------------
    // USUARIOS INICIALES DE PRUEBA Y ADMINISTRACIÓN
    // -------------------------------------------------------------------------
    const initialUsers = [
      {
        usuario: 'superadmin',
        nombre: 'Super Administrador',
        email: 'super@gestornautico.com',
        clave: 'super123',
        role: Role.SUPERADMIN,
        activo: true,
      },
      {
        usuario: 'admin',
        nombre: 'Admin de Puerto',
        email: 'admin@gestornautico.com',
        clave: 'admin123',
        role: Role.ADMIN,
        activo: true,
      },
      {
        usuario: 'operador',
        nombre: 'Operador Náutico',
        email: 'operador@gestornautico.com',
        clave: 'operador123',
        role: Role.OPERADOR,
        activo: true,
      },
    ];

    const salt = await bcrypt.genSalt();

    for (const userData of initialUsers) {
      const existingUser = await this.userRepository.findOne({
        where: { usuario: userData.usuario },
      });

      if (!existingUser) {
        this.logger.log(`Creando usuario maestro: ${userData.usuario}`);
        const hashedPassword = await bcrypt.hash(userData.clave, salt);
        const newUser = this.userRepository.create({
          ...userData,
          clave: hashedPassword,
        });
        await this.userRepository.save(newUser);
      } else {
        // "Insertar si falta o se MODIFICA" - Sincronización de campos básicos
        let hasChanges = false;
        if (existingUser.email !== userData.email) {
          existingUser.email = userData.email;
          hasChanges = true;
        }
        if (existingUser.nombre !== userData.nombre) {
          existingUser.nombre = userData.nombre;
          hasChanges = true;
        }
        if (existingUser.role !== userData.role) {
          existingUser.role = userData.role;
          hasChanges = true;
        }

        if (hasChanges) {
          this.logger.log(`Actualizando usuario maestro: ${userData.usuario}`);
          await this.userRepository.save(existingUser);
        }
      }
    }
  }
}
