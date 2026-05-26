import '../models/api_response.dart';
import 'api_service.dart';

class ZoneService {
  ZoneService({ApiService? apiService})
    : _apiService = apiService ?? ApiService();

  final ApiService _apiService;

  Future<ApiResponse> scanZone({
    required String workerId,
    required String qrCode,
  }) {
    return _apiService.post('/zones/scan', {
      'workerId': workerId,
      'qrCode': qrCode,
    });
  }
}
