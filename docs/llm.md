# LLM Integration

The LLM processes natural language commands and converts them into structured JSON.

## Pipeline
1. User Input: "Turn on the light"
2. LLM -> Intent: LED ON
3. Structured Command: {"device": "LED", "command": "ON"}
4. Validation: Check if device is allowed and value is valid.
5. Supabase: Insert command into commands table.
6. ESP32: Fetches command and executes.
