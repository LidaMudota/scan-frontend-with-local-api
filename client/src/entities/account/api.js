import { accountInfoRequest } from '../../shared/api';

export async function fetchAccount(token) {
  const response = await accountInfoRequest(token);
  return {
    ...response,
    eventFiltersInfo: {
      usedCompanyCount: response?.eventFiltersInfo?.usedCompanyCount ?? 0,
      companyLimit: response?.eventFiltersInfo?.companyLimit ?? 0,
    },
    user: response?.user ?? null,
    tariff: response?.tariff ?? '',
  };
}
