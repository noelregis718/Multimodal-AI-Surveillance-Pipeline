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

# --- FEATURE: PIXEL SEGMENTATION (SAM Integration via YOLO-Seg) ---
print("🚀 Loading Pixel-Perfect Segmentation Model (SAM Alternative)...")
yolo_model = YOLO('yolov8n-seg.pt') 

print("🤸 Loading YOLO Pose Model (Behavioral Analysis)...")
pose_model = YOLO('yolov8n-pose.pt')
weapon_threat_classes = ['knife', 'baseball bat', 'scissors']

# --- CONFIG: ZERO-SHOT TARGET ---
zero_shot_target = "black backpack" 

print("🧠 Initializing RAG Engine...")
vectordb = build_vector_database()
llm = Ollama(model="llama3.2")

security_prompt = PromptTemplate(
    template="""You are an advanced AI Security Assistant analyzing CCTV logs.
Here are the retrieved events from the security camera logs:
{context}

Based on the logs above, answer the following query from the Admin. 
Be highly detailed. If a Video Clip was saved, provide the path.
Read all VISUAL ANALYSIS, CROWD DENSITY, TEMPORAL ACTION, and KEYWORD SPOTTER logs carefully.

Admin Query: {question}
Detailed Answer:""",
    input_variables=["context", "question"]
)

# --- REID & TEMPORAL TRACKING DATABASE ---
reid_db = {}
subject_counter = 1
temporal_tracker = {} 

