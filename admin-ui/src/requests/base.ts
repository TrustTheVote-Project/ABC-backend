import axios, { AxiosResponse } from 'axios'
import { Maybe } from 'types';
export const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL_BASE || "http://localhost:3000";

interface optionalParamsType {
  headers?: object
  defaultReturn?: Maybe<object>
}

export const post = async (path: string, data: object={}, optionalParams: optionalParamsType = {headers: {}}): Promise<any> => {
  const { headers, defaultReturn } = optionalParams;
  const url = `${API_URL_BASE}${path}`;
  let response: AxiosResponse;
  try {
    response = await axios.post(url, data, {
      //withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 46294A404E635266556A576E5A723475',
        ...headers,        
      }
    })
  } catch (err: any) {
    console.error(err);
    console.error(err.response?.data?.detail)
    if (defaultReturn) {
      return defaultReturn;
    } else {
      throw({
        errors: [
          err.response?.data?.detail
        ]
      })  
    }
  }
  if (response.status === 200) {
    return response.data as object;
  } else {
    console.error(response)
    if (defaultReturn) {
      return defaultReturn;
    } else {
      throw(response.statusText);
    }
  }
}

export const get = async (path: string, optionalParams: optionalParamsType = {headers: {}}): Promise<any> => {
  const { headers, defaultReturn } = optionalParams;
  try {

    const url = `${API_URL_BASE}${path}`;
    const response = await axios.get(url, {
      //withCredentials: true,
      headers: {
        ...headers,
        'Authorization': 'Bearer 46294A404E635266556A576E5A723475',
        'Content-Type': 'application/json',
      }
    })
    if (response.status === 500) {
      throw(response.statusText);
    }
    return response.data as object;
  } catch (err) {
    console.error(err);
    if (defaultReturn) {
      return defaultReturn;
    } else {
      throw err;
    }
  }
}

export const uploadFile = async (path: string, file: File, optionalParams: optionalParamsType = {headers: {}} ) => {
  const { defaultReturn, headers } = optionalParams
  const formData = new FormData();
  formData.append("file", file)
  return await post(path, formData, {
    headers: {
      ...headers,
      'Authorization': 'Bearer 46294A404E635266556A576E5A723475',
      'Content-Type': 'multipart/form-data'
    },
    defaultReturn
  })
}

export interface SuccessResult {
  success: boolean
}