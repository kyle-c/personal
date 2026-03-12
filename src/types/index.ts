export type Language = 'en' | 'es';

export type MessageSender = 'bot' | 'user';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type MessageType = 'text' | 'buttons' | 'list' | 'media' | 'budget-summary';

export interface ButtonOption {
  id: string;
  label: Record<Language, string>;
}

export interface ListSection {
  title: Record<Language, string>;
  rows: ListRow[];
}

export interface ListRow {
  id: string;
  title: Record<Language, string>;
  description?: Record<Language, string>;
}

export interface Message {
  id: string;
  type: MessageType;
  sender: MessageSender;
  content: Record<Language, string>;
  timestamp: Date;
  status: MessageStatus;
  buttons?: ButtonOption[];
  listSections?: ListSection[];
  listButtonText?: Record<Language, string>;
  mediaUrl?: string;
  mediaCaption?: Record<Language, string>;
  budgetData?: BudgetSummary;
}

export interface FlowNode {
  id: string;
  messages: Omit<Message, 'id' | 'timestamp' | 'status'>[];
  /** Map of action id → next node id */
  transitions: Record<string, string>;
  /** If true, this node expects free-text input */
  expectsInput?: boolean;
  /** Handler for free-text input — returns next node id */
  inputHandler?: string;
}

export interface ConversationFlow {
  id: string;
  startNode: string;
  nodes: Record<string, FlowNode>;
}

export interface BudgetSummary {
  income: number;
  expenses: Record<string, number>;
  available: number;
}

export interface Resource {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  phone?: string;
  website?: string;
  category: string;
  location?: string;
}

export interface EmergencyContact {
  id: string;
  name: Record<Language, string>;
  phone: string;
  description: Record<Language, string>;
  available24h: boolean;
}
