export interface MessengerEvent {
  sender?: { id: string };
  message?: { text?: string; is_echo?: boolean };
}
export interface FeedChange {
  field: string;
  value: { item: string; verb: string; comment_id?: string; message?: string };
}
export interface PageEntry {
  messaging?: MessengerEvent[];
  changes?: FeedChange[];
}
export interface WebhookBody {
  object: string;
  entry: PageEntry[];
}
