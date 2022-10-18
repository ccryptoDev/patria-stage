

const DUAL_SCORE_CLARITY = [
  { operator: null, minValue: 0, maxValue: 0 },
  { operator: '-', minValue: 300, maxValue: 349 },
  { operator: '-', minValue: 350, maxValue: 399 },
  { operator: '-', minValue: 400, maxValue: 449 },
  { operator: '-', minValue: 450, maxValue: 499 },
  { operator: '-', minValue: 500, maxValue: 549 },
  { operator: '-', minValue: 550, maxValue: 599 },
  { operator: '-', minValue: 600, maxValue: 649 },
  { operator: '>', minValue: 650, },
]

const DUAL_SCORE_FT = [
  { operator: 'null', minValue: null, maxValue: 0 },
  { operator: '<', minValue: 625, },
  { operator: '-', minValue: 625, maxValue: 649 },
  { operator: '-', minValue: 650, maxValue: 679 },
  { operator: '-', minValue: 680, maxValue: 699 },
  { operator: '-', minValue: 700, maxValue: 749 },
  { operator: '-', minValue: 750, maxValue: 799 },
  { operator: '-', minValue: 800, maxValue: 849 },
]

const DUAL_SCORE_VALUES = [
  [599, null, null, null, 599, 499, 399, 399],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, 699, 699, 599],
  [null, null, null, null, null, 599, 599, 599],
  [599, null, 699, 599, 599, 499, 499, 499],
  [499, null, 599, 499, 499, 399, 399, 399],
  [399, null, 599, 499, 499, 399, 399, 399],
  [399, null, 599, 499, 499, 399, 399, 399],
]

const blockedStates =  ['AR','CT','DC','GA','MD','NJ','NY','NC', 'PA', 'RI', 'SC', 'VT', 'VA', 'WV'];

module.exports = {
  DUAL_SCORE_CLARITY,
  DUAL_SCORE_FT,
  DUAL_SCORE_VALUES,
  blockedStates
}
