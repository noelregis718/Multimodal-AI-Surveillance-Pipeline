import cv2
import time
import datetime
import random
from ultralytics import YOLO
from collections import Counter

def send_mock_sms_alert(event_text):
    """PHASE 5: Real-Time Threat Alerts (Mock Twilio API)"""
    print("\n" + "!"*60)
    print("📱 [TWILIO API] HIGH PRIORITY ALERT TRIGGERED!")
    print(f"✉️ Sending SMS to Admin: {event_text}")
    print("!"*60 + "\n")

def identify_face_mock():
    """PHASE 4: Facial Recognition (Simulated for Demo)"""
    # For a college demo, we randomly assign a known identity or unknown threat
    # In a real build, you would run the 'face_recognition' library here.
    faces = ["Admin (Authorized)", "UNKNOWN THREAT"]
    return random.choice(faces)

def main():
    print("Loading AI Model...")
    model = YOLO('yolov8n.pt') 

    cap = None
    for cam_idx in [0, 1, 2]:
        print(f"Trying camera {cam_idx}...")
        temp_cap = cv2.VideoCapture(cam_idx)
        if temp_cap.isOpened():
            success, frame = temp_cap.read()
            if success and frame is not None and frame.any():
                cap = temp_cap
                print(f"Successfully connected to camera {cam_idx}!")
                break
        temp_cap.release()

    if cap is None:
        print("ERROR: Could not find a working camera.")
        return

    print("Starting Advanced Camera... Press 'q' to quit.")
    last_log_time = 0

    while cap.isOpened():
        success, frame = cap.read()
        if not success: break

        results = model(frame, stream=True)

        for r in results:
            annotated_frame = r.plot()
            current_time = time.time()
            
            if current_time - last_log_time > 3.0: # Log every 3 seconds
                detected_objects = []
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    detected_objects.append(model.names[cls_id])
                
                if detected_objects:
                    counts = Counter(detected_objects)
                    descriptions = [f"{count} {obj}" for obj, count in counts.items()]
                    
                    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    sentence = f"[{timestamp}] Activity detected: {', '.join(descriptions)}"
                    
                    # ---- PHASE 4: FACIAL RECOGNITION ----
                    if "person" in detected_objects:
                        identity = identify_face_mock()
                        sentence += f" | Face ID: {identity}"
                        
                        # ---- PHASE 5: REAL-TIME THREAT ALERTS ----
                        if identity == "UNKNOWN THREAT":
                            send_mock_sms_alert(sentence)

                    print(f"🚨 {sentence}")
                    
                    with open("events_log.txt", "a") as log_file:
                        log_file.write(sentence + "\n")
                        
                last_log_time = current_time

            cv2.imshow("Smart CCTV Feed", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
