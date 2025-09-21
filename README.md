# Guinea Pig Simulation Game (GPS2)

**Copyright © 2025 ktocdev. All Rights Reserved.**

A comprehensive virtual guinea pig care simulator featuring individual personality discovery, environmental management, and friendship development through attentive care.

## 🚀 Tech Stack

- **Vue 3** - Modern reactive frontend framework with Composition API
- **TypeScript** - Type-safe development with strict configuration
- **Pinia** - Lightweight state management with persistence
- **Vite** - Fast build tool and development server
- **CSS Variables** - Mobile-first responsive design with logical properties

## 🎮 Game Features

- **Individual Guinea Pig Personalities** - Discover unique preferences through observation
- **Wellness & Needs System** - Seven fundamental needs with interdependencies
- **Environmental Management** - Habitat conditions, cleanliness, and resource management
- **Activity Feed** - Real-time natural language feedback system
- **Responsive Design** - Mobile-first with adaptive navigation and orientation handling

## 🛠️ Development Setup

### Prerequisites
- Node.js (LTS version recommended)
- npm package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd gps2

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/     # Vue components organized by function
│   ├── basic/     # Reusable UI components (Button, Select, etc.)
│   ├── debug/     # Development and debugging tools
│   ├── game/      # Game-specific components (ActivityFeed, etc.)
│   └── layout/    # Layout and navigation components
├── stores/        # Pinia state management
├── views/         # Page-level Vue components
├── styles/        # Global CSS variables and base styles
└── utils/         # Shared utilities and helpers

docs/              # Comprehensive project documentation
├── game-design/   # Core mechanics and design philosophy
├── systems/       # Detailed system specifications by phase
└── technical/     # Implementation guides and architecture
```

## 📖 Documentation

This project includes extensive documentation organized by development phases:

- **[Project Plan](docs/PROJECT_PLAN.md)** - Documentation navigation and overview
- **[Development Phases](docs/DEVELOPMENT_PHASES.md)** - Implementation roadmap
- **[System Integration](docs/SYSTEM_INTEGRATION.md)** - Architecture and dependencies

### Quick Links
- [Game Design Documentation](docs/game-design/) - Core mechanics and philosophy
- [System Specifications](docs/systems/) - Detailed implementation plans
- [Technical Guides](docs/technical/) - Architecture and platform considerations

## 🔧 Development Guidelines

### Code Standards
- **Vue**: Composition API with `<script setup lang="ts">` syntax
- **CSS**: Mobile-first responsive design with BEM methodology
- **TypeScript**: Strict configuration with explicit types
- **State**: Pinia stores with persistence enabled

## ⚖️ License

This software is proprietary and confidential. All rights reserved. No part of this software may be reproduced, distributed, or transmitted in any form without the prior written permission of the copyright holder.

**This is NOT open source software.** Unauthorized copying, modification, or distribution is strictly prohibited.

For licensing inquiries, please contact the author.

---

For detailed implementation guidance and system specifications, see the comprehensive documentation in the `/docs` directory.