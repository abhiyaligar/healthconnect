from app.core.supabase import get_supabase
import uuid

def upload_medical_file(file_content: bytes, filename: str, content_type: str):
    """
    Uploads a file to the 'medical-records' bucket in Supabase.
    Returns the public URL of the uploaded file.
    """
    supabase = get_supabase()
    
    # Generate a unique path
    unique_filename = f"{uuid.uuid4()}_{filename}"
    path = f"records/{unique_filename}"
    
    # Upload to Supabase Storage
    # Bucket must be created manually or via script
    response = supabase.storage.from_("medical-records").upload(
        path=path,
        file=file_content,
        file_options={"content-type": content_type}
    )
    
    # Get Public URL
    # Assuming the bucket is public or we use signed URLs
    # For now, we'll use the public URL getter
    return supabase.storage.from_("medical-records").get_public_url(path)
