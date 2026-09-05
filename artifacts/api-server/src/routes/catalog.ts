import { Router, type IRouter } from 'express';
import { GetCatalogResponse } from '@workspace/api-zod';
import { getCatalog } from '../lib/catalog-store';

const router: IRouter = Router();

router.get('/catalog', async (_req, res): Promise<void> => {
  const catalog = await getCatalog();
  res.set('Cache-Control', 'no-store, max-age=0');
  res.json(GetCatalogResponse.parse(catalog));
});

export default router;