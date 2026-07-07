import type { Message } from "../entities";

export type MessageClassification = {
  category: string;
  intent: string;
  confidence: number;
  isSimpleQuestion: boolean;
};

export interface MessageClassifier {
  classify(message: Message): MessageClassification;
}
