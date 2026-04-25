# Importación de Datos - README

Módulo para importar clientes y embarcacións desde archivos CSV.

## Formato del Archivo

- **Delimitador**: Coma (`,`)
- **Codificación**: UTF-8
- **Primera fila**: Encabezados de columnas
- **Sin cabecera**: El archivo debe tener una fila de encabezados

---

## Importar Clientes

### Endpoint
```
POST /import/clientes
Content-Type: multipart/form-data
```

### Campos

| Campo | Tipo | Requerido | Descripción | Valor por defecto |
|-------|------|----------|------------|-----------------|
| nombre | texto | **Sí** | Nombre completo del cliente | - |
| dni | texto | **Sí** | Número de documento (único) | - |
| email | texto | No | Correo electrónico | `null` |
| telefono | texto | No | Teléfono de contacto | `null` |
| activo | booleano | No | Si el cliente está activo | `true` |
| diaFacturacion | número | No | Día del mes para facturación (1-31) | `1` |
| descuento | número | No | Porcentaje de descuento (0-100) | `0` |
| tipoCuota | texto | No | Tipo de cuota (`INDIVIDUAL`, `FAMILIAR`, `NINGUNA`) | `NINGUNA` |

### Ejemplo CSV
```csv
nombre,dni,email,telefono,activo,diaFacturacion,descuento,tipoCuota
Juan Perez,12345678,juan@mail.com,+549111234567,true,1,0,INDIVIDUAL
Maria Gonzalez,87654321,maria@mail.com,,true,15,10,FAMILIAR
```

### Comportamiento
- Si el **DNI** ya existe → Actualiza el cliente (no cambia email/telefono si vienen vacíos)
- Si el **DNI** es nuevo → Crea el cliente
- Retorna: `{ success: boolean, created: number, updated: number, errors: string[] }`

---

## Importar Embarcaciones

### Endpoint
```
POST /import/embarcaciones
Content-Type: multipart/form-data
```

### Campos

| Campo | Tipo | Requerido | Descripción | Valor por defecto |
|-------|------|----------|------------|-----------------|
| nombre | texto | **Sí** | Nombre de la'embarcación | - |
| matricula | texto | **Sí** | Matrícula (única) | - |
| dniDueno | texto | **Sí** | DNI del cliente propietario | - |
| marca | texto | No | Marca del fabricante | `null` |
| modelo | texto | No | Modelo | `null` |
| eslora | número | No | Eslora en metros | `null` |
| manga | número | No | Manga en metros | `null` |
| tipo | texto | No | Tipo (`Lancha`, `Velero`, `Yate`, `Catamaran`, `Otro`) | `Lancha` |
| estado | texto | No | Estado (`EN_CUNA`, `EN_AGUA`, `MANTENIMIENTO`, `INACTIVA`) | `EN_CUNA` |

### Ejemplo CSV
```csv
nombre,matricula,dniDueno,marca,modelo,eslora,manga,tipo,estado
El Peregrino,ABC-1234,12345678,Yamaha,2420,7.5,2.5,Lancha,EN_CUNA
Mar Azul,XYZ-5678,87654321,Beneteau,Oceanis 40,12.0,3.8,Velero,EN_AGUA
```

### Comportamiento
- La **matrícula** debe ser única → Si existe, actualiza
- El **dniDueno** debe existir en clientes → Si no existe, error
- Retorna: `{ success: boolean, created: number, updated: number, errors: string[] }`

---

## Notas

1. El archivo debe ser enviado como `FormData` con campo `file`
2. Tamaño máximo: 5MB
3. Se recomienda usar comillas si los valores contienen comas
4. Los errores se acumulan pero no frenan la importación