import os
import time
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from transformers import T5Tokenizer, T5ForConditionalGeneration


GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") 

if not GEMINI_API_KEY:
    print("⚠️ WARNING: GEMINI_API_KEY environment variable not set.")

genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Hybrid AI Content Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#LOAD LOCAL MODEL
LOCAL_PATH = "./local_model"
local_model = None
tokenizer = None

print(f"🔄 Loading AI Engine...")
try:
    if os.path.exists(LOCAL_PATH):
        tokenizer = T5Tokenizer.from_pretrained(LOCAL_PATH)
        local_model = T5ForConditionalGeneration.from_pretrained(LOCAL_PATH)
        print("✅ Local T5 Model Loaded!")
    else:
        print(f"⚠️ Local model not found at {LOCAL_PATH}")
except Exception as e:
    print(f"⚠️ Local Model Error: {e}")

class RequestData(BaseModel):
    text: str
    type: str

@app.post("/generate")
def generate_content(data: RequestData):
    start_time = time.time()
    use_cloud = False
    source = "Local T5-Small"
    result = None
        
    # Routing Logic
    if len(data.text) > 200 or data.type == "hashtag":
        use_cloud = True
        
    #try local
    if not use_cloud and local_model:
        try:
            input_text = "caption: " + data.text
            input_ids = tokenizer(input_text, return_tensors="pt").input_ids
            outputs = local_model.generate(
                input_ids, max_length=80, num_beams=4, 
                repetition_penalty=2.5, no_repeat_ngram_size=2, early_stopping=True
            )
            result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        except Exception:
            use_cloud = True
                
    #cloud fallback
    if use_cloud or not result:
        source = "Gemini 2.0 Flash"  # Updated Name for Display
        try:
            model = genai.GenerativeModel('gemini-2.0-flash')
            prompt = f"Write a creative {data.type} for this context: {data.text}. Keep it engaging."
            response = model.generate_content(prompt)
            result = response.text
        except Exception as e:
            result = f"Cloud Error: {str(e)}"
                
    return {
        "result": result,
        "source": source,
        "latency_ms": round((time.time() - start_time) * 1000, 2)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


# DIAGNOSTIC SCRIPT
print(f"\n---- DIAGNOSTIC TEST ----")
print(f"Library Version: {genai.__version__}")

TEST_KEY = os.environ.get("GEMINI_API_KEY") 

try:
    if not TEST_KEY:
        raise ValueError("No API Key found in environment variables.")
        
    genai.configure(api_key=TEST_KEY)
    
    # list available models
    print("\n... Checking available models for your key ...")
    models = list(genai.list_models())
    found_flash = False
    for m in models:
        if 'generateContent' in m.supported_generation_methods:
            print(f" - Found: {m.name}")
            if "flash" in m.name:
                found_flash = True

    # try Generation
    print("\n... Attempting Generation with 'gemini-1.5-flash' ...")
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello, are you working?")
    print(f"\n SUCCESS! API Response: {response.text}")

except Exception as e:
    print(f"\n FAILURE. Error Details:")
    print(e)
    print("\nTROUBLESHOOTING:")
    if "404" in str(e):
        print(" -> 404 means the Model Name is wrong OR the API Key doesn't have access.")
    if "403" in str(e):
        print(" -> 403 means the API Key is invalid or billing is disabled.")