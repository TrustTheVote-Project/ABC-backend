import { User } from 'types';
import { get, post, SuccessResult } from './base';

// TODO specify types for these requests
export interface RequestLoginCodeParams {
  email: string
}

export const requestLoginCode = async (data: RequestLoginCodeParams): Promise<SuccessResult> => {
  return {
    success: true
  }
  return await post("/auth/login", data)
}

export const logout = async () => {
  return await post("/auth/logout")
}

export const identify = async (): Promise<User> => {
  return {
    id: "abc-123",
    email: "admin@test.com",
    first_name: "Fradmin",
    last_name: "Ladmin"
  }
  return await get("/user/get/self");
}