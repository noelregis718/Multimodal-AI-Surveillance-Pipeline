# Multimodal AI Surveillance Pipeline 👁️🧠

An enterprise-grade, edge-deployed Smart CCTV system that combines **Computer Vision (YOLOv8)** for object tracking with **Generative AI (Llama 3.2)** for natural language querying.

## 🚀 Architecture Overview

This project is built in three distinct phases, simulating a modern distributed AI pipeline:

### Phase 1: Edge Inference (Computer Vision)
* Uses **Ultralytics YOLOv8** and **OpenCV** to capture a live webcam feed.
* Performs real-time spatio-temporal object recognition (detecting humans, phones, vehicles, etc.).
* Bypasses standard MSMF Windows bugs by falling back to robust frame-checking algorithms to ensure hardware stability.

### Phase 2: Event-Driven Telemetry (Data Logging)
* Instead of merely drawing bounding boxes, the system extracts the metadata from the AI inference engine.
* It aggregates the object labels, counts them, and generates human-readable timestamped logs (e.g., `[2026-10-06 22:17:48] Activity detected: 1 person, 1 cell phone`).
* These logs are saved to an append-only flat-file database (`events_log.txt`) at a throttled rate to prevent I/O bottlenecks.

### Phase 3: Natural Language RAG Engine (The Brain)
* A separate offline chatbot interface connects to **Meta's Llama 3.2 (3B)** model via the **Ollama** framework.
* The chatbot injects the CCTV telemetry logs into the Large Language Model's context window.
* Users can query the security logs in plain English (e.g., *"What time did you see a person with a phone?"*), and the AI synthesizes an accurate response based *only* on the recorded events.

---

## 🛠️ Tech Stack
* **Language:** Python 3
* **Vision Model:** YOLOv8 (Ultralytics)
* **Video Backend:** OpenCV
* **Language Model:** Llama 3.2 (Meta) via Ollama
* **Architecture:** RAG (Retrieval-Augmented Generation) & Event-Driven Logging

---

## 💻 How to Run

**1. Start the Camera (Telemetry Generator)**
```bash
python camera.py
```
*Stand in front of the camera and hold up objects to populate the log file.*

**2. Start the AI Chatbot (Query Engine)**
```bash
python chatbot.py
```
*Ask the system questions about what it saw.*

---
*Created as an Advanced College AI Architecture Project.*
