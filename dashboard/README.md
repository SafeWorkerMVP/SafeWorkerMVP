.

## Kurulum

```bash
cd dashboard
npm install
npm run dev
```

Tarayıcı:

```text
http://localhost:5173
```

## Backend URL Ayarı

Varsayılan API adresi:

```text
http://localhost:3000/api
```

İsteğe bağlı olarak `.env` dosyası oluşturulabilir:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Demo Admin

```text
email: admin@safeworker.com
password: 123456
```

Login başarılı olunca JWT token ve user bilgisi `localStorage` içine kaydedilir. Axios interceptor tüm API isteklerine `Authorization: Bearer TOKEN` header'ı ekler.

## Sayfalar

- Login
- Dashboard özeti
- Canlı çalışanlar
- Alarm geçmişi ve alarm çözme
- Çalışan bazlı risk grafiği
- Tehlikeli bölgeler

## Bağlanılan Endpointler

- `POST /auth/login`
- `GET /auth/me`
- `GET /dashboard/summary`
- `GET /dashboard/live-workers`
- `GET /dashboard/risk-chart/:workerId`
- `GET /devices`
- `GET /alarms`
- `PATCH /alarms/:id/resolve`
- `GET /zones`

## Socket ve Polling

Dashboard `socket.io-client` ile `http://localhost:3000` adresine bağlanır ve şu eventleri dinler:

- `alarm:new`
- `sensor:new`
- `worker:status`
- `dashboard:summary`

Socket çalışmazsa uygulama çökmez. Dashboard özeti ve canlı çalışanlar sayfası her 5 saniyede bir polling ile veriyi yeniler.
