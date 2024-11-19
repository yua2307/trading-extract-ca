import { NewMessageEvent } from 'telegram/events';
import {
  REGEX_CHECK_LINK_DEX,
  REGEX_TO_CHECK_SOLANA_CHAIN_CA,
} from '../constant/regex.constant';

export function validateSolanaContractAddress(text: string) {
  // Search for matches in the text
  const match = text.match(REGEX_TO_CHECK_SOLANA_CHAIN_CA);

  if (!match) {
    return null;
  }

  return match ? match[0] : null;
}

export async function validateAddressFromMessage(
  event: NewMessageEvent,
  isNeedCheckInUrlEntity = false,
): Promise<string | null> {
  try {
    let contractAddress = null;
    const messageFromTelegram = event.message.message;

    // Attempt to extract and validate from a text first
    try {
      contractAddress = validateSolanaContractAddress(messageFromTelegram);
    } catch (error) {
      console.error('Error validating address from text:', error);
    }

    // If no valid address from a text, try to extract from URL entities
    if (!contractAddress && isNeedCheckInUrlEntity) {
      const urlEntity = event.message.entities?.find(
        (entity) => !!entity['url'],
      );
      const hyperLink = urlEntity?.['url'] as string;

      if (hyperLink) {
        return hyperLink;
      }
    }

    return contractAddress;
  } catch (e) {
    console.error('Error validating address from message:', e);
    return null;
  }
}

export function extractLinkDexFromMessage(message: string): string | null {
  const match = message.match(REGEX_CHECK_LINK_DEX);

  return match ? match[0] : null;
}
