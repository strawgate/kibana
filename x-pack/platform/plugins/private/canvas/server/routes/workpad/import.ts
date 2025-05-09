/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { RouteInitializerDeps } from '..';
import { API_ROUTE_WORKPAD_IMPORT } from '../../../common/lib/constants';
import { ImportedCanvasWorkpad } from '../../../types';
import { ImportedWorkpadSchema } from './workpad_schema';
import { okResponse } from '../ok_response';
import { catchErrorHandler } from '../catch_error_handler';

const createRequestBodySchema = ImportedWorkpadSchema;

export function initializeImportWorkpadRoute(deps: RouteInitializerDeps) {
  const { router } = deps;
  router.versioned
    .post({
      path: `${API_ROUTE_WORKPAD_IMPORT}`,
      options: {
        body: {
          maxBytes: 26214400,
          accepts: ['application/json'],
        },
      },
      access: 'internal',
      security: {
        authz: {
          enabled: false,
          reason:
            'This route is opted out from authorization because authorization is provided by saved objects client.',
        },
      },
    })
    .addVersion(
      {
        version: '1',
        validate: {
          request: { body: createRequestBodySchema },
        },
      },
      catchErrorHandler(async (context, request, response) => {
        const workpad = request.body as ImportedCanvasWorkpad;

        const canvasContext = await context.canvas;
        const createdObject = await canvasContext.workpad.import(workpad);

        return response.ok({
          body: { ...okResponse, id: createdObject.id },
        });
      })
    );
}
