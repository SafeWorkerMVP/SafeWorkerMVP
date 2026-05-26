import 'package:flutter/material.dart';

import '../models/api_response.dart';
import '../models/sensor_payload.dart';
import '../services/sensor_service.dart';
import '../storage/local_storage.dart';
import '../widgets/primary_button.dart';
import '../widgets/status_card.dart';

class DemoSimulationScreen extends StatefulWidget {
  const DemoSimulationScreen({super.key});

  @override
  State<DemoSimulationScreen> createState() => _DemoSimulationScreenState();
}

class _DemoSimulationScreenState extends State<DemoSimulationScreen> {
  final _sensorService = SensorService();
  bool _isSending = false;
  String _lastResult = 'Henüz demo verisi gönderilmedi.';

  Future<void> _sendDemo({
    required String title,
    required SensorVector accelerometer,
    required SensorVector gyroscope,
    required int batteryLevel,
    required String networkStatus,
    required bool inactivity,
  }) async {
    setState(() => _isSending = true);

    try {
      final workerId = await LocalStorage.getUserId();
      final deviceId = await LocalStorage.getDeviceId();
      final shiftId = await LocalStorage.getShiftId();

      if (workerId == null || workerId.isEmpty) {
        _showResult('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      if (deviceId == null || deviceId.isEmpty) {
        _showResult('Lütfen önce Device ID girin.');
        return;
      }

      final payload = SensorPayload(
        workerId: workerId,
        deviceId: deviceId,
        shiftId: shiftId,
        timestamp: DateTime.now(),
        accelerometer: accelerometer,
        gyroscope: gyroscope,
        batteryLevel: batteryLevel,
        networkStatus: networkStatus,
        inactivity: inactivity,
      );

      final response = await _sensorService.sendSensorData(payload);
      final data = response.data as Map<String, dynamic>;
      final sensorData = data['sensorData'] as Map<String, dynamic>?;
      final alarms = data['alarms'] as List<dynamic>? ?? [];
      final riskScore = sensorData?['riskScore']?.toString() ?? '-';
      final riskLevel = sensorData?['riskLevel']?.toString() ?? '-';
      _showResult(
        '$title gönderildi. Risk: $riskLevel / $riskScore. Alarm: ${alarms.length}',
      );
    } on ApiException catch (error) {
      _showResult(error.message);
    } catch (_) {
      _showResult("Backend'e bağlanılamadı. API adresini kontrol edin.");
    } finally {
      if (mounted) {
        setState(() => _isSending = false);
      }
    }
  }

  void _showResult(String message) {
    if (!mounted) return;
    setState(() => _lastResult = message);
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Demo / Simülasyon')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            StatusCard(
              title: 'Sonuç',
              value: _lastResult,
              icon: Icons.analytics_outlined,
            ),
            PrimaryButton(
              label: 'Normal Veri Gönder',
              icon: Icons.check_circle_outline,
              isLoading: _isSending,
              onPressed: () => _sendDemo(
                title: 'Normal veri',
                accelerometer: const SensorVector(x: 1, y: 2, z: 3),
                gyroscope: const SensorVector(x: 0.1, y: 0.2, z: 0.3),
                batteryLevel: 80,
                networkStatus: 'online',
                inactivity: false,
              ),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'Sert Darbe Simüle Et',
              icon: Icons.flash_on,
              backgroundColor: const Color(0xFFB45309),
              isLoading: _isSending,
              onPressed: () => _sendDemo(
                title: 'Sert darbe',
                accelerometer: const SensorVector(x: 30, y: 5, z: 4),
                gyroscope: const SensorVector(x: 0.1, y: 0.2, z: 0.3),
                batteryLevel: 80,
                networkStatus: 'online',
                inactivity: false,
              ),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'Düşme Şüphesi Simüle Et',
              icon: Icons.personal_injury_outlined,
              backgroundColor: const Color(0xFFB45309),
              isLoading: _isSending,
              onPressed: () => _sendDemo(
                title: 'Düşme şüphesi',
                accelerometer: const SensorVector(x: 22, y: 5, z: 3),
                gyroscope: const SensorVector(x: 9, y: 3, z: 2),
                batteryLevel: 70,
                networkStatus: 'online',
                inactivity: false,
              ),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'Düşük Pil Simüle Et',
              icon: Icons.battery_alert,
              backgroundColor: const Color(0xFFB45309),
              isLoading: _isSending,
              onPressed: () => _sendDemo(
                title: 'Düşük pil',
                accelerometer: const SensorVector(x: 1, y: 1, z: 2),
                gyroscope: const SensorVector(x: 0.1, y: 0.2, z: 0.3),
                batteryLevel: 10,
                networkStatus: 'online',
                inactivity: false,
              ),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'Hareketsizlik Simüle Et',
              icon: Icons.motion_photos_pause_outlined,
              backgroundColor: const Color(0xFF475569),
              isLoading: _isSending,
              onPressed: () => _sendDemo(
                title: 'Hareketsizlik',
                accelerometer: const SensorVector(x: 0.01, y: 0.01, z: 0.01),
                gyroscope: const SensorVector(x: 0.01, y: 0.01, z: 0.01),
                batteryLevel: 70,
                networkStatus: 'online',
                inactivity: true,
              ),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'Bağlantı Riski Simüle Et',
              icon: Icons.wifi_off,
              backgroundColor: const Color(0xFFDC2626),
              isLoading: _isSending,
              onPressed: () => _sendDemo(
                title: 'Bağlantı riski',
                accelerometer: const SensorVector(x: 1, y: 2, z: 3),
                gyroscope: const SensorVector(x: 0.1, y: 0.2, z: 0.3),
                batteryLevel: 80,
                networkStatus: 'offline',
                inactivity: false,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
