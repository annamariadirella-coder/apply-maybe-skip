/** Neutral schema defaults only. No person's preferences, language ability or strengths. */
function deepFreeze(value){for(const item of Object.values(value))if(item&&typeof item==='object')deepFreeze(item);return Object.freeze(value);}
export const candidateProfile=deepFreeze({
 roleFit:{strong:[],potential:[],usuallySkip:[],deepCodingRequirementPatterns:[]},
 seniority:{preferred:[],potential:[],usuallySkip:[]},
 location:{preferred:[],potential:[],relocationRequiredPatterns:[],onsiteRequiredPatterns:[]},
 languages:{verified:[],unavailable:[],otherRecognizedLanguages:['english','german','italian','french','spanish','dutch','portuguese','polish','danish','swedish','norwegian','finnish','czech']},
 strengthSignals:[],
 scoring:{categoryMaximums:{roleFunction:35,seniority:15,location:20,language:10,relevantStrengths:20},thresholds:{apply:75,maybe:50}},
});
