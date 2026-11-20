export interface ReportSubOption {
  id: string;
  label: string;
}

export interface ReportCategory {
  id: string;
  label: string;
  question?: string;
  subOptions?: ReportSubOption[];
}

export const POST_REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: "under_18",
    label: "Problem involving someone under 18",
    question: "What is the problem involving someone under 18?",
    subOptions: [
      { id: "child_exploitation", label: "Child sexual exploitation or abuse" },
      { id: "physical_abuse", label: "Physical or emotional abuse" },
      { id: "underage_drugs", label: "Underage alcohol, tobacco, or drug use" },
      { id: "minor_bullying", label: "Bullying or harassment of a minor" },
      { id: "other_minor", label: "Something else" },
    ],
  },
  {
    id: "bullying_harassment",
    label: "Bullying, harassment or abuse",
    question: "Who is being bullied or harassed?",
    subOptions: [
      { id: "me", label: "Me" },
      { id: "friend", label: "A friend or family member" },
      { id: "someone_else", label: "Someone else" },
      { id: "unwanted_contact", label: "Harassment or unwanted contact" },
      { id: "threats", label: "Threat of violence" },
    ],
  },
  {
    id: "suicide_self_harm",
    label: "Suicide or self-harm",
    question: "What kind of self-harm or suicide content?",
    subOptions: [
      { id: "suicide_intent", label: "Suicide threat or intent" },
      { id: "self_injury", label: "Self-injury or cutting" },
      { id: "eating_disorders", label: "Eating disorders or extreme fasting" },
      { id: "encouraging_harm", label: "Encouraging or instructing self-harm" },
    ],
  },
  {
    id: "violent_hateful",
    label: "Violent, hateful or disturbing content",
    question: "What kind of violent or hateful content?",
    subOptions: [
      { id: "hate_speech", label: "Hate speech or discrimination" },
      { id: "graphic_violence", label: "Graphic violence or injury" },
      { id: "violent_threat", label: "Threat of physical violence" },
      { id: "animal_cruelty", label: "Cruelty to animals" },
      { id: "dangerous_orgs", label: "Dangerous organizations or terrorism" },
    ],
  },
  {
    id: "restricted_items",
    label: "Selling or promoting restricted items",
    question: "What is being sold or promoted?",
    subOptions: [
      { id: "drugs", label: "Drugs" },
      { id: "weapons", label: "Weapons" },
      { id: "alcohol", label: "Alcohol" },
      { id: "tobacco", label: "Tobacco" },
      { id: "gambling", label: "Gambling" },
      { id: "animals", label: "Animals" },
      { id: "other_restricted", label: "Other restricted products" },
    ],
  },
  {
    id: "adult_content",
    label: "Adult content",
    question: "What type of adult content?",
    subOptions: [
      { id: "nudity", label: "Nudity or sexual acts" },
      { id: "exploitation", label: "Sexual exploitation or solicitation" },
      { id: "non_consensual", label: "Non-consensual sexual content" },
      { id: "suggestive", label: "Sexually suggestive content" },
    ],
  },
  {
    id: "scam_fraud",
    label: "Scam, fraud or false information",
    question: "How is this fraudulent or misleading?",
    subOptions: [
      { id: "scam", label: "Scam or financial fraud" },
      { id: "fake_account", label: "Fake account or impersonation" },
      { id: "phishing", label: "Phishing or fake links" },
      { id: "false_info", label: "False information or medical misinformation" },
      { id: "spam", label: "Spam or repetitive promotional posts" },
    ],
  },
  {
    id: "intellectual_property",
    label: "Intellectual property",
    question: "What kind of intellectual property violation?",
    subOptions: [
      { id: "copyright", label: "Copyright infringement (unauthorized photo/recipe/text)" },
      { id: "trademark", label: "Trademark violation" },
      { id: "stolen_content", label: "Content stolen from another creator" },
    ],
  },
  {
    id: "dont_want_to_see",
    label: "I don't want to see this",
    question: "Why don't you want to see this?",
    subOptions: [
      { id: "not_relevant", label: "It's not relevant to food or cooking" },
      { id: "not_interested", label: "I'm not interested in this chef or recipe" },
      { id: "repetitive", label: "It's repetitive or annoying" },
      { id: "other", label: "Other reason" },
    ],
  },
];

