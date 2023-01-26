import axios, { AxiosResponse } from "axios";
import { Maybe } from "types";
export const API_URL_BASE =
  process.env.NEXT_PUBLIC_API_URL_BASE || "http://localhost:3000";

const BEARER_TOKEN =
  process.env.NEXT_BEARER_TOKEN || "46294A404E635266556A576E5A723475";

const USE_DEFAULT_RETURN = false;
export const SESSION_ID_KEY = "provisioner_session_id";

interface optionalParamsType {
  headers?: object;
  defaultReturn?: Maybe<object>;
}

const getSessionId = () => {
  let storedSessionId: Maybe<string> = null;
  if (typeof window !== "undefined") {
    const storedSessionIdString: Maybe<string> =
      window.localStorage.getItem(SESSION_ID_KEY);
    if (storedSessionIdString) {
      storedSessionId = storedSessionIdString;
    }
  }
  return storedSessionId;
};

export const post = async (
  path: string,
  data: object = {},
  optionalParams: optionalParamsType = { headers: {} },
  sessionId: Maybe<string> = null
): Promise<any> => {
  const { headers, defaultReturn } = optionalParams;
  const url = `${API_URL_BASE}${path}`;
  let response: AxiosResponse;
  try {
    response = await axios.post(url, data, {
      // withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Session-Id": sessionId || getSessionId() || "",
        ...headers,
      },
    });
  } catch (err: any) {
    console.error(err);
    console.error(err.response);
    console.error(err.response?.data?.detail);
    if (USE_DEFAULT_RETURN && defaultReturn) {
      return defaultReturn;
    } else {
      throw {
        status: err.response?.status,
        data: err.response?.data,
        errors: [err.response?.data?.detail],
      };
    }
  }
  if (response.status === 200) {
    return response.data as object;
  } else {
    console.error(response);
    if (USE_DEFAULT_RETURN && defaultReturn) {
      return defaultReturn;
    } else {
      //throw response.statusText;
      throw {
        status: response?.status,
        data: response?.data,
        errors: [response?.data],
      };
    }
  }
};

export const get = async (
  path: string,
  optionalParams: optionalParamsType = { headers: {} },
  sessionId: Maybe<string> = null
): Promise<any> => {
  const { headers, defaultReturn } = optionalParams;
  try {
    const url = `${API_URL_BASE}${path}`;
    const response = await axios.get(url, {
      // withCredentials: true,
      headers: {
        ...headers,
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
        "X-Session-Id": sessionId || getSessionId() || "",
      },
    });
    if (response.status === 500) {
      throw response.statusText;
    }
    return response.data as object;
  } catch (err) {
    console.error(err);
    if (USE_DEFAULT_RETURN && defaultReturn) {
      return defaultReturn;
    } else {
      throw err;
    }
  }
};

function readFileAsync(file: File) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsBinaryString(file);
  });
}

export const unzipFile = async (key: string) => {
  const resp = await post("/unzipProvisionedUpload", {
    key,
  });
  console.log(resp);
  return resp;
};

export const uploadFile = async (
  path: string,
  file: File,
  data: { [k: string]: any } = {},
  optionalParams: optionalParamsType = { headers: {} }
) => {
  const { uploadUrl, fileName } = await post("/provisionUpload", {
    contentType: file.type,
  });

  // const formData = new FormData();
  // Object.keys(data).forEach(k=>{
  //   if (data[k]) {
  //     formData.append(k, data[k])
  //   }
  // })
  // formData.append("file", file)

  const response = await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
  if (response) {
    // start and wait for the unzip process
    await unzipFile(fileName);
    return fileName;
  }

  const { defaultReturn, headers } = optionalParams;

  // return await post(path, formData, {
  //   headers: {
  //     ...headers,
  //     'Authorization': 'Bearer 46294A404E635266556A576E5A723475',
  //     'Content-Type': 'multipart/form-data'
  //   },
  //   defaultReturn
  // })
};

export interface SuccessResult {
  success: boolean;
}
