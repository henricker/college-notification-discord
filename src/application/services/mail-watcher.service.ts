import { FetchMailService } from '../../infra/services/fetch-mail.service';

export class MailWatcherService {
  constructor(private readonly fetchMailService: FetchMailService) {}
}
