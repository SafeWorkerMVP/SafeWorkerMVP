# SafeWorker MVP

SafeWorker MVP; Node.js backend, React dashboard ve Flutter mobil uygulamadan oluşan bir **İş Sağlığı ve Güvenliği için Mobil Risk Algılama Platformu** projesidir.

Bu sistemde saha çalışanlarının telefonları birer IoT uç cihazı gibi kullanılır. Mobil uygulama; ivmeölçer, jiroskop, pil durumu, ağ durumu ve GPS konumu gibi verileri toplar. Backend bu verileri analiz ederek risk puanı oluşturur, gerekli durumlarda alarm üretir ve admin dashboard üzerinde gerçek zamanlı olarak gösterir.

---

## Proje Senaryosu

Proje, dönem projesi föyündeki **“İş Sağlığı ve Güvenliği İçin Mobil Risk Algılama”** senaryosuna göre geliştirilmiştir.

Sistem şu durumları algılamayı hedefler:

* Sert darbe algılanması
* Düşme şüphesi
* Tehlikeli bölgeye giriş
* Olay sonrası uzun süre hareketsizlik
* Yüksek risk puanı oluşması
* Manuel SOS / acil durum bildirimi
* Düşük pil veya bağlantı kaybı

---

## Temel Özellikler

* Admin ve Worker kullanıcı rolleri
* JWT tabanlı giriş ve yetkilendirme
* Mobil cihazdan sensör verisi toplama
* İvmeölçer ve jiroskop verisi ile risk analizi
* Pil ve ağ durumu takibi
* GPS konum desteği
* QR kod ile tehlikeli bölge girişi
* Manuel SOS / Acil Durum bildirimi
* Risk puanı hesaplama
* Alarm oluşturma ve alarm geçmişi
* Alarm çözme sistemi
* Alarm filtreleme: Tümü, Aktif, Çözülen, Kritik, SOS
* Dashboard üzerinde canlı çalışan takibi
* Risk grafiği ve tablo gösterimleri
* Socket.IO ile gerçek zamanlı bildirim
* Kritik ve SOS alarmlarında sesli uyarı
* Swagger / OpenAPI API dokümantasyonu
* CSV alarm dışa aktarma
* Docker desteği

---

## Kullanılan Teknolojiler

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Socket.IO
* Swagger / OpenAPI

### Dashboard

* React
* Vite
* Recharts
* Socket.IO Client

### Mobil

* Flutter
* sensors_plus
* battery_plus
* connectivity_plus
* geolocator
* shared_preferences
* http

### Diğer

* Git / GitHub
* Docker / Docker Compose
* MongoDB Compass

---

## Klasör Yapısı

```text
SafeWorkerMVP/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── docs/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── README.md
│
├── dashboard/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── socket/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── README.md
│
├── mobile/
│   ├── lib/
│   │   ├── config/
│   │   ├── models/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── storage/
│   │   ├── utils/
│   │   ├── widgets/
│   │   └── main.dart
│   ├── android/
│   ├── pubspec.yaml
│   └── README.md
│
├── docker-compose.yml
└── README.md
```

---

## Kurulum

### Gereksinimler

* Node.js
* npm
* MongoDB
* Git
* Flutter SDK
* Android Studio veya fiziksel Android cihaz
* İsteğe bağlı: Docker Desktop

---

## Backend Kurulumu

```bash
cd backend
npm install
```

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

Windows CMD kullanıyorsanız:

```cmd
copy .env.example .env
```

Örnek `.env` içeriği:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/safeworker
JWT_SECRET=safeworker_secret_key
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

Seed verilerini yüklemek için:

```bash
npm run seed
```

Backend’i başlatmak için:

```bash
npm run dev
```

Backend başarıyla çalıştığında:

```text
MongoDB connected
SafeWorker backend running on port 3000
```

çıktısı görülür.

Backend sağlık kontrolü:

```text
http://localhost:3000/api/health
```

Swagger API dokümantasyonu:

```text
http://localhost:3000/api-docs
```

---

## Dashboard Kurulumu

```bash
cd dashboard
npm install
npm run dev
```

Dashboard varsayılan olarak şu adreste çalışır:

```text
http://localhost:5173
```

---

## Mobil Uygulama Kurulumu

```bash
cd mobile
flutter pub get
flutter run
```

Mobil uygulama çalıştırılmadan önce Flutter SDK ve Android ortamı kurulmuş olmalıdır.

Mobil uygulamada worker kullanıcısı giriş yapar ve şu işlemleri yapabilir:

* Sensör verisi gönderme
* Otomatik veri gönderimi başlatma
* GPS konumu gönderme
* QR bölge girişi yapma
* Acil durum bildirimi gönderme

