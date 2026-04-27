# DFA Simulator & Animator

An interactive web application for visualizing and animating Deterministic Finite Automata (DFA). Built with React, SVG, and Tailwind CSS.

## 🚀 Features

- **Interactive DFA Builder**: Create custom automata with states, alphabet, and transitions
- **SVG Visualization**: Beautiful, animated state diagrams with proper arrow rendering
- **Step-by-Step Animation**: Watch DFAs process input strings character by character
- **Preloaded Examples**: Classic DFA patterns ready to explore
- **Dark Theme**: Modern, responsive UI design
- **Real-time Controls**: Play, pause, stop, and speed controls for animations

## 🛠️ Tech Stack

- **React 18** - Component-based UI framework
- **SVG** - Vector graphics for state diagrams
- **Tailwind CSS** - Utility-first styling
- **Babel Standalone** - Client-side JSX transformation
- **Vercel** - Static site hosting

## 📁 Project Structure

```
DFA_Animation/
├── index.html          # Main HTML file with embedded React app
├── package.json        # Project configuration
├── vercel.json         # Vercel deployment configuration
├── DFA_Simulator.jsx   # React component (standalone)
└── README.md          # This file
```

## 🚀 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   Navigate to `http://localhost:3000`

## 🌐 Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - DFA Simulator"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the static site configuration
   - Click "Deploy"

### Method 2: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Method 3: Drag & Drop

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Drag and drop the entire project folder

## ⚙️ Configuration

### Vercel Configuration (`vercel.json`)

The project is pre-configured for Vercel deployment with:
- Static file serving
- SPA routing (all routes redirect to `index.html`)
- Optimized caching headers
- Automatic HTTPS

### Environment Variables

No environment variables required - the app is fully client-side.

## 🎯 Usage Guide

### Building a DFA

1. **Set Number of States**: Choose how many states (q0, q1, q2...)
2. **Define Alphabet**: Enter comma-separated symbols (e.g., "0,1")
3. **Configure Transitions**: Use the transition table to define state movements
4. **Select Start State**: Choose the initial state
5. **Set Accept States**: Check which states are accepting

### Testing Strings

1. **Enter Input String**: Type or generate a random test string
2. **Run Animation**: Click "Run" to see step-by-step processing
3. **Control Playback**: Use pause, stop, and speed controls
4. **View Results**: See acceptance/rejection with path tracing

### Preloaded Examples

- **Strings ending in 1**: Accepts binary strings that end with 1
- **Even number of 0s**: Accepts strings with even count of zeros
- **Divisible by 3**: Accepts binary numbers divisible by 3
- **Contains substring 101**: Accepts strings containing "101"

## 🔧 Customization

### Adding New Examples

Edit the `examples` object in `index.html` to add new DFA patterns:

```javascript
const examples = {
  'Your Example Name': {
    numStates: 3,
    alphabet: '0,1',
    transitions: {
      'q0': { '0': 'q1', '1': 'q0' },
      'q1': { '0': 'q2', '1': 'q0' },
      'q2': { '0': 'q2', '1': 'q2' }
    },
    startState: 'q0',
    acceptStates: ['q2']
  }
};
```

### Styling

The app uses Tailwind CSS classes. Modify the `className` props in the React components to customize the appearance.

## 🚀 Performance Optimization

- **CDN Dependencies**: React and Tailwind loaded from CDN
- **Static Hosting**: No server-side processing required
- **Minimal Bundle**: Single HTML file with embedded JavaScript
- **Caching**: Optimized headers for static assets

## 📱 Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for educational or commercial purposes.

## 🔗 Live Demo

Once deployed, your DFA Simulator will be available at:
`https://dfa-simulator.vercel.app`

## 🐛 Troubleshooting

### Common Issues

1. **White Screen**: Check browser console for JavaScript errors
2. **Build Fails**: Ensure all files are present and syntax is correct
3. **Deployment Issues**: Verify Vercel configuration and GitHub connection

### Getting Help

- Check the browser console for error messages
- Verify all dependencies are loaded correctly
- Ensure the `vercel.json` configuration is valid

---

**Happy Automata Building! 🎉**
