# Comfortly

A real-time voice interface application built with Python that provides seamless communication capabilities using Daily API and RTVI (Real-Time Voice Interface) technologies.

## Features

- **Real-time Voice Communication**: Powered by Daily API for high-quality voice interactions
- **RTVI Integration**: Advanced real-time voice interface capabilities
- **Cross-platform Support**: Works on multiple operating systems with configuration options
- **Flexible Configuration**: Environment-based settings for easy deployment

## Requirements

- Python 3.7+
- Daily API account (for voice features)
- Compatible operating system (Windows has limited Daily/RTVI support)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/debraj-m/Comfortly.git
cd Comfortly
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your environment variables by creating a `.env` file in the root directory.

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Daily API Configuration
USE_DAILY=true
DAILY_API_KEY=your_daily_api_key_here
DAILY_API_URL=https://api.daily.co/v1
```

#### Configuration Options:

- **USE_DAILY**: 
  - Set to `"true"` to enable Daily and RTVI features
  - Set to `"false"` or leave unset for Windows or systems where Daily/RTVI are not supported
  
- **DAILY_API_KEY**: 
  - Your Daily API key (required only if USE_DAILY is true)
  - Get your API key from [Daily.co Dashboard](https://dashboard.daily.co/)
  
- **DAILY_API_URL**: 
  - The Daily API endpoint URL
  - Default: `https://api.daily.co/v1`

### System Compatibility

#### For Windows or Limited Support Systems:
- Don't set the `USE_DAILY` environment variable, or set it to `"false"`
- The application will run with limited voice features

#### For Full Feature Support:
- Set `USE_DAILY=true` in your `.env` file
- Ensure you have a valid Daily API key
- System must support Daily and RTVI features

## Usage

1. Update your credentials in the `.env` file
2. Choose your configuration based on your system compatibility
3. Run the application:

```bash
python server.py
```

## API Integration

### Daily API

This project integrates with Daily.co's API to provide:
- Real-time voice communication
- Room management
- Audio processing capabilities

To get started with Daily API:
1. Sign up at [Daily.co](https://daily.co/)
2. Get your API key from the dashboard
3. Add it to your `.env` file

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
- Check the [Issues](https://github.com/debraj-m/Comfortly/issues) page
- Create a new issue if your problem isn't already reported
- Ensure you've followed the configuration steps correctly

## Acknowledgments

- [Daily.co](https://daily.co/) for providing the real-time communication API
- RTVI community for real-time voice interface technologies

---

**Note**: This application has different feature sets depending on your operating system. Windows users will have limited Daily/RTVI support, while other systems can access the full feature set.