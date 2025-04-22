'''
A script to generate 1 days worth of recipes, jokes, and facts using the Gemini-1.5-flash model.
All categories of recipes and facts are generated.
The output is stored in JSON files in the (daily_outputs) directory - ignored by git.

TODO: Insert your API-key in the dotenv file as GEMINI_API_KEY=your_api_key
To manage dependencies, use "pip install" or "conda install"
'''

import time
from dotenv import load_dotenv
import os
import google.generativeai as genai
import datetime
import json
import re
from fractions import Fraction

OUTPUT_DIR = "daily_outputs"

def extract_json_block(text):
    """
    Strips markdown code block formatting and converts fractional numbers to decimals in 'amount' fields.
    """
    # Remove triple backtick code fences
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1])
    
    # Replace fraction-like values (e.g., 1/2) with decimal equivalents inside amount fields
    def replace_fractions(match):
        fraction_str = match.group(0)
        try:
            return str(float(Fraction(fraction_str)))
        except ZeroDivisionError:
            return "0.0"
        except ValueError:
            return fraction_str
    
    # Regex to find standalone fractions in the JSON values (not in strings)
    text = re.sub(r'(?<=["\':\s])(\d+\s*/\s*\d+)', replace_fractions, text)
    return text

def setup_model():
    """
    Configures the Generative AI model with the API key and generation settings.
    """
    # Load environment variables
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Configure the Generative AI model
    genai.configure(api_key=api_key)
    
    generation_config = {
        "temperature": 0.5,  # Otherwise the jokes are identical across days
        "max_output_tokens": 2048,
    }
    
    return genai.GenerativeModel("gemini-1.5-flash", generation_config=generation_config)

def generate_recipe_of_the_day(model, date_str, category_input="default"):
    # TODO: Currently all recipes across categories are pretty much identical. Need to edit more. 
    # TODO BUG: The instrcutions section is sometimes a list of strings, and sometimes a single string. Need to improve prompting
    prompt = f"""
Generate a concise, date-relevant recipe for {date_str} in JSON format with these fields:
{{
  "title": "<recipe title>",
  "description": "<short description related to the recipe and the date>",
  "ingredients": {{
    "<ingredient>": {{
      "amount": <number>,
      "unit": "<unit like cup, tsp, g>"
    }}
  }},
  "instructions": ["Step 1...", "Step 2...", "..."],
  "cook_time": "<time in minutes or hours>",
  "serving_size": <number>,
  "category": "{category_input}"
}}

Make the recipe contextually relevant to the day and month ({date_str}) by considering seasonal ingredients, cultural events, weather patterns, or historical facts tied to this date.

Avoid repeating similar dishes from nearby dates.

Ensure the entire JSON does not exceed 2000 characters. Keep instructions and ingredients concise but complete. Use readable cooking units.
"""
    # TODO: make the generation agnostic to the model, the following 3 lines are only Gemini specific. 
    response = model.generate_content(prompt)
    output = response.text.strip()
    cleaned = extract_json_block(output)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON", "raw": cleaned}


def generate_jokes_of_the_day(model, date_str):
    # 
    prompt = f"""
Generate 3 separate jokes in JSON format as a list. Each joke must be under 500 characters. The jokes must relate to today ({date_str}).

Format:
["joke1", "joke2", "joke3"]
"""

    response = model.generate_content(prompt)
    cleaned = extract_json_block(response.text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"error - Invalid JSON:": cleaned}


def generate_fact_of_the_day(model, date_str, category):
    #TODO: Improve prompting to get more truthful answers
    prompt = f"""
Generate one date-relevant fact for {date_str} in the category '{category}' in the following JSON format:
{{
  "fact": "<educational and factual statement (≤ 1000 characters)>",
  "source": "<cite a reliable and concise source (≤ 200 characters)>"
}}

The fact must be historically or contextually related to the current date and its relevance should be explained within the fact itself. 

The source should only be a link to a website. 
"""

    response = model.generate_content(prompt)
    cleaned = extract_json_block(response.text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON", "raw": cleaned}
    
def save_json_to_file(data, filename):
    file_path = os.path.join(OUTPUT_DIR, filename)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def generate_and_save_content(date_range, verbose=False):
    """
    Main function to generate and save the recipe, jokes, and fact of the day.
    """
    if verbose:
        print(f"Verbose mode is on. Generating content for {date_range} days.")
    # Set up the model
    model = setup_model()  # Only Gemini-1.5-flash is supported

    # Get the UTC date to align with the server time
    utc_now = datetime.datetime.now(datetime.timezone.utc)
    today = utc_now.date()
    # The format of datestring is "Month Day" (e.g., "January 01")
    # date_string = "December 16"    # Uncomment this line to use a specific date in the format "Month Day"
    for i in range(date_range):
        date = today - datetime.timedelta(days=i)
        date_string = date.strftime("%B %d")
        print(f"Generating content for date: {date_string}")

        # Categories for recipes and facts
        # TODO: Extract into enums to be grabbed from schema.sql
        recipe_categories = ['default', 'veganism', 'vegetarianism', 'lactose_intolerance', 'gluten_intolerance', 'kosher']
        fact_categories = ['mathematics', 'physics', 'biology', 'computer science', 'chemistry'] # Full name was used for clarity

        # Generate the content
        # TODO: Add error handling for incorrect size generation
        all_recipes = {}
        for category in recipe_categories:
            if(verbose): print(f"Generating recipe for category: {category}")
            all_recipes[category] = generate_recipe_of_the_day(model, date_string, category)

        if(verbose): print("Generating 3 jokes of the day...")
        all_jokes = generate_jokes_of_the_day(model, date_string)
        
        all_facts = {}
        for category in fact_categories:
            if(verbose): print(f"Generating fact for category: {category}")
            all_facts[category] = generate_fact_of_the_day(model, date_string, category)
        
        # Sleep for 5 seconds to avoid rate limiting
        time.sleep(60)
        
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        save_json_to_file(all_recipes, f"recipes_{date_string}.json")
        save_json_to_file(all_jokes, f"jokes_{date_string}.json")
        save_json_to_file(all_facts, f"facts_{date_string}.json")