export const USER_REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: "fake_account",
    label: "Fake account or impersonation",
    question: "Who is this account pretending to be?",
    subOptions: [
      { id: "me", label: "Pretending to be me" },
      { id: "celebrity_chef", label: "Pretending to be a chef or celebrity" },
      { id: "business", label: "Pretending to be an official culinary brand" },
      { id: "fake_persona", label: "Not a real person (bot / fake)" },
    ],
  },
  {
    id: "bullying_harassment",
    label: "Bullying, harassment or abuse",
    question: "How is this account harassing or abusing others?",
    subOptions: [
      { id: "harassing_me", label: "Harassing me directly" },
      { id: "harassing_others", label: "Harassing someone else" },
      { id: "threats", label: "Threatening violence or harm" },
    ],
  },
  {
    id: "posting_inappropriate",
    label: "Posting inappropriate things",
    question: "What kind of inappropriate content are they posting?",
    subOptions: [
      { id: "nudity_adult", label: "Nudity or sexual content" },
      { id: "hate_speech", label: "Hate speech or symbols" },
      { id: "violence", label: "Violence or graphic imagery" },
      { id: "drugs_weapons", label: "Drugs, weapons, or restricted items" },
    ],
  },
  {
    id: "under_18",
    label: "Problem involving someone under 18",
    question: "What is the concern regarding a minor?",
    subOptions: [
      { id: "underage_user", label: "This account belongs to an underage user" },
      { id: "child_safety", label: "Child safety or exploitation concern" },
    ],
  },
  {
    id: "scam_spam",
    label: "Scam, fraud or spam",
    question: "What type of fraudulent behavior?",
    subOptions: [
      { id: "financial_scam", label: "Financial scam or soliciting money" },
      { id: "phishing_links", label: "Sending malicious or phishing links" },
      { id: "spam_messages", label: "Sending spam messages or comments" },
    ],
  },
  {
    id: "other",
    label: "Something else",
    question: "Why are you reporting this profile?",
    subOptions: [
      { id: "hacked", label: "I think this account was hacked" },
      { id: "other_reason", label: "Other violation of community guidelines" },
    ],
  },
];

export const GROUP_REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: "restricted_items",
    label: "Selling or promoting restricted items",
    question: "What is being sold or promoted in this group?",
    subOptions: [
      { id: "drugs", label: "Drugs" },
      { id: "weapons", label: "Weapons" },
      { id: "alcohol", label: "Alcohol" },
      { id: "tobacco", label: "Tobacco" },
      { id: "gambling", label: "Gambling" },
      { id: "animals", label: "Animals" },
    ],
  },
  {
    id: "hate_harassment",
    label: "Hate speech or harassment",
    question: "What type of hateful or harassing content is present?",
    subOptions: [
      { id: "hate_speech", label: "Hate speech targeting protected groups" },
      { id: "harassment", label: "Organized bullying or harassment" },
      { id: "violence_incitement", label: "Incitement to violence" },
    ],
  },
  {
    id: "scam_fraud",
    label: "Scams, fraud or misleading content",
    question: "How is this group fraudulent or misleading?",
    subOptions: [
      { id: "commercial_scam", label: "Commercial scam or fake culinary products" },
      { id: "fake_identity", label: "Impersonating an authentic restaurant or chef" },
      { id: "phishing_spam", label: "Phishing links or mass spam" },
    ],
  },
  {
    id: "adult_content",
    label: "Adult content or nudity",
    question: "What type of adult content is in this group?",
    subOptions: [
      { id: "nudity", label: "Nudity or sexual acts" },
      { id: "sexual_exploitation", label: "Sexual exploitation" },
    ],
  },
  {
    id: "under_18",
    label: "Problem involving someone under 18",
    question: "What is the concern involving someone under 18?",
    subOptions: [
      { id: "child_safety", label: "Child endangerment or exploitation" },
      { id: "underage_substances", label: "Promoting substances to minors" },
    ],
  },
  {
    id: "intellectual_property",
    label: "Intellectual property violation",
    question: "What intellectual property is being infringed?",
    subOptions: [
      { id: "trademark", label: "Unauthorized use of brand / restaurant name" },
      { id: "copyright", label: "Systematic copyright infringement" },
    ],
  },
];

