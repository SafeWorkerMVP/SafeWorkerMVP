# SafeWorker MVP

SafeWorker; Node.js backend, React dashboard ve Flutter mobil uygulamadan oluşan iş güvenliği MVP projesidir.

## Klasörler

- `backend/`: Express.js, MongoDB, JWT, Socket.io API
- `dashboard/`: Admin/İSG sorumlusu için React dashboard
- `mobile/`: Worker kullanıcısı için Flutter mobil uygulama

## Hızlı Başlangıç

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Dashboard:

```bash
cd dashboard
npm install
npm run dev
```

Mobil:

```bash
cd mobile
flutter pub get
flutter run
```

Detaylı kurulum ve test akışları ilgili klasörlerin README dosyalarındadır.
