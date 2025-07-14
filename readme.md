# Comfortly

A conversational AI platform for mental health support featuring real-time voice communication, built with Next.js frontend and Python FastAPI backend. The application provides seamless voice interactions using WebRTC, Daily API, and advanced AI services.

## What This Project Does

Comfortly is a full-stack conversational AI application that provides:

- **Real-time Voice Chat**: Interactive voice conversations with AI using WebRTC technology
- **Mental Health Support**: AI-powered conversations focused on emotional well-being and support
- **User Onboarding**: Personalized setup flow collecting user preferences and emotional states
- **Profile Management**: User authentication and profile customization via Supabase
- **3D Voice Visualizer**: Beautiful Three.js-powered audio visualization during conversations
- **Responsive Web Interface**: Modern, accessible UI built with Next.js and Tailwind CSS

## Project Architecture

### Frontend (Next.js)
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Authentication**: Supabase Auth with middleware protection
- **Voice Interface**: WebRTC integration with 3D visualizations
- **Components**: Radix UI primitives with custom styling

### Backend (Python FastAPI)
- **Framework**: FastAPI with async support
- **Voice Processing**: Pipecat AI for voice pipeline management
- **Speech Services**: OpenAI, Google, Deepgram integration
- **Real-time Communication**: WebRTC and Daily API support
- **Data Management**: Supabase integration for user data

## Prerequisites

Before starting the project, ensure you have:

- **Node.js** 18+ and npm/yarn
- **Python** 3.7+ and pip
- **Supabase Account** for authentication and database
- **OpenAI API Key** for AI conversations
- **Google API Key** (optional, for Google services)
- **Deepgram API Key** (optional, for speech-to-text)
- **Daily API Key** (optional, for enhanced voice features)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/debraj-m/Comfortly.git
cd Comfortly
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd comfortly-frontend

# Install Node.js dependencies
npm install
```

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the project root:

```env
# AI Services (Required)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account.json

# Database (Required)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Voice Communication (Optional)
DAILY_API_KEY=your_daily_api_key
DAILY_SAMPLE_ROOM_URL=your_daily_room_url
USE_DAILY=false

# Security
JWT_SECRET_KEY=your_jwt_secret_key

# Server Configuration
HOST=0.0.0.0
FAST_API_PORT=7860
```

### Frontend Environment Variables

Create a `.env.local` file in the `comfortly-frontend` directory:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Deployment (Optional)
VERCEL_URL=your_vercel_deployment_url
VERCEL_PROJECT_PRODUCTION_URL=your_production_url
```

## Configuration Steps

### 1. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to **Settings** → **API** to get your project URL and anon key
3. Configure authentication providers in **Authentication** → **Providers**
4. Set up redirect URLs in **Authentication** → **URL Configuration**:
   - `http://localhost:3000/**` (development)
   - `https://your-domain.com/**` (production)

### 2. OpenAI Setup

1. Sign up at [OpenAI](https://platform.openai.com)
2. Generate an API key in **API Keys** section
3. Add the key to your `.env` file

### 3. Optional Services

- **Google Cloud**: Set up service account for speech services
- **Deepgram**: Get API key for advanced speech-to-text
- **Daily.co**: Get API key for enhanced voice features

## How to Start the Project

### 1. Start the Backend Server

```bash
# From project root directory
python server.py

# Or with custom configuration
python server.py --host 0.0.0.0 --port 7860 --reload
```

The backend will be available at `http://localhost:7860`

### 2. Start the Frontend Development Server

```bash
# From comfortly-frontend directory
cd comfortly-frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`


> [!NOTE]  
> If using VS Code then Open Run and Debug & Start Comfortly.



### 3. Access the Application

1. Open your browser to `http://localhost:3000`
2. Sign up for a new account or log in
3. Complete the onboarding process
4. Start your voice conversation with the AI

## Available Scripts

### Backend
```bash
python server.py                    # Start production server
python server.py --reload          # Start with auto-reload for development
python server.py --help           # View all options
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Project Structure

```
Comfortly/
├── server.py                      # FastAPI backend server
├── requirements.txt               # Python dependencies
├── .env.example                  # Environment variables template
├── models/                       # Data models
├── services/                     # Business logic services
├── repositories/                 # Data access layer
├── utils/                        # Utility functions
├── comfortly-frontend/           # Next.js frontend
│   ├── app/                      # Next.js app directory
│   ├── components/               # React components
│   ├── lib/                      # Utility libraries
│   └── package.json              # Node.js dependencies
└── index.html                    # Standalone voice interface demo
```

## Features in Detail

- **Voice Conversations**: Real-time AI conversations with WebRTC
- **User Authentication**: Secure login/signup with Supabase
- **Onboarding Flow**: Personalized setup collecting preferences
- **Settings Management**: Profile and preference updates
- **3D Visualizations**: Audio-reactive Three.js animations
- **Responsive Design**: Mobile-friendly interface
- **Mental Health Focus**: AI trained for supportive conversations

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required variables are set
2. **Port Conflicts**: Change ports if 3000/7860 are occupied
3. **CORS Issues**: Backend CORS is configured for all origins
4. **WebRTC Problems**: Check browser permissions for microphone access

### Platform-Specific Notes

- **Windows**: Limited Daily/RTVI support, set `USE_DAILY=false`
- **macOS/Linux**: Full feature support available
- **Browsers**: Chrome/Edge recommended for WebRTC features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to start?** Follow the installation steps above and you'll have Comfortly running locally in minutes!