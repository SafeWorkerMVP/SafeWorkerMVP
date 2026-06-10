import 'dart:async';
import 'dart:math';

import 'package:battery_plus/battery_plus.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:sensors_plus/sensors_plus.dart';

import '../models/api_response.dart';
import '../models/sensor_payload.dart';
import '../services/sensor_service.dart';
import '../storage/local_storage.dart';
import '../utils/date_utils.dart';
import '../widgets/primary_button.dart';
import '../widgets/sensor_value_card.dart';
import '../widgets/status_card.dart';

class SensorTrackingScreen extends StatefulWidget {
  const SensorTrackingScreen({super.key});

  @override
  State<SensorTrackingScreen> createState() => _SensorTrackingScreenState();
}

class _SensorTrackingScreenState extends State<SensorTrackingScreen> {
  final _sensorService = SensorService();
  final _battery = Battery();

  StreamSubscription<AccelerometerEvent>? _accelerometerSubscription;
  StreamSubscription<GyroscopeEvent>? _gyroscopeSubscription;
  Timer? _autoSendTimer;

  double _accX = 1;
  double _accY = 2;
  double _accZ = 3;
  double _gyroX = 0.1;
  double _gyroY = 0.2;
  double _gyroZ = 0.3;

  double _lastMovementMagnitude = 0;
  DateTime _lastMovementAt = DateTime.now();

  int _batteryLevel = 80;
  String _networkStatus = 'online';
  String _lastMessage = 'Henüz veri gönderilmedi.';
  bool _isSending = false;
  bool _sensorWarningShown = false;

  bool get _isInactive {
    final secondsWithoutMovement =
        DateTime.now().difference(_lastMovementAt).inSeconds;

    return secondsWithoutMovement >= 30;
  }

  @override
  void initState() {
    super.initState();
    _startSensorStreams();
    _refreshDeviceStatus();
  }

  @override
  void dispose() {
    _autoSendTimer?.cancel();
    _accelerometerSubscription?.cancel();
    _gyroscopeSubscription?.cancel();
    super.dispose();
  }

  double _calculateMagnitude(double x, double y, double z) {
    return sqrt(x * x + y * y + z * z);
  }

  void _updateMovementStatus(double x, double y, double z) {
    final currentMagnitude = _calculateMagnitude(x, y, z);
    final difference = (currentMagnitude - _lastMovementMagnitude).abs();

    if (difference > 0.35) {
      _lastMovementAt = DateTime.now();
    }

    _lastMovementMagnitude = currentMagnitude;
  }

  void _startSensorStreams() {
    try {
      _accelerometerSubscription = accelerometerEventStream().listen((event) {
        if (!mounted) return;

        _updateMovementStatus(event.x, event.y, event.z);

        setState(() {
          _accX = event.x;
          _accY = event.y;
          _accZ = event.z;
        });
      }, onError: (_) => _setSensorWarning());

      _gyroscopeSubscription = gyroscopeEventStream().listen((event) {
        if (!mounted) return;

        setState(() {
          _gyroX = event.x;
          _gyroY = event.y;
          _gyroZ = event.z;
        });
      }, onError: (_) => _setSensorWarning());
    } catch (_) {
      _setSensorWarning();
    }
  }

  void _setSensorWarning() {
    if (_sensorWarningShown || !mounted) return;

    setState(() {
      _sensorWarningShown = true;
      _lastMessage =
          'Sensör okunamadı. Varsayılan normal değerler kullanılacak.';
    });
  }

  Future<void> _refreshDeviceStatus() async {
    try {
      final batteryLevel = await _battery.batteryLevel;
      final connectivity = await Connectivity().checkConnectivity();
      final isOffline = connectivity.contains(ConnectivityResult.none);

      if (!mounted) return;

      setState(() {
        _batteryLevel = batteryLevel;
        _networkStatus = isOffline ? 'offline' : 'online';
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        _batteryLevel = 80;
        _networkStatus = 'online';
      });
    }
  }

