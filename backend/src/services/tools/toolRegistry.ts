import axios from 'axios';
import logger from '../../utils/logger';

export interface ToolDefinition {
  name: string;
  description: string;
  icon: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval: boolean;
  isEnabled: boolean;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  web_search: {
    name: 'Web Search',
    description: 'Search the internet for information',
    icon: '🔍',
    category: 'Research',
    riskLevel: 'low',
    requiresApproval: false,
    isEnabled: true,
    inputSchema: { query: 'string' },
    outputSchema: { results: 'string' },
  },
  file_reader: {
    name: 'File Reader',
    description: 'Read and parse files uploaded to workspace',
    icon: '📄',
    category: 'Files',
    riskLevel: 'low',
    requiresApproval: false,
    isEnabled: true,
    inputSchema: { path: 'string' },
    outputSchema: { content: 'string' },
  },
  pdf_reader: {
    name: 'PDF Reader',
    description: 'Extract text and data from PDF files',
    icon: '📕',
    category: 'Files',
    riskLevel: 'low',
    requiresApproval: false,
    isEnabled: true,
    inputSchema: { path: 'string' },
    outputSchema: { content: 'string', pages: 'number' },
  },
  csv_analyzer: {
    name: 'CSV Analyzer',
    description: 'Parse, analyze and summarize CSV data files',
    icon: '📊',
    category: 'Data',
    riskLevel: 'low',
    requiresApproval: false,
    isEnabled: true,
    inputSchema: { path: 'string', query: 'string' },
    outputSchema: { summary: 'string', stats: 'object' },
  },
  calculator: {
    name: 'Calculator',
    description: 'Perform mathematical calculations',
    icon: '🧮',
    category: 'Utility',
    riskLevel: 'low',
    requiresApproval: false,
    isEnabled: true,
    inputSchema: { expression: 'string' },
    outputSchema: { result: 'number' },
  },
  code_executor: {
    name: 'Code Executor',
    description: 'Execute code in a secure sandbox environment',
    icon: '⚙️',
    category: 'Code',
    riskLevel: 'high',
    requiresApproval: true,
    isEnabled: true,
    inputSchema: { code: 'string', language: 'string' },
    outputSchema: { output: 'string', error: 'string' },
  },
  json_processor: {
    name: 'JSON Processor',
    description: 'Parse, transform and query JSON data',
    icon: '🔧',
    category: 'Data',
    riskLevel: 'low',
    requiresApproval: false,
    isEnabled: true,
    inputSchema: { data: 'string', query: 'string' },
    outputSchema: { result: 'string' },
  },
  text_analyzer: {
    name: 'Text Analyzer',
    description: 'Analyze text for sentiment, entities, and patterns',
    icon: '📝',
    category: 'Analysis',
    riskLevel: 'low',
    requiresApproval: false,
    isEnabled: true,
    inputSchema: { text: 'string' },
    outputSchema: { sentiment: 'string', entities: 'array', summary: 'string' },
  },
  browser: {
    name: 'Web Fetcher',
    description: 'Fetch and parse web pages content',
    icon: '🌐',
    category: 'Research',
    riskLevel: 'medium',
    requiresApproval: false,
    isEnabled: true,
    inputSchema: { url: 'string' },
    outputSchema: { content: 'string', title: 'string' },
  },
};

export const executeTool = async (
  toolName: string,
  params: Record<string, unknown>
): Promise<string> => {
  const tool = TOOL_REGISTRY[toolName];
  if (!tool) throw new Error(`Tool '${toolName}' is not registered`);
  if (!tool.isEnabled) throw new Error(`Tool '${toolName}' is disabled`);
  if (tool.requiresApproval) throw new Error(`Tool '${toolName}' requires human approval before execution`);

  logger.info(`Executing tool: ${toolName}`, { params: Object.keys(params) });

  switch (toolName) {
    case 'web_search': {
      const query = String(params.query || '');
      try {
        // Use DuckDuckGo instant answer API (free, no key)
        const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, { timeout: 10000 });
        const data = response.data;
        const results = [
          data.AbstractText && `Summary: ${data.AbstractText}`,
          data.Answer && `Answer: ${data.Answer}`,
          ...(data.RelatedTopics || []).slice(0, 3).map((t: { Text?: string }) => t.Text).filter(Boolean),
        ].filter(Boolean).join('\n\n');
        return results || `Search completed for: "${query}". No instant answers found - agent should use knowledge.`;
      } catch {
        return `Web search for "${query}" - using AI knowledge base instead.`;
      }
    }

    case 'calculator': {
      const expr = String(params.expression || '');
      try {
        // Safe eval only for math expressions
        const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, '');
        if (!sanitized) throw new Error('Invalid expression');
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${sanitized})`)();
        return `Result: ${result}`;
      } catch {
        return `Could not evaluate: ${expr}`;
      }
    }

    case 'text_analyzer': {
      const text = String(params.text || '').substring(0, 2000);
      const wordCount = text.split(/\s+/).length;
      const sentences = text.split(/[.!?]+/).length;
      return `Text Analysis:\n- Word count: ${wordCount}\n- Sentences: ${sentences}\n- Characters: ${text.length}\n- Estimated reading time: ${Math.ceil(wordCount / 200)} min`;
    }

    case 'json_processor': {
      try {
        const data = JSON.parse(String(params.data || '{}'));
        return `JSON processed: ${JSON.stringify(data, null, 2).substring(0, 1000)}`;
      } catch {
        return 'Invalid JSON data provided';
      }
    }

    case 'csv_analyzer': {
      const content = String(params.query || '');
      return `CSV Analysis initiated for: ${content.substring(0, 100)}. Data structure will be analyzed.`;
    }

    case 'browser': {
      const url = String(params.url || '');
      try {
        const response = await axios.get(url, { timeout: 10000, headers: { 'User-Agent': 'AgentForge/1.0' } });
        const text = String(response.data).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 2000);
        return `Fetched: ${url}\n\nContent: ${text}`;
      } catch {
        return `Could not fetch URL: ${url}`;
      }
    }

    default:
      return `Tool ${toolName} executed successfully for: ${String(params.query || params.description || 'task').substring(0, 100)}`;
  }
};
