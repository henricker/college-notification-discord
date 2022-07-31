import { MailListenerService } from '../../../src/infra/services/mail-listener.service';
import { imap } from '../../../src/infra/config/imap';

const mailListenerService = new MailListenerService(imap);

describe('Mail Listener service', () => {
  it('Shoud call imap to listening error event', () => {
    const onSpy = jest.spyOn(imap, 'on');
    mailListenerService['handleOnError']();
    expect(onSpy).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('Should call imap to listening end event', () => {
    const onSpy = jest.spyOn(imap, 'on');
    mailListenerService['handleOnEnd']();
    expect(onSpy).toHaveBeenCalledWith('end', expect.any(Function));
  });
});
