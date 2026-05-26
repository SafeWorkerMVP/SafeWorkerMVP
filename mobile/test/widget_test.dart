import 'package:flutter_test/flutter_test.dart';

import 'package:safeworker_mobile/main.dart';

void main() {
  testWidgets('SafeWorker app opens login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const SafeWorkerApp(isWorkerLoggedIn: false));

    expect(find.text('SafeWorker Mobil'), findsOneWidget);
    expect(find.text('Giriş Yap'), findsOneWidget);
  });
}
