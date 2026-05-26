import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import '../models/api_response.dart';
import '../storage/local_storage.dart';

class ApiService {
  ApiService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Uri _uri(String path) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('${ApiConfig.baseUrl}$normalizedPath');
  }

  Future<Map<String, String>> _headers() async {
    final token = await LocalStorage.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<ApiResponse> get(String path) async {
    return _send(() async {
      return _client.get(_uri(path), headers: await _headers());
    });
  }

  Future<ApiResponse> post(String path, Map<String, dynamic> body) async {
    return _send(() async {
      return _client.post(
        _uri(path),
        headers: await _headers(),
        body: jsonEncode(body),
      );
    });
  }

  Future<ApiResponse> patch(String path, [Map<String, dynamic>? body]) async {
    return _send(() async {
      return _client.patch(
        _uri(path),
        headers: await _headers(),
        body: body == null ? null : jsonEncode(body),
      );
    });
  }

  Future<ApiResponse> _send(Future<http.Response> Function() request) async {
    try {
      final response = await request().timeout(ApiConfig.requestTimeout);
      final decoded = response.body.isEmpty
          ? <String, dynamic>{}
          : jsonDecode(response.body) as Map<String, dynamic>;
      final apiResponse = ApiResponse.fromJson(decoded);

      if (response.statusCode < 200 ||
          response.statusCode >= 300 ||
          !apiResponse.success) {
        throw ApiException(
          apiResponse.message.isEmpty
              ? 'İstek başarısız oldu.'
              : apiResponse.message,
          statusCode: response.statusCode,
        );
      }

      return apiResponse;
    } on ApiException {
      rethrow;
    } on TimeoutException {
      throw const ApiException(
        'Backend yanıt vermedi. API adresini kontrol edin.',
      );
    } on FormatException {
      throw const ApiException('Sunucu cevabı okunamadı.');
    } catch (_) {
      throw const ApiException(
        "Backend'e bağlanılamadı. API adresini kontrol edin.",
      );
    }
  }
}
