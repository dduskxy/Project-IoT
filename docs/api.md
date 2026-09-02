# API Layer

The system uses Supabase REST API for communication.

- **ESP32**: Makes HTTP POST/GET requests to Supabase.
- **Web**: Uses @supabase/supabase-js client.
- **LLM**: Calls a backend route or Edge Function to insert commands into Supabase.
