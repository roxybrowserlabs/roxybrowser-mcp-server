export function cloneSchema<T>(schema: T): T {
  return schema == null ? schema : JSON.parse(JSON.stringify(schema))
}

export function removePropertyFromObjectSchema(schema: Record<string, any>, propertyName: string): void {
  if (!schema || schema.type !== 'object')
    return

  if (schema.properties)
    delete schema.properties[propertyName]

  if (Array.isArray(schema.required)) {
    const required = schema.required.filter((name: string) => name !== propertyName)
    if (required.length > 0)
      schema.required = required
    else
      delete schema.required
  }
}

export function removePropertyFromArrayItemSchema(schema: Record<string, any>, arrayProperty: string, propertyName: string): void {
  const itemSchema = schema?.properties?.[arrayProperty]?.items
  if (itemSchema)
    removePropertyFromObjectSchema(itemSchema, propertyName)
}
