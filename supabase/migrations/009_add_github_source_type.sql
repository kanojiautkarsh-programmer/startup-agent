-- Add github to source_type enum
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_source_type_check;
ALTER TABLE public.documents ADD CONSTRAINT documents_source_type_check 
  CHECK (source_type IN ('file', 'webpage', 'text', 'url', 'notion', 'slack', 'email', 'github'));
