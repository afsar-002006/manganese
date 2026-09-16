
CREATE POLICY "datasets_own_read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'mining-datasets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "datasets_own_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'mining-datasets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "datasets_own_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'mining-datasets' AND (storage.foldername(name))[1] = auth.uid()::text);
