export class MissingParamError extends Error {
  constructor(paramName: string) {
    super(`Ausência de: ${paramName}`)
    this.name = 'MissingParamError'
  }
}
