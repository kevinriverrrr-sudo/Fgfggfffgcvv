# 🎨 AI Background Remover

A beautiful, modern web application for removing backgrounds from images using AI technology. Built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features

- 🚀 **Instant Background Removal** - AI-powered background removal in seconds
- 🎨 **Beautiful Modern UI** - Sleek gradient design with smooth animations
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- 🖼️ **Multiple Format Support** - Supports JPG, PNG, WEBP, and more
- 🔒 **Privacy First** - All processing happens in your browser, images never leave your device
- 💾 **Easy Download** - Download processed images with one click
- 🌓 **Dark Mode Support** - Automatically adapts to your system theme
- ⚡ **Zero Backend** - Completely client-side, fast and secure

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd background-remover
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Deployment on Vercel

### Method 1: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Method 2: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy" - Vercel will automatically detect Next.js configuration

### Method 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/background-remover)

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Processing**: @imgly/background-removal
- **Icons**: React Icons
- **Deployment**: Vercel

## 📖 How to Use

1. **Upload Image**: 
   - Drag and drop an image onto the upload area
   - Or click to browse and select an image

2. **Wait for Processing**: 
   - The AI will automatically remove the background
   - Progress bar shows the processing status

3. **Download Result**: 
   - Preview the before and after images
   - Click "Download" to save the result
   - Use "Reset" to process another image

## 🎯 Supported Image Formats

- JPEG / JPG
- PNG
- WEBP
- GIF
- BMP
- And many more!

## ⚙️ Configuration

The application works out of the box with no configuration needed. The background removal processing happens entirely in the browser using WebAssembly.

## 🔧 Development

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

Run linter:
```bash
npm run lint
```

## 📝 Environment Variables

No environment variables required! Everything runs client-side.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🌟 Features in Detail

### Privacy & Security
- All image processing happens locally in your browser
- No images are uploaded to any server
- No data collection or tracking

### Performance
- Optimized for speed with Next.js
- Lazy loading and code splitting
- Efficient memory management

### User Experience
- Intuitive drag-and-drop interface
- Real-time progress feedback
- Responsive design for all devices
- Beautiful animations and transitions

## 🐛 Troubleshooting

**Issue**: Slow processing for large images
- **Solution**: Try resizing the image before upload

**Issue**: Browser compatibility
- **Solution**: Use a modern browser (Chrome, Firefox, Edge, Safari)

**Issue**: Out of memory error
- **Solution**: Process smaller images or close other browser tabs

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ using Next.js and AI
