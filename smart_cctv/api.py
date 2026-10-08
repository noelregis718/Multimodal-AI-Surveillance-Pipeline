import cv2
import time
import random
import datetime
import threading
import os
import base64
import requests
import smtplib
from email.mime.text import MIMEText
from fastapi import FastAPI, Response, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import Counter
from ultralytics import YOLO

import warnings
warnings.filterwarnings("ignore")

os.makedirs("clips", exist_ok=True)
os.makedirs("known_faces", exist_ok=True)

try:
    from deepface import DeepFace
except ImportError:
    print("WARNING: DeepFace not loaded.")

from chatbot import build_vector_database
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🚀 Loading YOLO Vision Model...")
yolo_model = YOLO('yolov8n.pt')
print("🤸 Loading YOLO Pose Model (Behavioral Analysis)...")
pose_model = YOLO('yolov8n-pose.pt')

print("🧠 Initializing RAG Engine...")
vectordb = build_vector_database()
llm = Ollama(model="llama3.2")

security_prompt = PromptTemplate(
    template="""You are an advanced AI Security Assistant analyzing CCTV logs.
Here are the retrieved events from the security camera logs:
{context}

Based on the logs above, answer the following query from the Admin. 
Be highly detailed. If a Video Clip was saved (e.g. clips/threat_....mp4), you MUST tell the user the exact path to the video file so they can review it!
If the user asks for visual descriptions, read the VISUAL ANALYSIS logs.
If the answer is not in the logs, say "I did not detect that today."

Admin Query: {question}
Detailed Answer:""",
    input_variables=["context", "question"]
)

# --- FEATURE: AUDIO ANOMALY DETECTION ---
def audio_listener():
    try:
        import sounddevice as sd
        import numpy as np
        
        def audio_callback(indata, frames, time_info, status):
            volume_norm = np.linalg.norm(indata)*10
            if volume_norm > 150: # Loud noise threshold
                timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                log_entry = f"[{timestamp}] AUDIO ALARM: Extremely loud noise detected! (Volume: {volume_norm:.1f})\n"
                with open("events_log.txt", "a") as f:
                    f.write(log_entry)
                print(f"🔊 {log_entry.strip()}")
                sd.sleep(3000) # Cooldown to avoid spam

        with sd.InputStream(callback=audio_callback):
            while True:
                sd.sleep(1000)
    except Exception as e:
        print(f"Audio monitor failed to start (No Microphone or drivers missing): {e}")

threading.Thread(target=audio_listener, daemon=True).start()


# --- FEATURE: AUTOMATED E-MAIL ALERTS ---
def send_threat_email(threat_details):
    try:
        # We print to the terminal to show the system working.
        print(f"📧 [EMAIL DISPATCHED TO ADMIN]: {threat_details}")
        
        # User Configuration Block (Uncomment and add credentials for real SMTP routing)
        # sender = "nexus.vision@gmail.com"
        # password = "YOUR_APP_PASSWORD"
        # receiver = "admin@example.com"
        # msg = MIMEText(f"Nexus Vision AI detected a threat:\n\n{threat_details}")
        # msg['Subject'] = "🚨 SECURITY ALERT: Threat Detected"
        # msg['From'] = sender
        # msg['To'] = receiver
        # server = smtplib.SMTP('smtp.gmail.com', 587)
        # server.starttls()
        # server.login(sender, password)
        # server.sendmail(sender, receiver, msg.as_string())
        # server.quit()
    except Exception as e:
        print("Failed to send email", e)


# --- FEATURE: MULTI-MODAL VISION ANALYSIS ---
def analyze_vision_background(frame, timestamp_str):
    try:
        _, buffer = cv2.imencode('.jpg', frame)
        img_str = base64.b64encode(buffer).decode('utf-8')
        payload = {
            "model": "llava",
            "prompt": "Describe the clothing, colors, and appearance of the person in this image in one short sentence.",
            "images": [img_str],
            "stream": False
        }
        response = requests.post("http://localhost:11434/api/generate", json=payload)
        description = response.json().get("response", "").strip()
        
        if description:
            log_entry = f"[{timestamp_str}] VISUAL ANALYSIS: The person detected earlier looks like: {description}\n"
            with open("events_log.txt", "a") as f:
                f.write(log_entry)
            print(f"👁️ Vision Analysis complete: {description}")
    except Exception as e:
        pass


