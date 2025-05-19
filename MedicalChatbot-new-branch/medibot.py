# import os
# import streamlit as st
# import requests
# from langchain.embeddings import HuggingFaceEmbeddings
# from langchain.chains import RetrievalQA

# from langchain_community.vectorstores import FAISS
# from langchain_core.prompts import PromptTemplate
# from langchain_huggingface import HuggingFaceEndpoint

# ## Uncomment the following files if you're not using pipenv as your virtual environment manager
# #from dotenv import load_dotenv, find_dotenv
# #load_dotenv(find_dotenv())


# DB_FAISS_PATH="vectorstore/db_faiss"
# @st.cache_resource
# def get_vectorstore():
#     embedding_model=HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
#     db=FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)
#     return db


# def set_custom_prompt(custom_prompt_template):
#     prompt=PromptTemplate(template=custom_prompt_template, input_variables=["context", "question"])
#     return prompt


# def load_llm(huggingface_repo_id, HF_TOKEN):
#     llm=HuggingFaceEndpoint(
#         repo_id=huggingface_repo_id,
#         temperature=0.5,
#         model_kwargs={"token":HF_TOKEN,
#                       "max_length":"512"}
#     )
#     return llm


# def fetch_disease_image(disease_name):
#     """Fetches an image URL of a disease from Wikipedia."""
#     search_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{disease_name}"
#     response = requests.get(search_url)

#     if response.status_code == 200:
#         data = response.json()
#         if "thumbnail" in data:
#             return data["thumbnail"]["source"]  # Return the image URL
#     return None  # Return None if no image is found


# def main():
#     st.title("Ask Chatbot!")

#     if 'messages' not in st.session_state:
#         st.session_state.messages = []

#     for message in st.session_state.messages:
#         st.chat_message(message['role']).markdown(message['content'])

#     prompt=st.chat_input("Pass your prompt here")

#     if prompt:
#         st.chat_message('user').markdown(prompt)
#         st.session_state.messages.append({'role':'user', 'content': prompt})

#         CUSTOM_PROMPT_TEMPLATE = """
#                 Use the pieces of information provided in the context to answer user's question.
#                 If you dont know the answer, just say that you dont know, dont try to make up an answer. 
#                 Dont provide anything out of the given context

#                 Context: {context}
#                 Question: {question}

#                 Start the answer directly. No small talk please.
#                 """
        
#         HUGGINGFACE_REPO_ID="mistralai/Mistral-7B-Instruct-v0.3"
#         HF_TOKEN=os.environ.get("HF_TOKEN")

#         try: 
#             vectorstore=get_vectorstore()
#             if vectorstore is None:
#                 st.error("Failed to load the vector store")

#             qa_chain=RetrievalQA.from_chain_type(
#                 llm=load_llm(huggingface_repo_id=HUGGINGFACE_REPO_ID, HF_TOKEN=HF_TOKEN),
#                 chain_type="stuff",
#                 retriever=vectorstore.as_retriever(search_kwargs={'k':3}),
#                 return_source_documents=True,
#                 chain_type_kwargs={'prompt':set_custom_prompt(CUSTOM_PROMPT_TEMPLATE)}
#             )

#             response=qa_chain.invoke({'query':prompt})

#             result=response["result"]
#             source_documents=response["source_documents"]
#             result_to_show=result+"\nSource Docs:\n"+str(source_documents)
#             #response="Hi, I am MediBot!"
#             st.chat_message('assistant').markdown(result_to_show)
#             st.session_state.messages.append({'role':'assistant', 'content': result_to_show})
#             disease_name = prompt.lower().strip().replace(" ", "_")  # Format for Wikipedia search
#             image_url = fetch_disease_image(disease_name)

#             if image_url:
#                 st.image(image_url, caption=prompt.capitalize(), use_column_width=True)
#             else:
#                 st.write("⚠️ No image found for this disease.")

#         except Exception as e:
#             st.error(f"Error: {str(e)}")

# if __name__ == "__main__":
#     main()


import os
import streamlit as st
import requests
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEndpoint

# Path to FAISS Database
DB_FAISS_PATH = "vectorstore/db_faiss"

@st.cache_resource
def get_vectorstore():
    """Loads the FAISS vector store."""
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    try:
        db = FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)
        return db
    except Exception as e:
        st.error(f"Error loading vector store: {str(e)}")
        return None

def set_custom_prompt():
    """Defines a custom prompt for answering questions."""
    return PromptTemplate(
        template="""Use the given context to answer the user's question.
        If you don't know the answer, say so instead of making up an answer.
        Context: {context}
        Question: {question}""",
        input_variables=["context", "question"]
    )

SERPAPI_KEY = "04ee982808b0ce3c083dce15bdcea5cee1538b9a7919951523a715ea0f15c7a3"

def load_llm():
    """Loads the LLM model from HuggingFace."""
    HUGGINGFACE_REPO_ID = "mistralai/Mistral-7B-Instruct-v0.3"
    HF_TOKEN = HF_TOKEN="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"

    if not HF_TOKEN:
        st.error("❌ HF_TOKEN is missing! Please set your Hugging Face API token.")
        return None

    return HuggingFaceEndpoint(
        repo_id=HUGGINGFACE_REPO_ID,
        temperature=0.5,
        model_kwargs={"token": HF_TOKEN, "max_length": 512}
    )

def fetch_disease_image(disease_name):
    """Fetches an image of the disease using Google Images via SerpAPI."""
    if not SERPAPI_KEY:
        st.error("❌ SERPAPI_KEY is missing! Set it in your environment variables.")
        return None
    
    search_url = "https://serpapi.com/search"
    params = {
        "q": disease_name + " disease",
        "tbm": "isch",  # Image search mode
        "api_key": SERPAPI_KEY
    }
    
    try:
        response = requests.get(search_url, params=params)
        if response.status_code == 200:
            data = response.json()
            if "images_results" in data and data["images_results"]:
                return data["images_results"][0]["original"]
    except requests.RequestException as e:
        st.error(f"⚠️ Google Image fetch error: {str(e)}")
    
    return None  # If no image is found

def main():
    """Main function to run the chatbot."""
    st.title("🩺 Medical Chatbot with Disease Images")

    if 'messages' not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        st.chat_message(message['role']).markdown(message['content'])

    prompt = st.chat_input("Ask me about a disease...")

    if prompt:
        st.chat_message('user').markdown(prompt)
        st.session_state.messages.append({'role': 'user', 'content': prompt})

        vectorstore = get_vectorstore()
        llm = load_llm()

        if vectorstore is None or llm is None:
            st.error("⚠️ Cannot proceed: Vectorstore or LLM failed to load.")
            return

        try:
            qa_chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=vectorstore.as_retriever(search_kwargs={'k': 3}),
                return_source_documents=True,
                chain_type_kwargs={'prompt': set_custom_prompt()}
            )

            response = qa_chain.invoke({'query': prompt})
            result = response.get("result", "⚠️ No valid response received.")
            st.chat_message('assistant').markdown(result)
            st.session_state.messages.append({'role': 'assistant', 'content': result})

            # Fetch and display disease image
            disease_name = prompt.lower().strip().replace(" ", "_")
            image_url = fetch_disease_image(disease_name)

            if image_url:
                st.image(image_url, caption=prompt.capitalize(), use_column_width=True)
            else:
                st.write("⚠️ No image found for this disease.")

        except Exception as e:
            st.error(f"🚨 Error: {str(e)}")

if __name__ == "__main__":
    main()
