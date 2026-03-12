export interface BirthDate {
  age: number;
  date: string;
}

export interface Profile {
  id: string;
  name: string;
  gender: string;
  username: string;
  city: string;
  postalCode: string;
  country: string;
  occupation: string;
  education: string;
  birthDate: BirthDate;
  hobbies: string;
  music: string;
  movies: string;
  relationshipStatus: string;
  lookingFor: string;
  bodyType: string;
  height: string;
  eyeColor: string;
  hairColor?: string;
  smoking: string;
  hasCar: boolean;
  housing: string;
  hasProfilePic: boolean;
  hasPictures: boolean;
  personality: string;
  profilePic: string;
  privateGallery?: string[];
  age?: number;
  [key: string]: any;
}

export interface Message {
  text: string;
  type: 'sent' | 'received';
  messageType: string;
  timestamp: string;
}

export interface AppConfig {
  apiKey: string;
  endpoint: string;
  origin: string;
  minLength: number;
  sourceLanguage: string;
  extraInfo: string;
  datingApp: boolean;
  datingAppCustomerInfo: string;
  datingAppModeratorInfo: string;
  datingAppSpamMessage: string;
  customerNotes: string;
  moderatorNotes: string;
  customer: Profile;
  moderator: Profile;
}

export interface AppState {
  messages: Message[];
  ins: number;
  outs: number;
  chatId: string;
  sessionStart: string;
  loading: boolean;
  summaryUser: Record<string, any>;
  summaryAssistant: Record<string, any>;
}
