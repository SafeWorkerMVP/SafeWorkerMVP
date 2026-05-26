import '../models/api_response.dart';
import '../models/sensor_payload.dart';
import 'api_service.dart';

class SensorService {
  SensorService({ApiService? apiService})
    : _apiService = apiService ?? ApiService();

  final ApiService _apiService;

  Future<ApiResponse> sendSensorData(SensorPayload payload) {
    return _apiService.post('/sensor-data', payload.toJson());
  }
}