---

## Test Kullanıcıları

Seed işleminden sonra örnek kullanıcılar:

### Admin

```text
E-posta: admin@safeworker.com
Şifre: 123456
```

### Worker

```text
E-posta: worker@safeworker.com
Şifre: 123456
```

---

## API Dokümantasyonu

Swagger UI üzerinden API endpointleri görüntülenebilir:

```text
http://localhost:3000/api-docs
```

Başlıca endpointler:

### Auth

```text
POST /api/auth/login
```

### Sensor Data

```text
POST /api/sensor-data
GET  /api/sensor-data/worker/:workerId
```

### Alarms

```text
GET   /api/alarms
GET   /api/alarms/active
GET   /api/alarms/export.csv
PATCH /api/alarms/:id/resolve
```

### Emergency

```text
POST /api/emergency
```

### Zones

```text
GET  /api/zones
POST /api/zones
POST /api/zones/scan
```

### Dashboard

```text
GET /api/dashboard/summary
GET /api/dashboard/live-workers
```

---

## Veri Modeli

Projede kullanılan temel veri modelleri:

### User

Kullanıcı bilgilerini tutar.

* name
* email
* password
* role

Roller:

* admin
* worker

### Device

Çalışana bağlı mobil cihaz bilgilerini tutar.

* deviceCode
* deviceName
* workerId
* batteryLevel
* networkStatus
* lastSeen

### SensorData

Mobil cihazdan gelen sensör kayıtlarını tutar.

* workerId
* deviceId
* shiftId
* timestamp
* accelerometer
* gyroscope
* batteryLevel
* networkStatus
* location
* inactivity
* riskScore
* riskLevel
* riskFactors

### Alarm

Riskli durumlarda oluşturulan alarm kayıtlarını tutar.

* workerId
* deviceId
* shiftId
* type
* message
* riskScore
* status
* resolvedAt

### DangerZone

QR kod ile tanımlanan riskli alanları tutar.

* zoneName
* qrCode
* riskLevel
* description
* isActive

### ZoneEntry

Çalışanın QR bölge giriş kayıtlarını tutar.

* workerId
* zoneId
* createdAt

---

## Risk Analizi Mantığı

Backend tarafında eşik tabanlı bir risk analizi uygulanır.

Risk faktörleri:

```text
Sert darbe: +40
Düşme riski: +35
Olay sonrası hareketsizlik: +10
Düşük pil: +10
Bağlantı kaybı: +30
Normal hareketsizlik: +0
```

Risk seviyeleri:

```text
0 - 30: normal
31 - 60: warning
61 - 100: danger
```

Hareketsizlik tek başına risk olarak değerlendirilmez. Çalışan mola veriyor veya sabit bir görev yapıyor olabilir. Bu nedenle hareketsizlik yalnızca sert darbe veya düşme riski sonrasında anlamlı hale gelir.

---

## Alarm Türleri

Sistemde kullanılan alarm türleri:

```text
HARD_IMPACT
FALL_RISK
INACTIVITY
LOW_BATTERY
CONNECTION_LOST
EMERGENCY_BUTTON
DANGER_ZONE_ENTRY
```

### HARD_IMPACT

Ani ve yüksek ivme algılandığında oluşur.

### FALL_RISK

Yüksek ivme ve yüksek jiroskop hareketi birlikte algılandığında oluşur.

### INACTIVITY

Sert darbe veya düşme riskinden sonra uzun süre hareket algılanmadığında oluşur.

### LOW_BATTERY

Mobil cihazın pil seviyesi kritik seviyeye düştüğünde oluşur.

### CONNECTION_LOST

Mobil cihaz çevrimdışı duruma geçtiğinde oluşur.

### EMERGENCY_BUTTON

Worker kullanıcısı manuel SOS butonuna bastığında oluşur.

### DANGER_ZONE_ENTRY

Çalışan yüksek riskli QR bölgeye giriş yaptığında oluşur.

---

## Dashboard Özellikleri

Admin dashboard üzerinden:

* Toplam çalışan sayısı
* Aktif çalışan sayısı
* Toplam cihaz sayısı
* Aktif alarm sayısı
* Günlük alarm sayısı
* Ortalama risk puanı
* Canlı çalışan durumları
* Alarm geçmişi
* Risk grafiği
* Tehlikeli bölgeler

görülebilir.

Alarm ekranında:

* Tümü
* Aktif
* Çözülen
* Kritik
* SOS

filtreleri bulunur.

