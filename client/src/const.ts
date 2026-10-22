export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local single-owner login is protected by the server's access boundary.
export const getLoginUrl = () => "/api/auth/local-login";
