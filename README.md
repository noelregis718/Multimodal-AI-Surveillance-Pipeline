# 🛡️ Nexus Vision AI - Enterprise Surveillance Pipeline

An enterprise-grade Smart CCTV system that combines real-time Computer Vision (YOLOv8) with a Generative AI RAG Chatbot (Llama 3.2 + ChromaDB) to allow users to query security logs in natural language.

## 🌟 Core Features

- **Edge Inference (Computer Vision):** Real-time object detection and tracking using Ultralytics YOLOv8.
- **Behavioral Anomaly Detection (Pose Analysis):** Utilizes `YOLOv8-Pose` to track human skeletons in real-time, instantly logging if a threat has "FALLEN" or has their "HANDS RAISED".
- **Audio Anomaly Detection:** Uses `sounddevice` and `numpy` to monitor ambient decibel levels. Instantly triggers an alarm if a sudden loud noise (like glass breaking or shouting) is detected.
- **Multi-Modal Vision Analysis:** When a threat is detected, the frame is instantly parsed by a local `Llava` Multi-Modal LLM. It extracts semantic visual descriptions (e.g. "wearing a red hoodie") and injects it into the logs.
- **Generative RAG Engine:** Ask questions about your security logs in natural language, powered by Meta's Llama 3.2 and ChromaDB.
- **Deep Learning Facial Recognition:** Uses the `DeepFace` neural network to recognize authorized personnel versus unknown threats from the `known_faces/` database.
- **Automated Video Management System (VMS):** Automatically records and extracts a 5-second MP4 video clip to the `clips/` folder whenever a threat is detected.
- **Automated Email Threat Alerts:** Built-in `smtplib` dispatch engine that can instantly email the system admin when an unauthorized person breaches the perimeter.
- **Full-Stack Web Dashboard:** A sleek, dark-mode React UI with frosted glassmorphism, running on a high-performance FastAPI Python backend.
- **Live Event Timeline UI:** A beautifully rendered, auto-refreshing feed tracking all security events from the past 7 days directly on the dashboard.
- **Voice Integrated Security Queries:** Talk directly to your AI using the browser's native Web Speech API (Speech-to-Text).

## 🚀 Installation & Setup

1. **Install Backend Dependencies:**
   ```bash
   pip install fastapi uvicorn pydantic python-multipart ultralytics langchain langchain-community langchain-huggingface chromadb deepface tf-keras sounddevice numpy
   ```
2. **Download AI Models:**
   Ensure Ollama is installed, then pull the required models:
   ```bash
   ollama pull llama3.2
   ollama pull llava
   ```
3. **Start the FastAPI Backend:**
   ```bash
   python smart_cctv/api.py
   ```
4. **Start the React Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🧠 Architecture Overview
The system captures hardware video streams using OpenCV and pipes the frames into three distinct Neural Networks:
1. **YOLOv8** for Object/Threat Bounding Boxes
2. **YOLOv8-Pose** for Skeletal Anomaly Detection (Falling, Hands Raised)
3. **DeepFace** for Facial Verification

Simultaneously, a background thread monitors audio frequencies for anomalies. If a threat is detected, the raw image is streamed to **Llava** for multi-modal text description and an automated email alert is dispatched. All logs are embedded using `all-MiniLM-L6-v2` and stored in a persistent ChromaDB vector space. When the React frontend submits a voice or text query, LangChain performs a semantic search to inject context into Llama 3.2 for a highly accurate, context-aware response.
