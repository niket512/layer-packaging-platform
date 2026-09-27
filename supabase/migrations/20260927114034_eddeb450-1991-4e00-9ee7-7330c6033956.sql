REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_supplier_contact(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.owns_rfq(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.invited_to_rfq(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_access_po(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.supplier_update_po(uuid, text, text, date) FROM PUBLIC, anon;