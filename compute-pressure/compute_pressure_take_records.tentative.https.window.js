'use strict';

test(() => {
    const observer = new ComputePressureObserver(function () {
      assert_unreached('This callback should not have been called.')
    }, {cpuUtilizationThresholds: [0.25],
        cpuSpeedThresholds: [0.75]});
    const records = observer.takeRecords();
    assert_equals(records.length, 0, 'No record before observe');
}, 'There must be no record before observe() is called');

promise_test(async t => {
  let observer;
  const update = await new Promise((resolve, reject) => {
    observer = new ComputePressureObserver(resolve, {cpuUtilizationThresholds: [0.25],
                                                     cpuSpeedThresholds: [0.75]});
    t.add_cleanup(() => observer.disconnect());
    observer.observe("cpu").catch(reject);
  });

  assert_in_array(update.cpuUtilization, [0.125, 0.625],
                  'cpuUtilization quantization');
  assert_in_array(update.cpuSpeed, [0.375, 0.875], 'cpuSpeed quantization');
  let records = observer.takeRecords();

  assert_equals(records.length, 1)
  assert_equals(update.cpuUtilization, records[0].cpuUtilization);
  assert_equals(update.cpuSpeed, records[0].cpuSpeed);

  records = observer.takeRecords();
  assert_equals(records.length, 0, 'No record available');
}, 'takeRecords should return only one record, matching the update from callback');
