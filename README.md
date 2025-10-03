# 🗺️ Travel Planner

A modern, responsive travel planning application built with React and Vite, designed to help users organize and plan their trips efficiently.

## ✨ Features

- 📅 Interactive itinerary planning
- 🗺️ Destination management
- 📝 Activity scheduling
- 💰 Budget tracking
- 📱 Responsive design for all devices
- ⚡ Lightning-fast performance with Vite

## 🚀 Tech Stack

- **Frontend Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.7
- **Styling:** Tailwind CSS 3.4.1
- **Icons:** Lucide React
- **Containerization:** Docker
- **Web Server:** Nginx (production)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)
- Git

## 🛠️ Installation

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/stahir80td/day-planner.git
cd day-planner
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🐳 Docker Deployment

### Using Docker Compose

**For Production:**
```bash
docker-compose up -d travel-planner
```

**For Development:**
```bash
docker-compose --profile dev up travel-planner-dev
```

### Using Docker directly

**Build the image:**
```bash
docker build -t travel-planner:latest .
```

**Run the container:**
```bash
docker run -d -p 3000:80 --name travel-planner travel-planner:latest
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
travel-planner/
├── public/              # Static assets
│   └── vite.svg
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # React components
│   ├── App.jsx         # Main application component
│   ├── index.css       # Global styles
│   └── main.jsx        # Application entry point
├── .env                # Environment variables
├── .dockerignore       # Docker ignore file
├── .gitignore          # Git ignore file
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
├── index.html          # HTML template
├── package.json        # Project dependencies
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_GEMINI_API_KEY=your_api_key_here

# Add other environment variables as needed
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=Travel Planner
```

## 🚀 Deployment

### Deploy to Production

1. Build the production image:
```bash
docker build -t travel-planner:prod .
```

2. Run with environment variables:
```bash
docker run -d \
  -p 80:80 \
  --env-file .env.production \
  --name travel-planner-prod \
  travel-planner:prod
```

### Deploy to Cloud Platforms

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# Drag and drop the dist folder to Netlify
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [stahir80td](https://github.com/stahir80td)

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the blazing fast build tool
- Tailwind CSS for the utility-first CSS framework
- All contributors who help improve this project

## 📧 Contact

Project Link: [https://github.com/stahir80td/day-planner](https://github.com/stahir80td/day-planner)

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/stahir80td/day-planner/issues/new) with detailed information.

---

Made with ❤️ by [stahir80td](https://github.com/stahir80td)