export const objectPropsToCsvColumnMap = [
  {
    name: 'Case name',
    accessor: 'CaseName',
  },
  {
    name: 'Year',
    accessor: data => data.Date.slice(-4),
  },
  {
    name: 'State',
    accessor: 'State',
  },
  {
    name: 'Verdict',
    accessor: data =>
      data && data.Type ? data.Type.replace('Verdict-', '') : '',
  },
  {
    name: 'Amount granted',
    accessor: data => data.Amount || '$0',
  },
  {
    name: 'Plaintiff(s)',
    accessor: 'Plaintiffs',
  },
  {
    name: 'Plaintiff age',
    accessor: data => {
      if (!data.Plaintiffs) return;
      let val;

      // plaintiff name will be something like
      // "(Female, 40 Years)"
      for (let plaintiffName of data.Plaintiffs) {
        const pattern = /\([^)]*, (\d+)[^(]*\)/gim;
        const [, ageMatch = ''] = pattern.exec(plaintiffName);

        // if there's already a val (i.e. an age from earlier)
        // return 'Multiple'
        if (val && ageMatch) return 'Multiple';
        val = ageMatch;
      }

      return val;
    },
  },
  {
    name: 'Plaintiff expert(s)',
    accessor: 'PlaintiffExperts',
  },

  {
    name: 'Defendant(s)',
    accessor: 'Defendants',
  },
  {
    name: 'Defendant expert(s)',
    accessor: 'DefendantExperts',
  },
  {
    name: 'Trial judge name',
    accessor: 'Judge',
  },
  {
    name: 'Demand $',
    accessor: 'Demand',
  },
  {
    name: 'Offer $',
    accessor: 'Offer',
  },
  {
    name: 'Trial length',
    accessor: 'TrialLength',
  },
  {
    name: 'Trial deliberations',
    accessor: 'Deliberations',
  },
  {
    name: 'Jury vote',
    accessor: 'JuryVote',
  },
  {
    name: 'Jury composition',
    accessor: 'JuryComposition',
  },
];

export const xmlColumnValuesToObjectPropsMap = {
  'Amount:': 'Amount',
  'Case Name:': 'CaseName',
  'Jury Composition:': 'JuryComposition',
  'Court:': 'Court',
  'Date:': 'Date',
  'Defendant:': 'DefendantBeforeExperts',
  'Defendant Expert(s):': 'DefendantExperts',
  'Defendant(s):': 'Defendants',
  'Trial Deliberations:': 'Deliberations',
  'Trail Deliberations:': 'Deliberations', // some of these seriously have this typo in them
  'Demand:': 'Demand',
  'Judge:': 'Judge',
  'Jury Vote:': 'JuryVote',
  'Offer:': 'Offer',
  'Plaintiff:': 'PlaintiffBeforeExperts',
  'Plaintiff Expert(s):': 'PlaintiffExperts',
  'Plaintiff(s):': 'Plaintiffs',
  'State:': 'State',
  'Trial Length:': 'TrialLength',
  'Type:': 'Type',
  'Venue:': 'Venue',
};

export const TARGET_XML_PATH = 'word/document.xml';
