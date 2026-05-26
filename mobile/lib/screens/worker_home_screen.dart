import 'package:flutter/material.dart';

import '../models/api_response.dart';
import '../models/user_model.dart';
import '../services/shift_service.dart';
import '../storage/local_storage.dart';
import '../widgets/primary_button.dart';
import '../widgets/status_card.dart';
import 'demo_simulation_screen.dart';
import 'emergency_screen.dart';
import 'login_screen.dart';
import 'sensor_tracking_screen.dart';
import 'zone_scan_screen.dart';

class WorkerHomeScreen extends StatefulWidget {
  const WorkerHomeScreen({super.key});

  @override
  State<WorkerHomeScreen> createState() => _WorkerHomeScreenState();
}

class _WorkerHomeScreenState extends State<WorkerHomeScreen> {
  final _deviceController = TextEditingController();
  final _shiftService = ShiftService();
  UserModel? _user;
  String? _shiftId;
  String? _message;
  bool _isBusy = false;

  @override
  void initState() {
    super.initState();
    _loadState();
  }

  @override
  void dispose() {
    _deviceController.dispose();
    super.dispose();
  }

  Future<void> _loadState() async {
    final user = await LocalStorage.getUser();
    final deviceId = await LocalStorage.getDeviceId();
    final shiftId = await LocalStorage.getShiftId();

    if (!mounted) return;
    setState(() {
      _user = user;
      _deviceController.text = deviceId ?? '';
      _shiftId = shiftId;
    });
  }

  Future<String?> _requireDeviceId() async {
    final deviceId = _deviceController.text.trim();
    if (deviceId.isEmpty) {
      _showMessage('Lütfen önce Device ID girin.');
      return null;
    }

    await LocalStorage.saveDeviceId(deviceId);
    return deviceId;
  }

  void _showMessage(String message) {
    setState(() => _message = message);
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _saveDeviceId() async {
    final deviceId = _deviceController.text.trim();
    if (deviceId.isEmpty) {
      _showMessage('Device ID boş bırakılamaz.');
      return;
    }

    await LocalStorage.saveDeviceId(deviceId);
    _showMessage('Device ID kaydedildi.');
  }

  Future<void> _startShift() async {
    final user = _user;
    final deviceId = await _requireDeviceId();

    if (user == null || deviceId == null) return;

    setState(() => _isBusy = true);
    try {
      final shiftId = await _shiftService.startShift(
        workerId: user.id,
        deviceId: deviceId,
      );

      setState(() => _shiftId = shiftId);
      _showMessage('Vardiya başlatıldı.');
    } on ApiException catch (error) {
      _showMessage(error.message);
    } catch (_) {
      _showMessage("Backend'e bağlanılamadı. API adresini kontrol edin.");
    } finally {
      if (mounted) {
        setState(() => _isBusy = false);
      }
    }
  }

  Future<void> _endShift() async {
    final shiftId = _shiftId;
    if (shiftId == null || shiftId.isEmpty) {
      _showMessage('Aktif vardiya bulunamadı.');
      return;
    }

    setState(() => _isBusy = true);
    try {
      await _shiftService.endShift(shiftId);
      setState(() => _shiftId = null);
      _showMessage('Vardiya durduruldu.');
    } on ApiException catch (error) {
      _showMessage(error.message);
    } catch (_) {
      _showMessage("Backend'e bağlanılamadı. API adresini kontrol edin.");
    } finally {
      if (mounted) {
        setState(() => _isBusy = false);
      }
    }
  }

  Future<void> _logout() async {
    await LocalStorage.clearAll();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (_) => false,
    );
  }

  void _open(Widget screen) {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => screen)).then((_) => _loadState());
  }

  @override
  Widget build(BuildContext context) {
    final user = _user;
    final hasActiveShift = _shiftId != null && _shiftId!.isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        title: const Text('SafeWorker Mobil'),
        actions: [
          IconButton(
            tooltip: 'Çıkış',
            onPressed: _logout,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            StatusCard(
              title: 'Çalışan',
              value: user?.name ?? 'Worker',
              subtitle: user?.email ?? '',
              icon: Icons.badge_outlined,
            ),
            StatusCard(
              title: 'Vardiya Durumu',
              value: hasActiveShift ? 'Aktif' : 'Başlatılmadı',
              subtitle: hasActiveShift
                  ? 'Shift ID: $_shiftId'
                  : 'Sensör verisi shiftId olmadan da gönderilebilir.',
              icon: Icons.schedule,
              color: hasActiveShift
                  ? const Color(0xFF15803D)
                  : const Color(0xFFB45309),
            ),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Device ID',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Dashboard veya seed çıktısından görülen cihaz ID değerini girin.',
                      style: TextStyle(color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _deviceController,
                      decoration: const InputDecoration(
                        labelText: 'Device ID',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    PrimaryButton(
                      label: 'Device ID Kaydet',
                      icon: Icons.save_outlined,
                      onPressed: _saveDeviceId,
                    ),
                  ],
                ),
              ),
            ),
            if (_message != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Text(
                  _message!,
                  style: const TextStyle(
                    color: Color(0xFF0F766E),
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            Row(
              children: [
                Expanded(
                  child: PrimaryButton(
                    label: 'Vardiya Başlat',
                    icon: Icons.play_arrow,
                    isLoading: _isBusy,
                    onPressed: hasActiveShift ? null : _startShift,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: PrimaryButton(
                    label: 'Vardiya Durdur',
                    icon: Icons.stop,
                    backgroundColor: const Color(0xFF475569),
                    isLoading: _isBusy,
                    onPressed: hasActiveShift ? _endShift : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _NavigationTile(
              title: 'Sensör Takibi',
              subtitle: 'Gerçek sensör değerlerini göster ve gönder',
              icon: Icons.sensors,
              onTap: () => _open(const SensorTrackingScreen()),
            ),
            _NavigationTile(
              title: 'Demo / Simülasyon',
              subtitle: 'Normal, darbe, düşme, pil ve bağlantı senaryoları',
              icon: Icons.science_outlined,
              onTap: () => _open(const DemoSimulationScreen()),
            ),
            _NavigationTile(
              title: 'Acil Durum',
              subtitle: 'Manuel acil durum alarmı gönder',
              icon: Icons.warning_amber_rounded,
              color: const Color(0xFFDC2626),
              onTap: () => _open(const EmergencyScreen()),
            ),
            _NavigationTile(
              title: 'QR Bölge Girişi',
              subtitle: 'Demo QR kod ile tehlikeli bölge girişi kaydet',
              icon: Icons.qr_code_2,
              onTap: () => _open(const ZoneScanScreen()),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavigationTile extends StatelessWidget {
  const _NavigationTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
    this.color = const Color(0xFF0F766E),
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.12),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
