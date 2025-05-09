/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import expect from '@kbn/expect';
import { FtrProviderContext } from '../../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const find = getService('find');
  const esArchiver = getService('esArchiver');
  const kibanaServer = getService('kibanaServer');
  const retry = getService('retry');
  const PageObjects = getPageObjects(['common', 'header']);
  const testSubjects = getService('testSubjects');

  describe('overview page - solutions', function describeIndexTests() {
    before(async () => {
      await esArchiver.load(
        'src/platform/test/functional/fixtures/es_archiver/logstash_functional'
      );
      await kibanaServer.importExport.load(
        'src/platform/test/functional/fixtures/kbn_archiver/kibana_sample_data_flights_index_pattern'
      );
      await PageObjects.common.navigateToUrl('kibana_overview', '', { useActualUrl: true });
      await PageObjects.header.waitUntilLoadingHasFinished();
    });

    after(async () => {
      await esArchiver.unload(
        'src/platform/test/functional/fixtures/es_archiver/logstash_functional'
      );
      await kibanaServer.importExport.unload(
        'src/platform/test/functional/fixtures/kbn_archiver/kibana_sample_data_flights_index_pattern'
      );
    });

    it('contains Security and Observability solutions', async () => {
      const solutionCards = await testSubjects.findAll('kbnOverviewItem');

      expect(solutionCards.length >= 2).to.be(true);

      const imageSrcs = [];
      const re = /.*(\/solutions_(observability|security_solution)\.svg)/;
      const myRegexp = new RegExp(re, 'g');
      for (let i = 0; i < solutionCards.length; i++) {
        const solutionCard = solutionCards[i];
        const image = await solutionCard.findByCssSelector('img');
        const imageSrc = (await image.getAttribute('src')) ?? '';
        const match = myRegexp.exec(imageSrc);
        myRegexp.lastIndex = 0;
        if (match && match.length > 1) {
          imageSrcs.push(match[1]);
        }
      }
      expect(imageSrcs.includes('/solutions_observability.svg')).to.be(true);
      expect(imageSrcs.includes('/solutions_security_solution.svg')).to.be(true);
    });

    // skipped as on Cloud it's a different setup than locally
    // https://github.com/elastic/kibana/issues/139270
    xit('click on Observability card leads to Observability', async () => {
      let solutionCards: string | any[] = [];
      await retry.waitForWithTimeout('all solutions to be present', 5000, async () => {
        solutionCards = await find.allByCssSelector('.kbnOverviewMore__item');
        return solutionCards.length === 2;
      });
      await solutionCards[0].click();
      await PageObjects.common.waitUntilUrlIncludes('app/observability');
    });

    // skipped as on Cloud it's a different setup than locally
    // https://github.com/elastic/kibana/issues/139270
    xit('click on Security card leads to Security', async () => {
      await PageObjects.common.navigateToUrl('kibana_overview', '', { useActualUrl: true });
      await PageObjects.header.waitUntilLoadingHasFinished();

      let solutionCards: string | any[] = [];
      await retry.waitForWithTimeout('all solutions to be present', 5000, async () => {
        solutionCards = await find.allByCssSelector('.kbnOverviewMore__item');
        return solutionCards.length === 2;
      });
      await solutionCards[1].click();
      await PageObjects.common.waitUntilUrlIncludes('app/security');
    });
  });
}
