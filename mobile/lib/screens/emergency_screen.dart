import 'package:flutter/material.dart';

import '../models/api_response.dart';
import '../services/emergency_service.dart';
import '../storage/local_storage.dart';

class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({super.key});

  @override
  State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  final _emergencyService = EmergencyService();
  bool _isSending = false;
  String _message = 'Acil durum butonu yalnızca demo amaçlıdır.';

  Future<void> _sendEmergency() async {
    setState(() => _isSending = true);

    try {
      final workerId = await LocalStorage.getUserId();
      final deviceId = await LocalStorage.getDeviceId();
      final shiftId = await LocalStorage.getShiftId();

      if (workerId == null || workerId.isEmpty) {
        _showMessage('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      if (deviceId == null || deviceId.isEmpty) {
        _showMessage('Lütfen önce Device ID girin.');
        return;
      }

      await _emergencyService.sendEmergency(
        workerId: workerId,
        deviceId: deviceId,
        shiftId: shiftId,
      );

      _showMessage('Acil durum bildirimi gönderildi.');
    } on ApiException catch (error) {
      _showMessage(error.message);
    } catch (_) {
      _showMessage("Backend'e bağlanılamadı. API adresini kontrol edin.");
    } finally {
      if (mounted) {
        setState(() => _isSending = false);
      }
    }
  }

  void _showMessage(String message) {
    if (!mounted) return;
    setState(() => _message = message);
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Acil Durum')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.warning_amber_rounded,
                        color: Color(0xFFDC2626),
                        size: 68,
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Manuel Acil Durum Bildirimi',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Butona basıldığında backend üzerinde EMERGENCY_BUTTON alarmı oluşturulur.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        _message,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 76,
                child: FilledButton.icon(
                  onPressed: _isSending ? null : _sendEmergency,
                  icon: _isSending
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        )
                      : const Icon(Icons.sos, size: 30),
                  label: Text(
                    _isSending ? 'Gönderiliyor' : 'Acil Durum Gönder',
                  ),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFFDC2626),
                    foregroundColor: Colors.white,
                    textStyle: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
