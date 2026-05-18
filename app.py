from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

app = FastAPI()

tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-large")
model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-large")

class SymptomRequest(BaseModel):
    age: int
    gender: str
    symptoms: str

@app.post("/predict")
def predict(data: SymptomRequest):
    prompt = f"Patient ki umr {data.age} saal hai, gender {data.gender} hai, symptoms hain {data.symptoms}. Possible diagnosis kya ho sakta hai?"
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_length=150)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"diagnosis": response}
