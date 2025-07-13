# Comfortly

## How to setup
1. Update credentials in `.env`
2. Choose your configuration:
   - For Windows or systems where Daily and RTVI are not supported: don't set the USE_DAILY environment variable or set it to "false"
   - For systems that support Daily and RTVI: set USE_DAILY=true in your environment
3. Run `server.py`

## Environment Variables
- `USE_DAILY`: Set to "true" to enable Daily and RTVI features. These features are not supported on Windows.
- `DAILY_API_KEY`: Your Daily API key (only needed if USE_DAILY is true)
- `DAILY_API_URL`: The Daily API URL (defaults to "https://api.daily.co/v1")

