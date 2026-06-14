import chromadb
import os

# Initialize local persistent ChromaDB client
chroma_client = chromadb.PersistentClient(path="./chroma_db")
journal_collection = chroma_client.get_or_create_collection(name="journal_entries")

def add_journal_vector(entry_id: int, text: str, metadata: dict, embedding: list[float]):
    """
    Adds a journal entry's text and embedding to the ChromaDB vector store.
    """
    journal_collection.add(
        ids=[str(entry_id)],
        embeddings=[embedding],
        documents=[text],
        metadatas=[metadata]
    )

def get_all_journals_from_vector_db():
    """
    Retrieves all journal documents and metadata for analysis.
    In a production app with thousands of entries, you'd use semantic search 
    or clustering rather than fetching all, but for this scale we can fetch all.
    """
    results = journal_collection.get(include=['documents', 'metadatas', 'embeddings'])
    return results

def search_similar_journals(query_embedding: list[float], n_results: int = 3):
    """
    Performs a vector search to find the most semantically similar past journal entries.
    """
    results = journal_collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results
