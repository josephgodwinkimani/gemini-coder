# <img src="public/images/gemini-color.png" alt="Gemini" height=5% width=5%> GeminiCoder 

An interactive code analysis and assistant interface for Google Gemini AI, designed for developers to get instant code reviews, suggestions, and improvements using Gemini's language models.

## Overview

GeminiCoder provides a basic, clean, intuitive interface for developers to:

- Upload and analyze code files
- Get instant code reviews and suggestions
- Interact with Gemini models through a chat interface
- Manage model configurations and settings
- Track response time on a basic level

## Key Features

1. **Code Analysis**

   - Supports multiple file formats 
   - Contextual follow-up questions
   - Smart code understanding

2. **Model Management**

   - Multiple model support via dropdown (Gemini 1.5 Pro, Gemini 1.5 Flash, etc.)
   - Configurable temperature parameter
   - Streaming responses for a more interactive experience

3. **User Experience**

   - Drag-and-drop file upload
   - Real-time chat interface with streaming option
   - Native dark mode support
   - Chat history and export/import functionality

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/josephgodwinkimani/gemini-coder.git
cd gemini-coder

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production

```bash
npm run build
```

## Usage

1. Enter your Gemini API key when you first open the app
2. Select a Gemini model from the dropdown
3. Configure model settings if needed
4. Upload a code file or type a query directly
5. View the AI's response in real-time

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by Google. Gemini is a trademark of Google LLC. This is an independent project created to provide a developer interface for the Gemini API.

## License

This project is licensed under the MIT License - see the LICENSE file for details.