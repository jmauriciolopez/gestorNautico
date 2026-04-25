import { Test, TestingModule } from '@nestjs/testing';
import { AutomaticBillingService } from './automatic-billing.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Factura, EstadoFactura } from './factura.entity';
import { Cargo, TipoCargo } from '../cargos/cargo.entity';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Rack } from '../racks/rack.entity';
import { FacturasService } from './facturas.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { LessThan } from 'typeorm';

describe('AutomaticBillingService', () => {
  let service: AutomaticBillingService;

  const mockTenant = {
    guarderiaId: 1,
    scope: 'guarderia' as any,
    role: 'SUPERADMIN' as any,
    userId: 1,
  } as any;

  let facturaRepo: any;
  let cargoRepo: any;
  let clienteRepo: any;
  let embarcacionRepo: any;
  let rackRepo: any;
  let facturasService: any;
  let notificacionesService: any;
  let configuracionService: any;

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomaticBillingService,
        { provide: getRepositoryToken(Factura), useFactory: mockRepository },
        { provide: getRepositoryToken(Cargo), useFactory: mockRepository },
        { provide: getRepositoryToken(Cliente), useFactory: mockRepository },
        { provide: getRepositoryToken(Embarcacion), useFactory: mockRepository },
        { provide: getRepositoryToken(Rack), useFactory: mockRepository },
        {
          provide: FacturasService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: NotificacionesService,
          useValue: {
            createForRole: jest.fn(),
            sendEmailNotification: jest.fn(),
          },
        },
        {
          provide: ConfiguracionService,
          useValue: {
            getValorNumerico: jest.fn(),
            getValor: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AutomaticBillingService>(AutomaticBillingService);
    facturaRepo = module.get(getRepositoryToken(Factura));
    cargoRepo = module.get(getRepositoryToken(Cargo));
    clienteRepo = module.get(getRepositoryToken(Cliente));
    embarcacionRepo = module.get(getRepositoryToken(Embarcacion));
    rackRepo = module.get(getRepositoryToken(Rack));
    facturasService = module.get(FacturasService);
    notificacionesService = module.get(NotificacionesService);
    configuracionService = module.get(ConfiguracionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMonthlyMooringFees', () => {
    it('should generate fees for clients billing today', async () => {
      const today = new Date();
      const mockCliente = { id: 1, nombre: 'Test', diaFacturacion: today.getDate(), activo: true };
      clienteRepo.find.mockResolvedValue([mockCliente]);
      embarcacionRepo.find.mockResolvedValue([
        { id: 1, nombre: 'Boat', matricula: 'MAT1', espacio: { rack: { tarifaBase: 100 } } }
      ]);
      cargoRepo.findOne.mockResolvedValue(null); // No existing fee
      cargoRepo.create.mockReturnValue({ id: 10 });
      cargoRepo.save.mockResolvedValue({ id: 10 });
      cargoRepo.find.mockResolvedValue([]); // No pending consumptions
      configuracionService.getValorNumerico.mockResolvedValue(15);

      await service.generateMonthlyMooringFees();

      expect(cargoRepo.create).toHaveBeenCalled();
      expect(facturasService.create).toHaveBeenCalled();
    });

    it('should skip if fee already exists', async () => {
      const today = new Date();
      clienteRepo.find.mockResolvedValue([{ id: 1, diaFacturacion: today.getDate(), activo: true }]);
      embarcacionRepo.find.mockResolvedValue([{ id: 1, matricula: 'MAT1', espacio: { rack: { tarifaBase: 100 } } }]);
      cargoRepo.findOne.mockResolvedValue({ id: 99 }); // Already exists
      cargoRepo.find.mockResolvedValue([]);

      await service.generateMonthlyMooringFees();

      expect(cargoRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('checkOverdueInvoices', () => {
    it('should apply interest and recargo to overdue invoices', async () => {
      const mockFactura = {
        id: 1,
        numero: 'FAC-001',
        estado: EstadoFactura.PENDIENTE,
        fechaVencimiento: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        fechaEmision: new Date(),
        total: 100,
        recargo: 0,
        interesMoratorio: 0,
        cargos: [{ monto: 100 }],
        cliente: { nombre: 'Test', email: 'test@test.com' }
      };
      facturaRepo.find.mockResolvedValue([mockFactura]);
      configuracionService.getValorNumerico.mockImplementation((key, def) => {
        if (key === 'MORA_DIAS_GRACIA') return 2;
        if (key === 'MORA_TASA_INTERES') return 3;
        if (key === 'MORA_TASA_RECARGO') return 10;
        return def;
      });

      await service.checkOverdueInvoices();

      expect(facturaRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        recargo: 10, // 10% of 100
      }));
      expect(notificacionesService.sendEmailNotification).toHaveBeenCalled();
    });
  });
});
