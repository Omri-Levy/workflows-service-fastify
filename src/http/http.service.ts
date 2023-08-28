import axios, { AxiosInstance } from "axios";

export class HttpService {
  axiosRef: AxiosInstance;

  constructor() {
    this.axiosRef = axios.create();
  }
}