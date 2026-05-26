import 'package:flutter/material.dart';

import 'screens/login_screen.dart';
import 'screens/worker_home_screen.dart';
import 'storage/local_storage.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final token = await LocalStorage.getToken();
  final user = await LocalStorage.getUser();
  final isWorkerLoggedIn =
      token != null && token.isNotEmpty && user?.role == 'worker';

  runApp(SafeWorkerApp(isWorkerLoggedIn: isWorkerLoggedIn));
}

class SafeWorkerApp extends StatelessWidget {
  const SafeWorkerApp({super.key, required this.isWorkerLoggedIn});

  final bool isWorkerLoggedIn;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SafeWorker Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F766E),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF4F7FB),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F766E),
          foregroundColor: Colors.white,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: Color(0xFFE1E8F0)),
          ),
        ),
        useMaterial3: true,
      ),
      home: isWorkerLoggedIn ? const WorkerHomeScreen() : const LoginScreen(),
    );
  }
}
