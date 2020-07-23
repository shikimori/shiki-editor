import Token from '../token';
import { extractUntil } from '../helpers';

const MAX_SMILEY_SIZE = 18;
const SMILEY_REGEXP = /^:(?:!|8\)|Ban|Bath2|Cry2|Cry3|Cry4|Happy Birthday|Im dead|V2|V3|V|Warning|advise|angry2|angry3|angry4|angry5|angry6|angry|animal|ball|bath|bdl2|bdl|bored|bow|bullied|bunch|bye|caterpillar|cold2|cold|cool2|cool|cry5|cry6|cry|dance|depressed2|depressed|diplom|disappointment|dont listen|dont want|dunno|evil2|evil3|evil|flute|frozen2|frozen3|frozen|gamer|gaze|happy3|happy|happy_cry|hi|hope2|hope3|hope|hopeless|hot2|hot3|hot|hunf|hurray|hypno|ill|interested|kia|kiss|kya|liar|lol|love2|love|noooo|oh2|oh|ololo|ooph|perveted|play|prcl|relax|revenge|roll|s1|s2|s3|s4|s|sad2|sarcasm|scared|scream|shock2|shock|shocked2|shocked3|shocked4|shocked|shy2|shy|sick|sleep|sleepy|smoker2|smoker|star|strange1|strange2|strange3|strange4|strange|stress|study2|study3|study|tea shock|tea2|thumbup|twisted|very sad2|very sad|watching|water|whip|wink|yahoo):$/;

export default function(state, char1, seq2, seq3) {
  if (char1 === ':') {
    const maxIndex = state.index + MAX_SMILEY_SIZE;
    const extracted = extractUntil(state.text, ':', state.index + 1, maxIndex);
    const kind = extracted ? `:${extracted}:` : null;

    if (kind && kind.match(SMILEY_REGEXP)) {
      return addSmiley(state, kind);
    }
  }

  switch (seq2) {
    case ':)':
    case ':D':
    case ':(':
      return addSmiley(state, seq2);

    default:
      break;
  }

  switch (seq3) {
    case ':-D':
    case '+_+':
    case ':-(':
    case ':-o':
    case ':-P':
      return addSmiley(state, seq3);

    default:
      break;
  }

  return false;
}


function addSmiley(state, kind) {
  state.inlineTokens.push(
    new Token('smiley', null, null, { kind })
  );
  state.next(kind.length);
  return true;
}

