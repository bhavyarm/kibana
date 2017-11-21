export default function ({ getService, loadTestFile }) {
  const esArchiver = getService('esArchiver');
  const remote = getService('remote');

  describe('homepage app', function () {
    before(function () {
      return remote.setWindowSize(1200, 800);
    });

    loadTestFile(require.resolve('./_home'));

  });
}
