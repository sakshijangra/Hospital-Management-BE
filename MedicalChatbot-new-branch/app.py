from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize LLM and Vector Store
HF_TOKEN = "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"
HUGGINGFACE_REPO_ID = "mistralai/Mistral-7B-Instruct-v0.3"
DB_FAISS_PATH = "vectorstore/db_faiss"  # ✅ Fixed path slashes

# Custom prompt template for medical queries
CUSTOM_PROMPT_TEMPLATE = """
Use the pieces of information provided in the context to answer the user's medical question.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Format your response in a clear, organized manner. If discussing a disease, include information about:
- Brief description
- Symptoms
- Causes
- Treatments
- Prevention methods (if applicable)

Context: {context}
Question: {question}

Start the answer directly. No small talk please.
"""

def load_llm():
    """Load the Hugging Face LLM model."""
    print("🔁 Loading LLM...")
    llm = HuggingFaceEndpoint(
        repo_id=HUGGINGFACE_REPO_ID,
        temperature=0.5,
        model_kwargs={"token": HF_TOKEN, "max_length": "512"}
    )
    print("✅ LLM loaded")
    return llm

def set_custom_prompt():
    """Set up the custom prompt template."""
    prompt = PromptTemplate(
        template=CUSTOM_PROMPT_TEMPLATE,
        input_variables=["context", "question"]
    )
    return prompt

def load_vector_store():
    """Load the FAISS vector store."""
    print("📦 Loading FAISS vector store from:", DB_FAISS_PATH)
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)
    print("✅ FAISS vector store loaded")
    return db

def initialize_qa_chain():
    """Initialize the QA chain with LLM and vector store."""
    db = load_vector_store()
    qa_chain = RetrievalQA.from_chain_type(
        llm=load_llm(),
        chain_type="stuff",
        retriever=db.as_retriever(search_kwargs={'k': 3}),
        return_source_documents=True,
        chain_type_kwargs={'prompt': set_custom_prompt()}
    )
    print("✅ QA chain initialized")
    return qa_chain

# Initialize the QA chain globally
try:
    qa_chain = initialize_qa_chain()
except Exception as e:
    print("❌ Failed to initialize QA chain:", e)
    qa_chain = None

@app.route('/api/medical-query', methods=['POST'])
def medical_query():
    """API endpoint for medical queries."""
    if not request.json or 'query' not in request.json:
        return jsonify({'error': 'Missing query parameter'}), 400

    user_query = request.json['query']

    if not qa_chain:
        return jsonify({'error': 'QA system initialization failed. Try restarting the server.'}), 500

    try:
        # Process the query through the QA chain
        print(f"🔍 Processing query: {user_query}")
        response = qa_chain.invoke({'query': user_query})
        result = response["result"]
        sources = [doc.page_content[:100] + "..." for doc in response["source_documents"]]

        # Extract disease info
        disease_info = extract_disease_info(result)

        return jsonify({
            'message': result,
            'sources': sources,
            'diseaseInfo': disease_info
        })

    except Exception as e:
        print("❌ Error during query processing:", e)
        return jsonify({'error': str(e)}), 500

def extract_disease_info(text):
    """Extract structured disease information from the text."""
    lines = text.split('\n')
    disease_info = {
        'name': '',
        'description': '',
        'symptoms': [],
        'causes': [],
        'treatments': [],
        'preventions': []
    }
    current_section = 'description'

    if lines and len(lines) > 0:
        disease_info['name'] = lines[0].strip()
        disease_info['description'] = ' '.join(lines[1:3])

    for line in lines:
        line = line.strip()
        if 'symptom' in line.lower():
            current_section = 'symptoms'
            continue
        elif 'cause' in line.lower():
            current_section = 'causes'
            continue
        elif 'treatment' in line.lower() or 'therap' in line.lower():
            current_section = 'treatments'
            continue
        elif 'prevent' in line.lower():
            current_section = 'preventions'
            continue

        if line and current_section in ['symptoms', 'causes', 'treatments', 'preventions']:
            if line.startswith(('-', '*', '•')):
                disease_info[current_section].append(line[1:].strip())
            else:
                disease_info[current_section].append(line)

    return disease_info

if __name__ == '__main__':
    print("🚀 Starting Flask app...")
    app.run(debug=True, port=5000)
