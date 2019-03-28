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


export function DashboardAddPanelProvider({ getService, getPageObjects }) {
  const log = getService('log');
  const retry = getService('retry');
  const testSubjects = getService('testSubjects');
  const flyout = getService('flyout');
  const PageObjects = getPageObjects(['header', 'common']);

  return new class DashboardAddPanel {
    async clickOpenAddPanel() {
      log.debug('DashboardAddPanel.clickOpenAddPanel');
      await testSubjects.click('dashboardAddPanelButton');
    }

    async clickAddNewEmbeddableLink() {
      await testSubjects.click('addNewSavedObjectLink');
    }

    async toggleFilterPopover() {
      log.debug('DashboardAddPanel.toggleFilter');
      await testSubjects.click('savedObjectFinderFilterButton');
    }

    async toggleFilter(type) {
      log.debug(`DashboardAddPanel.addToFilter(${type})`);
      await this.waitForListLoading();
      await this.toggleFilterPopover();
      await testSubjects.click(`savedObjectFinderFilter-${type}`);
      await this.toggleFilterPopover();
    }

    async addEveryEmbeddableOnCurrentPage() {
      log.debug('addEveryEmbeddableOnCurrentPage');
      const itemList = await testSubjects.find('savedObjectFinderItemList');
      const embeddableRows = await itemList.findAllByCssSelector('li');
      const embeddableList = [];
      for (let i = 0; i < embeddableRows.length; i++) {
        embeddableList.push(await embeddableRows[i].getVisibleText());
        await embeddableRows[i].click();
        await PageObjects.common.closeToast();
      }
      log.debug(`Added ${embeddableRows.length} embeddables`);
      return embeddableList;
    }

    async clickPagerNextButton() {
      // Clear all toasts that could hide pagination controls
      await PageObjects.common.clearAllToasts();

      const isNext = await testSubjects.exists('pagination-button-next');
      if (!isNext) {
        return false;
      }

      const pagerNextButton = await testSubjects.find('pagination-button-next');

      const isDisabled = await pagerNextButton.getAttribute('disabled');
      if (isDisabled != null) {
        return false;
      }

      await PageObjects.header.waitUntilLoadingHasFinished();
      await pagerNextButton.click();
      await PageObjects.header.waitUntilLoadingHasFinished();
      return true;
    }

    async isAddPanelOpen() {
      log.debug('DashboardAddPanel.isAddPanelOpen');
      return await testSubjects.exists('dashboardAddPanel');
    }

    async ensureAddPanelIsShowing() {
      log.debug('DashboardAddPanel.ensureAddPanelIsShowing');
      const isOpen = await this.isAddPanelOpen();
      if (!isOpen) {
        await retry.try(async () => {
          await this.clickOpenAddPanel();
          const isOpen = await this.isAddPanelOpen();
          if (!isOpen) {
            throw new Error('Add panel still not open, trying again.');
          }
        });
      }
    }

    async waitForListLoading() {
      await testSubjects.waitForDeleted('savedObjectFinderLoadingIndicator');
    }

    async closeAddPanel() {
      await flyout.ensureClosed('dashboardAddPanel');
    }

    async addEveryVisualization(filter) {
      log.debug('DashboardAddPanel.addEveryVisualization');
      await this.ensureAddPanelIsShowing();
      await this.toggleFilter('visualization');
      if (filter) {
        await this.filterEmbeddableNames(filter.replace('-', ' '));
      }
      let morePages = true;
      const vizList = [];
      while (morePages) {
        vizList.push(await this.addEveryEmbeddableOnCurrentPage());
        morePages = await this.clickPagerNextButton();
      }
      await this.closeAddPanel();
      return vizList.reduce((acc, vizList) => [...acc, ...vizList], []);
    }

    async addEverySavedSearch(filter) {
      log.debug('DashboardAddPanel.addEverySavedSearch');
      await this.ensureAddPanelIsShowing();
      await this.toggleFilter('search');
      const searchList = [];
      if (filter) {
        await this.filterEmbeddableNames(filter.replace('-', ' '));
      }
      let morePages = true;
      while (morePages) {
        searchList.push(await this.addEveryEmbeddableOnCurrentPage());
        morePages = await this.clickPagerNextButton();
      }
      await this.closeAddPanel();
      return searchList.reduce((acc, searchList) => [...acc, ...searchList], []);
    }

    async addSavedSearch(searchName) {
      log.debug(`addSavedSearch(${searchName})`);

      await this.ensureAddPanelIsShowing();
      await this.toggleFilter('search');
      await this.filterEmbeddableNames(searchName);

      await testSubjects.click(`savedObjectTitle${searchName.split(' ').join('-')}`);
      await testSubjects.exists('addObjectToDashboardSuccess');
      await this.closeAddPanel();
    }

    async addSavedSearches(searches) {
      for (const name of searches) {
        await this.addSavedSearch(name);
      }
    }

    async addVisualizations(visualizations) {
      log.debug('DashboardAddPanel.addVisualizations');
      const vizList = [];
      for (const vizName of visualizations) {
        await this.addVisualization(vizName);
        vizList.push(vizName);
      }
      return vizList;
    }

    async addVisualization(vizName) {
      log.debug(`DashboardAddPanel.addVisualization(${vizName})`);
      await this.ensureAddPanelIsShowing();
      await this.toggleFilter('visualization');
      await this.filterEmbeddableNames(`"${vizName.replace('-', ' ')}"`);
      await testSubjects.click(`savedObjectTitle${vizName.split(' ').join('-')}`);
      await testSubjects.exists('addObjectToDashboardSuccess');
      await this.closeAddPanel();
      return vizName;
    }

    async filterEmbeddableNames(name) {
      // The search input field may be disabled while the table is loading so wait for it
      await this.waitForListLoading();
      await testSubjects.setValue('savedObjectFinderSearchInput', name);
      await this.waitForListLoading();
    }

    async panelAddLinkExists(name) {
      log.debug(`DashboardAddPanel.panelAddLinkExists(${name})`);
      await this.ensureAddPanelIsShowing();
      await this.filterEmbeddableNames(`"${name}"`);
      return await testSubjects.exists(`savedObjectTitle${name.split(' ').join('-')}`);
    }
  };
}
