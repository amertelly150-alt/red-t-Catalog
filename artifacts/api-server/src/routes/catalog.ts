import { Router, type IRouter } from 'express';
import { GetCatalogResponse, GetCatalogProductImageParams } from '@workspace/api-zod';
import { getCatalogProductImage, getPublicCatalog } from '../lib/catalog-store';

const router: IRouter = Router();

router.get('/catalog', async (_req, res): Promise<void> => {
  const catalog = await getPublicCatalog();
  res.set('Cache-Control', 'no-store, max-age=0');
  res.json(GetCatalogResponse.parse(catalog));
});

router.get('/catalog/images/:id/:version', async (req, res): Promise<void> => {
  const params = GetCatalogProductImageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: 'معرّف الصورة أو إصدارها غير صالح.' });
    return;
  }

  const image = await getCatalogProductImage(params.data.id);
  if (!image || image.version !== params.data.version) {
    res.status(404).json({ error: 'الصورة غير موجودة أو تم تحديثها.' });
    return;
  }

  res
    .set('Content-Type', image.contentType)
    .set('Cache-Control', 'public, max-age=31536000, immutable')
    .send(image.bytes);
});

export default router;