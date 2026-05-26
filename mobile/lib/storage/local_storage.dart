import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../config/api_config.dart';
import '../models/user_model.dart';

class LocalStorage {
  static const _tokenKey = 'safeworker_token';
  static const _userKey = 'safeworker_user';
  static const _deviceIdKey = 'safeworker_device_id';
  static const _shiftIdKey = 'safeworker_shift_id';

  static Future<void> saveAuth({
    required String token,
    required UserModel user,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<UserModel?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final rawUser = prefs.getString(_userKey);

    if (rawUser == null) return null;

    try {
      final decoded = jsonDecode(rawUser) as Map<String, dynamic>;
      return UserModel.fromJson(decoded);
    } catch (_) {
      await prefs.remove(_userKey);
      return null;
    }
  }

  static Future<String?> getUserId() async {
    return (await getUser())?.id;
  }

  static Future<void> saveDeviceId(String deviceId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_deviceIdKey, deviceId.trim());
  }

  static Future<String?> getDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    final savedDeviceId = prefs.getString(_deviceIdKey);

    if (savedDeviceId != null && savedDeviceId.isNotEmpty) {
      return savedDeviceId;
    }

    return ApiConfig.demoDeviceId.isEmpty ? null : ApiConfig.demoDeviceId;
  }

  static Future<void> saveShiftId(String shiftId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_shiftIdKey, shiftId);
  }

  static Future<String?> getShiftId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_shiftIdKey);
  }

  static Future<void> clearShiftId() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_shiftIdKey);
  }

  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    await prefs.remove(_deviceIdKey);
    await prefs.remove(_shiftIdKey);
  }
}
