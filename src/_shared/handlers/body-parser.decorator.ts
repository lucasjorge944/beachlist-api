export function BodyParser() {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const decoratedMethod = descriptor.value
    decoratedMethod.value = (...args: any[]) => {
      const body = args[0]?.body
      if (body) args[0].body = typeof body === 'object' ? body : JSON.parse(body)
      return decoratedMethod.apply(this, args)
    }
    return decoratedMethod
  }
}
