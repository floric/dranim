export enum NewsType {
  FEATURE = 'FEATURE',
  IMPROVEMENT = 'IMPROVEMENT',
  NOTIFICATION = 'NOTIFICATION'
}

export const news = [
  {
    type: NewsType.NOTIFICATION,
    date: new Date(2018, 8, 30),
    title: 'Next Milestone',
    description:
      'Add more neded nodes and improve calculation speed and progress reporting.'
  },
  {
    type: NewsType.IMPROVEMENT,
    date: new Date(2018, 8, 13),
    title: 'Improved Details based on User feedback',
    description:
      'A lot of small improvements have been done to improve the user experience and reduce errors.'
  },
  {
    type: NewsType.FEATURE,
    date: new Date(2018, 8, 5),
    title: 'Added more time related nodes',
    description: 'Comparisons of times and dates are now supported.'
  },
  {
    type: NewsType.FEATURE,
    date: new Date(2018, 7, 31),
    title: 'Added support for CSV download of Entries',
    description:
      'Entries of Datasets can now be downloaded as CSV streams to process them in Excel or other applications with support for CSV files.'
  },
  {
    type: NewsType.IMPROVEMENT,
    date: new Date(2018, 7, 28),
    title: 'Improved Dashboard and Visualization types',
    description:
      'The linear visualization types are now rendered with Vega. Additionally, this allows PNG exports. More visualization related fixes and improvements were done.'
  },
  {
    type: NewsType.FEATURE,
    date: new Date(2018, 7, 8),
    title: 'Added node for numeric comparisons',
    description:
      'Dranim now supports numeric comparisons (equals, less then, greater then) with a new node.'
  },
  {
    type: NewsType.FEATURE,
    date: new Date(2018, 7, 7),
    title: 'Added STR Visualization',
    description:
      'A new visualization type for STR graphics was added. This visualization also supports interactive controls for graphi related parameters.'
  },
  {
    type: NewsType.IMPROVEMENT,
    date: new Date(2018, 7, 7),
    title: 'Calculation process and cancellation improved',
    description:
      'The calculation process has been improved. Cancellations are handled better and some performance improvements were added.'
  },
  {
    type: NewsType.FEATURE,
    date: new Date(2018, 6, 30),
    title: 'Added News to Start',
    description:
      'This start page now contains this news column as well as more information about the available examples.'
  },
  {
    type: NewsType.IMPROVEMENT,
    date: new Date(2018, 6, 30),
    title: 'UX improved',
    description:
      'The UX of calculations has been improved. A loading screen will be shown and calculations can be canceled. Additionally, more help texts have been added and the users page has been removed in favor of showing the user always on the top right corner.'
  },
  {
    type: NewsType.IMPROVEMENT,
    date: new Date(2018, 6, 29),
    title: 'Performance improvements',
    description: 'The calculation performance has been improved.'
  },
  {
    type: NewsType.FEATURE,
    date: new Date(2018, 6, 28),
    title: 'Support for multiple distinct values',
    description:
      'The Distinct node now supports multiple fields for aggregation. This was needed for efficient data analysis of passages with the STR data.'
  }
];
