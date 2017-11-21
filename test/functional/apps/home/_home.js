import expect from 'expect.js';


export default function ({ getService, getPageObjects }) {
  const retry = getService('retry');
  const log = getService('log');
  const dashboardVisualizations = getService('dashboardVisualizations');
  const remote = getService('remote');
  const PageObjects = getPageObjects(['common', 'home']);

  describe('Kibana takes you home', function describeIndexTests() {

    it('clicking on kibana app should take you to home page', async ()=> {
        await PageObjects.common.navigateToApp('settings');
        log.debug("homepage nav");
        await PageObjects.home.clickKibanaIcon();
        const url = await remote.getCurrentUrl();
        expect(url.includes('/app/kibana#/home')).to.be(true);

    });

    it('clicking on console on homepage should take you to console app', async ()=> {
        await PageObjects.home.clickSynopsis('console');
        const url = await remote.getCurrentUrl();
        expect(url.includes('/app/kibana#/dev_tools/console?_g=()')).to.be(true);

    });

  });
}
