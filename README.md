# Requirment

Building Lovable
The task is simple: build a text to app tool like lovable.

The app should have:

a chat
a preview window
a way to work on multiple apps (“projects”)
Requirements
Tech stack
You are free to choose your tech stack but we would very much prefer if you can use TypeScript and/or Go since we’re already using them at lovable.

Should I focus on frontend? Backend? Infra?

It’s up to you to show us what you care about!

Running locally
It should be easy for us to run and test your assignment. npm run, go run, docker compose are all fine. Anything that doesn't require us to setup more tools is great.

API keys
You’ll be provided with an Anthropic API key you can use for the duration of your test work.

We’re interested in seeing:

the code: be careful what you let AI write for you :)
the architecture: how does the app work, how will it scale and manage more complex scenarios
your taste :)
Let us know if you have any questions on the way and we'll improve instructions.




# AppBuilder AI - Text-to-App Development Platform

A modern AI-powered development platform that allows users to build web applications through natural language conversation, similar to Lovable.

## 🚀 Features

- **Split-Screen Interface**: Chat with AI on the left, live preview on the right
- **Real-time Preview**: Instant HTML/CSS/JS preview with responsive viewport switching
- **Multi-Project Management**: Create and switch between multiple projects
- **AI-Powered Generation**: Natural language to code conversion (ready for Anthropic API)
- **Modern Design System**: Professional dark theme with smooth animations
- **Responsive Preview**: Test your apps on desktop, tablet, and mobile viewports

## 🏗️ Architecture

### Frontend (TypeScript + React)
- **React 18** with TypeScript for type safety
- **Tailwind CSS** with custom design system
- **Shadcn/ui** for consistent UI components
- **Resizable panels** for flexible layout
- **React Router** for navigation

### Key Components
- `MainLayout`: Core split-screen layout with state management
- `ChatInterface`: AI conversation UI with message history
- `PreviewWindow`: Live preview with responsive testing
- `Header`: Project management and navigation
- Custom design system with AI-focused branding

### State Management
- Project files stored in component state
- Real-time code updates trigger preview refresh
- Message history maintained per session

## 🎨 Design System

- **Colors**: Purple/blue gradient theme (`--ai-primary`, `--ai-secondary`)
- **Typography**: Clean, readable fonts optimized for code
- **Animations**: Smooth transitions using cubic-bezier curves
- **Responsive**: Mobile-first design approach

## 🔧 Setup & Development

### Prerequisites
- Node.js 18+ and npm
- Anthropic API key (for AI features)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
Create a `.env` file for API keys:
```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

## 🧠 AI Integration

The app is structured to easily integrate with the Anthropic API:

1. **Message Processing**: Chat messages are formatted for API calls
2. **Code Generation**: Responses parsed and applied to project files
3. **Context Awareness**: Current project state sent with requests
4. **Error Handling**: Graceful fallbacks and user feedback

### API Integration Structure
```typescript
// Ready for Anthropic API integration
const generateCode = async (prompt: string, context: Project) => {
  const response = await fetch('/api/anthropic', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      context: context.files
    })
  });
  
  return response.json();
};
```

## 🚀 Scalability Considerations

### Performance
- **Code Splitting**: Lazy loading for large components
- **Virtual Scrolling**: For large message histories
- **Debounced Updates**: Prevent excessive re-renders

### Architecture Extensions
- **File System API**: For local file management
- **WebSockets**: Real-time collaboration
- **Service Workers**: Offline functionality
- **Database Integration**: Project persistence

### Deployment
- **Static Hosting**: Vercel, Netlify ready
- **Docker Support**: Containerized deployment
- **CI/CD**: GitHub Actions integration ready

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔮 Future Enhancements

- [ ] Full Anthropic Claude integration
- [ ] Advanced code editor with syntax highlighting
- [ ] Project templates and scaffolding
- [ ] Component library integration
- [ ] Real-time collaboration
- [ ] Version control integration
- [ ] Deployment pipeline integration

## 🎯 Technical Highlights

- **Type Safety**: Full TypeScript coverage
- **Performance**: Optimized re-renders and bundle size
- **Accessibility**: WCAG compliant UI components
- **Testing Ready**: Component architecture supports unit/integration tests
- **Maintainable**: Clean separation of concerns and modular design

---
