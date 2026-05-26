# SafeWorker Backend MVP

SafeWorker, mobil sensör verileri ve QR/demonstrasyon kodları ile iş güvenliği risklerini izleyen backend MVP projesidir. 

## Teknolojiler

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- cors
- dotenv
- socket.io
- nodemon

## Kurulum

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

API varsayılan olarak şu adreste çalışır:

```text
http://localhost:3000
```

## MongoDB Bağlantı Hatası

Seed sırasında şu hata alınırsa MongoDB yerelde çalışmıyor demektir:

```text
Seed failed: connect ECONNREFUSED 127.0.0.1:27017
```

macOS ve Homebrew için çözüm:

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
npm run seed
```

Servis durumunu kontrol etmek için:

```bash
brew services list
mongosh --eval "db.runCommand({ ping: 1 })"
```

## .env

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/safeworker
JWT_SECRET=safeworker_secret_key
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

## Demo Kullanıcıları

```text
Admin:
email: admin@safeworker.com
password: 123456

Worker:
email: worker@safeworker.com
password: 123456
```

`npm run seed` çıktısında `SEED_WORKER_ID` ve `SEED_DEVICE_ID` değerleri yazdırılır. Postman body örneklerinde bu değerleri kullanın.

## Auth

JWT token şu formatta gönderilir:

```text
Authorization: Bearer TOKEN
```

## Endpoint Listesi

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Sensor

- `POST /api/sensor-data`
- `GET /api/sensor-data/:workerId`
- `GET /api/sensor-data/:workerId/latest`

### Alarms

- `GET /api/alarms`
- `GET /api/alarms?status=active`
- `GET /api/alarms?type=HARD_IMPACT`
- `GET /api/alarms/active`
- `PATCH /api/alarms/:id/resolve`

### Devices

- `GET /api/devices`
- `POST /api/devices`
- `PATCH /api/devices/:id/status`

### Shifts

- `POST /api/shifts/start`
- `PATCH /api/shifts/:id/end`
- `GET /api/shifts/active`

### Zones

- `POST /api/zones`
- `GET /api/zones`
- `POST /api/zones/scan`

### Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/live-workers`
- `GET /api/dashboard/risk-chart/:workerId`

### Emergency

- `POST /api/emergency`

## Postman Test Sırası

1. `GET /api/health`
2. Terminalde `npm run seed`
3. `POST /api/auth/login` admin
4. `POST /api/auth/login` worker
5. Admin token ile `GET /api/dashboard/summary`
6. Worker token ile `POST /api/sensor-data` normal veri
7. Worker token ile `POST /api/sensor-data` yüksek ivme verisi
8. Admin token ile `GET /api/alarms`
9. Worker token ile `POST /api/emergency`
10. Worker token ile `POST /api/zones/scan`
11. Admin token ile `GET /api/dashboard/risk-chart/:workerId`

## Örnek Request Body'leri

### Register

```json
{
  "name": "Admin User",
  "email": "admin@safeworker.com",
  "password": "123456",
  "role": "admin"
}
```

### Login

```json
{
  "email": "admin@safeworker.com",
  "password": "123456"
}
```

### Cihaz Oluşturma

```json
{
  "workerId": "SEED_WORKER_ID",
  "deviceCode": "DEVICE-001",
  "deviceName": "Worker Phone"
}
```

### Vardiya Başlatma

```json
{
  "workerId": "SEED_WORKER_ID",
  "deviceId": "SEED_DEVICE_ID"
}
```

### Normal Sensör Verisi

```json
{
  "workerId": "SEED_WORKER_ID",
  "deviceId": "SEED_DEVICE_ID",
  "timestamp": "2026-05-25T15:30:00.000Z",
  "accelerometer": { "x": 1, "y": 2, "z": 3 },
  "gyroscope": { "x": 0.1, "y": 0.2, "z": 0.3 },
  "batteryLevel": 80,
  "networkStatus": "online",
  "inactivity": false
}
```

### Sert Darbe

```json
{
  "workerId": "SEED_WORKER_ID",
  "deviceId": "SEED_DEVICE_ID",
  "timestamp": "2026-05-25T15:31:00.000Z",
  "accelerometer": { "x": 30, "y": 5, "z": 4 },
  "gyroscope": { "x": 0.1, "y": 0.2, "z": 0.3 },
  "batteryLevel": 80,
  "networkStatus": "online",
  "inactivity": false
}
```

### Düşme Şüphesi

```json
{
  "workerId": "SEED_WORKER_ID",
  "deviceId": "SEED_DEVICE_ID",
  "timestamp": "2026-05-25T15:32:00.000Z",
  "accelerometer": { "x": 22, "y": 5, "z": 3 },
  "gyroscope": { "x": 9, "y": 3, "z": 2 },
  "batteryLevel": 70,
  "networkStatus": "online",
  "inactivity": false
}
```

### Düşük Pil

```json
{
  "workerId": "SEED_WORKER_ID",
  "deviceId": "SEED_DEVICE_ID",
  "timestamp": "2026-05-25T15:33:00.000Z",
  "accelerometer": { "x": 1, "y": 1, "z": 2 },
  "gyroscope": { "x": 0.1, "y": 0.2, "z": 0.3 },
  "batteryLevel": 10,
  "networkStatus": "online",
  "inactivity": false
}
```

### Acil Durum

```json
{
  "workerId": "SEED_WORKER_ID",
  "deviceId": "SEED_DEVICE_ID",
  "message": "Acil durum bildirimi"
}
```

### QR Zone Scan

```json
{
  "workerId": "SEED_WORKER_ID",
  "qrCode": "ZONE-CHEM-001"
}
```

## Risk Analizi Kuralları

- `accelerationMagnitude > 25`: +40 ve `HARD_IMPACT`
- `accelerationMagnitude > 20` ve `rotationMagnitude > 8`: +35 ve `FALL_RISK`
- `inactivity === true`: +25 ve `INACTIVITY`
- `batteryLevel < 15`: +10 ve `LOW_BATTERY`
- `networkStatus === "offline"`: +30 ve `CONNECTION_LOST`
- Maksimum risk puanı: 100
- `0-30`: normal
- `31-60`: warning
- `61-100`: danger

## Bilinen Kısıtlar

- GPS kullanılmaz.
- Kamera, harita, görüntü işleme, derin öğrenme ve Raspberry Pi entegrasyonu yoktur.
- Socket.io eventleri backend tarafında hazırdır; frontend istemcisi bu MVP kapsamında yoktur.
- Demo amaçlı register endpointi role alanı kabul eder. Gerçek üretim ortamında admin oluşturma kontrollü yapılmalıdır.
- Alarm tekrarlarını engelleyen rate limit veya deduplication mekanizması bu MVP kapsamına dahil edilmemiştir.
