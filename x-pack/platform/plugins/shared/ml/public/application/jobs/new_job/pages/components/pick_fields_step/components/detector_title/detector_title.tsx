/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC, PropsWithChildren } from 'react';
import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiButtonIcon } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

import type { Field, Aggregation, SplitField } from '@kbn/ml-anomaly-utils';

interface DetectorTitleProps {
  index: number;
  agg: Aggregation;
  field: Field;
  byField?: {
    field: SplitField;
    value: string | null;
  };
  deleteDetector?: (dtrIds: number) => void;
}

export const DetectorTitle: FC<PropsWithChildren<DetectorTitleProps>> = ({
  index,
  agg,
  field,
  byField,
  deleteDetector,
  children,
}) => {
  const splitField = children === false && byField !== undefined ? byField.field : null;
  return (
    <EuiFlexGroup gutterSize="s" justifyContent="spaceBetween">
      <EuiFlexItem>
        <span style={{ fontSize: 'small' }} data-test-subj="mlDetectorTitle">
          {getTitle(agg, field, splitField)}
        </span>
      </EuiFlexItem>

      {children !== false && (
        <EuiFlexItem style={{ width: '100%', maxWidth: '400px' }}>{children}</EuiFlexItem>
      )}

      <EuiFlexItem grow={false}>
        {deleteDetector !== undefined && (
          <EuiButtonIcon
            color={'danger'}
            onClick={() => deleteDetector(index)}
            iconType="cross"
            size="s"
            aria-label={i18n.translate(
              'xpack.ml.newJob.wizard.pickFieldsStep.nextButtonAriaLabel',
              {
                defaultMessage: 'Next',
              }
            )}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

function getTitle(agg: Aggregation, field: Field, splitField: SplitField): string {
  const title = `${agg.title}(${field.name})`;
  if (splitField === null) {
    return title;
  } else {
    return i18n.translate('xpack.ml.newJob.wizard.pickFieldsStep.detectorTitle.placeholder', {
      defaultMessage: '{title} split by {field}',
      values: { title, field: splitField.name },
    });
  }
}
