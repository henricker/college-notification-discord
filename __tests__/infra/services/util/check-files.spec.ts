import { CheckFilesService } from '../../../../src/infra/util/check-files.service';

describe('CheckFiles (service-util)', () => {
  describe('isHtml (method)', () => {
    it('Should return true if string is html', () => {
      const service = new CheckFilesService();
      const result = service.isHtml('<html></html>');
      expect(result).toBeTruthy();
    });

    it('Should return false if string is not html', () => {
      const service = new CheckFilesService();
      const result = service.isHtml('oi');
      expect(result).toBeFalsy();
    });
  });
});
