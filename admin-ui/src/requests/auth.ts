import { User } from 'types';
import { get, post, SuccessResult } from './base';

// TODO specify types for these requests
export interface RequestLoginCodeParams {
  email: string,
  totp: string
}

export interface SessionSuccessResult extends SuccessResult {
  sessionId: string
}

export const requestLoginCode = async (data: RequestLoginCodeParams): Promise<SessionSuccessResult> => {
  return await post("/admin/login", data)
}

export const logout = async () => {
  return await post("/admin/logout")
}

export const identify = async (sessionId: string): Promise<SessionSuccessResult> => {
  return await get("/admin/self", {}, sessionId);
}