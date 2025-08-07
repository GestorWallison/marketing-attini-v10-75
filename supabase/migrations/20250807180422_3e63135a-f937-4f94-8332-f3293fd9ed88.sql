-- Fix function search path security issues
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) 
SET search_path = '';

ALTER FUNCTION public.get_user_role(_user_id uuid) 
SET search_path = '';

ALTER FUNCTION public.update_updated_at_column() 
SET search_path = '';

ALTER FUNCTION public.handle_new_user() 
SET search_path = '';