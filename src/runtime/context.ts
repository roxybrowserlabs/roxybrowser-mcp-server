import type { ContextBinding, RuntimeContext, ToolDefinition } from './types.js'
import { cloneSchema, removePropertyFromArrayItemSchema, removePropertyFromObjectSchema } from './schema.js'

function defaultBindingsForScope(scope: ToolDefinition['scope']): ContextBinding[] {
  if (scope === 'workspace')
    return [{ name: 'workspaceId', location: 'root' }]
  if (scope === 'project')
    return [
      { name: 'workspaceId', location: 'root' },
      { name: 'projectId', location: 'root' },
    ]
  return []
}

export function getContextBindings<TArgs extends Record<string, any>>(tool: ToolDefinition<TArgs>): ContextBinding[] {
  return tool.contextBindings ?? defaultBindingsForScope(tool.scope)
}

function assertCompatibleValue(name: string, existing: unknown, bound: unknown): void {
  if (existing !== undefined && existing !== bound)
    throw new Error(`${name} is bound to ${bound}, but received ${existing}`)
}

export function createPublicToolSchema(tool: ToolDefinition, context: RuntimeContext = {}) {
  const inputSchema = cloneSchema(tool.inputSchema)

  for (const binding of getContextBindings(tool)) {
    const boundValue = context[binding.name]
    if (boundValue === undefined)
      continue

    if (binding.location === 'arrayItems') {
      if (!binding.arrayProperty)
        throw new Error(`arrayProperty is required for ${binding.name} array item binding`)
      removePropertyFromArrayItemSchema(inputSchema, binding.arrayProperty, binding.name)
    }
    else {
      removePropertyFromObjectSchema(inputSchema, binding.name)
    }
  }

  return {
    name: tool.name,
    description: tool.description,
    inputSchema,
  }
}

export function applyContextToArgs<TArgs extends Record<string, any>>(
  tool: ToolDefinition<TArgs>,
  args: TArgs | undefined,
  context: RuntimeContext = {},
): TArgs {
  const nextArgs: Record<string, any> = { ...(args ?? {}) }

  for (const binding of getContextBindings(tool)) {
    const boundValue = context[binding.name]
    if (boundValue === undefined)
      continue

    if (binding.location === 'arrayItems') {
      if (!binding.arrayProperty)
        throw new Error(`arrayProperty is required for ${binding.name} array item binding`)

      const items = nextArgs[binding.arrayProperty]
      if (!Array.isArray(items))
        continue

      nextArgs[binding.arrayProperty] = items.map((item: Record<string, any>) => {
        assertCompatibleValue(binding.name, item?.[binding.name], boundValue)
        return { ...item, [binding.name]: boundValue }
      })
    }
    else {
      assertCompatibleValue(binding.name, nextArgs[binding.name], boundValue)
      nextArgs[binding.name] = boundValue
    }
  }

  return nextArgs as TArgs
}
