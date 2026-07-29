export const directoryDefinition = {
  name: "directory",
  description: "Browse project directories.",
  usage: [
    'List files:\n{"tool":"directory","input":{"action":"list","path":"src"}}',
    'Show tree:\n{"tool":"directory","input":{"action":"tree","path":"."}}'
  ]
};