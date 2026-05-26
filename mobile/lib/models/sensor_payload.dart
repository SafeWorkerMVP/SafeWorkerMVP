class SensorVector {
  const SensorVector({required this.x, required this.y, required this.z});

  final double x;
  final double y;
  final double z;

  Map<String, dynamic> toJson() {
    return {'x': x, 'y': y, 'z': z};
  }
}

class SensorPayload {
  const SensorPayload({
    required this.workerId,
    required this.deviceId,
    required this.timestamp,
    required this.accelerometer,
    required this.gyroscope,
    required this.batteryLevel,
    required this.networkStatus,
    required this.inactivity,
    this.shiftId,
  });

  final String workerId;
  final String deviceId;
  final String? shiftId;
  final DateTime timestamp;
  final SensorVector accelerometer;
  final SensorVector gyroscope;
  final int batteryLevel;
  final String networkStatus;
  final bool inactivity;

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{
      'workerId': workerId,
      'deviceId': deviceId,
      'timestamp': timestamp.toUtc().toIso8601String(),
      'accelerometer': accelerometer.toJson(),
      'gyroscope': gyroscope.toJson(),
      'batteryLevel': batteryLevel,
      'networkStatus': networkStatus,
      'inactivity': inactivity,
    };

    if (shiftId != null && shiftId!.isNotEmpty) {
      map['shiftId'] = shiftId;
    }

    return map;
  }
}