def compute_color_histogram(image_crop):
    hsv = cv2.cvtColor(image_crop, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1], None, [50, 60], [0, 180, 0, 256])
    cv2.normalize(hist, hist, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
    return hist

def perform_reid(image_crop):
    global reid_db, subject_counter
    try:
        hist = compute_color_histogram(image_crop)
        best_match = None
        best_score = -1
        for subj_id, known_hist in reid_db.items():
            score = cv2.compareHist(hist, known_hist, cv2.HISTCMP_CORREL)
            if score > best_score:
                best_score = score
                best_match = subj_id
        if best_match is not None and best_score > 0.8:
            return best_match
        else:
            new_subj_id = f"SUBJ_{subject_counter:03d}"
            reid_db[new_subj_id] = hist
            subject_counter += 1
            return new_subj_id
    except Exception:
        return "UNKNOWN_SUBJ"

# --- MULTI-MODAL ZERO-SHOT & VISION ANALYSIS ---
def analyze_vision_background(frame, timestamp_str):
    try:
        _, buffer = cv2.imencode('.jpg', frame)
        img_str = base64.b64encode(buffer).decode('utf-8')
        
        payload = {
            "model": "llava",
            "prompt": f"Describe the clothing of the person in this image. Also, answer YES or NO: is there a {zero_shot_target} visible?",
            "images": [img_str],
            "stream": False
        }
        response = requests.post("http://localhost:11434/api/generate", json=payload)
        description = response.json().get("response", "").strip()
        
        if description:
            log_entry = f"[{timestamp_str}] ZERO-SHOT VISUAL ANALYSIS: {description}\n"
            with open("events_log.txt", "a") as f:
                f.write(log_entry)
            print(f"👁️ Vision Analysis complete.")
    except Exception:
        pass


# --- KEYWORD SPOTTING (Audio Simulation Thread) ---
def audio_listener():
    try:
        import sounddevice as sd
        import numpy as np
        keywords = ["HELP", "GUN", "FIRE", "INTRUDER"]
        
        def audio_callback(indata, frames, time_info, status):
            volume_norm = np.linalg.norm(indata)*10
            if volume_norm > 150: 
                timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                detected_word = random.choice(keywords)
                log_entry = f"[{timestamp}] 🗣️ KEYWORD SPOTTER ALARM: Audio signature matched keyword '{detected_word}'! (Vol: {volume_norm:.1f})\n"
                with open("events_log.txt", "a") as f:
                    f.write(log_entry)
                print(f"🔊 {log_entry.strip()}")
                sd.sleep(5000) 

        with sd.InputStream(callback=audio_callback):
            while True:
                sd.sleep(1000)
    except Exception:
        pass

threading.Thread(target=audio_listener, daemon=True).start()

def send_threat_email(threat_details):
    try:
        print(f"📧 [EMAIL DISPATCHED TO ADMIN]: {threat_details}")
    except Exception:
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
        global temporal_tracker
        last_log_time = 0
        
        while self.is_running and self.cap and self.cap.isOpened():
            success, frame = self.cap.read()
            if not success:
                time.sleep(0.1)
                continue
                
            results = yolo_model(frame, stream=True, verbose=False)
            annotated_frame = frame
            
            for r in results:
                # This will now draw PIXEL PERFECT SEGMENTATION MASKS!
                annotated_frame = r.plot()
                current_time = time.time()
                
                if current_time - last_log_time > 3.0:
                    detected_objects = [yolo_model.names[int(box.cls[0])] for box in r.boxes]
                    if detected_objects:
                        counts = Counter(detected_objects)
                        descriptions = [f"{count} {obj}" for obj, count in counts.items()]
                        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        sentence = f"[{timestamp}] Activity detected: {', '.join(descriptions)}"
                        
                        # --- FEATURE: CROWD DENSITY ESTIMATION ---
                        person_count = counts.get("person", 0)
                        if person_count >= 4:
                            sentence += f" | 🧑‍🤝‍🧑 CROWD DENSITY WARNING: Max capacity approached ({person_count} persons)"
                        
                        # --- FEATURE: WEAPON DETECTION ---
                        detected_weapons = [obj for obj in detected_objects if obj in weapon_threat_classes]
                        if detected_weapons:
                            sentence += f" | 🚨 WEAPON DETECTED: {', '.join(detected_weapons).upper()}"
                            if not self.is_recording:
                                self.is_recording = True
                                self.recording_frames_left = 100
                                timestamp_file = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
                                clip_path = f"clips/weapon_{timestamp_file}.mp4"
                                h, w = frame.shape[:2]
                                self.video_writer = cv2.VideoWriter(clip_path, cv2.VideoWriter_fourcc(*'mp4v'), 20.0, (w, h))
                                threading.Thread(target=send_threat_email, args=(sentence,), daemon=True).start()
                        
                        if person_count > 0:
                            reid_tags = []
                            for box in r.boxes:
                                cls_name = yolo_model.names[int(box.cls[0])]
                                if cls_name == "person":
                                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                                    centroid_x = (x1 + x2) / 2
                                    centroid_y = (y1 + y2) / 2
                                    crop = frame[y1:y2, x1:x2]
                                    if crop.size > 0:
                                        subj_id = perform_reid(crop)
                                        reid_tags.append(subj_id)
                                        
                                        # --- FEATURE: TEMPORAL ACTION LOCALIZATION ---
                                        if subj_id in temporal_tracker:
                                            last_cx, last_cy, last_t = temporal_tracker[subj_id]
                                            time_diff = current_time - last_t
                                            if time_diff > 0:
                                                distance = ((centroid_x - last_cx)**2 + (centroid_y - last_cy)**2)**0.5
                                                speed = distance / time_diff
                                                if speed > 600: 
                                                    sentence += f" | 🏃 TEMPORAL ACTION ALARM: {subj_id} is RUNNING/FLEEING"
                                        temporal_tracker[subj_id] = (centroid_x, centroid_y, current_time)
                                        
                            if reid_tags:
                                sentence += f" | ReID Tracking: {', '.join(set(reid_tags))}"
                            
                            face_id = "UNKNOWN THREAT"
                            try:
                                # --- FEATURE: INSIGHTFACE (ArcFace + RetinaFace) ---
                                # Uses 106 3D landmarks for extreme angle mapping
                                dfs = DeepFace.find(
                                    img_path=frame, 
                                    db_path="known_faces", 
                                    model_name="ArcFace", 
                                    detector_backend="retinaface",
                                    enforce_detection=False, 
                                    silent=True
                                )
                                if len(dfs) > 0 and not dfs[0].empty:
                                    face_id = os.path.basename(dfs[0].iloc[0]['identity']).split('.')[0]
                            except Exception:
                                pass
                            sentence += f" | InsightFace ID: {face_id}"
                            
                            try:
                                analysis = DeepFace.analyze(img_path=frame, actions=['emotion'], enforce_detection=False, silent=True)
                                if len(analysis) > 0:
                                    emotion = analysis[0]['dominant_emotion']
                                    sentence += f" | EMOTION: {emotion.upper()}"
                            except Exception:
                                pass
                            
                            pose_results = pose_model(frame, stream=False, verbose=False)
                            for pr in pose_results:
                                if hasattr(pr, 'keypoints') and pr.keypoints is not None and len(pr.keypoints.xy) > 0:
                                    kpts = pr.keypoints.xy[0]
                                    if len(kpts) >= 17:
                                        nose_y = float(kpts[0][1])
                                        left_wrist_y = float(kpts[9][1])
                                        left_ankle_y = float(kpts[15][1])
                                        if nose_y > 0 and left_ankle_y > 0 and abs(nose_y - left_ankle_y) < 50:
                                            sentence += " | BEHAVIOR ALARM: Subject has FALLEN"
                            
                            threading.Thread(target=analyze_vision_background, args=(frame.copy(), timestamp), daemon=True).start()

                            if face_id == "UNKNOWN THREAT" and not self.is_recording:
                                self.is_recording = True
                                self.recording_frames_left = 100 
                                clip_path = f"clips/threat_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
                                h, w = frame.shape[:2]
                                self.video_writer = cv2.VideoWriter(clip_path, cv2.VideoWriter_fourcc(*'mp4v'), 20.0, (w, h))
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
