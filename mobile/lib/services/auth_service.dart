import '../models/api_response.dart';
import '../models/user_model.dart';
import '../storage/local_storage.dart';
import 'api_service.dart';

class AuthService {
  AuthService({ApiService? apiService})
    : _apiService = apiService ?? ApiService();

  final ApiService _apiService;

  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiService.post('/auth/login', {
      'email': email,
      'password': password,
    });

    final data = response.data as Map<String, dynamic>;
    final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
    final token = data['token']?.toString() ?? '';

    if (user.role != 'worker') {
      throw const ApiException(
        'Bu mobil uygulama çalışan rolü için tasarlanmıştır.',
      );
    }

    await LocalStorage.saveAuth(token: token, user: user);
    return user;
  }

  Future<UserModel> me() async {
    final response = await _apiService.get('/auth/me');
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }
}
