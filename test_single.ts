import { getRantingClass } from './src/utils/ranting';

const testKMs = [
    '61+420 B/OS',
    '74+800 B/OS',
    '55+630 A/OS'
];

testKMs.forEach(km => {
    console.log(km, '->', getRantingClass(km));
});
