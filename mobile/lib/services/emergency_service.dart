import '../models/api_response.dart';
import 'api_service.dart';

class EmergencyService {
  EmergencyService({ApiService? apiService})
    : _apiService = apiService ?? ApiService();

  final ApiService _apiService;

  Future<ApiResponse> sendEmergency({
    required String workerId,
    required String deviceId,
    String? shiftId,
  }) {
    final body = <String, dynamic>{
      'workerId': workerId,
      'deviceId': deviceId,
      'message': 'Çalışan manuel acil durum bildirimi gönderdi.',
    };

    if (shiftId != null && shiftId.isNotEmpty) {
      body['shiftId'] = shiftId;
    }

    return _apiService.post('/emergency', body);
  }
}
