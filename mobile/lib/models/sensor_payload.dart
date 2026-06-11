class SensorVector {
  const SensorVector({
    required this.x,
    required this.y,
    required this.z,
  });

  final double x;
  final double y;
  final double z;

  Map<String, dynamic> toJson() {
    return {
      'x': x,
      'y': y,
      'z': z,
    };
  }
}

class SensorLocation {
  const SensorLocation({
    required this.latitude,
    required this.longitude,
    this.accuracy,
  });

  final double latitude;
  final double longitude;
  final double? accuracy;

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      if (accuracy != null) 'accuracy': accuracy,
    };
  }
}

class SensorPayload {
  const SensorPayload({
    required this.workerId,
    required this.deviceId,
    this.shiftId,
    required this.timestamp,
    required this.accelerometer,
    required this.gyroscope,
    required this.batteryLevel,
    required this.networkStatus,
    this.location,
    required this.inactivity,
  });

  final String workerId;
  final String deviceId;
  final String? shiftId;
  final DateTime timestamp;
  final SensorVector accelerometer;
  final SensorVector gyroscope;
  final int batteryLevel;
  final String networkStatus;
  final SensorLocation? location;
  final bool inactivity;

  Map<String, dynamic> toJson() {
    return {
      'workerId': workerId,
      'deviceId': deviceId,
      if (shiftId != null && shiftId!.isNotEmpty) 'shiftId': shiftId,
      'timestamp': timestamp.toIso8601String(),
      'accelerometer': accelerometer.toJson(),
      'gyroscope': gyroscope.toJson(),
      'batteryLevel': batteryLevel,
      'networkStatus': networkStatus,
      if (location != null) 'location': location!.toJson(),
      'inactivity': inactivity,
    };
  }
}