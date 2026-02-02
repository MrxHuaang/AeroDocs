<p align="center">
  <img src="https://img.icons8.com/fluency/96/airplane-mode-on.png" alt="AeroDocs Logo" width="96"/>
</p>

<h1 align="center">AeroDocs</h1>

<p align="center">
  <strong>Aviation Document Management System</strong>
</p>

<p align="center">
  <a href="#overview">Overview</a> |
  <a href="#features">Features</a> |
  <a href="#technology-stack">Tech Stack</a> |
  <a href="#getting-started">Getting Started</a> |
  <a href="#project-structure">Structure</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/ICAO-00599C?style=for-the-badge&logo=airplane&logoColor=white" alt="ICAO Standards"/>
</p>

---

## Overview

**AeroDocs** is a modern web application designed for aviation document management. The platform enables users to upload aircraft documentation in compressed formats (ZIP/RAR), process them efficiently, and visualize compliance through a hierarchical checklist based on ICAO standards. Additionally, it includes an AI-powered assistant for document-related queries.

This solution is designed for auditors, engineers, and aviation professionals who require a reliable tool to verify aircraft documentation against international standards.

---

## Features

### Document Management

- Drag and drop file upload supporting ZIP and RAR formats
- Real-time processing with visual progress tracking
- Project organization with tagging and airline categorization

### ICAO Compliance Verification

- Hierarchical checklist with expandable tree structure
- Status tracking with present/missing indicators
- Detailed references including component and ICAO reference mapping

### AI Assistant

- Context-aware chat interface for intelligent responses
- Document-specific queries with real-time feedback
- Animated typing indicators for enhanced user experience

### User Interface

- Fully responsive design optimized for desktop, tablet, and mobile devices
- Toast notification system with success, error, and informational alerts
- Smooth animations and polished interactions

---

## Technology Stack

| Technology     | Purpose                                               |
| -------------- | ----------------------------------------------------- |
| HTML5          | Semantic structure and accessibility                  |
| CSS3           | Modern styling with CSS Variables, Flexbox, and Grid  |
| JavaScript     | Vanilla JS implementation without external frameworks |
| SessionStorage | Lightweight session management                        |

---

## Getting Started

### Prerequisites

A modern web browser is the only requirement. No package managers, bundlers, or additional configuration needed.

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/aerodocs.git

# Navigate to the project directory
cd aerodocs

# Open in browser (or use a local development server such as Live Server)
open index.html
```

### Quick Start Guide

1. **Authentication**: Click "Sign in with Google" to access the platform
2. **Create Project**: Use the "+ Create New Project" button to start a new project
3. **Upload Documents**: Drag and drop your ZIP or RAR file into the upload area
4. **Explore**: Navigate through the ICAO checklist and interact with the AI assistant

---

## Project Structure

```
avia-mvp/
├── index.html              # Login page
├── 2_dashboard.html        # Project dashboard
├── 3_project.html          # Project detail view
│
├── css/
│   ├── main.css            # Global styles and CSS variables
│   ├── login.css           # Login page specific styles
│   ├── dashboard.css       # Dashboard component styles
│   └── project.css         # Project view styles
│
└── js/
    ├── main.js             # Core utilities (authentication, notifications)
    ├── auth.js             # Authentication logic
    ├── dashboard.js        # Dashboard functionality
    ├── project.js          # Project view logic
    └── mock-data.js        # Sample data for demonstration
```

---

## Design System

### Color Palette

| Color          | Hex Code  | Usage                               |
| -------------- | --------- | ----------------------------------- |
| Primary        | `#2563EB` | Buttons, links, and accent elements |
| Text Primary   | `#111827` | Main content text                   |
| Text Secondary | `#4B5563` | Descriptions and secondary text     |
| Success        | `#16A34A` | Present and completed states        |
| Error          | `#DC2626` | Missing and failed states           |
| Background     | `#F3F4F6` | Page background                     |

### Responsive Breakpoints

| Device  | Breakpoint      | Layout                                     |
| ------- | --------------- | ------------------------------------------ |
| Desktop | 900px and above | Three-column grid with side-by-side panels |
| Tablet  | 600px to 899px  | Two-column grid with stacked panels        |
| Mobile  | Below 600px     | Single column with optimized touch targets |

---

## Roadmap

### Completed Features

- Google authentication integration
- Project CRUD operations
- Drag and drop file upload
- ICAO checklist visualization
- AI chat assistant
- Responsive design implementation

### Planned Features

- Backend API integration
- PDF document preview
- Report export functionality (PDF format)
- Dark mode theme
- Multi-language support

---

## Contributing

Contributions are welcome. To contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Contact

<p align="center">
  <a href="mailto:your-email@example.com">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/>
  </a>
  <a href="https://linkedin.com/in/your-profile">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
  <a href="https://github.com/your-username">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
</p>

---

<p align="center">
  <sub>Developed for the aviation industry</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-Vanilla%20JS-yellow?style=flat-square" alt="Made with Vanilla JS"/>
  <img src="https://img.shields.io/badge/No%20Dependencies-green?style=flat-square" alt="No Dependencies"/>
  <img src="https://img.shields.io/badge/100%25-Responsive-blue?style=flat-square" alt="100% Responsive"/>
</p>
