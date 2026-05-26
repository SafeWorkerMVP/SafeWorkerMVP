

## Kurulum

```bash
cd mobile
flutter pub get
flutter run
```

## API_BASE_URL Değiştirme

API adresi tek dosyada tutulur:

```text
lib/config/api_config.dart
```

Varsayılan değer:

```dart
static const String baseUrl = 'http://192.168.1.102:3000/api';
```

Gerçek telefonda test ederken `localhost` telefonun kendisini gösterir. Bu yüzden bilgisayarın yerel IP adresini kullanın:

```dart
static const String baseUrl = 'http://192.168.1.25:3000/api';
```

Android emülatörde gerekiyorsa şu adres kullanılabilir:

```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

## Demo Worker

```text
email: worker@safeworker.com
password: 123456
```

## Device ID

Backend `POST /sensor-data`, vardiya ve acil durum işlemlerinde `deviceId` ister. Uygulama ana ekranında `Device ID` alanı vardır. Seed çıktısındaki veya dashboard cihaz listesindeki cihaz ID değerini bu alana yazıp kaydedin.

Örnek seed çıktısı:

```text
SEED_DEVICE_ID=...
```

## Demo Akışı

1. Backend çalışsın: `http://localhost:3000/api/health`
2. Mobil uygulamada worker hesabı ile login olun.
3. Ana ekranda `Device ID` girilip kaydedilsin.
4. İsteğe bağlı olarak vardiya başlatılsın.
5. Sensör Takibi ekranından tek veri veya otomatik 5 saniyelik gönderim test edilsin.
6. Demo / Simülasyon ekranından risk senaryoları gönderilsin.
7. Acil Durum ekranından manuel alarm gönderilsin.
8. QR Bölge Girişi ekranından demo QR kodları gönderilsin.

## Sensör ve Demo Modu

Sensör Takibi ekranı gerçek cihaz sensörlerinden şu değerleri okumaya çalışır:

- İvmeölçer x/y/z
- Jiroskop x/y/z
- Pil seviyesi
- Bağlantı durumu

Sensör verisi gelmezse uygulama çökmez; varsayılan normal değerler kullanılır:

```text
accelerometer: x=1, y=2, z=3
gyroscope: x=0.1, y=0.2, z=0.3
```

Demo / Simülasyon ekranındaki hazır butonlar:

- Normal Veri Gönder
- Sert Darbe Simüle Et
- Düşme Şüphesi Simüle Et
- Düşük Pil Simüle Et
- Hareketsizlik Simüle Et
- Bağlantı Riski Simüle Et

## Bağlanılan Endpointler

- `POST /auth/login`
- `GET /auth/me`
- `POST /shifts/start`
- `PATCH /shifts/:id/end`
- `POST /sensor-data`
- `POST /emergency`
- `POST /zones/scan`

## Bilinen Kısıtlar

- Gerçek sensör değerleri cihazdan cihaza değişebilir.
- Emülatörde sensör verileri sınırlı olabilir.
- Bu uygulama üretim seviyesinde sertifikalı iş güvenliği ürünü değildir.
- QR kamera okuma MVP kapsamında zorunlu tutulmamıştır; demo QR kod gönderimi kullanılmıştır.
- Backend API adresi test ortamına göre değiştirilmelidir.
