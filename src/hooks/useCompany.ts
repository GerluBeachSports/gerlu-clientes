// hooks/useCompany.ts
export function useCompany() {
  const companyId = import.meta.env.VITE_COMPANY_ID;

  if (!companyId) throw new Error("VITE_COMPANY_ID não definido no .env");

  return { companyId };
}