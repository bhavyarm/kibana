/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { FtrProviderContext } from '../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const PageObjects = getPageObjects(['common', 'discover', 'header', 'home', 'timePicker']);
  const retry = getService('retry');
  const a11y = getService('a11y');
  // const esArchiver = getService('esArchiver');
  const kibanaServer = getService('kibanaServer');
  const inspector = getService('inspector');
  const docTable = getService('docTable');
  const filterBar = getService('filterBar');
  const TEST_FILTER_COLUMN_NAMES = [
    ['extension', 'jpg'],
    ['geo.src', 'IN'],
  ];

  describe('Filter panel', () => {
    before(async () => {
      await PageObjects.common.navigateToUrl('home', '/tutorial_directory/sampleData', {
        useActualUrl: true,
      });
      await PageObjects.home.addSampleDataSet('flights');
      await PageObjects.common.navigateToApp('discover');
      // await PageObjects.timePicker.setDefaultAbsoluteRange();
    });

    it('a11y test on add filter panel', async () => {
      await PageObjects.discover.openAddFilterPanel();
      await a11y.testAppSnapshot();
    });

    // it('a11y test on selecting values from filter value drop downs', async () => {
    //   await filterBar.addFilter('extension.raw', 'is one of', 'jpg');
    //   await a11y.testAppSnapshot();
    // });
    //
    // it('a11y test on edit a single filter panel', async () => {
    //   await filterBar.clickEditFilter();
    //   await a11y.testAppSnapshot();
    // });

    // it('a11y test on filter bar actions panel', async () => {
    //   await PageObjects.discover.showAllFilterActions();
    //   await a11y.testAppSnapshot();
    // });
  });
}
