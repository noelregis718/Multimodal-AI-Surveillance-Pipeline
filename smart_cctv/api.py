import cv2
import time
import random
import datetime
import threading
from fastapi import FastAPI, Response, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import Counter
from ultralytics import YOLO

import warnings
warnings.filterwarnings("ignore")

# Import our existing RAG components
from chatbot import build_vector_database
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA

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

print("🧠 Initializing RAG Engine...")
vectordb = build_vector_database()
llm = Ollama(model="llama3.2")
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectordb.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=False
)

def identify_face_mock():
    faces = ["Admin (Authorized)", "UNKNOWN THREAT"]
    return random.choice(faces)

# ---- NEW THREAD-SAFE CAMERA MANAGER ----
class CameraStream:
    def __init__(self):
        self.cap = None
        self.is_running = False
        self.current_frame_bytes = None
        self.thread = None
        
    def start(self):
        if self.is_running: return
        self.is_running = True
        self.cap = cv2.VideoCapture(0)
        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.thread.start()
        print("🔓 Camera hardware lock acquired in background thread.")
        
    def stop(self):
        self.is_running = False
        if self.thread is not None:
            self.thread.join(timeout=2.0)
        if self.cap is not None:
            self.cap.release()
            self.cap = None
            print("🔒 Camera hardware lock successfully released and powered down.")
            
    def _capture_loop(self):
        last_log_time = 0
        while self.is_running and self.cap and self.cap.isOpened():
            success, frame = self.cap.read()
            if not success:
                time.sleep(0.1)
                continue
                
            # Disable verbose logging to keep terminal clean
            results = yolo_model(frame, stream=True, verbose=False)
            annotated_frame = frame
            
            for r in results:
                annotated_frame = r.plot()
                current_time = time.time()
                
                # Log every 3 seconds to avoid spam
                if current_time - last_log_time > 3.0:
                    detected_objects = [yolo_model.names[int(box.cls[0])] for box in r.boxes]
                    if detected_objects:
                        counts = Counter(detected_objects)
                        descriptions = [f"{count} {obj}" for obj, count in counts.items()]
                        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        sentence = f"[{timestamp}] Activity detected: {', '.join(descriptions)}"
                        
                        if "person" in detected_objects:
                            sentence += f" | Face ID: {identify_face_mock()}"
                            
                        # Write to our master log file
                        with open("events_log.txt", "a") as f:
                            f.write(sentence + "\n")
                            
                    last_log_time = current_time

            # Encode the frame as JPEG
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
    # Ensure camera is started when someone visits the feed directly
    camera_stream.start()
    
    while camera_stream.is_running:
        if camera_stream.current_frame_bytes:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + camera_stream.current_frame_bytes + b'\r\n')
        time.sleep(0.05) # Limit to ~20 FPS to prevent burning CPU

@app.get("/api/video_feed")
def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

from langchain.prompts import PromptTemplate

security_prompt = PromptTemplate(
    template="""You are an advanced AI Security Assistant analyzing CCTV logs.
Here are the retrieved events from the security camera logs:
{context}

Based on the logs above, answer the following query from the Admin. Be detailed and specify the times and objects detected. If the answer is not in the logs, say "I did not detect that today."
Admin Query: {question}

Detailed Answer:""",
    input_variables=["context", "question"]
)

class ChatRequest(BaseModel):
    query: str

@app.post("/api/chat")
def chat(request: ChatRequest):
    try:
        global llm
        # Rebuild DB with latest logs
        vectordb = build_vector_database()
        
        # Build a fresh chain with the custom prompt so it answers intelligently
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
