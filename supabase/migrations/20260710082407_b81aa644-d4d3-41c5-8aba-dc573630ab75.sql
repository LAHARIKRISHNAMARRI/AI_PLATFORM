
CREATE POLICY "Teacher uploads own materials to bucket"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'materials' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Teacher updates own materials in bucket"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'materials' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Teacher deletes own materials in bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'materials' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner reads own materials in bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'materials' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Class students read class materials in bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'materials' AND EXISTS (
      SELECT 1 FROM public.materials m
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE m.storage_path = name AND m.class_name = p.class_name
    )
  );

CREATE POLICY "Admin reads all materials in bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'materials' AND public.has_role(auth.uid(),'admin'));
