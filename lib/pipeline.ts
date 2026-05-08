import { analyzeProduct, type ProductInput } from './gemini';
import { buildRenderPayload, submitRender } from './shotstack';

export type { ProductInput };

export async function runPipeline(product: ProductInput, geminiKey: string): Promise<string> {
  const analysis = await analyzeProduct(product, geminiKey);
  const payload = buildRenderPayload(product, analysis);
  const renderId = await submitRender(payload);
  return renderId;
}
