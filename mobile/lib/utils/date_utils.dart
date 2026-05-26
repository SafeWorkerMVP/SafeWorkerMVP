class SafeDateUtils {
  static String timeNowText() {
    final now = DateTime.now();
    return '${_two(now.hour)}:${_two(now.minute)}:${_two(now.second)}';
  }

  static String _two(int value) => value.toString().padLeft(2, '0');
}
