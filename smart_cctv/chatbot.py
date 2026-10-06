import os
import warnings
warnings.filterwarnings("ignore") # Ignore Langchain deprecation warnings for clean output

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA

def build_vector_database():
    """PHASE 7: Build ChromaDB Vector Store from Logs"""
    print("📚 Converting CCTV logs into ChromaDB Vector Space...")
    
    if not os.path.exists("events_log.txt"):
        with open("events_log.txt", "w") as f:
            f.write("No events recorded yet.\n")
            
    loader = TextLoader("events_log.txt")
    documents = loader.load()
    
    # We split logs by line (each event is a separate document in the database)
    docs = documents[0].page_content.strip().split('\n')
    docs = [d for d in docs if d] # Filter empty lines
    
    if not docs:
        docs = ["No events recorded yet."]
        
    # We use HuggingFace embeddings to turn text into math vectors (100% free offline)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # Create the ChromaDB in memory
    vectordb = Chroma.from_texts(texts=docs, embedding=embeddings)
    return vectordb

def main():
    print("="*60)
    print("🧠 Booting up Enterprise RAG Chatbot (Llama 3.2 + ChromaDB)...")
    print("="*60)
    
    # 1. Initialize Vector DB
    vectordb = build_vector_database()
    
    # 2. Initialize Llama 3.2 Local LLM
    print("🔗 Connecting to Local Llama 3.2 LLM...")
    llm = Ollama(model="llama3.2")
    
    # 3. Create RAG Chain (Retrieval-Augmented Generation)
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectordb.as_retriever(search_kwargs={"k": 5}), # Get top 5 most relevant events
        return_source_documents=False
    )
    
    print("\n✅ System Ready. Type 'exit' to quit.\n")
    
    while True:
        query = input("Security Query: ")
        if query.lower() in ['exit', 'quit']:
            break
            
        print("🤖 RAG Engine is searching ChromaDB and generating response...")
        try:
            response = qa_chain.invoke(query)
            print(f"\n>> {response['result']}\n")
        except Exception as e:
            print(f"\n[!] Error: {e}")

if __name__ == "__main__":
    main()