class CameraStream:
    def __init__(self):
        self.cap = None
        self.is_running = False
        self.current_frame_bytes = None
        self.thread = None
        self.is_recording = False
        self.recording_frames_left = 0
        self.video_writer = None
        
    def start(self):
        if self.is_running: return
        self.is_running = True
        self.cap = cv2.VideoCapture(0)
        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.thread.start()
        print("🔓 Camera hardware lock acquired.")
        
    def stop(self):
        self.is_running = False
        if self.thread is not None:
            self.thread.join(timeout=2.0)
        if self.cap is not None:
            self.cap.release()
            self.cap = None
        if self.video_writer is not None:
            self.video_writer.release()
            self.video_writer = None
            
    def _capture_loop(self):
        last_log_time = 0
        while self.is_running and self.cap and self.cap.isOpened():
            success, frame = self.cap.read()
            if not success:
                time.sleep(0.1)
                continue
                
            results = yolo_model(frame, stream=True, verbose=False)
            annotated_frame = frame
            
            for r in results:
                annotated_frame = r.plot()
                current_time = time.time()
                
                if current_time - last_log_time > 3.0:
                    detected_objects = [yolo_model.names[int(box.cls[0])] for box in r.boxes]
                    if detected_objects:
                        counts = Counter(detected_objects)
                        descriptions = [f"{count} {obj}" for obj, count in counts.items()]
                        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        sentence = f"[{timestamp}] Activity detected: {', '.join(descriptions)}"
                        
                        if "person" in detected_objects:
                            # 1. DeepFace Verification
                            face_id = "UNKNOWN THREAT"
                            try:
                                dfs = DeepFace.find(img_path=frame, db_path="known_faces", enforce_detection=False, silent=True)
                                if len(dfs) > 0 and not dfs[0].empty:
                                    face_id = os.path.basename(dfs[0].iloc[0]['identity']).split('.')[0]
                            except Exception:
                                pass
                            sentence += f" | Face ID: {face_id}"
                            
                            # 2. Behavioral Anomaly Detection (Pose)
                            pose_results = pose_model(frame, stream=False, verbose=False)
                            for pr in pose_results:
                                if hasattr(pr, 'keypoints') and pr.keypoints is not None and len(pr.keypoints.xy) > 0:
                                    kpts = pr.keypoints.xy[0]
                                    if len(kpts) >= 17:
                                        nose_y = float(kpts[0][1])
                                        left_wrist_y = float(kpts[9][1])
                                        right_wrist_y = float(kpts[10][1])
                                        left_ankle_y = float(kpts[15][1])
                                        
                                        if nose_y > 0 and left_ankle_y > 0 and abs(nose_y - left_ankle_y) < 50:
                                            sentence += " | BEHAVIOR ALARM: Subject has FALLEN"
                                        elif (left_wrist_y > 0 and left_wrist_y < nose_y) or (right_wrist_y > 0 and right_wrist_y < nose_y):
                                            sentence += " | BEHAVIOR ALARM: Subject has HANDS RAISED"
                            
                            # 3. Trigger Visual Analysis Thread
                            threading.Thread(target=analyze_vision_background, args=(frame.copy(), timestamp), daemon=True).start()

                            # 4. VMS Extraction & Email Alerts
                            clip_path = ""
                            if face_id == "UNKNOWN THREAT" and not self.is_recording:
                                self.is_recording = True
                                self.recording_frames_left = 100 
                                timestamp_file = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
                                clip_path = f"clips/threat_{timestamp_file}.mp4"
                                h, w = frame.shape[:2]
                                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                                self.video_writer = cv2.VideoWriter(clip_path, fourcc, 20.0, (w, h))
                                sentence += f" | Clip Saved: {clip_path}"
                                print(f"🚨 THREAT DETECTED! Recording video.")
                                
                                # Send Automated Email Alert asynchronously
                                threading.Thread(target=send_threat_email, args=(sentence,), daemon=True).start()
                        
                        with open("events_log.txt", "a") as f:
                            f.write(sentence + "\n")
                            
                    last_log_time = current_time

            if self.is_recording and self.video_writer is not None:
                self.video_writer.write(annotated_frame)
                self.recording_frames_left -= 1
                if self.recording_frames_left <= 0:
                    self.is_recording = False
                    self.video_writer.release()
                    self.video_writer = None

            ret, buffer = cv2.imencode('.jpg', annotated_frame)
            if ret:
                self.current_frame_bytes = buffer.tobytes()

camera_stream = CameraStream()

@app.post("/api/camera/toggle")
def toggle_camera(state: dict):
    if state.get("active"):
        camera_stream.start()
    else:
        camera_stream.stop()
    return {"status": "ok"}

def generate_frames():
    camera_stream.start()
    while camera_stream.is_running:
        if camera_stream.current_frame_bytes:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + camera_stream.current_frame_bytes + b'\r\n')
        time.sleep(0.05) 

@app.get("/api/video_feed")
def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/api/logs")
def get_timeline_logs():
    """Returns the most recent 100 logs for the React Timeline UI"""
    try:
        if not os.path.exists("events_log.txt"):
            return {"logs": []}
        with open("events_log.txt", "r") as f:
            lines = [line.strip() for line in f.readlines() if line.strip()]
        return {"logs": lines[-100:]}
    except Exception as e:
        return {"logs": []}

class ChatRequest(BaseModel):
    query: str

@app.post("/api/chat")
def chat(request: ChatRequest):
    try:
        global llm
        vectordb = build_vector_database()
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectordb.as_retriever(search_kwargs={"k": 10}),
            chain_type_kwargs={"prompt": security_prompt},
            return_source_documents=False
        )
        response = qa_chain.invoke(request.query)
        return {"answer": response['result']}
    except Exception as e:
        return {"answer": f"Error contacting AI: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
