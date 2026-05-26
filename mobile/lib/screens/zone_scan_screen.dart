import 'package:flutter/material.dart';

import '../models/api_response.dart';
import '../services/zone_service.dart';
import '../storage/local_storage.dart';
import '../widgets/primary_button.dart';
import '../widgets/status_card.dart';

class ZoneScanScreen extends StatefulWidget {
  const ZoneScanScreen({super.key});

  @override
  State<ZoneScanScreen> createState() => _ZoneScanScreenState();
}

class _ZoneScanScreenState extends State<ZoneScanScreen> {
  final _qrController = TextEditingController(text: 'ZONE-CHEM-001');
  final _zoneService = ZoneService();
  bool _isSending = false;
  String _lastResult = 'Demo QR kodu seçin veya manuel QR kod girin.';

  @override
  void dispose() {
    _qrController.dispose();
    super.dispose();
  }

  Future<void> _sendQr([String? demoCode]) async {
    if (demoCode != null) {
      _qrController.text = demoCode;
    }

    setState(() => _isSending = true);

    try {
      final workerId = await LocalStorage.getUserId();
      final deviceId = await LocalStorage.getDeviceId();
      final qrCode = _qrController.text.trim();

      if (workerId == null || workerId.isEmpty) {
        _showResult('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      if (deviceId == null || deviceId.isEmpty) {
        _showResult('Lütfen önce Device ID girin.');
        return;
      }

      if (qrCode.isEmpty) {
        _showResult('QR kod boş bırakılamaz.');
        return;
      }

      final response = await _zoneService.scanZone(
        workerId: workerId,
        qrCode: qrCode,
      );
      final data = response.data as Map<String, dynamic>;
      final alarm = data['alarm'] as Map<String, dynamic>?;

      if (alarm != null) {
        _showResult('Bölge girişi kaydedildi. Alarm: ${alarm['message']}');
      } else {
        _showResult('Bölge girişi kaydedildi.');
      }
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
      appBar: AppBar(title: const Text('QR Bölge Girişi')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            StatusCard(
              title: 'Sonuç',
              value: _lastResult,
              icon: Icons.qr_code_2,
            ),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Manuel QR Kod',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _qrController,
                      decoration: const InputDecoration(
                        labelText: 'QR kod',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    PrimaryButton(
                      label: 'Manuel QR Gönder',
                      icon: Icons.send,
                      isLoading: _isSending,
                      onPressed: () => _sendQr(),
                    ),
                  ],
                ),
              ),
            ),
            PrimaryButton(
              label: 'Kimyasal Depo QR Gönder',
              icon: Icons.science_outlined,
              backgroundColor: const Color(0xFFDC2626),
              isLoading: _isSending,
              onPressed: () => _sendQr('ZONE-CHEM-001'),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'Forklift Alanı QR Gönder',
              icon: Icons.warehouse_outlined,
              backgroundColor: const Color(0xFFB45309),
              isLoading: _isSending,
              onPressed: () => _sendQr('ZONE-FORK-001'),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'Bakım Alanı QR Gönder',
              icon: Icons.construction_outlined,
              backgroundColor: const Color(0xFFDC2626),
              isLoading: _isSending,
              onPressed: () => _sendQr('ZONE-MAINT-001'),
            ),
          ],
        ),
      ),
    );
  }
}
