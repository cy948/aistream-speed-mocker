import { NextResponse } from 'next/server';
import { getAllModels } from '../../../config';

export async function GET() {
  const models = getAllModels();
  
  return NextResponse.json({
    object: "list",
    data: models.map(model => ({
      id: `${model.id}-${model.tokenSpeed}tps`,
      object: "model",
      created: Math.floor(Date.now() / 1000),
      ownedBy: "aistream-mocker",
      permission: [],
      root: model.id,
      parent: null
    }))
  });
}
