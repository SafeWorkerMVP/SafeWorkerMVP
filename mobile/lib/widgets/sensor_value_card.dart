import 'package:flutter/material.dart';

class SensorValueCard extends StatelessWidget {
  const SensorValueCard({
    super.key,
    required this.title,
    required this.x,
    required this.y,
    required this.z,
  });

  final String title;
  final double x;
  final double y;
  final double z;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _AxisValue(label: 'X', value: x),
                _AxisValue(label: 'Y', value: y),
                _AxisValue(label: 'Z', value: z),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _AxisValue extends StatelessWidget {
  const _AxisValue({required this.label, required this.value});

  final String label;
  final double value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value.toStringAsFixed(2),
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }
}
