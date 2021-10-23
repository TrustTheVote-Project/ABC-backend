import axios, { AxiosResponse } from 'axios'
export const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL_BASE || "http://localhost:3000";

export const post = async (path: string, data?: object, headers: object = {}): Promise<any> => {
  const url = `${API_URL_BASE}${path}`;
  let response: AxiosResponse;
  try {
    response = await axios.post(url, data, {
      //withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        ...headers,        
      }
    })
  } catch (err: any) {
    console.error(err);
    console.error(err.response?.data?.detail)
    throw({
      errors: [
        err.response?.data?.detail
      ]
    })
  }
  if (response.status === 200) {
    return response.data as object;
  } else {
    console.error(response)
    throw(response.statusText);
  }
}

export const get = async (path: string): Promise<any> => {
  const url = `${API_URL_BASE}${path}`;
  const response = await axios.get(url, {
    //withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  })
  if (response.status === 500) {
    throw(response.statusText);
  }
  return response.data as object;
}

export interface SuccessResult {
  success: boolean
}