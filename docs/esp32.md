# ESP32 Firmware

Modular architecture:
- **config.h**: Environment and pin setup.
- **wifi_manager**: Maintains network connectivity.
- **sensor_module**: Interfaces with analog/digital sensors.
- **led_controller**: Controls GPIO for the LED.
- **servo_controller**: Uses PWM to control Servo position.
- **supabase_client**: Communicates with the Supabase REST API.
- **command_handler**: Parses JSON commands and executes them.
- **device_status**: Synchronizes physical state with cloud state.
