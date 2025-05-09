/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useMemo } from 'react';

import { FavoritesClient } from '@kbn/content-management-favorites-public';
import { TableListView } from '@kbn/content-management-table-list-view';
import { TableListViewKibanaProvider } from '@kbn/content-management-table-list-view-table';
import { FormattedRelative, I18nProvider } from '@kbn/i18n-react';
import { useExecutionContext } from '@kbn/kibana-react-plugin/public';
import { QueryClientProvider } from '@tanstack/react-query';

import { DASHBOARD_APP_ID } from '../../common/constants';
import { DASHBOARD_CONTENT_ID } from '../utils/telemetry_constants';
import {
  coreServices,
  savedObjectsTaggingService,
  serverlessService,
  usageCollectionService,
} from '../services/kibana_services';
import { dashboardQueryClient } from '../services/dashboard_query_client';
import { DashboardUnsavedListing } from './dashboard_unsaved_listing';
import { useDashboardListingTable } from './hooks/use_dashboard_listing_table';
import { DashboardListingProps, DashboardSavedObjectUserContent } from './types';

export const DashboardListing = ({
  children,
  initialFilter,
  goToDashboard,
  getDashboardUrl,
  useSessionStorageIntegration,
}: DashboardListingProps) => {
  useExecutionContext(coreServices.executionContext, {
    type: 'application',
    page: 'list',
  });

  const {
    unsavedDashboardIds,
    refreshUnsavedDashboards,
    tableListViewTableProps,
    contentInsightsClient,
  } = useDashboardListingTable({
    goToDashboard,
    getDashboardUrl,
    useSessionStorageIntegration,
    initialFilter,
  });

  const dashboardFavoritesClient = useMemo(() => {
    return new FavoritesClient(DASHBOARD_APP_ID, DASHBOARD_CONTENT_ID, {
      http: coreServices.http,
      usageCollection: usageCollectionService,
      userProfile: coreServices.userProfile,
    });
  }, []);

  return (
    <I18nProvider>
      <QueryClientProvider client={dashboardQueryClient}>
        <TableListViewKibanaProvider
          {...{
            core: coreServices,
            savedObjectsTagging: savedObjectsTaggingService?.getTaggingApi(),
            FormattedRelative,
            favorites: dashboardFavoritesClient,
            contentInsightsClient,
            isKibanaVersioningEnabled: !serverlessService,
          }}
        >
          <TableListView<DashboardSavedObjectUserContent> {...tableListViewTableProps}>
            <>
              {children}
              <DashboardUnsavedListing
                goToDashboard={goToDashboard}
                unsavedDashboardIds={unsavedDashboardIds}
                refreshUnsavedDashboards={refreshUnsavedDashboards}
              />
            </>
          </TableListView>
        </TableListViewKibanaProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
};

// eslint-disable-next-line import/no-default-export
export default DashboardListing;
