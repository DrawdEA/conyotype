export const DURATION_S = 30;

// bump when SCENARIOS change so in-flight run tokens are rejected
export const PHRASE_SET_VERSION = 4;

export type Msg = readonly [who: string, text: string, gloss?: string];

export interface Turn {
  /** what the player has to type: lowercase ASCII only (see lib/replay.ts key validation) */
  you: string;
  gloss: string;
  /** what the GC says back once this line is sent */
  reply?: Msg;
}

export interface Scenario {
  opener: Msg[];
  turns: Turn[];
}

/** One GC conversation per run. A run that outpaces its scenario loops back to the first turn. */
export const SCENARIOS: Scenario[] = [
  {
    opener: [
      ["Migs", "guys where are we eating, im so gutom", "I'm so hungry"],
      ["Bea", "not jsec again please", "not the JSEC food court again"],
    ],
    turns: [
      { you: "lets make tambay in katip, so many choices", gloss: "let's hang out in Katipunan", reply: ["Migs", "g, which one", "ok, which one"] },
      { you: "samgyup? i can make libre if you make sabay", gloss: "Korean BBQ? my treat if you come along", reply: ["Bea", "omg libre, say less", "free food? say no more"] },
      { you: "wait kuya can make sundo us at gate three", gloss: "our driver can pick us up at Gate 3", reply: ["Iñigo", "sakay ako pls", "I'm riding along"] },
      { you: "dont be late, my driver gets so badtrip", gloss: "don't be late, my driver gets annoyed", reply: ["Migs", "5 mins lang promise", "just 5 minutes, promise"] },
      { you: "bring cash, that place is so kuripot with cards", gloss: "that place doesn't take cards", reply: ["Bea", "noted!!"] },
      { you: "after that iced oat latte in rockwell please", gloss: "coffee run at Power Plant after", reply: ["Iñigo", "youre so tita", "you're such an auntie"] },
      { you: "im so excited, this day is so sarap already", gloss: "this day is already delicious", reply: ["Migs", "lol same"] },
    ],
  },
  {
    opener: [
      ["Cheska", "ENLISTMENT IS OPEN"],
      ["Kyle", "the site is so dead, cannot even load", "the enrollment site is down"],
    ],
    turns: [
      { you: "omg the slots are gone, i literally cannot", gloss: "the class slots are all taken", reply: ["Cheska", "same!!! so hassle", "same, so annoying"] },
      { you: "i need that eight am or my sched is so gulo", gloss: "or my schedule is chaotic", reply: ["Kyle", "eight am? youre insane"] },
      { you: "the prof for the other section is so terror", gloss: "the other professor is strict", reply: ["Cheska", "true, i made iyak last sem", "true, I cried last semester"] },
      { you: "can you make refresh for me, my wifi is so slow", gloss: "please refresh the page for me", reply: ["Kyle", "refreshing pray for us", "refreshing, pray for us"] },
      { you: "wait it went through, i made it, deadz", gloss: "it worked, I got in, I'm dead", reply: ["Cheska", "CONGRATS omg"] },
      { you: "now i can make sleep, so tired of this", gloss: "now I can sleep", reply: ["Kyle", "goodnight winner"] },
    ],
  },
  {
    opener: [
      ["Sab", "guys the thesis is due friday"],
      ["Tin", "and paolo has not sent chapter two", "Paolo hasn't sent his part"],
    ],
    turns: [
      { you: "hes so pabigat, i cant even with him", gloss: "he's dead weight", reply: ["Sab", "literally carrying the group"] },
      { you: "i made chika with him, he said hes making habol", gloss: "I talked to him, he says he's catching up", reply: ["Tin", "making habol since july lol", "catching up since July"] },
      { you: "lets make meet at the org room after class", gloss: "let's meet at the org room", reply: ["Sab", "g, ill bring my laptop", "ok, I'll bring my laptop"] },
      { you: "make pila for the printer, its always so long", gloss: "line up for the printer early", reply: ["Tin", "the pila is insane today", "the line is insane today"] },
      { you: "if we make puyat tonight we can finish this", gloss: "if we stay up late we can finish", reply: ["Sab", "puyat gang rise up", "all-nighter gang"] },
      { you: "my qpi cannot take another bad grade, please", gloss: "my grade average can't take another hit", reply: ["Tin", "same, dont tell my dad", "same, don't tell my dad"] },
      { you: "ok lets go, one big fight guys", gloss: "let's do this, the Ateneo cheer", reply: ["Sab", "one big fight!!", "the Ateneo cheer"] },
    ],
  },
  {
    opener: [
      ["Andrea", "tagaytay this weekend??"],
      ["Marco", "my tita has a rest house in tali also", "my aunt has a beach house in Tali too"],
    ],
    turns: [
      { you: "wait is there wifi at the rest house in tali", gloss: "does the beach house have wifi", reply: ["Marco", "yes but so slow"] },
      { you: "its so lamig in tagaytay, i should bring my north face", gloss: "it's cold in Tagaytay", reply: ["Andrea", "bring the puffer", "bring the puffer jacket"] },
      { you: "can we make stop at bulalo first, im so gutom", gloss: "can we stop for bulalo soup first", reply: ["Marco", "obviously"] },
      { you: "who is driving, my driver is off on weekends", gloss: "my driver doesn't work weekends", reply: ["Andrea", "kuya can, my dad said ok", "our driver can, dad said ok"] },
      { you: "dont make kalat in the car, tita will get mad", gloss: "don't make a mess in the car", reply: ["Marco", "no chips then"] },
      { you: "lets make gala at night, poblacion energy", gloss: "let's go out at night, Poblacion vibes", reply: ["Andrea", "in tagaytay?? lol ok"] },
      { you: "this is giving tita of manila weekend already", gloss: "fancy-auntie weekend vibes", reply: ["Marco", "as it should"] },
    ],
  },
  {
    opener: [
      ["Bea", "where are you, class started"],
      ["Migs", "the prof is checking attendance"],
    ],
    turns: [
      { you: "im stuck in edsa, the traffic is so sayang of my time", gloss: "EDSA traffic is wasting my time", reply: ["Bea", "always edsa with you", "always EDSA traffic with you"] },
      { you: "my driver is late again, so badtrip", gloss: "my driver was late again", reply: ["Migs", "get a grab next time", "book a Grab ride next time"] },
      { you: "i made tulog in the grab last time, never again", gloss: "I fell asleep in the Grab", reply: ["Bea", "lol that was iconic"] },
      { you: "can you make sign for me, please please", gloss: "sign the attendance for me", reply: ["Migs", "he is watching us"] },
      { you: "tell him im making para, im literally at gate two", gloss: "tell him I'm getting off, I'm at Gate 2", reply: ["Bea", "run!!!"] },
      { you: "i cant run, my feet are so sakit from yesterday", gloss: "my feet hurt from yesterday", reply: ["Migs", "we told you no heels"] },
      { you: "im here, im so init, act natural", gloss: "I'm here, I'm hot, act natural", reply: ["Bea", "sit sit sit"] },
    ],
  },
  {
    opener: [
      ["Kyle", "ateneo la salle game today"],
      ["Cheska", "are we going or what"],
    ],
    turns: [
      { you: "obviously, i already made pila for tickets", gloss: "I already lined up for tickets", reply: ["Kyle", "legend"] },
      { you: "taft is so far though, can we make kita in rockwell", gloss: "let's meet in Rockwell instead", reply: ["Cheska", "rockwell then moa", "Rockwell mall, then Mall of Asia"] },
      { you: "wear blue, dont be so baduy with the green", gloss: "wear blue, the green is tacky", reply: ["Kyle", "animo la salle jk", "the DLSU cheer, just kidding"] },
      { you: "dude pare chong, thats so jologs of you", gloss: "bro bro bro, that's so tacky", reply: ["Cheska", "hahaha kyle is so hambog", "Kyle is so arrogant"] },
      { you: "my kilig if we win, i will literally die", gloss: "I'll be so thrilled if we win", reply: ["Kyle", "one big fight", "the Ateneo cheer"] },
      { you: "after the game, make libre the winner", gloss: "the winner treats after", reply: ["Cheska", "deal"] },
    ],
  },
  {
    opener: [
      ["Sab", "org apps are due tonight"],
      ["Paolo", "the tambay in the org room is so gulo rn", "the org room hangout is chaos right now"],
    ],
    turns: [
      { you: "i made habol my requirements, so stressed", gloss: "I caught up on my requirements", reply: ["Sab", "same, deadz", "same, I'm dead"] },
      { you: "the seniors are making chika about the applicants", gloss: "the seniors are gossiping about applicants", reply: ["Paolo", "so plastic of them", "so fake of them"] },
      { you: "dont mind them, they were so hambog last year", gloss: "they were arrogant last year", reply: ["Sab", "true true"] },
      { you: "lets make sabay for the interview, im so kaba", gloss: "let's go together, I'm nervous", reply: ["Paolo", "kaba but cute", "nervous but cute"] },
      { you: "if i get in, iced oat latte for everyone", gloss: "coffee on me if I get in", reply: ["Sab", "manifesting", "wishing it into existence"] },
      { you: "ok im making effort, wish me luck guys", gloss: "I'm trying, wish me luck", reply: ["Paolo", "you got this"] },
    ],
  },
  {
    opener: [
      ["Tin", "so what happened with the date"],
      ["Andrea", "spill, we are so invested"],
    ],
    turns: [
      { you: "he didnt make libre, hes so not a gentleman", gloss: "he didn't pay, so not a gentleman", reply: ["Tin", "NO"] },
      { you: "and he was making bola me the whole time", gloss: "he was flattering me insincerely", reply: ["Andrea", "red flag red flag"] },
      { you: "but the matcha was so sarap, like legit", gloss: "but the matcha was really good", reply: ["Tin", "priorities lol"] },
      { you: "i was so kilig at first, i wanted to die", gloss: "I was so giddy at first", reply: ["Andrea", "and now?"] },
      { you: "now im so asar, dont make me talk about him", gloss: "now I'm annoyed, don't bring him up", reply: ["Tin", "we love a villain arc"] },
      { you: "lets make gala in poblacion, i need this", gloss: "let's go out in Poblacion", reply: ["Andrea", "friday, no excuses"] },
      { you: "no way hes going to be there, right", gloss: "he won't be there, right?", reply: ["Tin", "we will make sure"] },
    ],
  },
  {
    opener: [
      ["Marco", "its migs birthday on saturday"],
      ["Iñigo", "he said no gifts but like", "he said no gifts, but still"],
    ],
    turns: [
      { you: "we should make libre him, hes always the one paying", gloss: "we should treat him for once", reply: ["Marco", "yes yes"] },
      { you: "bgc after the org meeting, that place in high street", gloss: "BGC, the High Street place", reply: ["Iñigo", "the one with the good wings"] },
      { you: "make sure bea comes, she is always so late", gloss: "make sure Bea comes on time", reply: ["Marco", "ill make sundo her", "I'll pick her up"] },
      { you: "dont be so kuripot, its just five hundred each", gloss: "don't be stingy, ₱500 each", reply: ["Iñigo", "fine fine"] },
      { you: "someone make abot the cake from the caf", gloss: "someone pick up the cake from the cafe", reply: ["Marco", "on it"] },
      { you: "he is going to make iyak, i know it", gloss: "he's going to cry, I know it", reply: ["Iñigo", "he is so soft lol"] },
      { you: "this is going to be so sarap, i cant wait", gloss: "this is going to be great", reply: ["Marco", "saturday!!"] },
    ],
  },
  {
    opener: [
      ["Bea", "is there class or what, its raining so hard"],
      ["Paolo", "taft is a river already", "Taft Avenue is flooded"],
    ],
    turns: [
      { you: "no announcement yet, the admin is so slow", gloss: "no suspension announcement yet", reply: ["Bea", "so hassle", "so annoying"] },
      { you: "i made sabit on the jeep once in a flood, never again", gloss: "I rode hanging off a jeepney in a flood once", reply: ["Paolo", "why would you do that"] },
      { you: "the aircon in the mrt is so not working also", gloss: "the MRT aircon is broken too", reply: ["Bea", "sauna on rails", "the MRT is a sauna"] },
      { you: "lets just make stay at the condo and order", gloss: "let's stay in and order food", reply: ["Paolo", "milk tea please", "bring milk tea please"] },
      { you: "wait it got suspended, i literally cannot", gloss: "classes just got suspended", reply: ["Bea", "FINALLY"] },
      { you: "sembreak came early, mom said we can go to japan", gloss: "early break, family trip to Japan", reply: ["Paolo", "youre so rich its annoying", "you're annoyingly rich"] },
      { you: "dont be asar, ill bring you pasalubong", gloss: "don't be annoyed, I'll bring you souvenirs", reply: ["Bea", "kitkat matcha pls", "bring matcha KitKats please"] },
    ],
  },
  // --- batch 2: freedom-wall flavored + gap topics ---
  {
    opener: [
      ["Enzo", "lf extra grad ticket, anyone??", "looking for an extra graduation ticket"],
      ["Bianca", "same, my lola wants to come", "same, my grandma wants to come"],
    ],
    turns: [
      { you: "wala pa dates but im looking na din", gloss: "no dates yet but I'm already looking", reply: ["Enzo", "willing to pay kahit magkano", "willing to pay any amount"] },
      { you: "dont be oa, its just one ticket", gloss: "don't overreact, it's one ticket", reply: ["Bianca", "one ticket for lola is not oa", "one ticket for grandma isn't overreacting"] },
      { you: "ask the org room, someone always has extra", gloss: "someone in the org always has a spare", reply: ["Enzo", "g, ill make tanong", "ok, I'll ask around"] },
      { you: "my tita is not coming so i can make bigay mine", gloss: "my aunt isn't coming, I can give mine", reply: ["Bianca", "OMG i love you"] },
      { you: "make libre me a latte and were even", gloss: "buy me a latte and we're even", reply: ["Bianca", "deal deal deal"] },
      { you: "ill make send you the seat number tonight", gloss: "I'll send the seat number tonight", reply: ["Enzo", "wait what about me", "wait, what about me"] },
      { you: "enzo make hanap your own, im out of tickets", gloss: "Enzo, find your own", reply: ["Enzo", "betrayed by my own gc", "betrayed by my own group chat"] },
    ],
  },
  {
    opener: [
      ["Sab", "guys i lost my phone in the caf", "I lost my phone in the cafeteria"],
      ["Tin", "wait when?? did you make hanap na", "wait, when? did you look for it?"],
    ],
    turns: [
      { you: "i checked everywhere, its literally gone", gloss: "I searched everywhere", reply: ["Sab", "was it the blue one"] },
      { you: "yes and it was from my ninang, so sentimental", gloss: "my godmother gave it to me", reply: ["Tin", "post on the freedom wall", "post it on the campus confessions page"] },
      { you: "ok posting, ill pay whoever finds it", gloss: "I'll pay a finder's fee", reply: ["Sab", "dont say the amount lol", "don't say the amount"] },
      { you: "the guard said make check the lost and found", gloss: "check lost and found", reply: ["Tin", "at the lobby, ground floor", "lost and found is at the lobby"] },
      { you: "if wala, my dad is going to make sermon", gloss: "if it's not there, my dad will lecture me", reply: ["Sab", "praying for you bestie", "praying for you, best friend"] },
      { you: "wait someone commented, they found it at the lib", gloss: "someone found it at the library", reply: ["Tin", "OMG go get it", "go get it"] },
      { you: "running now, ill make libre the finder a coffee", gloss: "coffee for the finder", reply: ["Sab", "the wall works, legit", "the freedom wall works, for real"] },
    ],
  },
  {
    opener: [
      ["Kyle", "someone left boxers in the udn bathroom", "someone left boxers in the UDN bathroom"],
      ["Cheska", "NO. since when"],
    ],
    turns: [
      { you: "its been there the whole week, is it a donation atp", gloss: "at this point, is it a donation?", reply: ["Kyle", "hahaha someone claim it"] },
      { you: "the janitor is so tired of us honestly", gloss: "the janitor is tired of us", reply: ["Cheska", "kuya deserves a raise", "the janitor deserves a raise"] },
      { you: "post it on the wall, someone will make claim", gloss: "post it, someone will claim it", reply: ["Kyle", "with a pic? no thanks", "with a photo? no thanks"] },
      { you: "no pic please, i cant with this batch", gloss: "no photo, I can't with this batch", reply: ["Cheska", "the freshies are feral", "the freshmen are feral"] },
      { you: "ok next topic, im so done with boxers", gloss: "I'm done talking about boxers", reply: ["Kyle", "same, lunch?"] },
      { you: "actually wait, someone claimed it on the wall", gloss: "someone claimed them", reply: ["Kyle", "NO WAY who"] },
      { you: "anonymous, obviously, i would be too", gloss: "anonymous, understandably", reply: ["Cheska", "the shame is real"] },
    ],
  },
  {
    opener: [
      ["Andrea", "is chagee really that good", "is Chagee (milk tea) really that good"],
      ["Marco", "or is it just the pretty cups"],
    ],
    turns: [
      { you: "its good if you want the tea part of milk tea", gloss: "good if you like actual tea", reply: ["Andrea", "so its for titas", "so it's for aunties"] },
      { you: "im so tita for it, dont judge me", gloss: "I'm an auntie about it", reply: ["Marco", "we been knew", "we already knew"] },
      { you: "the line in katip is so long though", gloss: "the Katipunan line is long", reply: ["Andrea", "grab it na lang", "just get it delivered on Grab"] },
      { you: "grab fee is more than the drink, so sayang", gloss: "delivery costs more than the drink", reply: ["Marco", "priorities lol"] },
      { you: "fine ill make pila, who wants", gloss: "I'll line up, who wants one", reply: ["Andrea", "ME, jasmine one pls"] },
      { you: "the line is forty minutes, im so regretting this", gloss: "40-minute line, regretting it", reply: ["Marco", "youre a hero"] },
      { you: "ok got them, make bayad me later, no gcash excuses", gloss: "pay me later, no excuses", reply: ["Andrea", "sending now, ily", "sending the money now, love you"] },
    ],
  },
  {
    opener: [
      ["Paolo", "someone please host a bingo night"],
      ["Bea", "an org, an office, i dont care"],
    ],
    turns: [
      { you: "it would be so fun, like tita energy", gloss: "fun, auntie energy", reply: ["Paolo", "prizes should be gcash", "prizes should be GCash money"] },
      { you: "our org can host, ill make pitch to the exec", gloss: "I'll pitch it to the officers", reply: ["Bea", "you? pitching? ok"] },
      { you: "dont be plastic, i can make effort", gloss: "don't be fake, I can try", reply: ["Paolo", "we believe in you jk", "we believe in you, just kidding"] },
      { you: "venue at the org room, snacks from the caf", gloss: "org room venue, cafeteria snacks", reply: ["Bea", "bring the lolas", "bring the grandmas"] },
      { you: "if my lola comes she is winning, legit", gloss: "if my grandma comes she'll win", reply: ["Paolo", "lola is a bingo shark", "grandma is a bingo shark"] },
      { you: "the exec said yes, friday at the org room", gloss: "the officers said yes, Friday", reply: ["Bea", "THE GC DID SOMETHING", "the group chat actually did something"] },
      { you: "make invite everyone, prizes are gcash and snacks", gloss: "invite everyone", reply: ["Paolo", "lola is coming, be warned", "grandma is coming, be warned"] },
    ],
  },
  {
    opener: [
      ["Migs", "the wall posted a crush letter for someone in chemsoc", "the freedom wall posted a crush letter for someone in the chem org"],
      ["Iñigo", "since term 1 daw, so cute", "since first term, apparently, so cute"],
    ],
    turns: [
      { you: "sana ako na lang, like legit", gloss: "I wish it were me", reply: ["Migs", "you have a jowa", "you have a partner"] },
      { you: "i know but the kilig is free", gloss: "the butterflies are free", reply: ["Iñigo", "sana all may secret admirer", "wish we all had a secret admirer"] },
      { you: "who do you think wrote it, so mysterious", gloss: "who wrote it?", reply: ["Migs", "someone from id124 for sure", "someone from ID 124 for sure"] },
      { you: "the vc has a gf though, so awkward", gloss: "the vice chair has a girlfriend", reply: ["Iñigo", "sad ending in advance"] },
      { you: "make send them directly, not the whole campus", gloss: "message them, not the whole campus", reply: ["Migs", "freedom wall said the same", "the confessions page said the same"] },
      { you: "update, the vc saw it and made post a heart", gloss: "the vice chair reacted with a heart", reply: ["I\u00f1igo", "plot twist"] },
      { you: "omg the gf saw it too, this is so gulo", gloss: "the girlfriend saw it, chaos", reply: ["Migs", "grab the popcorn", "grab the popcorn"] },
    ],
  },
  {
    opener: [
      ["Tin", "to the annoying guy calling me minion"],
      ["Sab", "he called you tanda too??", "he called you old too?"],
    ],
    turns: [
      { you: "im only twenty three, hes literally one year younger", gloss: "I'm 23, he's a year younger", reply: ["Tin", "lagot siya sayo", "he's in trouble with you"] },
      { you: "lagot siya when i make hanap him in campus", gloss: "he's in trouble when I find him", reply: ["Sab", "this is not a threat lol"] },
      { you: "not a threat, im just going to make stare", gloss: "I'll just stare at him", reply: ["Tin", "stare so hard"] },
      { you: "he didnt even make message me on ig, so rude", gloss: "he didn't message me on Instagram", reply: ["Sab", "wait you wanted him to?"] },
      { you: "no, well, maybe, dont make chika this", gloss: "maybe, don't gossip about it", reply: ["Tin", "too late its in the gc", "too late, it's in the group chat"] },
      { you: "i saw him at the caf and made deadma, so strong", gloss: "I ignored him, so strong of me", reply: ["Sab", "you looked back, admit it"] },
      { you: "i looked back once, once, stop laughing", gloss: "I looked back once", reply: ["Tin", "minion is in love"] },
    ],
  },
  {
    opener: [
      ["Cheska", "wtf is the dept doing this break", "what is the department doing this break"],
      ["Kyle", "150 petitions and zero response"],
    ],
    turns: [
      { you: "even after the extended deadline, so slow", gloss: "even after the extension", reply: ["Cheska", "they are a living stereotype"] },
      { you: "i need that class or i make delay my grad", gloss: "I need that class or I graduate late", reply: ["Kyle", "same, im so stressed"] },
      { you: "lets make email the chair, all of us", gloss: "let's all email the department chair", reply: ["Cheska", "cc the dean, why not", "copy the dean, why not"] },
      { you: "dont cc the dean, thats so oa", gloss: "don't cc the dean, too much", reply: ["Kyle", "oa works though", "overreacting works though"] },
      { you: "fine, cc everyone, i literally cannot anymore", gloss: "fine, cc everyone", reply: ["Cheska", "sending it now"] },
      { you: "they replied in ten minutes, the dean works", gloss: "cc'ing the dean worked", reply: ["Kyle", "oa wins again", "overreacting wins again"] },
      { you: "slots open tomorrow, make enlist at eight sharp", gloss: "slots open at 8, enlist sharp", reply: ["Cheska", "setting three alarms"] },
    ],
  },
  {
    opener: [
      ["Bianca", "where can i get a blowout for grad pics"],
      ["Andrea", "somewhere near taft pls", "somewhere near Taft Avenue please"],
    ],
    turns: [
      { you: "theres a salon behind the caf, so underrated", gloss: "underrated salon behind the cafeteria", reply: ["Bianca", "name pls", "the salon's name please"] },
      { you: "i forgot the name, its beside the milk tea place", gloss: "next to the milk tea shop", reply: ["Andrea", "thats every salon in taft", "that's every salon on Taft"] },
      { you: "book early, everyone is making grad pic this week", gloss: "everyone's taking grad photos", reply: ["Bianca", "so hassle", "so annoying"] },
      { you: "my tita has a stylist in makati if you want", gloss: "my aunt's stylist is in Makati", reply: ["Andrea", "makati is so far", "Makati is so far"] },
      { you: "your face is worth the traffic, make sundo you", gloss: "worth the traffic, I'll pick you up", reply: ["Bianca", "omg thank youuu"] },
      { you: "the stylist did my hair so bongga, tita approved", gloss: "the stylist went all out", reply: ["Bianca", "send the pic omg"] },
      { you: "make post it after grad, i dont want spoilers", gloss: "posting after graduation", reply: ["Andrea", "so mysterious"] },
    ],
  },
  {
    opener: [
      ["Marco", "wala na yosi buddy ko, he graduated", "my smoking buddy is gone, he graduated"],
      ["Paolo", "lf kapalit basically", "looking for a replacement basically"],
    ],
    turns: [
      { you: "you should quit, its so bad for you", gloss: "you should quit smoking", reply: ["Marco", "ok tita", "ok, auntie"] },
      { you: "im serious, my lolo had the cough for years", gloss: "my grandpa had that cough for years", reply: ["Paolo", "wow guilt trip"] },
      { you: "ill be your walking buddy instead, free", gloss: "I'll walk with you instead", reply: ["Marco", "walk where, edsa?", "walk where, EDSA?"] },
      { you: "the field, after class, no excuses", gloss: "the field after class", reply: ["Paolo", "im so lazy though"] },
      { you: "make effort, ill make libre the coffee after", gloss: "try, coffee's on me after", reply: ["Marco", "ok coffee wins"] },
      { you: "day one done, he only complained for an hour", gloss: "day one of walking done", reply: ["Marco", "it was forty minutes"] },
      { you: "same time tomorrow, no yosi, coffee only", gloss: "same time tomorrow", reply: ["Paolo", "we love a wellness arc", "we love a self-improvement arc"] },
    ],
  },
  {
    opener: [
      ["Kyle", "finals in three days"],
      ["Cheska", "i have not opened a single reading"],
    ],
    turns: [
      { you: "same, i made tulog the whole weekend", gloss: "I slept all weekend", reply: ["Kyle", "self care daw", "self care, supposedly"] },
      { you: "lets make review at the lib, second floor", gloss: "study at the library, 2nd floor", reply: ["Cheska", "the one with the massage chairs?", "the library floor with the massage chairs?"] },
      { you: "they removed the massage chairs, so sad", gloss: "they took out the massage chairs", reply: ["Kyle", "why cant we have nice things", "why can't we have nice things"] },
      { you: "bring coffee, im going to make puyat tonight", gloss: "I'm pulling an all-nighter", reply: ["Cheska", "puyat squad", "all-nighter squad"] },
      { you: "if i fail this my mom will make kuha my car", gloss: "if I fail, my mom takes the car", reply: ["Kyle", "study harder then lol"] },
      { you: "update, i made read three chapters, so proud", gloss: "I read three chapters", reply: ["Cheska", "out of twelve"] },
      { you: "baby steps, dont make pressure me, coffee number four", gloss: "baby steps, fourth coffee", reply: ["Kyle", "youre going to vibrate"] },
    ],
  },
  {
    opener: [
      ["Sab", "POP QUIZ. he gave a pop quiz"],
      ["Tin", "on the reading nobody read"],
    ],
    turns: [
      { you: "i wrote my name and made pray", gloss: "I wrote my name and prayed", reply: ["Sab", "same, thoughts and prayers", "same, thoughts and prayers"] },
      { you: "the prof is so terror, he was smiling", gloss: "the strict professor was smiling", reply: ["Tin", "he enjoys this"] },
      { you: "someone said the answers were on the slides", gloss: "the answers were in the slides", reply: ["Sab", "which slides?? there are 90"] },
      { you: "im making appeal, this is so unfair", gloss: "I'm appealing, it's unfair", reply: ["Tin", "good luck with that"] },
      { you: "next time we make basa the reading, promise", gloss: "next time we read the assignment", reply: ["Sab", "we say this every week"] },
      { you: "results are out, i got a passing grade somehow", gloss: "I passed somehow", reply: ["Sab", "the prayer worked"] },
      { you: "the prof wrote lucky on my paper, so shady", gloss: "the prof wrote lucky on it", reply: ["Tin", "iconic honestly", "iconic, honestly"] },
    ],
  },
  {
    opener: [
      ["Bea", "guys im shifting to comm", "I'm switching my major to communications"],
      ["Migs", "WAIT. what about engineering"],
    ],
    turns: [
      { you: "i made iyak in calculus for the last time", gloss: "I cried in calculus for the last time", reply: ["Bea", "proud of you honestly"] },
      { you: "my dad is so not happy, he wanted an engineer", gloss: "my dad wanted an engineer", reply: ["Migs", "tell him comm makes money", "tell him communications pays"] },
      { you: "he said comm is for people who make chika", gloss: "he says comm is for gossipers", reply: ["Bea", "he is not wrong lol"] },
      { you: "im so happy though, like legit for once", gloss: "I'm happy for once", reply: ["Migs", "then thats the answer"] },
      { you: "lets celebrate, samgyup, my treat", gloss: "Korean BBQ, my treat", reply: ["Bea", "shifting party!!", "major-switch party"] },
      { you: "my dad texted, he said make sure youre happy", gloss: "dad says make sure you're happy", reply: ["Migs", "wait thats so sweet"] },
      { you: "i made iyak again but the good kind this time", gloss: "happy tears this time", reply: ["Bea", "growth era", "personal growth era"] },
    ],
  },
  {
    opener: [
      ["Iñigo", "retreat this weekend, no phones"],
      ["Cheska", "three days without wifi, i will die"],
    ],
    turns: [
      { you: "its in tagaytay so at least its so lamig", gloss: "it's cold in Tagaytay", reply: ["Iñigo", "bring the north face", "bring the North Face jacket"] },
      { you: "i will make sleep the whole sharing session", gloss: "I'll sleep through the sharing session", reply: ["Cheska", "you always cry at sharing"] },
      { you: "i do not cry, i make reflect quietly", gloss: "I reflect quietly", reply: ["Iñigo", "sure jan", "sure you don't (sarcastic)"] },
      { you: "who is our facilitator, sana not the terror one", gloss: "hopefully not the strict facilitator", reply: ["Cheska", "its him. its always him", "it's the strict facilitator, always"] },
      { you: "ok make pack the tissue, for reflecting", gloss: "pack tissues, for reflecting", reply: ["Iñigo", "for reflecting HAHAHA", "for reflecting, sure"] },
      { you: "day two, no phone, i made bond with a tree", gloss: "I bonded with a tree", reply: ["Cheska", "the tree has a name?"] },
      { you: "his name is kuya tree, dont make judge", gloss: "the tree is called Kuya Tree", reply: ["I\u00f1igo", "retreat changed you"] },
    ],
  },
  {
    opener: [
      ["Marco", "poblacion friday??", "Poblacion (bar district) on Friday?"],
      ["Andrea", "who is driving, not me"],
    ],
    turns: [
      { you: "ill bring my driver, he can make wait", gloss: "my driver can wait for us", reply: ["Marco", "kuya is a saint", "the driver is a saint"] },
      { you: "dress code is so strict there, no slides", gloss: "no slippers allowed", reply: ["Andrea", "bea wear shoes pls", "Bea, wear real shoes please"] },
      { you: "last time bea made sabit on the bouncer", gloss: "Bea hung on the bouncer last time", reply: ["Marco", "she was so kilig", "she was so giddy"] },
      { you: "curfew is one, my mom will make text every hour", gloss: "curfew at 1, mom texts hourly", reply: ["Andrea", "tell her youre at my condo", "tell her you're at my condo"] },
      { you: "she knows your condo, we are so caught", gloss: "she knows your place", reply: ["Marco", "we are so caught lol"] },
      { you: "plan b, we tell her its a study group at katip", gloss: "say it's a study group", reply: ["Marco", "on a friday? sure"] },
      { you: "ok fine, curfew is curfew, we leave at twelve thirty", gloss: "we leave at 12:30", reply: ["Andrea", "responsible era"] },
    ],
  },
  {
    opener: [
      ["Paolo", "guys i forgot my wallet at the org room", "I forgot my wallet at the org room"],
      ["Kyle", "again?? third time this month"],
    ],
    turns: [
      { you: "can someone make bayad my lunch, ill pay back", gloss: "someone pay for my lunch, I'll pay back", reply: ["Paolo", "you said that in june"] },
      { you: "gcash is so not working in the caf today", gloss: "GCash is down at the cafeteria", reply: ["Kyle", "convenient"] },
      { you: "im so hungry, this is literally survival", gloss: "I'm starving", reply: ["Paolo", "fine, one siomai rice", "fine, one dumpling rice meal"] },
      { you: "make add iced tea, im so thirsty also", gloss: "add an iced tea too", reply: ["Kyle", "you are so kapal", "you have so much nerve"] },
      { you: "ill make libre next week, dude promise", gloss: "I'll treat next week, promise", reply: ["Paolo", "screenshotting this"] },
      { you: "i found my wallet, it was in my bag the whole time", gloss: "it was in my bag", reply: ["Kyle", "OF COURSE IT WAS"] },
      { you: "dont be asar, ill make libre now, siomai for all", gloss: "I'll treat now", reply: ["Paolo", "we forgive you, barely"] },
    ],
  },
  {
    opener: [
      ["Bianca", "siargao sembreak, who is in", "Siargao for semester break, who's in"],
      ["Sab", "flights are so mahal now", "flights are so expensive now"],
    ],
    turns: [
      { you: "book now, my tita said it gets worse", gloss: "book now, it gets pricier", reply: ["Bianca", "tita knows", "auntie knows"] },
      { you: "i cant surf, i will just make tambay at the beach", gloss: "I'll just hang out at the beach", reply: ["Sab", "same, aesthetic only"] },
      { you: "make sure the villa has wifi, i have a paper", gloss: "the villa needs wifi, I have a paper due", reply: ["Bianca", "in siargao?? youre insane"] },
      { you: "someone book the grab from the airport", gloss: "book the ride from the airport", reply: ["Sab", "no grab there, tricycle"] },
      { you: "tricycle?? ok this is going to be so raw", gloss: "this trip is going to be rough", reply: ["Bianca", "character development"] },
      { you: "booked, six of us, one villa, pray for the wifi", gloss: "booked for six", reply: ["Sab", "no wifi, no paper, freedom"] },
      { you: "my mom said make text every night or she flies there", gloss: "mom wants nightly texts", reply: ["Bianca", "tita on standby", "auntie on standby"] },
    ],
  },
  {
    opener: [
      ["Migs", "naia is a mess rn", "the airport is a mess right now"],
      ["Tin", "flight delayed three hours, so hassle", "flight delayed three hours, so annoying"],
    ],
    turns: [
      { you: "make eat at the lounge, my dad has a card", gloss: "eat at the lounge on my dad's card", reply: ["Migs", "the card saves us again", "dad's credit card saves us again"] },
      { you: "the wifi is so slow i cant even load ig", gloss: "wifi too slow for Instagram", reply: ["Tin", "airport wifi is a myth"] },
      { you: "im so sleepy, wake me if they make boarding", gloss: "wake me up for boarding", reply: ["Migs", "no promises"] },
      { you: "japan better be worth this, legit", gloss: "Japan had better be worth it", reply: ["Tin", "the matcha alone is worth it", "the matcha alone is worth the trip"] },
      { you: "buy me the kitkat matcha or dont come back", gloss: "get me matcha KitKats", reply: ["Migs", "noted, tita", "noted, auntie"] },
      { you: "boarding finally, my legs are so tired from waiting", gloss: "finally boarding", reply: ["Tin", "sleep on the plane"] },
      { you: "i cant sleep in economy, the seat is so sakit", gloss: "economy seats hurt", reply: ["Migs", "the card cant fix everything", "dad's card can't fix everything"] },
    ],
  },
  {
    opener: [
      ["Cheska", "so is it a situationship or"],
      ["Andrea", "define the relationship na, girl", "define the relationship already, girl"],
    ],
    turns: [
      { you: "he said hes not ready, so what am i", gloss: "he's not ready, so what am I?", reply: ["Cheska", "a placeholder, sorry"] },
      { you: "dont say that, i was so kilig last week", gloss: "I was so giddy last week", reply: ["Andrea", "kilig is not commitment", "butterflies are not commitment"] },
      { you: "he still makes reply within a minute though", gloss: "he still replies instantly", reply: ["Cheska", "thats the bare minimum"] },
      { you: "ok fine, ill make usap him tonight", gloss: "I'll talk to him tonight", reply: ["Andrea", "screenshots after pls"] },
      { you: "if he ghosts me im so done, like literally", gloss: "if he ghosts me I'm done", reply: ["Cheska", "we will make block him", "we'll block him"] },
      { you: "update, he said lets be exclusive, im shaking", gloss: "he said exclusive", reply: ["Cheska", "WAIT I NEED A SECOND"] },
      { you: "dont make chika yet, i want to enjoy it first", gloss: "don't gossip yet", reply: ["Andrea", "too late, telling bea", "too late, I'm telling Bea"] },
    ],
  },
  {
    opener: [
      ["Kyle", "my ex is at the party"],
      ["Marco", "WHERE. dont look"],
    ],
    turns: [
      { you: "he brought someone, she is so pretty, im so asar", gloss: "he brought a pretty date, I'm annoyed", reply: ["Kyle", "youre prettier, obviously"] },
      { you: "make block the door, im going to the bathroom", gloss: "cover me, going to the bathroom", reply: ["Marco", "im standing guard"] },
      { you: "should i say hi or make deadma", gloss: "say hi or ignore him?", reply: ["Kyle", "deadma. always deadma", "ignore him. always ignore"] },
      { you: "wait he is walking here, act natural", gloss: "he's coming, act natural", reply: ["Marco", "laughing loudly now"] },
      { you: "ok that was so awkward, lets make uwi", gloss: "so awkward, let's go home", reply: ["Kyle", "car is outside, go"] },
      { you: "he texted, he said i looked happy, so plastic", gloss: "he texted that I looked happy", reply: ["Kyle", "dont reply"] },
      { you: "i made reply thanks, one word, so cold, so proud", gloss: "one-word reply", reply: ["Marco", "ice queen unlocked", "ice queen mode unlocked"] },
    ],
  },
  {
    opener: [
      ["Bea", "hard launch on ig today", "posting my partner on Instagram today"],
      ["Sab", "FINALLY. show us"],
    ],
    turns: [
      { you: "posting the beach pic with him, no caption", gloss: "beach photo, no caption", reply: ["Bea", "no caption is a caption"] },
      { you: "my tita will comment in five minutes, watch", gloss: "my aunt will comment instantly", reply: ["Sab", "tita has notifications on", "auntie has notifications on"] },
      { you: "she already asked if hes catholic, so fast", gloss: "she already asked if he's Catholic", reply: ["Bea", "HAHAHA classic"] },
      { you: "his friends are so hambog in the comments", gloss: "his friends are cocky in the comments", reply: ["Sab", "boys are so plastic", "boys are so fake"] },
      { you: "whatever, im so happy, make like it na", gloss: "I'm happy, just like the post", reply: ["Bea", "liked, commented, shared"] },
      { you: "two hundred likes and my lola commented amen", gloss: "my grandma commented amen", reply: ["Bea", "lola approves", "grandma approves"] },
      { you: "his mom followed me, this is moving so fast", gloss: "his mom followed me", reply: ["Sab", "meet the parents next"] },
    ],
  },
  {
    opener: [
      ["Iñigo", "noche buena at lola's, mandatory", "Christmas Eve dinner at grandma's, mandatory"],
      ["Paolo", "the tita questions are coming", "the auntie questions are coming"],
    ],
    turns: [
      { you: "if she asks about my jowa again im leaving", gloss: "if she asks about my partner again I'm out", reply: ["Iñigo", "she will. she always does"] },
      { you: "make prepare an answer, like im focusing on school", gloss: "prepare an excuse: focusing on school", reply: ["Paolo", "she wont buy it"] },
      { you: "the lechon is worth it though, so sarap", gloss: "the roast pig is worth it", reply: ["Iñigo", "for the lechon we suffer", "for the roast pig, we suffer"] },
      { you: "my cousin is bringing his gf, so the heat is on him", gloss: "my cousin's bringing his girlfriend", reply: ["Paolo", "bless that cousin"] },
      { you: "ok see you at midnight, wear something tita approved", gloss: "wear something aunt-approved", reply: ["Iñigo", "collared shirt, noted"] },
      { you: "she asked in the first five minutes, i lost the bet", gloss: "she asked immediately", reply: ["Paolo", "pay up"] },
      { you: "the lechon was so sarap though, worth every question", gloss: "the roast pig was worth it", reply: ["I\\u00f1igo", "lechon heals all", "roast pig heals all"] },
    ],
  },
  {
    opener: [
      ["Andrea", "my driver quit"],
      ["Tin", "kuya?? after ten years??", "the driver? after ten years?"],
    ],
    turns: [
      { you: "hes going to dubai, more money daw", gloss: "he's moving to Dubai for better pay", reply: ["Andrea", "deserve, honestly", "he deserves it, honestly"] },
      { you: "now i have to make commute, i dont know the mrt", gloss: "now I have to commute", reply: ["Tin", "the mrt is not that hard", "the train is not that hard"] },
      { you: "which line goes to taft, like genuinely", gloss: "which line goes to Taft?", reply: ["Andrea", "youre so sheltered omg", "you're so sheltered"] },
      { you: "i can make grab but the surge is so mahal", gloss: "Grab surge pricing is expensive", reply: ["Tin", "welcome to our life"] },
      { you: "ok teach me, ill make libre your fare", gloss: "teach me, I'll pay your fare", reply: ["Andrea", "beep card first, bestie", "get a transit card first, bestie"] },
      { you: "i survived the mrt, so proud, only two wrong stations", gloss: "I survived, only two wrong stops", reply: ["Andrea", "two?? how"] },
      { you: "they all look the same, dont make judge me", gloss: "they look the same", reply: ["Tin", "youre so sheltered, i love it", "you're so sheltered, I love it"] },
    ],
  },
  {
    opener: [
      ["Migs", "my mom found the tattoo"],
      ["Kyle", "the tiny one?? how"],
    ],
    turns: [
      { you: "i wore a tank top at home, so dumb of me", gloss: "I wore a tank top at home", reply: ["Migs", "rookie mistake"] },
      { you: "she made sermon for two hours, my ears", gloss: "she lectured me for two hours", reply: ["Kyle", "only two? lucky"] },
      { you: "she said im so jologs now, imagine", gloss: "she called me tacky", reply: ["Migs", "its a tiny star though"] },
      { you: "she told tita, so the whole clan knows", gloss: "she told my aunt, everyone knows", reply: ["Kyle", "family gc is wild", "the family group chat is wild"] },
      { you: "next time make hide it better, lesson learned", gloss: "hide it better next time", reply: ["Migs", "no next time please"] },
      { you: "she is now asking if it can be removed, so dramatic", gloss: "she's asking about removal", reply: ["Kyle", "its a star, mom"] },
      { you: "i told her lola has one too, she went quiet", gloss: "grandma has one too", reply: ["Migs", "lola with a tattoo?? icon", "grandma with a tattoo? icon"] },
    ],
  },
  {
    opener: [
      ["Sab", "ok who is paying for the birthday dinner"],
      ["Bianca", "we said split, right"],
    ],
    turns: [
      { you: "split is fine but marco ordered wagyu", gloss: "Marco ordered wagyu", reply: ["Sab", "he always does this"] },
      { you: "im not paying for his wagyu, so kapal", gloss: "I won't pay for his wagyu", reply: ["Bianca", "make him pay the difference"] },
      { you: "my allowance is gone until friday, legit", gloss: "my allowance is out until Friday", reply: ["Sab", "same, im eating crackers"] },
      { you: "lets make gcash the birthday girl and shes done", gloss: "send the birthday girl money and be done", reply: ["Bianca", "fair, ill make send now", "fair, I'll send the money now"] },
      { you: "next time we eat at the caf, no wagyu", gloss: "next time cafeteria, no wagyu", reply: ["Sab", "caf gang", "cafeteria gang"] },
      { you: "marco just sent his share plus a sorry sticker", gloss: "Marco paid up with a sticker", reply: ["Sab", "growth"] },
      { you: "the sticker was a crying cat, so him", gloss: "crying cat sticker", reply: ["Bianca", "we love him anyway"] },
    ],
  },
  {
    opener: [
      ["Cheska", "first day of internship tomorrow"],
      ["Paolo", "corporate na si cheska, omg", "Cheska's gone corporate"],
    ],
    turns: [
      { you: "what do i wear, everything i own is so casual", gloss: "everything I own is casual", reply: ["Cheska", "blazer over anything"] },
      { you: "my dad said make shake hands firmly, so dad", gloss: "dad advice: firm handshake", reply: ["Paolo", "dads love a handshake"] },
      { you: "i have to make commute to bgc by eight", gloss: "commute to BGC by 8 AM", reply: ["Cheska", "leave at six, im serious", "leave at six a.m., I'm serious"] },
      { you: "six?? thats so early, i will make tulog standing", gloss: "I'll sleep standing up", reply: ["Paolo", "corporate life bestie", "corporate life, best friend"] },
      { you: "pray for me, this is so adult of me", gloss: "wish me luck, so grown up", reply: ["Cheska", "proud of you, go"] },
      { you: "day one done, they made me fix the printer", gloss: "day one: printer duty", reply: ["Cheska", "intern life"] },
      { you: "my boss called me kid, im twenty one, so rude", gloss: "my boss called me kid", reply: ["Paolo", "kid energy though"] },
    ],
  },
  {
    opener: [
      ["Marco", "did you see his linkedin post"],
      ["Bea", "the one about his internship journey??"],
    ],
    turns: [
      { you: "humbled and honored to announce, so cringe", gloss: "the classic LinkedIn cringe", reply: ["Marco", "he tagged the ceo"] },
      { you: "he made tag everyone, even the guard", gloss: "he tagged everyone", reply: ["Bea", "the guard deserves it tbh", "the security guard deserves it, to be honest"] },
      { you: "im so not posting mine, its just an internship", gloss: "I'm not posting mine", reply: ["Marco", "post it, its for tita", "post it, it's for auntie"] },
      { you: "tita will share it to the family gc, no thanks", gloss: "my aunt will share it to family", reply: ["Bea", "thats the point lol"] },
      { you: "ok fine one post, no hashtags, no ceo", gloss: "one post, no hashtags", reply: ["Marco", "growth mindset"] },
      { you: "posted, tita shared it in two minutes flat", gloss: "aunt shared it instantly", reply: ["Bea", "tita has a bot", "auntie must have a bot"] },
      { you: "now my lolo wants to know what an intern is", gloss: "grandpa asked what an intern is", reply: ["Marco", "explain slowly", "explain it to grandpa slowly"] },
    ],
  },
  {
    opener: [
      ["Tin", "guys my tiktok went viral"],
      ["Iñigo", "the one in the caf?? it has 200k", "the cafeteria video? it has 200k views"],
    ],
    turns: [
      { you: "the comments are so mean, i literally cannot", gloss: "the comments are mean", reply: ["Tin", "dont read them"] },
      { you: "someone said i sound so conyo, rude", gloss: "someone said I sound conyo", reply: ["Iñigo", "you do though"] },
      { you: "my prof saw it and made comment, so awkward", gloss: "my professor commented on it", reply: ["Tin", "which prof??", "which professor?"] },
      { you: "the terror one, he said nice video, i died", gloss: "the strict prof said nice video", reply: ["Iñigo", "hes a fan now", "he's a fan now"] },
      { you: "im making private my account, this is too much", gloss: "I'm going private", reply: ["Tin", "influencer era over"] },
      { you: "someone made a stitch of me, its at 500k now", gloss: "a stitch of it hit 500k", reply: ["Tin", "youre famous, deal with it"] },
      { you: "a brand messaged me, do i make reply, so scared", gloss: "a brand reached out", reply: ["I\\u00f1igo", "REPLY. free milk tea", "reply. free milk tea"] },
    ],
  },
  {
    opener: [
      ["Paolo", "mrt broke down again"],
      ["Andrea", "stuck between stations, so init", "stuck between stations, so hot"],
    ],
    turns: [
      { you: "the aircon is so not working, im melting", gloss: "the aircon is broken", reply: ["Paolo", "sauna on rails", "the MRT is a sauna"] },
      { you: "im going to be late, tell the prof i made faint", gloss: "tell the prof I fainted", reply: ["Andrea", "he wont believe that", "he won't believe that"] },
      { you: "grab surge is triple, so not worth it", gloss: "Grab is triple price", reply: ["Paolo", "walk from taft station lol", "walk from Taft station"] },
      { you: "i am wearing heels, i cannot make walk", gloss: "I'm in heels, can't walk", reply: ["Andrea", "why heels on a monday"] },
      { you: "ok im here, so sweaty, dont look at me", gloss: "I'm here, sweaty, don't look", reply: ["Paolo", "we all look like that"] },
      { you: "the prof was late too, stuck in the same train", gloss: "the prof was on the same train", reply: ["Paolo", "HAHAHA iconic"] },
      { you: "he said class is cancelled, the heels were for nothing", gloss: "class got cancelled", reply: ["Andrea", "sayang the heels", "what a waste of the heels"] },
    ],
  },
  {
    opener: [
      ["Kyle", "pickleball saturday, who is in"],
      ["Bianca", "isnt that a tita sport", "isn't that an auntie sport"],
    ],
    turns: [
      { you: "its so fun though, my tito plays every day", gloss: "my uncle plays daily", reply: ["Kyle", "tito energy is the goal", "uncle energy is the goal"] },
      { you: "the court in bgc is so mahal, four hundred an hour", gloss: "the BGC court costs ₱400/hour", reply: ["Bianca", "split four ways is ok"] },
      { you: "bring water, last time marco made faint", gloss: "Marco fainted last time", reply: ["Kyle", "he ran for the ball once"] },
      { you: "after that brunch in salcedo, so aesthetic", gloss: "brunch in Salcedo after", reply: ["Bianca", "now im in"] },
      { you: "ok i booked, dont be late, i have the paddles", gloss: "booked, I have the paddles", reply: ["Kyle", "paddles?? so pro"] },
      { you: "marco brought a tennis racket, dude, no", gloss: "Marco brought a tennis racket", reply: ["Kyle", "so close yet so far"] },
      { you: "brunch after, i am so hungry i could make eat the paddle", gloss: "so hungry", reply: ["Bianca", "salcedo, go go", "Salcedo (Makati brunch spot), let's go"] },
    ],
  },
  {
    opener: [
      ["Bea", "brownout in the condo since noon"],
      ["Sab", "same, no wifi, no aircon, so init", "same, no wifi, no aircon, so hot"],
    ],
    turns: [
      { you: "my phone is at ten percent, this is so scary", gloss: "phone at 10%, scary", reply: ["Bea", "go to the caf, they have power", "go to the cafeteria, they have power"] },
      { you: "the caf is full, everyone had the same idea", gloss: "everyone thought of that", reply: ["Sab", "starbucks in katip?", "Starbucks in Katipunan?"] },
      { you: "starbucks is so far, but ok, need to make charge", gloss: "far, but I need to charge", reply: ["Bea", "buy one drink, stay four hours"] },
      { you: "the deadline is tonight and i cant even submit", gloss: "deadline tonight, can't submit", reply: ["Sab", "email the prof from your phone", "email the professor from your phone"] },
      { you: "typing an email on ten percent, so stressed", gloss: "emailing at 10% battery", reply: ["Bea", "you got this, run"] },
      { you: "sent at nine percent, the prof replied ok, thank god", gloss: "sent at 9%, prof said ok", reply: ["Bea", "a miracle"] },
      { you: "power is back, aircon on, im never leaving this bed", gloss: "power's back, never leaving bed", reply: ["Sab", "same, goodnight"] },
    ],
  },
];

export const scenarioFor = (seed: number): Scenario => SCENARIOS[seed % SCENARIOS.length];

export type Entry = readonly [text: string, gloss: string];

/** The index-th line the player types in a run. Deterministic per seed so the server can replay it. */
export function entryAt(seed: number, index: number): Entry {
  const { turns } = scenarioFor(seed);
  const t = turns[index % turns.length];
  return [t.you, t.gloss];
}

/** What the GC replies after the index-th line is sent, if anything. */
export function replyAfter(seed: number, index: number): Msg | undefined {
  const { turns } = scenarioFor(seed);
  return turns[index % turns.length].reply;
}
