/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { METRICS_APP_ID } from '@kbn/deeplinks-observability/constants';
import { entityCentricExperience } from '@kbn/observability-plugin/common';
import { createTracedEsClient } from '@kbn/traced-es-client';
import { BUILT_IN_ENTITY_TYPES } from '@kbn/observability-shared-plugin/common';
import { getInfraMetricsClient } from '../../lib/helpers/get_infra_metrics_client';
import type { InfraBackendLibs } from '../../lib/infra_types';
import { getDataStreamTypes } from './get_data_stream_types';

export const initEntitiesConfigurationRoutes = (libs: InfraBackendLibs) => {
  const { framework, logger } = libs;

  framework.registerRoute(
    {
      method: 'get',
      path: '/api/infra/entities/{entityType}/{entityId}/summary',
      validate: {
        params: schema.object({
          entityType: schema.oneOf([
            schema.literal(BUILT_IN_ENTITY_TYPES.HOST),
            schema.literal(BUILT_IN_ENTITY_TYPES.CONTAINER),
          ]),
          entityId: schema.string(),
        }),
        query: schema.object({ from: schema.string(), to: schema.string() }),
      },
      options: {
        access: 'internal',
      },
    },
    async (requestContext, request, response) => {
      const { entityId, entityType: entityFilterType } = request.params;
      const mapTypeToV2 = {
        [BUILT_IN_ENTITY_TYPES.HOST]: BUILT_IN_ENTITY_TYPES.HOST_V2,
        [BUILT_IN_ENTITY_TYPES.CONTAINER]: BUILT_IN_ENTITY_TYPES.CONTAINER_V2,
      };
      const entityType = mapTypeToV2[entityFilterType];
      const { from, to } = request.query;
      const [coreContext, infraContext] = await Promise.all([
        requestContext.core,
        requestContext.infra,
      ]);

      const entityManagerClient = await infraContext.entityManager.getScopedClient({ request });
      const infraMetricsClient = await getInfraMetricsClient({
        request,
        libs,
        context: requestContext,
      });

      const obsEsClient = createTracedEsClient({
        client: coreContext.elasticsearch.client.asCurrentUser,
        logger,
        plugin: `@kbn/${METRICS_APP_ID}-plugin`,
      });

      const entityCentricExperienceEnabled = await coreContext.uiSettings.client.get(
        entityCentricExperience
      );

      try {
        const sourceDataStreamTypes = await getDataStreamTypes({
          entityCentricExperienceEnabled,
          entityId,
          entityManagerClient,
          entityType,
          entityFilterType,
          infraMetricsClient,
          obsEsClient,
          logger,
          from,
          to,
        });

        return response.ok({
          body: {
            sourceDataStreams: sourceDataStreamTypes,
            entityId,
            entityType,
            entityFilterType,
          },
        });
      } catch (error) {
        return response.customError({
          statusCode: error.statusCode ?? 500,
          body: {
            message: error.message ?? 'An unexpected error occurred',
          },
        });
      }
    }
  );
};
