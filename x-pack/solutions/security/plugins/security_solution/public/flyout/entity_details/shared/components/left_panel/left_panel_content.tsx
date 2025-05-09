/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useEuiTheme } from '@elastic/eui';
import type { VFC } from 'react';
import React, { useMemo } from 'react';
import { css } from '@emotion/react';
import { FlyoutBody } from '../../../../shared/components/flyout_body';
import type { EntityDetailsLeftPanelTab, LeftPanelTabsType } from './left_panel_header';

export interface PanelContentProps {
  selectedTabId: EntityDetailsLeftPanelTab;
  tabs: LeftPanelTabsType;
}

/**
 * Content for a entity left panel.
 * Appears after the user clicks on the expand details button in the right section.
 */
export const LeftPanelContent: VFC<PanelContentProps> = ({ selectedTabId, tabs }) => {
  const { euiTheme } = useEuiTheme();
  const selectedTabContent = useMemo(() => {
    return tabs.find((tab) => tab.id === selectedTabId)?.content;
  }, [selectedTabId, tabs]);

  return (
    <FlyoutBody
      css={css`
        background-color: ${euiTheme.colors.backgroundBaseSubdued};
      `}
    >
      {selectedTabContent}
    </FlyoutBody>
  );
};

LeftPanelContent.displayName = 'LeftPanelContent';
