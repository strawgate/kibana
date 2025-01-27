/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Vis } from './vis';

jest.mock('./services', () => {
  class MockVisualizationController {
    constructor() {}

    render(): Promise<void> {
      return new Promise((resolve) => {
        resolve();
      });
    }

    destroy() {}
  }

  // eslint-disable-next-line
  const { BaseVisType } = require('./vis_types/base_vis_type');
  // eslint-disable-next-line
  const { SearchSource } = require('../../data/common/search/search_source');
  // eslint-disable-next-line
  const stubIndexPattern = require('../../data/common/stubs');
  const visType = new BaseVisType({
    name: 'pie',
    title: 'pie',
    icon: 'pie-icon',
    visualization: MockVisualizationController,
  });

  return {
    getTypes: () => ({ get: () => visType }),
    getAggs: () => ({
      createAggConfigs: (indexPattern: any, cfg: any) => ({
        aggs: cfg.map((aggConfig: any) => ({ ...aggConfig, serialize: () => aggConfig })),
      }),
    }),
    getSearch: () => ({
      searchSource: {
        create: () => {
          return new SearchSource({ index: stubIndexPattern });
        },
      },
    }),
  };
});

describe('Vis Class', function () {
  let vis: Vis;
  const stateFixture = {
    type: 'pie',
    title: 'pie',
    data: {
      aggs: [
        { type: 'avg' as any, schema: 'metric', params: { field: 'bytes' } },
        { type: 'terms' as any, schema: 'segment', params: { field: 'machine.os' } },
        { type: 'terms' as any, schema: 'segment', params: { field: 'geo.src' } },
      ],
      searchSource: {
        index: '123',
      },
    },
    params: { isDonut: true },
  };

  beforeEach(async function () {
    vis = new Vis('test', stateFixture as any);
    await vis.setState(stateFixture as any);
  });

  const verifyVis = function (visToVerify: Vis) {
    expect(visToVerify).toHaveProperty('data');
    expect(visToVerify.data).toHaveProperty('aggs');
    expect(visToVerify.data.aggs!.aggs).toHaveLength(3);

    expect(visToVerify).toHaveProperty('type');

    expect(visToVerify).toHaveProperty('params');
    expect(visToVerify.params).toHaveProperty('isDonut', true);
  };

  describe('initialization', function () {
    it('should set the state', function () {
      verifyVis(vis);
    });
  });

  describe('getState()', function () {
    it('should get a state that represents the... er... state', function () {
      const state = vis.serialize();
      expect(state).toHaveProperty('type', 'pie');

      expect(state).toHaveProperty('params');
      expect(state.params).toHaveProperty('isDonut', true);

      expect(state.data).toHaveProperty('aggs');
      expect(state.data.aggs).toHaveLength(3);
    });
  });

  describe('isHierarchical()', function () {
    it('should return false for non-hierarchical vis (like histogram)', function () {
      expect(vis.isHierarchical()).toBe(false);
    });

    it('should return true for hierarchical vis (like pie)', function () {
      (vis.type as any).hierarchicalData = true;
      expect(vis.isHierarchical()).toBe(true);
    });
  });
});
