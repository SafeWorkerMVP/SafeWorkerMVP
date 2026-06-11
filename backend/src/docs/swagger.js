const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SafeWorker MVP API',
      version: '1.0.0',
      description:
        'SafeWorker MVP; Node.js backend, React dashboard ve Flutter mobil uygulamadan oluşan iş güvenliği takip sistemidir.'
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local development server'
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Kullanıcı giriş ve kimlik doğrulama işlemleri'
      },
      {
        name: 'Sensor Data',
        description: 'Mobil cihazdan gelen sensör verileri'
      },
      {
        name: 'Alarms',
        description: 'Alarm listeleme, filtreleme ve çözme işlemleri'
      },
      {
        name: 'Emergency',
        description: 'Manuel SOS / acil durum bildirimi'
      },
      {
        name: 'Zones',
        description: 'Tehlikeli bölge ve QR giriş işlemleri'
      },
      {
        name: 'Dashboard',
        description: 'Admin dashboard özet ve canlı izleme verileri'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              example: 'admin@safeworker.com'
            },
            password: {
              type: 'string',
              example: '123456'
            }
          }
        },
        SensorVector: {
          type: 'object',
          required: ['x', 'y', 'z'],
          properties: {
            x: {
              type: 'number',
              example: 1.2
            },
            y: {
              type: 'number',
              example: 0.4
            },
            z: {
              type: 'number',
              example: 9.8
            }
          }
        },
        SensorDataRequest: {
          type: 'object',
          required: [
            'workerId',
            'deviceId',
            'timestamp',
            'accelerometer',
            'gyroscope',
            'batteryLevel',
            'networkStatus'
          ],
          properties: {
            workerId: {
              type: 'string',
              example: '6a2995a47c04fb14a4a921b3'
            },
            deviceId: {
              type: 'string',
              example: '6a2995a47c04fb14a4a921b5'
            },
            shiftId: {
              type: 'string',
              example: '6a2995a47c04fb14a4a921b7'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2026-06-11T10:30:00.000Z'
            },
            accelerometer: {
              $ref: '#/components/schemas/SensorVector'
            },
            gyroscope: {
              $ref: '#/components/schemas/SensorVector'
            },
            batteryLevel: {
              type: 'number',
              example: 80
            },
            networkStatus: {
              type: 'string',
              enum: ['online', 'offline'],
              example: 'online'
            },
            inactivity: {
              type: 'boolean',
              example: false
            }
          }
        },
        EmergencyRequest: {
          type: 'object',
          required: ['workerId', 'deviceId'],
          properties: {
            workerId: {
              type: 'string',
              example: '6a2995a47c04fb14a4a921b3'
            },
            deviceId: {
              type: 'string',
              example: '6a2995a47c04fb14a4a921b5'
            },
            shiftId: {
              type: 'string',
              example: '6a2995a47c04fb14a4a921b7'
            },
            message: {
              type: 'string',
              example: 'Çalışan manuel acil durum bildirimi gönderdi.'
            }
          }
        },
        ZoneScanRequest: {
          type: 'object',
          required: ['workerId', 'qrCode'],
          properties: {
            workerId: {
              type: 'string',
              example: '6a2995a47c04fb14a4a921b3'
            },
            qrCode: {
              type: 'string',
              example: 'ZONE-CHEM-001'
            }
          }
        },
        CreateZoneRequest: {
          type: 'object',
          required: ['zoneName', 'qrCode', 'riskLevel'],
          properties: {
            zoneName: {
              type: 'string',
              example: 'Kimyasal Depo'
            },
            qrCode: {
              type: 'string',
              example: 'ZONE-CHEM-001'
            },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'high'
            },
            description: {
              type: 'string',
              example: 'Kimyasal maddelerin bulunduğu yüksek riskli alan.'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    paths: {
      '/health': {
        get: {
          tags: ['Dashboard'],
          summary: 'Backend sağlık kontrolü',
          responses: {
            200: {
              description: 'Backend çalışıyor'
            }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Kullanıcı girişi',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Giriş başarılı'
            },
            401: {
              description: 'Geçersiz kullanıcı bilgisi'
            }
          }
        }
      },
      '/sensor-data': {
        post: {
          tags: ['Sensor Data'],
          summary: 'Mobil cihazdan sensör verisi gönderme',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SensorDataRequest'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Sensör verisi kaydedildi ve risk analizi yapıldı'
            },
            400: {
              description: 'Eksik veya hatalı veri'
            },
            401: {
              description: 'Token gerekli'
            }
          }
        }
      },
      '/sensor-data/worker/{workerId}': {
        get: {
          tags: ['Sensor Data'],
          summary: 'Çalışana ait sensör verilerini listeleme',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'workerId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            200: {
              description: 'Sensör verileri getirildi'
            }
          }
        }
      },
      '/alarms': {
        get: {
          tags: ['Alarms'],
          summary: 'Alarm kayıtlarını listeleme',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              required: false,
              schema: {
                type: 'string',
                enum: ['active', 'resolved']
              }
            },
            {
              name: 'type',
              in: 'query',
              required: false,
              schema: {
                type: 'string'
              }
            },
            {
              name: 'minRisk',
              in: 'query',
              required: false,
              schema: {
                type: 'number'
              }
            }
          ],
          responses: {
            200: {
              description: 'Alarm kayıtları getirildi'
            }
          }
        }
      },
      '/alarms/active': {
        get: {
          tags: ['Alarms'],
          summary: 'Aktif alarm kayıtlarını listeleme',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Aktif alarmlar getirildi'
            }
          }
        }
      },
      '/alarms/{id}/resolve': {
        patch: {
          tags: ['Alarms'],
          summary: 'Alarmı çözüldü olarak işaretleme',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            200: {
              description: 'Alarm çözüldü'
            },
            404: {
              description: 'Alarm bulunamadı'
            }
          }
        }
      },
      '/alarms/export.csv': {
        get: {
          tags: ['Alarms'],
          summary: 'Alarm kayıtlarını CSV olarak dışa aktarma',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'CSV çıktısı üretildi'
            }
          }
        }
      },
      '/emergency': {
        post: {
          tags: ['Emergency'],
          summary: 'Manuel SOS / acil durum alarmı oluşturma',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EmergencyRequest'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Acil durum alarmı oluşturuldu'
            }
          }
        }
      },
      '/zones': {
        get: {
          tags: ['Zones'],
          summary: 'Tehlikeli bölgeleri listeleme',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Bölgeler getirildi'
            }
          }
        },
        post: {
          tags: ['Zones'],
          summary: 'Yeni tehlikeli bölge oluşturma',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateZoneRequest'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Tehlikeli bölge oluşturuldu'
            }
          }
        }
      },
      '/zones/scan': {
        post: {
          tags: ['Zones'],
          summary: 'QR kod ile bölge girişi kaydetme',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ZoneScanRequest'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Bölge girişi kaydedildi'
            },
            404: {
              description: 'Bölge bulunamadı'
            }
          }
        }
      },
      '/dashboard/summary': {
        get: {
          tags: ['Dashboard'],
          summary: 'Dashboard özet verilerini getirme',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Dashboard özet verileri getirildi'
            }
          }
        }
      },
      '/dashboard/live-workers': {
        get: {
          tags: ['Dashboard'],
          summary: 'Canlı çalışan durumlarını getirme',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Canlı çalışanlar getirildi'
            }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;