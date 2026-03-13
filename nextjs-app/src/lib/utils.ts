export function pick<T>(arr: T[]): T | null {
  return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const FEMALE_WORDS = ['female','weiblich','féminin','femenino','femminile','vrouw','feminino','kobieta','kadın','женщина','kvinna','kvinde','kvinne','nainen','feminin','žena','nő'];
const MALE_WORDS = ['male','männlich','masculin','masculino','maschile','man','mężczyzna','erkek','мужчина','mand','mann','mies','muž','férfi'];

export function isFemale(val: string): boolean {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  if (FEMALE_WORDS.includes(v)) return true;
  if (MALE_WORDS.includes(v)) return false;
  return v.includes('f');
}

export function mergeTrailingCustomerMsgs(msgs: { text: string; payloadText?: string; type: string }[]): { text: string; type: string }[] {
  if (msgs.length < 2) return msgs.map(m => ({ ...m, text: m.payloadText || m.text }));
  const result = msgs.map(m => ({ ...m, text: m.payloadText || m.text }));
  while (result.length >= 2 && result[result.length - 1].type === 'received' && result[result.length - 2].type === 'received') {
    const last = result.pop()!;
    result[result.length - 1] = { ...result[result.length - 1], text: result[result.length - 1].text + '\n' + last.text };
  }
  return result;
}

export const LANG_FULL: Record<string, string> = {
  de:'German',en:'English',fr:'French',es:'Spanish',it:'Italian',nl:'Dutch',pt:'Portuguese',
  pl:'Polish',tr:'Turkish',ru:'Russian',sv:'Swedish',da:'Danish',no:'Norwegian',fi:'Finnish',
  ro:'Romanian',cs:'Czech',hu:'Hungarian'
};
