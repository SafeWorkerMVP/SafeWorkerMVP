import '../models/api_response.dart';
import '../storage/local_storage.dart';
import 'api_service.dart';

class ShiftService {
  ShiftService({ApiService? apiService})
    : _apiService = apiService ?? ApiService();

  final ApiService _apiService;

  Future<String> startShift({
    required String workerId,
    required String deviceId,
  }) async {
    final response = await _apiService.post('/shifts/start', {
      'workerId': workerId,
      'deviceId': deviceId,
    });

    final data = response.data as Map<String, dynamic>;
    final shiftId = data['_id']?.toString() ?? '';

    if (shiftId.isEmpty) {
      throw const ApiException('Vardiya bilgisi alınamadı.');
    }

    await LocalStorage.saveShiftId(shiftId);
    return shiftId;
  }

  Future<void> endShift(String shiftId) async {
    await _apiService.patch('/shifts/$shiftId/end');
    await LocalStorage.clearShiftId();
  }
}
