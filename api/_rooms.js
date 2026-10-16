// The department's rooms, and the starting data taken from the DDH deck of
// 14 October 2026. This is only used to seed an empty database the first time
// the Stocks page is opened. After that the database is the record, and
// editing this file changes nothing.
//
// To add a room later: add it here AND insert a row for it in the database,
// or clear the room_stock table so it seeds again from this file.

// Every room carries the same seven registers, in this order.
const REGISTERS = [
  ['stock',        'Stock register'],
  ['consumables',  'Consumables register'],
  ['maintenance',  'Maintenance / service register'],
  ['movement',     'Stock movement / transfer register'],
  ['verification', 'Annual stock verification report'],
  ['logbook',      'Logbook'],
  ['complaints',   'Student complaints / requests register'],
];

const reg = (status, remarks) => ({ status: status || '', updated: '', remarks: remarks || '' });

const item = name => ({ name, register: null, present: null, working: null, damaged: null });

const LAB_ITEMS = [
  'Chairs', 'Computer tables', 'Teacher desk', 'Almirah / cupboard',
  'Projector', 'Air conditioner', 'Ceiling fan', 'Tube light',
  'UPS', 'White board',
].map(item);

const STAFF_ITEMS = [
  'Chairs', 'Staff tables', 'Almirah / cupboard', 'Air conditioner',
  'Ceiling fan', 'Tube light', 'Printer', 'Water dispenser',
].map(item);

// The four AFTF labs were set up identically in 2025.
const aftfLab = name => ({
  meta: {
    name,
    type: 'Class room cum lab',
    incharge: '',
    capacity: '',
    established: '2025',
  },
  registers: {
    stock:        reg('yes'),
    consumables:  reg('na'),
    maintenance:  reg('yes'),
    movement:     reg('no'),
    verification: reg('no', 'Established in 2025, first verification not yet due'),
    logbook:      reg('yes'),
    complaints:   reg('yes', 'Included in the log book'),
  },
  systems: [
    { label: 'Desktop systems', count: 60,
      spec: 'Lenovo Core i5 8th Gen / DDR4 16 GB / 480 GB SSD / 18.5" LG monitor' },
  ],
  items: LAB_ITEMS.map(i => ({ ...i })),
  verification: { date: '', by: '' },
});

const SEED = {
  'AFTF-01A': aftfLab('Application Development Lab'),
  'AFTF-01B': aftfLab('Programming and AI Foundations Lab'),
  'AFTF-02A': aftfLab('Programming and Data Engineering Lab'),
  'AFTF-02B': aftfLab('AI Engineering and Full Stack Development Lab'),

  'AFTF-04': {
    meta: { name: 'Staff Room', type: 'Staff room', incharge: '', capacity: '', established: '' },
    registers: {
      stock: reg(''), consumables: reg(''), maintenance: reg(''), movement: reg(''),
      verification: reg(''), logbook: reg(''), complaints: reg('na', 'Not applicable to a staff room'),
    },
    systems: [],
    items: STAFF_ITEMS.map(i => ({ ...i })),
    verification: { date: '', by: '' },
  },

  'ATF-06': {
    meta: {
      name: 'Intelligent Applications Lab',
      type: 'Class room cum lab',
      incharge: '', capacity: '', established: '',
    },
    registers: {
      stock:        reg('yes'),
      consumables:  reg('na'),
      maintenance:  reg('yes'),
      movement:     reg('na', 'Noted as not applicable'),
      verification: reg('yes'),
      logbook:      reg('yes'),
      complaints:   reg('no'),
    },
    systems: [
      { label: 'Desktop systems', count: 75,
        spec: 'Lenovo Core i5 6th Gen / DDR4 8 GB / 240 GB SSD / 18.5" LG monitor' },
      { label: 'GPU workstations', count: 2,
        spec: 'Lenovo Core i7 14th Gen / GDDR6 128 GB / 1 TB SSD / 8 GB graphics card / 21.5" DELL monitor' },
    ],
    items: LAB_ITEMS.map(i => ({ ...i })),
    verification: { date: '', by: '' },
  },
};

// The order the room buttons appear in.
const ORDER = ['AFTF-01A', 'AFTF-01B', 'AFTF-02A', 'AFTF-02B', 'AFTF-04', 'ATF-06'];

module.exports = { REGISTERS, SEED, ORDER };
