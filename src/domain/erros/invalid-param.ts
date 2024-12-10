export class InvalidProps extends Error {
  constructor(paramName: string) {
    super(`Requisito não atendido: ${paramName}`)
    this.name = 'InvalidProps'
  }
}
