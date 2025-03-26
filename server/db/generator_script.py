# Run "pip install dotenv" in terminal if the package is missing
from dotenv import load_dotenv
import os
import google.generativeai as genai

# Generate
load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

# Connect to Google Gemini Pro
generation_config = {
  #"maxOutputTokens": 2048,
  "temperature": 0,
  #"topP": 1,
  #"topK": 50,
}

# gemini-1.5-pro
gemini_model = genai.GenerativeModel(model_name="gemini-1.5-flash", generation_config=generation_config)