Kritik alarm veya SOS bildirimi geldiğinde dashboard sesli alarm verebilir. Sesli alarmın çalışması için adminin dashboard üzerinde “Sesli Alarmı Aktifleştir” butonuna bir kez basması gerekir.

---

## Mobil Uygulama Özellikleri

Worker kullanıcısı mobil uygulama üzerinden:

* Giriş yapabilir
* Cihaz ID bilgisiyle sisteme bağlanabilir
* Sensör verisi gönderebilir
* Otomatik sensör veri gönderimini başlatabilir
* GPS konumunu gönderebilir
* QR kod ile bölge girişi yapabilir
* SOS / acil durum bildirimi gönderebilir

---

## Gerçek Zamanlı Sistem

Projede Socket.IO kullanılmaktadır.

Backend tarafında olaylar yayınlanır:

```text
sensor:new
alarm:new
worker:status
```

Dashboard bu olayları dinleyerek sayfayı yenilemeye gerek kalmadan canlı güncellenir.

---

## Docker ile Çalıştırma

Projeye Docker desteği eklenmiştir.

Ana dizinde:

```bash
docker compose up --build
```

komutu ile servisler başlatılabilir.

Docker servisleri:

* MongoDB
* Backend
* Dashboard

İlk çalıştırmadan sonra seed verisi yüklemek için:

```bash
docker compose exec backend npm run seed
```

Adresler:

```text
Backend:  http://localhost:3000
Swagger:  http://localhost:3000/api-docs
Dashboard: http://localhost:5173
MongoDB:  localhost:27017
```

---

## CSV Alarm Raporu

Alarm kayıtları CSV olarak dışa aktarılabilir:

```text
GET /api/alarms/export.csv
```

Bu özellik alarm geçmişinin raporlanması için kullanılır.

---

## Test Senaryoları

Test aşamasında aşağıdaki senaryolar doğrulanacaktır:

### 1. Normal Sensör Verisi

Beklenen sonuç:

* Sensör verisi backend’e gönderilir.
* Risk seviyesi normal olur.
* Alarm oluşmaz.

### 2. Sert Darbe

Beklenen sonuç:

* HARD_IMPACT alarmı oluşur.
* Dashboard alarm listesi güncellenir.

### 3. Düşme Riski

Beklenen sonuç:

* FALL_RISK alarmı oluşur.
* Risk puanı yükselir.

### 4. Olay Sonrası Hareketsizlik

Beklenen sonuç:

* Düşme veya darbe sonrası hareketsizlik algılanır.
* INACTIVITY alarmı oluşur.

### 5. SOS / Acil Durum

Beklenen sonuç:

* EMERGENCY_BUTTON alarmı oluşur.
* Risk skoru 100 olur.
* Dashboard’da sesli uyarı çalışır.

### 6. Tehlikeli Bölge Girişi

Beklenen sonuç:

* QR kod backend’e gönderilir.
* Bölge yüksek riskliyse DANGER_ZONE_ENTRY alarmı oluşur.

### 7. Canlı Dashboard Güncellemesi

Beklenen sonuç:

* Yeni sensör verisi geldiğinde dashboard canlı güncellenir.
* Alarm geldiğinde alarm listesi güncellenir.

### 8. GPS Konum Gönderimi

Beklenen sonuç:

* Mobil uygulama GPS konumu alır.
* Sensör verisi ile birlikte backend’e gönderir.
* MongoDB SensorData kaydında location alanı oluşur.

---

## Bonus Özellikler

Projeye eklenen bonus özellikler:

* Swagger / OpenAPI entegrasyonu
* Docker desteği
* Socket.IO ile canlı veri akışı
* GPS konum desteği
* CSV alarm dışa aktarma
* Sesli kritik alarm sistemi
* Gelişmiş alarm filtreleme
* Rol bazlı erişim kontrolü

---

## GitHub Kullanımı

Değişiklikleri göndermek için:

```bash
git status
git add .
git commit -m "commit mesajı"
git push origin main
```

GitHub Desktop kullanılıyorsa:

1. Changes sekmesinde değişiklikler kontrol edilir.
2. Summary alanına commit mesajı yazılır.
3. Commit to main yapılır.
4. Push origin yapılır.

---

## Notlar

* Bu proje akademik dönem projesi kapsamında geliştirilmiş bir MVP’dir.
* Sistem üretim ortamı için değil, prototip ve demo amacıyla hazırlanmıştır.
* Kamera, mikrofon gibi hassas veri kaynakları kullanılmamıştır.
* GPS verisi yalnızca iş güvenliği senaryosunda konum destekli izleme amacıyla eklenmiştir.
* Gerçek test sonuçları, demo testleri tamamlandıktan sonra rapora eklenecektir.
