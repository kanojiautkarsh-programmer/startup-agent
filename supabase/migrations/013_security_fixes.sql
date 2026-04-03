-- Fix RLS policies for security

-- Fix profiles INSERT policy to check auth.uid() matches the inserted id
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix profiles UPDATE policy WITH CHECK clause
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Set search_path for security-sensitive functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  INSERT INTO public.profiles (id, email, full_name, avatar_url, plan)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'starter'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_feature_usage()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  INSERT INTO public.feature_usage (user_id, feature_name, count)
  VALUES (NEW.user_id, NEW.feature_name, 1)
  ON CONFLICT (user_id, feature_name) 
  DO UPDATE SET count = feature_usage.count + 1, last_used = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.match_document_chunks(query_embedding vector(1536), match_threshold float, match_count int, user_uuid uuid)
RETURNS TABLE(chunk_id uuid, content text, similarity float, metadata jsonb) AS $$
BEGIN
  SET search_path = public;
  RETURN QUERY
  SELECT
    ce.chunk_id,
    ce.content,
    (ce.embedding <=> query_embedding)::float AS similarity,
    ce.metadata
  FROM chunk_embeddings ce
  INNER JOIN documents d ON ce.document_id = d.id
  WHERE d.user_id = user_uuid
    AND (ce.embedding <=> query_embedding) < match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