  Future<SensorPayload?> _buildPayload() async {
    final workerId = await LocalStorage.getUserId();
    final deviceId = await LocalStorage.getDeviceId();
    final shiftId = await LocalStorage.getShiftId();

    if (workerId == null || workerId.isEmpty) {
      _showMessage('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return null;
    }

    if (deviceId == null || deviceId.isEmpty) {
      _showMessage('Lütfen önce Device ID girin.');
      return null;
    }

    await _refreshDeviceStatus();

    return SensorPayload(
      workerId: workerId,
      deviceId: deviceId,
      shiftId: shiftId,
      timestamp: DateTime.now(),
      accelerometer: SensorVector(x: _accX, y: _accY, z: _accZ),
      gyroscope: SensorVector(x: _gyroX, y: _gyroY, z: _gyroZ),
      batteryLevel: _batteryLevel,
      networkStatus: _networkStatus,
      inactivity: _isInactive,
    );
  }

  Future<void> _sendSensorData({bool silent = false}) async {
    if (!silent) {
      setState(() => _isSending = true);
    }

    try {
      final payload = await _buildPayload();
      if (payload == null) return;

      final response = await _sensorService.sendSensorData(payload);
      final sensorData =
          (response.data as Map<String, dynamic>)['sensorData']
              as Map<String, dynamic>?;

      final riskLevel = sensorData?['riskLevel']?.toString() ?? '-';
      final riskScore = sensorData?['riskScore']?.toString() ?? '-';

      _showMessage('Veri gönderildi. Risk: $riskLevel / $riskScore');
    } on ApiException catch (error) {
      _showMessage(error.message);
    } catch (_) {
      _showMessage("Backend'e bağlanılamadı. API adresini kontrol edin.");
    } finally {
      if (mounted && !silent) {
        setState(() => _isSending = false);
      }
    }
  }

  void _startAutoSend() {
    _autoSendTimer?.cancel();

    _autoSendTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      _sendSensorData(silent: true);
    });

    _showMessage(
      'Otomatik gönderim başlatıldı. Her 5 saniyede bir veri gönderilecek.',
    );
  }

  void _stopAutoSend() {
    _autoSendTimer?.cancel();
    _autoSendTimer = null;
    _showMessage('Otomatik gönderim durduruldu.');
  }

  void _showMessage(String message) {
    if (!mounted) return;

    setState(() => _lastMessage = '${SafeDateUtils.timeNowText()} - $message');

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final isAutoSending = _autoSendTimer?.isActive == true;
    final secondsWithoutMovement =
        DateTime.now().difference(_lastMovementAt).inSeconds;

    return Scaffold(
      appBar: AppBar(title: const Text('Sensör Takibi')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            SensorValueCard(title: 'İvmeölçer', x: _accX, y: _accY, z: _accZ),
            SensorValueCard(title: 'Jiroskop', x: _gyroX, y: _gyroY, z: _gyroZ),
            Row(
              children: [
                Expanded(
                  child: StatusCard(
                    title: 'Pil',
                    value: '%$_batteryLevel',
                    icon: Icons.battery_charging_full,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: StatusCard(
                    title: 'Bağlantı',
                    value: _networkStatus,
                    icon: Icons.wifi,
                    color: _networkStatus == 'online'
                        ? const Color(0xFF15803D)
                        : const Color(0xFFDC2626),
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: StatusCard(
                    title: 'Hareket',
                    value: _isInactive ? 'Hareketsiz' : 'Aktif',
                    icon: _isInactive
                        ? Icons.personal_injury
                        : Icons.directions_walk,
                    color: _isInactive
                        ? const Color(0xFFDC2626)
                        : const Color(0xFF15803D),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: StatusCard(
                    title: 'Son hareket',
                    value: '$secondsWithoutMovement sn',
                    icon: Icons.timer,
                    color: secondsWithoutMovement >= 30
                        ? const Color(0xFFDC2626)
                        : const Color(0xFF0F766E),
                  ),
                ),
              ],
            ),
            if (isAutoSending)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.sync, color: Color(0xFF15803D)),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Canlı veri gönderimi aktif. Cihaz her 5 saniyede bir backend sistemine sensör verisi gönderiyor.',
                          style: TextStyle(fontWeight: FontWeight.w800),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  _lastMessage,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
            ),
            PrimaryButton(
              label: 'Tek Veri Gönder',
              icon: Icons.send,
              isLoading: _isSending,
              onPressed: () => _sendSensorData(),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: isAutoSending
                  ? 'Otomatik Gönderim Aktif'
                  : 'Otomatik Gönderimi Başlat',
              icon: Icons.play_arrow,
              backgroundColor: const Color(0xFF15803D),
              onPressed: isAutoSending ? null : _startAutoSend,
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'Otomatik Gönderimi Durdur',
              icon: Icons.stop,
              backgroundColor: const Color(0xFF475569),
              onPressed: isAutoSending ? _stopAutoSend : null,
            ),
          ],
        ),
      ),
    );
  }
}