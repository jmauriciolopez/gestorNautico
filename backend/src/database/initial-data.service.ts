import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../users/entities/user.entity';

@Injectable()
export class InitialDataService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InitialDataService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.syncAll();
  }

  async syncAll() {
    this.logger.log('Sincronizando datos maestros iniciales (Master Data)...');
    await this.ensureInitialUsers();
    // Aquí puedes llamar a más métodos (ej. roles, permisos, configuraciones)
  }

  private async ensureInitialUsers() {
    // -------------------------------------------------------------------------
    // DATOS DE USUARIOS (MAESTROS)
    // -------------------------------------------------------------------------
    const initialUsers = [
      {
        usuario: 'superadmin',
        nombre: 'Super Administrador',
        email: 'admin@gestornautico.com',
        clave: 'admin123', // En producción usar hashing real
        rol: Role.SUPERADMIN,
        activo: true,
      },
      // Puedes añadir más usuarios relevantes aquí
    ];

    for (const userData of initialUsers) {
      // Buscar si existe por el campo único 'usuario'
      const existingUser = await this.userRepository.findOne({
        where: { usuario: userData.usuario },
      });

      if (!existingUser) {
        this.logger.log(`Creando usuario maestro: ${userData.usuario}`);
        const newUser = this.userRepository.create(userData);
        await this.userRepository.save(newUser);
      } else {
        // "Insertar si falta o se MODIFICA"
        // Comparamos campos relevantes (ej. email, nombre, rol)
        let hasChanges = false;
        if (existingUser.email !== userData.email) { existingUser.email = userData.email; hasChanges = true; }
        if (existingUser.nombre !== userData.nombre) { existingUser.nombre = userData.nombre; hasChanges = true; }
        if (existingUser.rol !== userData.rol) { existingUser.rol = userData.rol; hasChanges = true; }

        if (hasChanges) {
          this.logger.log(`Actualizando usuario maestro: ${userData.usuario}`);
          await this.userRepository.save(existingUser);
        }
      }
    }
  }
}
