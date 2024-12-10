import { HttpResponse } from './http.interface'

export interface IController<T = any> {
  execute(request: T): Promise<HttpResponse>
}
