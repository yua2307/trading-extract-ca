import { StringSession } from 'telegram/sessions';
import * as readline from 'node:readline';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { envVariables } from '../../constant/envVariable.constant';
import * as fs from 'fs';
import { readFileSession } from '../../utils/readFile.util';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { GROUP_ID } from '../../constant/group.constant';
import {
  extractLinkDexFromMessage,
  validateAddressFromMessage,
} from '../../utils/extractCAFromMessage.util';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

@Injectable()
export class TelegramService implements OnModuleInit {
  private stringSession = new StringSession(
    envVariables.SESSION_AUTH_KEY || readFileSession(),
  );

  private client: TelegramClient;
  private groupName = 'Unknown Group';

  constructor() {
    this.client = new TelegramClient(
      this.stringSession,
      envVariables.TELEGRAM_APP_ID,
      envVariables.TELEGRAM_API_HASH,
      {
        connectionRetries: 5,
        autoReconnect: true,
      },
    );
  }

  async onModuleInit() {
    const isEnableTelegramService = !!envVariables.IS_ENABLE_TELEGRAM_SERVICE;

    if (isEnableTelegramService) {
      await this.listenTelegram();
    }

    return;
  }

  private async listenTelegram() {
    if (!(await this.client.checkAuthorization())) {
      await this.client.start({
        phoneNumber: async () =>
          new Promise((resolve) =>
            rl.question('Please enter your number: ', resolve),
          ),
        password: async () =>
          new Promise((resolve) =>
            rl.question('Please enter your password: ', resolve),
          ),
        phoneCode: async () =>
          new Promise((resolve) =>
            rl.question('Please enter the code you received: ', resolve),
          ),
        onError: (err) => console.log(err),
      });

      fs.writeFileSync(
        'session-telegram.txt',
        this.client.session.save() as unknown as string,
      );
    }

    if (await this.client.checkAuthorization()) {
      console.log('I am logged in!');
    }

    this.client.addEventHandler(
      async (event: NewMessageEvent) => {
        const isSingleMessage = 'message' in event && !event.message.groupedId;
        const sender = await event.message?.getSender();
        this.groupName = sender?.['username'] ?? 'Unknown';

        console.log(
          `Message telegram:  ${event.message.message} from ${this.groupName}`,
        );

        if (!isSingleMessage) {
          console.log('This is a grouped message.Error');
          return;
        }
        // FIND a SPECIFIC CONTRACT ADDRESS
        const contractAddress = await validateAddressFromMessage(event, true);

        if (contractAddress) {
          return this.client.sendMessage('MevxTradingBot', {
            message: `${contractAddress}`,
          });
        }

        // FIND a SPECIFIC DEX LINK
        const dexLink = extractLinkDexFromMessage(event.message.message);

        if (dexLink) {
          return this.client.sendMessage('MevxTradingBot', {
            message: `${dexLink}`,
          });
        }
      },
      new NewMessage({
        chats: [GROUP_ID.KRATOS_VIP_X100],
        forwards: false,
      }),
    );
  }
}
