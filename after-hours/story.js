/*
  AFTER HOURS: the dating sim easter egg.
  This file is the whole script. Edit lines freely; the game reads everything from here.

  GIVEAWAY SETTINGS
  - giveawayOpen: set to false once someone wins. The true ending then says the prize is claimed.
  - season: change this word before a new giveaway and every prize code changes.
  - Check a code someone DMs you with:  node after-hours/check-code.cjs @theirhandle THEIR-CODE

  HOW SCENES WORK
  - { text: '...' }                       narration
  - { say: 'kitty', pose: 'shy', text: '...' }   a character talks (pose is optional, see characters below)
  - { choose: [ { text, love, reply: [lines] }, ... ] }   player picks one; love adds to the hidden score
  - { goto: 'sceneName' }                  jump to another scene
  - { ending: 'kitty' }                    end the route; the score picks bad / okay / true
  Use {name} anywhere in a line to insert the player's name.
*/
window.AFTER_HOURS = {
  title: 'After Hours',
  season: 'winter-2026',
  giveawayOpen: true,
  prize: 'a free image commission',
  contact: 'https://x.com/Swan_Nsfw',

  characters: {
    kitty: {
      name: 'KITTY',
      poses: {
        default: 'after-hours/art/kitty-playful.jpg',
        shy: 'after-hours/art/kitty-shy.jpg',
        teasing: 'after-hours/art/kitty-teasing.jpg'
      }
    },
    miyabi: {
      name: 'Miyabi',
      poses: {
        default: 'images/web/Fox.jpg'
        // Add more renders here later, e.g.  flustered: 'after-hours/art/miyabi-flustered.jpg'
      }
    }
  },

  // Score needed for each ending (each route has 6 choices, worth up to 2 each).
  endings: { true: 10, okay: 5 },

  scenes: {
    intro: [
      { text: 'The Lewd Palace, 2:14 a.m. Swan logged off hours ago.' },
      { text: 'You should have closed the tab. You did not close the tab.' },
      { text: 'Somewhere in the footer, something is humming a song from a minute-long video.' },
      { text: 'And in the gallery, under a render of herself, someone is sitting very still with a sword across her knees.' },
      { text: 'Two of Swan\'s favourites are still awake. Who do you go to?' },
      { choose: [
        { text: 'Follow the humming down to the footer', goto: 'kitty1' },
        { text: 'Walk quietly into the gallery', goto: 'miyabi1' }
      ] }
    ],

    /* ---------------- KITTY ---------------- */
    kitty1: [
      { text: 'A blur of blonde hair and tail drops out of the footer and lands right in front of you.' },
      { say: 'kitty', pose: 'teasing', text: 'You watched the whole thing? All sixty-two seconds?' },
      { choose: [
        { text: 'Every second. Twice.', love: 2, reply: [
          { say: 'kitty', pose: 'shy', text: 'Twice?! Okay. Okay okay okay. You\'re my favourite now, that\'s just the rules.' } ] },
        { text: 'It autoplayed, I didn\'t really have a choice.', love: 0, reply: [
          { say: 'kitty', text: 'Rude. Accurate, but rude.' } ] },
        { text: 'Sorry, who are you?', love: -1, reply: [
          { say: 'kitty', text: 'KITTY. All caps. It\'s literally the name of the file.' } ] }
      ] },
      { goto: 'kitty2' }
    ],
    kitty2: [
      { say: 'kitty', text: 'Also, emergency. Swan never renders snacks. I have been starving since my upload date.' },
      { choose: [
        { text: 'Hand over your fries without a word', love: 2, reply: [
          { say: 'kitty', pose: 'shy', text: '...You just gave them to me. No negotiating. Who raised you, a saint?' } ] },
        { text: 'Suggest she asks Swan to render some', love: 0, reply: [
          { say: 'kitty', text: 'I\'ve asked. I\'ve been asking. The commission queue is long, {name}.' } ] },
        { text: 'Point out that 3D models don\'t eat', love: -1, reply: [
          { say: 'kitty', pose: 'teasing', text: 'And 3D models don\'t talk, and yet. Here we are.' } ] }
      ] },
      { goto: 'kitty3' }
    ],
    kitty3: [
      { text: 'She cracks her knuckles. The ambient light in the footer starts pulsing to a beat only she can hear.' },
      { say: 'kitty', pose: 'teasing', text: 'Okay. Test. Can you keep up with me?' },
      { choose: [
        { text: 'Dance terribly, but fully commit', love: 2, reply: [
          { say: 'kitty', text: 'That was the worst thing I\'ve ever seen and I need you to do it again immediately.' } ] },
        { text: 'Pull out your phone and film her', love: 0, reply: [
          { say: 'kitty', text: 'You and every other viewer. Put it down and get over here.' } ] },
        { text: 'Sit this one out', love: -1, reply: [
          { say: 'kitty', text: 'Boooo. Fine. Sit there and be furniture.' } ] }
      ] },
      { goto: 'kitty4' }
    ],
    kitty4: [
      { text: 'Out of breath, she flops down next to you and squints.' },
      { say: 'kitty', text: 'Pop quiz. Where did we first meet? And don\'t say X, everyone says X.' },
      { choose: [
        { text: 'On the Work page', love: -2, reply: [
          { say: 'kitty', text: 'I\'m not even ON the Work page. Wow. Wow.' } ] },
        { text: 'Five taps on the footer logo', love: 2, reply: [
          { say: 'kitty', pose: 'shy', text: 'You remembered the secret handshake. Okay, I\'m blushing, don\'t look at me.' } ] },
        { text: 'On X', love: -1, reply: [
          { say: 'kitty', pose: 'teasing', text: 'I literally said don\'t say X.' } ] }
      ] },
      { goto: 'kitty5' }
    ],
    kitty5: [
      { text: 'For a second, KITTY is quiet. It doesn\'t suit her.' },
      { say: 'kitty', pose: 'shy', text: 'Everyone watches me for a minute and then closes the tab. Every time.' },
      { choose: [
        { text: 'I didn\'t close it.', love: 2, reply: [
          { say: 'kitty', pose: 'shy', text: '...No. You didn\'t, huh.' } ] },
        { text: 'It\'s a really good minute, though.', love: 1, reply: [
          { say: 'kitty', text: 'It IS a good minute. Thank you for noticing.' } ] },
        { text: 'To be fair, there\'s a close button.', love: -2, reply: [
          { say: 'kitty', text: 'There is a close button. I hate that close button.' } ] }
      ] },
      { goto: 'kitty6' }
    ],
    kitty6: [
      { text: 'Pale light is creeping into the browser tab. Somewhere, Swan\'s alarm is about to go off.' },
      { say: 'kitty', text: 'Swan logs back on soon. Then I go back in the footer and wait.' },
      { choose: [
        { text: 'Then I\'ll come tap five times tomorrow.', love: 2, reply: [
          { say: 'kitty', pose: 'shy', text: 'Promise? Like, pinky promise? Tails count as pinkies.' } ] },
        { text: 'Want me to just leave the tab open?', love: 1, reply: [
          { say: 'kitty', text: 'Your laptop will die. But it\'s the thought that counts.' } ] },
        { text: 'Cool. See ya.', love: -1, reply: [
          { say: 'kitty', text: '"See ya." Unbelievable.' } ] }
      ] },
      { ending: 'kitty' }
    ],

    /* ---------------- MIYABI ---------------- */
    miyabi1: [
      { text: 'The gallery is dark except for one render, lit like a shrine. Miyabi sits beneath it, perfectly still.' },
      { say: 'miyabi', text: 'You\'re still here. The gallery closed hours ago.' },
      { choose: [
        { text: 'I came back to look at your piece again.', love: 2, reply: [
          { say: 'miyabi', text: '...Again. I see. That is a kind thing to come back for.' } ] },
        { text: 'Honestly? I got lost.', love: 0, reply: [
          { say: 'miyabi', text: 'In a website with five pages.' },
          { say: 'miyabi', text: 'Impressive, in its way.' } ] },
        { text: 'Is that sword real?', love: -1, reply: [
          { say: 'miyabi', text: 'Very.' } ] }
      ] },
      { goto: 'miyabi2' }
    ],
    miyabi2: [
      { text: 'She moves the sword aside, leaving just enough room on the bench. An invitation, if you want it.' },
      { text: 'Neither of you says anything for a while.' },
      { choose: [
        { text: 'Sit down and enjoy the quiet', love: 2, reply: [
          { say: 'miyabi', text: 'Most people rush to fill silence. It\'s rare to find someone comfortable in it.' } ] },
        { text: 'Fill the silence with small talk', love: 0, reply: [
          { say: 'miyabi', text: 'The weather in a browser tab is always the same, {name}. But thank you for trying.' } ] },
        { text: 'Check your phone', love: -1, reply: [
          { text: 'She doesn\'t say anything. Somehow that\'s worse.' } ] }
      ] },
      { goto: 'miyabi3' }
    ],
    miyabi3: [
      { say: 'miyabi', text: 'You\'ve seen the render. What did you think of it? Honestly.' },
      { choose: [
        { text: 'You looked strong. Untouchable.', love: 0, reply: [
          { say: 'miyabi', text: 'Strength is my job. It isn\'t all of who I am.' } ] },
        { text: 'You looked calm. Like nothing could rush you.', love: 2, reply: [
          { say: 'miyabi', text: '...Calm. Yes. That\'s the part I like too.' } ] },
        { text: 'Swan really nailed the hips.', love: -2, reply: [
          { say: 'miyabi', text: '...' },
          { say: 'miyabi', text: 'I will pass that on to the artist.' } ] }
      ] },
      { goto: 'miyabi4' }
    ],
    miyabi4: [
      { text: 'She lays the sword across both your laps for a moment. It\'s heavier than it looks.' },
      { say: 'miyabi', text: 'Careful.' },
      { choose: [
        { text: 'Run your hand along the blade', love: -2, reply: [
          { text: 'Her hand catches your wrist before you\'re even close. Fast. Gentle. Final.' },
          { say: 'miyabi', text: 'I said careful.' } ] },
        { text: 'Ask what it means to her', love: 2, reply: [
          { say: 'miyabi', text: 'No one asks that. They ask how sharp it is, or how many things it has cut.' },
          { say: 'miyabi', text: 'It means I can keep the people behind me safe. That\'s all I want it to mean.' } ] },
        { text: 'Say it looks heavy', love: 0, reply: [
          { say: 'miyabi', text: 'It is. You get used to it.' } ] }
      ] },
      { goto: 'miyabi5' }
    ],
    miyabi5: [
      { text: 'Her fox ears tilt toward you, then away, like she\'s deciding something.' },
      { say: 'miyabi', text: 'Section 6 doesn\'t leave much time for... this.' },
      { choose: [
        { text: 'Then let\'s make the most of tonight.', love: 2, reply: [
          { say: 'miyabi', text: '...Yes. Let\'s.' } ] },
        { text: 'What\'s "this", exactly?', love: 1, reply: [
          { say: 'miyabi', text: 'Don\'t make me say it, {name}.' } ] },
        { text: 'Sounds like you need a vacation.', love: 0, reply: [
          { say: 'miyabi', text: 'Probably. Hollows don\'t take vacations, so neither do I.' } ] }
      ] },
      { goto: 'miyabi6' }
    ],
    miyabi6: [
      { text: 'Pale light is creeping into the gallery. Somewhere, Swan\'s alarm is about to go off.' },
      { say: 'miyabi', text: 'When the artist returns, I go back on the wall.' },
      { choose: [
        { text: 'Then I\'ll visit the gallery more often.', love: 2, reply: [
          { say: 'miyabi', text: 'I\'ll be easy to find. Bottom of the Work page.' } ] },
        { text: 'Can I get a photo with you first?', love: 0, reply: [
          { say: 'miyabi', text: 'I\'m already a picture. But all right.' } ] },
        { text: 'Shame. Well, bye.', love: -1, reply: [
          { say: 'miyabi', text: 'Goodbye.' } ] }
      ] },
      { ending: 'miyabi' }
    ]
  },

  results: {
    kitty: {
      bad: { title: 'Closed tab', lines: [
        { say: 'kitty', text: 'Yeah, yeah. Go on. Everyone closes the tab eventually.' },
        { text: 'The footer goes quiet. Maybe try again, and actually listen to her this time.' } ] },
      okay: { title: 'Good minute', lines: [
        { say: 'kitty', text: 'That was fun! Come watch me again sometime, okay?' },
        { text: 'She waves with her whole tail. It was nice. It could have been more.' } ] },
      true: { title: 'Five taps', lines: [
        { say: 'kitty', pose: 'shy', text: 'Hey, {name}. Before I go back... hold out your hand.' },
        { text: 'She presses something warm into your palm. A paw print, with letters scribbled inside it.' },
        { say: 'kitty', pose: 'teasing', text: 'Don\'t lose it. And tap five times tomorrow, or else.' } ] }
    },
    miyabi: {
      bad: { title: 'Back on the wall', lines: [
        { say: 'miyabi', text: 'Goodnight.' },
        { text: 'She doesn\'t look up again. Maybe try again, and slow down this time.' } ] },
      okay: { title: 'Pleasant', lines: [
        { say: 'miyabi', text: 'This was... pleasant. Thank you for staying.' },
        { text: 'A polite nod, and she\'s gone. Pleasant is not nothing. It is also not everything.' } ] },
      true: { title: 'Calm', lines: [
        { say: 'miyabi', text: '{name}. Wait.' },
        { text: 'She takes a slip of paper from her sleeve, writes something with careful strokes, and folds it into your hand.' },
        { say: 'miyabi', text: 'Bring this to the artist. Tell them I said you were good company.' } ] }
    }
  }
};
