from app.core.supabase import get_supabase
from app.core.config import get_settings
import uuid

settings = get_settings()

def upload_medical_file(file_content: bytes, filename: str, content_type: str):
    """
    Uploads a file to the configured bucket in Supabase.
    Returns the public URL of the uploaded file.
    """
    supabase = get_supabase()
    
    # Generate a unique path
    unique_filename = f"{uuid.uuid4()}_{filename}"
    path = f"records/{unique_filename}"
    
    # Upload to Supabase Storage
    # Bucket name is now pulled from settings
    response = supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
        path=path,
        file=file_content,
        file_options={"content-type": content_type}
    )
    
    # Get Public URL
    return supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET).get_public_url(path)
